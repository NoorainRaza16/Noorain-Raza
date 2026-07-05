import { useEffect, useState } from "react";
import {
  getDynamicDomain,
  getDynamicCanonicalUrl,
  getAdaptedSocialUrls,
  generateDomainAwareMeta,
} from "../utils/domainUtils";

export const useDynamicSEO = () => {
  const [domain, setDomain] = useState<string>("");
  const [seoData, setSeoData] = useState({
    domain: "",
    canonicalUrl: "",
    socialUrls: {
      og: "",
      twitter: "",
      profile: "",
      logo: "",
    },
    meta: {
      canonical: "",
      ogUrl: "",
      twitterUrl: "",
      sameAs: [],
      mainEntityOfPage: "",
      websiteId: "",
      profilePageId: "",
      organizationId: "",
    },
  });

  useEffect(() => {
    const currentDomain = getDynamicDomain();
    const canonicalUrl = getDynamicCanonicalUrl();
    const socialUrls = getAdaptedSocialUrls();
    const meta = generateDomainAwareMeta();

    setDomain(currentDomain);
    setSeoData({
      domain: currentDomain,
      canonicalUrl,
      socialUrls,
      meta,
    });
  }, []);

  const updateSEOForNewDomain = (newDomain: string) => {
    // This function can be called when domain changes
    const canonicalUrl = newDomain;
    const socialUrls = {
      og: `${newDomain}/assets/profile-photo.jpg`,
      twitter: `${newDomain}/assets/profile-photo.jpg`,
      profile: `${newDomain}/profile/profile-photo.jpg`,
      logo: `${newDomain}/images/logo.svg`,
    };

    const meta = {
      canonical: newDomain,
      ogUrl: newDomain,
      twitterUrl: newDomain,
      sameAs: [
        "https://github.com/NoorainRaza23",
        "https://linkedin.com/in/noorainraza",
      ],
      mainEntityOfPage: `${newDomain}/#person`,
      websiteId: `${newDomain}/#website`,
      profilePageId: `${newDomain}/#profilepage`,
      organizationId: `${newDomain}/#organization`,
    };

    setDomain(newDomain);
    setSeoData({
      domain: newDomain,
      canonicalUrl,
      socialUrls,
      meta,
    });

    console.log(`🎯 SEO updated for new domain: ${newDomain}`);
  };

  return {
    domain,
    seoData,
    updateSEOForNewDomain,
  };
};

export default useDynamicSEO;
