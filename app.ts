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
  origin: ['https://client-beta-navy.vercel.app'], // Allow Vercel client
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'], // Allowed headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser to parse JSON request bodies
app.use(express.json({ limit: "50mb" }));

// Cookie parser to parse cookies
app.use(cookieParser());

// Rate limiting middleware to limit requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply rate limiting middleware to all requests
app.use(limiter);

// Routes
app.use("/api/v1", userRouter, orderRouter, courseRouter, notificationRouter, analyticsRouter, layoutRouter);

// Preflight request handling for CORS (Optional)
app.options('*', cors(corsOptions)); // Handle preflight requests for all routes

// Handle unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use(ErrorMiddleware);
