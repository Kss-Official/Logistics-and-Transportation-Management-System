import React from 'react';

type StatusKey =
  | 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_SHIPMENT'
  | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  | 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'OVERDUE'
  | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'FULL' | 'MAINTENANCE'
  | 'AVAILABLE' | 'ASSIGNED' | 'IN_TRANSIT'
  | 'ON_DELIVERY' | 'OFF_DUTY'
  | 'Shipment Created' | 'Picked Up' | 'At Warehouse' | 'Processing'
  | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered'
  | 'Failed Delivery' | 'Returned'
  | 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  | 'Low' | 'Medium' | 'High' | 'Critical'
  | 'Standard' | 'Express' | 'Same Day';

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  // Orders
  NEW:                 { cls: 'badge-slate',  label: 'New' },
  CONFIRMED:           { cls: 'badge-blue',   label: 'Confirmed' },
  PICKED_UP:           { cls: 'badge-blue',   label: 'Picked Up' },
  PROCESSING:          { cls: 'badge-amber',  label: 'Processing' },
  READY_FOR_SHIPMENT:  { cls: 'badge-indigo', label: 'Ready for Shipment' },
  SHIPPED:             { cls: 'badge-amber',  label: 'Shipped' },
  OUT_FOR_DELIVERY:    { cls: 'badge-purple', label: 'Out for Delivery' },
  DELIVERED:           { cls: 'badge-green',  label: 'Delivered' },
  CANCELLED:           { cls: 'badge-red',    label: 'Cancelled' },
  // Payment & Invoices
  PAID:                { cls: 'badge-green',  label: 'Paid' },
  PENDING:             { cls: 'badge-amber',  label: 'Pending' },
  UNPAID:              { cls: 'badge-amber',  label: 'Unpaid' },
  PARTIALLY_PAID:      { cls: 'badge-indigo', label: 'Partially Paid' },
  FAILED:              { cls: 'badge-red',    label: 'Failed' },
  REFUNDED:            { cls: 'badge-slate',  label: 'Refunded' },
  OVERDUE:             { cls: 'badge-red',    label: 'Overdue' },
  DRAFT:               { cls: 'badge-slate',  label: 'Draft' },
  ISSUED:              { cls: 'badge-blue',   label: 'Issued' },
  SENT:                { cls: 'badge-indigo', label: 'Sent' },
  // Customer
  ACTIVE:              { cls: 'badge-green',  label: 'Active' },
  INACTIVE:            { cls: 'badge-slate',  label: 'Inactive' },
  SUSPENDED:           { cls: 'badge-red',    label: 'Suspended' },
  // Warehouse
  FULL:                { cls: 'badge-red',    label: 'Full' },
  MAINTENANCE:         { cls: 'badge-amber',  label: 'Maintenance' },
  // Vehicles & Drivers
  AVAILABLE:           { cls: 'badge-green',  label: 'Available' },
  ASSIGNED:            { cls: 'badge-blue',   label: 'Assigned' },
  IN_TRANSIT:          { cls: 'badge-amber',  label: 'In Transit' },
  ON_DUTY:             { cls: 'badge-blue',   label: 'On Duty' },
  ON_TRIP:             { cls: 'badge-amber',  label: 'On Trip' },
  ON_DELIVERY:         { cls: 'badge-amber',  label: 'On Delivery' },
  OFF_DUTY:            { cls: 'badge-slate',  label: 'Off Duty' },
  // Shipment
  'Shipment Created':  { cls: 'badge-slate',  label: 'Created' },
  'Picked Up':         { cls: 'badge-blue',   label: 'Picked Up' },
  'At Warehouse':      { cls: 'badge-indigo', label: 'At Warehouse' },
  'Processing':        { cls: 'badge-amber',  label: 'Processing' },
  'Dispatched':        { cls: 'badge-indigo', label: 'Dispatched' },
  'In Transit':        { cls: 'badge-amber',  label: 'In Transit' },
  'Out for Delivery':  { cls: 'badge-purple', label: 'Out for Delivery' },
  'Delivered':         { cls: 'badge-green',  label: 'Delivered' },
  'Failed Delivery':   { cls: 'badge-red',    label: 'Failed Delivery' },
  'Returned':          { cls: 'badge-red',    label: 'Returned' },
  // Tickets
  'Open':              { cls: 'badge-blue',   label: 'Open' },
  'In Progress':       { cls: 'badge-amber',  label: 'In Progress' },
  'Resolved':          { cls: 'badge-green',  label: 'Resolved' },
  'Closed':            { cls: 'badge-slate',  label: 'Closed' },
  // Priority
  'Low':               { cls: 'badge-slate',  label: 'Low' },
  'Medium':            { cls: 'badge-blue',   label: 'Medium' },
  'High':              { cls: 'badge-amber',  label: 'High' },
  'Critical':          { cls: 'badge-red',    label: 'Critical' },
  // Priority shipping
  'Standard':          { cls: 'badge-slate',  label: 'Standard' },
  'Express':           { cls: 'badge-blue',   label: 'Express' },
  'Same Day':          { cls: 'badge-purple', label: 'Same Day' },
};

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
}

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { cls: 'badge-slate', label: status };
  return (
    <span className={`badge ${config.cls}`}>
      {showDot && <span className="badge-dot" />}
      {config.label}
    </span>
  );
}
