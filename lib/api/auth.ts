import type { User } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// API Response Types
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
}

interface RegisterResponse {
  user: User
  token: string
  refreshToken?: string
}

interface OtpResponse {
  success: boolean
  message: string
  otpId?: string
}

interface VerifyOtpResponse {
  user: User
  token: string
}

// Auth API Functions

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Login failed. Please check your credentials.',
      }
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken)
      }
    }

    return {
      success: true,
      data: data,
      message: 'Login successful',
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    }
  }
}

/**
 * Send OTP to phone number
 */
export async function sendOtp(phone: string): Promise<ApiResponse<OtpResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: `+91${phone}` }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send OTP. Please try again.',
      }
    }

    return {
      success: true,
      data: data,
      message: data.message || 'OTP sent successfully',
    }
  } catch (error) {
    console.error('Send OTP error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    }
  }
}

/**
 * Verify OTP and login
 */
export async function verifyOtp(phone: string, otp: string, otpId?: string): Promise<ApiResponse<VerifyOtpResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phone: `+91${phone}`, 
        otp,
        otpId 
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Invalid OTP. Please try again.',
      }
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken)
      }
    }

    return {
      success: true,
      data: data,
      message: 'OTP verified successfully',
    }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    }
  }
}

/**
 * Register new user
 */
export async function registerUser(userData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}): Promise<ApiResponse<RegisterResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth//signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        phone: `+91${userData.phone}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Registration failed. Please try again.',
      }
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken)
      }
    }

    return {
      success: true,
      data: data,
      message: 'Registration successful',
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    }
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<ApiResponse<null>> {
  try {
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
    }

    // Clear tokens from localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')

    return {
      success: true,
      message: 'Logged out successfully',
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear tokens even if API call fails
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    return {
      success: true,
      message: 'Logged out successfully',
    }
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to get user profile',
      }
    }

    return {
      success: true,
      data: data.user || data,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    }
  }
}

/**
 * Forgot password - send reset link
 */
export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send reset link',
      }
    }

    return {
      success: true,
      message: data.message || 'Password reset link sent to your email',
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to reset password',
      }
    }

    return {
      success: true,
      message: data.message || 'Password reset successfully',
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    }
  }
}

/**
 * Social login (Google/Facebook)
 */
export async function socialLogin(provider: 'google' | 'facebook', accessToken: string): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/social/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `${provider} login failed`,
      }
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken)
      }
    }

    return {
      success: true,
      data: data,
      message: 'Login successful',
    }
  } catch (error) {
    console.error('Social login error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    }
  }
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(): Promise<ApiResponse<{ token: string }>> {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token found',
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Clear tokens if refresh fails
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      return {
        success: false,
        error: data.message || 'Session expired. Please login again.',
      }
    }

    // Store new token
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }

    return {
      success: true,
      data: { token: data.token },
    }
  } catch (error) {
    console.error('Refresh token error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    }
  }
}
