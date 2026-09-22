import React from "react";

const prompts = [
  { icon: "✉️", text: "Write a professional email to my manager about a project update" },
  { icon: "💼", text: "Draft a compelling LinkedIn post about a recent achievement" },
  { icon: "📊", text: "Create an executive summary for a quarterly business report" },
  { icon: "🎯", text: "Write a persuasive proposal for a new marketing campaign" },
];

const Open = ({ inputRef, username, isGuest = false, onLoginClick }) => {

  function handleClick(e) {
    const text = e.currentTarget.querySelector("span.prompt-text")?.textContent;
    if (text && inputRef.current) {
      inputRef.current.value = text;
      inputRef.current.focus();
    }
  }

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = (!isGuest && username)
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : null;

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col items-center justify-center min-h-full px-4 md:px-6 py-10 fade-up">

        {/* Logo mark */}
        <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.35)] mb-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        {/* Greeting */}
        <h1 className="text-2xl md:text-3xl font-semibold text-[#fafafa] tracking-tight text-center">
          {getGreeting()}{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-[#71717a] text-sm mt-2 text-center max-w-sm leading-relaxed">
          Your AI writing assistant. From first draft to final edit — faster.
        </p>

        {/* Guest banner */}
        {isGuest && (
          <button
            onClick={onLoginClick}
            className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full border border-[#7c3aed]/30 bg-[#13092a] text-[#a78bfa] text-xs font-medium hover:border-[#7c3aed]/60 hover:bg-[#1a0d38] transition-all duration-200 active:scale-95"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            Sign in to save your conversation
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}

        {/* Suggestion label */}
        <p className="text-[#52525b] text-xs font-medium uppercase tracking-widest mt-10 mb-4">
          Suggestions
        </p>

        {/* Prompt cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={handleClick}
              className="group text-left flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#111113] border border-[#1f1f23] hover:border-[#7c3aed]/40 hover:bg-[#18181b] transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <span className="text-base shrink-0 mt-0.5">{p.icon}</span>
              <span className="prompt-text text-[#a1a1aa] text-xs leading-relaxed group-hover:text-[#fafafa] transition-colors duration-200">
                {p.text}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Open;
