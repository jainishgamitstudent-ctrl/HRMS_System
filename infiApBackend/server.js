require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { initSocketManager } = require('./src/utils/socketManager');

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to Database first
        await connectDB();

        // Create HTTP server and attach Socket.IO
        const server = http.createServer(app);
        initSocketManager(server);

        // Only start listening if DB connection is successful
        server.listen(port, "0.0.0.0", () => {
            console.log(`Server is running on port ${port} (all interfaces)`);
            console.log('Database connected successfully');
        });
    } catch (err) {
        console.error("FAILED to start server due to DB connection error:");
        console.error(err.message);
        process.exit(1); // Exit with failure
    }
};

startServer();