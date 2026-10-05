import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  History, Search, Filter, RefreshCw, ArrowLeft, ArrowDownLeft,
  ArrowUpRight, ShieldCheck, AlertCircle, FileText, Calendar,
  Layers, CheckCircle2, User, ChevronRight, Download, X,
  ExternalLink, Hash, ArrowRight, Package, Box, Clock, Check,
  Eye, CornerDownLeft, CornerUpRight
} from 'lucide-react';
import { warehousePortalService } from '../../services/warehousePortalService';
import type { WarehouseTransaction } from '../../types/warehousePortal';

export default function InventoryHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSku = searchParams.get('sku') || '';

  // Data states
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [skuFilter, setSkuFilter] = useState(initialSku);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Selected transaction for slide-over drawer
  const [selectedTxn, setSelectedTxn] = useState<WarehouseTransaction | null>(null);
  const [warehouse, setWarehouse] = useState<{ name?: string; code?: string } | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, whData] = await Promise.all([
        warehousePortalService.getTransactions(skuFilter || undefined),
        warehousePortalService.getWarehouse().catch(() => null),
      ]);
      setTransactions(Array.isArray(data) ? data : []);
      if (whData) {
        setWarehouse({
          name: whData.warehouseName,
          code: whData.warehouseCode,
        });
      }
    } catch (err: unknown) {
      console.error('Failed to load transaction history:', err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Unable to retrieve inventory audit transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [skuFilter]);

  // Lock background body scroll when audit drawer is open
  useEffect(() => {
    if (selectedTxn) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedTxn]);

  // Distinct SKUs present in transactions
  const distinctSkus = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => { if (t.sku) set.add(t.sku); });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'ALL' && t.transactionType !== typeFilter) return false;

        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (t.sku && t.sku.toLowerCase().includes(q)) ||
          (t.productName && t.productName.toLowerCase().includes(q)) ||
          (t.performedBy && t.performedBy.toLowerCase().includes(q)) ||
          (t.referenceShipment && t.referenceShipment.toLowerCase().includes(q)) ||
          (t.referenceOrder && t.referenceOrder.toLowerCase().includes(q)) ||
          (t.reason && t.reason.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [transactions, typeFilter, search, sortOrder]);

  // KPI Metrics
  const kpis = useMemo(() => {
    const totalCount = transactions.length;
    let totalReceived = 0;
    let totalDispatched = 0;
    let totalReserved = 0;
    let adjustmentsCount = 0;

    transactions.forEach(t => {
      const qty = Math.abs(t.quantity || 0);
      if (t.transactionType === 'RECEIVE' || t.transactionType === 'TRANSFER_IN') {
        totalReceived += qty;
      } else if (t.transactionType === 'DISPATCH' || t.transactionType === 'TRANSFER_OUT') {
        totalDispatched += qty;
      } else if (t.transactionType === 'RESERVE') {
        totalReserved += qty;
      } else if (t.transactionType === 'ADJUSTMENT' || t.transactionType === 'DAMAGE' || t.transactionType === 'RELEASE') {
        adjustmentsCount += 1;
      }
    });

    return {
      totalCount,
      totalReceived,
      totalDispatched,
      totalReserved,
      adjustmentsCount
    };
  }, [transactions]);

  const hasActiveFilters = search || skuFilter || typeFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSkuFilter('');
    setTypeFilter('ALL');
    setSearchParams({});
  };

  // Badge rendering
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'RECEIVE':
      case 'TRANSFER_IN':
        return <span className="wh-badge green"><ArrowDownLeft size={12} /> RECEIVE</span>;
      case 'DISPATCH':
      case 'TRANSFER_OUT':
        return <span className="wh-badge blue"><ArrowUpRight size={12} /> DISPATCH</span>;
      case 'RESERVE':
        return <span className="wh-badge indigo"><ShieldCheck size={12} /> RESERVE</span>;
      case 'RELEASE':
        return <span className="wh-badge cyan"><RefreshCw size={12} /> RELEASE</span>;
      case 'ADJUSTMENT':
        return <span className="wh-badge amber"><FileText size={12} /> ADJUSTMENT</span>;
      case 'DAMAGE':
        return <span className="wh-badge rose"><AlertCircle size={12} /> DAMAGE</span>;
      default:
        return <span className="wh-badge slate">{type}</span>;
    }
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Event Type',
      'Product Name',
      'SKU',
      'Quantity',
      'Previous Available',
      'New Balance',
      'Reference',
      'Performed By',
      'Reason'
    ];

    const rows = filteredTransactions.map(t => [
      `TXN-${t.id}`,
      `"${t.timestamp ? new Date(t.timestamp).toISOString() : ''}"`,
      t.transactionType,
      `"${(t.productName || '').replace(/"/g, '""')}"`,
      `"${t.sku || ''}"`,
      t.quantity,
      t.previousAvailable,
      t.newAvailable,
      `"${t.referenceShipment || t.referenceOrder || ''}"`,
      `"${(t.performedBy || 'System').replace(/"/g, '""')}"`,
      `"${(t.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wh-page-container">
      {/* ── Page Header ── */}
      <div className="wh-header-row">
        <div>
          <div className="wh-title-group">
            <div className="wh-title-icon">
              <History size={22} />
            </div>
            <div>
              <h1 className="wh-page-title">Inventory History</h1>
              <p className="wh-page-subtitle">
                Authoritative, immutable ledger recording stock intakes, order reservations, dispatches, and warehouse reconciliations.
              </p>
            </div>
          </div>
        </div>

        <div className="wh-header-actions">
          <Link
            to="/warehouse/inventory"
            className="wh-btn wh-btn-outline"
          >
            <ArrowLeft size={15} />
            <span>Back to Inventory</span>
          </Link>

          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="wh-btn wh-btn-outline"
            title="Download audit records as CSV"
          >
            <Download size={15} />
            <span>Export Audit Log</span>
          </button>

          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="wh-btn wh-btn-primary"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Refresh Log'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="wh-kpi-grid">
        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Total Events</span>
            <div className="wh-kpi-icon indigo">
              <History size={18} />
            </div>
          </div>
          <div className="wh-kpi-value">{kpis.totalCount}</div>
          <div className="wh-kpi-subtext">Immutable ledger transactions</div>
        </div>

        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Stock Received</span>
            <div className="wh-kpi-icon green">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="wh-kpi-value" style={{ color: '#059669' }}>
            +{kpis.totalReceived.toLocaleString()}
          </div>
          <div className="wh-kpi-subtext">Inbound units received</div>
        </div>

        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Stock Dispatched</span>
            <div className="wh-kpi-icon green">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="wh-kpi-value" style={{ color: '#059669' }}>
            -{kpis.totalDispatched.toLocaleString()}
          </div>
          <div className="wh-kpi-subtext">Outbound fulfilled units</div>
        </div>

        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Reserved Stock</span>
            <div className="wh-kpi-icon indigo">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="wh-kpi-value" style={{ color: '#059669' }}>
            {kpis.totalReserved.toLocaleString()}
          </div>
          <div className="wh-kpi-subtext">Active order allocations</div>
        </div>

        <div className="wh-kpi-card">
          <div className="wh-kpi-top">
            <span className="wh-kpi-label">Adjustments</span>
            <div className="wh-kpi-icon amber">
              <FileText size={18} />
            </div>
          </div>
          <div className="wh-kpi-value" style={{ color: '#d97706' }}>
            {kpis.adjustmentsCount}
          </div>
          <div className="wh-kpi-subtext">Audit reconciliations & write-offs</div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="wh-toolbar-card">
        <div className="wh-toolbar-row">
          <div className="wh-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by SKU, product, operator, reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="wh-search-input"
            />
          </div>

          <div className="wh-filters-group">
            {/* SKU Filter */}
            <select
              value={skuFilter}
              onChange={(e) => {
                setSkuFilter(e.target.value);
                if (e.target.value) setSearchParams({ sku: e.target.value });
                else setSearchParams({});
              }}
              className="wh-select"
            >
              <option value="">All Product SKUs</option>
              {distinctSkus.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Transaction Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="wh-select"
            >
              <option value="ALL">All Event Types</option>
              <option value="RECEIVE">RECEIVE (Inbound Intake)</option>
              <option value="DISPATCH">DISPATCH (Outbound Departure)</option>
              <option value="RESERVE">RESERVE (Order Allocation)</option>
              <option value="RELEASE">RELEASE (Allocation Cancel)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Audit Reconciliation)</option>
              <option value="DAMAGE">DAMAGE (Quarantine / Write-off)</option>
            </select>

            {/* Chronological Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
              className="wh-select"
            >
              <option value="desc">Newest Events First</option>
              <option value="asc">Oldest Events First</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="wh-btn wh-btn-outline wh-btn-sm"
              >
                <X size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="wh-toolbar-meta">
          <div>
            Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> ledger records
            {skuFilter && <span className="wh-tag" style={{ marginLeft: 8 }}>SKU: {skuFilter}</span>}
            {typeFilter !== 'ALL' && <span className="wh-tag" style={{ marginLeft: 6 }}>Type: {typeFilter}</span>}
          </div>
          {hasActiveFilters && (
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Active filters applied</span>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button onClick={loadHistory} className="wh-btn wh-btn-sm wh-btn-outline">
            Retry
          </button>
        </div>
      )}

      {/* ── AUDIT TABLE ── */}
      <div className="wh-table-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              INVENTORY AUDIT LEDGER
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              Immutable transaction log stored in PostgreSQL database
            </p>
          </div>
          <span className="wh-badge slate">
            {filteredTransactions.length} Entries
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Retrieving audit ledger from PostgreSQL...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <History size={44} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No Transactions Found</h4>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              No audit transactions match your query. Try clearing filters.
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="wh-btn wh-btn-outline wh-btn-sm" style={{ marginTop: 16 }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="wh-table-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="wh-table" style={{ width: '100%', minWidth: 1260, borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 11.5 }}>
                  <th style={{ padding: '13px 16px', fontWeight: 700, width: 140, minWidth: 140, whiteSpace: 'nowrap' }}>Date & Time</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, width: 160, minWidth: 160, whiteSpace: 'nowrap' }}>Event</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, minWidth: 230 }}>Product</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, width: 120, minWidth: 120, whiteSpace: 'nowrap' }}>SKU</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, textAlign: 'right', width: 100, minWidth: 100, whiteSpace: 'nowrap' }}>Quantity</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, textAlign: 'right', width: 95, minWidth: 95, whiteSpace: 'nowrap' }}>Previous</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, textAlign: 'right', width: 110, minWidth: 110, whiteSpace: 'nowrap' }}>New Balance</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, width: 135, minWidth: 135, whiteSpace: 'nowrap' }}>Reference</th>
                  <th style={{ padding: '13px 16px', fontWeight: 700, width: 145, minWidth: 145, whiteSpace: 'nowrap' }}>Performed By</th>
                  <th className="wh-actions-header" style={{ padding: '13px 16px', fontWeight: 700, textAlign: 'center', width: 100, minWidth: 100, whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  const dateObj = t.timestamp ? new Date(t.timestamp) : null;
                  const dateStr = dateObj ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                  const timeStr = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const isSelected = selectedTxn?.id === t.id;

                  const isPositive = t.quantity > 0;
                  const isNegative = t.quantity < 0;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTxn(t)}
                      className={`clickable ${isSelected ? 'selected' : ''}`}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      {/* Date & Time */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12.5 }}>
                          {dateStr}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                          {timeStr}
                        </div>
                      </td>

                      {/* Event Badge */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {renderTypeBadge(t.transactionType)}
                        </div>
                      </td>

                      {/* Product */}
                      <td style={{ padding: '12px 16px', minWidth: 230 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: 13,
                            maxWidth: 260,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={t.productName}
                        >
                          {t.productName || 'Standard Item'}
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span className="wh-mono-badge" style={{ fontSize: 11.5, padding: '3px 8px' }}>
                          {t.sku}
                        </span>
                      </td>

                      {/* Quantity Delta */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: 12.5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isPositive ? '#ecfdf5' : isNegative ? '#fff1f2' : '#f1f5f9',
                          color: isPositive ? '#065f46' : isNegative ? '#9f1239' : '#334155',
                          border: `1px solid ${isPositive ? '#a7f3d0' : isNegative ? '#fecdd3' : '#e2e8f0'}`
                        }}>
                          {isPositive ? `+${t.quantity}` : t.quantity}
                        </span>
                      </td>

                      {/* Previous Available */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#64748b', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                        {t.previousAvailable ?? '—'}
                      </td>

                      {/* New Balance */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#047857', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {t.newAvailable ?? '—'}
                      </td>

                      {/* Reference */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {t.referenceShipment ? (
                          <span className="wh-badge indigo" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.referenceShipment}>
                            <Box size={11} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.referenceShipment}</span>
                          </span>
                        ) : t.referenceOrder ? (
                          <span className="wh-mono-badge" style={{ fontSize: 11, padding: '3px 8px' }}>
                            ORD-{t.referenceOrder}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                        )}
                      </td>

                      {/* Performed By */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                          <div className="wh-avatar" style={{ width: 24, height: 24, fontSize: 10, flexShrink: 0 }}>
                            {(t.performedBy || 'OP').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 12.5, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.performedBy || 'System'}>
                            {t.performedBy || 'System'}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="wh-actions-cell" style={{ padding: '12px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div className="wh-actions-group" style={{ justifyContent: 'center' }}>
                          <button
                            onClick={() => setSelectedTxn(t)}
                            className="wh-action-btn wh-action-btn-outline"
                            title="View complete audit record in inspector drawer"
                            style={{ padding: '0 10px', height: 28, fontSize: 11.5, gap: 5 }}
                          >
                            <Eye size={12} />
                            <span>Audit</span>
                          </button>
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

      {/* ── Slide-Over Transaction Detail Drawer ── */}
      {selectedTxn && (
        <div
          className="wh-drawer-overlay"
          onClick={() => setSelectedTxn(null)}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="wh-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="wh-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="wh-title-icon" style={{ width: 40, height: 40 }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      Audit Transaction Record
                    </h3>
                    <span className="wh-mono-badge">TXN-{selectedTxn.id}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#64748b' }}>
                    Immutable PostgreSQL ledger entry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="wh-btn-icon"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="wh-drawer-body">
              {/* SECTION 1: TRANSACTION METADATA */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Hash size={13} color="#059669" />
                  <span>TRANSACTION METADATA</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Record ID</span>
                    <span className="wh-mono-badge">#{selectedTxn.id}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Event Classification</span>
                    <span>{renderTypeBadge(selectedTxn.transactionType)}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Audit Timestamp</span>
                    <span className="wh-drawer-val">
                      {selectedTxn.timestamp ? new Date(selectedTxn.timestamp).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Initiating Operator</span>
                    <span className="wh-drawer-val">{selectedTxn.performedBy || 'System Operator'}</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Facility Hub</span>
                    <span className="wh-drawer-val">
                      {warehouse?.name ? `${warehouse.name} (${warehouse.code || 'HUB'})` : 'Origin Facility'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: STOCK BALANCE FLOW */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Package size={13} color="#059669" />
                  <span>STOCK BALANCE RECONCILIATION</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Product SKU</span>
                    <span className="wh-mono-badge">{selectedTxn.sku}</span>
                  </div>
                  {selectedTxn.productName && (
                    <div className="wh-drawer-row">
                      <span className="wh-drawer-label">Product Name</span>
                      <span className="wh-drawer-val">{selectedTxn.productName}</span>
                    </div>
                  )}

                  {/* Flow comparison cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block' }}>Previous</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#475569', fontFamily: 'monospace' }}>
                        {selectedTxn.previousAvailable ?? '—'}
                      </span>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block' }}>Net Change</span>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        color: selectedTxn.quantity > 0 ? '#059669' : selectedTxn.quantity < 0 ? '#dc2626' : '#0f172a'
                      }}>
                        {selectedTxn.quantity > 0 ? `+${selectedTxn.quantity}` : selectedTxn.quantity}
                      </span>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#065f46', fontWeight: 600, display: 'block' }}>New Balance</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#065f46', fontFamily: 'monospace' }}>
                        {selectedTxn.newAvailable ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BUSINESS REFERENCE */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <Box size={13} color="#059669" />
                  <span>CONSIGNMENT & ORDER REFERENCE</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Reference Shipment</span>
                    {selectedTxn.referenceShipment ? (
                      <span className="wh-badge indigo">{selectedTxn.referenceShipment}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>None associated</span>
                    )}
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Reference Order</span>
                    {selectedTxn.referenceOrder ? (
                      <span className="wh-mono-badge">ORD-{selectedTxn.referenceOrder}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>None associated</span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Audit Justification Note:</span>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#0f172a', background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      {selectedTxn.reason || 'Standard operational record logged during automated warehouse workflow.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: LEDGER IMMUTABILITY */}
              <div className="wh-drawer-section">
                <div className="wh-drawer-section-title">
                  <ShieldCheck size={13} color="#059669" />
                  <span>SYSTEM COMPLIANCE & INTEGRITY</span>
                </div>
                <div className="wh-drawer-card">
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Storage Engine</span>
                    <span className="wh-drawer-val">PostgreSQL 18 Enterprise</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Database Table</span>
                    <span className="wh-mono-badge">warehouse_inventory_transactions</span>
                  </div>
                  <div className="wh-drawer-row">
                    <span className="wh-drawer-label">Record State</span>
                    <span className="wh-badge green">LOCKED & IMMUTABLE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="wh-drawer-footer">
              <button
                onClick={() => setSelectedTxn(null)}
                className="wh-btn wh-btn-outline"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
