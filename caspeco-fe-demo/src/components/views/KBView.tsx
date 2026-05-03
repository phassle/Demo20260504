"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

function MessageContent({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-accent-teal hover:text-accent-teal/80 break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const EXAMPLE_QUESTIONS = [
  "How do I close a daily report in the POS?",
  "How do I add a new product to the catalog?",
  "How do I create a new staff schedule?",
  "How do I export sales data to Excel?",
  "How do I change the price of an existing product?",
  "How do I handle returns and refunds?",
  "How do I set up product categories?",
  "How do I see which products sell the most?",
];

interface KBViewProps {
  initialQuery?: string | null;
  onQueryConsumed?: () => void;
}

export default function KBView({ initialQuery, onQueryConsumed }: KBViewProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consumedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send initial query from voice agent
  useEffect(() => {
    if (initialQuery && initialQuery !== consumedQueryRef.current && !loading) {
      consumedQueryRef.current = initialQuery;
      sendMessage(initialQuery);
      onQueryConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/kb/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't find an answer. Try rephrasing your question." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div id="kb-view" className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-header px-6 py-4">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h1 className="text-white font-display text-lg font-semibold">Knowledge Base</h1>
          <span className="text-white/50 text-sm font-body ml-2">Search manuals and documentation</span>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setInput(""); }}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white text-sm font-body rounded
                hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 mt-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-teal/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-white font-display text-xl font-semibold mb-2">Ask the Knowledge Base</h2>
              <p className="text-text-secondary font-body text-sm">
                Ask questions about Caspeco features, manuals, and documentation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 rounded-lg bg-bg-panel border border-white/10
                    text-text-secondary text-sm font-body hover:text-white hover:border-accent-teal/40
                    hover:bg-accent-teal/5 transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl font-body text-sm whitespace-pre-wrap
                ${msg.role === "user"
                  ? "bg-accent-teal text-white rounded-br-md"
                  : "bg-bg-panel text-white border border-white/10 rounded-bl-md"
                }`}
            >
              <MessageContent text={msg.text} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-bg-panel border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about Caspeco..."
            disabled={loading}
            className="flex-1 bg-bg-panel text-white font-body text-sm px-4 py-3 rounded-xl
              border border-white/10 focus:outline-none focus:border-accent-teal/50
              placeholder:text-text-secondary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-accent-teal text-white font-body text-sm font-medium rounded-xl
              hover:bg-accent-teal/80 transition-colors cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
