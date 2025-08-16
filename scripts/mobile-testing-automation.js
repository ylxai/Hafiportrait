/**
 * Mobile Testing Automation Script
 * Automated testing untuk mobile responsiveness dan functionality
 * 
 * Usage:
 * 1. Open browser developer tools
 * 2. Copy and paste this script in console
 * 3. Run: runMobileTests()
 */

class MobileTestingAutomation {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.breakpoints = {
      mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
      mobileLarge: { width: 414, height: 896, name: 'Mobile Large (iPhone 11)' },
      tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
      desktop: { width: 1024, height: 768, name: 'Desktop' }
    };
  }

  // Utility functions
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      test: '🧪'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForElement(selector, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.wait(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }

  // Device simulation
  simulateDevice(breakpoint) {
    this.log(`📱 Simulating device: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, 'test');
    
    // Set viewport size (for testing purposes)
    if (window.chrome && window.chrome.runtime) {
      // Chrome DevTools simulation
      document.documentElement.style.width = breakpoint.width + 'px';
      document.documentElement.style.height = breakpoint.height + 'px';
    }
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    return {
      width: breakpoint.width,
      height: breakpoint.height,
      name: breakpoint.name,
      isMobile: breakpoint.width < 768
    };
  }

  // Test functions
  async testNavigationResponsiveness() {
    this.log('Testing navigation responsiveness...', 'test');
    
    const results = {
      testName: 'Navigation Responsiveness',
      passed: true,
      details: []
    };

    try {
      // Test System tab navigation
      const systemTab = await this.waitForElement('[data-value="system"], .tabs-trigger:contains("System")');
      if (systemTab) {
        systemTab.click();
        await this.wait(500);
        results.details.push('✅ System tab clickable');
      }

      // Test sub-tab navigation
      const backupTab = document.querySelector('[data-testid="backup-subtab"]') || 
                       Array.from(document.querySelectorAll('button')).find(btn => 
                         btn.textContent.includes('Backup') || btn.textContent.includes('💾')
                       );
      
      if (backupTab) {
        backupTab.click();
        await this.wait(500);
        results.details.push('✅ Backup sub-tab accessible');
      } else {
        results.details.push('⚠️ Backup sub-tab not found');
      }

    } catch (error) {
      results.passed = false;
      results.details.push(`❌ Navigation error: ${error.message}`);
    }

    return results;
  }

  async testTouchTargets() {
    this.log('Testing touch target sizes...', 'test');
    
    const results = {
      testName: 'Touch Target Sizes',
      passed: true,
      details: []
    };

    const buttons = document.querySelectorAll('button');
    let failedButtons = 0;

    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const minSize = 44; // Minimum touch target size
      
      if (rect.height < minSize || rect.width < minSize) {
        failedButtons++;
        results.details.push(`❌ Button ${index + 1}: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px (too small)`);
      }
    });

    if (failedButtons === 0) {
      results.details.push(`✅ All ${buttons.length} buttons meet minimum touch target size (44px)`);
    } else {
      results.passed = false;
      results.details.push(`❌ ${failedButtons}/${buttons.length} buttons are too small`);
    }

    return results;
  }

  async testResponsiveLayout() {
    this.log('Testing responsive layout...', 'test');
    
    const results = {
      testName: 'Responsive Layout',
      passed: true,
      details: []
    };

    try {
      // Test summary cards grid
      const summaryCards = document.querySelector('.grid-cols-2, .grid-cols-4');
      if (summaryCards) {
        const computedStyle = window.getComputedStyle(summaryCards);
        const gridCols = computedStyle.gridTemplateColumns;
        
        if (window.innerWidth < 768) {
          // Should be 2 columns on mobile
          const colCount = gridCols.split(' ').length;
          if (colCount <= 2) {
            results.details.push('✅ Mobile: 2-column grid layout correct');
          } else {
            results.passed = false;
            results.details.push(`❌ Mobile: Expected 2 columns, got ${colCount}`);
          }
        } else {
          results.details.push('✅ Desktop: Grid layout appropriate');
        }
      }

      // Test button stacking on mobile
      const buttonGroups = document.querySelectorAll('.flex.gap-2, .flex.space-x-2');
      buttonGroups.forEach((group, index) => {
        const rect = group.getBoundingClientRect();
        const children = group.children;
        
        if (window.innerWidth < 640 && children.length > 1) {
          // Check if buttons are stacked (vertical layout)
          let isStacked = true;
          for (let i = 1; i < children.length; i++) {
            const prevRect = children[i-1].getBoundingClientRect();
            const currRect = children[i].getBoundingClientRect();
            
            if (currRect.top <= prevRect.bottom + 10) {
              isStacked = false;
              break;
            }
          }
          
          if (isStacked) {
            results.details.push(`✅ Button group ${index + 1}: Properly stacked on mobile`);
          } else {
            results.details.push(`⚠️ Button group ${index + 1}: May not be stacked properly`);
          }
        }
      });

    } catch (error) {
      results.passed = false;
      results.details.push(`❌ Layout test error: ${error.message}`);
    }

    return results;
  }

  async testTextReadability() {
    this.log('Testing text readability...', 'test');
    
    const results = {
      testName: 'Text Readability',
      passed: true,
      details: []
    };

    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let tooSmallCount = 0;
    const minFontSize = 12; // Minimum readable font size

    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      if (fontSize < minFontSize && element.textContent.trim().length > 0) {
        tooSmallCount++;
      }
    });

    if (tooSmallCount === 0) {
      results.details.push(`✅ All text elements have readable font sizes (≥${minFontSize}px)`);
    } else {
      results.details.push(`⚠️ ${tooSmallCount} text elements may be too small to read`);
    }

    return results;
  }

  async testBackupStatusMonitor() {
    this.log('Testing BackupStatusMonitor mobile layout...', 'test');
    
    const results = {
      testName: 'BackupStatusMonitor Mobile',
      passed: true,
      details: []
    };

    try {
      // Look for backup status monitor elements
      const summaryCards = document.querySelectorAll('.grid-cols-2, .grid-cols-4');
      if (summaryCards.length > 0) {
        results.details.push('✅ Summary cards found');
        
        // Check for mobile-specific classes
        const mobileClasses = [
          'text-xs', 'sm:text-sm',
          'h-6', 'w-6', 'sm:h-8', 'sm:w-8',
          'p-3', 'sm:p-4',
          'gap-3', 'sm:gap-4'
        ];
        
        let foundMobileClasses = 0;
        mobileClasses.forEach(className => {
          if (document.querySelector(`.${className}`)) {
            foundMobileClasses++;
          }
        });
        
        if (foundMobileClasses > 0) {
          results.details.push(`✅ Mobile-responsive classes found (${foundMobileClasses}/${mobileClasses.length})`);
        } else {
          results.details.push('⚠️ Mobile-responsive classes not detected');
        }
      }

      // Check for control buttons
      const controlButtons = document.querySelectorAll('button');
      const refreshButton = Array.from(controlButtons).find(btn => 
        btn.textContent.includes('Refresh') || btn.textContent.includes('Auto')
      );
      
      if (refreshButton) {
        results.details.push('✅ Control buttons found');
      }

    } catch (error) {
      results.passed = false;
      results.details.push(`❌ BackupStatusMonitor test error: ${error.message}`);
    }

    return results;
  }

  async testPerformance() {
    this.log('Testing performance metrics...', 'test');
    
    const results = {
      testName: 'Performance Metrics',
      passed: true,
      details: []
    };

    try {
      // Test loading performance
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        if (loadTime < 3000) {
          results.details.push(`✅ Page load time: ${loadTime.toFixed(0)}ms`);
        } else {
          results.passed = false;
          results.details.push(`❌ Page load time too slow: ${loadTime.toFixed(0)}ms`);
        }
      }

      // Test memory usage
      if (performance.memory) {
        const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        results.details.push(`ℹ️ Memory usage: ${memoryMB}MB`);
        
        if (performance.memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
          results.details.push('⚠️ High memory usage detected');
        }
      }

      // Test for layout shifts
      const layoutShifts = performance.getEntriesByType('layout-shift');
      if (layoutShifts.length === 0) {
        results.details.push('✅ No layout shifts detected');
      } else {
        results.details.push(`⚠️ ${layoutShifts.length} layout shifts detected`);
      }

    } catch (error) {
      results.details.push(`⚠️ Performance test error: ${error.message}`);
    }

    return results;
  }

  // Main test runner
  async runTestsForBreakpoint(breakpointName) {
    const breakpoint = this.breakpoints[breakpointName];
    if (!breakpoint) {
      this.log(`Unknown breakpoint: ${breakpointName}`, 'error');
      return;
    }

    this.log(`\n🚀 Starting tests for ${breakpoint.name}`, 'test');
    
    // Simulate device
    const deviceInfo = this.simulateDevice(breakpoint);
    await this.wait(1000); // Wait for layout to settle

    // Run tests
    const tests = [
      () => this.testNavigationResponsiveness(),
      () => this.testTouchTargets(),
      () => this.testResponsiveLayout(),
      () => this.testTextReadability(),
      () => this.testBackupStatusMonitor(),
      () => this.testPerformance()
    ];

    const breakpointResults = {
      device: deviceInfo,
      tests: [],
      summary: { passed: 0, failed: 0, warnings: 0 }
    };

    for (const test of tests) {
      try {
        const result = await test();
        breakpointResults.tests.push(result);
        
        if (result.passed) {
          breakpointResults.summary.passed++;
        } else {
          breakpointResults.summary.failed++;
        }
        
        // Count warnings
        const warnings = result.details.filter(detail => detail.includes('⚠️')).length;
        breakpointResults.summary.warnings += warnings;
        
      } catch (error) {
        this.log(`Test failed: ${error.message}`, 'error');
        breakpointResults.summary.failed++;
      }
    }

    this.testResults.push(breakpointResults);
    return breakpointResults;
  }

  // Generate test report
  generateReport() {
    this.log('\n📊 Generating Test Report...', 'test');
    
    console.group('📱 Mobile Testing Report');
    
    this.testResults.forEach(deviceResult => {
      console.group(`📱 ${deviceResult.device.name}`);
      
      console.log(`📊 Summary: ${deviceResult.summary.passed} passed, ${deviceResult.summary.failed} failed, ${deviceResult.summary.warnings} warnings`);
      
      deviceResult.tests.forEach(test => {
        console.group(`${test.passed ? '✅' : '❌'} ${test.testName}`);
        test.details.forEach(detail => console.log(detail));
        console.groupEnd();
      });
      
      console.groupEnd();
    });
    
    console.groupEnd();

    // Overall summary
    const totalPassed = this.testResults.reduce((sum, result) => sum + result.summary.passed, 0);
    const totalFailed = this.testResults.reduce((sum, result) => sum + result.summary.failed, 0);
    const totalWarnings = this.testResults.reduce((sum, result) => sum + result.summary.warnings, 0);
    
    this.log(`\n🎯 Overall Results: ${totalPassed} passed, ${totalFailed} failed, ${totalWarnings} warnings`, 'test');
    
    return {
      devices: this.testResults,
      summary: { totalPassed, totalFailed, totalWarnings }
    };
  }

  // Public API
  async runAllTests() {
    this.log('🚀 Starting Mobile Testing Automation...', 'test');
    this.testResults = [];
    
    // Test all breakpoints
    for (const breakpointName of Object.keys(this.breakpoints)) {
      await this.runTestsForBreakpoint(breakpointName);
      await this.wait(500); // Brief pause between tests
    }
    
    return this.generateReport();
  }

  async runMobileOnly() {
    this.log('📱 Running mobile-only tests...', 'test');
    this.testResults = [];
    
    await this.runTestsForBreakpoint('mobile');
    await this.runTestsForBreakpoint('mobileLarge');
    
    return this.generateReport();
  }
}

// Global functions for easy access
window.MobileTestingAutomation = MobileTestingAutomation;

window.runMobileTests = async function() {
  const tester = new MobileTestingAutomation();
  return await tester.runAllTests();
};

window.runMobileOnlyTests = async function() {
  const tester = new MobileTestingAutomation();
  return await tester.runMobileOnly();
};

// Auto-run if script is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
  console.log(`
🧪 Mobile Testing Automation Loaded!

Usage:
  runMobileTests()     - Test all breakpoints
  runMobileOnlyTests() - Test mobile breakpoints only

Example:
  const results = await runMobileTests();
  `);
}