import api from './api';
import type {
  DriverProfileData,
  DriverStatus,
  DeliveryAssignment,
  DeliveryStatus,
  VehicleTelemetry,
  VehicleInspectionReport,
  DriverNotificationItem,
  DriverSupportTicket,
  DriverSupportContact,
  DriverDashboardKpis,
  ProofOfDeliveryData,
  DriverRouteData,
} from '../types/driverPortal';

const STORAGE_KEYS = {
  INSPECTIONS: 'pr_driver_inspections',
  NOTIFICATIONS: 'pr_driver_notifications',
  TICKETS: 'pr_driver_tickets',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to persist ${key}:`, err);
  }
}

function mapDelivery(data: any): DeliveryAssignment {
  if (!data) {
    return null as any;
  }
  const pickup = data.pickupLocation || {};
  const dest = data.destination || data.deliveryLocation || {};
  const cleanId = String(data.id || data.shipmentId || '').trim();

  return {
    id: cleanId,
    trackingNumber: data.trackingNumber || 'Not available',
    orderNumber: data.orderNumber || 'Not available',
    status: (data.status as DeliveryStatus) || 'IN_TRANSIT',
    priority: (data.priority as 'CRITICAL' | 'HIGH' | 'STANDARD') || 'STANDARD',
    assignedAt: data.assignedAt || data.assignedDate || 'Not available',
    assignedDate: data.assignedDate || data.assignedAt || 'Not available',
    pickupEta: data.pickupEta || '09:00 AM',
    deliveryEta: data.deliveryEta || data.estimatedDeliveryTime || 'Not available',
    estimatedDeliveryTime: data.estimatedDeliveryTime || data.deliveryEta || 'Not available',
    totalQuantity: Number(data.totalQuantity || data.totalPackages || 1),
    totalPackages: Number(data.totalPackages || data.totalQuantity || 1),
    totalWeightKg: Number(data.totalWeightKg || 0),
    volumeCbm: Number(data.volumeCbm || 0),
    cargoSummary: data.cargoSummary || 'Commercial Consignment Cargo',
    customerOrderRef: data.customerOrderRef || data.orderNumber || 'Not available',
    recipientName: data.recipientName || dest.customerName || 'Customer',
    recipientPhone: data.recipientPhone || dest.phone || 'Not available',
    recipientEmail: data.recipientEmail || dest.email || 'Not available',
    recipientCity: data.recipientCity || dest.city || 'Not available',
    cargoItems: Array.isArray(data.cargoItems)
      ? data.cargoItems.map((item: any, idx: number) => ({
          id: String(item.id || idx + 1),
          name: item.name || 'Consignment Item',
          sku: item.sku || `SKU-${idx + 1}`,
          quantity: Number(item.quantity || 1),
          weightKg: Number(item.weightKg || 0),
          description: item.description || item.name || '',
          dimensions: item.dimensions || 'Standard Carton',
          isHazardous: Boolean(item.hazardous || item.isHazardous),
        }))
      : [],
    trackingEvents: Array.isArray(data.trackingEvents)
      ? data.trackingEvents.map((ev: any) => ({
          id: ev.id,
          status: ev.status,
          title: ev.title,
          description: ev.description,
          location: ev.location,
          timestamp: ev.timestamp,
          latitude: ev.latitude,
          longitude: ev.longitude,
        }))
      : [],
    pickupHub: {
      id: 1,
      name: pickup.facilityName || 'Origin Warehouse',
      code: 'WH-ORIG',
      city: pickup.city || 'Warehouse City',
      address: pickup.address || 'Warehouse Dock',
      dockNumber: pickup.dockBay || 'Bay-1',
      contactName: pickup.contactPerson || 'Dispatcher',
      contactPhone: pickup.contactPhone || '',
      coordinates: (pickup.coordinates as [number, number]) || [12.9716, 77.5946],
    },
    destination: {
      customerName: dest.customerName || data.recipientName || 'Customer',
      companyName: dest.companyName,
      phone: dest.phone || data.recipientPhone || '',
      address: dest.address || 'Customer Delivery Address',
      city: dest.city || data.recipientCity || '',
      postalCode: dest.postalCode || '',
      deliveryNotes: dest.deliveryNotes || dest.specialInstructions || 'Customer Doorstep Delivery',
      coordinates: (dest.coordinates as [number, number]) || [22.5726, 88.3639],
    },
    pickupLocation: {
      facilityName: pickup.facilityName || 'Origin Warehouse',
      address: pickup.address || 'Warehouse Dock Address',
      city: pickup.city || '',
      dockBay: pickup.dockBay || 'Bay-1',
      contactPerson: pickup.contactPerson || 'Warehouse Dispatcher',
      contactPhone: pickup.contactPhone || '',
      specialInstructions: pickup.specialInstructions || 'Verify seals and paperwork before departure',
    },
    deliveryLocation: {
      facilityName: dest.facilityName || `${dest.customerName || data.recipientName || 'Customer'} Location`,
      address: dest.address || 'Customer Delivery Address',
      city: dest.city || data.recipientCity || '',
      specialInstructions: dest.specialInstructions || 'Standard gate delivery / direct handover',
    },
    distanceKm: Number(data.distanceKm || 0),
    estimatedDurationMins: Number(data.estimatedDurationMins || 60),
    currentLatitude: data.currentLatitude != null ? Number(data.currentLatitude) : undefined,
    currentLongitude: data.currentLongitude != null ? Number(data.currentLongitude) : undefined,
    currentLocationName: data.currentLocationName,
    lastLocationUpdatedAt: data.lastLocationUpdatedAt,
    pickupChecklistCompleted: Boolean(data.pickupChecklistCompleted),
    deliveryChecklistCompleted: Boolean(data.deliveryChecklistCompleted || data.proofOfDelivery),
    proofOfDelivery: data.proofOfDelivery
      ? {
          deliveryId: String(data.proofOfDelivery.shipmentId || data.id || ''),
          recipientName: data.proofOfDelivery.recipientName,
          receivedBy: data.proofOfDelivery.receivedBy,
          signatureData: data.proofOfDelivery.signatureData,
          signatureBase64: data.proofOfDelivery.signatureBase64 || data.proofOfDelivery.signatureData,
          photoUrl: data.proofOfDelivery.photoUrl || data.proofOfDelivery.photoData,
          notes: data.proofOfDelivery.deliveryNotes || data.proofOfDelivery.notes,
          deliveredAt: data.proofOfDelivery.deliveredAt,
          timestamp: data.proofOfDelivery.deliveredAt,
        }
      : undefined,
  };
}

export const driverPortalService = {
  // ── Profile & Status ──
  async getProfile(): Promise<DriverProfileData> {
    const response = await api.get('/driver/me');
    const data = response.data?.data || response.data;
    return {
      id: String(data.id || ''),
      driverId: data.driverId || (data.id ? `DRV-${String(data.id).padStart(3, '0')}` : 'Not available'),
      driverCode: data.driverCode || data.driverId || 'Not available',
      fullName: data.fullName || data.name || 'Not available',
      name: data.fullName || data.name || 'Not available',
      email: data.email || 'Not available',
      phone: data.phone || 'Not available',
      licenseNumber: data.licenseNumber || 'Not available',
      licenseExpiry: data.licenseExpiry || 'Not available',
      address: data.address || 'Not available',
      status: (data.status as DriverStatus) || 'AVAILABLE',
      assignedWarehouseName: data.assignedWarehouseName || 'Not available',
      assignedWarehouseCode: data.assignedWarehouseCode || 'Not available',
      assignedWarehouseId: String(data.assignedWarehouseId || ''),
      assignedHub: data.assignedHub || data.assignedWarehouseName || 'Not available',
      assignedVehicleId: String(data.assignedVehicleId || ''),
      assignedVehicleCode: data.assignedVehicleCode || 'Not available',
      assignedVehiclePlate: data.assignedVehiclePlate || 'Not available',
      assignedVehicleModel: data.assignedVehicleModel || 'Not available',
      totalTripsCompleted: Number(data.totalTripsCompleted || 0),
      totalDeliveriesCompleted: Number(data.totalDeliveriesCompleted || 0),
      onTimeRatePercentage: Number(data.onTimeRatePercentage || 98.6),
      onTimeRatePercent: Number(data.onTimeRatePercentage || 98.6),
      safetyRating: Number(data.safetyRating || 4.9),
      rating: Number(data.safetyRating || 4.9),
      shiftStartedAt: data.shiftStartedAt || 'Active',
    };
  },

  // ── Dashboard KPIs ──
  async getDashboardKpis(): Promise<DriverDashboardKpis> {
    const response = await api.get('/driver/dashboard');
    const data = response.data?.data || response.data;
    return {
      todaysDeliveries: Number(data.todaysDeliveries ?? data.assignedToday ?? 0),
      assignedToday: Number(data.assignedToday ?? data.todaysDeliveries ?? 0),
      completedDeliveries: Number(data.completedDeliveries ?? data.completedToday ?? 0),
      completedToday: Number(data.completedToday ?? data.completedDeliveries ?? 0),
      pendingDeliveries: Number(data.pendingDeliveries ?? data.pendingToday ?? 0),
      pendingToday: Number(data.pendingToday ?? data.pendingDeliveries ?? 0),
      distanceKmToday: data.distanceKmToday != null ? Number(data.distanceKmToday) : 0,
      distanceCoveredTodayKm: data.distanceCoveredTodayKm != null ? Number(data.distanceCoveredTodayKm) : (data.distanceKmToday != null ? Number(data.distanceKmToday) : 0),
      onTimeDeliveries: Number(data.onTimeDeliveries || 98.6),
      driverStatus: (data.driverStatus as DriverStatus) || 'AVAILABLE',
    };
  },

  // ── Deliveries ──
  async getDeliveries(status?: string): Promise<DeliveryAssignment[]> {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await api.get('/driver/deliveries', { params });
    const payload = response.data?.data !== undefined ? response.data.data : response.data;
    const list = Array.isArray(payload) ? payload : [];
    return list.map(mapDelivery).filter(Boolean);
  },

  async getDeliveryById(id: string): Promise<DeliveryAssignment | null> {
    if (!id || !String(id).trim()) return null;
    try {
      const response = await api.get(`/driver/deliveries/${encodeURIComponent(String(id).trim())}`);
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch {
      return null;
    }
  },

  async getCurrentDelivery(): Promise<DeliveryAssignment | null> {
    try {
      const response = await api.get('/driver/deliveries/active');
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch {
      return null;
    }
  },

  async getDeliveryRoute(id?: string | number): Promise<DriverRouteData | null> {
    try {
      const endpoint = id && String(id).trim() && String(id).trim() !== 'active'
        ? `/driver/deliveries/${encodeURIComponent(String(id).trim())}/route`
        : '/driver/deliveries/active/route';
      const response = await api.get(endpoint);
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return data as DriverRouteData;
    } catch (err) {
      console.warn('Failed to load dynamic delivery route:', err);
      return null;
    }
  },

  // ── Vehicle ──
  async getVehicle(): Promise<VehicleTelemetry | null> {
    try {
      const response = await api.get('/driver/vehicle');
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return {
        id: String(data.id || ''),
        vehicleNumber: data.vehicleNumber || data.vehicleCode || 'Not available',
        vehicleCode: data.vehicleCode || data.vehicleNumber || 'Not available',
        plateNumber: data.plateNumber || data.registrationNumber || data.licensePlate || 'Not available',
        licensePlate: data.licensePlate || data.registrationNumber || data.plateNumber || 'Not available',
        registrationNumber: data.registrationNumber || data.licensePlate || data.plateNumber || 'Not available',
        manufacturer: data.manufacturer || 'PrimeRoute Fleet',
        model: data.model || 'Not available',
        type: data.type || data.vehicleType || 'Not available',
        vehicleType: data.vehicleType || data.type || 'Not available',
        capacityTons: Number(data.capacityTons ?? data.capacity ?? 0),
        capacityUnit: data.capacityUnit || 'TONS',
        fuelPercentage: Number(data.fuelLevelPercent ?? data.fuelPercentage ?? 78),
        fuelLevelPercent: Number(data.fuelLevelPercent ?? data.fuelPercentage ?? 78),
        odometerKm: Number(data.odometerKm ?? 50600),
        engineTemperatureC: Number(data.engineTempCelsius ?? data.engineTemperatureC ?? 88),
        engineTempCelsius: Number(data.engineTempCelsius ?? data.engineTemperatureC ?? 88),
        tirePressurePsi: Number(data.tirePressurePsi ?? 35),
        batteryVoltage: 24.2,
        status: data.status || 'ASSIGNED',
        lastInspectionDate: data.lastInspectionDate || 'Not available',
        insuranceExpiry: data.insuranceExpiry || 'Not available',
        pucExpiry: data.pucExpiry || 'Not available',
        registrationExpiry: data.registrationExpiry || 'Not available',
        warehouseName: data.assignedWarehouseName || data.warehouseName || 'Warehouse Hub',
        assignedWarehouseName: data.assignedWarehouseName || data.warehouseName || 'Warehouse Hub',
        assignedWarehouseCode: data.assignedWarehouseCode || 'WH-001',
        currentLocation: data.currentLocation || data.assignedWarehouseName || 'In Transit',
      };
    } catch {
      return null;
    }
  },

  // ── Vehicle Inspections ──
  async getInspections(): Promise<VehicleInspectionReport[]> {
    return getStored<VehicleInspectionReport[]>(STORAGE_KEYS.INSPECTIONS, []);
  },

  async submitInspection(report: Omit<VehicleInspectionReport, 'id' | 'timestamp'>): Promise<VehicleInspectionReport> {
    const inspections = await this.getInspections();
    const newReport: VehicleInspectionReport = {
      ...report,
      id: `INSP-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    const updated = [newReport, ...inspections];
    setStored(STORAGE_KEYS.INSPECTIONS, updated);
    return newReport;
  },

  // ── Notifications ──
  async getNotifications(): Promise<DriverNotificationItem[]> {
    try {
      const response = await api.get('/driver/notifications');
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!Array.isArray(data)) return [];
      return data.map((n: any) => ({
        id: String(n.id),
        title: n.title || 'Notification',
        message: n.message || '',
        type: n.type || 'SYSTEM',
        timestamp: n.createdAt || new Date().toISOString(),
        createdAt: n.createdAt,
        read: Boolean(n.read || n.isRead),
      }));
    } catch (err) {
      console.warn('Failed to load driver notifications:', err);
      return [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/driver/notifications/unread-count');
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      return Number(data?.unreadCount || 0);
    } catch {
      return 0;
    }
  },

  async markNotificationRead(id: string | number): Promise<void> {
    if (!id) return;
    try {
      await api.patch(`/driver/notifications/${encodeURIComponent(String(id).trim())}/read`);
      window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await api.patch('/driver/notifications/read-all');
      window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  },

  async deleteNotification(id: string | number): Promise<void> {
    if (!id) return;
    try {
      await api.delete(`/driver/notifications/${encodeURIComponent(String(id).trim())}`);
      window.dispatchEvent(new CustomEvent('driver-notifications:updated'));
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  },

  // ── Support Tickets ──
  async getTickets(): Promise<DriverSupportTicket[]> {
    try {
      const response = await api.get('/customer/support/tickets');
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!Array.isArray(data)) return [];
      return data.map((t: any) => ({
        id: String(t.id),
        ticketCode: t.ticketNumber || (t.id ? `PR-TKT-${t.id}` : 'Ticket'),
        ticketNumber: t.ticketNumber || (t.id ? `PR-TKT-${t.id}` : 'Ticket'),
        category: t.category || 'GENERAL',
        priority: t.priority || 'MEDIUM',
        subject: t.subject || 'Support Ticket',
        description: t.description || '',
        status: t.status || 'OPEN',
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        customerPhone: t.customerPhone,
      }));
    } catch (err) {
      console.warn('Failed to load driver support tickets:', err);
      return [];
    }
  },

  async createTicket(ticket: {
    category: string;
    priority: string;
    subject: string;
    description: string;
  }): Promise<DriverSupportTicket> {
    const response = await api.post('/customer/support/tickets', {
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      description: ticket.description,
    });
    const data = response.data?.data || response.data;
    return {
      id: String(data.id),
      ticketCode: data.ticketNumber || `PR-TKT-${data.id}`,
      ticketNumber: data.ticketNumber || `PR-TKT-${data.id}`,
      category: data.category || ticket.category,
      priority: data.priority || ticket.priority,
      subject: data.subject || ticket.subject,
      description: data.description || ticket.description,
      status: data.status || 'OPEN',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
    };
  },

  async getSupportContact(): Promise<DriverSupportContact> {
    try {
      const response = await api.get('/customer/support/contact');
      const data = response.data?.data || response.data;
      return {
        supportPhone: data?.supportPhone || '+91 80 4567 8900',
        supportEmail: data?.supportEmail || 'support@primeroute.com',
        supportHours: data?.supportHours || '24/7',
        availability: data?.availability || '24/7 Dedicated Logistics Assistance',
        description: data?.description || 'PrimeRoute customer care & freight escalation hotline.',
      };
    } catch {
      return {
        supportPhone: '+91 80 4567 8900',
        supportEmail: 'support@primeroute.com',
        supportHours: '24/7',
        availability: '24/7 Dedicated Logistics Assistance',
        description: 'PrimeRoute customer care & freight escalation hotline.',
      };
    }
  },

  // ── Operational Lifecycle Transitions ──
  async markOutForDelivery(deliveryId: string): Promise<DeliveryAssignment | null> {
    if (!deliveryId || !String(deliveryId).trim()) {
      throw new Error('Valid Delivery Assignment ID is required to mark consignment out for delivery.');
    }
    const cleanId = String(deliveryId).trim();
    try {
      const response = await api.post(`/driver/deliveries/${cleanId}/out-for-delivery`);
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch (err: any) {
      console.error('Failed to mark out for delivery:', err);
      throw err;
    }
  },

  async startTrip(deliveryId: string): Promise<DeliveryAssignment | null> {
    if (!deliveryId || !String(deliveryId).trim()) {
      throw new Error('Valid Delivery Assignment ID is required to start delivery trip.');
    }
    const cleanId = String(deliveryId).trim();
    try {
      const response = await api.post(`/driver/deliveries/${cleanId}/start-trip`);
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch (err: any) {
      console.error('Failed to start delivery trip:', err);
      throw err;
    }
  },

  async updateDeliveryStatus(deliveryId: string, nextStatus: DeliveryStatus): Promise<DeliveryAssignment | null> {
    if (!deliveryId || !String(deliveryId).trim()) {
      throw new Error('Valid Delivery Assignment ID is required to update delivery status.');
    }
    const cleanId = String(deliveryId).trim();
    if (nextStatus === 'OUT_FOR_DELIVERY') {
      return this.markOutForDelivery(cleanId);
    }
    if (nextStatus === 'IN_TRANSIT') {
      return this.startTrip(cleanId);
    }
    try {
      const response = await api.post(`/driver/deliveries/${cleanId}/status`, { status: nextStatus });
      const data = response.data?.data !== undefined ? response.data.data : response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch (err: any) {
      console.error('Failed to update delivery status:', err);
      throw err;
    }
  },

  async completePickup(deliveryId: string, notes?: string): Promise<DeliveryAssignment | null> {
    if (!deliveryId || !String(deliveryId).trim()) {
      throw new Error('Valid Delivery Assignment ID is required to complete pickup.');
    }
    return this.startTrip(deliveryId);
  },

  async submitProofOfDelivery(deliveryId: string, proof: ProofOfDeliveryData): Promise<DeliveryAssignment | null> {
    try {
      const response = await api.post(`/driver/deliveries/${deliveryId}/complete`, {
        recipientName: proof.recipientName || proof.receivedBy,
        receivedBy: proof.receivedBy || proof.recipientName,
        signatureData: proof.signatureData || proof.signatureBase64,
        signatureBase64: proof.signatureBase64 || proof.signatureData,
        photoData: proof.photoUrl,
        photoUrl: proof.photoUrl,
        deliveryNotes: proof.notes,
        notes: proof.notes,
      });
      const data = response.data?.data || response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch (err: any) {
      console.error('Failed to complete delivery with ePOD:', err);
      throw err;
    }
  },

  // ── GPS Telemetry ──
  async sendLocationUpdate(coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    locationName?: string;
    shipmentId?: string | number;
  }): Promise<DeliveryAssignment | null> {
    try {
      const payload: any = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        heading: coords.heading,
        speed: coords.speed,
        locationName: coords.locationName,
      };
      if (coords.shipmentId) {
        payload.shipmentId = Number(coords.shipmentId);
      }
      const response = await api.post('/driver/location', payload);
      const data = response.data?.data || response.data;
      if (!data) return null;
      return mapDelivery(data);
    } catch (err: any) {
      console.error('Failed to broadcast GPS telemetry:', err);
      throw err;
    }
  },
};

