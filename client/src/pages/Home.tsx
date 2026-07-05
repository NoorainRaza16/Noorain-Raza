import { useEffect, useState, Suspense } from "react";
import { useLocation } from "wouter";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import EducationSection from "@/components/EducationSection";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import CertificationsSection from "@/components/CertificationsSection";
import BlogSection from "@/components/BlogSection";
import ContactSection from "@/components/ContactSection";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { IntersectionObserver } from "@/components/ui/intersection-observer";

const Home = () => {
  const [, setLocation] = useLocation();
  
  // State to track which sections have been prefetched
  const [prefetched, setPrefetched] = useState({
    skills: false,
    education: false,
    experience: false,
    projects: false,
    certifications: false,
    blog: false,
    contact: false
  });

  // Hidden admin access via key combination
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const adminSequence = ['a', 'd', 'm', 'i', 'n']; // Type "admin" to access

  // Apply scroll animations to elements with data-animate class
  // useScrollAnimation({
  //   selector: "[data-animate]",
  //   threshold: 0.1,
  //   rootMargin: "0px",
  //   animation: "animate-fade-in",
  // });

  // Update document title for SEO
  useEffect(() => {
    document.title = "Noorain Raza - Computer Science Engineering Student | AI & Cloud Specialist | Portfolio";
  }, []);

  // Hidden admin access keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      setKeySequence(prev => {
        const newSequence = [...prev, key].slice(-adminSequence.length);
        
        // Check if the sequence matches admin access
        if (newSequence.length === adminSequence.length && 
            newSequence.every((k, i) => k === adminSequence[i])) {
          // Navigate to admin login
          setLocation('/admin/login');
          return [];
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  // Prefetching handlers
  const prefetchSkills = () => {
    if (!prefetched.skills) {
      import("@/components/SkillsSection");
      setPrefetched(prev => ({ ...prev, skills: true }));
    }
  };

  const prefetchEducation = () => {
    if (!prefetched.education) {
      import("@/components/EducationSection");
      setPrefetched(prev => ({ ...prev, education: true }));
    }
  };
  
  const prefetchExperience = () => {
    if (!prefetched.experience) {
      import("@/components/ExperienceSection");
      setPrefetched(prev => ({ ...prev, experience: true }));
    }
  };

  const prefetchProjects = () => {
    if (!prefetched.projects) {
      import("@/components/ProjectsSection");
      setPrefetched(prev => ({ ...prev, projects: true }));
    }
  };

  const prefetchCertifications = () => {
    if (!prefetched.certifications) {
      import("@/components/CertificationsSection");
      setPrefetched(prev => ({ ...prev, certifications: true }));
    }
  };

  const prefetchBlog = () => {
    if (!prefetched.blog) {
      import("@/components/BlogSection");
      setPrefetched(prev => ({ ...prev, blog: true }));
    }
  };

  const prefetchContact = () => {
    if (!prefetched.contact) {
      import("@/components/ContactSection");
      setPrefetched(prev => ({ ...prev, contact: true }));
    }
  };

  // SEO data
  const breadcrumbItems = [
    { name: "Home", url: "https://www.noorainraza.com/" },
    { name: "Noorain Raza Portfolio", url: "https://www.noorainraza.com/" }
  ];

  return (
    <main itemScope itemType="https://schema.org/Person">
      {/* Structured data microdata */}
      <meta itemProp="name" content="Noorain Raza" />
      <meta itemProp="jobTitle" content="Computer Science Engineering Student" />
      <meta itemProp="description" content="AI & Cloud enthusiast with expertise in Python, React, and software development" />
      
      {/* Above the fold content - load immediately */}
      <HeroSection />
      
      {/* Start prefetching Skills section when About section is visible */}
      <IntersectionObserver onIntersect={prefetchSkills}>
        <AboutSection />
      </IntersectionObserver>
      
      {/* Below the fold content - lazy load with prefetching */}
      <IntersectionObserver onIntersect={prefetchEducation}>
        <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
          <SkillsSection />
        </Suspense>
      </IntersectionObserver>
      
      <IntersectionObserver onIntersect={prefetchExperience}>
        <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
          <EducationSection />
        </Suspense>
      </IntersectionObserver>
      
      <IntersectionObserver onIntersect={prefetchProjects}>
        <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
          <ExperienceSection />
        </Suspense>
      </IntersectionObserver>
      
      <IntersectionObserver onIntersect={prefetchCertifications}>
        <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
          <ProjectsSection />
        </Suspense>
      </IntersectionObserver>
      
      <IntersectionObserver onIntersect={prefetchBlog}>
        <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
          <CertificationsSection />
        </Suspense>
      </IntersectionObserver>
      
      <IntersectionObserver onIntersect={prefetchContact}>
        <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
          <BlogSection />
        </Suspense>
      </IntersectionObserver>
      
      <Suspense fallback={<div className="py-16 flex justify-center"><LoadingSpinner size="md" /></div>}>
        <ContactSection />
      </Suspense>
    </main>
  );
};

export default Home;
