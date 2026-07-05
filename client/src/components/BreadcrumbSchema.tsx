import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  useEffect(() => {
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    // Remove existing breadcrumb schema
    let existingBreadcrumbScript = document.querySelector('script[data-breadcrumb="true"]');
    if (existingBreadcrumbScript) {
      existingBreadcrumbScript.remove();
    }

    // Add new breadcrumb schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);

    return () => {
      let breadcrumbScript = document.querySelector('script[data-breadcrumb="true"]');
      if (breadcrumbScript) {
        breadcrumbScript.remove();
      }
    };
  }, [items]);

  return null;
};

export default BreadcrumbSchema;