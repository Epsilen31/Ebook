import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";

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
  // create user
  const newUser = new userModel({
    name,
    email,
    password,
  });
  await newUser.save();

  //   response
  res.status(201).json({
    message: "user created successfully",
    data: newUser,
  });
};
