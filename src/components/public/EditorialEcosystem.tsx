import React, { useState } from 'react';
import { ArrowRight, User, Warehouse, Truck, Shield, Radio, Activity, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const PORTAL_NODES = [
  {
    id: 'customer',
    name: 'CUSTOMER',
    icon: User,
    desc: 'Instant booking, multi-address management, real-time tracking & automated GST invoices.',
    link: '/signin/customer',
    btnText: 'CUSTOMER PORTAL',
    roleTag: 'SELF-SERVICE COMMERCE',
    color: '#38bdf8',
  },
  {
    id: 'warehouse',
    name: 'WAREHOUSE',
    icon: Warehouse,
    desc: 'Multi-hub inventory, bin slotting, manifest verification, and linehaul dispatch bays.',
    link: '/signin/warehouse',
    btnText: 'WAREHOUSE PORTAL',
    roleTag: 'HUB FULFILLMENT',
    color: '#10b981',
  },
  {
    id: 'driver',
    name: 'DRIVER',
    icon: Truck,
    desc: 'Turn-by-turn corridor telemetry, digital bill of lading, and verified ePOD signatures.',
    link: '/signin/driver',
    btnText: 'DRIVER PORTAL',
    roleTag: 'LINEHAUL TELEMETRY',
    color: '#f59e0b',
  },
  {
    id: 'admin',
    name: 'ADMIN',
    icon: Shield,
    desc: 'Control tower supervision, carrier assignment, revenue analytics & system oversight.',
    link: '/signin/admin',
    btnText: 'CONTROL TOWER',
    roleTag: 'CENTRAL COMMAND',
    color: '#8b5cf6',
  },
];

export default function EditorialEcosystem() {
  const [activeHoverNode, setActiveHoverNode] = useState<string | null>(null);

  return (
    <section className="editorial-ecosystem-section" id="connected-ecosystem">
      <div className="editorial-container">
        <div style={{ textAlign: 'center' }}>
          <div className="editorial-section-tag" style={{ color: '#38bdf8', margin: '0 auto 12px' }}>
            <Cpu size={13} />
            <span>UNIFIED SYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="editorial-ecosystem-heading">
            ONE PLATFORM.<br />EVERY MOVEMENT.
          </h2>
          <p className="editorial-ecosystem-sub">
            A single connected operational spine synchronizing consignors, dock managers, commercial drivers, and executive dispatchers.
          </p>
        </div>

        {/* Central Hub Visualization */}
        <div style={{ position: 'relative', margin: '40px auto', maxWidth: '300px', display: 'flex', justifyContent: 'center' }}>
          <div className="editorial-hub-center">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <Radio size={22} color="#ffffff" className="animate-pulse" />
            </div>
            <span style={{ fontFamily: 'var(--pr-font-display)', fontSize: '20px', color: '#ffffff', letterSpacing: '0.08em' }}>
              PRIMEROUTE
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.2em' }}>
              CORE ENGINE
            </span>
          </div>
        </div>

        {/* 4 Connected Nodes */}
        <div className="editorial-nodes-grid">
          {PORTAL_NODES.map((node) => {
            const Icon = node.icon;
            const isHovered = activeHoverNode === node.id;

            return (
              <div
                key={node.id}
                className="editorial-node-card"
                onMouseEnter={() => setActiveHoverNode(node.id)}
                onMouseLeave={() => setActiveHoverNode(null)}
                style={{
                  borderColor: isHovered ? node.color : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  className="editorial-node-icon-box"
                  style={{
                    color: node.color,
                    background: `rgba(255, 255, 255, 0.05)`,
                  }}
                >
                  <Icon size={22} />
                </div>

                <div style={{ fontSize: '9.5px', fontWeight: 800, color: node.color, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {node.roleTag}
                </div>

                <h3 className="editorial-node-name">{node.name}</h3>

                <p className="editorial-node-desc">{node.desc}</p>

                <Link
                  to={node.link}
                  className="editorial-node-btn"
                  style={{ color: isHovered ? '#ffffff' : node.color }}
                >
                  <span>{node.btnText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
