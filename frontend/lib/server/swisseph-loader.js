// server-only removed for client-side compatibility
// This file is strictly for server-side loading of native modules

export async function loadSwisseph() {
    if (typeof window !== 'undefined') return null;
    // Use require to avoid Webpack's static analysis during client builds
    const swisseph = require('swisseph');
    return swisseph;
}

export async function loadPath() {
    if (typeof window !== 'undefined') return null;
    return require('path');
}
