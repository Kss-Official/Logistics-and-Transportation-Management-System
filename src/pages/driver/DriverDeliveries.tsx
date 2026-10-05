import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Navigation,
  Truck,
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { DeliveryAssignment, DeliveryStatus } from '../../types/driverPortal';

export default function DriverDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await driverPortalService.getDeliveries();
      setDeliveries(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to load assigned deliveries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    let list = [...deliveries];

    if (activeTab === 'ASSIGNED') {
      list = list.filter((d) => ['ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'PENDING', 'CONFIRMED'].includes(d.status));
    } else if (activeTab === 'IN_TRANSIT') {
      list = list.filter((d) => ['IN_TRANSIT', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY'].includes(d.status));
    } else if (activeTab === 'COMPLETED') {
      list = list.filter((d) => d.status === 'DELIVERED');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.trackingNumber.toLowerCase().includes(q) ||
          d.orderNumber.toLowerCase().includes(q) ||
          d.recipientName.toLowerCase().includes(q) ||
          d.recipientCity.toLowerCase().includes(q) ||
          d.pickupLocation.facilityName.toLowerCase().includes(q)
      );
    }

    setFilteredDeliveries(list);
  }, [deliveries, activeTab, searchQuery]);

  const getStatusBadge = (del: DeliveryAssignment) => {
    switch (del.status) {
      case 'DELIVERED':
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="driver-badge driver-badge-green"><CheckCircle2 size={12} /> Delivered</span>
            {del.proofOfDelivery && (
              <span className="driver-badge driver-badge-green" style={{ backgroundColor: '#dcfce7', borderColor: '#86efac' }}>
                <CheckCircle2 size={11} /> ePOD Verified
              </span>
            )}
          </div>
        );
      case 'IN_TRANSIT':
        return <span className="driver-badge driver-badge-blue"><Navigation size={12} /> In Transit</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="driver-badge driver-badge-amber"><Truck size={12} /> Out For Delivery</span>;
      case 'ACCEPTED':
      case 'ARRIVED_AT_PICKUP':
      case 'PICKED_UP':
      case 'ARRIVED_AT_DESTINATION':
        return <span className="driver-badge driver-badge-amber"><Clock size={12} /> {del.status.replace(/_/g, ' ')}</span>;
      default:
        return <span className="driver-badge driver-badge-slate">{del.status.replace(/_/g, ' ')}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'CRITICAL') {
      return <span className="driver-badge driver-badge-danger">EXPRESS</span>;
    }
    if (priority === 'HIGH') {
      return <span className="driver-badge driver-badge-amber">PRIORITY</span>;
    }
    return <span className="driver-badge driver-badge-slate">STANDARD</span>;
  };

  return (
    <div className="driver-page-container">
      {/* ── Top Header and Search Bar ── */}
      <div className="driver-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Assigned Deliveries Directory
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                All delivery consignments assigned to your driver account and vehicle
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>
                Total: <strong>{filteredDeliveries.length}</strong> items
              </span>
            </div>
          </div>

          {/* Search and Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['ALL', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: activeTab === tab ? 700 : 500,
                    border: '1px solid',
                    borderColor: activeTab === tab ? '#2563eb' : '#e2e8f0',
                    backgroundColor: activeTab === tab ? '#2563eb' : '#ffffff',
                    color: activeTab === tab ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab === 'ALL' ? 'All Deliveries' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search tracking, recipient, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Deliveries List ── */}
      {loading ? (
        <div className="driver-card" style={{ textAlign: 'center', padding: 40, color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ width: 18, height: 18, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          <span>Loading delivery consignments...</span>
        </div>
      ) : error ? (
        <div className="driver-card" style={{ textAlign: 'center', padding: 40 }}>
          <AlertCircle size={40} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>{error}</h3>
          <button onClick={loadDeliveries} className="driver-btn-primary" style={{ marginTop: 12 }}>
            Retry
          </button>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="driver-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Package size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#334155' }}>No Deliveries Found</h3>
          <p style={{ color: '#64748b', fontSize: 13, margin: '6px 0 0' }}>
            No consignments match the selected filter or search query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredDeliveries.map((del) => (
            <div
              key={del.id}
              className="driver-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                borderLeft: del.status === 'DELIVERED' ? '4px solid #16a34a' : '4px solid #2563eb',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {del.trackingNumber}
                  </span>
                  {getStatusBadge(del)}
                  {getPriorityBadge(del.priority)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link
                    to={`/driver/deliveries/${del.id}`}
                    className="driver-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    <Eye size={13} /> Consignment Details
                  </Link>
                  {del.status !== 'DELIVERED' && (
                    <button
                      onClick={() => navigate('/driver/current-delivery')}
                      className="driver-btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      Active Trip <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Waypoints row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                  backgroundColor: '#f8fafc',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Origin Pickup Dock
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {del.pickupLocation.facilityName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {del.pickupLocation.city} (Dock: {del.pickupLocation.dockBay})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Customer Delivery Destination
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {del.recipientName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {del.destination.address}, {del.destination.city}
                  </div>
                </div>
              </div>

              {/* Footer info row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 12, color: '#64748b' }}>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span><strong>Cargo:</strong> {del.cargoSummary}</span>
                  <span><strong>Packages:</strong> {del.totalPackages}</span>
                  <span><strong>Weight:</strong> {del.totalWeightKg} kg</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1e3a8a', fontWeight: 600 }}>
                  <Clock size={13} />
                  <span>ETA: {del.estimatedDeliveryTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
