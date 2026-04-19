const Corridor = require('../models/Corridor');
const Alert = require('../models/Alert');
const PressureLog = require('../models/PressureLog');
const TransportEvent = require('../models/TransportEvent');
const axios = require('axios');

const ML_SERVICE_URL = 'https://codeplay-11ib.onrender.com';

// ────────────────────────────────────────────
// Per-corridor state
// ────────────────────────────────────────────
const state = {};

// Corridor-specific width factors (narrower = higher pressure)
const WIDTH_FACTOR = { Ambaji: 0.7, Dwarka: 0.9, Somnath: 0.85, Pavagadh: 0.6 };

// ────────────────────────────────────────────
// Phase machine timing (in ticks, 1 tick = 2 s)
// Normal → Surge → Peak → Recovery → Normal …
//
// One cycle ≈ 50 ticks = 100 s
//   Normal   : 20-25 ticks  (40-50 s)  → pressure 25-45 %
//   Rising   :  5 ticks     (10 s)     → pressure climbs to 65-85 %
//   Peak     :  8-10 ticks  (16-20 s)  → pressure stays 65-85 %
//   Recovery :  6 ticks     (12 s)     → pressure falls back
//
// CRITICAL surge (SOS candidate) injected into one corridor every ~30 cycles
//   = roughly every 60 s on one random corridor.
//   During a critical peak, pressure is pushed to 90-100 % for ≥ 5 ticks.
// ────────────────────────────────────────────
const PHASE = { NORMAL: 'normal', RISING: 'rising', PEAK: 'peak', RECOVERY: 'recovery' };

// Global counter so SOS fires on a timer across all corridors
let globalTick = 0;
let nextSosCorridor = null;   // set ~5 ticks before the critical peak

// ── ML Feature computation ──────────────────────────
const computeMLFeatures = (corridor, s, pressure) => {
  const entry = corridor.pressureSources?.entryFlow || 150 + Math.random() * 100;
  const exit = entry * (0.6 + Math.random() * 0.3);
  const width = corridor.corridorWidth || { Ambaji: 5, Dwarka: 8, Somnath: 6, Pavagadh: 3 }[corridor.name] || 5;
  const density = pressure / 100 * 10;
  const weatherMap = { Clear: 0, Heat: 1, Rain: 2 };
  const history = corridor.pressureHistory || [];
  const rolling5 = history.length >= 5
    ? history.slice(-5).reduce((a, b) => a + b, 0) / 5
    : pressure;
  const delta = history.length >= 2 ? pressure - history[history.length - 2] : 0;

  return {
    net_flow: entry - exit,
    occupancy_proxy: density * width,
    flow_to_width_ratio: entry / width,
    weather_encoded: weatherMap[corridor.weather] || 0,
    rolling_pressure_5min: rolling5,
    pressure_delta: delta,
    congestion_ratio: exit > 0 ? (entry - exit) / exit : 0,
    width_adjusted_density: density / width,
    composite_risk_score: (pressure * 0.5) + (density * 3) + (entry / width * 0.2),
    festival_peak: s.isCritical || s.phase === 'peak' ? 1 : 0,
    transport_arrival_burst: s.transportBurst || (Math.random() < 0.3 ? 1 : 0)
  };
};

const callMLService = async (features) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, features, { timeout: 500 });
    return response.data;
  } catch (err) {
    return null; // Silent fail — simulation continues without ML if service is down
  }
};

