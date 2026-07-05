import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/lib/socket";

export function useContactData() {
  const queryClient = useQueryClient();
  
  const { data: contactData, isLoading, refetch } = useQuery({
    queryKey: ['/api/contact-content'],
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Listen for storage events to trigger immediate refetch
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contact-content-updated') {
        queryClient.removeQueries({ queryKey: ['/api/contact-content'] });
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events within the same tab
    const handleCustomEvent = () => {
      queryClient.removeQueries({ queryKey: ['/api/contact-content'] });
      refetch();
    };

    window.addEventListener('contact-content-updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contact-content-updated', handleCustomEvent);
    };
  }, [queryClient, refetch]);

  // Extract different content types from API data
  const dataArray = (contactData as any)?.data || [];
  
  const headerData = dataArray.find((item: any) => item.sectionType === 'header' && item.isActive);
  const header = {
    title: headerData?.title || "Get In Touch",
    subtitle: headerData?.subtitle || "Let's Talk",
    description: headerData?.description || "Feel free to reach out for collaborations, opportunities, or just to say hello! I'll get back to you as soon as possible."
  };

  const contactInfoData = dataArray.find((item: any) => item.sectionType === 'contact-info' && item.isActive);
  const contactInfo = {
    title: contactInfoData?.title || "Contact Information",
    email: contactInfoData?.email || "devops.portfolio@example.com",
    phone: contactInfoData?.phone || "+1 555-123-4567",
    location: contactInfoData?.location || "San Francisco, CA, USA",
    socialLinks: contactInfoData?.socialLinks || [
      { name: 'github', url: 'https://github.com/NoorainRaza23', platform: 'GitHub' },
      { name: 'linkedin', url: 'https://linkedin.com/in/noorainraza', platform: 'LinkedIn' },
      { name: 'twitter', url: 'https://x.com/NoorainRaza23', platform: 'Twitter' },
      { name: 'instagram', url: 'https://instagram.com/noorain_raza', platform: 'Instagram' }
    ]
  };

  const formLabelsData = dataArray.find((item: any) => item.sectionType === 'form-labels' && item.isActive);
  const formLabels = {
    formTitle: formLabelsData?.formLabels?.formTitle || "Send Me a Message",
    nameLabel: formLabelsData?.formLabels?.nameLabel || "Name",
    emailLabel: formLabelsData?.formLabels?.emailLabel || "Email",
    subjectLabel: formLabelsData?.formLabels?.subjectLabel || "Subject",
    messageLabel: formLabelsData?.formLabels?.messageLabel || "Message",
    buttonText: formLabelsData?.formLabels?.buttonText || "Send Message",
    successMessage: formLabelsData?.formLabels?.successMessage || "Thank you for your message. I'll get back to you soon.",
    errorMessage: formLabelsData?.formLabels?.errorMessage || "Please try again later.",
    namePlaceholder: formLabelsData?.formLabels?.namePlaceholder || "Your Name",
    emailPlaceholder: formLabelsData?.formLabels?.emailPlaceholder || "Your Email",
    subjectPlaceholder: formLabelsData?.formLabels?.subjectPlaceholder || "Subject",
    messagePlaceholder: formLabelsData?.formLabels?.messagePlaceholder || "Your Message"
  };

  return { 
    header, 
    contactInfo, 
    formLabels, 
    isLoading, 
    rawData: contactData 
  };
}