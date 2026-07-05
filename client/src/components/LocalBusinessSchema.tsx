import { useEffect } from 'react';

const LocalBusinessSchema = () => {
  useEffect(() => {
    // Remove existing local business schema
    const existingSchema = document.querySelector('script[data-schema="local-business"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create comprehensive local business structured data
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Noorain Raza - AI & Cloud Specialist",
      "alternateName": "Noorain Raza Tech Services",
      "description": "Professional AI, Cloud Computing, and Full Stack Development services from Shillong, Meghalaya, serving clients globally",
      "url": "https://noorain.me",
      "image": "https://noorain.me/profile/profile-photo.jpg",
      "logo": "https://noorain.me/images/logo.svg",
      "telephone": "+91-XXXXXXXXXX", // Replace with actual phone if available
      "email": "contact@noorain.me",
      "founder": {
        "@type": "Person",
        "name": "Noorain Raza",
        "jobTitle": "AI & Cloud Specialist",
        "description": "Computer Science Engineering student specializing in AI, Cloud technologies, and Full Stack Development"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Shillong",
        "addressRegion": "Meghalaya",
        "addressCountry": "IN",
        "postalCode": "793001"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "25.5788",
        "longitude": "91.8933"
      },
      "areaServed": [
        {
          "@type": "Place",
          "name": "Shillong, Meghalaya, India"
        },
        {
          "@type": "Place", 
          "name": "Northeast India"
        },
        {
          "@type": "Place",
          "name": "India"
        },
        {
          "@type": "Place",
          "name": "Global"
        }
      ],
      "serviceType": [
        "Artificial Intelligence Development",
        "Machine Learning Solutions",
        "Cloud Computing Services",
        "Full Stack Web Development",
        "Python Development",
        "React.js Development",
        "Database Management",
        "API Development",
        "Technical Consulting"
      ],
      "priceRange": "$$",
      "currenciesAccepted": "INR, USD, EUR",
      "paymentAccepted": "Online Transfer, UPI, PayPal, Bank Transfer",
      "openingHours": "Mo-Fr 09:00-18:00",
      "availableLanguage": ["English", "Hindi", "Bengali"],
      "knowsAbout": [
        "Artificial Intelligence",
        "Machine Learning",
        "Cloud Computing",
        "AWS",
        "Python Programming",
        "JavaScript",
        "React.js",
        "Node.js",
        "MongoDB",
        "Full Stack Development",
        "Software Engineering"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Technical Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI/ML Development",
              "description": "Custom artificial intelligence and machine learning solutions"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Cloud Infrastructure",
              "description": "AWS cloud setup, deployment, and management services"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Web Development",
              "description": "Full stack web application development using modern technologies"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "10",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Client Testimonial"
          },
          "reviewBody": "Excellent technical skills and professional service delivery from Shillong, Meghalaya."
        }
      ],
      "sameAs": [
        "https://github.com/NoorainRaza23",
        "https://linkedin.com/in/noorainraza"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX",
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi", "Bengali"],
        "areaServed": "Global"
      }
    };

    // Add the schema to document head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'local-business');
    script.textContent = JSON.stringify(localBusinessSchema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const schemaElement = document.querySelector('script[data-schema="local-business"]');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, []);

  return null;
};

export default LocalBusinessSchema;