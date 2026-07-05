import { useEffect, useState } from 'react';

interface CoreWebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

interface PerformanceGrade {
  metric: string;
  value: number | null;
  grade: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

const CoreWebVitalsAnalyzer = () => {
  const [metrics, setMetrics] = useState<CoreWebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  });
  
  const [grades, setGrades] = useState<PerformanceGrade[]>([]);

  useEffect(() => {
    const analyzePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Calculate Time to First Byte
      const ttfb = navigation.responseStart - navigation.requestStart;
      
      // Get First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const fcp = fcpEntry ? fcpEntry.startTime : null;
      
      setMetrics(prev => ({
        ...prev,
        ttfb: Math.round(ttfb),
        fcp: fcp ? Math.round(fcp) : null
      }));

      // Largest Contentful Paint Observer
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              setMetrics(prev => ({
                ...prev,
                lcp: Math.round(lastEntry.startTime)
              }));
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift Observer
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            setMetrics(prev => ({
              ...prev,
              cls: Math.round(clsValue * 1000) / 1000
            }));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          // First Input Delay (approximation using event timing)
          let fidMeasured = false;
          const measureFID = () => {
            if (!fidMeasured) {
              const start = performance.now();
              setTimeout(() => {
                const delay = performance.now() - start;
                setMetrics(prev => ({
                  ...prev,
                  fid: Math.round(delay)
                }));
                fidMeasured = true;
              }, 0);
            }
          };

          // Attach to first user interaction
          ['click', 'touchstart', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, measureFID, { once: true, passive: true });
          });

        } catch (error) {
          console.log('Performance Observer not fully supported');
        }
      }
    };

    // Analyze performance after page load
    if (document.readyState === 'complete') {
      analyzePerformance();
    } else {
      window.addEventListener('load', analyzePerformance);
    }

    return () => {
      window.removeEventListener('load', analyzePerformance);
    };
  }, []);

  useEffect(() => {
    const calculateGrades = (): PerformanceGrade[] => {
      const thresholds = {
        lcp: { good: 2500, poor: 4000 }, // milliseconds
        fid: { good: 100, poor: 300 },   // milliseconds
        cls: { good: 0.1, poor: 0.25 },  // score
        fcp: { good: 1800, poor: 3000 }, // milliseconds
        ttfb: { good: 800, poor: 1800 }  // milliseconds
      };

      const getGrade = (value: number | null, threshold: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
        if (value === null) return 'needs-improvement';
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
      };

      return [
        {
          metric: 'Largest Contentful Paint (LCP)',
          value: metrics.lcp,
          grade: getGrade(metrics.lcp, thresholds.lcp),
          threshold: thresholds.lcp
        },
        {
          metric: 'First Input Delay (FID)',
          value: metrics.fid,
          grade: getGrade(metrics.fid, thresholds.fid),
          threshold: thresholds.fid
        },
        {
          metric: 'Cumulative Layout Shift (CLS)',
          value: metrics.cls,
          grade: getGrade(metrics.cls, thresholds.cls),
          threshold: thresholds.cls
        },
        {
          metric: 'First Contentful Paint (FCP)',
          value: metrics.fcp,
          grade: getGrade(metrics.fcp, thresholds.fcp),
          threshold: thresholds.fcp
        },
        {
          metric: 'Time to First Byte (TTFB)',
          value: metrics.ttfb,
          grade: getGrade(metrics.ttfb, thresholds.ttfb),
          threshold: thresholds.ttfb
        }
      ];
    };

    setGrades(calculateGrades());
  }, [metrics]);

  // Send metrics to console for debugging
  useEffect(() => {
    if (Object.values(metrics).some(value => value !== null)) {
      console.log('Core Web Vitals Analysis:', {
        metrics,
        grades: grades.map(g => ({
          metric: g.metric,
          value: g.value,
          grade: g.grade,
          status: g.grade === 'good' ? '✓ GOOD' : 
                  g.grade === 'needs-improvement' ? '⚠ NEEDS IMPROVEMENT' : 
                  '✗ POOR'
        }))
      });

      // Calculate overall SEO score
      const goodCount = grades.filter(g => g.grade === 'good').length;
      const totalCount = grades.filter(g => g.value !== null).length;
      const seoScore = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
      
      console.log(`SEO Core Performance Score: ${seoScore}/100`);
      
      if (seoScore >= 90) {
        console.log('🏆 EXCELLENT: Your site has exceptional Core Web Vitals performance!');
      } else if (seoScore >= 75) {
        console.log('✅ GOOD: Your site has solid Core Web Vitals performance.');
      } else if (seoScore >= 50) {
        console.log('⚠️ NEEDS IMPROVEMENT: Your site needs Core Web Vitals optimization.');
      } else {
        console.log('❌ POOR: Your site requires significant Core Web Vitals improvements.');
      }
    }
  }, [metrics, grades]);

  return null;
};

export default CoreWebVitalsAnalyzer;