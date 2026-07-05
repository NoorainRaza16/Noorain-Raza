import { useEffect } from 'react';

const GlobalSEOOptimizer = () => {
  useEffect(() => {
    // Advanced global SEO optimizations for search dominance
    
    // 1. Add rich snippets data
    const richSnippetsData = {
      "@context": "https://schema.org",
      "@type": "Brand",
      "name": "Noorain Raza",
      "alternateName": ["Noorain", "Raza Noorain", "Noorain AI Specialist"],
      "description": "Leading AI & Cloud Specialist from Shillong, Meghalaya, India",
      "url": "https://noorain.me",
      "logo": "https://noorain.me/images/logo.svg",
      "founder": {
        "@type": "Person",
        "name": "Noorain Raza"
      },
      "specialty": [
        "Artificial Intelligence",
        "Cloud Computing",
        "Python Development",
        "React Development",
        "Machine Learning",
        "Full Stack Development"
      ]
    };

    // 2. Add FAQ schema for common searches
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who is Noorain Raza?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Noorain Raza is a leading AI & Cloud Specialist from Shillong, Meghalaya, India. He is a Computer Science Engineering student specializing in Python, React, Machine Learning, and Full Stack Development."
          }
        },
        {
          "@type": "Question",
          "name": "What does Noorain specialize in?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Noorain Raza specializes in Artificial Intelligence, Cloud Computing, Python Development, React Development, Machine Learning, and Full Stack Development. He provides innovative technology solutions globally."
          }
        },
        {
          "@type": "Question",
          "name": "Where is Noorain Raza from?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Noorain Raza is from Shillong, Meghalaya, India. He serves clients globally while being based in Northeast India."
          }
        }
      ]
    };

    // 3. Add Knowledge Graph data
    const knowledgeGraphData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Noorain Raza",
      "givenName": "Noorain",
      "familyName": "Raza",
      "alternateName": [
        "Noorain",
        "Raza",
        "Raza Noorain",
        "Noorain Developer",
        "Noorain AI Expert",
        "Noorain Tech Specialist"
      ],
      "description": "Noorain Raza - Premier AI & Cloud Specialist from Shillong, Meghalaya, India. Recognized expert in Python, React, Machine Learning, and innovative technology solutions.",
      "disambiguatingDescription": "AI & Cloud Specialist, Computer Science Engineering Student, Full Stack Developer from Shillong, Meghalaya, India",
      "identifier": [
        "https://noorain.me",
        "noorain-raza",
        "noorain",
        "raza-noorain"
      ],
      "url": "https://noorain.me",
      "mainEntityOfPage": "https://noorain.me",
      "subjectOf": [
        {
          "@type": "WebPage",
          "url": "https://noorain.me",
          "name": "Noorain Raza Portfolio"
        }
      ]
    };

    // Remove existing schemas
    document.querySelectorAll('script[data-schema="global-seo"]').forEach(el => el.remove());

    // Add all schemas
    [richSnippetsData, faqSchema, knowledgeGraphData].forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'global-seo');
      script.setAttribute('data-index', index.toString());
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // 4. Add entity mentions in DOM for crawlers
    const entityContainer = document.createElement('div');
    entityContainer.style.display = 'none';
    entityContainer.innerHTML = `
      <span itemScope itemType="https://schema.org/Person">
        <span itemProp="name">Noorain Raza</span>
        <span itemProp="alternateName">Noorain</span>
        <span itemProp="alternateName">Raza</span>
        <span itemProp="jobTitle">AI Specialist</span>
        <span itemProp="jobTitle">Cloud Computing Expert</span>
        <span itemProp="address">Shillong, Meghalaya, India</span>
        <span itemProp="nationality">Indian</span>
      </span>
    `;
    document.body.appendChild(entityContainer);

    // 5. Dynamic title optimization based on time
    const optimizeTitle = () => {
      const currentTitle = document.title;
      if (!currentTitle.includes('2025')) {
        document.title = currentTitle + ' | 2025';
      }
    };
    optimizeTitle();

    return () => {
      // Cleanup
      document.querySelectorAll('script[data-schema="global-seo"]').forEach(el => el.remove());
      const entityEl = document.querySelector('div[style*="display: none"]');
      if (entityEl) entityEl.remove();
    };
  }, []);

  return null;
};

export default GlobalSEOOptimizer;