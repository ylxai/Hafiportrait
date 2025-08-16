/**
 * Quick Start Script for Device Testing
 * Membantu memulai testing dengan target devices
 */

console.log(`
🚀 HafiPortrait Mobile Device Testing - Quick Start
==================================================

📱 TESTING EXECUTION PLAN READY!

📋 Pre-Testing Checklist:
┌─────────────────────────────────────────────────┐
│ [ ] Development server running (npm run dev)   │
│ [ ] Admin credentials ready                     │
│ [ ] Test events created with sample photos     │
│ [ ] Target devices charged and ready           │
│ [ ] WiFi and mobile data connections stable    │
│ [ ] Testing documentation accessible           │
└─────────────────────────────────────────────────┘

🎯 PHASE 1: Priority Devices (Start Here)
┌─────────────────────────────────────────────────┐
│ 🔴 CRITICAL - Must Test:                       │
│                                                 │
│ 📱 iPhone 14/15 (iOS Safari)                   │
│    Screen: 390×844, Focus: iOS behaviors       │
│                                                 │
│ 📱 Samsung Galaxy S24 (Android Chrome)         │
│    Screen: 384×854, Focus: Android behaviors   │
│                                                 │
│ 📱 Google Pixel 8 (Android Chrome)             │
│    Screen: 412×915, Focus: Pure Android        │
└─────────────────────────────────────────────────┘

🧪 TESTING WORKFLOW:
┌─────────────────────────────────────────────────┐
│ 1. Device Setup & Baseline Testing             │
│    ├── Clear browser cache                     │
│    ├── Test initial page load                  │
│    └── Verify login functionality              │
│                                                 │
│ 2. Core Functionality Testing                  │
│    ├── System Tab navigation                   │
│    ├── BackupStatusMonitor mobile UI           │
│    └── EventList backup integration            │
│                                                 │
│ 3. Performance Testing                         │
│    ├── Loading times (WiFi/Mobile data)        │
│    ├── Touch response validation               │
│    └── Memory usage monitoring                 │
│                                                 │
│ 4. Automated Testing                           │
│    ├── Browser console automation              │
│    ├── Touch target validation                 │
│    └── Responsive layout checks                │
│                                                 │
│ 5. Results Documentation                       │
│    ├── Fill device test report                 │
│    ├── Take screenshots of issues              │
│    └── Rate overall experience                 │
└─────────────────────────────────────────────────┘

🌐 TEST URLS:
┌─────────────────────────────────────────────────┐
│ Local:  http://localhost:3000/admin            │
│ Staging: https://staging.hafiportrait.photography/admin │
│ Production: https://hafiportrait.photography/admin │
└─────────────────────────────────────────────────┘

🤖 AUTOMATED TESTING:
┌─────────────────────────────────────────────────┐
│ 1. Open browser DevTools (F12)                 │
│ 2. Go to Console tab                           │
│ 3. Copy automation script from:                │
│    scripts/mobile-testing-automation.js        │
│ 4. Run: await runMobileTests()                 │
└─────────────────────────────────────────────────┘

📊 SUCCESS CRITERIA:
┌─────────────────────────────────────────────────┐
│ ✅ Touch targets ≥ 44px                        │
│ ✅ Loading time < 3s (fast) / < 5s (slow)      │
│ ✅ Text readable without zoom                   │
│ ✅ No horizontal scrolling                     │
│ ✅ Smooth scrolling and touch response         │
│ ✅ 2-column grid on mobile                     │
│ ✅ Buttons stack vertically                    │
│ ✅ All functionality accessible                │
└─────────────────────────────────────────────────┘

📋 DOCUMENTATION:
┌─────────────────────────────────────────────────┐
│ 📖 Comprehensive Guide:                        │
│    docs/REAL_DEVICE_TESTING_GUIDE.md           │
│                                                 │
│ ✅ Quick Checklist:                            │
│    docs/MOBILE_TESTING_CHECKLIST.md            │
│                                                 │
│ 🎯 Execution Plan:                             │
│    docs/DEVICE_TESTING_EXECUTION_PLAN.md       │
│                                                 │
│ 🤖 Automation Script:                          │
│    scripts/mobile-testing-automation.js        │
└─────────────────────────────────────────────────┘

🚀 READY TO START TESTING!

Next Steps:
1. Choose your first device (iPhone recommended)
2. Open docs/DEVICE_TESTING_EXECUTION_PLAN.md
3. Follow Step 1: Device Setup
4. Begin testing with System Tab navigation
5. Document results as you go

Good luck with testing! 📱✨
`);

