import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { attachUser } from "./auth.js";
import { apiKey } from "./serverClient.js";

// Routes
import authRouter from "./routes/auth.routes.js";
import chatAgentRouter from "./routes/chatAgent.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup (for legacy EJS login page — will be replaced by React later)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, origin || true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(attachUser);

// Health check
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/health", (req, res) => {
  res.json({
    message: "AI Writing Assistant Server is running",
    apiKey: apiKey,
  });
});

// Routes declaration
app.use("/", authRouter);
app.use("/", chatAgentRouter);

export { app };