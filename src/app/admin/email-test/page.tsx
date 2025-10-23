"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EmailTestPage() {
  const [emailType, setEmailType] = useState<string>("test");
  const [toEmail, setToEmail] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [config, setConfig] = useState<{ 
    configured: boolean; 
    settings?: { host: string; port: string; user: string } 
  } | null>(null);

  const checkConfiguration = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/admin/email/test');
      const data = await response.json();
      setConfig(data);
      
      if (data.configured) {
        toast.success("Email configuration is valid!");
      } else {
        toast.error("Email is not configured. Check SMTP_SETUP_GUIDE.md");
      }
    } catch (error) {
      toast.error("Failed to check configuration");
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  const sendTestEmail = async () => {
    if (!toEmail) {
      toast.error("Please enter recipient email");
      return;
    }

    if ((emailType === 'order_confirmation') && !orderId) {
      toast.error("Please enter order ID for order confirmation test");
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          to: toEmail,
          orderId: orderId || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult({ success: true, message: data.message });
        toast.success("Email sent successfully!");
      } else {
        setResult({ success: false, error: data.error || 'Failed to send email' });
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send email';
      setResult({ success: false, error: errorMsg });
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Test Center</h1>
          <p className="text-muted-foreground mt-2">
            Test and verify your SMTP email configuration
          </p>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              SMTP Configuration Status
            </CardTitle>
            <CardDescription>
              Check if your email service is properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkConfiguration} 
              disabled={checking}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Check Configuration
                </>
              )}
            </Button>

            {config && (
              <Alert variant={config.configured ? "default" : "destructive"}>
                {config.configured ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {config.configured ? (
                    <div className="space-y-2">
                      <p className="font-semibold">✅ Email is configured</p>
                      <div className="text-sm space-y-1">
                        <p><strong>Host:</strong> {config.settings?.host}</p>
                        <p><strong>Port:</strong> {config.settings?.port}</p>
                        <p><strong>User:</strong> {config.settings?.user}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold">❌ Email is NOT configured</p>
                      <p className="text-sm">
                        Please update your SMTP credentials in <code>.env</code> file.
                        See <code>SMTP_SETUP_GUIDE.md</code> for instructions.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Send Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Send a test email to verify everything works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-type">Email Type</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger id="email-type">
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Simple Test Email</SelectItem>
                  <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                  <SelectItem value="payment_failed">Payment Failed</SelectItem>
                  <SelectItem value="shipping_confirmation">Shipping Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-email">Recipient Email *</Label>
              <Input
                id="to-email"
                type="email"
                placeholder="recipient@example.com"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
              />
            </div>

            {emailType === 'order_confirmation' && (
              <div className="space-y-2">
                <Label htmlFor="order-id">Order ID *</Label>
                <Input
                  id="order-id"
                  type="text"
                  placeholder="Enter existing order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Must be an existing order ID from your database
                </p>
              </div>
            )}

            <Button 
              onClick={sendTestEmail} 
              disabled={sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.success ? (
                    <div>
                      <p className="font-semibold">✅ Email sent successfully!</p>
                      <p className="text-sm mt-1">{result.message}</p>
                      <p className="text-sm mt-2 text-muted-foreground">
                        Check the recipient inbox (and spam folder)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">❌ Failed to send email</p>
                      <p className="text-sm mt-1">{result.error}</p>
                      <p className="text-sm mt-2">
                        Check console logs and SMTP configuration
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup (Gmail)</CardTitle>
            <CardDescription>
              5-minute setup for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <p className="font-semibold">1. Generate Gmail App Password:</p>
              <a 
                href="https://myaccount.google.com/apppasswords" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                → https://myaccount.google.com/apppasswords
              </a>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">2. Update .env file:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=<16-char-app-password>
FROM_EMAIL=your-gmail@gmail.com
FROM_NAME=NUMA Store`}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">3. Restart dev server:</p>
              <code className="bg-muted p-2 rounded text-xs">npm run dev</code>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For detailed setup instructions with other providers (SendGrid, Resend, etc.), 
                see <strong>SMTP_SETUP_GUIDE.md</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
