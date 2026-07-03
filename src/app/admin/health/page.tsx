'use client';

import React, { useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { RefreshCw, Shield } from 'lucide-react';
import { SkeletonGrid } from '../components';

export default function AdminHealthPage() {
  const { token, healthStatus, healthLoading, checkHealth } = useAdmin();

  useEffect(() => {
    if (token) {
      checkHealth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>System Connection Health</h2>
          <p>Monitor real-time status of backend service endpoints, databases, and third-party integrations.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={checkHealth}
          disabled={healthLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={healthLoading ? 'admin-spin' : ''} /> Check Status
        </button>
      </div>

      {healthLoading && !healthStatus.backend ? (
        <SkeletonGrid />
      ) : (
        <div className="admin-panel" style={{ padding: '24px' }}>
          <div className="admin-health-grid">
            <div className="admin-health-item">
              <div>
                <strong>Laravel Backend API</strong>
                <span>{healthStatus.backend ? 'Endpoint connection secure' : 'Unable to reach API'}</span>
              </div>
              <span className={`admin-health-dot ${healthLoading ? '' : healthStatus.backend ? 'online' : 'offline'}`} />
            </div>
            <div className="admin-health-item">
              <div>
                <strong>Platform Database</strong>
                <span>{healthStatus.database ? 'Read and write operations active' : 'Database connection failed'}</span>
              </div>
              <span className={`admin-health-dot ${healthLoading ? '' : healthStatus.database ? 'online' : 'offline'}`} />
            </div>
            <div className="admin-health-item">
              <div>
                <strong>Twilio WhatsApp Service</strong>
                <span>{healthStatus.twilio ? 'Credentials configured' : 'Credentials not set in settings'}</span>
              </div>
              <span className={`admin-health-dot ${healthLoading ? '' : healthStatus.twilio ? 'online' : 'offline'}`} />
            </div>
            <div className="admin-health-item">
              <div>
                <strong>Paystack API Gateway</strong>
                <span>{healthStatus.paystack ? 'Secret key configured' : 'PAYSTACK_SECRET_KEY not set'}</span>
              </div>
              <span className={`admin-health-dot ${healthLoading ? '' : healthStatus.paystack ? 'online' : 'offline'}`} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
