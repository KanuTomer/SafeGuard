const http = require('http');

const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const { initializeSocket } = require('./sockets');

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initializeSocket(httpServer, app);

    httpServer.listen(env.port, () => {
      console.log(`SafeGuard backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
