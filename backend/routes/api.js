const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

module.exports = (io) => {
  router.get('/corridor/:name', dashboardController.getCorridor);
  router.get('/alerts/:corridor', dashboardController.getAlerts);
  router.get('/logs/:corridor', dashboardController.getLogs);
  router.get('/agencies', dashboardController.getAgencies);
  router.post('/auth', dashboardController.handleAuth);

  router.post('/agency/ack', (req, res) => dashboardController.ackAgency(req, res, io));
  
  return router;
};
