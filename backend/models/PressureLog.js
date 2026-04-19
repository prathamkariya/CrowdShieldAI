const mongoose = require('mongoose');

const PressureLogSchema = new mongoose.Schema({
  corridor: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  pressureIndex: { type: Number, required: true },
  flowRate: { type: Number, required: true }
});

module.exports = mongoose.model('PressureLog', PressureLogSchema);
