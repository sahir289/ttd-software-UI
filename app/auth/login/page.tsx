"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { validateEmail, validatePhone } from "@/lib/utils"
import { loginWithEmail, sendOtp, verifyOtp } from "@/lib/api/auth"
import config, { debugConfig } from "@/lib/config"

// Set to true to use mock data instead of real API
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)
  
  // Debug config on mount (only in development)
  useEffect(() => {
    debugConfig()
  }, [])
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpSent, setOtpSent] = useState(false)
  const [otpId, setOtpId] = useState<string | undefined>()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (loginMethod === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email"
      }
      
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = "Phone number is required"
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = "Please enter a valid 10-digit phone number"
      }
      
      if (otpSent && !formData.otp) {
        newErrors.otp = "OTP is required"
      } else if (otpSent && formData.otp.length !== 6) {
        newErrors.otp = "OTP must be 6 digits"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setErrors({ phone: "Phone number is required" })
      return
    }
    if (!validatePhone(formData.phone)) {
      setErrors({ phone: "Please enter a valid 10-digit phone number" })
      return
    }
    
    setIsLoading(true)
    setErrors({})

    try {
      if (USE_MOCK_API) {
        // Mock API response
        await new Promise(resolve => setTimeout(resolve, 1500))
        setOtpSent(true)
        toast({
          title: "OTP Sent",
          description: `OTP has been sent to +91 ${formData.phone}`,
        })
      } else {
        // Real API call
        const response = await sendOtp(formData.phone)
        
        if (response.success) {
          setOtpSent(true)
          setOtpId(response.data?.otpId)
          toast({
            title: "OTP Sent",
            description: response.message || `OTP has been sent to +91 ${formData.phone}`,
          })
        } else {
          setErrors({ phone: response.error || "Failed to send OTP" })
          toast({
            title: "Error",
            description: response.error || "Failed to send OTP",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      if (config.useMockApi) {
        // Mock API response
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const mockUser = {
          id: "user-1",
          email: formData.email,
          firstName: "Demo User",
          lastName: "test",
          phone: "+91 9876543210",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
          addresses: [],
          role: 'user' as const,
          createdAt: new Date().toISOString(),
        }
        
        login(mockUser)
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
        router.push(redirectUrl)
      } else {
        // Real API call
        const response = await loginWithEmail(formData.email, formData.password)
        
        if (response.success && response.data) {
          login(response.data.user)
          toast({
            title: "Welcome back!",
            description: "You have been logged in successfully.",
          })
          router.push(redirectUrl)
        } else {
          setErrors({ 
            email: response.error || "Invalid credentials" 
          })
          toast({
            title: "Login Failed",
            description: response.error || "Invalid email or password",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneLogin = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      if (USE_MOCK_API) {
        // Mock API response
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const mockUser = {
          id: "user-1",
          email: `${formData.phone}@phone.example.com`,
          firstName: "Demo User",
          lastName: "test",
          phone: `+91 ${formData.phone}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.phone}`,
          addresses: [],
          role: 'user' as const,
          createdAt: new Date().toISOString(),
        }
        
        login(mockUser)
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
        router.push(redirectUrl)
      } else {
        // Real API call
        const response = await verifyOtp(formData.phone, formData.otp, otpId)
        
        if (response.success && response.data) {
          login(response.data.user)
          toast({
            title: "Welcome back!",
            description: "You have been logged in successfully.",
          })
          router.push(redirectUrl)
        } else {
          setErrors({ 
            otp: response.error || "Invalid OTP" 
          })
          toast({
            title: "Verification Failed",
            description: response.error || "Invalid OTP. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Phone login error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (loginMethod === "email") {
      await handleEmailLogin()
    } else {
      await handlePhoneLogin()
    }
  }

  const handleGoogleLogin = async () => {
    // Implement Google OAuth flow
    toast({
      title: "Coming Soon",
      description: "Google login will be available soon.",
    })
  }

  const handleFacebookLogin = async () => {
    // Implement Facebook OAuth flow
    toast({
      title: "Coming Soon",
      description: "Facebook login will be available soon.",
    })
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your TTD software account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginMethod} onValueChange={(v) => {
            setLoginMethod(v as "email" | "phone")
            setErrors({})
            setOtpSent(false)
            setOtpId(undefined)
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="phone" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit number"
                        className="rounded-l-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        disabled={otpSent || isLoading}
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
                
                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      disabled={isLoading}
                    />
                    {errors.otp && (
                      <p className="text-sm text-destructive">{errors.otp}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
                
                {!otpSent ? (
                  <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                ) : (
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              or continue with
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full bg-transparent"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-transparent"
              onClick={handleFacebookLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
