import express from "express";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

import {
  createBook,
  updateBook,
  getAllBook,
  getSingleBook,
  deleteBook,
} from "./bookController";

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/upload"),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// api routes
bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

bookRouter.put(
  "/:id",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.get("/getAllBook", getAllBook);
bookRouter.get("/getSingleBook/:id", getSingleBook);
bookRouter.delete("/deleteBook/:id", authenticate, deleteBook);

export default bookRouter;
