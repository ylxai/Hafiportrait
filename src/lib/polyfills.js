// Polyfills for server-side rendering
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
  if (typeof global.document === 'undefined') {
    global.document = {};
  }
}

// Define self globally for problematic libraries
if (typeof self === 'undefined') {
  global.self = global;
}