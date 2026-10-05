import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes, Plus, Search, Filter, RefreshCw, AlertTriangle,
  History, ArrowDownLeft, ShieldCheck, Edit3, X, CheckCircle2, MoreVertical
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type {
  WarehouseInventoryItem,
  ReceiveStockPayload,
  ReserveStockPayload,
  AdjustStockPayload,
} from '../../types/warehousePortal';

export default function Inventory() {
  const [items, setItems] = useState<WarehouseInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Modal states
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseInventoryItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<number | null>(null);

  // Receive Form
  const [receiveForm, setReceiveForm] = useState<ReceiveStockPayload>({
    sku: '',
    productName: '',
    category: 'Industrial',
    quantity: 10,
    reason: 'Routine stock replenishment',
    referenceNumber: '',
    unitPrice: 1000,
    unit: 'Units',
    reorderLevel: 10,
  });

  // Reserve Form
  const [reserveForm, setReserveForm] = useState<ReserveStockPayload>({
    sku: '',
    quantity: 1,
    referenceOrder: '',
    reason: 'Reserved for outgoing order fulfillment',
  });

  // Adjust Form
  const [adjustForm, setAdjustForm] = useState<AdjustStockPayload>({
    sku: '',
    newTotalStock: 0,
    reason: 'Physical inventory audit count reconciliation',
  });

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehousePortalService.getInventory(search, category, status);
      setItems(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to retrieve warehouse inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [category, status]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.wh-more-actions-menu')) {
        setOpenActionDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  // Open Receive for Existing or New
  const openReceiveModal = (item?: WarehouseInventoryItem) => {
    if (item) {
      setReceiveForm({
        sku: item.sku,
        productName: item.productName,
        category: item.category,
        quantity: 1,
        reason: 'Stock replenishment for SKU ' + item.sku,
        referenceNumber: '',
        unitPrice: item.unitPrice,
        unit: item.unit,
        reorderLevel: item.reorderLevel,
      });
    } else {
      setReceiveForm({
        sku: '',
        productName: '',
        category: 'Electronics',
        quantity: 1,
        reason: 'Catalog stock intake',
        referenceNumber: '',
        unitPrice: 0,
        unit: 'Units',
        reorderLevel: 10,
      });
    }
    setReceiveModalOpen(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await warehousePortalService.receiveStock(receiveForm);
      setReceiveModalOpen(false);
      setToastMessage(`Successfully received ${receiveForm.quantity} units of ${receiveForm.sku}.`);
      loadInventory();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to receive stock');
    } finally {
      setActionLoading(false);
    }
  };

  const openReserveModal = (item: WarehouseInventoryItem) => {
    setSelectedItem(item);
    setReserveForm({
      sku: item.sku,
      quantity: 1,
      referenceOrder: '',
      reason: 'Order reservation hold',
    });
    setReserveModalOpen(true);
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await warehousePortalService.reserveStock(reserveForm);
      setReserveModalOpen(false);
      setToastMessage(`Reserved ${reserveForm.quantity} units of ${reserveForm.sku}.`);
      loadInventory();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reserve stock');
    } finally {
      setActionLoading(false);
    }
  };

  const openAdjustModal = (item: WarehouseInventoryItem) => {
    setSelectedItem(item);
    setAdjustForm({
      sku: item.sku,
      newTotalStock: item.totalStock,
      reason: 'Manual cycle audit reconciliation',
    });
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await warehousePortalService.adjustStock(adjustForm);
      setAdjustModalOpen(false);
      setToastMessage(`Adjusted total stock for ${adjustForm.sku} to ${adjustForm.newTotalStock}.`);
      loadInventory();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Lock background body scroll when any inventory modal is open
  useEffect(() => {
    if (receiveModalOpen || reserveModalOpen || adjustModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [receiveModalOpen, reserveModalOpen, adjustModalOpen]);

  const categories = ['ALL', 'Electronics', 'Industrial', 'Automotive', 'Logistics Supplies', 'Packaging', 'Warehouse Tech', 'Safety'];

  return (
    <div className="wh-page-container">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#065f46',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer', padding: 2, marginLeft: 8 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Warehouse Inventory & Stock
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            Real-time SKU balances, stock reservations, audits, and physical intake control.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => openReceiveModal()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              backgroundColor: '#059669',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
            }}
          >
            <Plus size={16} /> Receive Inbound Stock
          </button>
          <Link
            to="/warehouse/inventory-history"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 8,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <History size={16} /> View Audit History
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by SKU or Product Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 12.5,
                color: '#1e293b',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 12.5,
                color: '#1e293b',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <button
            onClick={loadInventory}
            title="Reload Inventory"
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading warehouse inventory records...</div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#dc2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: '0 0 12px', fontWeight: 600 }}>{error}</p>
            <button
              onClick={loadInventory}
              style={{ padding: '8px 16px', borderRadius: 8, backgroundColor: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Boxes size={42} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No inventory items found</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              No inventory entries match your filter criteria or no stock has been received yet.
            </p>
            <button
              onClick={() => openReceiveModal()}
              style={{ padding: '8px 16px', borderRadius: 8, backgroundColor: '#059669', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Receive Inbound Stock
            </button>
          </div>
        ) : (
          <div className="wh-table-wrapper" style={{ width: '100%', overflowX: 'hidden' }}>
            <table className="wh-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '30%' }}>Product & SKU</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Category</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', width: '14%' }}>Available</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', width: '12%' }}>Reserved</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', width: '12%' }}>Status</th>
                  <th className="wh-actions-header" style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', width: '16%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const statusBg =
                    item.status === 'IN_STOCK' ? '#d1fae5' : item.status === 'LOW_STOCK' ? '#fef3c7' : '#fee2e2';
                  const statusColor =
                    item.status === 'IN_STOCK' ? '#065f46' : item.status === 'LOW_STOCK' ? '#92400e' : '#b91c1c';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Product Name with SKU */}
                      <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: 13,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={item.productName}
                          >
                            {item.productName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span className="wh-mono-badge" style={{ fontSize: 10.5, padding: '1px 6px' }}>{item.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 14px', overflow: 'hidden' }}>
                        <span
                          style={{
                            backgroundColor: '#f1f5f9',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 500,
                            display: 'inline-block',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#475569',
                          }}
                          title={item.category}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Available */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: item.availableStock <= item.reorderLevel ? '#ea580c' : '#059669', fontSize: 13 }}>
                          {item.availableStock.toLocaleString()}
                        </div>
                        <span style={{ fontSize: 10.5, color: '#64748b' }}>
                          Total: {item.totalStock.toLocaleString()}
                        </span>
                      </td>

                      {/* Reserved */}
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#047857', fontWeight: 600 }}>
                        {item.reservedStock.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span
                          className="wh-badge"
                          style={{
                            backgroundColor: statusBg,
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                          }}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="wh-actions-cell" style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div className="wh-actions-group" style={{ gap: 5, justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                          <button
                            onClick={() => openReceiveModal(item)}
                            title="Receive Inbound Stock"
                            className="wh-action-btn wh-action-btn-primary"
                            style={{ padding: '0 8px', height: 26, fontSize: 11.5, gap: 4, flexShrink: 0 }}
                          >
                            <ArrowDownLeft size={12} />
                            <span>Receive</span>
                          </button>
                          <div className="wh-more-actions-menu" style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(openActionDropdownId === item.id ? null : item.id);
                              }}
                              title="More Actions"
                              className="wh-action-btn wh-action-btn-outline"
                              style={{ width: 26, height: 26, padding: 0, justifyContent: 'center', flexShrink: 0 }}
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openActionDropdownId === item.id && (
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: 'calc(100% + 4px)',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 8,
                                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)',
                                  zIndex: 999,
                                  minWidth: 150,
                                  padding: '4px 0',
                                  textAlign: 'left',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    openAdjustModal(item);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 12,
                                    color: '#334155',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Edit3 size={13} color="#059669" />
                                  <span>Adjust Stock</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Receive Stock ── */}
      {receiveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 520, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 8, borderRadius: 8, backgroundColor: '#d1fae5', color: '#059669' }}>
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Receive Inbound Stock</h3>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Audit recorded stock intake</span>
                </div>
              </div>
              <button onClick={() => setReceiveModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={receiveForm.sku}
                    onChange={(e) => setReceiveForm({ ...receiveForm, sku: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Product Category</label>
                  <select
                    value={receiveForm.category}
                    onChange={(e) => setReceiveForm({ ...receiveForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    {categories.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={receiveForm.productName}
                  onChange={(e) => setReceiveForm({ ...receiveForm, productName: e.target.value })}
                  placeholder="e.g. Industrial Hydraulic Assembly"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Quantity to Receive *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiveForm.quantity}
                    onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Measurement Unit</label>
                  <input
                    type="text"
                    value={receiveForm.unit}
                    onChange={(e) => setReceiveForm({ ...receiveForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Reference Document / Inbound Order #</label>
                <input
                  type="text"
                  value={receiveForm.referenceNumber}
                  onChange={(e) => setReceiveForm({ ...receiveForm, referenceNumber: e.target.value })}
                  placeholder="e.g. PO-89472 / BLR-IN-1002"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Reason / Receiving Notes</label>
                <input
                  type="text"
                  value={receiveForm.reason}
                  onChange={(e) => setReceiveForm({ ...receiveForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setReceiveModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#059669', color: '#fff', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Recording...' : 'Confirm Stock Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Reserve Stock ── */}
      {reserveModalOpen && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 460, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Reserve Stock: {selectedItem.sku}
              </h3>
              <button onClick={() => setReserveModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
              Current Available Stock: <strong>{selectedItem.availableStock} {selectedItem.unit}</strong>
            </p>

            <form onSubmit={handleReserveSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Units to Reserve *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.availableStock}
                  required
                  value={reserveForm.quantity}
                  onChange={(e) => setReserveForm({ ...reserveForm, quantity: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Reference Order Number
                </label>
                <input
                  type="text"
                  value={reserveForm.referenceOrder}
                  onChange={(e) => setReserveForm({ ...reserveForm, referenceOrder: e.target.value })}
                  placeholder="e.g. PR-ORD-12345678"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Reservation Reason
                </label>
                <input
                  type="text"
                  value={reserveForm.reason}
                  onChange={(e) => setReserveForm({ ...reserveForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setReserveModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#059669', color: '#fff', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Adjust Stock ── */}
      {adjustModalOpen && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 460, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Audit Stock Adjustment: {selectedItem.sku}
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
              Current Total Stock: <strong>{selectedItem.totalStock} {selectedItem.unit}</strong> • Reserved: <strong>{selectedItem.reservedStock}</strong>
            </p>

            <form onSubmit={handleAdjustSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  New Actual Count (Total Physical Stock) *
                </label>
                <input
                  type="number"
                  min={selectedItem.reservedStock}
                  required
                  value={adjustForm.newTotalStock}
                  onChange={(e) => setAdjustForm({ ...adjustForm, newTotalStock: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                <span style={{ fontSize: 11.5, color: '#64748b', display: 'block', marginTop: 4 }}>
                  Cannot be lower than currently reserved stock ({selectedItem.reservedStock} {selectedItem.unit}).
                </span>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Mandatory Audit Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="Explain why the physical inventory count differs..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Saving...' : 'Apply Audit Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
