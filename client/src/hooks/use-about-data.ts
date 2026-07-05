import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAboutData() {
  const queryClient = useQueryClient();
  
  const { data: aboutData, isLoading, refetch } = useQuery({
    queryKey: ['/api/about'],
    queryFn: async () => {
      const response = await fetch('/api/about', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch about data');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  // Listen for storage events to trigger immediate refetch
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'about-content-updated') {
        // Force immediate refetch with cache clearing
        queryClient.removeQueries({ queryKey: ['/api/about'] });
        queryClient.invalidateQueries({ queryKey: ['/api/about'] });
        setTimeout(() => refetch(), 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events within the same tab
    const handleCustomEvent = () => {
      // Force immediate refetch with cache clearing
      queryClient.removeQueries({ queryKey: ['/api/about'] });
      queryClient.invalidateQueries({ queryKey: ['/api/about'] });
      setTimeout(() => refetch(), 100);
    };

    window.addEventListener('about-content-updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('about-content-updated', handleCustomEvent);
    };
  }, [queryClient, refetch]);

  // Extract all about content from API data
  const dataArray = (aboutData as any)?.data || [];
  
  const biographyData = dataArray.find((item: any) => item.sectionType === 'biography' && item.isActive);
  const biography = {
    title: biographyData?.title || "Biography",
    content: biographyData?.content ? [biographyData.content] : []
  };
  
  const aspirationsData = dataArray.find((item: any) => item.sectionType === 'aspirations' && item.isActive);
  const aspirations = {
    title: aspirationsData?.title || "Aspirations",
    content: aspirationsData?.content || ""
  };

  const mainData = dataArray.find((item: any) => item.sectionType === 'main' && item.isActive);
  const main = {
    title: mainData?.title || "About Noorain Raza",
    subtitle: mainData?.subtitle || "DevOps Engineer & Cloud Specialist",
    content: mainData?.content || "A DevOps engineer with passion for automation, cloud technologies, and continuous learning."
  };

  const problemSolverData = dataArray.find((item: any) => item.sectionType === 'problem-solver' && item.isActive);
  const problemSolver = {
    title: problemSolverData?.title || "Problem Solver",
    content: problemSolverData?.content || "I thrive on finding elegant solutions to complex technical challenges, with a focus on automation and efficiency."
  };

  const continuousLearnerData = dataArray.find((item: any) => item.sectionType === 'continuous-learner' && item.isActive);
  const continuousLearner = {
    title: continuousLearnerData?.title || "Continuous Learner",
    content: continuousLearnerData?.content || "I'm passionate about expanding my knowledge and skills through continuous learning and staying up-to-date with emerging technologies."
  };

  const devopsSpecialistData = dataArray.find((item: any) => item.sectionType === 'devops-specialist' && item.isActive);
  const devopsSpecialist = {
    title: devopsSpecialistData?.title || "DevOps Specialist",
    content: devopsSpecialistData?.content || "I specialize in streamlining development workflows and implementing robust cloud infrastructure with a focus on automation and performance."
  };

  return { 
    biography, 
    aspirations, 
    main,
    problemSolver,
    continuousLearner,
    devopsSpecialist,
    isLoading, 
    rawData: aboutData 
  };
}