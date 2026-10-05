import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Menu, X, ArrowRight, Loader2, User, ChevronDown, Check } from 'lucide-react';
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

  // Initial load and live event synchronization
  useEffect(() => {
    fetchContact();

    const handleSync = () => {
      fetchContact();
    };

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

  // Dynamic portal redirect for authenticated sessions
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
      {/* ── 1. TOP INFORMATION BAR (Dark Navy Thin Bar) ── */}
      <div className="pr-top-bar" style={{ background: '#0B1736', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="pr-container">
          <div className="pr-top-bar-inner">
            {/* Left side: Phone, Email, 24/7 Status */}
            <div className="pr-top-bar-left">
              {loadingContact ? (
                <span className="pr-top-bar-item" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={12} className="animate-spin" color="#60a5fa" />
                  <span>Syncing operations hotline...</span>
                </span>
              ) : (
                <>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    onClick={handlePhoneClick}
                    className="pr-top-bar-item"
                    title="Click for Hotline Details & Direct Dial"
                  >
                    <Phone size={13} color="#60a5fa" />
                    <span>{phone}</span>
                  </a>
                  <a
                    href={`mailto:${email}`}
                    onClick={handleEmailClick}
                    className="pr-top-bar-item"
                    title="Click to Email Support / Open Webmail"
                  >
                    <Mail size={13} color="#60a5fa" />
                    <span>{email}</span>
                  </a>
                  <span className="pr-top-bar-item pr-top-bar-status" style={{ color: '#cbd5e1' }}>
                    <span className="pr-top-bar-pulse-dot"></span>
                    <span>{availability}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN NAVIGATION (Crisp White Navigation Bar) ── */}
      <header className={`pr-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="pr-container">
          <div className="pr-header-inner">
            {/* Left: PrimeRoute Brand Logo */}
            <Link to="/" className="pr-brand" onClick={closeMobile}>
              <div className="pr-logo-mark">
                <span>PR</span>
              </div>
              <div className="pr-brand-text">
                <span className="pr-brand-name">PrimeRoute</span>
                <span className="pr-brand-tagline">LOGISTICS</span>
              </div>
            </Link>

            {/* Center: Main Navigation Links */}
            <nav className="pr-desktop-nav-links">
              <NavLink
                to="/solutions"
                className={({ isActive }) => `pr-nav-link ${isActive ? 'active' : ''}`}
              >
                Solutions
              </NavLink>

              {/* Services with Dropdown Indicator */}
              <div
                className="pr-nav-item-dropdown"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <NavLink
                  to="/services"
                  className={({ isActive }) => `pr-nav-link ${isActive ? 'active' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Services</span>
                  <ChevronDown size={14} className={`pr-dropdown-chevron ${servicesDropdownOpen ? 'rotate' : ''}`} />
                </NavLink>

                {servicesDropdownOpen && (
                  <div className="pr-dropdown-panel">
                    <Link to="/services#road-freight" className="pr-dropdown-panel-item" onClick={() => setServicesDropdownOpen(false)}>
                      <div className="pr-dropdown-item-title">Road Freight & Linehaul</div>
                      <div className="pr-dropdown-item-sub">Full truckload (FTL) and less-than-truckload (LTL) corridor transit</div>
                    </Link>
                    <Link to="/services#warehouse" className="pr-dropdown-panel-item" onClick={() => setServicesDropdownOpen(false)}>
                      <div className="pr-dropdown-item-title">Warehouse Operations</div>
                      <div className="pr-dropdown-item-sub">Multi-hub inventory tracking, staging bays & safety thresholds</div>
                    </Link>
                    <Link to="/services#telematics" className="pr-dropdown-panel-item" onClick={() => setServicesDropdownOpen(false)}>
                      <div className="pr-dropdown-item-title">Fleet & Driver Telematics</div>
                      <div className="pr-dropdown-item-sub">Live corridor tracking, HOS compliance & maintenance schedules</div>
                    </Link>
                    <Link to="/services#last-mile" className="pr-dropdown-panel-item" onClick={() => setServicesDropdownOpen(false)}>
                      <div className="pr-dropdown-item-title">Last-Mile Distribution</div>
                      <div className="pr-dropdown-item-sub">Direct delivery, electronic ePOD proof & instant GST invoices</div>
                    </Link>
                  </div>
                )}
              </div>

              <NavLink
                to="/platform"
                className={({ isActive }) => `pr-nav-link ${isActive ? 'active' : ''}`}
              >
                Technology
              </NavLink>

              <NavLink
                to="/tracking"
                className={({ isActive }) => `pr-nav-link ${isActive ? 'active' : ''}`}
              >
                Tracking
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) => `pr-nav-link ${isActive ? 'active' : ''}`}
              >
                About Us
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) => `pr-nav-link ${isActive ? 'active' : ''}`}
              >
                Contact
              </NavLink>
            </nav>

            {/* Right: Sign In + Get Started Button */}
            <div className="pr-nav-actions">
              {/* Sign In Button */}
              {isAuthenticated ? (
                <Link
                  to={portalPath}
                  className="pr-btn-signin"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <User size={14} />
                  <span>{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                </Link>
              ) : (
                <Link to="/signin" className="pr-btn-signin">
                  Sign In
                </Link>
              )}

              {/* Get Started Button */}
              {isAuthenticated ? (
                <Link to={portalPath} className="pr-btn-getstarted">
                  <span>Dashboard</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link to="/register" className="pr-btn-getstarted">
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                className="pr-mobile-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div className="pr-mobile-drawer">
            <div className="pr-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <NavLink
                to="/solutions"
                onClick={closeMobile}
                className={({ isActive }) => `pr-mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Solutions
              </NavLink>
              <NavLink
                to="/services"
                onClick={closeMobile}
                className={({ isActive }) => `pr-mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Services
              </NavLink>
              <NavLink
                to="/platform"
                onClick={closeMobile}
                className={({ isActive }) => `pr-mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Technology
              </NavLink>
              <NavLink
                to="/tracking"
                onClick={closeMobile}
                className={({ isActive }) => `pr-mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Tracking
              </NavLink>
              <NavLink
                to="/about"
                onClick={closeMobile}
                className={({ isActive }) => `pr-mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                onClick={closeMobile}
                className={({ isActive }) => `pr-mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Contact
              </NavLink>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', gap: '10px' }}>
                {isAuthenticated ? (
                  <Link
                    to={portalPath}
                    onClick={closeMobile}
                    className="pr-btn-getstarted"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={closeMobile}
                      className="pr-btn-signin"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobile}
                      className="pr-btn-getstarted"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <span>Get Started</span>
                      <ArrowRight size={15} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Support & Contact Dialog ── */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        contact={contact}
      />
    </>
  );
}
