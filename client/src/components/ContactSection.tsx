import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Github, Linkedin, Instagram, Loader2 } from "lucide-react";
import { RiTwitterXFill } from "react-icons/ri";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import { useState } from "react";
import { contactMessageSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useContactData } from "@/hooks/use-contact-data";
import { getAutomaticPlatformIcon } from "@/lib/platformIcons";

// Use the schema from shared to ensure consistency
type FormValues = z.infer<typeof contactMessageSchema>;

const ContactSection = () => {
  const { toast } = useToast();
  const { header, contactInfo, formLabels, isLoading } = useContactData();
  const [formSubmitting, setFormSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // React Query mutation for form submission
  const contactMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return apiRequest({
        url: "/api/contact",
        method: "POST",
        data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      form.reset();
      setFormSubmitting(false);
    },
    onError: (error: any) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error sending message",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
      setFormSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setFormSubmitting(true);
    contactMutation.mutate(values);
  }

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const contactInfoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const getSocialIcon = (url: string, platform: string) => {
    // Use automatic platform icon detection
    const { icon } = getAutomaticPlatformIcon(url || '', platform || '');
    return icon;
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute left-0 top-1/4 w-40 sm:w-64 h-40 sm:h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute right-0 bottom-1/3 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span className="inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-2 sm:mb-3 border border-primary/20">
            {header.subtitle}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">{header.title}</h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            {header.description}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-8 xl:gap-10 max-w-6xl mx-auto">
          {/* Contact Information */}
          <motion.div
            className="lg:w-5/12"
            variants={contactInfoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-8 lg:p-10 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg h-full border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 md:h-2 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white">
                {contactInfo.title}
              </h3>

              <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                <div className="flex items-start">
                  <div className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-400 mr-3 sm:mr-4 md:mr-5 flex-shrink-0">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-0.5 sm:mb-1 text-gray-900 dark:text-white">Email</h4>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 transition-colors text-xs sm:text-sm md:text-base break-all"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-400 mr-3 sm:mr-4 md:mr-5 flex-shrink-0">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-0.5 sm:mb-1 text-gray-900 dark:text-white">Phone</h4>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 transition-colors text-xs sm:text-sm md:text-base"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-400 mr-3 sm:mr-4 md:mr-5 flex-shrink-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-0.5 sm:mb-1 text-gray-900 dark:text-white">Location</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base">
                      {contactInfo.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4 md:mb-5 text-gray-900 dark:text-white">Connect With Me</h4>
                <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
                  {contactInfo.socialLinks.map((link: any) => (
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
                      {getSocialIcon(link.url, link.platform || link.name)}
                    </motion.a>
                  ))}
                </div>
              </div>
              
              {/* Background element */}
              <div className="absolute bottom-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-primary/5 dark:bg-primary/10 rounded-tl-full -z-10"></div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:w-7/12"
            variants={formVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-8 lg:p-10 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 relative">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5 md:h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-primary"></div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white">
                {formLabels.formTitle}
              </h3>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3 sm:space-y-4 md:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Name"
                              {...field}
                              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-400 h-8 sm:h-9 md:h-11 text-xs sm:text-sm md:text-base px-2.5 sm:px-3 md:px-4"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] sm:text-xs md:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Email"
                              type="email"
                              {...field}
                              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-400 h-8 sm:h-9 md:h-11 text-xs sm:text-sm md:text-base px-2.5 sm:px-3 md:px-4"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] sm:text-xs md:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Subject"
                            {...field}
                            className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-400 h-8 sm:h-9 md:h-11 text-xs sm:text-sm md:text-base px-2.5 sm:px-3 md:px-4"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] sm:text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Your Message"
                            {...field}
                            rows={4}
                            className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-400 resize-none text-xs sm:text-sm md:text-base min-h-[100px] sm:min-h-[120px] px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] sm:text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2 sm:pt-3">
                    <Button
                      type="submit"
                      className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 h-9 sm:h-10 md:h-12 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-xs sm:text-sm md:text-base"
                      disabled={formSubmitting || contactMutation.isPending}
                    >
                      {(formSubmitting || contactMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
