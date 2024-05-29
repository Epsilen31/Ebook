import express from "express";
import globalErrorHandler from "./middlewares/GlobalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "hello jee swagat hai aap sabhi ka" });
});

// Routers
app.use("/api/users", userRouter);

// global error handler
app.use(globalErrorHandler);

export default app;
