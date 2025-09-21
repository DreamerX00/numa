'use client';

import React, { useState, useEffect } from 'react';
import { OrderStatus } from '@prisma/client';

interface TrackingInfo {
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

interface ShippingLog {
  id: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
}

export default function OrderTracking({ orderNumber }: { orderNumber: string }) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [shippingLogs, setShippingLogs] = useState<ShippingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderNumber}/tracking`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tracking information');
        }

        const data = await response.json();
        setTrackingInfo(data.order);
        setShippingLogs(data.shippingLogs || []);
      } catch (error) {
        console.error('Tracking fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();
  }, [orderNumber]);

  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusSteps = (currentStatus: OrderStatus) => {
    const steps = [
      { status: 'CONFIRMED', label: 'Order Confirmed', icon: '✓' },
      { status: 'PROCESSING', label: 'Processing', icon: '⚙️' },
      { status: 'SHIPPED', label: 'Shipped', icon: '🚚' },
      { status: 'DELIVERED', label: 'Delivered', icon: '📦' }
    ];

    const statusOrder = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="text-center py-8 text-gray-600">
        No tracking information found for order {orderNumber}
      </div>
    );
  }

  const statusSteps = getStatusSteps(trackingInfo.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
          <p className="text-blue-100">Order #{trackingInfo.orderNumber}</p>
        </div>

        {/* Current Status */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingInfo.status)}`}>
              {trackingInfo.status.replace('_', ' ')}
            </span>
          </div>

          {/* Tracking Number */}
          {trackingInfo.trackingNumber && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono text-lg font-semibold">{trackingInfo.trackingNumber}</p>
                </div>
                {trackingInfo.carrier && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="font-semibold">{trackingInfo.carrier}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          {trackingInfo.estimatedDelivery && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-600 mb-1">Estimated Delivery</p>
              <p className="font-semibold text-blue-800">
                {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-6">Order Progress</h3>
          <div className="relative">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-center mb-6 last:mb-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  step.completed 
                    ? step.current 
                      ? 'bg-blue-600' 
                      : 'bg-green-500'
                    : 'bg-gray-300'
                }`}>
                  {step.completed ? step.icon : index + 1}
                </div>
                <div className="ml-4">
                  <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                  {step.current && (
                    <p className="text-sm text-blue-600">Current status</p>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`absolute left-5 w-0.5 h-6 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} style={{ top: `${(index + 1) * 70}px` }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping History */}
        {shippingLogs.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Shipping History</h3>
            <div className="space-y-3">
              {shippingLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{log.status.replace('_', ' ')}</p>
                    {log.notes && (
                      <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                    )}
                    {log.carrier && log.trackingNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        {log.carrier} - {log.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Dates */}
        {(trackingInfo.shippedAt || trackingInfo.deliveredAt) && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trackingInfo.shippedAt && (
                <div>
                  <p className="text-sm text-gray-600">Shipped Date</p>
                  <p className="font-semibold">
                    {new Date(trackingInfo.shippedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {trackingInfo.deliveredAt && (
                <div>
                  <p className="text-sm text-gray-600">Delivered Date</p>
                  <p className="font-semibold">
                    {new Date(trackingInfo.deliveredAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}