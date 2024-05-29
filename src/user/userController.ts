import { NextFunction, Request, Response } from "express";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ message: "successfull" });
};
