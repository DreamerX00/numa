import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  Calendar,
  Monitor,
  AlertCircle
} from "lucide-react";
import { useUpdateSecuritySettings } from "@/hooks/useApi";
import { toast } from "sonner";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  loginNotifications: boolean;
  passwordChangeNotifications: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
  trustedDevices: Array<{
    id: string;
    name: string;
    lastUsed: string;
    isCurrent: boolean;
  }>;
  loginHistory: Array<{
    id: string;
    device: string;
    location: string;
    timestamp: string;
    successful: boolean;
  }>;
}

interface SecurityTabProps {
  securityData?: SecuritySettings;
  isLoading?: boolean;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecurityTab({ securityData, isLoading = false }: SecurityTabProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);

  const updateSecurityMutation = useUpdateSecuritySettings();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = async () => {
    try {
      // In a real app, this would call an API to change password
      toast.success("Password changed successfully!");
      setIsPasswordDialogOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleSecurityToggle = async (setting: string, value: boolean | number) => {
    try {
      await updateSecurityMutation.mutateAsync({ [setting]: value });
      toast.success("Security setting updated successfully!");
    } catch {
      toast.error("Failed to update security setting");
    }
  };

  const handleRemoveTrustedDevice = async () => {
    try {
      // In a real app, this would call an API to remove the device
      toast.success("Device removed successfully!");
    } catch {
      toast.error("Failed to remove device");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading security settings...</p>
        </CardContent>
      </Card>
    );
  }

  const defaultSecurityData: SecuritySettings = {
    twoFactorEnabled: false,
    twoFactorMethod: '2fa-app',
    loginNotifications: true,
    passwordChangeNotifications: true,
    sessionTimeout: 60,
    passwordLastChanged: new Date().toISOString(),
    trustedDevices: [],
    loginHistory: [],
    ...securityData
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your account security and privacy settings
        </p>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              {defaultSecurityData.twoFactorEnabled ? (
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              )}
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {defaultSecurityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Key className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Last changed {new Date(defaultSecurityData.passwordLastChanged).toLocaleDateString()}
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Trusted Devices</p>
              <p className="text-sm text-muted-foreground">
                {defaultSecurityData.trustedDevices.length} devices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Change your account password
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              {defaultSecurityData.twoFactorEnabled && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Enabled
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIs2FADialogOpen(true)}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {defaultSecurityData.twoFactorEnabled ? 'Manage' : 'Enable'} 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Login Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={defaultSecurityData.loginNotifications}
              onCheckedChange={(checked) => handleSecurityToggle('loginNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password Change Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Get notified when your password is changed
              </p>
            </div>
            <Switch
              checked={defaultSecurityData.passwordChangeNotifications}
              onCheckedChange={(checked) => handleSecurityToggle('passwordChangeNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="session-timeout"
                type="number"
                value={defaultSecurityData.sessionTimeout}
                onChange={(e) => handleSecurityToggle('sessionTimeout', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                Automatically log out after inactivity
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {defaultSecurityData.trustedDevices.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No trusted devices</p>
            </div>
          ) : (
            <div className="space-y-3">
              {defaultSecurityData.trustedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last used: {new Date(device.lastUsed).toLocaleDateString()}
                        {device.isCurrent && (
                          <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  {!device.isCurrent && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveTrustedDevice()}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {defaultSecurityData.loginHistory.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {defaultSecurityData.loginHistory.slice(0, 5).map((login) => (
                <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {login.successful ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{login.device}</p>
                      <p className="text-sm text-muted-foreground">
                        {login.location} • {new Date(login.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={login.successful ? "secondary" : "destructive"}>
                    {login.successful ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Choose a strong password that you haven&apos;t used before.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => handlePasswordChange())} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Enter current password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Change Password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {defaultSecurityData.twoFactorEnabled 
                ? "Manage your two-factor authentication settings."
                : "Set up two-factor authentication for enhanced security."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-8">
              <Smartphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">
                {defaultSecurityData.twoFactorEnabled ? "2FA is Enabled" : "Enable 2FA"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {defaultSecurityData.twoFactorEnabled 
                  ? "Your account is protected with two-factor authentication."
                  : "Use an authenticator app to generate secure codes."
                }
              </p>
              
              {defaultSecurityData.twoFactorEnabled ? (
                <Button variant="destructive" onClick={() => handleSecurityToggle('twoFactorEnabled', false)}>
                  <Unlock className="h-4 w-4 mr-2" />
                  Disable 2FA
                </Button>
              ) : (
                <Button onClick={() => handleSecurityToggle('twoFactorEnabled', true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIs2FADialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}