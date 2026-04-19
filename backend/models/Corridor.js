const mongoose = require('mongoose');

const CorridorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    enum: ["Ambaji", "Dwarka", "Somnath", "Pavagadh"],
    unique: true 
  },
  pressureIndex: { type: Number, default: 0, min: 0, max: 100 },
  pressureHistory: { type: [Number], default: Array(60).fill(0) },
  pressureSources: {
    entryFlow: { type: Number, default: 0 },
    transportBurst: { type: Number, default: 0 },
    widthConstraint: { type: Number, default: 0 }
  },
  surgeType: { type: String, enum: ["momentary", "genuine"], default: "momentary" },
  surgeClassifier: { type: String, default: "normal" },
  surgeDuration: { type: Number, default: 0 },
  totalPilgrims: { type: Number, default: 0 },
  peakDensity: { type: Number, default: 0 },
  avgFlowRate: { type: String, default: "0.0k" },
  incidentsToday: { type: Number, default: 0 },
  // Weather condition for ML feature encoding
  weather: { type: String, enum: ["Clear", "Heat", "Rain"], default: "Clear" },
  // Physical corridor width in meters (affects density calculations)
  corridorWidth: { type: Number, default: 5 },
  policeDeployed: { type: Boolean, default: false },
  gateClosed: { type: Boolean, default: false },
  paActive: { type: Boolean, default: false },
  medicalOnSite: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
  // ML Prediction fields (populated by Python microservice)
  mlRiskLevel: { type: String, default: null },
  mlCrushWindowMin: { type: Number, default: null },
  mlConfidence: { type: Number, default: null }
}, { strict: false });

module.exports = mongoose.model('Corridor', CorridorSchema);
