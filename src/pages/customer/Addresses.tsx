import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';

import Modal from '../../components/common/Modal';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../components/common/Toast';
import {
  addressService,
  type Address,
  type AddressRequest,
} from '../../services/addressService';
import {
  validateFullName,
  validateIndianPhone,
  validatePincode,
  validateRequired,
} from '../../utils/validation';

export default function Addresses() {
  const { showToast } = useToast();

  // ==============================
  // STATE
  // ==============================

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Field-level validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  // Custom Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<AddressRequest>({
    addressType: 'Office',
    contactName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    defaultAddress: false,
  });

  // ==============================
  // LOAD ADDRESSES
  // ==============================

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      showToast(
        'error',
        'Unable to Load Addresses',
        'We could not load your saved addresses from the database.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // OPEN ADD MODAL
  // ==============================

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormErrors({});
    setFormTouched({});

    setFormData({
      addressType: 'Office',
      contactName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      defaultAddress: addresses.length === 0,
    });

    setIsModalOpen(true);
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================

  const openEditModal = (address: Address) => {
    setIsEditing(true);
    setEditingId(address.id);
    setFormErrors({});
    setFormTouched({});

    setFormData({
      addressType: address.addressType,
      contactName: address.contactName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      defaultAddress: address.defaultAddress,
    });

    setIsModalOpen(true);
  };

  // ==============================
  // OPEN & CLOSE DELETE MODAL
  // ==============================

  const openDeleteModal = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setAddressToDelete(null);
  };

  // ==============================
  // HANDLE INPUT & VALIDATION
  // ==============================

  const handleFieldBlur = (field: string) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    validateSingleAddressField(field);
  };

  const validateSingleAddressField = (field: string) => {
    const errs = { ...formErrors };
    if (field === 'contactName') {
      const res = validateFullName(formData.contactName, 'Contact Name');
      if (!res.isValid) errs.contactName = res.error!;
      else delete errs.contactName;
    }
    if (field === 'phone') {
      const res = validateIndianPhone(formData.phone);
      if (!res.isValid) errs.phone = res.error!;
      else delete errs.phone;
    }
    if (field === 'addressLine1') {
      const res = validateRequired(formData.addressLine1, 'Address Line 1');
      if (!res.isValid) errs.addressLine1 = res.error!;
      else delete errs.addressLine1;
    }
    if (field === 'city') {
      const res = validateRequired(formData.city, 'City');
      if (!res.isValid) errs.city = res.error!;
      else delete errs.city;
    }
    if (field === 'state') {
      const res = validateRequired(formData.state, 'State');
      if (!res.isValid) errs.state = res.error!;
      else delete errs.state;
    }
    if (field === 'postalCode') {
      const res = validatePincode(formData.postalCode);
      if (!res.isValid) errs.postalCode = res.error!;
      else delete errs.postalCode;
    }
    if (field === 'country') {
      const res = validateRequired(formData.country, 'Country');
      if (!res.isValid) errs.country = res.error!;
      else delete errs.country;
    }
    setFormErrors(errs);
  };

  const validateAddressForm = (): boolean => {
    const errs: Record<string, string> = {};

    const nameRes = validateFullName(formData.contactName, 'Contact Name');
    if (!nameRes.isValid) errs.contactName = nameRes.error!;

    const phoneRes = validateIndianPhone(formData.phone);
    if (!phoneRes.isValid) errs.phone = phoneRes.error!;

    const addr1Res = validateRequired(formData.addressLine1, 'Address Line 1');
    if (!addr1Res.isValid) errs.addressLine1 = addr1Res.error!;

    const cityRes = validateRequired(formData.city, 'City');
    if (!cityRes.isValid) errs.city = cityRes.error!;

    const stateRes = validateRequired(formData.state, 'State');
    if (!stateRes.isValid) errs.state = stateRes.error!;

    const pinRes = validatePincode(formData.postalCode);
    if (!pinRes.isValid) errs.postalCode = pinRes.error!;

    const countryRes = validateRequired(formData.country, 'Country');
    if (!countryRes.isValid) errs.country = countryRes.error!;

    setFormErrors(errs);
    setFormTouched({
      contactName: true,
      phone: true,
      addressLine1: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    });

    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // ==============================
  // HANDLE DEFAULT CHECKBOX
  // ==============================

  const handleDefaultChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      defaultAddress: e.target.checked,
    }));
  };

  // ==============================
  // SAVE ADDRESS
  // ==============================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddressForm()) {
      showToast(
        'error',
        'Validation Error',
        'Please correct the highlighted fields before saving.'
      );
      return;
    }

    try {
      if (isEditing && editingId !== null) {
        const updatedAddress = await addressService.update(
          editingId,
          formData
        );

        setAddresses((prev) =>
          prev.map((address) =>
            address.id === editingId
              ? updatedAddress
              : address
          )
        );

        if (formData.defaultAddress) {
          setAddresses((prev) =>
            prev.map((address) => ({
              ...address,
              defaultAddress:
                address.id === updatedAddress.id,
            }))
          );
        }

        showToast(
          'success',
          'Address Updated',
          'Your address has been updated successfully.'
        );
      } else {
        const createdAddress = await addressService.create(formData);

        if (createdAddress.defaultAddress) {
          setAddresses((prev) => [
            createdAddress,
            ...prev.map((address) => ({
              ...address,
              defaultAddress: false,
            })),
          ]);
        } else {
          setAddresses((prev) => [createdAddress, ...prev]);
        }

        showToast(
          'success',
          'Address Created',
          'New address has been saved successfully.'
        );
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save address:', error);
      const backendErrors = error.response?.data?.data || error.response?.data?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        setFormErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      const message = error.response?.data?.message || 'Failed to save address.';
      showToast('error', 'Action Failed', message);
    }
  };

  // ==============================
  // CONFIRM DELETE ADDRESS
  // ==============================

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      setIsDeleting(true);
      await addressService.delete(addressToDelete.id);

      // Successfully deleted from PostgreSQL
      setAddresses((prev) => prev.filter((address) => address.id !== addressToDelete.id));
      await loadAddresses();

      setIsDeleteModalOpen(false);
      setAddressToDelete(null);

      showToast(
        'success',
        'Address Deleted',
        'Address deleted successfully.'
      );
    } catch (err: unknown) {
      console.error('Delete address error:', err);
      const axiosErr = err as {
        response?: {
          status?: number;
          data?: { message?: string } | string;
        };
      };

      const status = axiosErr.response?.status;
      const data = axiosErr.response?.data;
      const message = typeof data === 'string' ? data : data?.message;

      setIsDeleteModalOpen(false);
      setAddressToDelete(null);

      if (status === 409) {
        showToast(
          'error',
          'Delete Not Allowed',
          message || 'This address is linked to an existing order and cannot be deleted. Please keep this address for order history.'
        );
      } else {
        showToast(
          'error',
          'Delete Failed',
          message || 'Unable to delete the address. Please try again.'
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // ==============================
  // SET DEFAULT ADDRESS
  // ==============================

  const handleSetDefault = async (address: Address) => {
    try {
      const request: AddressRequest = {
        addressType: address.addressType,
        contactName: address.contactName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        defaultAddress: true,
      };

      const updatedAddress = await addressService.update(
        address.id,
        request
      );

      setAddresses((prev) =>
        prev.map((item) => ({
          ...item,
          defaultAddress:
            item.id === updatedAddress.id,
        }))
      );

      showToast(
        'success',
        'Default Address Updated',
        'Your primary shipping address has been updated.'
      );
    } catch (error) {
      console.error('Failed to set default address:', error);
      showToast(
        'error',
        'Update Failed',
        'Unable to update the default address.'
      );
    }
  };

  // ==============================
  // LOADING SCREEN
  // ==============================

  if (isLoading) {
    return (
      <div>
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          Loading your saved addresses...
        </div>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Saved Addresses
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Manage your verified pickup warehouses, dispatch facilities, and delivery destinations.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openAddModal}
          id="add-address-btn"
          style={{ height: 38, gap: 6, fontSize: 13 }}
        >
          <Plus size={15} />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address Cards Grid or Empty State */}
      {addresses.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <EmptyState
            title="No saved addresses"
            description="Add an address to use it for future orders."
            action={
              <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                <Plus size={14} /> Add Address
              </button>
            }
          />
        </div>
      ) : (
        <div
          className="grid-3"
          style={{
            marginBottom: 24,
          }}
        >
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`address-card ${address.defaultAddress ? 'default' : ''}`}
            >
              {/* Default badge */}
              {address.defaultAddress && (
                <span className="address-default-badge">
                  Default Location
                </span>
              )}

              {/* Address type */}
              <p className="address-label">
                {address.addressType}
              </p>

              {/* Contact name */}
              <p className="address-name" style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                {address.contactName}
              </p>

              {/* Formatted Full Address */}
              <p className="address-text" style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {[address.addressLine1, address.addressLine2].filter(Boolean).join(', ')}<br />
                {address.city}, {address.state} — {address.postalCode}<br />
                {address.country || 'India'}
              </p>

              {/* Phone */}
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                }}
              >
                Phone: {address.phone}
              </p>

              {/* ============================
                  ACTIONS
              ============================ */}
              <div className="address-actions">
                {!address.defaultAddress && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                    }}
                    onClick={() => handleSetDefault(address)}
                  >
                    Set as Default
                  </button>
                )}

                {/* Edit */}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: 11,
                    padding: '3px 6px',
                  }}
                  onClick={() => openEditModal(address)}
                  title="Edit Address"
                >
                  <Edit2 size={13} />
                </button>

                {/* Delete (Opens Custom Modal) */}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: 11,
                    padding: '3px 6px',
                    color: 'var(--danger)',
                  }}
                  onClick={() => openDeleteModal(address)}
                  title="Delete Address"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================
          ADD / EDIT MODAL
      ============================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Address' : 'Add New Address Location'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 16,
            }}
          >
            {/* Address Type */}
            <div
              className="form-group"
              style={{
                gridColumn: 'span 2',
              }}
            >
              <label className="form-label">
                Location Type
              </label>

              <select
                name="addressType"
                className="form-select"
                value={formData.addressType}
                onChange={handleChange}
              >
                <option value="Office">Office</option>
                <option value="Home">Home</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Pickup">Pickup Point</option>
                <option value="Delivery">Delivery Point</option>
                <option value="Other">Other Facility</option>
              </select>
            </div>

            {/* Contact Name */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Contact Person *
              </label>

              <input
                type="text"
                name="contactName"
                className="form-input"
                placeholder="Enter contact name"
                value={formData.contactName}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('contactName')}
                style={{
                  borderColor: formTouched.contactName && formErrors.contactName ? '#ef4444' : undefined,
                }}
              />
              {formTouched.contactName && formErrors.contactName && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.contactName}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Contact Phone *
              </label>

              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('phone')}
                style={{
                  borderColor: formTouched.phone && formErrors.phone ? '#ef4444' : undefined,
                }}
              />
              {formTouched.phone && formErrors.phone && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.phone}
                </span>
              )}
            </div>

            {/* Street / Building Address (Line 1) */}
            <div
              className="form-group"
              style={{
                gridColumn: 'span 2',
              }}
            >
              <label className="form-label form-label-required">
                Street / Building Address *
              </label>
              <input
                type="text"
                name="addressLine1"
                className="form-input"
                placeholder="Building, house number, street, area..."
                value={formData.addressLine1}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('addressLine1')}
                style={{
                  borderColor: formTouched.addressLine1 && formErrors.addressLine1 ? '#ef4444' : undefined,
                }}
              />
              {formTouched.addressLine1 && formErrors.addressLine1 && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.addressLine1}
                </span>
              )}
            </div>

            {/* Apartment / Unit / Landmark (Line 2 - Optional) */}
            <div
              className="form-group"
              style={{
                gridColumn: 'span 2',
              }}
            >
              <label className="form-label">
                Apartment / Unit / Landmark <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                type="text"
                name="addressLine2"
                className="form-input"
                placeholder="Flat, floor, suite, landmark..."
                value={formData.addressLine2}
                onChange={handleChange}
              />
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label form-label-required">
                City *
              </label>

              <input
                type="text"
                name="city"
                className="form-input"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('city')}
                style={{
                  borderColor: formTouched.city && formErrors.city ? '#ef4444' : undefined,
                }}
              />
              {formTouched.city && formErrors.city && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.city}
                </span>
              )}
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label form-label-required">
                State *
              </label>

              <input
                type="text"
                name="state"
                className="form-input"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('state')}
                style={{
                  borderColor: formTouched.state && formErrors.state ? '#ef4444' : undefined,
                }}
              />
              {formTouched.state && formErrors.state && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.state}
                </span>
              )}
            </div>

            {/* Postal Code */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Postal Code (6 Digits) *
              </label>

              <input
                type="text"
                name="postalCode"
                className="form-input"
                placeholder="751024"
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('postalCode')}
                style={{
                  borderColor: formTouched.postalCode && formErrors.postalCode ? '#ef4444' : undefined,
                }}
              />
              {formTouched.postalCode && formErrors.postalCode && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.postalCode}
                </span>
              )}
            </div>

            {/* Country */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Country *
              </label>

              <input
                type="text"
                name="country"
                className="form-input"
                value={formData.country}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('country')}
                style={{
                  borderColor: formTouched.country && formErrors.country ? '#ef4444' : undefined,
                }}
              />
              {formTouched.country && formErrors.country && (
                <span style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                  {formErrors.country}
                </span>
              )}
            </div>
          </div>

          {/* DEFAULT ADDRESS */}
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={formData.defaultAddress}
                onChange={handleDefaultChange}
              />
              <span>Set as default address</span>
            </label>
          </div>

          {/* MODAL BUTTONS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
            >
              {isEditing ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================
          CUSTOM DELETE CONFIRMATION MODAL
      ============================ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Address"
        size="md"
      >
        {addressToDelete && (
          <div>
            {/* Address Preview Box */}
            <div
              style={{
                background: 'var(--page-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px 18px',
                marginBottom: 18,
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="badge badge-primary" style={{ fontSize: 11 }}>
                  {addressToDelete.addressType}
                </span>
                <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>
                  {addressToDelete.contactName}
                </strong>
                {addressToDelete.defaultAddress && (
                  <span className="badge badge-outline" style={{ fontSize: 10 }}>Default</span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.5 }}>
                {addressToDelete.addressLine1}
                {addressToDelete.addressLine2 ? `, ${addressToDelete.addressLine2}` : ''},<br />
                {addressToDelete.city}, {addressToDelete.state} - {addressToDelete.postalCode}<br />
                {addressToDelete.country}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                Phone: {addressToDelete.phone}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
              <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Are you sure you want to delete this saved address?
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  This action cannot be undone. Addresses linked to previous orders cannot be deleted.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="confirm-delete-address-btn"
              >
                {isDeleting ? 'Deleting...' : 'Delete Address'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}