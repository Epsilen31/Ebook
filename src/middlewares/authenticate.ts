import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
// import { AuthRequest } from "./authenticate";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(403, "Token is required"));
  }

  const parsedToken = token.split(" ")[1];

  try {
    const payload = verify(
      parsedToken,
      config.jwtSecret as string
    ) as JwtPayload;
    console.log(payload);

    // If you want to attach the payload to the request object
    const _req = req as AuthRequest;
    _req.userId = payload.sub as string;
    console.log("userID", _req.userId);

    next();
  } catch (error) {
    return next(createHttpError(403, "Invalid token"));
  }
};

export default authenticate;
