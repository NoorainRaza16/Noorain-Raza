import { useEffect } from 'react';
import { generateDomainAwareMeta } from '../utils/domainUtils';

const AdvancedSEOSchema = () => {
  useEffect(() => {
    // Remove existing advanced schema
    const existingSchema = document.querySelector('script[data-schema="advanced-seo"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Get dynamic domain-aware URLs
    const domainMeta = generateDomainAwareMeta();

    // Comprehensive schema markup for maximum SEO visibility
    const advancedSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": domainMeta.mainEntityOfPage,
          "name": "Noorain Raza",
          "givenName": "Noorain",
          "familyName": "Raza",
          "alternateName": [
            "Noorain",
            "Raza",
            "Raza Noorain",
            "Noorain Raza Developer",
            "Noorain AI Specialist",
            "Noorain Tech Expert",
            "Noorain Machine Learning Expert",
            "Noorain Python Developer",
            "Noorain React Developer"
          ],
          "description": "Noorain Raza - Leading AI & Cloud Specialist from Shillong, Meghalaya, India. Expert in Python, React, Machine Learning, and Full Stack Development. Recognized developer serving clients globally with innovative technology solutions.",
          "url": domainMeta.canonical,
          "image": `${domainMeta.canonical}/profile/profile-photo.jpg`,
          "birthPlace": {
            "@type": "Place",
            "name": "Shillong, Meghalaya, India",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "25.5788",
              "longitude": "91.8933"
            }
          },
          "homeLocation": {
            "@type": "Place",
            "name": "Shillong, Meghalaya, India",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "25.5788",
              "longitude": "91.8933"
            }
          },
          "workLocation": {
            "@type": "Place",
            "name": "Shillong, Meghalaya, India",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "25.5788",
              "longitude": "91.8933"
            }
          },
          "nationality": "Indian",
          "gender": "Male",
          "knowsLanguage": ["English", "Hindi", "Bengali"],
          "jobTitle": [
            "AI & Cloud Specialist",
            "Computer Science Engineering Student",
            "Full Stack Developer",
            "Python Developer",
            "React Developer",
            "Machine Learning Expert",
            "Software Engineer"
          ],
          "hasOccupation": [
            {
              "@type": "Occupation",
              "name": "AI & Cloud Specialist",
              "description": "Expert in artificial intelligence, machine learning, and cloud computing technologies",
              "occupationLocation": {
                "@type": "Place",
                "name": "Shillong, Meghalaya, India"
              }
            },
            {
              "@type": "Occupation",
              "name": "Full Stack Developer",
              "description": "Specialized in Python, React, JavaScript, and modern web technologies",
              "occupationLocation": {
                "@type": "Place",
                "name": "Shillong, Meghalaya, India"
              }
            }
          ],
          "alumniOf": {
            "@type": "CollegeOrUniversity",
            "name": "Asansol Engineering College",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Asansol",
              "addressRegion": "West Bengal",
              "addressCountry": "India"
            }
          },
          "knowsAbout": [
            "Python Programming",
            "JavaScript Development",
            "React.js",
            "Node.js",
            "Artificial Intelligence",
            "Machine Learning",
            "Deep Learning",
            "Cloud Computing",
            "AWS",
            "Docker",
            "Kubernetes",
            "Full Stack Development",
            "Software Engineering",
            "Web Development",
            "Data Science",
            "Computer Science",
            "API Development",
            "Database Management",
            "DevOps",
            "Software Architecture"
          ],
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "Computer Science Engineering",
              "educationalLevel": "Bachelor's Degree",
              "credentialCategory": "degree"
            }
          ],
          "award": [
            "AI & Cloud Specialist Recognition",
            "Software Development Excellence",
            "Academic Achievement in Computer Science"
          ],
          "sameAs": domainMeta.sameAs,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": domainMeta.canonical
          }
        },
        {
          "@type": "WebSite",
          "@id": domainMeta.websiteId,
          "name": "Noorain Raza - AI & Cloud Specialist Portfolio",
          "alternateName": [
            "Noorain Portfolio",
            "Noorain Raza Portfolio",
            "Noorain Developer Portfolio",
            "AI Specialist Portfolio"
          ],
          "description": "Official portfolio of Noorain Raza - Leading AI & Cloud Specialist from Shillong, Meghalaya, India. Showcasing expertise in Python, React, Machine Learning, and innovative technology solutions.",
          "url": domainMeta.canonical,
          "author": {
            "@id": domainMeta.mainEntityOfPage
          },
          "publisher": {
            "@id": domainMeta.mainEntityOfPage
          },
          "inLanguage": "en-US",
          "copyrightYear": "2025",
          "copyrightHolder": {
            "@id": domainMeta.mainEntityOfPage
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${domainMeta.canonical}/?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "mainEntity": {
            "@id": "https://noorain.me/#person"
          }
        },
        {
          "@type": "ProfilePage",
          "@id": "https://noorain.me/#profilepage",
          "name": "Noorain Raza - AI & Cloud Specialist | Shillong, Meghalaya",
          "description": "Comprehensive portfolio showcasing Noorain Raza's expertise in AI, Cloud technologies, Python, React, and software development from Shillong, Meghalaya, India",
          "url": "https://noorain.me",
          "mainEntity": {
            "@id": "https://noorain.me/#person"
          },
          "isPartOf": {
            "@id": "https://noorain.me/#website"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://noorain.me/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Noorain Raza Portfolio",
                "item": "https://noorain.me/"
              }
            ]
          }
        },
        {
          "@type": "Organization",
          "@id": "https://noorain.me/#organization",
          "name": "Noorain Raza Tech Services",
          "description": "Professional technology services by Noorain Raza - AI, Cloud Computing, and Full Stack Development",
          "url": "https://noorain.me",
          "logo": "https://noorain.me/images/logo.svg",
          "founder": {
            "@id": "https://noorain.me/#person"
          },
          "foundingLocation": {
            "@type": "Place",
            "name": "Shillong, Meghalaya, India"
          },
          "areaServed": [
            {
              "@type": "Place",
              "name": "Global"
            },
            {
              "@type": "Country",
              "name": "India"
            },
            {
              "@type": "State",
              "name": "Meghalaya"
            },
            {
              "@type": "City",
              "name": "Shillong"
            }
          ]
        }
      ]
    };

    // Add the schema to document head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'advanced-seo');
    script.textContent = JSON.stringify(advancedSchema);
    document.head.appendChild(script);

    return () => {
      const schemaElement = document.querySelector('script[data-schema="advanced-seo"]');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, []);

  return null;
};

export default AdvancedSEOSchema;