import express from "express";
import globalErrorHandler from "./middlewares/GlobalErrorHandler";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "hello jee swagat hai aap sabhi ka" });
});

// global error handler

app.use(globalErrorHandler);

export default app;
