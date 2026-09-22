import React from "react";
import bot from "../assets/white-robo.svg";

export const defaultMessages = [];

import ReactMarkdown from 'react-markdown';

const Chatsection = ({ messages = defaultMessages }) => {
  return (
    <section className="w-full flex-1 min-h-0 bg-black/20 px-4 md:px-8 py-6 overflow-x-hidden overflow-y-auto">
      <div className="flex min-h-full flex-col justify-end gap-5 max-w-5xl mx-auto w-full">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex w-full items-end gap-2 md:gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="flex size-8 md:size-10 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-[#7c3aed]">
                  <img className="size-5 md:size-6 " src={bot} alt="Gemini assistant" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[68%] rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm leading-5 md:leading-6 shadow-lg ${
                  isUser
                    ? "rounded-br-md bg-[#7c3aed] text-white shadow-violet-950/30"
                    : "rounded-bl-md border border-[#4c4c4c] bg-[#050505] text-[#dbe4f0]"
                }`}
              >
                {!isUser && (
                  <p className="mb-2 text-xs font-semibold text-[#a78bfa]">
                    ULTRON
                  </p>
                )}
                {isUser ? (
                  <p>{message.text}</p>
                ) : message.text ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  <div className="flex gap-1.5 items-center mt-2 mb-1 py-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex size-8 md:size-10 shrink-0 items-center justify-center rounded-xl md:rounded-2xl border border-[#7c3aed] bg-[#140b22] text-xs md:text-sm font-bold text-white">
                  U
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Chatsection;
