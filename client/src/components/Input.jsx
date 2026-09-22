import React, { useRef, useState } from "react";
import Search from "../assets/search.svg";
import Mic from "../assets/mic.svg";
import Stop from "../assets/stop.svg";

const Input = ({ inputRef, handleSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      if (inputRef.current) {
        inputRef.current.value += " " + transcript;
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full h-20 md:h-24 border-t flex items-center justify-center border-[#4c4c4c] px-4 md:px-8 shrink-0 bg-black/20"
      >
        <div className="relative w-full max-w-5xl mx-auto h-[65%] flex items-center">
          <input
            placeholder="How can I help you? Write your question here."
            className="bg-[#212121] w-full border-2 border-white hover:border-[#7c3aed] h-full text-white text-sm md:text-base py-3 md:py-5 pl-4 md:pl-5 pr-[110px] md:pr-[120px] rounded-4xl outline-none"
            type="text"
            ref={inputRef}
          />

          <div className="absolute right-3 flex items-center gap-1">
            {/* Mic / Stop Button */}
            {isListening ? (
              <button
                type="button"
                onClick={stopListening}
                className="flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-white/10 transition"
              >
                <img className="w-6" src={Stop} alt="stop button" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-white/10 transition"
              >
                <img className="w-6" src={Mic} alt="mic button" />
              </button>
            )}

            <button
              type="submit"
              className="flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-white/10 transition"
            >
              <img className="w-7" src={Search} alt="search button" />
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Input;