import { useEffect } from 'react';

interface ProjectItem {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  image?: string;
}

interface ProjectSchemaProps {
  projects: ProjectItem[];
}

const ProjectSchema = ({ projects }: ProjectSchemaProps) => {
  useEffect(() => {
    const projectsData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Noorain Raza",
      "hasCredential": projects.map(project => ({
        "@type": "CreativeWork",
        "name": project.name,
        "description": project.description,
        "url": project.url,
        "creator": {
          "@type": "Person",
          "name": "Noorain Raza"
        },
        "keywords": project.technologies.join(", "),
        "dateCreated": project.startDate,
        "dateModified": project.endDate,
        "image": project.image,
        "programmingLanguage": project.technologies
      }))
    };

    // Remove existing project schema
    let existingProjectScript = document.querySelector('script[data-projects="true"]');
    if (existingProjectScript) {
      existingProjectScript.remove();
    }

    // Add new project schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-projects', 'true');
    script.textContent = JSON.stringify(projectsData);
    document.head.appendChild(script);

    return () => {
      let projectScript = document.querySelector('script[data-projects="true"]');
      if (projectScript) {
        projectScript.remove();
      }
    };
  }, [projects]);

  return null;
};

export default ProjectSchema;