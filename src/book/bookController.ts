import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import { promises as fs } from "fs"; // for potential file cleanup
import { AuthRequest } from "../middlewares/authenticate";
import createHttpError from "http-errors";

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

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user data
    const { title, gener } = req.body;
    let bookId = req.params.id.trim();

    // Validation
    if (!title || !gener) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }

    // Check if book exists
    const book = await bookModel.findById(bookId);
    if (!book) {
      const error = createHttpError(404, "Book not found");
      return next(error);
    }

    // Check if book belongs to user
    const _req = req as AuthRequest;
    if (book.auther.toString() !== _req.userId) {
      const error = createHttpError(401, "Unauthorized");
      return next(error);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let coverImageUrl = book.coverImage;
    let fileUrl = book.file;

    if (files) {
      if (files.coverImage) {
        const coverImageFile = files.coverImage[0];
        const coverImageMimeType = coverImageFile.mimetype.split("/").at(-1);
        const coverImagePath = path.resolve(
          __dirname,
          "../../public/data/upload",
          coverImageFile.filename
        );

        // Upload cover image
        const uploadResult = await cloudinary.uploader.upload(coverImagePath, {
          filename_override: coverImageFile.filename,
          folder: "book-files",
          format: coverImageMimeType,
        });

        coverImageUrl = uploadResult.secure_url;

        // Clean up local files (optional)
        await fs.unlink(coverImagePath);
      }

      if (files.file) {
        const bookFile = files.file[0];
        const bookFilePath = path.resolve(
          __dirname,
          "../../public/data/upload",
          bookFile.filename
        );

        // Upload book file
        const bookUploadResult = await cloudinary.uploader.upload(
          bookFilePath,
          {
            resource_type: "raw",
            filename_override: bookFile.filename,
            folder: "book-pdf",
            format: "pdf",
          }
        );

        fileUrl = bookUploadResult.secure_url;

        // Clean up local files (optional)
        await fs.unlink(bookFilePath);
      }
    }

    // Update book
    const updatedBook = await bookModel.findByIdAndUpdate(
      bookId,
      {
        title,
        gener,
        coverImage: coverImageUrl,
        file: fileUrl,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Book updated successfully", book: updatedBook });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the book" });
  }
};

export const getAllBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ! todo -> add pagination
    const books = await bookModel.find();
    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (err) {
    console.error(err);
    return next(
      createHttpError(500, "An error occurred while fetching the books")
    );
  }
};

export const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.id.trim();
    const book = await bookModel.findById(bookId);
    if (!book) {
      const error = createHttpError(404, "Book not found");
      return next(error);
    }
    res.status(200).json({ message: "Book fetched successfully", book });
  } catch (err) {
    console.error(err);
    return next(
      createHttpError(500, "An error occurred while fetching the book")
    );
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.id.trim();
    const book = await bookModel.findById(bookId);
    if (!book) {
      const error = createHttpError(404, "Book not found");
      return next(error);
    }
    // Check if book belongs to user
    const _req = req as AuthRequest;
    if (book.auther.toString() !== _req.userId) {
      const error = createHttpError(401, "Unauthorized");
      return next(error);
    }

    const coverFileSplit = book.coverImage.split("/");
    const coverImageSplitId =
      coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split(".").at(-2);
    console.log("coverImageSplitId", coverImageSplitId);

    const fileSplit = book.file.split("/");
    const fileSplitId = fileSplit.at(-2) + "/" + fileSplit.at(-1);
    console.log("fileSplitId", fileSplitId);

    // Delete cover image and book file from cloudinary
    await cloudinary.uploader.destroy(coverImageSplitId);
    await cloudinary.uploader.destroy(fileSplitId, {
      resource_type: "raw",
    });

    await bookModel.findByIdAndDelete(bookId);
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    return next(
      createHttpError(500, "An error occurred while deleting the book")
    );
  }
};
