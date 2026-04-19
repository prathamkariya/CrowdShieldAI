const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  corridor: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, enum: ["green", "amber", "red"], default: "green" },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
