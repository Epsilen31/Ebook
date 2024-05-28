import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "hello jee swagat hai aap sabhi ka" });
});

export default app;
