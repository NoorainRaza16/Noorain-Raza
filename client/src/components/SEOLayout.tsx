import { ReactNode } from 'react';
import SEO from './SEO';
import SEOMetaTags from './SEOMetaTags';
import SEOAnalytics from './SEOAnalytics';
import LocalBusinessSchema from './LocalBusinessSchema';
import AdvancedSEOSchema from './AdvancedSEOSchema';
import GlobalSEOOptimizer from './GlobalSEOOptimizer';
import DynamicSEOUpdater from './DynamicSEOUpdater';
import PerformanceOptimizer from './PerformanceOptimizer';
import CoreWebVitalsAnalyzer from './CoreWebVitalsAnalyzer';

interface SEOLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOLayout = ({ 
  children, 
  title,
  description,
  keywords,
  image,
  url,
  type
}: SEOLayoutProps) => {
  return (
    <>
      <SEO 
        title={title}
        description={description}
        keywords={keywords}
        image={image}
        url={url}
        type={type}
      />
      <SEOMetaTags 
        title={title}
        description={description}
        keywords={keywords}
        image={image}
        url={url}
        canonical={url}
      />
      <SEOAnalytics 
        pageName="portfolio_home"
        userId="noorain_portfolio_visitor"
      />
      <LocalBusinessSchema />
      <AdvancedSEOSchema />
      <GlobalSEOOptimizer />
      <DynamicSEOUpdater />
      <PerformanceOptimizer />
      <CoreWebVitalsAnalyzer />
      <main role="main" itemScope itemType="https://schema.org/Person">
        <meta itemProp="name" content="Noorain Raza" />
        <meta itemProp="alternateName" content="Noorain" />
        <meta itemProp="alternateName" content="Raza" />
        <meta itemProp="jobTitle" content="Computer Science Engineering Student" />
        <meta itemProp="description" content="AI & Cloud enthusiast with expertise in Python, React, and software development. Building innovative solutions for tomorrow's challenges." />
        <meta itemProp="image" content="https://noorain.me/profile/profile-photo.jpg" />
        <meta itemProp="url" content="https://noorain.me" />
        <meta itemProp="alumniOf" content="Asansol Engineering College" />
        <meta itemProp="address" content="Shillong, Meghalaya, India" />
        <meta itemProp="nationality" content="Indian" />
        <meta itemProp="birthPlace" content="Shillong, Meghalaya, India" />
        <meta itemProp="homeLocation" content="Shillong, Meghalaya, India" />
        <meta itemProp="workLocation" content="Shillong, Meghalaya, India" />
        <meta itemProp="knowsAbout" content="Python, JavaScript, React, AI, Cloud Computing, Machine Learning, Software Development, Full Stack Development, MERN Stack, Data Science" />
        <meta itemProp="knowsLanguage" content="English" />
        <meta itemProp="knowsLanguage" content="Hindi" />
        <meta itemProp="knowsLanguage" content="Bengali" />
        <meta itemProp="gender" content="Male" />
        <meta itemProp="worksFor" content="Asansol Engineering College" />
        {children}
      </main>
    </>
  );
};

export default SEOLayout;