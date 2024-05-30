import { NextFunction, Request, Response } from "express";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ message: "hell" });
  } catch (err) {}
};
