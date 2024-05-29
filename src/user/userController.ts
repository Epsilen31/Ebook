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
  // get  user data
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  // database call
  const user = await userModel.findOne({ email });
  if (user) {
    const error = createHttpError(400, "user already exist");
    return next(error);
  }

  //   hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create user
  const newUser = new userModel({
    name,
    email,
    password: hashedPassword,
  });
  await newUser.save();

  //   token generation
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  //   response
  res.status(201).json({
    message: "user created successfully",
    data: newUser,
    token,
  });
};
