import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'What is PrimeRoute Logistics?',
    a: 'PrimeRoute Logistics is an enterprise-grade Logistics & Transportation Management System (LTMS) designed to orchestrate end-to-end freight operations—from order placement, warehouse staging, vehicle/driver telematics, and highway linehaul, to last-mile delivery and digital invoicing.',
  },
  {
    q: 'Who can use PrimeRoute?',
    a: 'PrimeRoute supports dual operational roles: Logistics operations managers/dispatchers utilize the comprehensive Admin Command Center to manage fleets, warehouses, and orders, while corporate clients, suppliers, and recipients use the Customer Portal for order booking and real-time shipment visibility.',
  },
  {
    q: 'Can customers track shipments?',
    a: 'Yes. Customers can track shipments in real-time through the dedicated Customer Portal or using the public Tracking Lookup by entering their tracking identifier (e.g., TRK-2026-00124) to view live corridor progress, checkpoint timestamps, and estimated arrival windows.',
  },
  {
    q: 'Can administrators manage drivers and vehicles?',
    a: 'Yes. The platform provides comprehensive fleet and driver rosters. Operations teams can track vehicle maintenance odometers, fuel metrics, assign drivers based on license categories, and monitor active transit assignments.',
  },
  {
    q: 'Can PrimeRoute manage warehouses?',
    a: 'Yes. PrimeRoute includes multi-hub warehouse management capabilities, allowing logistics operators to monitor real-time SKU inventory levels, available versus reserved capacity, low-stock threshold triggers, and outbound dock staging bays.',
  },
  {
    q: 'Does PrimeRoute support invoicing?',
    a: 'Yes. PrimeRoute automatically computes freight charges based on distance, chargeable weight tiers, and priority surcharges, generating GST-compliant tax invoices with payment status tracking and downloadable statements.',
  },
  {
    q: 'Can customers access their own portal?',
    a: 'Yes. Shippers and business clients receive access to a streamlined Customer Portal where they can create new bookings, manage saved pickup/delivery addresses, view their active shipments, download invoices, and submit support tickets.',
  },
  {
    q: 'How does shipment tracking work?',
    a: 'When an order is dispatched, a unique tracking number is generated. As the consignment passes through origin terminals, intermediate highway waypoints, and destination hubs, checkpoint scans and GPS telematics automatically update milestone records with zero manual lag.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" style={{ padding: '96px 0', backgroundColor: '#f8fafc' }}>
      <div className="pr-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px' }}>
          <div className="pr-section-tag">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 className="pr-section-title">
            Frequently Asked Questions.
          </h2>
          <p className="pr-section-subtitle" style={{ margin: '0 auto' }}>
            Everything you need to know about the PrimeRoute Logistics platform, architecture, and portal capabilities.
          </p>
        </div>

        {/* Accordion Container */}
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`pr-faq-item ${isOpen ? 'active' : ''}`}>
                <div className="pr-faq-header" onClick={() => toggle(idx)}>
                  <span className="pr-faq-question">{faq.q}</span>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isOpen ? '#eff6ff' : '#f1f5f9',
                      color: isOpen ? '#2563eb' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={16} />
                  </div>
                </div>
                {isOpen && (
                  <div className="pr-faq-body">
                    <p style={{ margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
