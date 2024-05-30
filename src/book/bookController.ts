import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user data
    console.log("files", req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filename = files.coverImage[0].filename;
    const filepath = path.resolve(
      __dirname,
      "../../public/data/upload",
      filename
    );

    const uploadResult = cloudinary.uploader.upload(filepath, {
      filename_override: filename,
      folder: "book-pdf",
      format: coverImageMimeType,
    });

    console.log("uploadResult", uploadResult);

    const bookFileName = files.file[0].filename;
    const bookFilepath = path.resolve(
      __dirname,
      "../../public/data/upload",
      bookFileName
    );
    const bookUploadResult = cloudinary.uploader.upload(bookFilepath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-files",
      format: "pdf",
    });
    console.log("bookUploadResult", bookUploadResult);

    res.json({ message: "hell" });
  } catch (err) {}
};
