const Corridor = require('./models/Corridor');
const Agency = require('./models/Agency');

const seedData = async () => {
  try {
    // Clear existing (though in-memory is fresh, good practice)
    await Corridor.deleteMany({});
    await Agency.deleteMany({});

    // 1. Seed Corridors
    const corridors = [
      { name: "Ambaji", pressureIndex: 30, totalPilgrims: 45000, peakDensity: 42, avgFlowRate: "2.1k", incidentsToday: 0, weather: "Clear", corridorWidth: 5 },
      { name: "Dwarka", pressureIndex: 25, totalPilgrims: 38000, peakDensity: 35, avgFlowRate: "1.8k", incidentsToday: 0, weather: "Clear", corridorWidth: 8 },
      { name: "Somnath", pressureIndex: 45, totalPilgrims: 52000, peakDensity: 55, avgFlowRate: "2.5k", incidentsToday: 0, weather: "Clear", corridorWidth: 6 },
      { name: "Pavagadh", pressureIndex: 60, totalPilgrims: 41000, peakDensity: 65, avgFlowRate: "1.9k", incidentsToday: 0, weather: "Clear", corridorWidth: 3 },
    ];
    await Corridor.insertMany(corridors);
    console.log("🌱 Corridors Seeded");

    // 2. Seed Agencies
    const agencies = [
      { name: "Police", action: "Patrolling" },
      { name: "Temple Trust", action: "Queue Management" },
      { name: "GSRTC", action: "Transport Coordination" },
    ];
    await Agency.insertMany(agencies);
    console.log("🌱 Agencies Seeded");

  } catch (err) {
    console.error("Seeding Error:", err);
  }
};

module.exports = seedData;
