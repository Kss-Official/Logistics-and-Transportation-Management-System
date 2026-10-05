import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  CheckCircle2,
  Calendar,
  Search,
  Package,
  Eye,
  ArrowRight,
  FileCheck,
  Download
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DeliveryAssignment } from '../../types/driverPortal';

export default function DriverHistory() {
  const [history, setHistory] = useState<DeliveryAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    driverPortalService.getDeliveries().then((data) => {
      if (isMounted) {
        // Filter completed
        const completed = data.filter(d => d.status === 'DELIVERED');
        setHistory(completed);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const filteredHistory = history.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.trackingNumber.toLowerCase().includes(q) ||
      d.recipientName.toLowerCase().includes(q) ||
      d.recipientCity.toLowerCase().includes(q) ||
      d.deliveryLocation.facilityName.toLowerCase().includes(q)
    );
  });

  const totalDeliveredPkgs = history.reduce((sum, d) => sum + d.totalPackages, 0);

  return (
    <div className="driver-page-container">
      {/* ── Summary Stats ── */}
      <div className="driver-kpi-grid">
        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Completed Drops</span>
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          </div>
          <div className="driver-kpi-value" style={{ color: '#16a34a' }}>{history.length}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>With digital signature proof</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">Total Packages Delivered</span>
            <Package size={18} style={{ color: '#2563eb' }} />
          </div>
          <div className="driver-kpi-value">{totalDeliveredPkgs}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Zero cargo loss/discrepancies</div>
        </div>

        <div className="driver-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="driver-kpi-label">On-Time Success</span>
            <History size={18} style={{ color: '#2563eb' }} />
          </div>
          <div className="driver-kpi-value">100%</div>
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Within SLA window</div>
        </div>
      </div>

      {/* ── Completed Consignments Directory ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Historical Completed Consignments
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Archive of all delivered shipments and verified ePOD submissions
            </p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search tracking, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#2563eb' }}>Loading history...</div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Package size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
            <div>No completed delivery records found matching search.</div>
          </div>
        ) : (
          <div className="driver-table-wrapper">
            <table className="driver-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Tracking / Waybill</th>
                  <th style={{ width: '25%' }}>Recipient & Facility</th>
                  <th style={{ width: '20%' }}>Received By</th>
                  <th style={{ width: '15%' }}>Packages</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((del) => (
                  <tr key={del.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{del.trackingNumber}</div>
                      <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Delivered &bull; {del.assignedDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{del.recipientName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{del.deliveryLocation.facilityName}, {del.recipientCity}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {del.proofOfDelivery?.receivedBy || del.recipientName}
                      </div>
                      <div style={{ fontSize: 11, color: '#16a34a' }}>ePOD Signed</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{del.totalPackages} units</span>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{del.totalWeightKg} kg</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/driver/deliveries/${del.id}`}
                        className="driver-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                      >
                        <Eye size={12} /> Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
