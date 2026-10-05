import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Truck,
  Calendar,
  Gauge,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { driverPortalService } from '../../services/driverPortalService';
import type { VehicleInspectionReport } from '../../types/driverPortal';

const INSPECTION_ITEMS = [
  { id: 'engine_oil', label: 'Engine Oil & Coolant Levels', category: 'Fluids' },
  { id: 'brakes', label: 'Service Brakes & Handbrake / Air Pressure', category: 'Mechanical' },
  { id: 'lights', label: 'Headlights, Tail Lights, Brake Lights & Indicators', category: 'Electrical' },
  { id: 'tyres', label: 'Tyre Tread Depth, Pressure & Wheel Lug Nuts', category: 'Running Gear' },
  { id: 'windshield_mirrors', label: 'Windshield, Wipers & Rear View Mirrors', category: 'Visibility' },
  { id: 'horn_beeper', label: 'Horn & Reverse Audible Warning Beeper', category: 'Safety Devices' },
  { id: 'cargo_latches', label: 'Cargo Bed Doors, Side Latches & Tie-Down Straps', category: 'Cargo Area' },
  { id: 'emergency_kit', label: 'Emergency First Aid Kit & Charged Fire Extinguisher', category: 'Emergency Equipment' },
];

export default function DriverVehicleInspection() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<VehicleInspectionReport[]>([]);
  const [inspectionType, setInspectionType] = useState<'PRE_TRIP' | 'POST_TRIP'>('PRE_TRIP');
  const [odometerKm, setOdometerKm] = useState<number>(42150);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Status map for each item (default all PASS)
  const [itemStatuses, setItemStatuses] = useState<Record<string, 'PASS' | 'FAIL'>>(() => {
    const map: Record<string, 'PASS' | 'FAIL'> = {};
    INSPECTION_ITEMS.forEach(item => {
      map[item.id] = 'PASS';
    });
    return map;
  });

  useEffect(() => {
    let isMounted = true;
    driverPortalService.getInspections().then((data) => {
      if (isMounted) {
        setHistory(data);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const handleStatusChange = (itemId: string, status: 'PASS' | 'FAIL') => {
    setItemStatuses(prev => ({ ...prev, [itemId]: status }));
  };

  const hasAnyFailure = Object.values(itemStatuses).some(s => s === 'FAIL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const itemsList = INSPECTION_ITEMS.map(i => ({
        id: i.id,
        label: i.label,
        status: itemStatuses[i.id] || 'PASS',
      }));

      const newReport = await driverPortalService.submitInspection({
        vehicleCode: 'PR-VH-005',
        driverId: 'DRV-001',
        inspectionType,
        overallStatus: hasAnyFailure ? 'FAILED' : 'PASSED',
        items: itemsList,
        odometerKm,
        notes: remarks,
      });

      setHistory(prev => [newReport, ...prev]);
      setSuccessMessage(`Inspection report submitted successfully (${newReport.overallStatus})`);
      setRemarks('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to submit inspection:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="driver-page-container">
      {/* ── Header ── */}
      <div className="driver-card">
        <div className="driver-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="driver-badge driver-badge-blue">SAFETY & COMPLIANCE</span>
              <span style={{ fontSize: 13, color: '#64748b' }}>Truck: PR-VH-005 (KA-01-E-4921)</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Daily Vehicle Safety Inspection (DVIR)
            </h2>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Mandatory walkaround safety inspection before dispatch and post-shift return
            </div>
          </div>
        </div>

        {/* ── Success Alert ── */}
        {successMessage && (
          <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, color: '#15803d', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        {/* ── Inspection Form ── */}
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          {/* Metadata Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, backgroundColor: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Inspection Cycle
              </label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, backgroundColor: '#ffffff' }}
              >
                <option value="PRE_TRIP">Pre-Trip Safety Inspection</option>
                <option value="POST_TRIP">Post-Trip Return Inspection</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Current Odometer (KM)
              </label>
              <input
                type="number"
                value={odometerKm}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Inspector Driver
              </label>
              <div style={{ padding: '8px 10px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                Ramesh Kumar (DRV-001)
              </div>
            </div>
          </div>

          {/* Checklist Items Table */}
          <div className="driver-table-wrapper">
            <table className="driver-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Inspection Checkpoint</th>
                  <th style={{ width: '25%' }}>System Category</th>
                  <th style={{ width: '30%', textAlign: 'right' }}>Evaluation Status</th>
                </tr>
              </thead>
              <tbody>
                {INSPECTION_ITEMS.map((item) => {
                  const status = itemStatuses[item.id];
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.label}</td>
                      <td style={{ color: '#64748b' }}>{item.category}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'PASS')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 12px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: status === 'PASS' ? '1px solid #86efac' : '1px solid #cbd5e1',
                              backgroundColor: status === 'PASS' ? '#dcfce7' : '#ffffff',
                              color: status === 'PASS' ? '#15803d' : '#64748b',
                            }}
                          >
                            <CheckCircle2 size={13} /> Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'FAIL')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 12px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: status === 'FAIL' ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                              backgroundColor: status === 'FAIL' ? '#fee2e2' : '#ffffff',
                              color: status === 'FAIL' ? '#b91c1c' : '#64748b',
                            }}
                          >
                            <XCircle size={13} /> Defect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Inspector Notes / Discovered Defects
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. All fluids topped up. Tyre pressures checked normal. Vehicle certified safe for road dispatch..."
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              className="driver-btn-primary"
              style={{ padding: '10px 24px', fontSize: 13.5 }}
            >
              {submitting ? 'Submitting Inspection Report...' : 'Submit Safety Inspection Report'}
              <ShieldCheck size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* ── Inspection History Table ── */}
      <div className="driver-card">
        <h3 className="driver-card-title">
          <Clock size={18} style={{ color: '#2563eb' }} />
          Inspection Audit History
        </h3>

        <div className="driver-table-wrapper" style={{ marginTop: 14 }}>
          <table className="driver-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Timestamp</th>
                <th style={{ width: '25%' }}>Type</th>
                <th style={{ width: '20%' }}>Odometer</th>
                <th style={{ width: '15%' }}>Result</th>
                <th style={{ width: '15%' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.map((rep) => (
                <tr key={rep.id}>
                  <td style={{ fontWeight: 600 }}>{rep.timestamp}</td>
                  <td>{rep.inspectionType.replace('_', ' ')}</td>
                  <td>{rep.odometerKm.toLocaleString()} KM</td>
                  <td>
                    {rep.overallStatus === 'PASSED' ? (
                      <span className="driver-badge driver-badge-green">PASSED</span>
                    ) : (
                      <span className="driver-badge driver-badge-danger">DEFECT REPORTED</span>
                    )}
                  </td>
                  <td style={{ color: '#64748b' }}>{rep.notes || 'All systems normal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
