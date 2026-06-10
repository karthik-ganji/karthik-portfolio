export interface SkillCategory {
  category: string;
  skills: string[];
}

export const skillsData: SkillCategory[] = [
  {
    category: "Programming Languages",
    skills: ["Java", "Python", "JavaScript", "TypeScript"]
  },
  {
    category: "Frontend",
    skills: ["HTML", "CSS", "React"]
  },
  {
    category: "Backend",
    skills: ["Node.js", "FastAPI"]
  },
  {
    category: "Databases",
    skills: ["MySQL", "MongoDB"]
  },
  {
    category: "Tools",
    skills: ["Git", "GitHub", "Jenkins", "Linux"]
  }
];
