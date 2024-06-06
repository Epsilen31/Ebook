import { User } from "../user/bookTypes";

export interface Book {
  _id: string;
  title: string;
  author: User;
  genre: string;
  description: string;
  coverImage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
