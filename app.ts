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
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
  credentials: true,  // Enable cookies or other credentials
};

app.use(cors(corsOptions));

app.post('/api/v1/login', (req, res) => {
  // Your login handler
});


// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiter to all requests
app.use(limiter);

// Routes
app.use("/api/v1", userRouter, orderRouter, courseRouter, notificationRouter, analyticsRouter, layoutRouter);

// Handle unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`)as any;
  err.statusCode = 404;
  next(err);
});

// Middleware to handle errors
app.use(ErrorMiddleware);
