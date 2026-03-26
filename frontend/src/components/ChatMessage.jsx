import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`message ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="avatar">🎯</div>}
      <div className="bubble">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
      {isUser && <div className="avatar user-avatar">👤</div>}
    </div>
  );
}
