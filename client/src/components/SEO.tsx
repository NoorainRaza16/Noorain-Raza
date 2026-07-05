import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = "Noorain Raza - Computer Science Engineering Student | Passionate DevOps Engineer | Shillong, Meghalaya",
  description = "Noorain Raza - Computer Science Engineering student specializing in AI, Cloud technologies, Python, React, and software development. Explore projects, skills, and experience from Asansol Engineering College.",
  keywords = "Noorain Raza, Noorain, Raza Noorain, Noorain Raza portfolio, Noorain developer, Noorain AI specialist, Computer Science Engineering, AI specialist India, Cloud technologies expert, Python developer India, React developer Shillong, JavaScript expert, Shillong developer, Meghalaya tech expert, Northeast India developer, Indian AI specialist, best developer Northeast India, Asansol Engineering College, software development expert, portfolio website, student developer, machine learning expert Northeast India, AWS cloud specialist India, Docker Kubernetes expert, India software engineer, global tech services, AI machine learning expert Shillong Meghalaya, Python React developer India Noorain Raza, software engineering portfolio Noorain, tech expert Asia, web developer Asia, technology consultant India",
  image,
  url,
  type = "website",
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords);
    }

    // Update Open Graph meta tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    let ogDescription = document.querySelector(
      'meta[property="og:description"]',
    );
    if (ogDescription) {
      ogDescription.setAttribute("content", description);
    }

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute("content", image);
    }

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", url);
    }

    let ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute("content", type);
    }

    // Update Twitter meta tags
    let twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", title);
    }

    let twitterDescription = document.querySelector(
      'meta[property="twitter:description"]',
    );
    if (twitterDescription) {
      twitterDescription.setAttribute("content", description);
    }

    let twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute("content", image);
    }

    let twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute("content", url);
    }

    // Enhanced structured data for maximum search visibility
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Noorain Raza",
        givenName: "Noorain",
        familyName: "Raza",
        alternateName: ["Noorain", "Raza", "Noorain Raza"],
        jobTitle: "Computer Science Engineering Student",
        description: description,
        url: url,
        image: image,
        birthPlace: "Shillong, Meghalaya, India",
        nationality: "Indian",
        gender: "Male",
        knowsLanguage: ["English", "Hindi", "Bengali"],
        homeLocation: {
          "@type": "Place",
          name: "Shillong, Meghalaya, India",
          geo: {
            "@type": "GeoCoordinates",
            latitude: "25.5788",
            longitude: "91.8933",
          },
        },
        sameAs: [
          "https://github.com/NoorainRaza23",
          "https://linkedin.com/in/noorainraza",
        ],
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "Asansol Engineering College",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Asansol",
            addressRegion: "West Bengal",
            addressCountry: "India",
          },
        },
        knowsAbout: keywords.split(", "),
        hasOccupation: {
          "@type": "Occupation",
          name: "Software Developer",
          description:
            "Full Stack Developer specializing in AI and Cloud technologies",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Noorain Raza Portfolio",
        alternateName: ["Noorain Portfolio", "Raza Portfolio"],
        description: description,
        url: url,
        author: {
          "@type": "Person",
          name: "Noorain Raza",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        mainEntity: {
          "@type": "Person",
          name: "Noorain Raza",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: title,
        description: description,
        url: url,
        mainEntity: {
          "@type": "Person",
          name: "Noorain Raza",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: url,
            },
          ],
        },
      },
    ];

    // Remove existing structured data script
    let existingScript = document.querySelector('script[data-seo="dynamic"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "dynamic");
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything visible
};

export default SEO;
