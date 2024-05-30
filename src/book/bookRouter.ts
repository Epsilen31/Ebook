import express from "express";
const bookRouter = express.Router();
import { createBook } from "./bookController";

// api routes
bookRouter.post("/", createBook);

export default bookRouter;
