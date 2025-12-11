/**
 * Environment Variables Configuration
 * 
 * This file provides type-safe access to environment variables
 */

interface EnvConfig {
  apiUrl: string;
  appUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

export const env: EnvConfig = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8080/query'),
  appUrl: getEnvVar('VITE_APP_URL', 'http://localhost:3000'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
};

// Validate critical environment variables on app start
if (env.isProduction && !import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL not set in production environment');
}
