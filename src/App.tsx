import { useState, useEffect, useRef } from "react";
import "./index.css";
// Import logo directly
import logoUrl from "./logo.png";

const NAV_SECTIONS = ["home", "about", "projects", "skills", "achievements", "hobbies", "contact"] as const;
type NavSection = (typeof NAV_SECTIONS)[number];

// Import artwork images - All 38 artworks
import alanTuringImg from './assets/artwork/AlanTuring.jpg';
import kalamImg from './assets/artwork/apj-abdul-kalam-15.jpg';
import arijitSinghImg from './assets/artwork/Arijit Singh.jpg';
import armaanMalikImg from './assets/artwork/ARMAAN MALIK.jpg';
import indianFlagBoyImg from './assets/artwork/boy-indian-national-flag-green-grass-43060893.jpg';
import clgImg from './assets/artwork/clg.jpg';
import darshanImg from './assets/artwork/Darshan.jpg';
import dhoniImg from './assets/artwork/DHONI.jpg';
import gopalImg from './assets/artwork/GOPAL.png';
import hanumanImg from './assets/artwork/hanumanji.jpg';
import johanCruyffImg from './assets/artwork/johan-cruyff-footballer-coach-14-august-1994-HN8YNYjpg.jpg';
import maaDurgaImg from './assets/artwork/MAA DURGA.jpg';
import maaJagadhatriImg from './assets/artwork/Maa Jagadhatri.jpg';
import maaKaliJpegImg from './assets/artwork/MAA KALI.jpeg';
import maaKaliPngImg from './assets/artwork/MAA KALI.png';
import maaSaradaImg from './assets/artwork/MAA SARADA.jpg';
import maaaImg from './assets/artwork/Maaa.jpg';
import maaDurga2Img from './assets/artwork/maaDurga.jpg';
import maaKali2Img from './assets/artwork/maaKali.jpg';
import mahadevImg from './assets/artwork/MAHADEV.png';
import messiImg from './assets/artwork/messi.jpg';
import netajiImg from './assets/artwork/NETAJI.jpg';
import netaji2Img from './assets/artwork/NetajiD.jpg';
import pranabMukherjeeImg from './assets/artwork/Pranab Mukherjee.jpg';
import rabiThakurImg from './assets/artwork/Rabi Tthakur.jpg';
import rohitSharmaImg from './assets/artwork/rohit sharma.jpg';
import ronaldoImg from './assets/artwork/Ronaldo.jpg';
import rupamIslamImg from './assets/artwork/RupamIslam.jpg';
import sanamPuriImg from './assets/artwork/sanampuri-ms-paint portrait.jpg';
import satyajitRayImg from './assets/artwork/Satyajit Ray.jpg';
import sharodiyaImg from './assets/artwork/Sharodiya.jpg';
import soumitraChatterjeeImg from './assets/artwork/Soumitra Chatterjee.jpg';
import souravGangulyImg from './assets/artwork/Sourav Ganguly.jpg';
import ssrImg from './assets/artwork/SSR.jpg';
import sumedhImg from './assets/artwork/SUMEDH.jpg';
import vivekanandImg from './assets/artwork/swami vivekanand standing hd photo (2).jpg';
import vidyasagarImg from './assets/artwork/Vidyasagar.jpg';
import viratKohliImg from './assets/artwork/ViratKohli.jpg';
// Animated Background Component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, speed: number, char: string}>>([]);
  const [auroraParticles, setAuroraParticles] = useState<Array<{
    id: number, x: number, y: number, vx: number, vy: number, 
    hue: number, life: number, size: number
  }>>([]);
  
  const codeSnippets = [
    "const developer = 'awesome';",
    "function createMagic() {",
    "  return innovation;",
    "}",
    "npm install success",
    "git commit -m 'dreams'",
    "while(coding) { learn(); }",
    "export default creativity;",
    "async await future() {",
    "console.log('Hello World!');",
    "import React from 'react';",
    "useState('motivated');",
    "useEffect(() => {inspire()});",
    "const skills = ['JS', 'React'];",
    "return <Amazing />;"
  ];

  const matrixChars = ['0010','1010','0101','010101','C','C++','Java','Python','JS','TS','HTML','CSS','Node','React','Vue','AWS','Git'];

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: Math.random() * 0.3 + 0.1,
          char: matrixChars[Math.floor(Math.random() * matrixChars.length)] || '0'
        });
      }
      setParticles(newParticles);
    };

    // Create aurora particles
    const createAuroraParticles = () => {
      const newAuroraParticles = [];
      for (let i = 0; i < 50; i++) {
        newAuroraParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          hue: Math.random() * 60 + 200, // Blue to purple range
          life: Math.random(),
          size: Math.random() * 3 + 1
        });
      }
      setAuroraParticles(newAuroraParticles);
    };

    createParticles();
    createAuroraParticles();
    
    const resizeHandler = () => {
      createParticles();
      createAuroraParticles();
    };
    
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y > window.innerHeight ? -20 : particle.y + particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.3
      })));

      setAuroraParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 0.003,
        // Wrap around screen
        ...(particle.x < 0 && { x: window.innerWidth }),
        ...(particle.x > window.innerWidth && { x: 0 }),
        ...(particle.y < 0 && { y: window.innerHeight }),
        ...(particle.y > window.innerHeight && { y: 0 }),
        // Reset if life depleted
        ...(particle.life <= 0 && {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          life: 1,
          hue: Math.random() * 60 + 200
        })
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Aurora Waves Background */}
      <div className="aurora-waves">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`aurora-wave aurora-wave-${i + 1}`}
            style={{
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Aurora Particles */}
      {auroraParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute aurora-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.life * 0.6,
            background: `radial-gradient(circle, 
              hsla(${particle.hue}, 80%, 60%, ${particle.life * 0.8}) 0%, 
              hsla(${particle.hue + 20}, 70%, 50%, ${particle.life * 0.4}) 30%, 
              transparent 70%)`,
            width: `${particle.size * 30}px`,
            height: `${particle.size * 30}px`,
            borderRadius: '50%',
            filter: 'blur(1px)'
          }}
        />
      ))}

      {/* Floating Aurora Orbs */}
      <div className="aurora-orbs">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aurora-orb"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              '--hue': `${200 + i * 30}deg`
            } as any}
          />
        ))}
      </div>

      {/* Matrix-style falling characters (reduced) */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-green-400 opacity-10 font-mono text-sm animate-pulse"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `translateY(${particle.y}px)`,
            animation: 'matrix-fall 15s linear infinite'
          }}
        >
          {particle.char}
        </div>
      ))}

      {/* Floating code snippets (reduced opacity) */}
      <div className="absolute inset-0 opacity-60">
        {codeSnippets.slice(0, 8).map((snippet, index) => (
          <div
            key={index}
            className="absolute text-blue-300/20 font-mono text-xs rotate-12 select-none animate-float-code"
            style={{
              left: `${(index * 15) % 90}%`,
              top: `${(index * 12) % 80}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${8 + (index % 3)}s`
            }}
          >
            {snippet}
          </div>
        ))}
      </div>

      {/* Geometric shapes (reduced) */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`absolute rounded-full opacity-20 animate-float-shapes ${
              index % 2 === 0 ? 'bg-blue-400' : 'bg-purple-400'
            }`}
            style={{
              left: `${(index * 25) % 100}%`,
              top: `${(index * 30) % 100}%`,
              width: `${40 + (index * 15)}px`,
              height: `${40 + (index * 15)}px`,
              animationDelay: `${index * 1.5}s`,
              animationDuration: `${20 + (index % 5)}s`
            }}
          />
        ))}
      </div>

      {/* Binary rain effect (reduced) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-3">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="absolute top-0 animate-binary-rain font-mono text-green-300 text-xs"
            style={{
              left: `${index * 10}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${12 + (index % 3)}s`
            }}
          >
            {Array.from({length: 15}, (_, i) => (
              <div key={i} className="mb-3">
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Components
const Navigation = ({
  activeSection,
  onNavigate,
}: {
  activeSection: NavSection;
  onNavigate: (sectionId: NavSection) => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    onNavigate(sectionId as NavSection);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#242424]/95 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-lg sm:text-xl font-bold text-white">SHRIOMA PAL</div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`capitalize px-3 py-1 rounded transition-colors ${
                  activeSection === section
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <div className="flex flex-col space-y-2 pt-4">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`capitalize px-3 py-2 rounded text-left transition-colors ${
                    activeSection === section
                      ? "text-blue-400 bg-blue-400/10"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Hero = () => {
  // Fallback logo component
  const LogoFallback = () => (
    <div className="w-48 h-48 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg">
      <svg width="120" height="120" viewBox="0 0 100 100" className="text-white">
        <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2"/>
        <text x="50" y="60" fontSize="24" fontWeight="bold" textAnchor="middle" fill="currentColor">
          LOGO
        </text>
      </svg>
    </div>
  );

  const [logoError, setLogoError] = useState(false);
  
  // Typing animation states
  const titles = [
    "Aspiring Java Developer",
    "Fullstack Developer", 
    "AI/ML Explorer",
    "Cybersecurity Enthusiast"
  ];
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  // Simplified typing animation with interval
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTitle = titles[currentTitleIndex];
      if (!currentTitle) return;
      
      if (isTyping) {
        if (charIndex <= currentTitle.length) {
          setDisplayedText(currentTitle.slice(0, charIndex));
          setCharIndex(prev => prev + 1);
        } else {
          // Finished typing, wait then start erasing
          setTimeout(() => setIsTyping(false), 1500);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(prev => prev - 1);
          setDisplayedText(currentTitle.slice(0, charIndex - 1));
        } else {
          // Finished erasing, move to next title
          setCurrentTitleIndex(prev => (prev + 1) % titles.length);
          setIsTyping(true);
          setCharIndex(0);
        }
      }
    }, isTyping ? 100 : 50);

    return () => clearInterval(interval);
  }, [currentTitleIndex, isTyping, charIndex, titles]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Top/Left side - Logo */}
          <div className="flex justify-center md:justify-start order-1 md:order-1">
            {!logoError ? (
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    console.log('Logo failed to load from:', logoUrl);
                    setLogoError(true);
                  }}
                  onLoad={() => {
                    console.log('Logo loaded successfully from:', logoUrl);
                  }}
                />
              </div>
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg">
                <svg width="140" height="140" viewBox="0 0 100 100" className="text-white">
                  <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2"/>
                  <text x="50" y="60" fontSize="24" fontWeight="bold" textAnchor="middle" fill="currentColor">
                    LOGO
                  </text>
                </svg>
              </div>
            )}
          </div>

          {/* Bottom/Right side - Content */}
          <div className="text-center md:text-left order-2 md:order-2">
            <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight px-2">
              Hello, There!<br />
              Welcome to My World!
            </h1>
            <div className="text-2xl sm:text-2xl md:text-3xl text-gray-300 mb-8 md:mb-10 h-16 sm:h-16 md:h-18 flex items-center justify-center md:justify-start px-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold text-center md:text-left">
                {displayedText}
                <span className={`inline-block w-0.5 h-10 bg-blue-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                  |
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-4 justify-center md:justify-start px-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/My-Resume.pdf?v=20250503"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Resume
                </a>
                <a
                  href="/My-Resume.pdf?v=20250503"
                  download="My-Resume.pdf"
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Resume
                </a>
              </div>
              <button className="px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors text-lg font-medium shadow-lg hover:shadow-xl">
                Get In Touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-16 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">About Me</h2>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              I'm a passionate developer with a love for creating beautiful, functional, and user-friendly applications.
              With expertise in modern web technologies, I enjoy turning complex problems into simple, elegant solutions.
            </p>
            <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              When I'm not coding, you can find me exploring new technologies, contributing to open-source projects,
              or enjoying the great outdoors.
            </p>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Node.js", "Python", "AWS"].map((tech) => (
                <span key={tech} className="px-2 sm:px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs sm:text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4 order-1 md:order-2">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">🚀 Fast Learner</h3>
              <p className="text-sm sm:text-base text-gray-300">Always eager to learn new technologies and stay up-to-date with industry trends.</p>
            </div>
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">🎯 Problem Solver</h3>
              <p className="text-sm sm:text-base text-gray-300">Love tackling complex challenges and finding creative solutions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Projects = () => {
  const [visibleProjects, setVisibleProjects] = useState<boolean[]>([]);
  const projectsRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      title: "🩺MedFlow-OpenEnv",
      description: "A reinforcement learning-based hospital triage simulator that optimizes patient assignment, queue management, and resource allocation. Built with OpenEnv, FastAPI, and Python, featuring trained RL agents evaluated across multiple healthcare scenarios.",
      image: "🏥",
      tech: ["OpenEnv", "Python", "FastAPI", "Reinforcement Learning", "HTMLL" , "CSS"],
      demo: "https://shriom23-medflow-openenv.hf.space/",
      code: "https://github.com/shriom17/MedFlow-OpenEnv"
    },
    {
      title: "🚜 KisanMitra - Smart Agricultural Advisory",
      description: "An innovative all-in-one collaborative platform empowering farmers with live weather alerts, AI-powered soil analysis, crop disease detection, real-time market prices, and expert agricultural guidance.",
      image: "👨‍🌾",
      tech: ["React.js", "Python Flask", "Socket.io", "MongoDB", "AI/ML"],
      demo: "https://agri-guru-pied.vercel.app/",
      code: "https://github.com/shriom17/AgriGuru"
    },
    {
      title: "🧠 MindScape - Mental Health Tracker",
      description: "A revolutionary platform analyzing social media usage patterns to track mental health indicators. Provides personalized wellness recommendations and motivational content from ancient wisdom texts like the Bhagavad Gita.",
      image: "🧠",
      tech: ["React.js", "Python Flask", "Tinny Llama", "MongoDB", "NLP"],
      demo: "https://mind-scape-pi.vercel.app/",
      code: "https://github.com/shriom17/MindScape"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animations with staggered delays
            projects.forEach((_, index) => {
              setTimeout(() => {
                setVisibleProjects(prev => {
                  const newVisible = [...prev];
                  newVisible[index] = true;
                  return newVisible;
                });
              }, index * 200); // 200ms delay between each project
            });
            observer.disconnect(); // Only animate once
          }
        });
      },
      { threshold: 0.1 }
    );

    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">Featured Projects</h2>
        <div ref={projectsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-10">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-gray-700 hover:border-gray-600 ${
                visibleProjects[index] 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-[-100px] opacity-0'
              }`}
              style={{
                transitionDelay: visibleProjects[index] ? '0ms' : `${index * 200}ms`
              }}
            >
              <div className="p-6 sm:p-6 text-center">
                <div className="mb-6 sm:mb-6 h-40 sm:h-36 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-600 hover:border-blue-400 transition-colors duration-300">
                  {(project.image.includes('.jpg') || project.image.includes('.png') || project.image.includes('.jpeg')) ? (
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        console.error('Image failed to load:', project.image);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', project.image);
                      }}
                    />
                  ) : (
                    <div className="text-6xl sm:text-7xl lg:text-8xl transform hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
                      {project.image}
                    </div>
                  )}
                </div>
                <h3 className="text-2xl sm:text-2xl font-bold mb-4 sm:mb-4 text-white">{project.title}</h3>
                <p className="text-base sm:text-base text-gray-300 mb-6 sm:mb-6 leading-relaxed min-h-[5rem] sm:min-h-[5rem]">{project.description}</p>
                <div className="flex flex-wrap gap-3 sm:gap-3 mb-6 sm:mb-6 justify-center">
                  {project.tech.map((tech) => (
                    <span key={tech} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-sm rounded-full font-medium shadow-md hover:shadow-lg transition-shadow">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-6 sm:gap-6 justify-center text-base sm:text-base">
                  <a 
                    href={project.demo} 
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                  <a 
                    href={project.code} 
                    className="flex items-center gap-2 px-5 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Source Code
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Skills = () => {
  const [visibleSkills, setVisibleSkills] = useState<boolean[]>([]);
  const skillsRef = useRef<HTMLDivElement>(null);

  // Technology logos with SVG icons
  const TechLogo = ({ name, children }: { name: string; children: React.ReactNode }) => (
    <div className="group relative">
      <div className="w-16 h-16 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-gray-900 rounded-xl border border-gray-700 hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:bg-gray-700">
        {children}
      </div>
      <span className="absolute -bottom-10 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {name}
      </span>
    </div>
  );

  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        {
          name: "React",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.139s-2.018 3.25-5.535 4.139l-.473.121zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zM16.795 22.677c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.823 6.855l-.133.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zM12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a30.672 30.672 0 0 1 5.033 0l.234.02.134.193a30.086 30.086 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z"/>
            </svg>
          )
        },
        {
          name: "TypeScript",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
            </svg>
          )
        },
        {
          name: "Next.js",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.5429.0445h-.4570l-.0736-.047c-.0275-.0188-.0736-.0623-.1062-.1024l-.0442-.0697.0562-4.2991.0562-4.3057.0842-.0592c.0456-.0343.1168-.0686.1736-.0686.0262 0 .3584.1526.7354.3391 1.0068.5014 1.8909.9252 3.2094 1.5344l.7716.3537 2.2094-2.9618c1.2127-1.6284 2.2015-2.9618 2.2015-2.9618s-.9791-.632-1.5025-.9504c-1.6284-1.0051-2.8284-1.6283-4.1012-2.1247L12.7 1.075c-.2065-.1056-.3776-.1921-.3776-.1921-.0094 0-.0188 1.9071-.0234 4.2457l-.0047 4.2437-.7514-1.1512-.7514-1.1512V5.3475V1.075l.0953-.0592C8.2 .9504 8.2703.9362 8.3846.9362c.1049 0 .2508.0139.3354.0328.0797.0187.1049.0328.1049.0797 0 .0422-.7718 1.2525-1.7145 2.6927l-1.7145 2.6177v3.0409h1.096v-2.6177l1.715-2.6927c.943-1.44 1.715-2.6507 1.715-2.6927 0-.0469.0252-.061.1049-.0797.0846-.0189.2305-.0328.3354-.0328.1143 0 .1846.0234.2508.0797l.0953.0592v4.2717l-.0047-4.2437-.0234-4.2457c0-2.3386-.0094-4.2457-.0188-4.2457 0 0-.171.0865-.3776.1921z"/>
            </svg>
          )
        },
        {
          name: "TailwindCSS",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/>
            </svg>
          )
        },
        {
          name: "Vue.js",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"/>
            </svg>
          )
        },
        {
          name: "HTML/CSS",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Backend", 
      skills: [
        {
          name: "Node.js",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.275-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z"/>
            </svg>
          )
        },
        {
          name: "Java",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/>
            </svg>
          )
        },
        {
          name: "Python",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
            </svg>
          )
        },
        {
          name: "PostgreSQL",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5594,14.7228a.5269.5269,0,0,0-.0563-.2764c-.1947-.6772-.7073-1.4061-1.2344-1.7439a2.3775,2.3775,0,0,0-.8909-.2714,3.0123,3.0123,0,0,0,.2354-.9544c.0049-.0383.0049-.0994.0049-.1377,0-.9389-.0979-1.8777-.3393-2.7661-.4287-1.5943-1.2491-2.8776-2.5851-3.7662C17.5645,4.9532,16.0442,4.4854,14.4317,4.4854h-.0146A12.3965,12.3965,0,0,0,11.709,4.7227a11.6139,11.6139,0,0,0-5.4519,2.6475C4.6132,8.5265,3.7976,10.0479,3.4632,11.7287a11.8543,11.8543,0,0,0-.1321,1.9286c0,.2764.0049.5577.0244.834.0195.2764.0586.5577.1074.834a6.9275,6.9275,0,0,0,.9105,2.8287,4.6946,4.6946,0,0,0,2.4652,2.0115,7.0266,7.0266,0,0,0,1.6875.2764c.5577,0,1.1348-.0683,1.6875-.2764.6406-.2373,1.2393-.6016,1.8018-1.0059.5577.4043,1.1563.7686,1.8018,1.0059.5527.208,1.1298.2764,1.6875.2764a7.0266,7.0266,0,0,0,1.6875-.2764,4.6946,4.6946,0,0,0,2.4652-2.0115,6.9275,6.9275,0,0,0,.9105-2.8287c.0488-.2764.0879-.5577.1074-.834.0195-.2764.0244-.5577.0244-.834A11.8543,11.8543,0,0,0,23.5594,14.7228ZM8.9639,17.6123a6.1806,6.1806,0,0,1-1.24.0928,5.0645,5.0645,0,0,1-1.1935-.1465,3.4.3405,0,0,1-1.7637-1.4258,5.7762,5.7762,0,0,1-.7226-2.2461c-.0488-.208-.0879-.4209-.1025-.6348-.0146-.2139-.0244-.4336-.0244-.6465a10.0893,10.0893,0,0,1,.1123-1.6777c.2861-1.4746.9836-2.7207,2.0654-3.7061A9.6426,9.6426,0,0,1,10.5176,5.91a10.2887,10.2887,0,0,1,2.3555-.2275h.0146a7.7576,7.7576,0,0,1,3.584.8447c1.0479.6836,1.6875,1.8018,2.0166,3.1094.1953.7764.2861,1.5625.2861,2.3486,0,.0488,0,.0928-.0049.1416a2.1934,2.1934,0,0,0-.4727-.0537,3.5454,3.5454,0,0,0-1.9043.5625c-.6836.458-1.23,1.1572-1.6396,1.9531a13.9347,13.9347,0,0,0-.9932,3.0811A15.1518,15.1518,0,0,0,13.5127,19.1c-.0488.5088-.0732,1.0225-.0732,1.5361,0,.2666.0146.5332.0293.7998-.6064.3242-1.2276.4844-1.8408.4844A5.0645,5.0645,0,0,1,8.9639,17.6123Z"/>
            </svg>
          )
        },
        {
          name: "MongoDB",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>
            </svg>
          )
        },
        {
          name: "Redis",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.5 2.661l.54.997-3.233 1.815 3.233 1.815-.54.997L6.5 6.456l-3 1.74L6.5 9.935l3-.54V8.15l3.233-1.815L9.5 4.52v1.245l-3 .54V4.52l3.233-1.815L6.5 1.816V3.85l3-.54V2.065zm6.487 0l.54.997-3.233 1.815 3.233 1.815-.54.997L13 6.456l-3 1.74L13 9.935l3-.54V8.15l3.233-1.815L16 4.52v1.245l-3 .54V4.52l3.233-1.815L13 1.816V3.85l3-.54V2.065zm-13.487 7.32l.54.997-3.233 1.815 3.233 1.815-.54.997L0 12.776l-3 1.74 3 1.74 3-.54v-1.245l3.233-1.815L3 11.84v1.245l-3 .54v-1.245l3.233-1.815L0 8.776V10.81l3-.54V8.025z"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Tools & Others",
      skills: [
        {
          name: "Git",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/>
            </svg>
          )
        },
        {
          name: "Docker",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983 0 1.94-.09 2.844-.267a12.024 12.024 0 003.614-1.707 11.136 11.136 0 002.042-2.611 10.972 10.972 0 001.294-2.156c.836.015 2.084-.36 2.776-1.345.16-.226.284-.473.369-.736l.075-.28-.219-.162z"/>
            </svg>
          )
        },
        {
          name: "AWS",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.070-.215.070-.088 0-.176-.040-.264-.127a2.65 2.65 0 01-.319-.415 6.788 6.788 0 01-.271-.535c-.68.802-1.534 1.203-2.56 1.203-.735 0-1.319-.207-1.751-.623-.433-.415-.648-.968-.648-1.658 0-.735.256-1.327.775-1.774.52-.448 1.212-.67 2.088-.67.288 0 .583.024.895.064.32.048.648.112.991.2v-.656c0-.68-.144-1.151-.424-1.423-.288-.271-.775-.407-1.478-.407-.32 0-.648.040-.99.111-.344.08-.679.183-.99.32-.144.063-.248.103-.320.119-.071.016-.12.024-.151.024-.136 0-.2-.096-.2-.296v-.464c0-.152.024-.264.08-.336.055-.072.152-.144.296-.216.32-.168.703-.305 1.15-.417.449-.111.93-.168 1.447-.168 1.103 0 1.911.248 2.432.744.513.496.775 1.248.775 2.256l-.016 2.976zm-3.537 1.311c.279 0 .567-.048.879-.151.32-.104.602-.271.863-.496.16-.144.279-.304.352-.479.072-.176.112-.383.112-.624v-.296a6.436 6.436 0 00-.775-.151 7.19 7.19 0 00-.8-.048c-.567 0-.99.111-1.279.328-.288.224-.44.536-.44.96 0 .391.096.68.304.88.199.2.487.296.792.296l-.008.001zm6.319 1.631c-.168 0-.279-.032-.336-.088-.056-.064-.104-.176-.151-.344L7.215 5.28c-.048-.168-.072-.279-.072-.336 0-.136.064-.207.2-.207h.8c.175 0 .295.032.343.088.064.064.104.176.151.344l1.751 6.87 1.615-6.87c.04-.168.088-.279.151-.344.064-.056.184-.088.344-.088h.647c.175 0 .295.032.344.088.063.064.111.176.151.344l1.639 6.958 1.8-6.958c.048-.168.104-.279.152-.344.063-.056.183-.088.343-.088h.759c.136 0 .208.064.208.207 0 .04-.008.088-.016.144-.016.056-.04.135-.088.24L14.26 12.546c-.048.168-.104.279-.151.344-.056.056-.176.088-.336.088h-.695c-.175 0-.295-.032-.344-.088-.063-.064-.111-.184-.151-.344L11.047 6.1l-1.543 6.447c-.04.168-.088.279-.151.344-.056.056-.176.088-.344.088h-.695l-.007.001zm10.553.336c-.431 0-.863-.048-1.295-.151-.431-.096-.742-.2-.934-.32-.12-.071-.2-.151-.24-.223-.04-.08-.056-.16-.056-.248v-.48c0-.2.072-.296.208-.296.056 0 .111.016.175.032.056.024.144.056.24.096.335.144.679.248 1.047.312.367.071.727.104 1.094.104.583 0 1.038-.104 1.367-.304.328-.208.488-.496.488-.88 0-.256-.08-.479-.24-.671-.159-.2-.455-.375-.879-.537l-1.259-.399c-.639-.2-1.111-.496-1.423-.886-.312-.391-.464-.838-.464-1.343 0-.383.08-.719.248-1.015.168-.296.392-.543.688-.751.295-.2.639-.368 1.047-.479.415-.111.846-.168 1.295-.168.192 0 .391.016.583.032.2.024.383.056.575.104.175.048.34.104.488.16.151.064.279.127.367.2.112.095.2.183.248.295.048.104.08.215.08.336v.448c0 .2-.072.304-.208.304-.08 0-.2-.032-.359-.104-.535-.239-1.135-.36-1.8-.36-.52 0-.934.088-1.239.272-.304.183-.456.44-.456.774 0 .255.088.471.263.655.176.183.48.359.912.527l1.234.391c.628.2 1.08.479 1.36.846.287.359.424.774.424 1.239 0 .399-.08.751-.24 1.06-.16.32-.384.583-.681.798-.295.224-.647.391-1.062.511-.423.111-.871.168-1.351.168l.016.001z"/>
            </svg>
          )
        },
        {
          name: "Figma",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148z"/>
            </svg>
          )
        },
        {
          name: "Jest",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.251 11.82a3.117 3.117 0 0 0-2.328-3.01L22.911 0H8.104L11.092 8.81a3.116 3.116 0 0 0-2.244 2.988c0 1.245.7 2.328 1.726 2.844-.538 1.677-2.093 2.844-3.96 2.844-2.16 0-4.04-1.735-4.04-3.947 0-.888.307-1.681.792-2.344H0C0 17.311 4.689 22 10.297 22c4.793 0 8.785-3.312 9.861-7.742 1.144-.35 1.976-1.41 1.976-2.69-.028-.682-.26-1.336-.69-1.837zM4.689 11.82c0-4.221 3.497-7.669 7.718-7.669s7.718 3.448 7.718 7.669-3.497 7.669-7.718 7.669-7.718-3.448-7.718-7.669z"/>
            </svg>
          )
        },
        {
          name: "CI/CD",
          logo: (
            <svg className="w-10 h-10 sm:w-8 sm:h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              <path d="M4 6V5a2 2 0 012-2h12a2 2 0 012 2v1h1a1 1 0 011 1v10a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1H3a1 1 0 01-1-1V7a1 1 0 011-1h1zm2-1v14h12V5H6z"/>
            </svg>
          )
        }
      ]
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animations with staggered delays
            const totalSkills = skillCategories.reduce((acc, category) => acc + category.skills.length, 0);
            skillCategories.forEach((category, categoryIndex) => {
              category.skills.forEach((_, skillIndex) => {
                const globalIndex = skillCategories
                  .slice(0, categoryIndex)
                  .reduce((acc, cat) => acc + cat.skills.length, 0) + skillIndex;
                
                setTimeout(() => {
                  setVisibleSkills(prev => {
                    const newVisible = [...prev];
                    newVisible[globalIndex] = true;
                    return newVisible;
                  });
                }, globalIndex * 100); // 100ms delay between each skill
              });
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="py-16 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-4xl font-bold text-center mb-10 sm:mb-12">Skills & Technologies</h2>
        <div ref={skillsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-12">
          {skillCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="text-center">
              <h3 className="text-2xl sm:text-2xl font-semibold mb-6 sm:mb-6 lg:mb-8 text-blue-400">{category.title}</h3>
              <div className="grid grid-cols-3 gap-4 sm:gap-4 lg:gap-6 justify-items-center">
                {category.skills.map((skill, skillIndex) => {
                  const globalIndex = skillCategories
                    .slice(0, categoryIndex)
                    .reduce((acc, cat) => acc + cat.skills.length, 0) + skillIndex;
                  
                  return (
                    <div
                      key={skillIndex}
                      className={`transform transition-all duration-500 ${
                        visibleSkills[globalIndex] 
                          ? 'translate-y-0 opacity-100' 
                          : 'translate-y-8 opacity-0'
                      }`}
                      style={{
                        transitionDelay: visibleSkills[globalIndex] ? '0ms' : `${globalIndex * 100}ms`
                      }}
                    >
                      <TechLogo name={skill.name}>
                        {skill.logo}
                      </TechLogo>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Achievements = () => {
  const [isVisible, setIsVisible] = useState(false);
  const achievementRef = useRef<HTMLDivElement>(null);

  const achievements = [
      {
      title: "Recognized as Intern Of The Month",
      event: "Web Development Internship at Labdox Pvt. Ltd.",
      description: "Recognized as Intern of the Month during my Web Developer Internship for consistent technical contributions across backend development, API development, testing, and debugging.",
      icon: "🎖️",
      year: "2026",
      color: "from-red-400 to-blu-600",
      link: "https://www.linkedin.com/posts/shrioma-pal-8176aa268_honored-and-grateful-to-be-recognized-as-ugcPost-7468297143745859584-He8C/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEGZOhMBdXd1v4QClFCiTtpDkqXxlyqqvAs"
    },
    {
      title: "National Finalist",
      event: "Meta Pytorch OpenEnv Hackathon 2026",
      description: "Selected as Top 2.8%  National Finalist among Seventy thousand participants in one of the most prestigious global hackathons",
      icon: "🏆",
      year: "2026",
      color: "from-blue-400 to-green-600",
      link: "https://www.linkedin.com/posts/shrioma-pal-8176aa268_meta-pytorch-openenv-ugcPost-7468248063216828417--JSE/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEGZOhMBdXd1v4QClFCiTtpDkqXxlyqqvAs"
    },
    {
      title: "National Finalist",
      event: "Infosys Global Hackathon 2025",
      description: "Selected as Top 33 National Finalist among two thousand participants in one of the most prestigious global hackathons",
      icon: "🏆",
      year: "2025",
      color: "from-pink-300 to-orange-800",
      link: "https://www.linkedin.com/posts/shrioma-pal-8176aa268_infosysglobalhackathon2025-techforgood-opportunitymatters-activity-7375095792597917696-Qkrp?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEGZOhMBdXd1v4QClFCiTtpDkqXxlyqqvAs"
    },
    {
      title: "National Finalist",
      event: "Build With Gemini 2025",
      description: "Selected as Top 20 National Finalist among one thousand participants in one of the most prestigious global hackathons",
      icon: "🏆",
      year: "2025",
      color: "from-green-700 to-white-800",
      link: "https://www.linkedin.com/posts/shrioma-pal-8176aa268_rank1-buildwithgemini-hackathon2025-activity-7399324424799215616-eNDj?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEGZOhMBdXd1v4QClFCiTtpDkqXxlyqqvAs"
    },
    {
      title: "Top 200",
      event: "Paranox 2.0 Hackathon By TexaNinjas",
      description: "Recognized as the top 200 participants in Paranox 2.0",
      icon: "🏅",
      year: "2025",
      color: "from-pink-400 to-purple-600",
      link: "https://www.linkedin.com/posts/shrioma-pal-8176aa268_hackathon-innovation-techxninjas-activity-7408863594639134720-48L6?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEGZOhMBdXd1v4QClFCiTtpDkqXxlyqqvAs"
    }

  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (achievementRef.current) {
      observer.observe(achievementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="achievements" className="py-20 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Achievements</h2>
        <div ref={achievementRef} className="space-y-6">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`relative bg-gray-800 rounded-lg p-8 border-l-4 border-yellow-400 shadow-xl transition-all duration-700 ${
                isVisible 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-[-50px] opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 200}ms`
              }}
            >
              <div className="flex items-start gap-6">
                <div className={`text-6xl p-4 rounded-full bg-gradient-to-r ${achievement.color} shadow-lg flex items-center justify-center`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white">{achievement.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                        {achievement.year}
                      </span>
                      {achievement.link && (
                        <a
                          href={achievement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 px-3 py-1 text-sm font-semibold text-blue-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/60 hover:from-blue-500/30 hover:to-cyan-400/30 hover:text-white hover:shadow-md"
                        >
                          check now
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-yellow-400 mb-3">{achievement.event}</h4>
                  <p className="text-gray-300 leading-relaxed">{achievement.description}</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-10">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Hobbies = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState<{title: string, image: string, description: string} | null>(null);
  const hobbiesRef = useRef<HTMLDivElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [loadedArtworkCount, setLoadedArtworkCount] = useState(0);

  // Complete artwork collection - All 38 pieces
  const drawings = [
    {
      title: "Digital Portrait of Messi",
      description: "Digital art portrait of the football legend",
      image: messiImg,
      category: "Sports Art"
    },
    {
      title: "MS Dhoni Cricket Art",
      description: "Captain Cool in action - cricket artwork",
      image: dhoniImg,
      category: "Sports Art"
    },
    {
      title: "Lord Hanuman",
      description: "Spiritual artwork with devotional essence",
      image: hanumanImg,
      category: "Spiritual Art"
    },
    {
      title: "Netaji Subhas Chandra Bose",
      description: "Tribute artwork to the great freedom fighter",
      image: netaji2Img,
      category: "Historical Figures"
    },
    {
      title: "Maa Durga",
      description: "Divine goddess artwork with traditional essence",
      image: maaDurgaImg,
      category: "Spiritual Art"
    },
    {
      title: "Cristiano Ronaldo",
      description: "Football superstar digital portrait",
      image: ronaldoImg,
      category: "Sports Art"
    },
    {
      title: "Swami Vivekananda",
      description: "Portrait of the great spiritual leader",
      image: vivekanandImg,
      category: "Historical Figures"
    },
    {
      title: "APJ Abdul Kalam",
      description: "People's President tribute artwork",
      image: kalamImg,
      category: "Historical Figures"
    },
    {
      title: "Alan Turing",
      description: "Father of computer science and artificial intelligence",
      image: alanTuringImg,
      category: "Historical Figures"
    },
    {
      title: "Arijit Singh",
      description: "Voice of Bollywood - musical legend",
      image: arijitSinghImg,
      category: "Music Artists"
    },
    {
      title: "Armaan Malik",
      description: "Contemporary music sensation",
      image: armaanMalikImg,
      category: "Music Artists"
    },
    {
      title: "Patriotic Spirit",
      description: "Boy with Indian flag representing national pride",
      image: indianFlagBoyImg,
      category: "Patriotic Art"
    },
    {
      title: "College Memories",
      description: "Capturing college life moments",
      image: clgImg,
      category: "Personal Art"
    },
    {
      title: "Darshan",
      description: "Portrait artwork with spiritual essence",
      image: darshanImg,
      category: "Portraits"
    },
    {
      title: "Gopal",
      description: "Divine child Krishna artwork",
      image: gopalImg,
      category: "Spiritual Art"
    },
    {
      title: "Johan Cruyff",
      description: "Football legend and coach tribute",
      image: johanCruyffImg,
      category: "Sports Art"
    },
    {
      title: "Maa Jagadhatri",
      description: "Divine mother goddess artwork",
      image: maaJagadhatriImg,
      category: "Spiritual Art"
    },
    {
      title: "Maa Kali",
      description: "Fierce goddess of time and change",
      image: maaKaliJpegImg,
      category: "Spiritual Art"
    },
    {
      title: "Maa Kali - Divine Power",
      description: "Another interpretation of the divine mother",
      image: maaKaliPngImg,
      category: "Spiritual Art"
    },
    {
      title: "Maa Sarada",
      description: "Holy mother spiritual artwork",
      image: maaSaradaImg,
      category: "Spiritual Art"
    },
    {
      title: "Divine Mother",
      description: "Spiritual essence of motherhood",
      image: maaaImg,
      category: "Spiritual Art"
    },
    {
      title: "Maa Durga - Alternate",
      description: "Another beautiful rendition of goddess Durga",
      image: maaDurga2Img,
      category: "Spiritual Art"
    },
    {
      title: "Maa Kali - Artistic Vision",
      description: "Artistic interpretation of divine power",
      image: maaKali2Img,
      category: "Spiritual Art"
    },
    {
      title: "Mahadev",
      description: "Lord Shiva - the supreme deity",
      image: mahadevImg,
      category: "Spiritual Art"
    },
    {
      title: "Netaji - Freedom Fighter",
      description: "Another tribute to Subhas Chandra Bose",
      image: netajiImg,
      category: "Historical Figures"
    },
    {
      title: "Pranab Mukherjee",
      description: "Former President of India tribute",
      image: pranabMukherjeeImg,
      category: "Historical Figures"
    },
    {
      title: "Rabindranath Tagore",
      description: "Nobel laureate poet and philosopher",
      image: rabiThakurImg,
      category: "Historical Figures"
    },
    {
      title: "Rohit Sharma",
      description: "Cricket captain and batting maestro",
      image: rohitSharmaImg,
      category: "Sports Art"
    },
    {
      title: "Rupam Islam",
      description: "Rock music legend from Bengal",
      image: rupamIslamImg,
      category: "Music Artists"
    },
    {
      title: "Sanam Puri",
      description: "MS Paint portrait of the singer",
      image: sanamPuriImg,
      category: "Music Artists"
    },
    {
      title: "Satyajit Ray",
      description: "Master filmmaker and storyteller",
      image: satyajitRayImg,
      category: "Historical Figures"
    },
    {
      title: "Sharodiya",
      description: "Autumn festival celebration artwork",
      image: sharodiyaImg,
      category: "Cultural Art"
    },
    {
      title: "Soumitra Chatterjee",
      description: "Legendary Bengali actor tribute",
      image: soumitraChatterjeeImg,
      category: "Cultural Icons"
    },
    {
      title: "Sourav Ganguly",
      description: "Captain of Indian cricket team",
      image: souravGangulyImg,
      category: "Sports Art"
    },
    {
      title: "Sushant Singh Rajput",
      description: "Tribute to the talented actor",
      image: ssrImg,
      category: "Cultural Icons"
    },
    {
      title: "Sumedh",
      description: "Portrait artwork with artistic flair",
      image: sumedhImg,
      category: "Portraits"
    },
    {
      title: "Ishwar Chandra Vidyasagar",
      description: "Social reformer and educator tribute",
      image: vidyasagarImg,
      category: "Historical Figures"
    },
    {
      title: "Virat Kohli",
      description: "Cricket superstar and former captain",
      image: viratKohliImg,
      category: "Sports Art"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (hobbiesRef.current) {
      observer.observe(hobbiesRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isSectionVisible) {
      return;
    }

    const batchSize = 6;
    let cancelled = false;
    let timeoutId: number | undefined;

    setLoadedArtworkCount(Math.min(batchSize, drawings.length));

    const loadNextBatch = (nextCount: number) => {
      if (cancelled) {
        return;
      }

      setLoadedArtworkCount(nextCount);

      if (nextCount < drawings.length) {
        timeoutId = window.setTimeout(() => loadNextBatch(Math.min(nextCount + batchSize, drawings.length)), 80);
      }
    };

    timeoutId = window.setTimeout(() => loadNextBatch(Math.min(batchSize * 2, drawings.length)), 80);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isSectionVisible, drawings.length]);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentCard(prev => (prev + 1) % drawings.length);
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, drawings.length]);

  const nextCard = () => {
    setCurrentCard(prev => (prev + 1) % drawings.length);
    setIsAutoPlaying(false);
  };

  const prevCard = () => {
    setCurrentCard(prev => (prev - 1 + drawings.length) % drawings.length);
    setIsAutoPlaying(false);
  };

  const goToCard = (index: number) => {
    setCurrentCard(index);
    setIsAutoPlaying(false);
  };

  const openModal = (drawing: {title: string, image: string, description: string}) => {
    setModalImage(drawing);
    setShowModal(true);
    setIsAutoPlaying(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };

  return (
    <section id="hobbies" ref={hobbiesRef} className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Welcome to My Art Gallery</h2>
          <p className="text-xl text-gray-300">
            When I'm not coding, I express my creativity through drawing and digital art
          </p>
        </div>

        {/* 3D Card Carousel */}
        <div 
          className="relative h-[500px] perspective-1000 flex items-center justify-center"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative w-full h-full preserve-3d">
            {drawings.map((drawing, index) => {
              const isActive = index === currentCard;
              const isPrev = index === (currentCard - 1 + drawings.length) % drawings.length;
              const isNext = index === (currentCard + 1) % drawings.length;
              
              let transformClass = '';
              let zIndex = 0;
              let opacity = 0.3;
              const shouldLoadImage = isSectionVisible && index < loadedArtworkCount;
              
              if (isActive) {
                transformClass = 'translate-x-0 rotate-y-0 scale-110';
                zIndex = 30;
                opacity = 1;
              } else if (isPrev) {
                transformClass = '-translate-x-80 rotate-y-45 scale-90';
                zIndex = 20;
                opacity = 0.7;
              } else if (isNext) {
                transformClass = 'translate-x-80 rotate-y-[-45deg] scale-90';
                zIndex = 20;
                opacity = 0.7;
              } else {
                transformClass = 'translate-x-0 rotate-y-90 scale-75';
                zIndex = 10;
                opacity = 0.1;
              }

              return (
                <div
                  key={index}
                  className={`absolute inset-0 max-w-sm mx-auto transition-all duration-700 ease-in-out transform preserve-3d cursor-pointer ${transformClass}`}
                  style={{ 
                    zIndex,
                    opacity,
                    transform: `${transformClass.replace('rotate-y-', 'rotateY(').replace('rotate-y-[-45deg]', 'rotateY(-45deg)')}`.replace('scale-', ' scale(')
                  }}
                  onClick={() => goToCard(index)}
                >
                  {/* Card */}
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 hover:border-blue-400 transition-all duration-300">
                    {/* Image Container */}
                    <div className="h-64 overflow-hidden relative">
                      {shouldLoadImage ? (
                        <img 
                          src={drawing.image} 
                          alt={drawing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                  <div class="text-white text-center p-6">
                                    <div class="text-6xl mb-4">🎨</div>
                                    <h3 class="text-lg font-semibold mb-2">${drawing.title}</h3>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <div className="text-white text-center p-6">
                            <div className="text-6xl mb-4">🎨</div>
                            <h3 className="text-lg font-semibold mb-2">{drawing.title}</h3>
                          </div>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white truncate">{drawing.title}</h3>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs whitespace-nowrap">
                          {drawing.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {drawing.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => openModal(drawing)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          View Full Size
                        </button>
                        <button className="px-4 py-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 text-sm">
                          ❤️
                        </button>
                      </div>
                    </div>

                    {/* Card number indicator */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {index + 1} / {drawings.length}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevCard}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          >
            ←
          </button>
          <button
            onClick={nextCard}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          >
            →
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {drawings.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentCard 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Auto-play Indicator */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
          >
            {isAutoPlaying ? '⏸️ Pause Auto-Play' : '▶️ Resume Auto-Play'}
          </button>
        </div>

        {/* Art Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{drawings.length}</div>
            <div className="text-gray-300 text-sm">Total Artworks</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-400">4</div>
            <div className="text-gray-300 text-sm">Art Categories</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">2+</div>
            <div className="text-gray-300 text-sm">Years Experience</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">∞</div>
            <div className="text-gray-300 text-sm">Passion Level</div>
          </div>
        </div>
       <div className="flex justify-center py-10">
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="text-2xl font-bold text-blue-400 text-center">
            Art Portfolio By IndiaArt
          </div>

          <div className="text-gray-300 text-sm mt-3 text-center">
            <a 
              href="https://www.indiaart.com/young-art/young-portfolio/28542/shrioma-pal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 px-4 py-2 text-sm font-semibold text-blue-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/60 hover:from-blue-500/30 hover:to-cyan-400/30 hover:text-white hover:shadow-md"
            >
              check now
            </a>
          </div>
        </div>
      </div>
</div>

      {/* Fullscreen Modal */}
      {showModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-60 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row gap-6 max-w-full max-h-full">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={modalImage.image}
                  alt={modalImage.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Image Info */}
              <div className="lg:w-80 flex flex-col justify-center space-y-4 text-white">
                <h3 className="text-3xl font-bold">{modalImage.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {modalImage.description}
                </p>
                <div className="pt-4">
                  <button
                    onClick={closeModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-16 sm:py-20 px-4 bg-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12">Get In Touch</h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
          I'm always interested in new opportunities and collaborations.
          Let's create something amazing together!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <a 
            href="mailto:shriomapal@gmail.com"
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            Email Me
          </a>
          <a 
            href="https://www.linkedin.com/in/shrioma-pal-8176aa268/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 sm:px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/>
            </svg>
            LinkedIn
          </a>
          <a 
            href="https://github.com/shriom17"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 sm:px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
            </svg>
            GitHub
          </a>
        </div>
        
        {/* Additional contact info */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <p className="text-sm sm:text-base text-gray-400 mb-4">
            Feel free to reach out via any of the platforms above
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center items-center text-xs sm:text-sm text-gray-500">
            <span>📧 shriomapal@gmail.com</span>
            <span className="hidden sm:inline">•</span>
            <span>🌍 Available for remote opportunities</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export function App() {
  const [activeSection, setActiveSection] = useState<NavSection>("home");

  useEffect(() => {
    const updateActiveSection = () => {
      const sectionElements = NAV_SECTIONS
        .map((sectionId) => document.getElementById(sectionId))
        .filter((element): element is HTMLElement => Boolean(element));

      if (!sectionElements.length) {
        return;
      }

      const navOffset = 120;
      let currentSection: NavSection = "home";

      for (const sectionElement of sectionElements) {
        const rect = sectionElement.getBoundingClientRect();

        if (rect.top <= navOffset && rect.bottom > navOffset) {
          currentSection = sectionElement.id as NavSection;
          break;
        }

        if (rect.top > navOffset) {
          break;
        }

        currentSection = sectionElement.id as NavSection;
      }

      setActiveSection(currentSection);
    };

    let animationFrameId = 0;

    const handleScroll = () => {
      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        updateActiveSection();
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#242424] text-white relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Achievements />
        <Hobbies />
        <Contact />
      </div>
    </div>
  );
}

export default App;

