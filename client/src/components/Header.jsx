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
    <header className="w-full shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#1f1f23] bg-[#09090b]/95 backdrop-blur-sm">

      {/* Left — Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7c3aed] shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <img className="w-4 h-4" src={whiterobo} alt="Ultron AI" />
        </div>
        <div>
          <span className="text-[#fafafa] text-sm font-semibold tracking-tight">Ultron</span>
          <p className="text-[10px] text-[#52525b] font-medium leading-none mt-0.5 hidden sm:block">
            {isGuest ? "Guest session · history not saved" : "AI Writing Assistant"}
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* New Session */}
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#a1a1aa] bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] hover:text-[#fafafa] hover:bg-[#1f1f23] transition-all duration-200 active:scale-95"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New chat
        </button>

        {isGuest ? (
          /* Guest → Save Chat */
          <button
            id="header-login-btn"
            onClick={onLoginClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white bg-[#7c3aed] hover:bg-[#6d28d9] transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            Save chat
          </button>
        ) : (
          /* Logged-in → Logout */
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#a1a1aa] bg-[#18181b] border border-[#27272a] hover:border-[#ef4444]/40 hover:text-[#ef4444] hover:bg-[#1f1f23] transition-all duration-200 active:scale-95"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