// Helper functions for testing
window.startDeviceTesting = function() {
  console.log(`
🎯 Starting Device Testing Session...

Current Environment:
- URL: ${window.location.href}
- Viewport: ${window.innerWidth}x${window.innerHeight}
- User Agent: ${navigator.userAgent.substring(0, 50)}...
- Touch Support: ${('ontouchstart' in window) ? 'Yes' : 'No'}

📱 Device Detection:
${getDeviceInfo()}

🧪 Quick Tests Available:
- runMobileTests() - Full automated testing
- runMobileOnlyTests() - Mobile-specific tests
- checkTouchTargets() - Validate touch target sizes
- checkPerformance() - Performance metrics
- checkLayout() - Layout validation

Ready to begin! 🚀
  `);
};

function getDeviceInfo() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = window.devicePixelRatio || 1;
  
  let deviceType = 'Unknown';
  if (width <= 480) deviceType = 'Mobile (Small)';
  else if (width <= 768) deviceType = 'Mobile (Large)';
  else if (width <= 1024) deviceType = 'Tablet';
  else deviceType = 'Desktop';
  
  return `
- Device Type: ${deviceType}
- Screen Size: ${width}x${height}
- Pixel Ratio: ${ratio}
- Orientation: ${width > height ? 'Landscape' : 'Portrait'}`;
}

// Quick validation functions
window.checkTouchTargets = function() {
  const buttons = document.querySelectorAll('button, a, input[type="submit"], input[type="button"]');
  let failedCount = 0;
  
  console.log('🔍 Checking Touch Targets...');
  
  buttons.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44;
    
    if (rect.height < minSize || rect.width < minSize) {
      failedCount++;
      console.log(`❌ Element ${index + 1}: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px (too small)`);
    }
  });
  
  if (failedCount === 0) {
    console.log(`✅ All ${buttons.length} interactive elements meet touch target requirements!`);
  } else {
    console.log(`⚠️ ${failedCount}/${buttons.length} elements are too small for touch`);
  }
  
  return { total: buttons.length, failed: failedCount };
};

window.checkPerformance = function() {
  console.log('📊 Performance Check...');
  
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    console.log(`⏱️ Page Load Time: ${loadTime.toFixed(0)}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Excellent loading performance!');
    } else if (loadTime < 5000) {
      console.log('⚠️ Acceptable loading performance');
    } else {
      console.log('❌ Slow loading performance');
    }
  }
  
  if (performance.memory) {
    const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
    console.log(`💾 Memory Usage: ${memoryMB}MB`);
  }
  
  return {
    loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null,
    memory: performance.memory ? performance.memory.usedJSHeapSize : null
  };
};

window.checkLayout = function() {
  console.log('📐 Layout Check...');
  
  // Check for mobile-responsive classes
  const mobileClasses = [
    'grid-cols-2',
    'sm:grid-cols-4',
    'flex-col',
    'sm:flex-row',
    'text-xs',
    'sm:text-sm'
  ];
  
  let foundClasses = 0;
  mobileClasses.forEach(className => {
    if (document.querySelector(`.${className}`)) {
      foundClasses++;
      console.log(`✅ Found responsive class: ${className}`);
    }
  });
  
  console.log(`📊 Responsive classes found: ${foundClasses}/${mobileClasses.length}`);
  
  // Check viewport
  const viewport = window.innerWidth;
  if (viewport < 640) {
    console.log('📱 Mobile viewport detected - checking mobile layout...');
  } else if (viewport < 1024) {
    console.log('📱 Tablet viewport detected - checking tablet layout...');
  } else {
    console.log('🖥️ Desktop viewport detected - checking desktop layout...');
  }
  
  return { foundClasses, totalClasses: mobileClasses.length, viewport };
};

// Auto-start if on admin page
if (window.location.pathname.includes('/admin')) {
  setTimeout(() => {
    console.log('🎯 Device Testing Tools Loaded! Type startDeviceTesting() to begin.');
  }, 1000);
}