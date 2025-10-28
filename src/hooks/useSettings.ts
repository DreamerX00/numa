"use client";

import { useEffect, useState } from "react";

interface ShippingSettings {
  freeShippingThreshold: number;
  codCharges: number;
  standardRate: number;
}

interface GeneralSettings {
  siteName: string;
  supportEmail: string;
}

interface PaymentSettings {
  phonePeEnabled: boolean;
  phonePeDisplayName: string;
  razorpayEnabled: boolean;
  razorpayDisplayName: string;
  razorpayKeyId: string;
  stripeEnabled: boolean;
  stripeDisplayName: string;
  codEnabled: boolean;
  codDisplayName: string;
  codInstructions: string;
  minOrderAmount: number;
}

interface CompanySettings {
  gstRate: number;
}

export function useSettings() {
  const [shipping, setShipping] = useState<ShippingSettings>({
    freeShippingThreshold: 500,
    codCharges: 50,
    standardRate: 50,
  });

  const [general, setGeneral] = useState<GeneralSettings>({
    siteName: "Numa Store",
    supportEmail: "support@numa.com",
  });

  const [payments, setPayments] = useState<PaymentSettings>({
    phonePeEnabled: false, // Will be loaded from API
    phonePeDisplayName: "PhonePe / UPI",
    razorpayEnabled: false, // Will be loaded from API
    razorpayDisplayName: "Cards / UPI / Wallets",
    razorpayKeyId: "", // Will be loaded from API
    stripeEnabled: false,
    stripeDisplayName: "Credit/Debit Card",
    codEnabled: false, // Will be loaded from API
    codDisplayName: "Cash on Delivery",
    codInstructions: "Pay when you receive your order",
    minOrderAmount: 100,
  });

  const [company, setCompany] = useState<CompanySettings>({
    gstRate: 0, // Will be loaded from API
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/public");
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            if (data.settings.shipping) {
              setShipping((prev) => ({ ...prev, ...data.settings.shipping }));
            }
            if (data.settings.general) {
              setGeneral((prev) => ({ ...prev, ...data.settings.general }));
            }
            if (data.settings.payments) {
              setPayments((prev) => ({ ...prev, ...data.settings.payments }));
            }
            if (data.settings.company) {
              setCompany((prev) => ({ ...prev, ...data.settings.company }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Helper to get available payment methods
  const getAvailablePaymentMethods = () => {
    const methods: Array<{
      id: "phonepe" | "razorpay" | "cod";
      name: string;
      description: string;
      enabled: boolean;
    }> = [];

    if (payments.phonePeEnabled) {
      methods.push({
        id: "phonepe",
        name: payments.phonePeDisplayName,
        description: "Fast and secure UPI payments",
        enabled: true,
      });
    }

    if (payments.razorpayEnabled) {
      methods.push({
        id: "razorpay",
        name: payments.razorpayDisplayName,
        description: "Multiple payment options available",
        enabled: true,
      });
    }

    if (payments.codEnabled) {
      methods.push({
        id: "cod",
        name: payments.codDisplayName,
        description: payments.codInstructions,
        enabled: true,
      });
    }

    return methods;
  };

  return {
    shipping,
    general,
    payments,
    company,
    loading,
    getAvailablePaymentMethods,
  };
}
