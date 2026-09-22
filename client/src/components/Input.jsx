import React, { useRef, useState } from "react";

const Input = ({ inputRef, handleSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (inputRef.current) inputRef.current.value += " " + transcript;
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
  };

  return (
    <div className="w-full shrink-0 px-4 md:px-6 pb-5 pt-3 bg-[#09090b] border-t border-[#1f1f23]">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative flex items-center bg-[#111113] border border-[#27272a] rounded-2xl hover:border-[#3f3f46] transition-colors duration-200 focus-within:border-[#7c3aed] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]">

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-[#fafafa] text-sm placeholder-[#52525b] py-3.5 pl-4 pr-2 outline-none rounded-2xl"
          />

          {/* Right actions */}
          <div className="flex items-center gap-1 pr-2">
            {/* Mic */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop recording" : "Voice input"}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isListening
                  ? "text-[#ef4444] bg-[#ef4444]/10"
                  : "text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#1f1f23]"
              }`}
            >
              {isListening ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
              )}
            </button>

            {/* Send */}
            <button
              type="submit"
              title="Send message"
              className="p-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-all duration-200 active:scale-95 shadow-[0_0_8px_rgba(124,58,237,0.3)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#3f3f46] mt-2.5">
          Ultron can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
};

export default Input;