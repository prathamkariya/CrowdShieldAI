<div align="center">

<br/>

```
 ██████╗██████╗  ██████╗ ██╗    ██╗██████╗ ███████╗██╗  ██╗██╗███████╗██╗     ██████╗ 
██╔════╝██╔══██╗██╔═══██╗██║    ██║██╔══██╗██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
██║     ██████╔╝██║   ██║██║ █╗ ██║██║  ██║███████╗███████║██║█████╗  ██║     ██║  ██║
██║     ██╔══██╗██║   ██║██║███╗██║██║  ██║╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
╚██████╗██║  ██║╚██████╔╝╚███╔███╔╝██████╔╝███████║██║  ██║██║███████╗███████╗██████╔╝
 ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝
```

### **AI-Powered Crowd Crush Prevention for Gujarat's Sacred Pilgrim Corridors**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-Server-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML-FF6600?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://xgboost.readthedocs.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-In--Memory-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Modern-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

<br/>

> **⚠️ Every 2 seconds, CrowdShield AI evaluates the safety of thousands of pilgrims.**  
> **It gives authorities an 8–12 minute warning before a crowd crush becomes inevitable.**

</div>

---

## 🎯 The Problem

Gujarat hosts some of India's most sacred pilgrimage sites — **Ambaji, Dwarka, Somnath, and Pavagadh**. During peak festivals, these narrow corridors receive hundreds of thousands of pilgrims in a matter of hours. Crowd crush events occur not because of panic, but because of **preventable pressure build-up** that no human operator can track quickly enough across multiple zones simultaneously.

Historical tragedies show a chilling truth: **the danger window is almost always 8–12 minutes before disaster.** Traditional monitoring relies on human eyesight, which often misses the subtle "density waves" that precede a crush. 

CrowdShield AI detects it, evaluates it, and alerts commanders before it's too late.

---

## 🧠 How It Works

```text
  SENSOR PIPELINE            ML ENGINE                 COMMAND DASHBOARD
  ───────────────            ─────────                 ─────────────────
  Queue Density      →     XGBoost Risk          →     Live Heatmap
  Net Flow Rate            Classifier                  Pressure Index
  Transport Burst    →     (Low/Moderate/        →     Corridor Switcher
  Corridor Width           High/Critical) 
                     →     Crush Window          →     Multi-Agency Alerts
                           Regressor                   (Police/Temple/Medic)
                     →     Socket.io Event       →     Historical Event
                           Stream (2s tick)            Logs & Acks
```

The system continuously processes real-time simulated sensor data using a custom Node.js simulation engine. These dynamic features are sent over to an **XGBoost-powered Flask microservice** which evaluates risk factors and streams predictions via **Socket.io** down to a command dashboard used by field operators and agency commanders.

---

## ✨ Key Features

### 🔴 Real-Time Prediction Engine
- Streams **live risk assessments and simulations** every 2 seconds via Socket.io.
- Classifies crowd state organically flowing through `Low` → `Moderate` → `High` → `Critical`.
- Predicts the **crush window** using an XGBoost regression model (estimating minutes to danger).

### 📡 Multi-Corridor Coverage
Immediate visual tracking of 4 independent crowd dynamics:
| Corridor / Temple | Width Factor | Dynamic Pressure |
|---|---|---|
| 🟡 **Ambaji** | 0.70 | Moderate Risk Profile |
| 🔵 **Dwarka** | 0.90 | Excellent Flow (Widest) |
| 🟢 **Somnath** | 0.85 | Good Flow Capacity |
| 🔴 **Pavagadh** | 0.60 | High Risk (Narrowest) |

### 🚨 Multi-Agency Coordination
- Automated alert lifecycle: **Triggered → Multi-Channel Notification → Acknowledged → Resolved**.
- Quick action commands allowing independent agency acknowledgments (**Police, Temple Trustees, Transport**).
- Real-time logging of **Ack Response Times**, creating a leaderboard of agency efficiency.
- Instant, full-screen **SOS Emergency Alert overlay** for absolute network-wide lockdown.

### 🗺️ Interactive GIS Command Map
- Live **2D Leaflet map** with dynamic pressure and crowd density zone overlays.
- Special contextual **Hill Path Visualizations** for elevated corridors like Pavagadh.
- Live Mock **YOLO computer vision feeds**, blending physical camera visuals with data metrics.

### 🎬 Actionable Analytics
- Deep **Post-Action Event Logging** mimicking a cryptographic ledger for analyzing agency response history.
- High-stakes **Crush Window Countdown** prominently tracking the exact margin of safety remaining.
- Stunning **Framer Motion** transitions rendering chaotic data elegantly and intuitively.

