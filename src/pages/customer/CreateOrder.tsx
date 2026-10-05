import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, MapPin, Truck, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, RefreshCw, Plus, Minus, Trash2, ShieldCheck,
  CreditCard, Search, ShoppingCart, Box,
  QrCode, Building2, Landmark, Banknote, FileSpreadsheet, Check, Edit2
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { addressService, type Address } from '../../services/addressService';
import { createOrder, getQuote, type QuoteResponse, type OrderRequest } from '../../services/orderService';
import { productService, type Product } from '../../services/productService';
import type { DeliveryType, PaymentMethod } from '../../types/order';
import { AVAILABLE_PAYMENT_METHODS } from '../../utils/paymentUtils';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CheckoutStep = 'FORM' | 'REVIEW' | 'PAYMENT';

export default function CreateOrder() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Checkout flow step state
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('FORM');

  // Product Catalog
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Multi-item Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQuantityInput, setItemQuantityInput] = useState<string>('1');
  const [productSearch, setProductSearch] = useState<string>('');

  // Address & Consignment State
  const [pickupAddressId, setPickupAddressId] = useState<string>('');
  const [deliveryAddressId, setDeliveryAddressId] = useState<string>('');
  const [addressPickerTarget, setAddressPickerTarget] = useState<'pickup' | 'delivery' | null>(null);
  const [packageDescription, setPackageDescription] = useState('');
  const [isDescManuallyEdited, setIsDescManuallyEdited] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('STANDARD');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('UPI');

  // Live Backend Quote
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Form Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAddresses();
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoadingCatalog(true);
      setCatalogError(null);
      const data = await productService.getActiveCatalog();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products catalog:', err);
      setCatalogError('Unable to load products. Please try again.');
      showToast('error', 'Catalog Error', 'Unable to load products from product catalog.');
    } finally {
      setLoadingCatalog(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await addressService.getAll();
      setAddresses(data);

      if (data.length > 0) {
        const defaultAddr = data.find((a) => a.defaultAddress) || data[0];
        setPickupAddressId(String(defaultAddr.id));
        
        // Pick a secondary address if available
        const otherAddr = data.find((a) => a.id !== defaultAddr.id);
        if (otherAddr) {
          setDeliveryAddressId(String(otherAddr.id));
        } else {
          setDeliveryAddressId('');
        }
      }
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
      showToast('error', 'Address Error', 'Failed to load saved addresses.');
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Filtered Catalog by search query
  const filteredCatalog = useMemo(() => {
    if (!productSearch.trim()) return products;
    const term = productSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
    );
  }, [products, productSearch]);

  // Highlighted product in the selector
  const candidateProduct = useMemo(() => {
    return products.find((p) => String(p.id) === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Aggregate Computations from Cart Items
  const totalItems = cartItems.length;

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalWeight = useMemo(() => {
    const sum = cartItems.reduce(
      (acc, item) => acc + (item.product.unitWeight || 0) * item.quantity,
      0
    );
    return parseFloat(sum.toFixed(2));
  }, [cartItems]);

  const totalCommercialValue = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.product.unitPrice || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  // Auto-generate sensible package description from items
  const autoGeneratedDescription = useMemo(() => {
    if (cartItems.length === 0) return '';
    return cartItems.map((item) => `${item.quantity}x ${item.product.name}`).join(', ');
  }, [cartItems]);

  // Keep package description synchronized if user hasn't explicitly customized it
  useEffect(() => {
    if (!isDescManuallyEdited) {
      setPackageDescription(autoGeneratedDescription);
    }
  }, [autoGeneratedDescription, isDescManuallyEdited]);

  // Selected address objects for rich preview cards
  const selectedPickupAddress = useMemo(() => {
    return addresses.find((a) => String(a.id) === pickupAddressId) || null;
  }, [addresses, pickupAddressId]);

  const selectedDeliveryAddress = useMemo(() => {
    return addresses.find((a) => String(a.id) === deliveryAddressId) || null;
  }, [addresses, deliveryAddressId]);

  // Add Item to Consignment (Cart)
  const handleAddItem = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Resolve product candidate
    const prod = candidateProduct || products.find((p) => String(p.id) === String(selectedProductId));

    if (!prod) {
      setErrors((prev) => ({ ...prev, product: 'Please select a product from the catalog before clicking Add Item.' }));
      const selectEl = document.getElementById('catalog-product-select');
      if (selectEl) {
        selectEl.focus();
        selectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('error', 'Select Product', 'Please choose a product from the catalog dropdown before adding.');
      return;
    }

    const qty = parseInt(String(itemQuantityInput), 10);
    if (isNaN(qty) || qty <= 0) {
      showToast('error', 'Invalid Quantity', 'Quantity must be a positive integer greater than 0.');
      return;
    }

    const existingItem = cartItems.find((item) => item.product.id === prod.id);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === prod.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty,
        };
        return updated;
      } else {
        return [...prev, { product: prod, quantity: qty }];
      }
    });

    if (existingItem) {
      const mergedQty = existingItem.quantity + qty;
      showToast(
        'info',
        'Quantity Updated',
        `Merged quantity for ${prod.name}: now ${mergedQty} units.`
      );
    } else {
      showToast(
        'success',
        'Item Added',
        `Added ${qty}x ${prod.name} to consignment.`
      );
    }

    // Reset item selector
    setSelectedProductId('');
    setItemQuantityInput('1');
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.items;
      delete copy.product;
      return copy;
    });
  };

  // Update item quantity directly or via steppers
  const handleUpdateItemQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.floor(newQty) } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItem = (productId: number) => {
    const target = cartItems.find((item) => item.product.id === productId);
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    if (target) {
      showToast('info', 'Item Removed', `Removed ${target.product.name} from consignment.`);
    }
  };

  // Request pricing quote from Spring Boot backend dynamically
  const fetchBackendQuote = useCallback(async () => {
    const pId = Number(pickupAddressId);
    const dId = Number(deliveryAddressId);
    const w = totalWeight;
    const q = totalQuantity;

    if (!pId || !dId || pId === dId || isNaN(w) || w <= 0 || isNaN(q) || q <= 0) {
      setQuote(null);
      return;
    }

    try {
      setLoadingQuote(true);
      const data = await getQuote({
        pickupAddressId: pId,
        deliveryAddressId: dId,
        packageWeight: w,
        packageQuantity: q,
        deliveryType,
      });
      setQuote(data);
    } catch (err) {
      console.error('Quote calculation error:', err);
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  }, [pickupAddressId, deliveryAddressId, totalWeight, totalQuantity, deliveryType]);

  useEffect(() => {
    fetchBackendQuote();
  }, [fetchBackendQuote]);

  // Form Validation
  const validateFormStep = () => {
    const newErrors: Record<string, string> = {};

    if (!pickupAddressId) {
      newErrors.pickupAddressId = 'Please select a pickup address.';
    }

    if (!deliveryAddressId) {
      newErrors.deliveryAddressId = 'Please select a delivery address.';
    } else if (pickupAddressId && deliveryAddressId && pickupAddressId === deliveryAddressId) {
      newErrors.deliveryAddressId = 'Pickup and delivery addresses cannot be the same location.';
    }

    if (cartItems.length === 0) {
      newErrors.items = 'Please add at least one product item to your consignment.';
    }

    const desc = packageDescription.trim() || autoGeneratedDescription;
    if (!desc) {
      newErrors.packageDescription = 'Package description is required.';
    } else if (desc.length < 3) {
      newErrors.packageDescription = 'Package description must be at least 3 characters.';
    }

    if (totalWeight <= 0) {
      newErrors.weight = 'Consignment total weight must be greater than 0 kg.';
    }

    if (totalQuantity <= 0) {
      newErrors.quantity = 'Total quantity must be at least 1 unit.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToReview = () => {
    if (!validateFormStep()) {
      if (cartItems.length === 0) {
        showToast('error', 'Empty Consignment', 'Please add at least one product to your order before reviewing.');
        const selectEl = document.getElementById('catalog-product-select');
        if (selectEl) {
          selectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          selectEl.focus();
        }
      } else {
        showToast('error', 'Validation Error', 'Please complete all required address and order fields properly.');
      }
      return;
    }
    setCheckoutStep('REVIEW');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToPayment = () => {
    if (!validateFormStep()) {
      setCheckoutStep('FORM');
      showToast('error', 'Incomplete Order', 'Please complete all required order details first.');
      return;
    }
    setCheckoutStep('PAYMENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Order to Spring Boot Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormStep()) {
      setCheckoutStep('FORM');
      showToast('error', 'Validation Error', 'Please complete all required fields properly.');
      return;
    }

    if (!paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: 'Please select a payment method to continue.' }));
      showToast('error', 'Payment Method Required', 'Please select a payment method to continue.');
      return;
    }

    try {
      setIsSubmitting(true);

      const desc = packageDescription.trim() || autoGeneratedDescription;

      const orderPayload: OrderRequest = {
        pickupAddressId: Number(pickupAddressId),
        deliveryAddressId: Number(deliveryAddressId),
        productId: cartItems.length === 1 ? cartItems[0].product.id : undefined,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        packageDescription: desc,
        packageWeight: totalWeight,
        packageQuantity: totalQuantity,
        deliveryType,
        paymentMethod: paymentMethod as PaymentMethod,
      };

      const createdOrder = await createOrder(orderPayload);

      setCreatedOrderNumber(createdOrder.orderNumber || String(createdOrder.id));
      setIsSubmitted(true);
      showToast(
        'success',
        'Order Confirmed',
        `Order ${createdOrder.orderNumber || createdOrder.id} confirmed with ${cartItems.length} products (${totalQuantity} units)!`
      );
    } catch (error: any) {
      console.error('Failed to create order:', error);
      const serverMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to place multi-product order. Please check inventory stock availability.';
      showToast('error', 'Order Placement Failed', serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAddresses) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>
          Loading saved addresses...
        </p>
      </div>
    );
  }

  // Empty Address State
  if (addresses.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--warning-light)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            No Saved Addresses Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 24, lineHeight: 1.5 }}>
            Before creating an order, you must add at least one pickup or delivery address to your address book.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/customer/addresses')}>
            <Plus size={16} /> Go to Addresses & Add Address
          </button>
        </div>
      </div>
    );
  }

  // Success Confirmation State
  if (isSubmitted) {
    return (
      <div style={{ maxWidth: 720, margin: '30px auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Order Created Successfully
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Consignment booking registered for {cartItems.length} products ({totalQuantity} units).
          </p>

          <div
            style={{
              background: 'var(--page-bg)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 20,
              margin: '24px 0',
              textAlign: 'left',
            }}
          >
            <div className="info-grid" style={{ marginBottom: 16 }}>
              <div className="info-item">
                <p className="info-item-label">Order Number</p>
                <p className="info-item-value font-mono" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
                  {createdOrderNumber}
                </p>
              </div>
              <div className="info-item">
                <p className="info-item-label">Delivery Tier</p>
                <p className="info-item-value" style={{ fontWeight: 600 }}>
                  {deliveryType === 'SAME_DAY' ? 'Same Day (Within 24h)' : deliveryType === 'EXPRESS' ? 'Express (1-2 days)' : 'Standard (3-5 days)'}
                </p>
              </div>
              <div className="info-item">
                <p className="info-item-label">Units & Weight</p>
                <p className="info-item-value" style={{ fontWeight: 600 }}>
                  {totalQuantity} units · {totalWeight} kg
                </p>
              </div>
              <div className="info-item">
                <p className="info-item-label">Shipping Total</p>
                <p className="info-item-value" style={{ fontWeight: 700, color: 'var(--success)' }}>
                  ₹{quote?.totalAmount ? quote.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                </p>
              </div>
              <div className="info-item">
                <p className="info-item-label">Payment Method</p>
                <p className="info-item-value" style={{ fontWeight: 600 }}>
                  {AVAILABLE_PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod || '—'}
                </p>
              </div>
              <div className="info-item">
                <p className="info-item-label">Payment Status</p>
                <p className="info-item-value">
                  <span
                    className={`badge ${paymentMethod === 'COD' ? 'badge-warning' : 'badge-success'}`}
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {paymentMethod === 'COD' ? 'PENDING (COD)' : 'PAID'}
                  </span>
                </p>
              </div>
            </div>

            {/* Itemized Manifest in Success Screen */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em' }}>
                Itemized Consignment Manifest:
              </p>
              <div style={{ background: '#ffffff', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '6px 10px' }}>Product</th>
                      <th style={{ textAlign: 'center', padding: '6px 10px' }}>SKU</th>
                      <th style={{ textAlign: 'center', padding: '6px 10px' }}>Quantity</th>
                      <th style={{ textAlign: 'right', padding: '6px 10px' }}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.product.name}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {item.product.sku}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                          {((item.product.unitWeight || 0) * item.quantity).toFixed(2)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/customer/orders')}
            >
              <Package size={15} /> My Orders
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/customer/track?id=${encodeURIComponent(createdOrderNumber)}`)}
            >
              <Truck size={15} /> Track Shipment <ArrowRight size={15} />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsSubmitted(false);
                setCartItems([]);
                setPackageDescription('');
                setIsDescManuallyEdited(false);
                setQuote(null);
                setCheckoutStep('FORM');
              }}
            >
              <Plus size={14} /> Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getMethodIcon = (id: string, isSelected: boolean) => {
    const col = isSelected ? 'var(--primary)' : '#64748b';
    switch (id) {
      case 'UPI': return <QrCode size={18} color={col} />;
      case 'CARD': return <CreditCard size={18} color={col} />;
      case 'NET_BANKING': return <Building2 size={18} color={col} />;
      case 'BANK_TRANSFER': return <Landmark size={18} color={col} />;
      case 'COD': return <Banknote size={18} color={col} />;
      case 'CREDIT': return <FileSpreadsheet size={18} color={col} />;
      default: return <CreditCard size={18} color={col} />;
    }
  };

  const getDeliveryTierLabel = (type: DeliveryType) => {
    switch (type) {
      case 'SAME_DAY': return { name: 'Same Day', time: 'Within 24 hours (Urgent SLA)' };
      case 'EXPRESS': return { name: 'Express Delivery', time: '1–2 business days' };
      default: return { name: 'Standard Delivery', time: '3–5 business days' };
    }
  };

  return (
    <div className="create-order-page-container">
      {/* Modern Checkout Step Progress Bar */}
      <div className="checkout-stepper-bar">
        <div
          className={`stepper-step ${checkoutStep === 'FORM' ? 'active' : 'completed'}`}
          onClick={() => setCheckoutStep('FORM')}
        >
          <div className="step-circle">{checkoutStep !== 'FORM' ? '✓' : '1'}</div>
          <div className="step-label">
            <strong>Order Details</strong>
            <span>Route & Consignment</span>
          </div>
        </div>

        <div className={`stepper-line ${checkoutStep !== 'FORM' ? 'filled' : ''}`} />

        <div
          className={`stepper-step ${checkoutStep === 'REVIEW' ? 'active' : checkoutStep === 'PAYMENT' ? 'completed' : 'pending'}`}
          onClick={() => {
            if (validateFormStep()) setCheckoutStep('REVIEW');
          }}
        >
          <div className="step-circle">{checkoutStep === 'PAYMENT' ? '✓' : '2'}</div>
          <div className="step-label">
            <strong>Order Review</strong>
            <span>Summary & Pricing</span>
          </div>
        </div>

        <div className={`stepper-line ${checkoutStep === 'PAYMENT' ? 'filled' : ''}`} />

        <div className={`stepper-step ${checkoutStep === 'PAYMENT' ? 'active' : 'pending'}`}>
          <div className="step-circle">3</div>
          <div className="step-label">
            <strong>Payment & Confirm</strong>
            <span>Method & Placement</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ========================================================= */}
        {/* VIEW 1: ORDER CONFIGURATION FORM (STEP 1 - 3)             */}
        {/* ========================================================= */}
        {checkoutStep === 'FORM' && (
          <div className="create-order-layout">
            {/* LEFT COLUMN: MAIN INPUT SECTIONS */}
            <div className="create-order-form-column">
              
              {/* 1. ROUTE ADDRESSES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                
                {/* PICKUP ADDRESS */}
                <div className="card form-card" style={{ borderColor: errors.pickupAddressId ? '#ef4444' : undefined, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label htmlFor="pickup-address-select" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <MapPin size={15} color="var(--primary)" />
                      1. Pickup Address *
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setAddressPickerTarget('pickup')}
                        style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        Change
                      </button>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <Link to="/customer/addresses" style={{ color: '#64748b', fontSize: 11.5, fontWeight: 600, textDecoration: 'none' }}>
                        + New
                      </Link>
                    </div>
                  </div>

                  <select
                    id="pickup-address-select"
                    className={`form-select ${errors.pickupAddressId ? 'error' : ''}`}
                    value={pickupAddressId}
                    onChange={(e) => {
                      setPickupAddressId(e.target.value);
                      if (e.target.value) {
                        setErrors(prev => { const c = { ...prev }; delete c.pickupAddressId; return c; });
                      }
                    }}
                    style={{ fontSize: 13, height: 40, padding: '6px 12px', marginBottom: selectedPickupAddress ? 8 : 0 }}
                  >
                    <option value="">-- Select Pickup Address --</option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.addressType}: {a.contactName} — {a.city} ({a.postalCode})
                      </option>
                    ))}
                  </select>
                  {errors.pickupAddressId && <p className="form-error" style={{ fontSize: 11.5, marginTop: 4 }}>{errors.pickupAddressId}</p>}

                  {selectedPickupAddress && (
                    <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>{selectedPickupAddress.contactName}</strong> · {selectedPickupAddress.city}, {selectedPickupAddress.state} ({selectedPickupAddress.postalCode}) · Ph: {selectedPickupAddress.phone}
                    </div>
                  )}
                </div>

                {/* DELIVERY ADDRESS */}
                <div className="card form-card" style={{ borderColor: errors.deliveryAddressId ? '#ef4444' : undefined, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label htmlFor="delivery-address-select" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <Truck size={15} color="var(--primary)" />
                      2. Delivery Destination *
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setAddressPickerTarget('delivery')}
                        style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        Change
                      </button>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <Link to="/customer/addresses" style={{ color: '#64748b', fontSize: 11.5, fontWeight: 600, textDecoration: 'none' }}>
                        + New
                      </Link>
                    </div>
                  </div>

                  <select
                    id="delivery-address-select"
                    className={`form-select ${errors.deliveryAddressId ? 'error' : ''}`}
                    value={deliveryAddressId}
                    onChange={(e) => {
                      setDeliveryAddressId(e.target.value);
                      if (e.target.value) {
                        setErrors(prev => { const c = { ...prev }; delete c.deliveryAddressId; return c; });
                      }
                    }}
                    style={{ fontSize: 13, height: 40, padding: '6px 12px', marginBottom: selectedDeliveryAddress ? 8 : 0 }}
                  >
                    <option value="">-- Select Delivery Address --</option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.addressType}: {a.contactName} — {a.city} ({a.postalCode})
                      </option>
                    ))}
                  </select>
                  {errors.deliveryAddressId && <p className="form-error" style={{ fontSize: 11.5, marginTop: 4 }}>{errors.deliveryAddressId}</p>}

                  {selectedDeliveryAddress && (
                    <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>{selectedDeliveryAddress.contactName}</strong> · {selectedDeliveryAddress.city}, {selectedDeliveryAddress.state} ({selectedDeliveryAddress.postalCode}) · Ph: {selectedDeliveryAddress.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. ITEMS TO SHIP */}
              <div className="card form-card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingCart size={15} color="var(--primary)" />
                    3. Items to Ship (Catalog Selector)
                  </h3>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>
                    {filteredCatalog.length} products available
                  </span>
                </div>

                {/* Compact Search & Dropdown Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(200px, 1.8fr) 110px auto', gap: 10, alignItems: 'flex-end' }}>
                  <div>
                    <label htmlFor="catalog-filter-input" style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Filter Catalog
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        id="catalog-filter-input"
                        type="text"
                        className="form-input"
                        placeholder="Search SKU/name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{ paddingLeft: 30, fontSize: 12.5, height: 38 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="catalog-product-select" style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Select Product *
                    </label>
                    <select
                      id="catalog-product-select"
                      className="form-select"
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        if (e.target.value) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.product;
                            return copy;
                          });
                        }
                      }}
                      disabled={loadingCatalog}
                      style={{
                        fontSize: 12.5,
                        height: 38,
                        borderColor: errors.product ? '#ef4444' : undefined,
                      }}
                    >
                      <option value="">-- Choose Product --</option>
                      {filteredCatalog.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}] — {p.unitWeight} kg · ₹{p.unitPrice?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="item-quantity-input" style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Qty *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 6, backgroundColor: '#ffffff', overflow: 'hidden', height: 38 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.max(1, (parseInt(itemQuantityInput, 10) || 1) - 1);
                          setItemQuantityInput(String(val));
                        }}
                        style={{ border: 'none', background: '#f1f5f9', padding: '0 10px', height: '100%', cursor: 'pointer', color: '#475569' }}
                        title="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        id="item-quantity-input"
                        type="number"
                        min="1"
                        step="1"
                        value={itemQuantityInput}
                        onChange={(e) => setItemQuantityInput(e.target.value)}
                        style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: 13, fontWeight: 700, outline: 'none', padding: 0 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (parseInt(itemQuantityInput, 10) || 0) + 1;
                          setItemQuantityInput(String(val));
                        }}
                        style={{ border: 'none', background: '#f1f5f9', padding: '0 10px', height: '100%', cursor: 'pointer', color: '#475569' }}
                        title="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => handleAddItem(e)}
                    style={{
                      height: 38,
                      gap: 5,
                      fontWeight: 700,
                      padding: '0 16px',
                      fontSize: 12.5,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                    id="add-item-to-order-btn"
                  >
                    <Plus size={15} /> Add Item
                  </button>
                </div>

                {errors.product && (
                  <p style={{ color: '#ef4444', fontSize: 11.5, marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={13} /> {errors.product}
                  </p>
                )}

                {/* Candidate product detail preview */}
                {candidateProduct && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#1e40af', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#dbeafe', marginRight: 6 }}>{candidateProduct.sku}</span>
                      <strong>{candidateProduct.name}</strong> ({candidateProduct.category})
                    </div>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <span>Unit: <strong>{candidateProduct.unitWeight} kg</strong></span>
                      <span>Price: <strong>₹{candidateProduct.unitPrice?.toLocaleString()}</strong></span>
                      <span>Line Total ({itemQuantityInput || 1}): <strong>{((candidateProduct.unitWeight || 0) * (parseInt(itemQuantityInput, 10) || 1)).toFixed(2)} kg</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. SELECTED CONSIGNMENT ITEMS */}
              <div className="card form-card" style={{ borderColor: errors.items ? '#ef4444' : undefined, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Box size={15} color="var(--primary)" />
                    Selected Items in Consignment ({cartItems.length})
                  </h3>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCartItems([])}
                      style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {errors.items && (
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} />
                    {errors.items}
                  </div>
                )}

                {cartItems.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12.5, background: '#f8fafc', borderRadius: 6, border: '1px dashed #cbd5e1' }}>
                    No items added yet. Select a product from the catalog above and click <strong>"+ Add Item"</strong>.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cartItems.map((item) => {
                      const lineWeight = (item.product.unitWeight * item.quantity).toFixed(2);
                      const linePrice = ((item.product.unitPrice || 0) * item.quantity).toLocaleString('en-IN');

                      return (
                        <div
                          key={item.product.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto auto auto auto 28px',
                            gap: 12,
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            fontSize: 12.5,
                          }}
                        >
                          {/* Name & SKU */}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.product.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{item.product.sku}</span> · {item.product.category}
                            </div>
                          </div>

                          {/* Unit info */}
                          <div style={{ textAlign: 'right', fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                            {item.product.unitWeight} kg/ea · ₹{item.product.unitPrice?.toLocaleString()}
                          </div>

                          {/* Stepper */}
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 4, overflow: 'hidden', height: 28 }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.product.id, item.quantity - 1)}
                              style={{ border: 'none', background: '#f8fafc', padding: '0 8px', height: '100%', cursor: 'pointer', color: '#475569' }}
                              title="Decrease"
                            >
                              <Minus size={11} />
                            </button>
                            <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 12, color: '#0f172a' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.product.id, item.quantity + 1)}
                              style={{ border: 'none', background: '#f8fafc', padding: '0 8px', height: '100%', cursor: 'pointer', color: '#475569' }}
                              title="Increase"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          {/* Line Weight */}
                          <div style={{ textAlign: 'right', fontWeight: 600, color: '#334155', minWidth: 65, whiteSpace: 'nowrap' }}>
                            {lineWeight} kg
                          </div>

                          {/* Line Total */}
                          <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', minWidth: 75, whiteSpace: 'nowrap' }}>
                            ₹{linePrice}
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product.id)}
                            style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, display: 'flex', justifyContent: 'center' }}
                            title="Remove item"
                            className="hover-trash"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. PACKAGE DESCRIPTION */}
              <div className="card form-card" style={{ borderColor: errors.packageDescription ? '#ef4444' : undefined, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label htmlFor="package-description-input" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Edit2 size={14} color="var(--primary)" />
                    4. Package Description & Handling Notes *
                  </label>
                  {!isDescManuallyEdited && cartItems.length > 0 && (
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                      ⚡ Auto-generated from cart
                    </span>
                  )}
                </div>

                <input
                  id="package-description-input"
                  type="text"
                  className={`form-input ${errors.packageDescription ? 'error' : ''}`}
                  placeholder="e.g. Fragile electronics, handle with extreme care..."
                  value={packageDescription}
                  onChange={(e) => {
                    setPackageDescription(e.target.value);
                    setIsDescManuallyEdited(true);
                    if (e.target.value.trim().length >= 3) {
                      setErrors(prev => { const c = { ...prev }; delete c.packageDescription; return c; });
                    }
                  }}
                  style={{ fontSize: 13, height: 40 }}
                />
                {errors.packageDescription && <p className="form-error" style={{ fontSize: 11.5, marginTop: 4 }}>{errors.packageDescription}</p>}
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY LIVE SHIPPING QUOTE & PROCEED */}
            <div className="create-order-quote-column">
              <div className="card quote-sticky-card" style={{ padding: '18px 20px' }}>
                
                {/* Quote Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Live Shipping Quote
                  </h3>
                  <span className="badge badge-success" style={{ fontSize: 10.5, fontWeight: 700 }}>
                    LIVE TARIFF
                  </span>
                </div>

                {/* Dynamic Price Display */}
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px dashed var(--border)' }}>
                  {loadingQuote ? (
                    <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--text-muted)' }}>
                      <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 6px', color: 'var(--primary)' }} />
                      <p style={{ fontSize: 12, margin: 0 }}>Calculating dynamic freight quote...</p>
                    </div>
                  ) : quote ? (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        ₹{quote.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 5 }}>
                        Total inclusive of GST & handling
                      </div>

                      {/* Breakdown List */}
                      <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Base Freight Fee</span>
                          <span style={{ fontWeight: 600 }}>₹{quote.baseFee.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Weight Charge ({totalWeight} kg)</span>
                          <span style={{ fontWeight: 600 }}>₹{quote.weightCharge.toFixed(2)}</span>
                        </div>
                        {quote.prioritySurcharge > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                            <span>Priority SLA Surcharge</span>
                            <span style={{ fontWeight: 600 }}>₹{quote.prioritySurcharge.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderTop: '1px dotted #e2e8f0', paddingTop: 5 }}>
                          <span>Subtotal</span>
                          <span>₹{quote.subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>GST / Tax (18%)</span>
                          <span>₹{quote.gst.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                      {cartItems.length === 0
                        ? 'Add items to consignment to calculate live rate.'
                        : 'Select pickup & delivery addresses for freight quote.'}
                    </p>
                  )}
                </div>

                {/* Delivery Tier Selector */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                    Delivery Tier & SLA
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('STANDARD')}
                      style={{
                        border: deliveryType === 'STANDARD' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: deliveryType === 'STANDARD' ? 'rgba(234, 88, 12, 0.06)' : '#ffffff',
                        borderRadius: 6,
                        padding: '8px 8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: deliveryType === 'STANDARD' ? 'var(--primary)' : '#0f172a' }}>
                        Standard
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>3–5 days</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('EXPRESS')}
                      style={{
                        border: deliveryType === 'EXPRESS' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: deliveryType === 'EXPRESS' ? 'rgba(234, 88, 12, 0.06)' : '#ffffff',
                        borderRadius: 6,
                        padding: '8px 8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: deliveryType === 'EXPRESS' ? 'var(--primary)' : '#0f172a' }}>
                        Express
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>1–2 days</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('SAME_DAY')}
                      style={{
                        border: deliveryType === 'SAME_DAY' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: deliveryType === 'SAME_DAY' ? 'rgba(234, 88, 12, 0.06)' : '#ffffff',
                        borderRadius: 6,
                        padding: '8px 8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: deliveryType === 'SAME_DAY' ? 'var(--primary)' : '#0f172a' }}>
                        Same Day
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Within 24h</div>
                    </button>
                  </div>
                </div>

                {/* Continue to Order Review */}
                <button
                  type="button"
                  onClick={handleContinueToReview}
                  disabled={cartItems.length === 0 || !pickupAddressId || !deliveryAddressId}
                  className="btn btn-primary w-full"
                  style={{ height: 44, justifyContent: 'center', fontWeight: 800, fontSize: 13.5 }}
                  id="continue-to-review-btn"
                >
                  Continue to Order Review <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: ORDER REVIEW (STEP 2)                             */}
        {/* ========================================================= */}
        {checkoutStep === 'REVIEW' && (
          <div className="create-order-layout">
            {/* LEFT COLUMN: ROUTE & MANIFEST */}
            <div className="create-order-form-column">
              
              {/* Route Summary Card */}
              <div className="card form-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} color="var(--primary)" /> Route & Address Summary
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('FORM')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11.5, gap: 4, height: 28, padding: '0 10px' }}
                  >
                    <Edit2 size={12} /> Edit Addresses
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      📍 Pickup Location
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>
                      {selectedPickupAddress ? selectedPickupAddress.contactName : '—'}
                    </strong>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 3, lineHeight: 1.35 }}>
                      {selectedPickupAddress ? `${selectedPickupAddress.addressLine1 || ''} ${selectedPickupAddress.addressLine2 || ''}, ${selectedPickupAddress.city}, ${selectedPickupAddress.state} (${selectedPickupAddress.postalCode})` : '—'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
                      Phone: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedPickupAddress?.phone}</span>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      🚚 Delivery Destination
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>
                      {selectedDeliveryAddress ? selectedDeliveryAddress.contactName : '—'}
                    </strong>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 3, lineHeight: 1.35 }}>
                      {selectedDeliveryAddress ? `${selectedDeliveryAddress.addressLine1 || ''} ${selectedDeliveryAddress.addressLine2 || ''}, ${selectedDeliveryAddress.city}, ${selectedDeliveryAddress.state} (${selectedDeliveryAddress.postalCode})` : '—'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
                      Phone: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedDeliveryAddress?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Manifest Card */}
              <div className="card form-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Box size={16} color="var(--primary)" /> Consignment Manifest ({cartItems.length} Products · {totalQuantity} Units · {totalWeight} kg)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('FORM')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11.5, gap: 4, height: 28, padding: '0 10px' }}
                  >
                    <Edit2 size={12} /> Edit Items
                  </button>
                </div>

                <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '9px 14px' }}>Product & SKU</th>
                        <th style={{ textAlign: 'center', padding: '9px 14px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '9px 14px' }}>Unit Weight</th>
                        <th style={{ textAlign: 'right', padding: '9px 14px' }}>Line Weight</th>
                        <th style={{ textAlign: 'right', padding: '9px 14px' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '9px 14px' }}>
                            <strong style={{ color: '#0f172a' }}>{item.product.name}</strong>
                            <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8, fontFamily: 'monospace' }}>[{item.product.sku}]</span>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.product.category}</div>
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#64748b' }}>
                            {item.product.unitWeight} kg
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>
                            {((item.product.unitWeight || 0) * item.quantity).toFixed(2)} kg
                          </td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            ₹{((item.product.unitPrice || 0) * item.quantity).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Package notes */}
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
                  <strong style={{ color: '#0f172a' }}>Handling & Package Notes:</strong> {packageDescription || autoGeneratedDescription || 'Standard logistics handling'}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: TARIFF SUMMARY & ACTION */}
            <div className="create-order-quote-column">
              <div className="card quote-sticky-card" style={{ padding: '18px 20px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Order Summary
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: 10.5, fontWeight: 700 }}>
                    STEP 2 OF 3
                  </span>
                </div>

                {/* Delivery Service Level */}
                <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bfdbfe', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                      Delivery Service Level
                    </span>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('FORM')}
                      style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Edit SLA
                    </button>
                  </div>
                  <strong style={{ fontSize: 13.5, color: '#1e3a8a', display: 'block', marginTop: 2 }}>
                    {getDeliveryTierLabel(deliveryType).name}
                  </strong>
                  <span style={{ fontSize: 11.5, color: '#3b82f6' }}>
                    {getDeliveryTierLabel(deliveryType).time}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Base Freight Fee</span>
                    <span style={{ fontWeight: 600 }}>₹{quote?.baseFee?.toFixed(2) || '250.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Weight Charge ({totalWeight} kg)</span>
                    <span style={{ fontWeight: 600 }}>₹{quote?.weightCharge?.toFixed(2) || '0.00'}</span>
                  </div>
                  {(quote?.prioritySurcharge ?? 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                      <span>Priority SLA Surcharge ({deliveryType})</span>
                      <span style={{ fontWeight: 600 }}>₹{quote?.prioritySurcharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderTop: '1px dotted #cbd5e1', paddingTop: 6 }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>₹{quote?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>GST (18%)</span>
                    <span style={{ fontWeight: 600 }}>₹{quote?.gst?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', borderTop: '1.5px solid #0f172a', paddingTop: 8, fontSize: 16 }}>
                    <strong style={{ textTransform: 'uppercase' }}>Total Amount</strong>
                    <strong style={{ color: 'var(--primary)', fontSize: 20 }}>
                      ₹{quote?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    className="btn btn-primary w-full"
                    style={{ height: 44, justifyContent: 'center', fontWeight: 800, fontSize: 13.5, gap: 6 }}
                    id="continue-to-payment-btn"
                  >
                    Continue to Payment <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStep('FORM')}
                    className="btn btn-outline w-full"
                    style={{ height: 38, justifyContent: 'center', fontSize: 12.5, gap: 6 }}
                  >
                    <ArrowLeft size={14} /> Back to Order Details
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: PAYMENT METHOD & FINAL PLACEMENT (STEP 3)         */}
        {/* ========================================================= */}
        {checkoutStep === 'PAYMENT' && (
          <div className="create-order-layout">
            {/* LEFT COLUMN: PAYMENT METHODS SELECTOR */}
            <div className="create-order-form-column">
              
              <div className="card form-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      SELECT PAYMENT METHOD
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                      Choose your preferred payment gateway or billing terms for this shipment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('REVIEW')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: 11.5, gap: 4, height: 28, padding: '0 10px' }}
                  >
                    <ArrowLeft size={12} /> Back to Review
                  </button>
                </div>

                {errors.paymentMethod && (
                  <div style={{ padding: '9px 14px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 12.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={15} />
                    {errors.paymentMethod}
                  </div>
                )}

                {/* Selectable Payment Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  {AVAILABLE_PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        id={`payment-method-${method.id.toLowerCase()}`}
                        onClick={() => {
                          setPaymentMethod(method.id);
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.paymentMethod;
                            return copy;
                          });
                        }}
                        style={{
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '14px 16px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(234, 88, 12, 0.05)' : '#ffffff',
                          boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                          transition: 'all 0.12s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: 110,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              background: isSelected ? 'var(--primary-light)' : '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {getMethodIcon(method.id, isSelected)}
                            </div>

                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: isSelected ? '5px solid var(--primary)' : '1.5px solid #cbd5e1',
                              background: '#ffffff',
                              transition: 'all 0.12s ease',
                            }} />
                          </div>

                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
                            {method.label}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.35 }}>
                            {method.description}
                          </div>
                        </div>

                        {method.badge && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'rgba(234, 88, 12, 0.1)', color: 'var(--primary)' }}>
                              {method.badge}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Security Guarantee */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
                  <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#0f172a' }}>256-Bit Encrypted & Certified Checkout:</strong> Your shipment booking and payment authorization are processed through encrypted enterprise gateways.
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: FINAL CONFIRMATION & ORDER PLACEMENT */}
            <div className="create-order-quote-column">
              <div className="card quote-sticky-card" style={{ padding: '18px 20px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Payment Summary
                  </h3>
                  <span className="badge badge-success" style={{ fontSize: 10.5, fontWeight: 700 }}>
                    STEP 3 OF 3
                  </span>
                </div>

                {/* Selected Method Details */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', border: '1px solid #e2e8f0', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block' }}>
                    Payment Method
                  </span>
                  <strong style={{ fontSize: 14, color: '#0f172a', display: 'block', marginTop: 2 }}>
                    {AVAILABLE_PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod || 'None selected'}
                  </strong>
                  <span className="badge badge-warning" style={{ fontSize: 10, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                    PENDING AUTHORIZATION
                  </span>
                </div>

                {/* Route Recap */}
                <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: 4 }}>
                    <strong>From:</strong> {selectedPickupAddress?.city || '—'} ({selectedPickupAddress?.postalCode || ''})
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <strong>To:</strong> {selectedDeliveryAddress?.city || '—'} ({selectedDeliveryAddress?.postalCode || ''})
                  </div>
                  <div>
                    <strong>Manifest:</strong> {cartItems.length} products · {totalQuantity} units · {totalWeight} kg
                  </div>
                </div>

                {/* Total Cost Display */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 12, marginBottom: 4 }}>
                    <span>Freight Subtotal</span>
                    <span>₹{quote?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 12, marginBottom: 6 }}>
                    <span>GST (18%)</span>
                    <span>₹{quote?.gst?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', borderTop: '1.5px solid #0f172a', paddingTop: 8, fontSize: 16 }}>
                    <strong style={{ textTransform: 'uppercase' }}>Total Payable</strong>
                    <strong style={{ color: 'var(--primary)', fontSize: 20 }}>
                      ₹{quote?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || !paymentMethod || cartItems.length === 0}
                    className="btn btn-primary w-full"
                    style={{ height: 46, justifyContent: 'center', fontSize: 14, fontWeight: 800, gap: 7 }}
                    id="confirm-place-order-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" /> Confirming Order...
                      </>
                    ) : (
                      <>
                        Confirm & Place Order <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStep('REVIEW')}
                    className="btn btn-outline w-full"
                    style={{ height: 38, justifyContent: 'center', fontSize: 12.5, gap: 6 }}
                  >
                    <ArrowLeft size={14} /> Back to Order Review
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </form>

      {/* Address Selection Modal */}
      <Modal
        isOpen={!!addressPickerTarget}
        onClose={() => setAddressPickerTarget(null)}
        title={addressPickerTarget === 'pickup' ? 'Select Pickup Address' : 'Select Delivery Address'}
        size="lg"
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Select a saved address from your address book:
            </p>
            <Link
              to="/customer/addresses"
              className="btn btn-outline btn-sm"
              style={{ fontSize: 11, gap: 4, height: 28 }}
            >
              <Plus size={12} /> Add New Address
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {addresses.map((addr) => {
              const isSelected =
                addressPickerTarget === 'pickup'
                  ? String(addr.id) === pickupAddressId
                  : String(addr.id) === deliveryAddressId;

              return (
                <div
                  key={addr.id}
                  style={{
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '10px 12px',
                    background: isSelected ? 'rgba(37, 99, 235, 0.03)' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                    fontSize: 11.5,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="badge badge-blue" style={{ fontSize: 9, fontWeight: 700 }}>
                        {addr.addressType.toUpperCase()}
                      </span>
                      {addr.defaultAddress && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 5px', borderRadius: 6 }}>
                          Default
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                      {addr.contactName}
                    </h4>

                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 5px', lineHeight: 1.35 }}>
                      {[addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ')}
                      <br />
                      {addr.city}, {addr.state} — {addr.postalCode}
                    </p>

                    <p style={{ fontSize: 10.5, color: 'var(--text-muted)', margin: 0 }}>
                      Phone: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 600 }}>{addr.phone}</span>
                    </p>
                  </div>

                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                      style={{ width: '100%', height: 26, fontSize: 11 }}
                      onClick={() => {
                        if (addressPickerTarget === 'pickup') {
                          setPickupAddressId(String(addr.id));
                        } else {
                          setDeliveryAddressId(String(addr.id));
                        }
                        setAddressPickerTarget(null);
                      }}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Scoped CSS for Modern Stepper and Layout */}
      <style>{`
        .create-order-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 16px;
        }
        .checkout-stepper-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .stepper-step {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .step-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          transition: all 0.15s ease;
        }
        .stepper-step.active .step-circle {
          background: var(--primary);
          color: #ffffff;
        }
        .stepper-step.completed .step-circle {
          background: #10b981;
          color: #ffffff;
        }
        .stepper-step.pending .step-circle {
          background: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #cbd5e1;
        }
        .step-label {
          display: flex;
          flex-direction: column;
        }
        .step-label strong {
          font-size: 12px;
          color: #0f172a;
          line-height: 1.2;
        }
        .step-label span {
          font-size: 10px;
          color: #64748b;
          line-height: 1.1;
        }
        .stepper-line {
          flex: 1;
          height: 2px;
          background: #e2e8f0;
          margin: 0 10px;
          transition: all 0.2s ease;
        }
        .stepper-line.filled {
          background: #10b981;
        }
        .form-card {
          margin-bottom: 0px !important;
          border-radius: 8px;
        }
        .create-order-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          align-items: flex-start;
        }
        .create-order-form-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }
        .create-order-quote-column {
          min-width: 0;
        }
        @media (min-width: 960px) {
          .create-order-layout {
            grid-template-columns: 1fr 350px;
            gap: 16px;
          }
          .quote-sticky-card {
            position: sticky;
            top: 75px;
          }
        }
        @media (min-width: 1120px) {
          .create-order-layout {
            grid-template-columns: 1fr 360px;
            gap: 18px;
          }
        }
        .hover-trash:hover {
          color: #ef4444 !important;
        }
        @media (max-width: 640px) {
          .checkout-stepper-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .stepper-line {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
