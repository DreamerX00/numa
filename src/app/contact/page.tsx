"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  Sparkles,
} from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  inquiryType: z.string(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "product", label: "Product Information" },
  { value: "order", label: "Order Support" },
  { value: "custom", label: "Custom Design" },
  { value: "wholesale", label: "Wholesale/Partnership" },
  { value: "press", label: "Press & Media" },
];

const contactMethods = [
  {
    icon: Phone,
    title: "Customer Care",
    details: ["+91 6267940313", "+91 8269564404"],
    subtitle: "WhatsApp & Calls Available",
    available: "Mon-Sat, 10 AM - 8 PM IST",
  },
  {
    icon: Mail,
    title: "Email Support",
    details: ["shreyaaa4404@gmail.com", ""],
    subtitle: "Response within 24 hours",
    available: "24/7 Support",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    details: ["Chat with our jewelry experts"],
    subtitle: "Instant responses",
    available: "Mon-Sat, 10 AM - 8 PM IST",
  },
  {
    icon: SiInstagram,
    title: "Social Media",
    details: ["@numa.iin", "DM us anytime"],
    subtitle: "Follow for updates",
    available: "Active daily",
  },
];

const businessInfo = {
  address: "",
  hours: {
    weekdays: "Monday - Saturday: 10:00 AM - 8:00 PM",
    sunday: "Sunday: 11:00 AM - 6:00 PM",
  },
  headquarters: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "general",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Contact form data:", data);
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Contact Us
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-serif mb-6">
              Get in <span className="text-brand">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We&apos;re here to help you find the perfect piece or answer any
              questions about our jewelry collections. Reach out to our
              dedicated team for personalized assistance.
            </p>
          </motion.div>
        </Container>
      </section>

      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:gap-12"
        >
          {/* Contact Methods Grid */}
          <motion.section variants={itemVariants}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactMethods.map((method) => (
                <motion.div
                  key={method.title}
                  variants={itemVariants}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                        <method.icon className="h-6 w-6 text-brand" />
                      </div>
                      <h3 className="font-semibold mb-2">{method.title}</h3>
                      <div className="space-y-1 mb-3">
                        {method.details.map((detail, idx) => (
                          <p key={idx} className="text-sm font-medium">
                            {detail}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {method.subtitle}
                      </p>
                      <p className="text-xs text-brand font-medium">
                        {method.available}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Main Content - Form and Info */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-brand" />
                    Send us a Message
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form below and we&apos;ll get back to you
                    within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We&apos;ll get back to you
                        soon.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="mt-4"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="your@email.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+91 98765 43210"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="inquiryType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inquiry Type *</FormLabel>
                                <FormControl>
                                  <select
                                    {...field}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                  >
                                    {inquiryTypes.map((type) => (
                                      <option
                                        key={type.value}
                                        value={type.value}
                                      >
                                        {type.label}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Brief description of your inquiry"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us more about how we can help you..."
                                  rows={5}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Information */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Office Location */}
              <Card>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2"></p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {businessInfo.address}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-brand" />
                      <span className="font-medium text-sm"></span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{businessInfo.hours.weekdays}</p>
                      <p>{businessInfo.hours.sunday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-brand" />
                      <div>
                        <p className="font-medium"></p>
                        <p className="text-xs text-muted-foreground">
                          Happy Customers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-brand" />
                      <div>
                        <p className="font-medium">24 Hours</p>
                        <p className="text-xs text-muted-foreground">
                          Average Response Time
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-brand" />
                      <div>
                        <p className="font-medium"></p>
                        <p className="text-xs text-muted-foreground">
                          Crafting Excellence
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.section variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-serif mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Quick answers to common questions about our jewelry, orders, and
                services.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  question: "What are your shipping times?",
                  answer:
                    "We offer free shipping within India with delivery in 3-5 business days. Express delivery available in 1-2 days for metro cities.",
                },
                {
                  question: "Do you offer custom jewelry design?",
                  answer:
                    "Yes! Our master craftsmen can create custom pieces. Contact us with your ideas and we'll provide a consultation and quote.",
                },
                {
                  question: "What is your return policy?",
                  answer:
                    "We offer a 30-day return policy for unused items in original packaging. Custom pieces have different terms.",
                },
                {
                  question: "Are your diamonds certified?",
                  answer:
                    "All our diamonds come with proper certification from recognized laboratories like GIA, IGI, or SGL.",
                },
                {
                  question: "Do you offer jewelry insurance?",
                  answer:
                    "We provide insurance options and can help you get your jewelry appraised for personal insurance coverage.",
                },
                {
                  question: "How do I care for my jewelry?",
                  answer:
                    "Each piece comes with care instructions. Generally, store separately, clean gently, and avoid chemicals and extreme temperatures.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </Container>
    </div>
  );
}
