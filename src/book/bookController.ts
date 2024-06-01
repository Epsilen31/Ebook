import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import { promises as fs } from "fs"; // for potential file cleanup
import { AuthRequest } from "../middlewares/authenticate";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user data
    const { title, gener } = req.body;
    console.log("files", req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.coverImage || !files.file) {
      return res.status(400).json({ error: "Missing required files" });
    }

    const coverImageFile = files.coverImage[0];
    const bookFile = files.file[0];

    const coverImageMimeType = coverImageFile.mimetype.split("/").at(-1);
    const coverImagePath = path.resolve(
      __dirname,
      "../../public/data/upload",
      coverImageFile.filename
    );

    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/upload",
      bookFile.filename
    );

    // Upload cover image
    const uploadResult = await cloudinary.uploader.upload(coverImagePath, {
      filename_override: coverImageFile.filename,
      folder: "book-files",
      format: coverImageMimeType,
    });

    // Upload book file
    const bookUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFile.filename,
      folder: "book-pdf",
      format: "pdf",
    });

    const _req = req as AuthRequest;

    const newBook = await bookModel.create({
      title,
      auther: _req.userId, // Placeholder, should come from authenticated user
      gener,
      coverImage: uploadResult.secure_url,
      file: bookUploadResult.secure_url,
    });
    // Clean up local files (optional)
    await fs.unlink(coverImagePath);
    await fs.unlink(bookFilePath);
    res
      .status(201)
      .json({ message: "Book created successfully", book: newBook });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while creating the book" });
  }
};
