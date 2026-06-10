export interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  metric: string; // e.g. "CGPA: 7.8" or "Percentage: 83.88%"
}

export const educationData: EducationItem[] = [
  {
    degree: "Bachelor of Technology",
    field: "Computer Science",
    institution: "Bapatla Engineering College",
    metric: "CGPA: 7.8"
  },
  {
    degree: "Diploma in Computer Engineering",
    field: "Computer Science & Engineering",
    institution: "GVM Polytechnic College",
    metric: "Percentage: 83.88%"
  }
];
