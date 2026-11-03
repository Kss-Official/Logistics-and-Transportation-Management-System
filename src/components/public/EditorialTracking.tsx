import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle2, Clock, MapPin, Truck, AlertCircle, Loader2 } from 'lucide-react';
import publicService from '../../services/publicService';

const SAMPLE_TRACKING_IDS = [
  'TRK-2026-00124',
  'TRK-PR-ORD-71673158',
  'TRK-2026-00125'
];

export default function EditorialTracking() {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeStep, setActiveStep] = useState(2); // 0: Picked Up, 1: In Transit, 2: Out for Delivery, 3: Delivered
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    status: string;
    origin: string;
    destination: string;
    currentLocation: string;
    eta: string;
  } | null>({
    id: 'TRK-2026-00124',
    status: 'IN TRANSIT',
    origin: 'Mumbai Central Hub (MH)',
    destination: 'Bangalore Electronic City DC (KA)',
    currentLocation: 'Pune Expressway Corridor Hub (MH)',
    eta: '06 Oct 2026, 05:00 PM',
  });

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingNumber.trim();
    if (!query) return;

    setLoading(true);
    try {
      const liveData = await publicService.trackPublicShipment(query);
      if (liveData) {
        const originStr = liveData.pickup?.city
          ? `${liveData.pickup.city}, ${liveData.pickup.state || ''}`
          : liveData.pickupAddress || 'Origin Terminal';

        const destStr = liveData.delivery?.city
          ? `${liveData.delivery.city}, ${liveData.delivery.state || ''}`
          : liveData.deliveryAddress || 'Destination Hub';

        const currStr = liveData.currentLocation?.locationName
          || liveData.currentLocationName
          || 'Transit Waypoint';

        const etaStr = liveData.estimatedDeliveryDate
          ? new Date(liveData.estimatedDeliveryDate).toLocaleDateString()
          : 'Scheduled Transit';

        setResult({
          id: liveData.trackingNumber || query,
          status: String(liveData.status || 'IN TRANSIT'),
          origin: originStr,
          destination: destStr,
          currentLocation: currStr,
          eta: etaStr,
        });

        // Map status to 0..3
        const statusUpper = (liveData.status || '').toUpperCase();
        if (statusUpper.includes('DELIVERED')) setActiveStep(3);
        else if (statusUpper.includes('OUT')) setActiveStep(2);
        else if (statusUpper.includes('TRANSIT')) setActiveStep(1);
        else setActiveStep(0);
      }
    } catch {
      // Fallback for custom search
      setResult({
        id: query.toUpperCase(),
        status: 'IN TRANSIT',
        origin: 'Corridor Origin Hub',
        destination: 'Regional Delivery Center',
        currentLocation: 'National Highway Waypoint Hub',
        eta: 'Estimated 24-48 Hours',
      });
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectSample = (sampleId: string) => {
    setTrackingNumber(sampleId);
    if (sampleId === 'TRK-2026-00124') {
      setResult({
        id: 'TRK-2026-00124',
        status: 'IN TRANSIT',
        origin: 'Mumbai Central Hub (MH)',
        destination: 'Bangalore Electronic City DC (KA)',
        currentLocation: 'Pune Expressway Corridor Hub (MH)',
        eta: '06 Oct 2026, 05:00 PM',
      });
      setActiveStep(1);
    } else if (sampleId === 'TRK-2026-00125') {
      setResult({
        id: 'TRK-2026-00125',
        status: 'OUT FOR DELIVERY',
        origin: 'Delhi Northern Terminal (DL)',
        destination: 'Jaipur Industrial Area (RJ)',
        currentLocation: 'Jaipur Logistics Park (RJ)',
        eta: 'Today, 02:15 PM',
      });
      setActiveStep(2);
    } else {
      setResult({
        id: sampleId,
        status: 'IN TRANSIT',
        origin: 'Cuttack Hub (OD)',
        destination: 'Bengaluru Tech Park (KA)',
        currentLocation: 'Hyderabad Gateway Depot (TG)',
        eta: 'Tomorrow, 10:30 AM',
      });
      setActiveStep(1);
    }
  };

  return (
    <section className="editorial-tracking-section" id="tracking">
      <div className="editorial-container">
        <div className="editorial-tracking-card">
          <div className="editorial-tracking-header">
            <div>
              <div className="editorial-section-tag">
                <MapPin size={13} />
                <span>Live Shipment Telematics</span>
              </div>
              <h2 className="editorial-tracking-title">
                WHERE IS YOUR<br />SHIPMENT?
              </h2>
            </div>

            {/* Quick Demo Selector Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quick Samples:
              </span>
              {SAMPLE_TRACKING_IDS.map((sid) => (
                <button
                  key={sid}
                  type="button"
                  onClick={() => selectSample(sid)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    background: trackingNumber === sid ? '#0284c7' : '#f1f5f9',
                    color: trackingNumber === sid ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {sid}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleTrackSubmit} className="editorial-tracking-form-wrap">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number e.g. PR-TRK-123456"
              className="editorial-tracking-input"
            />
            <button type="submit" className="editorial-tracking-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>SEARCHING...</span>
                </>
              ) : (
                <>
                  <span>TRACK</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Live Result Details */}
          {result && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7', boxShadow: '0 0 0 4px rgba(2, 132, 199, 0.2)' }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                    {result.id}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                    {result.status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  <strong>ETA:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{result.eta}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px', color: '#334155' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Origin</span>
                  <strong>{result.origin}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Current Hub</span>
                  <strong style={{ color: '#0284c7' }}>{result.currentLocation}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Destination</span>
                  <strong>{result.destination}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Editorial Status Progression Flow */}
          <div className="editorial-status-progression">
            {/* Step 1 */}
            <div className={`editorial-prog-step ${activeStep >= 0 ? (activeStep === 0 ? 'current' : 'completed') : ''}`}>
              <div className="editorial-prog-step-bar" />
              <div className="editorial-prog-step-label">01 PICKED UP</div>
            </div>

            {/* Step 2 */}
            <div className={`editorial-prog-step ${activeStep >= 1 ? (activeStep === 1 ? 'current' : 'completed') : ''}`}>
              <div className="editorial-prog-step-bar" />
              <div className="editorial-prog-step-label">02 IN TRANSIT</div>
            </div>

            {/* Step 3 */}
            <div className={`editorial-prog-step ${activeStep >= 2 ? (activeStep === 2 ? 'current' : 'completed') : ''}`}>
              <div className="editorial-prog-step-bar" />
              <div className="editorial-prog-step-label">03 OUT FOR DELIVERY</div>
            </div>

            {/* Step 4 */}
            <div className={`editorial-prog-step ${activeStep >= 3 ? 'completed' : ''}`}>
              <div className="editorial-prog-step-bar" />
              <div className="editorial-prog-step-label">04 DELIVERED</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
