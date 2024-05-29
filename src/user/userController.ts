import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import { sign } from "jsonwebtoken";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get user data
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  // Check if user already exists
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(400, "User already exists");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error from server side"));
  }

  // Hash password
  let hashedPassword: string;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (error) {
    return next(createHttpError(500, "Error hashing password"));
  }

  // Create user
  let newUser;
  try {
    newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
  } catch (error) {
    return next(createHttpError(500, "Error creating user"));
  }

  // Token generation
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  // Response
  res.status(201).json({
    message: "User created successfully",
    data: newUser,
    token,
  });
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user data
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }
    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }
    // Check if password is correct
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      const error = createHttpError(401, "Incorrect password");
      return next(error);
    }
    // Token generation
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    // Response
    res.status(200).json({
      message: "User logged in successfully",
      data: user,
      token,
    });
  } catch (error) {
    return next(createHttpError(500, "Error from server side"));
  }
};
