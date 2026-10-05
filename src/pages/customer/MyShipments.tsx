import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Navigation,
  RefreshCw,
  Eye,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/States';
import { shipmentService } from '../../services/shipmentService';
import ShipmentDetailDrawer from '../../components/shipments/ShipmentDetailDrawer';
import type { ShipmentSummary, Shipment } from '../../types/shipment';

export default function MyShipments() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getAllShipments();
      setShipments(data);
    } catch (error) {
      console.error('Failed to load shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (s: ShipmentSummary) => {
    setSelectedShipment(s);
    setIsDrawerOpen(true);
  };

  const filteredShipments = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    return shipments.filter((shipment) => {
      const matchSearch =
        shipment.trackingNumber.toLowerCase().includes(searchText) ||
        shipment.orderNumber.toLowerCase().includes(searchText) ||
        (shipment.destination && shipment.destination.toLowerCase().includes(searchText)) ||
        (shipment.origin && shipment.origin.toLowerCase().includes(searchText)) ||
        (shipment.currentLocation && shipment.currentLocation.toLowerCase().includes(searchText));

      const matchStatus =
        statusFilter === 'ALL' || shipment.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [shipments, search, statusFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            My Shipments
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Track real-time freight dispatches, in-transit movements, and delivery status.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={loadShipments}
          disabled={loading}
          title="Refresh Shipments"
          style={{ height: 38, gap: 6, fontSize: 13 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Tracking Number, Order ID, Destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrapper">
        {loading ? (
          <div
            style={{
              minHeight: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <RefreshCw size={22} className="animate-spin" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Loading shipments from server...
            </span>
          </div>
        ) : filteredShipments.length === 0 ? (
          <EmptyState
            title={
              shipments.length === 0 ? 'No shipments yet' : 'No shipments found'
            }
            description={
              shipments.length === 0
                ? 'Your shipment telemetry will appear here once an order has been booked.'
                : 'No shipments match your current search or status filter.'
            }
          />
        ) : (
          <div className="table-container" style={{ width: '100%', maxWidth: '100%' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Tracking Number</th>
                  <th style={{ width: '20%' }}>Order Number</th>
                  <th style={{ width: '25%' }}>Destination</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    {/* 1. Tracking Number */}
                    <td className="td-mono font-medium" style={{ color: '#0f172a' }}>
                      {shipment.trackingNumber}
                    </td>

                    {/* 2. Order Number */}
                    <td className="td-mono text-xs" style={{ color: '#475569' }}>
                      {shipment.orderNumber}
                    </td>

                    {/* 3. Destination */}
                    <td className="td-primary" title={shipment.destination}>
                      <span className="font-medium">{shipment.destination || '—'}</span>
                    </td>

                    {/* 4. Status */}
                    <td>
                      <StatusBadge status={shipment.status as any} />
                    </td>

                    {/* 5. Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div
                        className="td-actions"
                        style={{ justifyContent: 'center', gap: 6, display: 'flex', alignItems: 'center' }}
                      >
                        <button
                          className="btn btn-outline btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                          onClick={() => handleOpenDrawer(shipment)}
                          title="View Shipment Details"
                        >
                          <Eye size={12} /> <span>View</span>
                        </button>

                        <button
                          className="btn btn-primary btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                          onClick={() =>
                            navigate(`/customer/track?id=${shipment.trackingNumber}`)
                          }
                          title="Live GPS Track"
                        >
                          <Navigation size={12} /> <span>Track</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <ShipmentDetailDrawer
        shipment={selectedShipment}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedShipment(null);
        }}
      />
    </div>
  );
}
