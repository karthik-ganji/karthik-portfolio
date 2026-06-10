export interface AchievementItem {
  title: string;
  description: string;
  category: string;
}

export const achievementsData: AchievementItem[] = [
  {
    title: "3 Internships Completed",
    description: "Gained real-world experience across Data Science, Machine Learning, and Full Stack Web Development internships.",
    category: "Professional Experience"
  },
  {
    title: "B.Tech in Computer Science",
    description: "Graduated with a CGPA of 7.8 from Bapatla Engineering College, specializing in core computer science subjects.",
    category: "Academics"
  },
  {
    title: "Machine Learning Projects",
    description: "Engineered high-accuracy predictive systems (e.g., GeoValuator R² ≈ 0.97) using Python, XGBoost, and Scikit-Learn.",
    category: "Technical Expertise"
  },
  {
    title: "Full Stack Development",
    description: "Built and deployed end-to-end web applications combining React frontends with FastAPI/Node.js backends and MongoDB/MySQL databases.",
    category: "Technical Expertise"
  }
];
