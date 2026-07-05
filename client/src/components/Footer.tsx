import { scrollToElement } from "@/lib/utils";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  ArrowUp,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { RiTwitterXFill } from "react-icons/ri";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAutomaticPlatformIcon } from "@/lib/platformIcons";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNavClick = (sectionId: string) => {
    scrollToElement(sectionId);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  // Fetch dynamic footer content from admin panel
  const { data: footerContent } = useQuery({
    queryKey: ["/api/footer"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/footer", {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!response.ok) return null;
        const result = await response.json();
        return result.data;
      } catch (error) {
        return null;
      }
    },
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Dynamic content from admin or defaults
  const profileName = footerContent?.profileName || "Noorain Raza";
  const profileInitials = footerContent?.profileInitials || "NR";
  const profileDescription =
    footerContent?.profileDescription ||
    "Passionate DevOps Engineer with expertise in cloud technologies, CI/CD pipelines, and software development. Building scalable solutions for tomorrow's challenges.";

  const newsletterTitle = footerContent?.newsletterTitle || "STAY UPDATED";
  const newsletterDescription =
    footerContent?.newsletterDescription ||
    "I'll send occasional updates on new projects and tech content.";
  const newsletterButtonText =
    footerContent?.newsletterButtonText || "Subscribe";
  const emailPlaceholder =
    footerContent?.emailPlaceholder || "Your email address";

  const getInTouchTitle = footerContent?.getInTouchTitle || "Get in Touch";
  const followMeTitle = footerContent?.followMeTitle || "FOLLOW ME";
  const quickLinksTitle = footerContent?.quickLinksTitle || "Quick Links";
  const copyrightText =
    footerContent?.copyrightText ||
    `© ${new Date().getFullYear()} Noorain Raza. All rights reserved.`;
  const backToTopText = footerContent?.backToTopText || "Back to Top";

  // Default data fallbacks
  const defaultNavLinks = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Skills", id: "skills" },
    { label: "Education", id: "education" },
    { label: "Experience", id: "experience" },
    { label: "Projects", id: "projects" },
    { label: "Certifications", id: "certifications" },
    { label: "Blog", id: "blog" },
    { label: "Contact", id: "contact" },
  ];

  const defaultSocialLinks = [
    {
      name: "github",
      icon: <Github className="h-5 w-5" />,
      url: "https://github.com/NoorainRaza23",
    },
    {
      name: "linkedin",
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://linkedin.com/in/noorainraza",
    },
    {
      name: "twitter",
      icon: <RiTwitterXFill className="h-5 w-5" />,
      url: "https://x.com/NoorainRaza23",
    },
  ];

  const defaultGetInTouchItems = [
    {
      type: "email",
      label: "Email",
      value: "noorainraza16@gmail.com",
      link: "mailto:noorainraza16@gmail.com",
    },
    {
      type: "phone",
      label: "Phone",
      value: "+91 98765 43210",
      link: "tel:+919876543210",
    },
    {
      type: "location",
      label: "Location",
      value: "Asansol, West Bengal, India",
      link: "",
    },
  ];

  // Use admin content if available, otherwise use defaults
  const navLinks =
    footerContent?.quickLinks?.length > 0
      ? footerContent.quickLinks.map((link: any) => ({
          label: link.label,
          id: link.type === "internal" ? link.url.replace("#", "") : null,
          url: link.type === "external" ? link.url : null,
        }))
      : defaultNavLinks;

  const socialLinks =
    footerContent?.followMeItems?.length > 0
      ? footerContent.followMeItems
          .filter((item: any) => item.isActive !== false) // Only show active items
          .map((item: any) => {
            // Use automatic platform icon detection
            const { icon: autoIcon } = getAutomaticPlatformIcon(item.url || '', item.platform || '');
            
            return {
              name: item.platform.toLowerCase(),
              icon: autoIcon,
              url: item.url,
            };
          })
      : defaultSocialLinks;

  const getInTouchItems =
    footerContent?.getInTouchItems?.length > 0
      ? footerContent.getInTouchItems
      : defaultGetInTouchItems;

  function getIconForPlatform(platform: string) {
    const platformLower = platform.toLowerCase().trim();
    
    switch (platformLower) {
      case "github":
        return <Github className="h-5 w-5" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "twitter":
      case "x":
        return <RiTwitterXFill className="h-5 w-5" />;
      case "facebook":
        return <FaFacebook className="h-5 w-5" />;
      case "youtube":
        return <FaYoutube className="h-5 w-5" />;
      case "instagram":
        return <FaInstagram className="h-5 w-5" />;
      default:
        // Try to match common platform names as fallback
        if (platformLower.includes('github')) return <Github className="h-5 w-5" />;
        if (platformLower.includes('twitter') || platformLower.includes('x.com')) return <RiTwitterXFill className="h-5 w-5" />;
        if (platformLower.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
        if (platformLower.includes('facebook')) return <FaFacebook className="h-5 w-5" />;
        if (platformLower.includes('youtube')) return <FaYoutube className="h-5 w-5" />;
        if (platformLower.includes('instagram')) return <FaInstagram className="h-5 w-5" />;
        return <ExternalLink className="h-5 w-5" />;
    }
  }

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-300 py-12 sm:py-16 mt-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 bottom-0 -mb-40 -mr-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl opacity-20"></div>
        <div className="absolute left-10 top-10 w-40 sm:w-72 h-40 sm:h-72 rounded-full bg-primary/5 blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Brand/Logo Section */}
          <motion.div
            className="sm:col-span-2 lg:col-span-5 space-y-4 sm:space-y-6"
            variants={itemVariants}
          >
            <div>
              <a
                href="#"
                className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white inline-flex items-center"
              >
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 text-white mr-3 text-sm sm:text-lg">
                  {profileInitials}
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                  {profileName}
                </span>
              </a>
            </div>

            <p className="text-gray-600 dark:text-gray-400 max-w-md text-sm sm:text-base leading-relaxed">
              {profileDescription}
            </p>

            {/* Newsletter Signup */}
            <div className="pt-3 sm:pt-4">
              <h4 className="text-xs sm:text-sm uppercase text-gray-600 dark:text-gray-400 font-semibold tracking-wider mb-2 sm:mb-3">
                {newsletterTitle}
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  className="bg-gray-200/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-l-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs sm:text-sm flex-grow"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 transition-colors text-white px-3 sm:px-4 rounded-r-lg text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  {newsletterButtonText}
                </button>
              </form>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-500">
                {newsletterDescription}
              </p>
            </div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div
            className="sm:col-span-1 lg:col-span-3"
            variants={itemVariants}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-5 pb-1 border-b border-gray-300 dark:border-gray-800">
              {quickLinksTitle}
            </h3>
            <nav className="grid grid-cols-1 gap-1 sm:gap-2">
              {navLinks.map((link: any, index: number) => (
                <div key={index}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : "_self"}
                      rel={
                        link.url.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`py-1 sm:py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center group ${index >= 5 ? "hidden sm:flex" : ""}`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-primary group-hover:translate-x-1 transition-transform" />
                      <span className="text-sm">{link.label}</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.id)}
                      className={`py-1 sm:py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer flex items-center group ${index >= 5 ? "hidden sm:flex" : ""}`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-primary group-hover:translate-x-1 transition-transform" />
                      <span className="text-sm">{link.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="sm:col-span-1 lg:col-span-4"
            variants={itemVariants}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-5 pb-1 border-b border-gray-300 dark:border-gray-800">
              {footerContent?.getInTouchTitle || "Get In Touch"}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {getInTouchItems.map((item: any, index: number) => {
                const getIcon = () => {
                  switch (item.type) {
                    case "email":
                      return <Mail className="h-4 w-4 sm:h-5 sm:w-5" />;
                    case "phone":
                      return <Phone className="h-4 w-4 sm:h-5 sm:w-5" />;
                    case "location":
                      return <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />;
                    default:
                      return <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />;
                  }
                };

                const content = (
                  <div className="flex items-start space-x-2 sm:space-x-3 group">
                    <div className="text-primary group-hover:scale-110 transition-transform mt-1">
                      {getIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );

                return item.link ? (
                  <a
                    key={index}
                    href={item.link}
                    className="block hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={index} className="block">
                    {content}
                  </div>
                );
              })}
            </div>

            {/* Social Icons */}
            <div className="mt-4 sm:mt-6">
              <h4 className="text-xs sm:text-sm uppercase text-gray-600 dark:text-gray-400 font-semibold tracking-wider mb-2 sm:mb-3">
                {followMeTitle}
              </h4>
              <div className="flex space-x-3 sm:space-x-4">
                {socialLinks.map((link: any) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    aria-label={link.name}
                  >
                    {typeof link.icon === "string" ? (
                      <span className="text-sm">{link.icon}</span>
                    ) : (
                      link.icon
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-300 dark:border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.p
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {copyrightText}
          </motion.p>

          <motion.div
            className="mt-3 sm:mt-4 md:mt-0 flex items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => scrollToElement("home")}
              className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-500 hover:text-primary transition-colors group"
            >
              <span>{backToTopText}</span>
              <ArrowUp className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Removed duplicate scroll-to-top button */}
    </footer>
  );
};

export default Footer;
