import { useEffect } from 'react';

interface EducationItem {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  location?: string;
  gpa?: string;
}

interface EducationSchemaProps {
  education: EducationItem[];
}

const EducationSchema = ({ education }: EducationSchemaProps) => {
  useEffect(() => {
    const educationData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Noorain Raza",
      "education": education.map(item => ({
        "@type": "EducationalOccupationalCredential",
        "educationalLevel": item.degree,
        "credentialCategory": item.field,
        "sourceOrganization": {
          "@type": "CollegeOrUniversity",
          "name": item.school,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": item.location || "Asansol",
            "addressRegion": "West Bengal",
            "addressCountry": "India"
          }
        },
        "dateCreated": item.startDate,
        "expires": item.endDate
      }))
    };

    // Remove existing education schema
    let existingEducationScript = document.querySelector('script[data-education="true"]');
    if (existingEducationScript) {
      existingEducationScript.remove();
    }

    // Add new education schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-education', 'true');
    script.textContent = JSON.stringify(educationData);
    document.head.appendChild(script);

    return () => {
      let educationScript = document.querySelector('script[data-education="true"]');
      if (educationScript) {
        educationScript.remove();
      }
    };
  }, [education]);

  return null;
};

export default EducationSchema;