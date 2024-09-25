import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { updateAccessToken } from "../controllers/user.controller";

// authenticated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Request Headers:", req.headers);
    console.log("Request Cookies:", req.cookies);

    // Retrieve the access token from either the Authorization header or cookies
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies['access_token'];  // Ensure that the access token is properly set in cookies

    console.log("Access Token:", accessToken);

    if (!accessToken) {
      console.log("Access token not provided");
      return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
      // Ensure you are using the correct secret
      const secret = process.env.ACCESS_TOKEN || 'your_jwt_secret';
      
      // Verify token and handle expired tokens explicitly here
      const decoded = jwt.verify(accessToken, secret) as JwtPayload;

      if (!decoded) {
        console.log("Invalid token payload");
        return next(new ErrorHandler("Access token is not valid", 400));
      }

      // Check for expiration
      if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        console.log("Token expired, attempting to refresh...");
        // Handle token expiration: possibly generate a new access token
        await updateAccessToken(req, res, next);
        return; // Stop further execution since the token is being refreshed
      } else {
        // Fetch the user from Redis using the decoded ID
        const user = await redis.get(decoded.id);

        if (!user) {
          console.log("User not found in Redis");
          return next(new ErrorHandler("Please login to access this resource", 401));
        }

        req.user = JSON.parse(user);  // Attach the user to the request object
        console.log("Authenticated user:", req.user);
        next();
      }
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        console.log("Access token has expired");
        return next(new ErrorHandler("Access token has expired, please login again", 401));
      } else if (error.name === "JsonWebTokenError") {
        console.log("Invalid JWT");
        return next(new ErrorHandler("Invalid token, authorization denied", 401));
      } else {
        console.log("Error in token validation:", error);
        return next(new ErrorHandler("Token validation failed", 401));
      }
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
