import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { updateAccessToken } from "../controllers/user.controller";

// authenticated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers["access-token"] as string | undefined;

    if (!accessToken) {
      return next(
        new ErrorHandler("Please login to access this resource", 401) // 401 for unauthorized
      );
    }

    try {
      const decoded = jwt.decode(accessToken) as JwtPayload;

      if (!decoded) {
        return next(new ErrorHandler("Access token is not valid", 400));
      }

      // Check if the access token is expired
      if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        await updateAccessToken(req, res, next);
      } else {
        const user = await redis.get(decoded.id);

        if (!user) {
          return next(
            new ErrorHandler("Please login to access this resource", 401)
          );
        }

        req.user = JSON.parse(user);
        next();
      }
    } catch (error: any) {
      return next(new ErrorHandler("Token validation failed", 400));
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
