const EXAMPLES = [
  {
    section: "📄 Resume",
    items: [
      "Analyze my resume for a Data Scientist role",
      "What ATS keywords am I missing for a PM role?",
      "How do I make my resume stand out?",
    ],
  },
  {
    section: "🎤 Interview",
    items: [
      "5 technical questions for a Backend Engineer",
      "Evaluate my answer to 'Tell me about yourself'",
      "Give me situational questions for a Team Lead",
    ],
  },
  {
    section: "🔍 Job Search",
    items: [
      "Job search plan: Designer → UX Lead",
      "Best platforms for remote engineering jobs",
      "How to network on LinkedIn effectively",
    ],
  },
  {
    section: "🗺️ Career",
    items: [
      "Roadmap: Junior Dev → Senior Engineer in 3 years",
      "Certifications to become a Cloud Architect",
      "How to transition from engineering to product",
    ],
  },
];

export default function Sidebar({ onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="logo">🎯</span>
        <span>CareerGPT</span>
      </div>
      <div className="sidebar-label">Quick Prompts</div>
      {EXAMPLES.map((g) => (
        <div key={g.section} className="sidebar-group">
          <div className="sidebar-section">{g.section}</div>
          {g.items.map((item) => (
            <button
              key={item}
              className="sidebar-item"
              onClick={() => onSelect(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
