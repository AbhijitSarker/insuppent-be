import 'dotenv/config';
import app from './app.js';
import connectDB from './config/database.js';
import config from './config/config.js';

// Connect to MongoDB
connectDB();

app.listen(config.app.port, () => {
    console.log(`Server is running in ${config.app.env} mode on port ${config.app.port}`);
});