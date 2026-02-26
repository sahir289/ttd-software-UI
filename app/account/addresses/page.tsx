"use client"

import { useState } from "react"
import { MapPin, Plus, Edit2, Trash2, Check, Home, Building } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { validatePincode, validatePhone } from "@/lib/utils"
import type { Address } from "@/lib/types"

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
]

export default function AddressesPage() {
  const { toast } = useToast()
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
    {
      id: "addr-2",
      name: "Office",
      fullName: "Demo User",
      phone: "9876543211",
      addressLine1: "Tower A, Floor 5",
      addressLine2: "BKC Complex",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      isDefault: false,
      type: "home"
    },
  ])
  
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Address>>({
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
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName?.trim()) newErrors.fullName = "Name is required"
    if (!formData.phone) newErrors.phone = "Phone is required"
    else if (!validatePhone(formData.phone)) newErrors.phone = "Invalid phone number"
    if (!formData.addressLine1?.trim()) newErrors.addressLine1 = "Address is required"
    if (!formData.city?.trim()) newErrors.city = "City is required"
    if (!formData.state) newErrors.state = "State is required"
    if (!formData.pincode) newErrors.pincode = "PIN code is required"
    else if (!validatePincode(formData.pincode)) newErrors.pincode = "Invalid PIN code"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData(address)
    } else {
      setEditingAddress(null)
      setFormData({
        name: "",
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: addresses.length === 0,
      })
    }
    setErrors({})
    setShowAddressDialog(true)
  }

  const handleSaveAddress = () => {
    if (!validateForm()) return
    
    if (editingAddress) {
      setAddresses(addresses.map((addr) => {
        if (addr.id === editingAddress.id) {
          return { ...addr, ...formData }
        }
        return formData.isDefault ? { ...addr, isDefault: false } : addr
      }))
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      })
    } else {
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        ...formData as Omit<Address, "id">,
      }
      if (newAddress.isDefault) {
        setAddresses(addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress))
      } else {
        setAddresses([...addresses, newAddress])
      }
      toast({
        title: "Address added",
        description: "Your new address has been saved successfully.",
      })
    }
    
    setShowAddressDialog(false)
  }

  const handleDeleteAddress = () => {
    if (!deletingAddressId) return
    
    const deletingAddress = addresses.find((a) => a.id === deletingAddressId)
    setAddresses(addresses.filter((a) => a.id !== deletingAddressId))
    
    // If deleting default address, set first remaining as default
    if (deletingAddress?.isDefault && addresses.length > 1) {
      const remaining = addresses.filter((a) => a.id !== deletingAddressId)
      if (remaining.length > 0) {
        setAddresses((prev) => prev.map((a, i) => i === 0 ? { ...a, isDefault: true } : a))
      }
    }
    
    toast({
      title: "Address deleted",
      description: "The address has been removed from your account.",
    })
    
    setShowDeleteDialog(false)
    setDeletingAddressId(null)
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    })))
    toast({
      title: "Default address updated",
      description: "Your default delivery address has been changed.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Addresses</CardTitle>
            <CardDescription>Manage your delivery addresses</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {addresses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative rounded-lg border p-4 transition-colors ${
                    address.isDefault ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  {address.isDefault && (
                    <Badge className="absolute right-2 top-2 bg-primary">Default</Badge>
                  )}
                  
                  <div className="mb-4 flex items-center gap-2">
                    {address.name?.toLowerCase().includes("home") ? (
                      <Home className="h-5 w-5 text-primary" />
                    ) : address.name?.toLowerCase().includes("office") ? (
                      <Building className="h-5 w-5 text-primary" />
                    ) : (
                      <MapPin className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-semibold">{address.name || "Address"}</span>
                  </div>
                  
                  <div className="mb-4 space-y-1 text-sm">
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-muted-foreground">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="pt-1">Phone: +91 {address.phone}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(address)}
                    >
                      <Edit2 className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Check className="mr-2 h-3 w-3" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => {
                        setDeletingAddressId(address.id)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">No addresses saved</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add your first delivery address
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Address Dialog */}
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
                <Label htmlFor="addressName">Label (Optional)</Label>
                <Input
                  id="addressName"
                  placeholder="Home, Office, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  placeholder="10-digit number"
                  className="rounded-l-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="House/Flat No., Building, Street"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-xs text-destructive">{errors.addressLine1}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                placeholder="Landmark, Area"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code *</Label>
                <Input
                  id="pincode"
                  placeholder="6-digit PIN"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-destructive">{errors.pincode}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
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
              {errors.state && (
                <p className="mt-1 text-xs text-destructive">{errors.state}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
