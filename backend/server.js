const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const { initSimulation } = require('./services/simulationService');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket"]
});

app.use(cors());
app.use(express.json());

// Setup MongoDB (In-Memory for zero-config demo)
const startDB = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log("🟢 CrowdShield AI DB Connected:", mongoUri);
    
    // Seed data since it's a fresh DB on every start
    const seed = require('./seed');
    await seed();
    console.log("🌱 Scenario Data Seeded");
    
    // Start Simulation
    initSimulation(io);
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

startDB();

// Routes
app.use('/api', apiRoutes(io));

// Sockets
io.on('connection', (socket) => {
  console.log(`📡 Client Connected: ${socket.id}`);

  // ── Corridor subscription (room-based scoping) ──
  socket.on('subscribe', (corridor) => {
    if (corridor) {
      socket.join(corridor);
      console.log(`📌 ${socket.id} subscribed to corridor: ${corridor}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client Disconnected: ${socket.id}`);
  });

  // ── Quick-action handler (PA, Medical, Gate, Police) ──
  socket.on('action', ({ corridor, action }) => {
    console.log(`🎬 Action received: "${action}" for corridor ${corridor}`);
    io.emit('actionExecuted', {
      corridor,
      action,
      executedBy: socket.id,
      timestamp: new Date().toTimeString().slice(0, 8),
    });
  });

  // ── Official Acknowledgement — broadcast to all connected clients ──
  socket.on('agencyAck', ({ agency, corridor, officerName }) => {
    const payload = {
      agency,
      corridor,
      officerName: officerName || 'Field Officer',
      timestamp: new Date().toTimeString().slice(0, 8),
      responseMs: Date.now(),
    };
    console.log(`✅ Agency ACK — ${agency} by ${payload.officerName} for ${corridor}`);
    io.emit('agencyAckConfirmed', payload);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🛡  CROWDSHIELD AI BACKEND LIVE ON PORT ${PORT}`);
  console.log(`==========================================\n`);
});
