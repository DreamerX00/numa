'use client';

import { useState, useEffect } from 'react';
import HeartLoader from "@/components/ui/HeartLoader";
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Database, Settings, Globe, Package } from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  responseTime?: number;
  checks: {
    database: {
      status: string;
      responseTime?: number;
      connection?: string;
      collections?: Record<string, number>;
      error?: string;
    };
    environment: {
      status: string;
      required?: number;
      present?: number;
      missing?: string[];
    };
    services: {
      status: string;
      available?: Record<string, boolean>;
    };
  };
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthData = async (detailed = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/health?detailed=${detailed}&data=true`);
      const data = await response.json();
      
      setHealthData(data);
      setLastChecked(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData(true);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HeartLoader size="sm" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'unhealthy':
      case 'error':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor MongoDB connection and system status</p>
            </div>
            <button
              onClick={() => fetchHealthData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {lastChecked && (
            <p className="text-sm text-gray-500 mt-2">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-800">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !healthData && (
          <div className="flex items-center justify-center py-12">
            <HeartLoader size="md" />
            <span className="ml-2 text-gray-600">Checking system health...</span>
          </div>
        )}

        {/* Health Data */}
        {healthData && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className={`rounded-lg border p-6 ${getStatusColor(healthData.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(healthData.status)}
                <div>
                  <h2 className="text-xl font-semibold">
                    System Status: {healthData.status.toUpperCase()}
                  </h2>
                  <p className="text-sm opacity-80">
                    Environment: {healthData.environment} | 
                    Response Time: {healthData.responseTime}ms |
                    Uptime: {Math.floor(healthData.uptime)}s
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Checks */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              
              {/* Database Check */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">MongoDB Database</h3>
                  {getStatusIcon(healthData.checks.database.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">{healthData.checks.database.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Response Time:</span>
                    <p className="font-medium">{healthData.checks.database.responseTime}ms</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Connection:</span>
                    <p className="font-medium">{healthData.checks.database.connection || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Error:</span>
                    <p className="font-medium text-red-600">
                      {healthData.checks.database.error || 'None'}
                    </p>
                  </div>
                </div>

                {healthData.checks.database.collections && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Collections Count:</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {Object.entries(healthData.checks.database.collections).map(([name, count]) => (
                        <div key={name}>
                          <span className="text-gray-500 capitalize">{name}:</span>
                          <p className="font-medium">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Environment Check */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Environment Variables</h3>
                  {getStatusIcon(healthData.checks.environment.status)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Required:</span>
                    <p className="font-medium">{healthData.checks.environment.required}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Present:</span>
                    <p className="font-medium">{healthData.checks.environment.present}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Missing:</span>
                    <p className="font-medium text-red-600">
                      {healthData.checks.environment.missing?.length || 0}
                    </p>
                  </div>
                </div>

                {healthData.checks.environment.missing && healthData.checks.environment.missing.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2 text-red-600">Missing Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {healthData.checks.environment.missing.map((envVar) => (
                        <span 
                          key={envVar} 
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                        >
                          {envVar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Services Check */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">External Services</h3>
                  {getStatusIcon(healthData.checks.services.status)}
                </div>
                
                {healthData.checks.services.available && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(healthData.checks.services.available).map(([service, available]) => (
                      <div key={service} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="capitalize">{service}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test Links */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quick Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium">Basic Health Check</div>
                  <div className="text-sm text-gray-600">Simple status check</div>
                </a>
                <a
                  href="/api/health?detailed=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium">Detailed Health Check</div>
                  <div className="text-sm text-gray-600">Full system analysis</div>
                </a>
                <a
                  href="/api/test-db"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white rounded border hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium">Database Test</div>
                  <div className="text-sm text-gray-600">MongoDB connection test</div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}