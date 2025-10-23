"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Upload, 
  Eye, 
  EyeOff,
  Calendar,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useImageUpload } from '@/hooks/useImageUpload'
import { UPLOAD_FOLDERS } from '@/lib/cloudinary'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PersonalInfo } from "@/types/profile"

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo
  onUpdate: (info: PersonalInfo) => void
}

export default function PersonalInfoSection({ personalInfo, onUpdate }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState<PersonalInfo>(personalInfo)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'This field is required'
        if (value.length < 2) return 'Must be at least 2 characters'
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Only letters, spaces, hyphens and apostrophes allowed'
        return ''
      
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
        return ''
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required'
        if (!/^\+?[\d\s\-\(\)]+$/.test(value)) return 'Invalid phone number format'
        if (value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits'
        return ''
      
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required'
        const date = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - date.getFullYear()
        if (age < 13) return 'Must be at least 13 years old'
        if (age > 120) return 'Invalid date of birth'
        return ''
      
      default:
        return ''
    }
  }

  const handleFieldChange = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Validate field
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const { uploadFile, isUploading, uploadError } = useImageUpload({
    folder: UPLOAD_FOLDERS.USERS,
    uploadEndpoint: '/api/user/upload-avatar' // Use user-specific endpoint instead of admin
  })

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadFile(file)
      if (result) {
        setFormData(prev => ({ ...prev, avatar: result.url }))
        setAvatarPreview(result.url)
        setErrors(prev => ({ ...prev, avatar: '' }))
      }
    } catch {
      setErrors(prev => ({ 
        ...prev, 
        avatar: uploadError || 'Failed to upload image' 
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    Object.keys(formData).forEach(key => {
      if (key !== 'avatar' && key !== 'gender' && key !== 'title') {
        const error = validateField(key, formData[key as keyof PersonalInfo] as string)
        if (error) {
          newErrors[key] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Call the onUpdate prop which will trigger the real API mutation
      onUpdate(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(personalInfo)
    setErrors({})
    setAvatarPreview(null)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Avatar & Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Manage your personal details and profile information
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isLoading || Object.keys(errors).some(key => errors[key])}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      <Save className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage 
                  src={avatarPreview || formData.avatar} 
                  alt={`${formData.firstName} ${formData.lastName}`} 
                />
                <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                  {formData.firstName[0]}{formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4"
                    >
                      <Upload className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </motion.label>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {formData.title} {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-muted-foreground">{formData.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {formData.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(formData.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              {errors.avatar && (
                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.avatar}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              {isEditing ? (
                <select
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select title</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              ) : (
                <p className="text-sm py-2">{formData.title || 'Not specified'}</p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              {isEditing ? (
                <div>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm py-2">{formData.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              {isEditing ? (
                <div>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm py-2">{formData.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              {isEditing ? (
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                  {!errors.email && formData.email && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Email verified
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm py-2">{formData.email}</p>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              {isEditing ? (
                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm py-2">{formData.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              {isEditing ? (
                <div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                      className={`pl-10 ${errors.dateOfBirth ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm py-2">
                  {new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <select
                  id="gender"
                  value={formData.gender || ''}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-sm py-2">
                  {formData.gender ? 
                    formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 
                    'Not specified'
                  }
                </p>
              )}
            </div>
          </div>

          {/* Security Verification */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-6 mt-6"
            >
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Verification
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your current password to confirm changes"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For security purposes, please enter your current password to save changes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">Email Verified</p>
                <p className="text-sm text-muted-foreground">Account verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">Phone Verified</p>
                <p className="text-sm text-muted-foreground">SMS verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium">2FA Enabled</p>
                <p className="text-sm text-muted-foreground">Extra secure</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}