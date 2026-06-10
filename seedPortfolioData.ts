import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Import local data sources dynamically
import { projectsData } from './src/data/projects';
import { skillsData } from './src/data/skills';
import { experienceData } from './src/data/experience';
import { educationData } from './src/data/education';
import { achievementsData } from './src/data/achievements';

// 1. Read and parse .env configuration
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found at " + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    if (value.length > 0 && value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_SERVICE_ROLE_KEY'];
const supabaseKey = serviceRoleKey || env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
  console.error("Error: Supabase environment variables are missing or contain placeholder values inside .env");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.warn("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY is not defined in .env. Using anonymous key instead.");
  console.warn("If you encounter Row Level Security (RLS) write violations, please add your project's service_role key as SUPABASE_SERVICE_ROLE_KEY in your .env file.\n");
} else {
  console.log("Using service_role key to bypass Row Level Security.");
}

console.log("Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Map and format data from local sources to match database schemas
const formattedProjects = projectsData.map((proj, index) => ({
  title: proj.title,
  description: proj.description,
  github_url: proj.github,
  live_demo_url: proj.liveDemo || null,
  image_url: proj.image,
  technologies: proj.technologies,
  metrics: proj.metrics,
  display_order: index + 1,
  is_featured: index === 0 // Make the first project featured by default
}));

// Flatten skills category structure
const formattedSkills: Array<{ name: string; category: string; display_order: number }> = [];
let skillIndex = 1;
skillsData.forEach(cat => {
  cat.skills.forEach(skillName => {
    formattedSkills.push({
      name: skillName,
      category: cat.category,
      display_order: skillIndex++
    });
  });
});

const formattedExperience = experienceData.map((exp, index) => ({
  role: exp.role,
  company: exp.company,
  duration: exp.period,
  description: exp.description,
  display_order: index + 1
}));

const formattedEducation = educationData.map((edu, index) => ({
  degree: edu.degree,
  field: edu.field,
  institution: edu.institution,
  metric: edu.metric,
  display_order: index + 1
}));

const formattedAchievements = achievementsData.map((ach, index) => ({
  title: ach.title,
  description: ach.description,
  category: ach.category,
  display_order: index + 1
}));

// Helper stats trackers
const report = {
  projects: { inserted: 0, skipped: 0, errors: [] as string[] },
  skills: { inserted: 0, skipped: 0, errors: [] as string[] },
  experience: { inserted: 0, skipped: 0, errors: [] as string[] },
  education: { inserted: 0, skipped: 0, errors: [] as string[] },
  achievements: { inserted: 0, skipped: 0, errors: [] as string[] }
};

async function seedData() {
  console.log("\nStarting portfolio database seeding process...");

  // A. Seed Projects
  console.log("\nSeeding projects table...");
  for (const proj of formattedProjects) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('title', proj.title);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        report.projects.skipped++;
      } else {
        const { error: insertErr } = await supabase
          .from('projects')
          .insert([proj]);
        if (insertErr) throw insertErr;
        report.projects.inserted++;
      }
    } catch (err: any) {
      console.error(`Error seeding project "${proj.title}":`, err);
      report.projects.errors.push(err.message || String(err));
    }
  }

  // B. Seed Skills
  console.log("Seeding skills table...");
  for (const skill of formattedSkills) {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skill.name)
        .eq('category', skill.category);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        report.skills.skipped++;
      } else {
        const { error: insertErr } = await supabase
          .from('skills')
          .insert([skill]);
        if (insertErr) throw insertErr;
        report.skills.inserted++;
      }
    } catch (err: any) {
      console.error(`Error seeding skill "${skill.name}":`, err);
      report.skills.errors.push(err.message || String(err));
    }
  }

  // C. Seed Experience
  console.log("Seeding experience table...");
  for (const exp of formattedExperience) {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('id')
        .eq('company', exp.company)
        .eq('role', exp.role);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        report.experience.skipped++;
      } else {
        const { error: insertErr } = await supabase
          .from('experience')
          .insert([exp]);
        if (insertErr) throw insertErr;
        report.experience.inserted++;
      }
    } catch (err: any) {
      console.error(`Error seeding experience "${exp.role} at ${exp.company}":`, err);
      report.experience.errors.push(err.message || String(err));
    }
  }

  // D. Seed Education
  console.log("Seeding education table...");
  for (const edu of formattedEducation) {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('id')
        .eq('degree', edu.degree)
        .eq('institution', edu.institution);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        report.education.skipped++;
      } else {
        const { error: insertErr } = await supabase
          .from('education')
          .insert([edu]);
        if (insertErr) throw insertErr;
        report.education.inserted++;
      }
    } catch (err: any) {
      console.error(`Error seeding education "${edu.degree}":`, err);
      report.education.errors.push(err.message || String(err));
    }
  }

  // E. Seed Achievements
  console.log("Seeding achievements table...");
  for (const ach of formattedAchievements) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('id')
        .eq('title', ach.title);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        report.achievements.skipped++;
      } else {
        const { error: insertErr } = await supabase
          .from('achievements')
          .insert([ach]);
        if (insertErr) throw insertErr;
        report.achievements.inserted++;
      }
    } catch (err: any) {
      console.error(`Error seeding achievement "${ach.title}":`, err);
      report.achievements.errors.push(err.message || String(err));
    }
  }

  // 4. Output final migration report
  console.log("\n==============================================");
  console.log("PORTFOLIO DATABASE SEED MIGRATION COMPLETE");
  console.log("==============================================");
  console.log(`Projects:     Inserted: ${report.projects.inserted} | Skipped: ${report.projects.skipped} | Errors: ${report.projects.errors.length}`);
  console.log(`Skills:       Inserted: ${report.skills.inserted} | Skipped: ${report.skills.skipped} | Errors: ${report.skills.errors.length}`);
  console.log(`Experience:   Inserted: ${report.experience.inserted} | Skipped: ${report.experience.skipped} | Errors: ${report.experience.errors.length}`);
  console.log(`Education:    Inserted: ${report.education.inserted} | Skipped: ${report.education.skipped} | Errors: ${report.education.errors.length}`);
  console.log(`Achievements: Inserted: ${report.achievements.inserted} | Skipped: ${report.achievements.skipped} | Errors: ${report.achievements.errors.length}`);
  console.log("==============================================\n");

  const totalErrors = 
    report.projects.errors.length + 
    report.skills.errors.length + 
    report.experience.errors.length + 
    report.education.errors.length + 
    report.achievements.errors.length;

  if (totalErrors > 0) {
    console.log("⚠️ Migration completed with errors. Please check error logs above.");
  } else {
    console.log("🚀 Seeding completed successfully! All data is now available in your live portfolio.");
  }
}

seedData();