### 🌐 Multi-Language Support
- Context-aware UI translations extending situational awareness across languages: **English, Hindi (हिंदी), and Gujarati (ગુજરાતી)**.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    CROWDSHIELD AI PLATFORM                  │
├───────────────────────┬─────────────────┬───────────────────┤
│    MAIN BACKEND       │  ML MICROSERVICE│     FRONTEND      │
│     (Node.js)         │    (Python)     │   (Next.js 15)    │
│  ┌─────────────────┐  │  ┌───────────┐  │  ┌─────────────┐  │
│  │ Express Server  │  │  │ Flask App │  │  │ TypeScript  │  │
│  │ Port 3001       │  │  │ Port 5001 │  │  │ Port 3000   │  │
│  ├─────────────────┤  │  ├───────────┤  │  ├─────────────┤  │
│  │ Simulation Core │──┼─►│ /predict  │  │  │ useSimulation │  │
│  │ 2-Second Tick   │◄─┼──│ Inference │  │  │ Socket.io   │  │
│  ├─────────────────┤  │  ├───────────┤  │  ├─────────────┤  │
│  │ Socket.io Hub   │  │  │ XGBoost   │  │  │ Bento Grid  │  │
│  │ Alert Emitter   │  │  │ Classifier│  │  │ LiveMap     │  │
│  ├─────────────────┤  │  │ Regressor │  │  │ Replay Mode │  │
│  │ MongoDB Array   │  │  └───────────┘  │  │ Agency Acks │  │
│  │ (In-Memory)     │  │                 │  └─────────────┘  │
│  └─────────────────┘  │                 │                   │
└───────────────────────┴─────────────────┴───────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- (Zero external database required during development; powers off internal In-Memory MongoDB setup)

---

### 1️⃣ Python ML Service Setup
The prediction microservice calculates crush risks based on the active inputs.

```bash
# 1. Navigate to ML folder
cd backend/ml

# 2. Create and activate a Virtual Environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

# 3. Install requirements
pip install -r requirements.txt

# 4. Generate/Train Models (If missing)
python train_model.py

# 5. Start Flask Microservice
python ml_service.py
```
✅ ML Service running at: `http://localhost:5001`  

---

### 2️⃣ Node.js Backend Engine Setup
The simulation engine actively constructs continuous realistic crowd pressures and coordinates sockets.

```bash
# 1. Navigate to main backend
cd backend

# 2. Install dependencies
npm install

# 3. Start the Simulation Engine
npm start
```
✅ Main Server & Sockets running at: `http://localhost:3001`

---

### 3️⃣ Next.js 15 Frontend Dashboard Setup
The visual command hub for agency users to monitor activity.

```bash
# 1. Navigate to the frontend directory
cd frontend/Frontend

# 2. Install dependencies (force if solving Next.js peer dep warnings)
npm install --force

# 3. Start the dev server
npm run dev
```
✅ Command Deck running at: `http://localhost:3000`

---

## 🧠 Model Architecture & Machine Learning

The intelligence relies on a dual-inference XGBoost pipeline trained on synthesized sensor logs (extracted via `train_model.py` labeling):

| Model | Application | Purpose | Output Format |
|---|---|---|---|
| `risk_classifier.joblib` | Classification | Core Risk Profiling | `Low / Moderate / High / Critical` |
| `crush_regressor.joblib` | Regression | Impact Estimator | Minutes to absolute critical (1.0 to 19.0) |

**Monitored Input Features:**
`net_flow`, `occupancy_proxy`, `flow_to_width_ratio`, `weather_encoded`, `rolling_pressure_5min`, `pressure_delta`, `congestion_ratio`, `width_adjusted_density`, `composite_risk_score`, `festival_peak`, `transport_arrival_burst`

---

## 🛠️ Tooling & Stack Details

| Domain | Technology | Core Purpose |
|---|---|---|
| **Backend API** | Node.js + Express | Highly concurrent request handling. |
| **Realtime** | Socket.io | Non-blocking persistent state emissions (SSEs substitute). |
| **Database** | MongoDB (Memory) | Zero-setup testing environment (`mongodb-memory-server`). |
| **Machine Learning** | Python + Flask | Joblib serialization of Scikit-Learn/XGBoost weights. |
| **Frontend Framework**| Next.js + React | Client rendering with Tailwind styling and modern component routing. |
| **Motion/UX** | Framer Motion | Smooth, organic interactions representing data momentum. |
| **Mapping** | Leaflet.js | Geographical overlays mapping congestion hotspots dynamically. |

---

## 👥 Team

Built with ❤️ by **Team CrowdShield** for the **LD Hackathon 2026**

---

## 📄 License

This project was carefully developed for Hackathon purposes. All rights reserved by the team.

---

<div align="center">

**"Prevention, not reaction — that's the CrowdShield promise."**

*Protecting Gujarat's sacred corridors, one prediction at a time.*

</div>
