// Mock diagram data — replaces real API response during development
// Remove this when Claude API credits are available

export const mockDiagram = {
  topic: "French Revolution",
  nodes: [
    { id: "root", label: "French Revolution", sublabel: "1789–1799", level: 1 },
    { id: "causes", label: "Causes", sublabel: "social & financial", level: 2 },
    { id: "phases", label: "Key Phases", sublabel: "timeline events", level: 2 },
    { id: "inequality", label: "Social Inequality", sublabel: "three estates", level: 3 },
    { id: "bankruptcy", label: "State Bankruptcy", sublabel: "debt crisis", level: 3 },
    { id: "bastille", label: "Bastille Storming", sublabel: "July 1789", level: 3 },
    { id: "terror", label: "The Terror", sublabel: "Robespierre 1793", level: 3 }
  ],
  edges: [
    { source: "root", target: "causes" },
    { source: "root", target: "phases" },
    { source: "causes", target: "inequality" },
    { source: "causes", target: "bankruptcy" },
    { source: "phases", target: "bastille" },
    { source: "phases", target: "terror" }
  ],
  questions: {
    root: [
      "What were the main causes of the French Revolution?",
      "Why was 1789 a turning point in European history?",
      "What changed in France after the Revolution?"
    ],
    causes: [
      "How did social inequality contribute to the Revolution?",
      "What was France's financial situation before 1789?",
      "What role did Enlightenment ideas play?"
    ],
    phases: [
      "What happened when the Bastille was stormed?",
      "What was the Reign of Terror?",
      "How did the Revolution end?"
    ]
  },
  peek_answers: {
    root: "The French Revolution was a period of radical political and social transformation in France. It ended the monarchy and established republican principles based on liberty, equality and fraternity.",
    causes: "Main causes included extreme social inequality between the three estates, state bankruptcy from wars, and Enlightenment ideas questioning royal authority.",
    phases: "Key phases included the storming of the Bastille in 1789, the constitutional monarchy, the radical Reign of Terror under Robespierre, and finally Napoleon's rise to power."
  },
  boss: {
    name: "Anxious Dragon of History",
    hp_max: 70,
    final_question: "Explain the French Revolution completely — from its root causes to its consequences for Europe.",
    required_concepts: ["social inequality", "state bankruptcy", "Bastille", "Reign of Terror", "Napoleon", "Enlightenment"]
  }
};