
import { Routes, Route, Navigate } from 'react-router-dom';
import { CanvasParticles } from './components/CanvasParticles';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { LookingFor } from './sections/LookingFor';
import { About } from './sections/About';
import { Skills } from './sections/Skills';
import { Projects } from './sections/Projects';
import { GithubSection } from './sections/Github';
import { DSA } from './sections/DSA';
import { Achievements } from './sections/Achievements';
import { Experience } from './sections/Experience';
import { Education } from './sections/Education';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';

// Admin imports
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const PublicPortfolio = () => (
  <div className="relative min-h-screen font-sans bg-[#0B0F19] text-[#F8FAFC]">
    {/* Dynamic Background Particles */}
    <CanvasParticles />

    {/* Navigation Menu */}
    <Navbar />

    {/* Public sections */}
    <main className="relative z-10">
      <Hero />
      <LookingFor />
      <About />
      <Skills />
      <Projects />
      <GithubSection />
      <DSA />
      <Achievements />
      <Experience />
      <Education />
      <Contact />
    </main>

    {/* Footer */}
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* Visitor Facing Main Portfolio */}
      <Route path="/" element={<PublicPortfolio />} />

      {/* Admin Login Gate */}
      <Route path="/admin/login" element={<Login />} />

      {/* Secure Console Panel Route */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
