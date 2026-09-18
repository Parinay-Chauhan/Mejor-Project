import React from "react";
import whiterobo from "../assets/white-robo.svg";

const Header = ({ isGuest = false, onLoginClick }) => {

  function handleNewSession() {
    sessionStorage.removeItem('chat_session_id');
    window.location.reload();
  }

  const handleLogout = () => {
    sessionStorage.removeItem('chat_session_id');
    localStorage.removeItem('mejor_session_token');
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://mejor-backend.onrender.com');
    window.location.href = `${API_BASE_URL}/logout`;
  };

  return (
    <div className="w-full border-b border-[#4c4c4c] flex items-center justify-between shrink-0 bg-[#212121]">

      {/* Left — Logo + Title */}
      <div className="flex items-center">
        <div className="p-2 md:p-3 pl-4 md:pl-7">
          <img
            className="p-1.5 md:p-2 bg-[#7c3aed] size-8 md:size-10 rounded-xl md:rounded-2xl"
            src={whiterobo}
            alt="image"
          />
        </div>
        <div className="ml-2">
          <h1 className="text-white pt-1 text-lg leading-7 font-normal font-segoe">New writing session</h1>
          <p className="text-[#757474] text-[10px] md:text-xs font-semibold hidden sm:block">
            {isGuest
              ? "Guest Mode — Chat won't be saved"
              : "Ai writing Assistant : Always improving."}
          </p>
        </div>
      </div>

      {/* Right — Buttons */}
      <div className="btn-con flex items-center gap-3 md:gap-4 mr-4 md:mr-8">

        {/* New Session button (always visible) */}
        <button
          onClick={handleNewSession}
          className="relative inline-flex h-8 md:h-10 overflow-hidden rounded-xl md:rounded-2xl p-[2px] focus:outline-none group transition-transform active:scale-95 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
        >
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4c1d95_0%,#c4b5fd_50%,#4c1d95_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-[10px] md:rounded-[14px] bg-[#0a0b14] px-3 md:px-5 text-[10px] md:text-xs font-extrabold tracking-[2px] md:tracking-[3px] text-white backdrop-blur-3xl transition-colors group-hover:bg-[#111322]">
            NEW SESSION
          </span>
        </button>

        {isGuest ? (
          /* Guest → Show "Login to Save" button */
          <button
            id="header-login-btn"
            onClick={onLoginClick}
            className="relative inline-flex h-8 md:h-10 overflow-hidden rounded-xl md:rounded-2xl p-[2px] focus:outline-none group transition-transform active:scale-95 hover:shadow-[0_0_15px_rgba(124,58,237,0.6)]"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#7c3aed_0%,#c4b5fd_50%,#7c3aed_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-[10px] md:rounded-[14px] bg-[#12082a] px-3 md:px-5 text-[10px] md:text-xs font-extrabold tracking-[2px] md:tracking-[3px] text-[#c4b5fd] backdrop-blur-3xl transition-colors group-hover:bg-[#1a0a3a]">
              💾 SAVE CHAT
            </span>
          </button>
        ) : (
          /* Logged-in → Show Logout button */
          <button
            onClick={handleLogout}
            className="relative inline-flex h-8 md:h-10 overflow-hidden rounded-xl md:rounded-2xl p-[2px] focus:outline-none group transition-transform active:scale-95 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#7f1d1d_0%,#fca5a5_50%,#7f1d1d_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-[10px] md:rounded-[14px] bg-[#0a0b14] px-3 md:px-5 text-[10px] md:text-xs font-extrabold tracking-[2px] md:tracking-[3px] text-white backdrop-blur-3xl transition-colors group-hover:bg-[#1a0f0f]">
              LOGOUT
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
