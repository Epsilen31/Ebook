import express from "express";
import globalErrorHandler from "./middlewares/GlobalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";
import { config } from "./config/config";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: config.frontendDomain,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "hello jee swagat hai aap sabhi ka" });
});

// Routers
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// global error handler
app.use(globalErrorHandler);

export default app;
