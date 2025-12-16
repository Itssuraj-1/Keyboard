import express from "express";
import cors from "cors";

import "dotenv/config";

// DB & middleware
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

// Connect DB
connectDB();

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server
      if (!origin) return callback(null, true);

      // Allow all temporarily OR exact frontend URL later
      if (process.env.CLIENT_URL === "*" || origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blog Management API",
    version: "1.0.0",
    routes: {
      auth: "/api/auth",
      blogs: "/api/blogs",
      health: "/api/health",
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
