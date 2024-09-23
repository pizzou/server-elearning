import { v2 as cloudinary } from "cloudinary";
import http from "http";
import connectDB from "./utils/db";
import { initSocketServer } from "./socketServer";
import { app } from "./app";
require("dotenv").config();

const server = http.createServer(app);

// Check environment variables
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_SECRET_KEY) {
    console.error('Cloudinary configuration variables are missing');
    process.exit(1);
}

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});

// Initialize socket server
initSocketServer(server);

// Set port with fallback
const port = parseInt(process.env.PORT || '8000', 10);

// Start server
server.listen(port, () => {
    console.log(`Server is connected with port ${port}`);
    connectDB();
});
