import { User } from "../user/bookTypes";

export interface Book {
  _id: string;
  title: string;
  auther: User;
  gener: string;
  coverImage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
