import React, { useState } from 'react';
import {
  Search, MapPin, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight,
  Package, Building2, ChevronRight
} from 'lucide-react';

const demoTrackingData: Record<string, {
  id: string;
  sender: string;
  receiver: string;
  origin: string;
  currentLoc: string;
  dest: string;
  status: string;
  eta: string;
  progressPercent: number;
  vehicle: string;
  driver: string;
  checkpoints: { time: string; location: string; note: string; done: boolean; current?: boolean }[];
}> = {
  'TRK-2026-00124': {
    id: 'TRK-2026-00124',
    sender: 'Acme Logistics Mumbai',
    receiver: 'TechWorld Systems Bangalore',
    origin: 'Mumbai Central Hub (MH)',
    currentLoc: 'Pune Distribution Center (MH)',
    dest: 'Bangalore Electronic City DC (KA)',
    status: 'IN TRANSIT',
    eta: '06 September 2026, 05:00 PM',
    progressPercent: 65,
    vehicle: 'MH-12-AB-4521 (24T Heavy Hauler)',
    driver: 'Rajesh Kumar (+91 98450 11234)',
    checkpoints: [
      { time: '05 Sep 2026, 08:30 AM', location: 'Mumbai Central Hub', note: 'Package scanned & freight manifest verified', done: true },
      { time: '05 Sep 2026, 11:15 AM', location: 'Navi Mumbai Tollway', note: 'In transit via Expressway NH48', done: true },
      { time: '05 Sep 2026, 02:45 PM', location: 'Pune Distribution Center', note: 'Hub arrival scan — Transshipment sorting', done: true, current: true },
      { time: '06 Sep 2026, 06:00 AM (Est.)', location: 'Belagavi Highway Hub', note: 'Scheduled transit relay waypoint', done: false },
      { time: '06 Sep 2026, 05:00 PM (Est.)', location: 'Bangalore Electronic City DC', note: 'Final last-mile doorstep delivery', done: false },
    ],
  },
  'TRK-2026-00125': {
    id: 'TRK-2026-00125',
    sender: 'Nova Commerce Delhi',
    receiver: 'Heritage Crafts Jaipur',
    origin: 'Delhi Northern Terminal (DL)',
    currentLoc: 'Jaipur Logistics Park (RJ)',
    dest: 'Jaipur Industrial Area (RJ)',
    status: 'OUT FOR DELIVERY',
    eta: 'Today, 02:15 PM',
    progressPercent: 90,
    vehicle: 'DL-01-CD-8832 (Light Commercial)',
    driver: 'Vikram Singh (+91 97001 66778)',
    checkpoints: [
      { time: '04 Sep 2026, 07:00 PM', location: 'Delhi Northern Terminal', note: 'Consignment departed origin terminal', done: true },
      { time: '05 Sep 2026, 03:30 AM', location: 'Gurugram Express Corridor', note: 'Highway checkpoint clearance', done: true },
      { time: '05 Sep 2026, 09:15 AM', location: 'Jaipur Logistics Park', note: 'Loaded into last-mile local delivery van', done: true },
      { time: '05 Sep 2026, 11:30 AM', location: 'Out for Delivery (Jaipur Area)', note: 'Driver on local route — ETA 45m', done: true, current: true },
    ],
  },
};

