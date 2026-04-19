const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  lastAlertTime: { type: Date },
  acknowledgedAt: { type: Date },
  responseTime: { type: String }, // e.g. "4m"
  action: { type: String, default: "Monitoring" }
});

module.exports = mongoose.model('Agency', AgencySchema);
