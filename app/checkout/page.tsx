"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  CreditCard,
  Truck,
  Check,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Smartphone,
  Building,
  Wallet,
  Banknote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useCartStore, useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatPrice, validatePincode, validatePhone, calculateGST, sleep, generateOrderNumber } from "@/lib/utils"
import type { Address } from "@/lib/types"

const CHECKOUT_STEPS = [
  { id: 1, name: "Address", icon: MapPin },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Review", icon: Check },
]

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
]

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", description: "Pay using UPI apps", icon: Smartphone },
  { id: "card", name: "Credit/Debit Card", description: "Visa, Mastercard, Rupay", icon: CreditCard },
  { id: "netbanking", name: "Net Banking", description: "All major banks", icon: Building },
  { id: "wallet", name: "Wallets", description: "Paytm, PhonePe, etc.", icon: Wallet },
  { id: "cod", name: "Cash on Delivery", description: "Pay when delivered", icon: Banknote },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Use separate stores
  const cartItems = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      name: "Home",
      fullName: "Demo User",
      phone: "9876543210",
      addressLine1: "123, Park Street",
      addressLine2: "Near Metro Station",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true,
      type: "home"
    },
  ])
  const [selectedAddress, setSelectedAddress] = useState<string>("addr-1")
  const [selectedPayment, setSelectedPayment] = useState<string>("")
  const [upiId, setUpiId] = useState("")
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [saveCard, setSaveCard] = useState(false)
  
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  })
  
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout")
    } else if (cartItems.length === 0) {
      router.push("/cart")
    }
  }, [isAuthenticated, cartItems, router])

  // Calculate totals using cart item structure
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount) : 0
  const deliveryCharge = subtotal > 499 ? 0 : 40
  const taxableAmount = subtotal - discount
  const gst = calculateGST(taxableAmount)
  const total = taxableAmount + deliveryCharge

  const validateAddressForm = () => {
    const errors: Record<string, string> = {}
    
    if (!newAddress.fullName?.trim()) errors.fullName = "Name is required"
    if (!newAddress.phone) errors.phone = "Phone is required"
    else if (!validatePhone(newAddress.phone)) errors.phone = "Invalid phone number"
    if (!newAddress.addressLine1?.trim()) errors.addressLine1 = "Address is required"
    if (!newAddress.city?.trim()) errors.city = "City is required"
    if (!newAddress.state) errors.state = "State is required"
    if (!newAddress.pincode) errors.pincode = "PIN code is required"
    else if (!validatePincode(newAddress.pincode)) errors.pincode = "Invalid PIN code"
    
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveAddress = () => {
    if (!validateAddressForm()) return
    
    if (editingAddress) {
      setAddresses(addresses.map((addr) =>
        addr.id === editingAddress.id
          ? { ...addr, ...newAddress }
          : newAddress.isDefault ? { ...addr, isDefault: false } : addr
      ))
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        ...newAddress as Omit<Address, "id">,
      }
      if (newAddr.isDefault) {
        setAddresses(addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr))
      } else {
        setAddresses([...addresses, newAddr])
      }
      setSelectedAddress(newAddr.id)
    }
    
    setShowAddressDialog(false)
    setEditingAddress(null)
    setNewAddress({
      name: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    })
    
    toast({
      title: editingAddress ? "Address updated" : "Address added",
      description: "Your address has been saved successfully.",
    })
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id))
    if (selectedAddress === id) {
      setSelectedAddress(addresses.find((a) => a.id !== id)?.id || "")
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setIsLoading(true)
    await sleep(1000)
    
    // Mock coupon validation
    const validCoupons: Record<string, number> = {
      "SAVE10": 0.1,
      "FIRST20": 0.2,
      "SHOPINDIA": 0.15,
    }
    
    const upperCode = couponCode.toUpperCase()
    if (validCoupons[upperCode]) {
      setAppliedCoupon({ code: upperCode, discount: validCoupons[upperCode] })
      toast({
        title: "Coupon applied!",
        description: `You saved ${formatPrice(Math.round(subtotal * validCoupons[upperCode]))}`,
      })
    } else {
      toast({
        title: "Invalid coupon",
        description: "This coupon code is not valid or has expired.",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address required",
        description: "Please select a delivery address.",
        variant: "destructive",
      })
      setCurrentStep(1)
      return
    }
    
    if (!selectedPayment) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive",
      })
      setCurrentStep(2)
      return
    }
    
    if (selectedPayment === "upi" && !upiId) {
      toast({
        title: "UPI ID required",
        description: "Please enter your UPI ID.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    await sleep(2000)
    
    const orderNumber = generateOrderNumber()
    clearCart()
    setIsLoading(false)
    
    router.push(`/order-success?order=${orderNumber}`)
  }

  const selectedAddressData = addresses.find((a) => a.id === selectedAddress)

  if (!isAuthenticated || cartItems.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Link href="/cart" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {CHECKOUT_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.name}</span>
                </button>
                {index < CHECKOUT_STEPS.length - 1 && (
                  <ChevronRight className="mx-2 h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription>
                    Select or add a delivery address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`relative rounded-lg border p-4 transition-colors ${
                          selectedAddress === address.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{address.fullName}</span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                              {address.name && (
                                <Badge variant="outline" className="text-xs">{address.name}</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="mt-1 text-sm">
                              Phone: +91 {address.phone}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingAddress(address)
                                setNewAddress(address)
                                setShowAddressDialog(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {addresses.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setEditingAddress(null)
                      setNewAddress({
                        name: "",
                        fullName: user?.name || "",
                        phone: user?.phone?.replace("+91 ", "") || "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        pincode: "",
                        isDefault: addresses.length === 0,
                      })
                      setShowAddressDialog(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                  </Button>
                  
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedAddress}
                    >
                      Continue to Payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to pay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selectedPayment}
                    onValueChange={setSelectedPayment}
                    className="space-y-3"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className={`relative rounded-lg border p-4 transition-colors ${
                          selectedPayment === method.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <method.icon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <Label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                          {method.id === "cod" && (
                            <Badge variant="secondary">+ Rs. 29</Badge>
                          )}
                        </div>
                        
                        {/* UPI ID Input */}
                        {selectedPayment === "upi" && method.id === "upi" && (
                          <div className="mt-4 pl-8">
                            <Label htmlFor="upiId">Enter UPI ID</Label>
                            <Input
                              id="upiId"
                              placeholder="yourname@upi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="mt-1"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                              Example: 9876543210@paytm, name@oksbi
                            </p>
                          </div>
                        )}
                        
                        {/* Card Input */}
                        {selectedPayment === "card" && method.id === "card" && (
                          <div className="mt-4 space-y-4 pl-8">
                            <div>
                              <Label>Card Number</Label>
                              <Input placeholder="1234 5678 9012 3456" className="mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Expiry Date</Label>
                                <Input placeholder="MM/YY" className="mt-1" />
                              </div>
                              <div>
                                <Label>CVV</Label>
                                <Input placeholder="123" type="password" className="mt-1" />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="saveCard"
                                checked={saveCard}
                                onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                              />
                              <Label htmlFor="saveCard" className="text-sm">
                                Save card for future payments
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <span className="text-sm">
                      Your payment information is secure and encrypted
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedPayment || (selectedPayment === "upi" && !upiId)}
                    >
                      Review Order
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Delivery Address Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-success" />
                      <CardTitle className="text-base">Delivery Address</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                      Change
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {selectedAddressData && (
                      <div>
                        <p className="font-medium">{selectedAddressData.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddressData.addressLine1}
                          {selectedAddressData.addressLine2 && `, ${selectedAddressData.addressLine2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddressData.city}, {selectedAddressData.state} - {selectedAddressData.pincode}
                        </p>
                        <p className="text-sm">Phone: +91 {selectedAddressData.phone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Payment Method Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-success" />
                      <CardTitle className="text-base">Payment Method</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                      Change
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}
                    </p>
                    {selectedPayment === "upi" && (
                      <p className="text-sm text-muted-foreground">UPI ID: {upiId}</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Order Items ({cartItems.length})</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.product.images?.[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Expected delivery: 3-5 business days
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order - {formatPrice(total + (selectedPayment === "cod" ? 29 : 0))}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAppliedCoupon(null)
                        setCouponCode("")
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleApplyCoupon} disabled={isLoading}>
                      Apply
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-success">
                    Coupon {appliedCoupon.code} applied! You save {formatPrice(discount)}
                  </p>
                )}
                
                <Separator />
                
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryCharge === 0 ? "text-success" : ""}>
                      {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  {selectedPayment === "cod" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">COD Charges</span>
                      <span>{formatPrice(29)}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* GST Breakdown */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tax Details (Inclusive)</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>CGST (9%)</span>
                    <span>{formatPrice(gst.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>SGST (9%)</span>
                    <span>{formatPrice(gst.sgst)}</span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total + (selectedPayment === "cod" ? 29 : 0))}</span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  * Prices are inclusive of all taxes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              Enter your delivery address details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressName">Address Label (Optional)</Label>
                <Input
                  id="addressName"
                  placeholder="Home, Office, etc."
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                />
                {addressErrors.fullName && (
                  <p className="text-xs text-destructive mt-1">{addressErrors.fullName}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="addressPhone">Phone Number *</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="addressPhone"
                  placeholder="10-digit number"
                  className="rounded-l-none"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
              </div>
              {addressErrors.phone && (
                <p className="text-xs text-destructive mt-1">{addressErrors.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="House/Flat No., Building Name, Street"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
              />
              {addressErrors.addressLine1 && (
                <p className="text-xs text-destructive mt-1">{addressErrors.addressLine1}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                placeholder="Landmark, Area"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                {addressErrors.city && (
                  <p className="text-xs text-destructive mt-1">{addressErrors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code *</Label>
                <Input
                  id="pincode"
                  placeholder="6-digit PIN"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                />
                {addressErrors.pincode && (
                  <p className="text-xs text-destructive mt-1">{addressErrors.pincode}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={newAddress.state}
                onValueChange={(value) => setNewAddress({ ...newAddress, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addressErrors.state && (
                <p className="text-xs text-destructive mt-1">{addressErrors.state}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={newAddress.isDefault}
                onCheckedChange={(checked) => setNewAddress({ ...newAddress, isDefault: checked as boolean })}
              />
              <Label htmlFor="isDefault" className="text-sm">
                Set as default address
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              {editingAddress ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
