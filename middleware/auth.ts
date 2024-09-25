import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { updateAccessToken } from "../controllers/user.controller";

// authenticated user


import cookieParser from 'cookie-parser'; // make sure to use cookie-parser in your app

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Log headers and cookies for debugging
    console.log("Request Headers:", req.headers);
    console.log("Request Cookies:", req.cookies);

    // Try to get the access token from headers or cookies
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies['access_token']; // Check if the token is in the cookies

    console.log("Access Token:", accessToken);

    if (!accessToken) {
      console.log("Access token not provided");
      return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'your_jwt_secret') as JwtPayload;

      if (!decoded) {
        console.log("Invalid token");
        return next(new ErrorHandler("Access token is not valid", 400));
      }

      if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        console.log("Token expired, trying to refresh...");
        await updateAccessToken(req, res, next);
      } else {
        const user = await redis.get(decoded.id);

        if (!user) {
          console.log("User not found in Redis");
          return next(new ErrorHandler("Please login to access this resource", 401));
        }

        req.user = JSON.parse(user);
        next();
      }
    } catch (error: any) {
      console.log("Error in token validation:", error);
      return next(new ErrorHandler("Token validation failed", 401));
    }
  }
);



// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};