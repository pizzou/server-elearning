import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { ErrorMiddleware } from "./middleware/error";

// Load environment variables from .env file
dotenv.config();

export const app = express();

// CORS configuration
const whitelist = [
  'http://localhost:3000',  // Development
  'https://your-production-domain.com',  // Production (add your production domain here)
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);  // Allow the request if origin is in the whitelist or undefined (for server-side requests)
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
  credentials: true,  // Allow credentials like cookies and authorization headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "50mb" }));

// Cookie parser middleware
app.use(cookieParser());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all requests
app.use(limiter);

// Define routes
app.use("/api/v1", userRouter, orderRouter, courseRouter, notificationRouter, analyticsRouter, layoutRouter);

// Example login route
app.post('/api/v1/login', (req, res) => {
  // Your login handler logic here
  res.json({ message: "Login successful!" });
});

// Handle unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Middleware to handle errors
app.use(ErrorMiddleware);

// Export the app for use in other files (e.g., for server setup)
export default app;
