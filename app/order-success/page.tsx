"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Package, Truck, MapPin, ArrowRight, Download, Share2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import confetti from "canvas-confetti"

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const orderNumber = searchParams.get("order") || "ORD-2026-ABC123"
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!showConfetti) {
      setShowConfetti(true)
      // Fire confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [showConfetti])

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    toast({
      title: "Copied!",
      description: "Order number copied to clipboard",
    })
  }

  const orderTimeline = [
    { status: "Order Placed", date: new Date().toISOString(), completed: true, icon: CheckCircle2 },
    { status: "Processing", date: "", completed: false, icon: Package },
    { status: "Shipped", date: "", completed: false, icon: Truck },
    { status: "Delivered", date: "", completed: false, icon: MapPin },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-success/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>
        </div>
        
        {/* Success Message */}
        <h1 className="mb-2 text-3xl font-bold text-balance">Order Placed Successfully!</h1>
        <p className="mb-8 text-muted-foreground">
          Thank you for shopping with TTD software. Your order has been confirmed.
        </p>
        
        {/* Order Number Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardDescription>Order Number</CardDescription>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              {orderNumber}
              <button
                onClick={handleCopyOrderNumber}
                className="rounded-md p-1 hover:bg-muted"
                title="Copy order number"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Order placed on {formatDate(new Date())}
            </p>
            <p className="mt-1 text-sm">
              A confirmation email has been sent to your registered email address.
            </p>
          </CardContent>
        </Card>
        
        {/* Order Timeline */}
        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {orderTimeline.map((item, index) => (
                <div key={item.status} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        item.completed
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    {index < orderTimeline.length - 1 && (
                      <div
                        className={`mt-2 h-full w-0.5 ${
                          item.completed ? "bg-success" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`font-medium ${item.completed ? "" : "text-muted-foreground"}`}>
                      {item.status}
                    </p>
                    {item.date && (
                      <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                    )}
                    {item.status === "Delivered" && (
                      <p className="text-sm text-muted-foreground">Expected: 3-5 business days</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/account/orders">
            <Button size="lg">
              Track Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
        
        <Separator className="my-8" />
        
        {/* Additional Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="ghost" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share Order
          </Button>
        </div>
        
        {/* Help Section */}
        <div className="mt-8 rounded-lg bg-muted p-6">
          <h3 className="mb-2 font-semibold">Need Help?</h3>
          <p className="text-sm text-muted-foreground">
            If you have any questions about your order, please contact our customer support
            at <a href="mailto:support@TTDsoftware.com" className="text-primary hover:underline">support@TTDsoftware.com</a> or
            call us at <a href="tel:+911800123456" className="text-primary hover:underline">1800-123-456</a> (Toll Free)
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
