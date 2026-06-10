export interface Project {
  title: string;
  description: string;
  github: string;
  liveDemo?: string;
  image: string;
  technologies: string[];
  metrics: string[];
}

export const projectsData: Project[] = [
  {
    title: "GeoValuator – Geospatial Land Valuation & Risk Analysis System",
    description: "Developed an end-to-end geospatial analytics platform integrating machine learning, GIS mapping, and infrastructure data to predict land values and identify environmental/structural risk profiles.",
    github: "https://github.com/karthik-ganji/GeoValuator",
    liveDemo: "https://geovaluator.vercel.app",
    image: "geovaluator",
    technologies: ["Python", "XGBoost", "React", "Node.js", "FastAPI", "MongoDB"],
    metrics: ["R² Score ≈ 0.97", "GIS Integration", "Risk Assessment Engine", "Full Stack Deployment"]
  },
  {
    title: "E-Commerce Customer Analytics & Segmentation",
    description: "Performed customer segmentation and purchasing behavior analysis using machine learning techniques to help retail businesses optimize target marketing campaigns.",
    github: "https://github.com/karthik-ganji/ecommerce-customer-analytics",
    image: "customer-analytics",
    technologies: ["Python", "Pandas", "Scikit-Learn", "Machine Learning"],
    metrics: ["K-Means Clustering", "Customer Segmentation", "Predictive Modeling", "Regression Evaluation"]
  },
  {
    title: "Heart Disease Prediction System",
    description: "Built and compared multiple classification models to predict clinical heart disease risks, evaluating performance to select the optimal model for healthcare deployment.",
    github: "https://github.com/karthik-ganji/heart-disease-prediction",
    image: "heart-disease",
    technologies: ["Python", "Scikit-Learn", "Machine Learning"],
    metrics: ["85% Accuracy", "4 Models Compared", "ROC-AUC Evaluation", "Clinical Dataset Analysis"]
  }
];
