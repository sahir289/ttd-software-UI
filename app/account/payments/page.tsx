"use client"

import { useState } from "react"
import { CreditCard, Plus, Trash2, Smartphone, Check, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface SavedCard {
  id: string
  type: "visa" | "mastercard" | "rupay"
  lastFour: string
  expiryMonth: string
  expiryYear: string
  holderName: string
  isDefault: boolean
}

interface SavedUPI {
  id: string
  upiId: string
  isDefault: boolean
}

export default function PaymentsPage() {
  const { toast } = useToast()
  
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: "card-1",
      type: "visa",
      lastFour: "4242",
      expiryMonth: "12",
      expiryYear: "25",
      holderName: "DEMO USER",
      isDefault: true,
    },
  ])
  
  const [savedUPIs, setSavedUPIs] = useState<SavedUPI[]>([
    { id: "upi-1", upiId: "demo@paytm", isDefault: true },
  ])
  
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [showUPIDialog, setShowUPIDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ type: "card" | "upi"; id: string } | null>(null)
  
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holderName: "",
  })
  
  const [newUPI, setNewUPI] = useState("")

  const handleAddCard = () => {
    // Simple validation
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.holderName) {
      toast({
        title: "Missing information",
        description: "Please fill in all card details",
        variant: "destructive",
      })
      return
    }
    
    const cardType = newCard.number.startsWith("4") ? "visa" : newCard.number.startsWith("5") ? "mastercard" : "rupay"
    const [month, year] = newCard.expiry.split("/")
    
    const card: SavedCard = {
      id: `card-${Date.now()}`,
      type: cardType,
      lastFour: newCard.number.slice(-4),
      expiryMonth: month,
      expiryYear: year,
      holderName: newCard.holderName.toUpperCase(),
      isDefault: savedCards.length === 0,
    }
    
    setSavedCards([...savedCards, card])
    setShowCardDialog(false)
    setNewCard({ number: "", expiry: "", cvv: "", holderName: "" })
    
    toast({
      title: "Card added",
      description: "Your card has been saved securely.",
    })
  }

  const handleAddUPI = () => {
    if (!newUPI || !newUPI.includes("@")) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      })
      return
    }
    
    const upi: SavedUPI = {
      id: `upi-${Date.now()}`,
      upiId: newUPI,
      isDefault: savedUPIs.length === 0,
    }
    
    setSavedUPIs([...savedUPIs, upi])
    setShowUPIDialog(false)
    setNewUPI("")
    
    toast({
      title: "UPI ID added",
      description: "Your UPI ID has been saved.",
    })
  }

  const handleDelete = () => {
    if (!deletingItem) return
    
    if (deletingItem.type === "card") {
      setSavedCards(savedCards.filter((c) => c.id !== deletingItem.id))
    } else {
      setSavedUPIs(savedUPIs.filter((u) => u.id !== deletingItem.id))
    }
    
    toast({
      title: "Payment method removed",
      description: "The payment method has been deleted.",
    })
    
    setShowDeleteDialog(false)
    setDeletingItem(null)
  }

  const handleSetDefault = (type: "card" | "upi", id: string) => {
    if (type === "card") {
      setSavedCards(savedCards.map((c) => ({ ...c, isDefault: c.id === id })))
    } else {
      setSavedUPIs(savedUPIs.map((u) => ({ ...u, isDefault: u.id === id })))
    }
    
    toast({
      title: "Default updated",
      description: "Your default payment method has been changed.",
    })
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "text-blue-600"
      case "mastercard":
        return "text-red-500"
      default:
        return "text-green-600"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment options</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cards">
            <TabsList className="mb-6">
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="upi" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                UPI
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards" className="space-y-4">
              {savedCards.length > 0 ? (
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        card.isDefault ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg bg-muted p-2 ${getCardIcon(card.type)}`}>
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {card.type.charAt(0).toUpperCase() + card.type.slice(1)} ending in {card.lastFour}
                            </span>
                            {card.isDefault && <Badge variant="secondary">Default</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expires {card.expiryMonth}/{card.expiryYear} | {card.holderName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!card.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault("card", card.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeletingItem({ type: "card", id: card.id })
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">No saved cards</h3>
                  <p className="text-sm text-muted-foreground">Add a card for faster checkout</p>
                </div>
              )}
              
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowCardDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Card
              </Button>
            </TabsContent>
            
            <TabsContent value="upi" className="space-y-4">
              {savedUPIs.length > 0 ? (
                <div className="space-y-3">
                  {savedUPIs.map((upi) => (
                    <div
                      key={upi.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        upi.isDefault ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-muted p-2 text-primary">
                          <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{upi.upiId}</span>
                            {upi.isDefault && <Badge variant="secondary">Default</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">UPI ID</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!upi.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault("upi", upi.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeletingItem({ type: "upi", id: upi.id })
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Smartphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold">No saved UPI IDs</h3>
                  <p className="text-sm text-muted-foreground">Add a UPI ID for instant payments</p>
                </div>
              )}
              
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowUPIDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New UPI ID
              </Button>
            </TabsContent>
          </Tabs>
          
          {/* Security Note */}
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
            <Shield className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium">Your payment info is secure</p>
              <p className="text-sm text-muted-foreground">
                We use industry-standard encryption to protect your payment details. Your card CVV is never stored.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
            <DialogDescription>
              Enter your card details securely
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={newCard.number}
                onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "")
                    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
                    setNewCard({ ...newCard, expiry: value })
                  }}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="holderName">Name on Card</Label>
              <Input
                id="holderName"
                placeholder="JOHN DOE"
                value={newCard.holderName}
                onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCardDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add UPI Dialog */}
      <Dialog open={showUPIDialog} onOpenChange={setShowUPIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add UPI ID</DialogTitle>
            <DialogDescription>
              Enter your UPI ID for quick payments
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={newUPI}
              onChange={(e) => setNewUPI(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Example: 9876543210@paytm, name@oksbi
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUPIDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUPI}>Add UPI ID</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
