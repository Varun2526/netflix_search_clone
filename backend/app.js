import express from "express";

const app = express();

// middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;