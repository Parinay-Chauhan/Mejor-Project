import React from "react";
import bot from "../assets/bot-stroke-rounded.svg";

const Open = ({inputRef, username, isGuest = false, onLoginClick}) => {

  function handleClick(e){
    inputRef.current.value=e.currentTarget.innerText;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Guest mode mein koi username nahi dikhana — sirf logged-in users ke liye
  const displayUsername = (!isGuest && username)
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : "";

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-8">
      <div className="flex flex-col items-center gap-2 pb-6">
        <img
          className="h-14 w-14 md:h-17 md:w-17 mt-5 p-3 rounded-2xl bg-[#000000]"
          src={bot}
          alt="image"
        />
        <h2 className="text-2xl md:text-4xl font-segoe font-bold text-white mx-auto mt-2 tracking-wide text-center">
          {getGreeting()}{displayUsername ? `, ${displayUsername}` : ""}
        </h2>
        <p className="text-white font-normal text-center text-base leading-6 font-segoe mt-2">
          From first draft to final edit, i'm here to help you write better,
          faster.
        </p>

        {/* Guest mode banner */}
        {isGuest && (
          <button
            onClick={onLoginClick}
            className="mt-4 flex items-center gap-2 bg-[#1a0a2e] border border-[#7c3aed]/40 hover:border-[#7c3aed] text-[#c4b5fd] text-xs px-5 py-2.5 rounded-full transition-all hover:bg-[#220d3e] hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] active:scale-95"
          >
            <span>💾</span>
            <span>Login to save your chat history</span>
            <span className="text-[#7c3aed] font-bold">→</span>
          </button>
        )}
        <h2 className="text-lg md:text-xl mt-6 md:mt-10 font-bold text-white mx-auto text-center font-segoe">
          What would you like to write today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-10 text-white p-2 w-full max-w-4xl">
          <button onClick={handleClick} className="py-4 md:py-6 px-6 md:px-10 bg-[#212121] rounded-2xl text-xs md:text-sm cursor-pointer border border-transparent hover:border-violet-600 hover:bg-[#0a0b14] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(124,58,237,0.2)] active:scale-95 active:bg-violet-900/30 transition-all duration-300">
            Write a professional email to my boss about a project update
          </button>

          <button onClick={handleClick} className="py-4 md:py-6 px-6 md:px-10 bg-[#212121] rounded-2xl text-xs md:text-sm cursor-pointer border border-transparent hover:border-violet-600 hover:bg-[#0a0b14] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(124,58,237,0.2)] active:scale-95 active:bg-violet-900/30 transition-all duration-300">
            Draft a compelling LinkedIn post about a recent achievement
          </button>

          <button onClick={handleClick} className="py-4 md:py-6 px-6 md:px-10 bg-[#212121] rounded-2xl text-xs md:text-sm cursor-pointer border border-transparent hover:border-violet-600 hover:bg-[#0a0b14] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(124,58,237,0.2)] active:scale-95 active:bg-violet-900/30 transition-all duration-300">
            Create an executive summary for a quarterly business report
          </button>

          <button onClick={handleClick} className="py-4 md:py-6 px-6 md:px-10 bg-[#212121] rounded-2xl text-xs md:text-sm cursor-pointer border border-transparent hover:border-violet-600 hover:bg-[#0a0b14] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(124,58,237,0.2)] active:scale-95 active:bg-violet-900/30 transition-all duration-300">
            Write a persuasive proposal for a new marketing campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default Open;
