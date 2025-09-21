"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/client";
import { 
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit
} from "lucide-react";

interface AddressData {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  alternateEmail?: string;
  alternatePhone?: string;
  isDefault?: boolean;
}

interface AddressStepProps {
  onComplete: (data: { address: AddressData }) => void;
  onError: (error: string) => void;
}

export function AddressStep({ onComplete, onError }: AddressStepProps) {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [formData, setFormData] = useState<AddressData>({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    phone: "",
    alternateEmail: "",
    alternatePhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadSavedAddresses = useCallback(async () => {
    try {
      setLocalLoading(true);
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
        
        // Select default address if available
        const defaultAddress = data.addresses?.find((addr: AddressData) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id!);
        } else if (data.addresses?.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        } else {
          setIsAddingNew(true);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      onError('Failed to load saved addresses');
      setIsAddingNew(true);
    } finally {
      setLocalLoading(false);
    }
  }, [onError]);

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    } else {
      // For guest users, show form immediately
      setIsAddingNew(true);
    }
  }, [user, loadSavedAddresses]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.address1) newErrors.address1 = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";

    // Validate phone number format
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    // Validate alternate phone if provided
    if (formData.alternatePhone && !/^[6-9]\d{9}$/.test(formData.alternatePhone)) {
      newErrors.alternatePhone = "Please enter a valid 10-digit mobile number";
    }

    // Validate alternate email if provided
    if (formData.alternateEmail && !/\S+@\S+\.\S+/.test(formData.alternateEmail)) {
      newErrors.alternateEmail = "Please enter a valid email address";
    }

    // Validate postal code (Indian format)
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Please enter a valid 6-digit postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAddingNew) {
      if (!validateForm()) return;
      
      // Save address for logged-in users
      if (user) {
        try {
          setLocalLoading(true);
          const response = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          
          if (response.ok) {
            const savedAddress = await response.json();
            onComplete({ address: savedAddress.address });
          } else {
            onComplete({ address: formData });
          }
        } catch (error) {
          console.error('Failed to save address:', error);
          onComplete({ address: formData });
        } finally {
          setLocalLoading(false);
        }
      } else {
        onComplete({ address: formData });
      }
    } else {
      // Use selected saved address
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        onComplete({ address: selectedAddress });
      }
    }
  };

  const handleInputChange = (field: keyof AddressData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const editAddress = (address: AddressData) => {
    setFormData(address);
    setIsAddingNew(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Saved Addresses (for logged-in users) */}
          {user && savedAddresses.length > 0 && !isAddingNew && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Select saved address</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNew(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
              
              <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                {savedAddresses.map((address) => (
                  <div key={address.id} className="space-y-2">
                    <div className="flex items-start space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value={address.id!} id={address.id!} className="mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={address.id!} className="font-medium cursor-pointer">
                            {address.firstName} {address.lastName}
                          </Label>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.address1}
                          {address.address2 && `, ${address.address2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {address.phone}
                        </p>
                        {address.company && (
                          <p className="text-sm text-muted-foreground">
                            Company: {address.company}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editAddress(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Address Form */}
          {(isAddingNew || !user || savedAddresses.length === 0) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {user && savedAddresses.length > 0 ? "Add new address" : "Delivery address"}
                </h4>
                {user && savedAddresses.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  value={formData.address1}
                  onChange={(e) => handleInputChange("address1", e.target.value)}
                  placeholder="House number, building name, street"
                />
                {errors.address1 && (
                  <p className="text-sm text-destructive">{errors.address1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input
                  id="address2"
                  value={formData.address2}
                  onChange={(e) => handleInputChange("address2", e.target.value)}
                  placeholder="Apartment, suite, floor, landmark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state"
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-destructive">{errors.postalCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Contact Information</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Primary Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="9876543210"
                      className="pl-10"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll use this number for delivery updates
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">Alternate Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      placeholder="9876543210"
                      className="pl-10"
                      maxLength={10}
                    />
                  </div>
                  {errors.alternatePhone && (
                    <p className="text-sm text-destructive">{errors.alternatePhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternateEmail">Alternate Email (Optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="alternateEmail"
                      type="email"
                      value={formData.alternateEmail}
                      onChange={(e) => handleInputChange("alternateEmail", e.target.value)}
                      placeholder="alternate@email.com"
                      className="pl-10"
                    />
                  </div>
                  {errors.alternateEmail && (
                    <p className="text-sm text-destructive">{errors.alternateEmail}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Useful for delivery notifications if primary email is unavailable
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* Delivery Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Delivery Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• We deliver Monday to Saturday, 9 AM to 8 PM</li>
              <li>• Someone should be available to receive the package</li>
              <li>• You&apos;ll receive tracking details via SMS and email</li>
              <li>• If nobody is available, we&apos;ll attempt redelivery</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              className="w-full" 
              disabled={localLoading}
            >
              {localLoading ? "Saving..." : "Continue to Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}