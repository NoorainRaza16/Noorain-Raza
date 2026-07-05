import { motion } from "framer-motion";
import { Award, BadgeCheck, Calendar, Globe, ExternalLink, Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

// Define certification type from MongoDB schema
interface Certification {
  _id: string;
  title: string;
  description: string;
  type: 'certificate' | 'award' | 'course' | 'other';
  date: string;
  issuer: string;
  url?: string;
  credentialId?: string;
  expiryDate?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationsSection = () => {
  const { data: certificationsData, isLoading, error } = useQuery({
    queryKey: ['/api/certifications'],
    select: (data: any) => data?.data || [],
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/certifications-content'],
    select: (data: any) => data?.data || null,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const certifications = certificationsData?.filter((cert: Certification) => cert.isActive)
    ?.sort((a: Certification, b: Certification) => a.displayOrder - b.displayOrder) || [];

  const content = contentData || {
    badgeText: "My Achievements",
    title: "Certifications & Awards",
    description: "Professional certifications and notable achievements that validate my expertise and skills in technology.",
    bottomText: "Continuously improving my skills through relevant certifications and hands-on experience.",
    linkedInText: "View all certifications on LinkedIn",
    linkedInUrl: "https://www.linkedin.com/in/noorainraza"
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  
  const badgeVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.1 }
    }
  };
  
  const getCertificateTypeIcon = (type: string | undefined): ReactNode => {
    if (!type) return <BadgeCheck className="w-5 h-5" />;
    
    switch (type.toLowerCase()) {
      case 'award':
        return <Award className="w-5 h-5" />;
      case 'certificate':
        return <BadgeCheck className="w-5 h-5" />;
      case 'course':
        return <Globe className="w-5 h-5" />;
      default:
        return <BadgeCheck className="w-5 h-5" />;
    }
  };

  const getAccentColors = (index: number) => {
    // Using the blue-to-purple gradient from the image
    return { 
      bg: "bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600", 
      light: "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30", 
      text: "text-blue-600 dark:text-blue-400" 
    };
  };

  return (
    <section id="certifications" className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background pattern matching other sections */}
      <div className="absolute inset-0 opacity-5 dark:opacity-[0.03]">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="cert-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cert-grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.span 
            className="inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-2 sm:mb-3 border border-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            {content.badgeText}
          </motion.span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">{content.title}</h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            {content.description}
          </p>
        </motion.div>

        {/* Loading State */}
        {(isLoading || contentLoading) && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading certifications...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 dark:text-red-400">Failed to load certifications. Please try again later.</p>
          </div>
        )}

        {/* Certifications Grid */}
        {!isLoading && !error && certifications.length > 0 && (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 xl:gap-12 max-w-6xl mx-auto"
          >
            {certifications.map((cert: Certification, index: number) => {
              const accentColors = getAccentColors(index);
              return (
                <motion.div
                  key={cert._id}
                variants={cardVariants}
                custom={index}
                whileHover={{ 
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl sm:shadow-lg sm:hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative"
              >
                {/* Colorful accent line at top matching Projects section */}
                <div className={`h-1 ${accentColors.bg} w-full`}></div>
                
                {/* Card header with professional badge */}
                <div className="relative p-4 sm:p-5 lg:p-6">
                  <motion.div 
                    className="flex items-center justify-between flex-wrap gap-3 mb-4"
                    variants={badgeVariants}
                  >
                    <motion.div 
                      className="flex items-center gap-2.5"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className={`p-2 sm:p-2.5 rounded-xl ${accentColors.light}`}>
                        <div className={accentColors.text}>
                          {getCertificateTypeIcon(cert.type || 'certificate')}
                        </div>
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold ${accentColors.text}`}>
                        {(cert.type || 'Certificate').charAt(0).toUpperCase() + (cert.type || 'Certificate').slice(1)}
                      </span>
                    </motion.div>
                    
                    {cert.date && (
                      <motion.div 
                        className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg"
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                        {cert.date}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.h3 
                    className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight"
                    whileHover={{ x: 2 }}
                  >
                    {cert.title}
                  </motion.h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed mb-4 sm:mb-5">
                    {cert.description}
                  </p>
                </div>
                
                {/* Clean footer layout matching Projects section */}
                <div className="mt-auto p-4 sm:p-5 lg:p-6 pt-0 border-t border-gray-100/50 dark:border-gray-700/50">
                  {/* Issuer info */}
                  {cert.issuer && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${accentColors.bg}`}></div>
                        <span className="text-gray-500 dark:text-gray-500 text-xs font-medium tracking-wide">Issued By</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{cert.issuer}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    {cert.url && (
                      <motion.a 
                        href={cert.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${accentColors.light} ${accentColors.text} hover:opacity-80`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                        View Certificate
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && certifications.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">No certifications available at the moment.</p>
          </div>
        )}
        
        {/* Clean bottom section matching other sections */}
        <motion.div
          className="mt-10 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {content.bottomText}
          </motion.p>
          
          <motion.a
            href={content.linkedInUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 text-sm sm:text-base font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-300 group/link"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="border-b-2 border-transparent group-hover/link:border-current transition-all duration-300">
              {content.linkedInText}
            </span>
            <motion.svg 
              className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover/link:translate-x-1 transition-transform duration-300" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </motion.svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificationsSection;