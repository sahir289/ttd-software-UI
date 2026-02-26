/**
 * Application Configuration
 * All environment variables should be accessed through this file
 */

// API Configuration
export const config = {
  // API Base URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  
  // Use mock API (for development/testing)
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
  
  // OAuth Configuration
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
  
  // App Info
  appName: 'TTD Software',
  appDescription: 'E-commerce platform',
  
  // Feature Flags
  features: {
    socialLogin: false, // Enable when OAuth is configured
    phoneLogin: true,
    emailLogin: true,
  },
} as const

// Type for config
export type AppConfig = typeof config

// Debug function to check config (remove in production)
export function debugConfig() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.group('App Configuration')
    console.log('API URL:', config.apiUrl)
    console.log('Use Mock API:', config.useMockApi)
    console.log('Google Client ID:', config.googleClientId ? 'Set' : 'Not Set')
    console.log('Facebook App ID:', config.facebookAppId ? 'Set' : 'Not Set')
    console.groupEnd()
  }
}

export default config
