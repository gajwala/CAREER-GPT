const TOOL_META = {
  resume_analyzer: { icon: "📄", label: "Resume Analyzer", color: "#6366f1" },
  interview_coach: { icon: "🎤", label: "Interview Coach", color: "#10b981" },
  job_search_strategist: {
    icon: "🔍",
    label: "Job Search Strategist",
    color: "#f59e0b",
  },
  career_path_planner: {
    icon: "🗺️",
    label: "Career Path Planner",
    color: "#ef4444",
  },
};

export default function ToolCard({ tool }) {
  const meta = TOOL_META[tool.tool] || {
    icon: "🔧",
    label: tool.tool,
    color: "#888",
  };
  return (
    <div
      className="tool-card"
      style={{ borderLeft: `4px solid ${meta.color}` }}
    >
      <div className="tool-card-header">
        <span>{meta.icon}</span>
        <span className="tool-name" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="tool-badge">Tool Used</span>
      </div>
      {tool.input && (
        <div className="tool-input">
          <strong>Input:</strong>{" "}
          {JSON.stringify(tool.input, null, 2).slice(0, 200)}...
        </div>
      )}
    </div>
  );
}
