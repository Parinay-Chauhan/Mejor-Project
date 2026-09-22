import express from "express";
import {
  clearSessionCookie,
  createSessionToken,
  requirePageAuth,
} from "../auth.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/userController.js";

const router = express.Router();

// ─── API Routes (JSON) ────────────────────────────────────────────────────────

// Register new user → POST /api/v1/users/register
router.post("/api/v1/users/register", registerUser);

// Login → POST /api/v1/users/login
router.post("/api/v1/users/login", loginUser);

// Logout → POST /api/v1/users/logout
router.post("/api/v1/users/logout", logoutUser);

// Get current user → GET /api/v1/users/me
router.get("/api/v1/users/me", getCurrentUser);

// ─── Legacy EJS Routes (for existing frontend redirect flow) ─────────────────

// Redirect root to app or login
router.get("/", (req, res) => {
  if (req.user) {
    const token = createSessionToken(req.user.id || req.user.username);
    res.redirect(`https://mejor-project-sigma.vercel.app/?session_token=${token}`);
  } else {
    res.redirect("/login");
  }
});

// Show login page (EJS)
router.get("/login", (req, res) => {
  if (req.user) {
    const token = createSessionToken(req.user.id || req.user.username);
    res.redirect(`https://mejor-project-sigma.vercel.app/?session_token=${token}`);
    return;
  }
  res.render("login", { error: "", username: "" });
});

// Handle EJS login form submission
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Forward to API login logic but handle EJS redirect
    const { User } = await import("../models/user.model.js");
    const { loginOrCreateUser, setSessionCookie } = await import("../auth.js");

    // Try MongoDB first
    let user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      // Auto-register if user doesn't exist (legacy behavior)
      user = await User.create({
        username: username.trim().toLowerCase(),
        password,
      });
    } else {
      const isValid = await user.isPasswordCorrect(password);
      if (!isValid) {
        return res.status(401).render("login", {
          error: "Invalid username or password",
          username,
        });
      }
    }

    // Save refresh token
    user.refreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    setSessionCookie(res, user.username);
    const token = createSessionToken(user.username);
    res.redirect(`https://mejor-project-sigma.vercel.app/?session_token=${token}`);
  } catch (error) {
    res.status(401).render("login", {
      error: error.message,
      username,
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  clearSessionCookie(res);
  res.redirect("/login");
});

// Legacy app page
router.get("/app", requirePageAuth, (req, res) => {
  res.render("app", { user: req.user });
});

export default router;
