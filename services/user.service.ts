import { Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

// Get user by ID with error handling
export const getUserById = async (id: string, res: Response) => {
  try {
    const userJson = await redis.get(id);

    if (userJson) {
      const user = JSON.parse(userJson);
      return res.status(200).json({
        success: true,
        user,
      });
    }

    // If not found in Redis, check MongoDB
    const userFromDb = await userModel.findById(id);
    if (!userFromDb) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store the user in Redis for future requests
    await redis.set(id, JSON.stringify(userFromDb));

    return res.status(200).json({
      success: true,
      user: userFromDb,
    });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all users with error handling
export const getAllUsersService = async (res: Response) => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update user role with error handling
export const updateUserRoleService = async (res: Response, id: string, role: string) => {
  try {
    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
