const Corridor = require('../models/Corridor');
const Alert = require('../models/Alert');
const PressureLog = require('../models/PressureLog');
const Agency = require('../models/Agency');

exports.getCorridor = async (req, res) => {
  try {
    const corridor = await Corridor.findOne({ name: req.params.name });
    res.json(corridor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ corridor: req.params.corridor }).sort({ timestamp: -1 }).limit(20);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await PressureLog.find({ corridor: req.params.corridor }).sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.json(agencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.handleAuth = async (req, res) => {
  try {
    const { corridor, password } = req.body;
    // Use env var in production; demo fallback for hackathon
    const validPassword = process.env.AUTH_PASSWORD || "admin123";
    if (password === validPassword) {
      return res.json({ success: true, message: "Authorized" });
    }
    res.status(401).json({ success: false, message: "Invalid Access Code" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ackAgency = async (req, res, io) => {
  try {
    const { name, action } = req.body;
    const agency = await Agency.findOneAndUpdate(
      { name }, 
      { acknowledgedAt: new Date(), action },
      { new: true }
    );
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    io.emit('agencyUpdate', agency);
    res.json(agency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
