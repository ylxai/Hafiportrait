'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface SkeletonMetrics {
  skeletonStartTime: number | null;
  skeletonEndTime: number | null;
  skeletonDuration: number | null;
  contentLoadTime: number | null;
  layoutShifts: LayoutShift[];
  performanceScore: number | null;
}

interface LayoutShift {
  value: number;
  time: number;
  sources: string[];
}

interface PerformanceConfig {
  trackLayoutShifts: boolean;
  trackAnimationFrames: boolean;
  reportToAnalytics: boolean;
  debugMode: boolean;
}

export function useSkeletonPerformance(
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) {
  const defaultConfig: PerformanceConfig = {
    trackLayoutShifts: true,
    trackAnimationFrames: false,
    reportToAnalytics: false,
    debugMode: process.env.NODE_ENV === 'development'
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const [metrics, setMetrics] = useState<SkeletonMetrics>({
    skeletonStartTime: null,
    skeletonEndTime: null,
    skeletonDuration: null,
    contentLoadTime: null,
    layoutShifts: [],
    performanceScore: null
  });

  const observerRef = useRef<PerformanceObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Track skeleton appearance and disappearance
  const trackSkeletonLifecycle = useCallback(() => {
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }

    mutationObserverRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Track skeleton appearance
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as Element;
            if (
              element.classList?.contains('animate-pulse') ||
              element.classList?.contains('shimmer-animation') ||
              element.querySelector?.('[class*="skeleton"]')
            ) {
              if (!metrics.skeletonStartTime) {
                const startTime = performance.now();
                setMetrics(prev => ({ ...prev, skeletonStartTime: startTime }));
                
                if (finalConfig.debugMode) {
                  console.log(`🦴 [${componentName}] Skeleton appeared at:`, startTime);
                }
              }
            }
          }
        });

        // Track skeleton disappearance
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as Element;
            if (
              element.classList?.contains('animate-pulse') ||
              element.classList?.contains('shimmer-animation')
            ) {
              if (!metrics.skeletonEndTime && metrics.skeletonStartTime) {
                const endTime = performance.now();
                const duration = endTime - metrics.skeletonStartTime;
                
                setMetrics(prev => ({
                  ...prev,
                  skeletonEndTime: endTime,
                  skeletonDuration: duration,
                  contentLoadTime: endTime - startTimeRef.current
                }));
                
                if (finalConfig.debugMode) {
                  console.log(`✅ [${componentName}] Skeleton removed at:`, endTime);
                  console.log(`⏱️ [${componentName}] Skeleton duration:`, duration.toFixed(2), 'ms');
                }
              }
            }
          }
        });
      });
    });

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });
  }, [componentName, metrics.skeletonStartTime, metrics.skeletonEndTime, finalConfig.debugMode]);

  // Track layout shifts
  const trackLayoutShifts = useCallback(() => {
    if (!finalConfig.trackLayoutShifts) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new PerformanceObserver((list) => {
      const shifts: LayoutShift[] = [];
      
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          const shift: LayoutShift = {
            value: (entry as any).value,
            time: entry.startTime,
            sources: (entry as any).sources?.map((source: any) => source.node?.tagName || 'unknown') || []
          };
          shifts.push(shift);
        }
      }

      if (shifts.length > 0) {
        setMetrics(prev => ({
          ...prev,
          layoutShifts: [...prev.layoutShifts, ...shifts]
        }));

        if (finalConfig.debugMode) {
          shifts.forEach(shift => {
            console.log(`📐 [${componentName}] Layout shift:`, shift.value.toFixed(4), 'at', shift.time.toFixed(2), 'ms');
          });
        }
      }
    });

    observerRef.current.observe({ entryTypes: ['layout-shift'] });
  }, [componentName, finalConfig.trackLayoutShifts, finalConfig.debugMode]);

  // Track animation performance
  const trackAnimationPerformance = useCallback(() => {
    if (!finalConfig.trackAnimationFrames) return;

    let frameCount = 0;
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameTimes: number[] = [];

    const measureFrame = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      frameTimes.push(deltaTime);
      frameCount++;

      // Keep only last 60 frames for rolling average
      if (frameTimes.length > 60) {
        frameTimes.shift();
      }

      lastTime = currentTime;

      // Continue measuring if skeleton is still visible
      const hasSkeletonElements = document.querySelector('[class*="skeleton"], [class*="animate-pulse"], [class*="shimmer"]');
      if (hasSkeletonElements && frameCount < 300) { // Max 5 seconds of measurement
        animationFrameRef.current = requestAnimationFrame(measureFrame);
      } else {
        // Calculate performance score
        const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        const actualFPS = 1000 / averageFrameTime;
        const performanceScore = Math.min(100, (actualFPS / targetFPS) * 100);

        setMetrics(prev => ({ ...prev, performanceScore }));

        if (finalConfig.debugMode) {
          console.log(`🎬 [${componentName}] Animation performance:`, {
            averageFPS: actualFPS.toFixed(1),
            performanceScore: performanceScore.toFixed(1),
            frameCount
          });
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, [componentName, finalConfig.trackAnimationFrames, finalConfig.debugMode]);

  // Calculate overall performance score
  const calculatePerformanceScore = useCallback(() => {
    const { skeletonDuration, layoutShifts, performanceScore } = metrics;
    
    if (!skeletonDuration) return null;

    let score = 100;

    // Deduct points for long skeleton duration
    if (skeletonDuration > 3000) score -= 20;
    else if (skeletonDuration > 2000) score -= 10;
    else if (skeletonDuration > 1000) score -= 5;

    // Deduct points for layout shifts
    const totalCLS = layoutShifts.reduce((sum, shift) => sum + shift.value, 0);
    if (totalCLS > 0.25) score -= 30;
    else if (totalCLS > 0.1) score -= 15;
    else if (totalCLS > 0.05) score -= 5;

    // Factor in animation performance
    if (performanceScore !== null) {
      score = (score + performanceScore) / 2;
    }

    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  // Report metrics to analytics
  const reportMetrics = useCallback(() => {
    if (!finalConfig.reportToAnalytics) return;

    const finalScore = calculatePerformanceScore();
    const reportData = {
      component: componentName,
      skeletonDuration: metrics.skeletonDuration,
      contentLoadTime: metrics.contentLoadTime,
      layoutShifts: metrics.layoutShifts.length,
      totalCLS: metrics.layoutShifts.reduce((sum, shift) => sum + shift.value, 0),
      animationPerformance: metrics.performanceScore,
      overallScore: finalScore,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'skeleton_performance', {
        event_category: 'Performance',
        event_label: componentName,
        value: Math.round(finalScore || 0),
        custom_parameters: reportData
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/skeleton-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      }).catch(error => {
        console.warn('Failed to report skeleton performance:', error);
      });
    }

    if (finalConfig.debugMode) {
      console.log(`📊 [${componentName}] Performance report:`, reportData);
    }
  }, [componentName, metrics, finalConfig.reportToAnalytics, finalConfig.debugMode, calculatePerformanceScore]);

  // Initialize tracking
  useEffect(() => {
    startTimeRef.current = performance.now();
    trackSkeletonLifecycle();
    trackLayoutShifts();
    trackAnimationPerformance();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trackSkeletonLifecycle, trackLayoutShifts, trackAnimationPerformance]);

  // Report metrics when skeleton lifecycle completes
  useEffect(() => {
    if (metrics.skeletonDuration !== null && metrics.contentLoadTime !== null) {
      // Delay reporting to ensure all metrics are collected
      const timer = setTimeout(reportMetrics, 1000);
      return () => clearTimeout(timer);
    }
  }, [metrics.skeletonDuration, metrics.contentLoadTime, reportMetrics]);

  // Public API
  const getMetricsSummary = useCallback(() => {
    const totalCLS = metrics.layoutShifts.reduce((sum, shift) => sum + shift.value, 0);
    const overallScore = calculatePerformanceScore();

    return {
      skeletonDuration: metrics.skeletonDuration,
      contentLoadTime: metrics.contentLoadTime,
      cumulativeLayoutShift: totalCLS,
      animationPerformance: metrics.performanceScore,
      overallPerformanceScore: overallScore,
      layoutShiftCount: metrics.layoutShifts.length,
      isGoodPerformance: overallScore ? overallScore >= 80 : null,
      recommendations: generateRecommendations()
    };
  }, [metrics, calculatePerformanceScore]);

  const generateRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    const { skeletonDuration, layoutShifts, performanceScore } = metrics;

    if (skeletonDuration && skeletonDuration > 3000) {
      recommendations.push('Consider optimizing data loading to reduce skeleton duration');
    }

    const totalCLS = layoutShifts.reduce((sum, shift) => sum + shift.value, 0);
    if (totalCLS > 0.1) {
      recommendations.push('Improve skeleton-to-content transition to reduce layout shift');
    }

    if (performanceScore && performanceScore < 60) {
      recommendations.push('Optimize skeleton animations for better performance');
    }

    if (layoutShifts.length > 5) {
      recommendations.push('Reduce the number of layout changes during loading');
    }

    return recommendations;
  }, [metrics]);

  return {
    metrics,
    getMetricsSummary,
    isTracking: metrics.skeletonStartTime !== null && metrics.skeletonEndTime === null,
    hasCompleted: metrics.skeletonEndTime !== null
  };
}