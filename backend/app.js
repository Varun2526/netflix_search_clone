import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import contentRoutes from "./routes/content.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// middleware
// Allow the configured production client, local dev ports, and any Vercel
// deployment URL (preview URLs change on every deploy).
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser requests (curl, health checks) which send no origin
    if (!origin) return cb(null, true);
    try {
      const host = new URL(origin).hostname;
      if (allowedOrigins.includes(origin) || host.endsWith(".vercel.app")) {
        return cb(null, true);
      }
    } catch {
      // fall through to rejection
    }
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("API running...");
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;