import React, { useState, useEffect } from "react";
import axios from "axios";

const LoginModal = ({ onClose, apiBaseUrl }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username aur password dono required hain.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = mode === "login"
        ? `${apiBaseUrl}/api/v1/users/login`
        : `${apiBaseUrl}/api/v1/users/register`;

      const { data } = await axios.post(endpoint, { username: username.trim(), password });

      // Save session token and reload to switch to logged-in mode
      const token = data.data?.sessionToken || data.data?.accessToken;
      if (token) {
        localStorage.setItem("mejor_session_token", token);
      }

      // Clear old guest session and reload
      sessionStorage.removeItem("chat_session_id");
      window.location.reload();

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl shadow-[#7c3aed]/20 overflow-hidden">

          {/* Top purple glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>

          <div className="p-8 pt-10">
            {/* Icon */}
            <div className="w-14 h-14 bg-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#7c3aed]/40">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2M20 14h2M9 13v2M15 13v2" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-white text-2xl font-bold text-center mb-1">
              {mode === "login" ? "Save Your Chat" : "Create Account"}
            </h2>
            <p className="text-[#888] text-sm text-center mb-7">
              {mode === "login"
                ? "Login to save your chat history."
                : "Create a new account and save your chats."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#ccc] text-sm font-semibold mb-2">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  autoComplete="username"
                  autoFocus
                  className="w-full h-12 bg-[#111] border border-[#333] hover:border-[#555] focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] rounded-xl px-4 text-white text-sm outline-none transition-all placeholder-[#555]"
                />
              </div>

              <div>
                <label className="block text-[#ccc] text-sm font-semibold mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  autoComplete="current-password"
                  className="w-full h-12 bg-[#111] border border-[#333] hover:border-[#555] focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] rounded-xl px-4 text-white text-sm outline-none transition-all placeholder-[#555]"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 mt-2"
              >
                {isLoading
                  ? "Please wait..."
                  : mode === "login" ? "Login & Save Chat" : "Register & Start"}
              </button>
            </form>

            {/* Mode toggle */}
            <p className="text-center text-[#666] text-sm mt-5">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-[#a78bfa] hover:text-[#c4b5fd] font-semibold transition-colors"
              >
                {mode === "login" ? "Register" : "Login"}
              </button>
            </p>

            {/* Guest continue option */}
            <p className="text-center text-[#555] text-xs mt-4">
              <button
                type="button"
                onClick={onClose}
                className="hover:text-[#888] transition-colors underline underline-offset-2"
              >
                Continue as guest (chat won't be saved)
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
