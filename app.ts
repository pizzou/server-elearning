import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { ErrorMiddleware } from "./middleware/error";

require("dotenv").config();

export const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://client-beta-navy.vercel.app', // Allow only your Vercel client
  credentials: true, // Enable credentials to support cookies
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  optionsSuccessStatus: 200, // For legacy browsers
};

app.use(cors(corsOptions));

// Body parser for handling JSON payloads
app.use(express.json({ limit: "50mb" }));

// Cookie parser for handling cookies
app.use(cookieParser());

// Rate limiting middleware to limit requests from the same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
});

// Apply the rate limiter to all requests
app.use(limiter);

// Routes for the various resources in the application
app.use("/api/v1", userRouter, orderRouter, courseRouter, notificationRouter, analyticsRouter, layoutRouter);

// Handle unknown routes with a 404 error
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Middleware to handle errors globally
app.use(ErrorMiddleware);