const initSimulation = async (io) => {
  console.log('⚡ CrowdShield AI — Simulation Engine v3 (2 s tick)');

  setInterval(async () => {
    globalTick++;

    try {
      const corridors = await Corridor.find();
      const names = corridors.map(c => c.name);

      for (let i = 0; i < corridors.length; i++) {
        const corridor = corridors[i];
        const name = corridor.name;
        const wf   = WIDTH_FACTOR[name] || 0.75;
        
        // Per-corridor SOS scheduling: Every 22 ticks (44s), with 5-tick staggered starts
        const scheduleTick = 22;
        const staggeredOffset = i * 5;
        const isScheduledNow = (globalTick + staggeredOffset) % scheduleTick === 0;

        // ── Initialise state ──────────────────────────────────
        if (!state[name]) {
          state[name] = {
            phase:               PHASE.NORMAL,
            phaseTick:           0,
            phaseDuration:       22 + Math.floor(Math.random() * 6),
            lastPressure:        25 + Math.random() * 15,
            sustainedCrit:       0,
            sosCooldown:         0,
            lastAlertTick:       0,
            transportBurst:      0,
            tickCount:           0,
            pendingSos:          false,
          };
        }

        const s = state[name];
        s.phaseTick++;
        if (s.sosCooldown > 0) s.sosCooldown--;

        // Set sticky flag when schedule hits
        if (isScheduledNow) {
          s.pendingSos = true;
          console.log(`📡 [${name}] SOS Scheduled — Flagging as pending...`);
        }

        // Force transition if SOS is pending and we're just idling in normal
        if (s.pendingSos && s.phase === PHASE.NORMAL) {
          s.phaseTick = s.phaseDuration; // Force switch in next line
        }

        // ── Phase transitions ─────────────────────────────────
        if (s.phaseTick >= s.phaseDuration) {
          s.phaseTick = 0;

          switch (s.phase) {
            case PHASE.NORMAL:
              s.phase         = PHASE.RISING;
              s.phaseDuration = 4; // Faster rise for demo
              s.isCritical    = s.pendingSos;
              
              if (s.isCritical) {
                s.pendingSos  = false; // Consumed
                s.sosCooldown = 0;     // Ensure no cooldown blocking for demo
                console.log(`🔥 [${name}] CRITICAL SURGE INITIATED`);
              }
              
              s.isHeavySurge  = !s.isCritical && Math.random() < 0.2;
              io.emit('alertUpdate', {
                corridor: name, severity: 'amber',
                message: `⚠️ Pilgrim density rising at ${name} corridor`,
                type: 'surge start'
              });
              break;

            case PHASE.RISING:
              s.phase         = PHASE.PEAK;
              s.phaseDuration = s.isCritical ? 10 : (5 + Math.floor(Math.random() * 4));
              break;

            case PHASE.PEAK:
              s.phase         = PHASE.RECOVERY;
              s.phaseDuration = 6 + Math.floor(Math.random() * 3);
              s.sustainedCrit = 0;
              s.isCritical    = false;
              s.isHeavySurge  = false;
              // Reset SOS protocol flags — situation de-escalating
              corridor.policeDeployed = false;
              corridor.gateClosed     = false;
              corridor.paActive       = false;
              corridor.medicalOnSite  = false;
              io.emit('alertUpdate', {
                corridor: name, severity: 'green',
                message: `↓ Pressure recovering at ${name} — crowd dispersing`,
                type: 'recovery'
              });
              break;

            case PHASE.RECOVERY:
              s.phase         = PHASE.NORMAL;
              s.phaseDuration = 10 + Math.floor(Math.random() * 5); // Shorter normal phase for demo
              io.emit('alertUpdate', {
                corridor: name, severity: 'green',
                message: `✅ Normal flow restored at ${name}`,
                type: 'normalised'
              });
              break;
          }
        }

        // ── Target pressure per phase ─────────────────────────
        //   Normal   → 25-45 %
        //   Rising   → ramp from current to peak
        //   Peak     → 65-85 % (heavy 75-88 %, critical 90-100 %)
        //   Recovery → fall back toward 30 %
        let targetPressure;
        const progress = s.phaseTick / Math.max(s.phaseDuration, 1); // 0→1

        switch (s.phase) {
          case PHASE.NORMAL:
            targetPressure = 25 + (1 / wf) * 6 + Math.random() * 8;
            break;
          case PHASE.RISING: {
            const peakTarget = s.isCritical ? 96
              : s.isHeavySurge              ? 82
              :                               65 + Math.random() * 12;
            targetPressure = s.lastPressure + (peakTarget - s.lastPressure) * progress;
            targetPressure += (Math.random() - 0.5) * (s.isCritical ? 0 : 4);
            break;
          }
          case PHASE.PEAK:
            targetPressure = s.isCritical
              ? 94 + Math.random() * 5          // 94-99 % (no randomness below 90%)
              : s.isHeavySurge
              ? 75 + Math.random() * 10         // 75-85 %
              : 62 + Math.random() * 14;        // 62-76 %
            targetPressure += (Math.random() - 0.5) * (s.isCritical ? 0 : 3);
            break;
          case PHASE.RECOVERY:
            targetPressure = s.lastPressure - (s.lastPressure - 30) * (progress * 0.4 + 0.1);
            targetPressure += (Math.random() - 0.5) * 5;
            break;
          default:
            targetPressure = 30;
        }

        // Smooth organic feel, but SNAP to high pressure for critical events
        let pressure;
        if (s.isCritical && (s.phase === PHASE.PEAK || s.phase === PHASE.RISING)) {
          // Rapid jump for critical events
          pressure = 0.3 * s.lastPressure + 0.7 * targetPressure;
          // Forced threshold floor
          if (s.phase === PHASE.PEAK) {
            pressure = Math.max(93, pressure);
          }
        } else {
          pressure = 0.78 * s.lastPressure + 0.22 * targetPressure;
        }

        pressure = Math.min(100, Math.max(0, Math.round(pressure)));
        s.lastPressure = pressure;

        // ── Selection labels ─────────────────────────────────────
        const severity = pressure >= 85 ? 'red'
          : pressure >= 60 ? 'amber'
          : 'green';

        // ── Diagnostic Logging (Demo mode) ──────────────────────
        if (s.isCritical || s.sustainedCrit > 0) {
          console.log(`📡 [${name}] P:${pressure}% Ph:${s.phase} CritCount:${s.sustainedCrit}/5`);
        }

        // ── SOS logic ─────────────────────────────────────────
        if (pressure >= 85) {
          s.sustainedCrit++;
          if (s.sustainedCrit === 1) {
            console.log(`🟡 [${name}] CRITICAL BUILDUP DETECTED — ${pressure}%`);
            io.emit('alertUpdate', {
              corridor: name, severity: 'red',
              message: `🔴 High pressure ${pressure}% at ${name} — Monitoring SOS gate`,
              type: 'pressure critical'
            });
          }
        } else if (pressure < 60) { // LOWER RESET GATE to avoid jitter cancelling SOS
          if (s.sustainedCrit > 0) {
            console.log(`🟢 [${name}] Buildup subsided (${pressure}%) — Counter reset.`);
            s.sustainedCrit = 0;
          }
        }

        // Fire SOS INSTANTLY at ≥ 85 % (Removed 10s sustained requirement as requested)
        if (pressure >= 85 && (s.sosCooldown === 0 || s.isCritical)) {
          console.log(`🚨🚨🚨 INSTANT SOS TRIGGERED: [${name}] at ${pressure}% 🚨🚨🚨`);
          io.emit('sosTrigger', {
            corridor: name, pressure,
            message: `Emergency detected at ${name.toUpperCase()} — ${pressure}%`
          });
          corridor.policeDeployed  = true;
          corridor.gateClosed      = true;
          corridor.paActive        = true;
          corridor.medicalOnSite   = true;
          corridor.incidentsToday += 1;

          await Alert.create({
            corridor: name, type: 'crush alert', severity: 'red',
            message: `🚨 INCIDENT #${corridor.incidentsToday}: Instant trigger at ${pressure}%`
          });
          io.emit('alertUpdate', {
            corridor: name, severity: 'red',
            message: `🚨 SOS #${corridor.incidentsToday} at ${name} — instant protocols active`,
            type: 'crush alert'
          });

          // Set cooldown to prevent double firing, but clear it for next scheduled event
          s.sosCooldown   = 12; // ~24s cooldown to separate alerts
          s.sustainedCrit = 0;
          s.isCritical    = false; 
        }

        // ── Periodic status ping (every 4 s = 2 ticks) ────────
        s.lastAlertTick++;
        if (s.lastAlertTick >= 2) {
          s.lastAlertTick = 0;
          const statusMsgs = [
            `Flow ${pressure < 45 ? 'stable' : pressure < 70 ? 'moderate' : 'heavy'} — ${pressure}% capacity at ${name}`,
            `${pressure < 60 ? '✅' : pressure < 85 ? '⚠️' : '🔴'} ${name}: ${pressure}% crowd pressure`,
          ];
          io.emit('alertUpdate', {
            corridor: name, severity,
            message: statusMsgs[Math.floor(Math.random() * statusMsgs.length)],
            type: 'status', pressure
          });
        }

        // ── DB update ──────────────────────────────────────────
        corridor.pressureIndex = pressure;
        corridor.pressureHistory = [...(corridor.pressureHistory || []).slice(-59), pressure];
        corridor.surgeClassifier  = s.phase === PHASE.PEAK
          ? (pressure >= 85 ? 'buildup' : 'surge')
          : 'normal';
        corridor.surgeDuration    = s.phase !== PHASE.NORMAL ? s.phaseTick * 2 : 0;
        corridor.totalPilgrims   = Math.min((corridor.totalPilgrims || 0) + 4, 999999);
        corridor.peakDensity      = Math.max(corridor.peakDensity || 0, pressure);
        corridor.updatedAt        = new Date();

        // ── Populate pressureSources (Bug #25) ────────────────
        const entryFlow = 150 + pressure * 2 + Math.random() * 30;
        const transportBurstVal = s.transportBurst || (Math.random() < 0.3 ? 1 : 0);
        corridor.pressureSources = {
          entryFlow: Math.round(entryFlow),
          transportBurst: transportBurstVal,
          widthConstraint: Math.round((1 / wf) * 100) / 100
        };

        // ── Dynamic avgFlowRate (Bug #19) ─────────────────────
        const entryRate = corridor.pressureSources.entryFlow;
        const flowPerHour = entryRate * 30; // entry/2s → per hour
        corridor.avgFlowRate = flowPerHour >= 1000
          ? (flowPerHour / 1000).toFixed(1) + 'k'
          : Math.round(flowPerHour).toString();

        // ── ML Prediction ──────────────────────────────────
        const mlFeatures = computeMLFeatures(corridor, s, pressure);
        const mlResult = await callMLService(mlFeatures);
        if (mlResult) {
          corridor.mlRiskLevel = mlResult.risk_level;
          corridor.mlCrushWindowMin = mlResult.crush_window_min;
          corridor.mlConfidence = mlResult.confidence;
        }

        await corridor.save();

        await PressureLog.create({ corridor: name, pressureIndex: pressure }).catch(() => {});
        io.emit('corridorUpdate', corridor.toObject());
      }
    } catch (err) {
      console.error('Simulation Tick Error:', err.message);
    }
  }, 2000);
};

module.exports = { initSimulation };
