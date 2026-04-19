const mongoose = require('mongoose');

const TransportEventSchema = new mongoose.Schema({
  corridor: { type: String, required: true },
  busId: { type: String, required: true },
  arrivalTime: { type: Date, default: Date.now },
  passengerCount: { type: Number, required: true }
});

module.exports = mongoose.model('TransportEvent', TransportEventSchema);
