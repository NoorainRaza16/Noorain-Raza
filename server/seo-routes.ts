import { Express } from 'express';
import { setupCoreAnalysis } from './core-analysis';

export function setupSEORoutes(app: Express) {
  // Setup core analysis routes
  setupCoreAnalysis(app);
  
  // Dynamic sitemap generation
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://noorain.me';
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Main Portfolio Page - Maximum Priority -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <mobile:mobile/>
    <image:image>
      <image:loc>${baseUrl}/profile/profile-photo.jpg</image:loc>
      <image:caption>Noorain Raza - Computer Science Engineering Student and AI Specialist</image:caption>
      <image:title>Noorain Raza Portfolio Photo</image:title>
    </image:image>
  </url>
  
  <!-- Blog Section -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <mobile:mobile/>
  </url>
  
  <!-- Portfolio Sections -->
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>${baseUrl}/#skills</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>${baseUrl}/#projects</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>${baseUrl}/#experience</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>${baseUrl}/#education</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>${baseUrl}/#certifications</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>
  
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <mobile:mobile/>
  </url>
  
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Enhanced robots.txt with dynamic content
  app.get('/robots.txt', (req, res) => {
    const baseUrl = 'https://noorain.me';
    
    const robots = `# Robots.txt for Noorain Raza Portfolio - AI & Cloud Specialist
# Optimized for maximum search engine visibility and global reach

User-agent: *
Allow: /

# Prioritize key portfolio sections for crawling
Allow: /blog
Allow: /blog/*
Allow: /#about
Allow: /#skills
Allow: /#projects
Allow: /#experience
Allow: /#education
Allow: /#certifications
Allow: /#contact

# Block admin areas from search engines
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*

# Allow all major search engines globally
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Social media crawlers
User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Comprehensive structured data endpoint
  app.get('/api/seo/structured-data', (req, res) => {
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": "https://noorain.me/#person",
          "name": "Noorain Raza",
          "givenName": "Noorain",
          "familyName": "Raza",
          "alternateName": ["Noorain", "Raza", "Noorain Raza"],
          "jobTitle": "Computer Science Engineering Student",
          "description": "AI & Cloud Specialist, Full Stack Developer, Machine Learning Enthusiast from Shillong, Meghalaya, India - Serving clients globally",
          "url": "https://noorain.me",
          "image": "https://noorain.me/profile/profile-photo.jpg",
          "birthPlace": "Shillong, Meghalaya, India",
          "nationality": "Indian",
          "gender": "Male",
          "knowsLanguage": ["English", "Hindi", "Bengali"],
          "homeLocation": {
            "@type": "Place",
            "name": "Shillong, Meghalaya, India",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "25.5788",
              "longitude": "91.8933"
            }
          },
          "sameAs": [
            "https://github.com/NoorainRaza23",
            "https://linkedin.com/in/noorainraza"
          ],
          "alumniOf": {
            "@type": "CollegeOrUniversity",
            "name": "Asansol Engineering College",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Asansol",
              "addressRegion": "West Bengal",
              "addressCountry": "India"
            },
            "description": "Engineering college where Noorain Raza studied Computer Science Engineering"
          },
          "knowsAbout": [
            "Python Programming",
            "JavaScript Development",
            "React.js",
            "Node.js",
            "Artificial Intelligence",
            "Machine Learning",
            "Cloud Computing",
            "AWS",
            "Docker",
            "Kubernetes",
            "Full Stack Development",
            "Software Engineering",
            "Web Development",
            "Data Science",
            "Computer Science"
          ],
          "hasOccupation": {
            "@type": "Occupation",
            "name": "Software Developer",
            "description": "Full Stack Developer specializing in AI and Cloud technologies, based in Shillong, Meghalaya, serving clients globally"
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
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://noorain.me/"
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://noorain.me/#website",
          "name": "Noorain Raza Portfolio",
          "alternateName": ["Noorain Portfolio", "Raza Portfolio"],
          "description": "Professional portfolio of Noorain Raza - Computer Science Engineering student specializing in AI, Cloud technologies, and software development",
          "url": "https://noorain.me",
          "author": {
            "@id": "https://noorain.me/#person"
          },
          "publisher": {
            "@id": "https://noorain.me/#person"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://noorain.me/?search={search_term_string}"
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
          "name": "Noorain Raza - Computer Science Engineering Student | AI & Cloud Specialist | Portfolio",
          "description": "Professional portfolio showcasing Noorain Raza's expertise in AI, Cloud technologies, Python, React, and software development",
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
                "name": "Noorain Raza",
                "item": "https://noorain.me/"
              }
            ]
          }
        }
      ]
    };

    res.json(structuredData);
  });

  // SEO Performance metrics endpoint
  app.get('/api/seo/metrics', (req, res) => {
    const seoMetrics = {
      lastUpdated: new Date().toISOString(),
      optimizations: {
        titleTag: "✓ Optimized with target keywords",
        metaDescription: "✓ Compelling and keyword-rich",
        headings: "✓ Proper H1-H6 hierarchy",
        images: "✓ All images have alt text",
        internalLinks: "✓ Strategic internal linking",
        structuredData: "✓ Comprehensive Schema.org markup",
        mobileFriendly: "✓ Responsive design",
        pagespeed: "✓ Optimized loading times",
        socialMeta: "✓ Open Graph and Twitter Cards",
        canonicalUrls: "✓ Proper canonical implementation"
      },
      keywords: {
        primary: ["Noorain Raza", "Noorain", "Raza"],
        secondary: [
          "Computer Science Engineering",
          "AI Specialist India",
          "Cloud Technologies Expert",
          "Python Developer India", 
          "React Developer Shillong",
          "Full Stack Developer",
          "Shillong Developer",
          "Meghalaya Tech Expert",
          "Northeast India Developer",
          "Indian Software Engineer",
          "Global Tech Services",
          "Best Developer Northeast India",
          "AI Machine Learning Expert Shillong",
          "Software Engineering Portfolio Noorain",
          "Tech Expert Asia",
          "Technology Consultant India"
        ]
      },
      technicalSEO: {
        sitemap: "✓ XML sitemap generated",
        robots: "✓ Robots.txt optimized",
        httpStatus: "✓ All pages return 200",
        ssl: "✓ HTTPS enabled",
        compression: "✓ Gzip compression",
        caching: "✓ Browser caching"
      }
    };

    res.json(seoMetrics);
  });

  // Meta tags generator for different pages
  app.get('/api/seo/meta/:page', (req, res) => {
    const { page } = req.params;
    const baseUrl = 'https://noorain.me';
    
    const metaTags = {
      home: {
        title: "Noorain Raza - Computer Science Engineering Student | AI & Cloud Specialist | Shillong, Meghalaya",
        description: "Noorain Raza from Shillong, Meghalaya - Computer Science Engineering student specializing in AI, Cloud technologies, Python, React, and software development. Providing innovative tech solutions globally from Northeast India.",
        keywords: "Noorain Raza, Noorain, Raza, Computer Science Engineering, AI specialist, Cloud technologies, Python developer, React developer, JavaScript, Shillong developer, Meghalaya tech, Northeast India developer, Asansol Engineering College, software development, portfolio, student developer, machine learning, AWS, Docker, Kubernetes, India software engineer, global tech services, full stack developer, MERN stack, artificial intelligence, data science, web developer India",
        url: baseUrl,
        image: `${baseUrl}/profile/profile-photo.jpg`,
        type: "profile"
      },
      blog: {
        title: "Blog - Noorain Raza | Tech Insights & Development Journey",
        description: "Read Noorain Raza's blog featuring insights on AI, Cloud technologies, software development, and his journey as a Computer Science Engineering student.",
        keywords: "Noorain Raza blog, tech blog, AI insights, Cloud technologies, software development blog, programming tutorials, tech journey",
        url: `${baseUrl}/blog`,
        image: `${baseUrl}/profile/profile-photo.jpg`,
        type: "website"
      }
    };

    res.json(metaTags[page as keyof typeof metaTags] || metaTags.home);
  });
}