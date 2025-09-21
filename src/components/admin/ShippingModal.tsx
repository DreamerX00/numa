'use client';

import React, { useState } from 'react';
import { OrderStatus } from '@prisma/client';

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
  };
  onUpdate: (orderId: string) => void;
}

const carriers = [
  'FedEx',
  'UPS',
  'DHL',
  'India Post',
  'BlueDart',
  'DTDC',
  'Ecom Express',
  'Delhivery',
  'Xpressbees',
  'Other'
];

export default function ShippingModal({ isOpen, onClose, order, onUpdate }: ShippingModalProps) {
  const [formData, setFormData] = useState({
    trackingNumber: order.trackingNumber || '',
    carrier: order.carrier || '',
    estimatedDelivery: order.estimatedDelivery 
      ? new Date(order.estimatedDelivery).toISOString().split('T')[0] 
      : '',
    shippingStatus: order.status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trackingNumber || !formData.carrier) {
      setError('Tracking number and carrier are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: formData.trackingNumber,
          carrier: formData.carrier,
          estimatedDelivery: formData.estimatedDelivery || null,
          shippingStatus: formData.shippingStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipping information');
      }

      onUpdate(order.id);
      onClose();
    } catch (error) {
      console.error('Shipping update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update shipping information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Update Shipping - {order.orderNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={formData.shippingStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, shippingStatus: e.target.value as OrderStatus }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          {/* Carrier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carrier *
            </label>
            <select
              value={formData.carrier}
              onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select carrier...</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number *
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tracking number"
              required
            />
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Delivery
            </label>
            <input
              type="date"
              value={formData.estimatedDelivery}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Shipping'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}