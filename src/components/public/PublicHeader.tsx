import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, Mail, Menu, X, ArrowRight, Loader2, User, ChevronDown } from 'lucide-react';
import publicService from '../../services/publicService';
import type { PublicContactInfo } from '../../services/publicService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import SupportModal from './SupportModal';

export default function PublicHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [contact, setContact] = useState<PublicContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const fetchContact = useCallback(async () => {
    try {
      const data = await publicService.getPublicContactInfo();
      setContact(data);
    } catch (err) {
      console.error('Error fetching public contact info:', err);
    } finally {
      setLoadingContact(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchContact();
    const handleSync = () => fetchContact();
    window.addEventListener('focus', handleSync);
    window.addEventListener('contact:updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('contact:updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchContact]);

  const closeMobile = () => setMobileMenuOpen(false);

  const phone = contact?.supportPhone || '+91 80 4567 8900';
  const email = contact?.supportEmail || 'support@primeroute.com';
  const availability = contact?.availability || '24/7 Dedicated Logistics Assistance';

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    showToast('success', 'Email Copied to Clipboard', email);
    setSupportModalOpen(true);
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone).catch(() => {});
    }
    showToast('info', 'Hotline Copied to Clipboard', phone);
    setSupportModalOpen(true);
  };

  const portalPath =
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'WAREHOUSE_MANAGER'
      ? '/warehouse/dashboard'
      : role === 'DRIVER'
      ? '/driver/dashboard'
      : '/customer/dashboard';

  return (
    <>
      {/* ── 1. EDITORIAL TOP INFORMATION BAR ── */}
      <div className="editorial-top-bar">
        <div className="editorial-container">
          <div className="editorial-top-bar-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {loadingContact ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={12} className="animate-spin" color="#38bdf8" />
                  <span>Connecting telematics gateway...</span>
                </span>
              ) : (
                <>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    onClick={handlePhoneClick}
                    className="editorial-top-link"
                    title="Click for Hotline Details"
                  >
                    <Phone size={12} color="#38bdf8" />
                    <span>{phone}</span>
                  </a>
                  <a
                    href={`mailto:${email}`}
                    onClick={handleEmailClick}
                    className="editorial-top-link"
                    title="Click to Email Support"
                  >
                    <Mail size={12} color="#38bdf8" />
                    <span>{email}</span>
                  </a>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ color: '#cbd5e1' }}>{availability}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. EDITORIAL MAIN NAVIGATION ── */}
      <header className={`editorial-nav-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="editorial-nav-container">
          {/* Brand */}
          <Link to="/" className="editorial-brand" onClick={closeMobile}>
            <div className="editorial-brand-logo">PR</div>
            <div>
              <div className="editorial-brand-title">PRIMEROUTE</div>
              <div className="editorial-brand-sub">LOGISTICS</div>
            </div>
          </Link>

          {/* Center Links (Letter-spaced editorial navigation) */}
          <nav className="editorial-nav-links">
            <NavLink
              to="/solutions"
              className={({ isActive }) => `editorial-nav-item ${isActive ? 'active' : ''}`}
            >
              SOLUTIONS
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) => `editorial-nav-item ${isActive ? 'active' : ''}`}
            >
              SERVICES
            </NavLink>

            <NavLink
              to="/platform"
              className={({ isActive }) => `editorial-nav-item ${isActive ? 'active' : ''}`}
            >
              TECHNOLOGY
            </NavLink>

            <NavLink
              to="/tracking"
              className={({ isActive }) => `editorial-nav-item ${isActive ? 'active' : ''}`}
            >
              TRACKING
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `editorial-nav-item ${isActive ? 'active' : ''}`}
            >
              ABOUT US
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) => `editorial-nav-item ${isActive ? 'active' : ''}`}
            >
              CONTACT
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="editorial-nav-actions">
            {isAuthenticated ? (
              <Link
                to={portalPath}
                className="editorial-btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={14} />
                <span>{user?.name ? user.name.split(' ')[0] : 'PORTAL'}</span>
              </Link>
            ) : (
              <Link to="/signin" className="editorial-btn-ghost">
                SIGN IN
              </Link>
            )}

            <Link
              to={isAuthenticated ? portalPath : '/register'}
              className="editorial-btn-primary"
            >
              <span>{isAuthenticated ? 'LAUNCH APP' : 'GET STARTED'}</span>
              <ArrowRight size={14} className="btn-arrow" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#070b14',
              }}
              className="editorial-mobile-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slideout Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <NavLink to="/solutions" className="editorial-nav-item" onClick={closeMobile}>
              SOLUTIONS
            </NavLink>
            <NavLink to="/services" className="editorial-nav-item" onClick={closeMobile}>
              SERVICES
            </NavLink>
            <NavLink to="/platform" className="editorial-nav-item" onClick={closeMobile}>
              TECHNOLOGY
            </NavLink>
            <NavLink to="/tracking" className="editorial-nav-item" onClick={closeMobile}>
              TRACKING
            </NavLink>
            <NavLink to="/about" className="editorial-nav-item" onClick={closeMobile}>
              ABOUT US
            </NavLink>
            <NavLink to="/contact" className="editorial-nav-item" onClick={closeMobile}>
              CONTACT
            </NavLink>
            <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/signin" className="editorial-btn-ghost" onClick={closeMobile} style={{ textAlign: 'center' }}>
                SIGN IN
              </Link>
              <Link to="/register" className="editorial-btn-primary" onClick={closeMobile} style={{ justifyContent: 'center' }}>
                <span>GET STARTED</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {supportModalOpen && (
        <SupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          contact={contact}
        />
      )}
    </>
  );
}
