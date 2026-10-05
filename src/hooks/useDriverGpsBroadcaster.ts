import { useEffect, useRef, useState, useCallback } from 'react';
import { driverPortalService } from '../services/driverPortalService';
import type { DeliveryAssignment } from '../types/driverPortal';

export type GpsPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable';

export interface DriverGpsState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  lastBroadcastTime: Date | null;
  isBroadcasting: boolean;
  isWatching: boolean;
  permissionStatus: GpsPermissionStatus;
  error: string | null;
  broadcastCount: number;
}

export function useDriverGpsBroadcaster(
  delivery: DeliveryAssignment | null,
  options?: {
    intervalMs?: number;
    enabled?: boolean;
    onBroadcastSuccess?: (updated: DeliveryAssignment) => void;
  }
) {
  const { intervalMs = 15000, enabled = true, onBroadcastSuccess } = options || {};

  const onBroadcastSuccessRef = useRef(onBroadcastSuccess);
  onBroadcastSuccessRef.current = onBroadcastSuccess;

  const deliveryRef = useRef(delivery);
  deliveryRef.current = delivery;

  const [state, setState] = useState<DriverGpsState>({
    latitude: delivery?.currentLatitude ?? null,
    longitude: delivery?.currentLongitude ?? null,
    accuracy: null,
    speed: null,
    heading: null,
    lastBroadcastTime: delivery?.lastLocationUpdatedAt ? new Date(delivery.lastLocationUpdatedAt) : null,
    isBroadcasting: false,
    isWatching: false,
    permissionStatus: typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'prompt' : 'unavailable',
    error: null,
    broadcastCount: 0,
  });

  const latestCoordsRef = useRef<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  } | null>(
    delivery?.currentLatitude && delivery?.currentLongitude
      ? { latitude: delivery.currentLatitude, longitude: delivery.currentLongitude }
      : null
  );

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isBroadcastingRef = useRef(false);

  // Monitor browser permission query if available
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) return;

    let isMounted = true;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((perm) => {
        if (!isMounted) return;
        const status = perm.state as GpsPermissionStatus;
        setState((prev) => ({
          ...prev,
          permissionStatus: status,
          error: status === 'denied' ? 'Location permission is required to broadcast live GPS.' : prev.error,
        }));

        perm.onchange = () => {
          if (!isMounted) return;
          const updated = perm.state as GpsPermissionStatus;
          setState((prev) => ({
            ...prev,
            permissionStatus: updated,
            error: updated === 'denied' ? 'Location permission is required to broadcast live GPS.' : (updated === 'granted' ? null : prev.error),
          }));
        };
      })
      .catch(() => {
        // Permissions API fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Stable broadcast function to backend
  const broadcastLocation = useCallback(
    async (forcedCoords?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
    }) => {
      const currentDelivery = deliveryRef.current;
      const coords = forcedCoords || latestCoordsRef.current;
      if (!coords || !currentDelivery?.id) return;

      // Active shipment rule: Only broadcast for in-flight deliveries
      if (currentDelivery.status !== 'IN_TRANSIT' && currentDelivery.status !== 'OUT_FOR_DELIVERY') {
        return;
      }

      if (isBroadcastingRef.current) return;
      isBroadcastingRef.current = true;

      setState((prev) => (prev.isBroadcasting ? prev : { ...prev, isBroadcasting: true, error: null }));

      try {
        const updated = await driverPortalService.sendLocationUpdate({
          shipmentId: currentDelivery.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed,
          heading: coords.heading,
        });

        const now = new Date();
        setState((prev) => ({
          ...prev,
          isBroadcasting: false,
          lastBroadcastTime: now,
          broadcastCount: prev.broadcastCount + 1,
          error: null,
        }));

        if (updated && onBroadcastSuccessRef.current) {
          onBroadcastSuccessRef.current(updated);
        }
      } catch (err: any) {
        console.warn('GPS telemetry broadcast warning:', err);
        const errMsg = err?.response?.data?.message || 'Failed to transmit GPS telemetry';
        setState((prev) => ({
          ...prev,
          isBroadcasting: false,
          error: errMsg,
        }));
      } finally {
        isBroadcastingRef.current = false;
      }
    },
    []
  );

  const deliveryId = delivery?.id;
  const deliveryStatus = delivery?.status;

  const requestPermission = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        permissionStatus: 'unavailable',
        error: 'Geolocation is not supported by this browser/device.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        latestCoordsRef.current = {
          latitude,
          longitude,
          accuracy: accuracy ?? undefined,
          speed: speed != null ? Math.round(speed * 3.6) : undefined,
          heading: heading != null ? Math.round(heading) : undefined,
        };

        setState((prev) => ({
          ...prev,
          latitude,
          longitude,
          accuracy,
          speed: speed != null ? Math.round(speed * 3.6) : null,
          heading: heading != null ? Math.round(heading) : null,
          permissionStatus: 'granted',
          error: null,
        }));

        broadcastLocation({
          latitude,
          longitude,
          accuracy,
          speed: speed != null ? Math.round(speed * 3.6) : undefined,
          heading: heading != null ? Math.round(heading) : undefined,
        });
      },
      (err) => {
        let msg = 'Failed to acquire GPS coordinates.';
        let permStatus: GpsPermissionStatus = 'prompt';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission is required to broadcast live GPS.';
          permStatus = 'denied';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Trying satellite lock...';
        } else if (err.code === err.TIMEOUT) {
          msg = 'GPS acquisition timed out. Retrying...';
        }
        setState((prev) => ({
          ...prev,
          permissionStatus: permStatus,
          error: msg,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, [broadcastLocation]);

  // Setup geolocation watcher
  useEffect(() => {
    if (!enabled || !deliveryId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => (prev.isWatching ? { ...prev, isWatching: false } : prev));
      return;
    }

    const isActive = deliveryStatus === 'IN_TRANSIT' || deliveryStatus === 'OUT_FOR_DELIVERY';
    if (!isActive) {
      // Stopped when delivered or not active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => (prev.isWatching ? { ...prev, isWatching: false } : prev));
      return;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        permissionStatus: 'unavailable',
        error: 'Geolocation is not supported by this browser/device.',
        isWatching: false,
      }));
      return;
    }

    setState((prev) => (prev.isWatching ? prev : { ...prev, isWatching: true, error: null }));

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed, heading } = pos.coords;
      const speedKmH = speed != null ? Math.round(speed * 3.6) : null;
      const headingDeg = heading != null ? Math.round(heading) : null;

      latestCoordsRef.current = {
        latitude,
        longitude,
        accuracy: accuracy ?? undefined,
        speed: speedKmH ?? undefined,
        heading: headingDeg ?? undefined,
      };

      setState((prev) => ({
        ...prev,
        latitude,
        longitude,
        accuracy,
        speed: speedKmH,
        heading: headingDeg,
        permissionStatus: 'granted',
        error: null,
      }));
    };

    const handleError = (err: GeolocationPositionError) => {
      let msg = 'Failed to acquire GPS coordinates.';
      let permStatus: GpsPermissionStatus = 'prompt';
      if (err.code === err.PERMISSION_DENIED) {
        msg = 'Location permission is required to broadcast live GPS.';
        permStatus = 'denied';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = 'GPS signal unavailable. Trying satellite lock...';
      } else if (err.code === err.TIMEOUT) {
        msg = 'GPS acquisition timed out. Retrying...';
      }
      setState((prev) => ({
        ...prev,
        permissionStatus: permStatus,
        error: msg,
      }));
    };

    // Initial immediate position fetch & broadcast
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSuccess(pos);
        broadcastLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed != null ? Math.round(pos.coords.speed * 3.6) : undefined,
          heading: pos.coords.heading != null ? Math.round(pos.coords.heading) : undefined,
        });
      },
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Continuous watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // Periodic telemetry broadcaster timer
    timerRef.current = setInterval(() => {
      broadcastLocation();
    }, intervalMs);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, deliveryId, deliveryStatus, intervalMs, broadcastLocation]);

  return {
    ...state,
    triggerManualBroadcast: () => broadcastLocation(),
    requestPermission,
  };
}

