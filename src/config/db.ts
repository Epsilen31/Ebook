import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to database successfully");
    });

    mongoose.connection.on("error", (error) => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });

    await mongoose.connect(config.databaseURL as string);
  } catch (error) {
    console.error("failed to connect database", error);
    process.exit(1);
  }
};

export default connectDB;
