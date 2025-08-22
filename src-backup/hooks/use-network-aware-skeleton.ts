'use client';

import { useState, useEffect } from 'react';

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface SkeletonConfig {
  animationDuration: number;
  shimmerEnabled: boolean;
  itemCount: number;
  complexityLevel: 'low' | 'medium' | 'high';
  preloadDelay: number;
}

export function useNetworkAwareSkeleton() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [skeletonConfig, setSkeletonConfig] = useState<SkeletonConfig>({
    animationDuration: 2000,
    shimmerEnabled: true,
    itemCount: 8,
    complexityLevel: 'high',
    preloadDelay: 0
  });

  useEffect(() => {
    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    } else {
      // Fallback: Estimate network speed based on loading performance
      estimateNetworkSpeed();
    }
  }, []);

  useEffect(() => {
    if (networkInfo) {
      const config = calculateOptimalSkeletonConfig(networkInfo);
      setSkeletonConfig(config);
    }
  }, [networkInfo]);

  const estimateNetworkSpeed = async () => {
    try {
      const startTime = performance.now();
      
      // Test with a small image to estimate speed
      const testImage = new Image();
      testImage.onload = () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Estimate effective type based on load time
        let effectiveType: NetworkInfo['effectiveType'] = '4g';
        if (loadTime > 1000) effectiveType = '2g';
        else if (loadTime > 500) effectiveType = '3g';
        else if (loadTime > 200) effectiveType = 'slow-2g';
        
        setNetworkInfo({
          effectiveType,
          downlink: loadTime > 500 ? 0.5 : 2.0,
          rtt: loadTime,
          saveData: false
        });
      };
      
      // Use a small test image (1KB)
      testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    } catch (error) {
      // Default to medium performance config
      setNetworkInfo({
        effectiveType: '3g',
        downlink: 1.0,
        rtt: 300,
        saveData: false
      });
    }
  };

  const calculateOptimalSkeletonConfig = (network: NetworkInfo): SkeletonConfig => {
    const { effectiveType, downlink, rtt, saveData } = network;
    
    // Base configuration
    let config: SkeletonConfig = {
      animationDuration: 2000,
      shimmerEnabled: true,
      itemCount: 8,
      complexityLevel: 'high',
      preloadDelay: 0
    };

    // Optimize based on network conditions
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        config = {
          animationDuration: 3000, // Slower animation for very slow networks
          shimmerEnabled: false,    // Disable shimmer to save resources
          itemCount: 4,            // Fewer skeleton items
          complexityLevel: 'low',   // Simple skeleton shapes
          preloadDelay: 100        // Small delay to prioritize critical resources
        };
        break;
        
      case '3g':
        config = {
          animationDuration: 2500,
          shimmerEnabled: downlink > 0.5, // Enable shimmer if bandwidth allows
          itemCount: 6,
          complexityLevel: 'medium',
          preloadDelay: 50
        };
        break;
        
      case '4g':
        config = {
          animationDuration: 2000,
          shimmerEnabled: true,
          itemCount: 8,
          complexityLevel: 'high',
          preloadDelay: 0
        };
        break;
    }

    // Additional optimizations for save-data mode
    if (saveData) {
      config.shimmerEnabled = false;
      config.itemCount = Math.min(config.itemCount, 4);
      config.complexityLevel = 'low';
    }

    // Optimize for high latency
    if (rtt > 500) {
      config.preloadDelay = Math.min(config.preloadDelay + 100, 300);
      config.animationDuration = Math.min(config.animationDuration + 500, 4000);
    }

    return config;
  };

  const getSkeletonClassName = (baseClass: string = '') => {
    const classes = [baseClass];
    
    if (!skeletonConfig.shimmerEnabled) {
      classes.push('animate-pulse');
    } else {
      classes.push('shimmer-animation');
    }
    
    switch (skeletonConfig.complexityLevel) {
      case 'low':
        classes.push('skeleton-simple');
        break;
      case 'medium':
        classes.push('skeleton-medium');
        break;
      case 'high':
        classes.push('skeleton-complex');
        break;
    }
    
    return classes.filter(Boolean).join(' ');
  };

  const shouldShowSkeleton = (estimatedLoadTime: number) => {
    // Show skeleton only if estimated load time is significant
    const threshold = networkInfo?.effectiveType === '4g' ? 500 : 200;
    return estimatedLoadTime > threshold;
  };

  return {
    networkInfo,
    skeletonConfig,
    getSkeletonClassName,
    shouldShowSkeleton,
    isSlowNetwork: networkInfo?.effectiveType === '2g' || networkInfo?.effectiveType === 'slow-2g',
    isSaveDataMode: networkInfo?.saveData || false
  };
}