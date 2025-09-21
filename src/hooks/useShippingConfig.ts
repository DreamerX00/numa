"use client";

import { useState, useEffect } from 'react';
import { defaultShippingConfig, type ShippingConfig } from '@/lib/config/shipping';

export function useShippingConfig() {
  const [config, setConfig] = useState<ShippingConfig>(defaultShippingConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShippingConfig();
  }, []);

  const fetchShippingConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shipping');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping configuration');
      }
      
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch shipping configuration');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to fetch shipping config:', err);
      // Keep using default config on error
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    refetch: fetchShippingConfig
  };
}