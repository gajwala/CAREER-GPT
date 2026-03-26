import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import ToolCard from "./components/ToolCard";
import Sidebar from "./components/Sidebar";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STARTERS = [
  {
    label: "📄 Review my resume",
    text: "Can you analyze my resume? I'll paste it below. I'm targeting a Senior Frontend Developer role.\n\n[Paste your resume here]",
  },
  {
    label: "🎤 Interview prep",
    text: "Give me 5 behavioral interview questions for a Product Manager role with STAR answers.",
  },
  {
    label: "🔍 Job search plan",
    text: "I'm a Software Engineer with 3 years of experience looking to become a DevOps Engineer in a remote position. Create a job search strategy for me.",
  },
  {
    label: "🗺️ Career roadmap",
    text: "Map out a 5-year career path from Junior Developer to Engineering Manager. My current skills are: JavaScript, React, Node.js, SQL.",
  },
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm **CareerGPT** — your AI-powered career coach.\n\nI can help you with:\n- 📄 Resume analysis & ATS optimization\n- 🎤 Interview prep & mock Q&A\n- 🔍 Job search strategy & planning\n- 🗺️ Career path & roadmap planning\n\nWhat would you like to work on today?",
      toolsUsed: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg = { role: "user", content: userText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: data.reply || data.error,
          toolsUsed: data.toolsUsed || [],
        },
      ]);
    } catch {
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: "⚠️ Connection error. Make sure the backend is running.",
          toolsUsed: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <Sidebar onSelect={(t) => sendMessage(t)} />
      <div className="chat-area">
        <header className="chat-header">
          <div className="header-left">
            <span className="logo">🎯</span>
            <div>
              <h1>CareerGPT</h1>
              <span className="subtitle">
                AI Career Coach · Powered by LangChain + GPT-4o
              </span>
            </div>
          </div>
          <div className="status-dot" title="Online" />
        </header>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i}>
              <ChatMessage message={m} />
              {m.toolsUsed?.length > 0 && (
                <div className="tool-cards">
                  {m.toolsUsed.map((t, j) => (
                    <ToolCard key={j} tool={t} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="avatar">🎯</div>
              <div className="bubble loading">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="starters">
            {STARTERS.map((s, i) => (
              <button
                key={i}
                className="starter-btn"
                onClick={() => sendMessage(s.text)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="input-bar">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about resume, interviews, job search, or career growth..."
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
}
