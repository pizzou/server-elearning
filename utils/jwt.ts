import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

// Token expiration and cookie options
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10); // 300 seconds = 5 minutes
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10); // 1200 seconds = 20 minutes

// Options for the access token cookie
const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 1000), // Convert to milliseconds
  maxAge: accessTokenExpire * 1000,
  httpOnly: true,
  sameSite: "lax" as const, // Use "lax" explicitly (or "strict"/"none" if necessary)
  secure: process.env.NODE_ENV === "production", // Secure cookies in production
};

// Options for the refresh token cookie
const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 1000),
  maxAge: refreshTokenExpire * 1000,
  httpOnly: true,
  sameSite: "lax" as const, // Use "lax" explicitly (or "strict"/"none" if necessary)
  secure: process.env.NODE_ENV === "production",
};

export const sendToken = async (user: IUser, statusCode: number, res: Response) => {
  try {
    // Generate tokens
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new Error("Token generation failed");
    }

    // Store the user session in Redis
    await redis.set(user._id.toString(), JSON.stringify(user));

    // Set tokens in cookies
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    // Send response with success and user data
    res.status(statusCode).json({
      success: true,
      user,
      message: "Tokens have been set in cookies",
    });
  } catch (error) {
    // Error handling for any issues in the process
    console.error("Error setting tokens or storing session:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Failed to set tokens.",
    });
  }
};
