export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

export const experienceData: ExperienceItem[] = [
  {
    role: "Data Science Intern",
    company: "SkillDzire",
    period: "Dec 2025 – Mar 2026",
    description: "Worked on customer analytics, predictive modeling, machine learning pipelines, and business intelligence solutions to extract actionable insights."
  },
  {
    role: "Machine Learning Intern",
    company: "SkillDzire",
    period: "Jun 2025 – Jul 2025",
    description: "Developed machine learning models, preprocessing pipelines, and evaluation workflows for classification and regression tasks."
  },
  {
    role: "Full Stack Web Development Intern",
    company: "Innovative Intern",
    period: "May 2024 – Jul 2024",
    description: "Built responsive web applications and interactive front-end user interfaces using HTML, CSS, JavaScript, and React."
  }
];