export default function TrackingPreview() {
  const [searchQuery, setSearchQuery] = useState('TRK-2026-00124');
  const [activeTrackId, setActiveTrackId] = useState('TRK-2026-00124');

  const currentTrack = demoTrackingData[activeTrackId] || demoTrackingData['TRK-2026-00124'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (demoTrackingData[query]) {
      setActiveTrackId(query);
    } else {
      setActiveTrackId('TRK-2026-00124');
    }
  };

  return (
    <section id="tracking" style={{ padding: '96px 0', backgroundColor: '#f8fafc' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 48px' }}>
          <div className="pr-section-tag">
            <MapPin size={14} />
            <span>Public Shipment Lookup</span>
          </div>
          <h2 className="pr-section-title">
            Know Where Every Shipment Is.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            Empower your customers and operations teams with instant live route checkpoints, telematics data, and predictive ETAs.
          </p>
        </div>

        {/* Live Search Bar */}
        <div style={{ maxWidth: '640px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <Search size={18} color="#64748b" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Tracking ID (e.g. TRK-2026-00124)..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  width: '100%',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              />
            </div>
            <button type="submit" className="pr-btn-primary" style={{ padding: '10px 24px' }}>
              Track
            </button>
          </form>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Try Demo IDs:</span>
            <button
              onClick={() => { setSearchQuery('TRK-2026-00124'); setActiveTrackId('TRK-2026-00124'); }}
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: activeTrackId === 'TRK-2026-00124' ? '#eff6ff' : '#ffffff',
                border: activeTrackId === 'TRK-2026-00124' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                color: activeTrackId === 'TRK-2026-00124' ? '#2563eb' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              TRK-2026-00124 (In Transit)
            </button>
            <button
              onClick={() => { setSearchQuery('TRK-2026-00125'); setActiveTrackId('TRK-2026-00125'); }}
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: activeTrackId === 'TRK-2026-00125' ? '#eff6ff' : '#ffffff',
                border: activeTrackId === 'TRK-2026-00125' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                color: activeTrackId === 'TRK-2026-00125' ? '#2563eb' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              TRK-2026-00125 (Out for Delivery)
            </button>
          </div>
        </div>

        {/* Tracking Result Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Top Banner */}
          <div
            style={{
              padding: '24px 32px',
              background: '#0b1220',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                  {currentTrack.id}
                </span>
                <span
                  style={{
                    background: currentTrack.status === 'IN TRANSIT' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: currentTrack.status === 'IN TRANSIT' ? '#93c5fd' : '#fde68a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  ● {currentTrack.status}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                Origin: <span style={{ color: '#ffffff' }}>{currentTrack.origin}</span> → Destination: <span style={{ color: '#ffffff' }}>{currentTrack.dest}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Expected Delivery Date</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                {currentTrack.eta}
              </div>
            </div>
          </div>

          {/* Map-style Visual Route Graphic */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              padding: '32px',
              borderBottom: '1px solid #e2e8f0',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid dot pattern background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
              }}
            ></div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                  CORRIDOR TELEMETRICS VISUALIZER
                </span>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  Current Location: <strong style={{ color: '#ffffff' }}>{currentTrack.currentLoc}</strong>
                </span>
              </div>

              {/* Progress Bar & Key Nodes */}
              <div style={{ position: 'relative', margin: '40px 0 20px' }}>
                {/* Background line */}
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', width: '100%' }}></div>
                {/* Active filled line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                    borderRadius: '4px',
                    width: `${currentTrack.progressPercent}%`,
                    boxShadow: '0 0 12px #3b82f6',
                  }}
                ></div>

                {/* Nodes on the line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', top: '-18px' }}>
                  {/* Origin */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #0f172a' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Mumbai</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Departed</div>
                  </div>

                  {/* Midpoint / Current */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', border: '3px solid #ffffff', boxShadow: '0 0 15px #3b82f6' }}>
                      <Truck size={17} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa' }}>Pune DC</div>
                    <div style={{ fontSize: '10.5px', color: '#93c5fd' }}>● Live Now</div>
                  </div>

                  {/* Destination */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1e293b', border: '2px dashed #64748b', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Building2 size={15} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Bangalore</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>Final Hub</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Details: Checkpoint Timeline + Vehicle Info */}
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
            {/* Checkpoint Timeline */}
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
                Milestone Activity Log
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentTrack.checkpoints.map((cp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: cp.current ? '#2563eb' : cp.done ? '#10b981' : '#e2e8f0',
                          border: cp.current ? '3px solid #bfdbfe' : 'none',
                        }}
                      ></div>
                      {idx < currentTrack.checkpoints.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: '#f1f5f9', margin: '4px 0' }}></div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: cp.current ? '#2563eb' : '#0f172a' }}>
                        {cp.location}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        {cp.note}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {cp.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrier & Transport Meta */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                Transport Telematics
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Assigned Hauler Vehicle</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {currentTrack.vehicle}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Primary Driver Contact</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {currentTrack.driver}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Service Tier</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                  PrimeRoute Express Priority
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>ePOD & Cargo Insured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
