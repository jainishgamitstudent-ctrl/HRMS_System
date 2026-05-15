require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to Database first
        await connectDB();
        
        // Only start listening if DB connection is successful
        app.listen(port, "0.0.0.0", () => {
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