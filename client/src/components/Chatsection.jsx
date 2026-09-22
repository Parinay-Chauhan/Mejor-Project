import React from "react";
import bot from "../assets/white-robo.svg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const defaultMessages = [];

// Custom markdown components — ChatGPT/Claude style
const markdownComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-5 mb-3 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-white mt-4 mb-2 leading-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-[#e2e8f0] mt-3 mb-2">{children}</h3>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-[#dbe4f0] leading-7 mb-3 last:mb-0">{children}</p>
  ),

  // Bold & Italic
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-[#c4b5fd]">{children}</em>
  ),

  // Unordered list
  ul: ({ children }) => (
    <ul className="my-3 ml-2 space-y-1.5">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="my-3 ml-2 space-y-1.5 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2 text-[#dbe4f0] leading-6">
      <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
      <span>{children}</span>
    </li>
  ),

  // Horizontal rule
  hr: () => <hr className="my-4 border-[#333]" />,

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#7c3aed] pl-4 my-3 text-[#94a3b8] italic">
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-[#1e1e2e] text-[#c4b5fd] px-1.5 py-0.5 rounded text-[0.8em] font-mono">
        {children}
      </code>
    ) : (
      <pre className="bg-[#0d0d14] border border-[#2d2d3a] rounded-xl p-4 my-3 overflow-x-auto">
        <code className="text-[#e2e8f0] text-xs font-mono leading-6">{children}</code>
      </pre>
    ),

  // Tables (GFM)
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[#1a1a2e]">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-[#2d2d3a] px-3 py-2 text-left text-[#a78bfa] font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[#2d2d3a] px-3 py-2 text-[#dbe4f0]">{children}</td>
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#a78bfa] underline underline-offset-2 hover:text-[#c4b5fd] transition-colors"
    >
      {children}
    </a>
  ),
};

const Chatsection = ({ messages = defaultMessages }) => {
  return (
    <section className="w-full flex-1 min-h-0 bg-black/20 px-4 md:px-8 py-6 overflow-x-hidden overflow-y-auto">
      <div className="flex min-h-full flex-col justify-end gap-5 max-w-3xl mx-auto w-full">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex w-full items-end gap-2 md:gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* AI avatar */}
              {!isUser && (
                <div className="flex size-8 md:size-9 shrink-0 items-center justify-center rounded-xl bg-[#7c3aed] self-start mt-1">
                  <img className="size-5 md:size-5" src={bot} alt="AI assistant" />
                </div>
              )}

              <div
                className={`max-w-[88%] md:max-w-[72%] rounded-2xl px-4 md:px-5 py-3 md:py-4 shadow-lg ${
                  isUser
                    ? "rounded-br-md bg-[#7c3aed] text-white text-sm leading-6"
                    : "rounded-bl-md border border-[#2d2d3a] bg-[#0a0a10] text-sm"
                }`}
              >
                {/* AI label */}
                {!isUser && (
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-[#7c3aed] uppercase">
                    Ultron
                  </p>
                )}

                {/* Message content */}
                {isUser ? (
                  <p className="text-sm leading-6">{message.text}</p>
                ) : message.text ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.text}
                  </ReactMarkdown>
                ) : (
                  // Loading dots
                  <div className="flex gap-1.5 items-center py-1">
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>

              {/* User avatar */}
              {isUser && (
                <div className="flex size-8 md:size-9 shrink-0 items-center justify-center rounded-xl border border-[#7c3aed] bg-[#140b22] text-xs font-bold text-white self-end">
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
