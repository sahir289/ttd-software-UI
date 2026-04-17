const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'checkout', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. imports
content = content.replace(
  `import type { Address } from "@/lib/types"`,
  `import type { Address } from "@/lib/types"\nimport QRCode from "react-qr-code"`
);

// 2. PAYMENT_METHODS
content = content.replace(
  /const PAYMENT_METHODS = \[[\s\S]*?\]/,
  `const PAYMENT_METHODS = [\n  { id: "upi", name: "QR / UPI", description: "Scan QR code to pay", icon: Smartphone },\n]`
);

// 3. State
content = content.replace(
  /const \[selectedAddress, setSelectedAddress\] = useState<string>\("addr-1"\)\n  const \[selectedPayment, setSelectedPayment\] = useState<string>\(""\)\n  const \[upiId, setUpiId\] = useState\(""\)\n  const \[showAddressDialog, setShowAddressDialog\] = useState\(false\)\n  const \[editingAddress, setEditingAddress\] = useState<Address \| null>\(null\)\n  const \[couponCode, setCouponCode\] = useState\(""\)\n  const \[appliedCoupon, setAppliedCoupon\] = useState<\{ code: string; discount: number \} \| null>\(null\)\n  const \[saveCard, setSaveCard\] = useState\(false\)/,
  `const [selectedAddress, setSelectedAddress] = useState<string>("addr-1")
  const [selectedPayment, setSelectedPayment] = useState<string>("upi")
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [qrIntentUrl, setQrIntentUrl] = useState("")
  const [orderTrackingId, setOrderTrackingId] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("PENDING")`
);

// 4. Polling useEffect and Cart Redirect
content = content.replace(
  /  useEffect\(\(\) => \{\n    if \(!isAuthenticated\) \{\n      router\.push\("\/auth\/login\?redirect=\/checkout"\)\n    \} else if \(cartItems\.length === 0\) \{\n      router\.push\("\/cart"\)\n    \}\n  \}, \[isAuthenticated, cartItems, router\]\)/,
  `  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout")
    } else if (cartItems.length === 0 && !showQrDialog && !orderTrackingId) {
      router.push("/cart")
    }
  }, [isAuthenticated, cartItems, router, showQrDialog, orderTrackingId])

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (showQrDialog && orderTrackingId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(\`/api/payment/status?order_id=\${orderTrackingId}\`, {
            method: "POST"
          });
          const data = await res.json();
          if (data && data.success && data.data && (data.data.order_status === "PAID" || data.data.order_status === "SUCCESS")) {
            setPaymentStatus("PAID");
            clearInterval(intervalId);
            toast({
              title: "Payment Successful!",
              description: "Your order has been placed.",
            });
            clearCart();
            setShowQrDialog(false);
            router.push(\`/order-success?order=\${orderTrackingId}\`);
          }
        } catch (e) {
          console.error("Error polling payment status", e);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showQrDialog, orderTrackingId, router, clearCart, toast]);`
);


// 5. handlePlaceOrder
content = content.replace(
  /  const handlePlaceOrder = async \(\) => \{[\s\S]*?router\.push\(\`\/order-success\?order=\$\{orderNumber\}\`\)\n  \}/,
  `  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address required",
        description: "Please select a delivery address.",
        variant: "destructive",
      })
      setCurrentStep(1)
      return
    }
    
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantTransactionId: \`TXN\${Date.now()}\`,
          amount: total,
          payment_for: "E-Commerce Request",
          customer_email: user?.email || "customer@example.com",
          customer_phone: newAddress.phone || "9999999999"
        })
      });
      const data = await res.json();
      if (data.success && data.data?.intent_url) {
        setQrIntentUrl(data.data.intent_url);
        setOrderTrackingId(data.data.order_id);
        setShowQrDialog(true);
      } else {
        toast({
          title: "Payment initialization failed",
          description: data.message || "Could not generate QR code.",
          variant: "destructive",
        })
      }
    } catch(err) {
      toast({
        title: "Error",
        description: "Something went wrong initializing payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }`
);

// 6. remove UPI IDE & cards HTML blocks inside mapping
content = content.replace(
  /\{method\.id === "cod" && \([\s\S]*?\{selectedPayment === "card" && method\.id === "card" && \([\s\S]*?\}\)\n                      <\/div>/,
  `</div>
                      </div>`
);

// 7. remove " disabled={!selectedPayment || (selectedPayment === "upi" && !upiId)}"
content = content.replace(
  /disabled=\{!selectedPayment \|\| \(selectedPayment === "upi" && !upiId\)\}/,
  `disabled={!selectedPayment}`
);

// 8. remove UPI ID Review listing
content = content.replace(
  /\{selectedPayment === "upi" && \(\n                      <p className="text-sm text-muted-foreground">UPI ID: \{upiId\}<\/p>\n                    \)\}/,
  ``
);

// 9. disable handlePlaceOrder early check empty condition if cart empty length (for loading state when wait dialog)
content = content.replace(
  /  if \(!isAuthenticated \|\| cartItems\.length === 0\) \{\n    return \(\n      <div className=\"flex min-h-\[50vh\] items-center justify-center\">\n        <Loader2 className=\"h-8 w-8 animate-spin text-primary\" \/>\n      <\/div>\n    \)\n  \}/,
  `  if (!isAuthenticated || (cartItems.length === 0 && !showQrDialog)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }`
);

// 10. append QR dialog right before the final div end
content = content.replace(
  /    <\/div>\n  \)\n}/,
  `
      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={(open) => !open && setShowQrDialog(false)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Scan QR to Pay</DialogTitle>
            <DialogDescription>
              Open any UPI app to scan and pay {formatPrice(total)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="p-4 bg-white rounded-xl">
              {qrIntentUrl ? <QRCode value={qrIntentUrl} size={200} /> : <Loader2 className="animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Waiting for payment confirmation...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}`
);


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated component!');
