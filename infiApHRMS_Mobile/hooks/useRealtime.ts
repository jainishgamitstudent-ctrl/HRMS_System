import { useEffect, useRef, useCallback } from 'react';
import { subscribeToEntityEvents, unsubscribeFromEntityEvents, connectSocket } from '../services/socket';

type RealtimeCallback = (action: string, payload: any) => void;

type EntityConfig = {
  entityType: string;
  onEvent: RealtimeCallback;
};

/**
 * Subscribe to real-time entity events.
 * Automatically connects socket on mount and cleans up on unmount.
 *
 * @param configs Array of entity configurations to listen to
 *
 * Example:
 * useRealtime([
 *   { entityType: 'leave', onEvent: (action, payload) => console.log('leave', action, payload) },
 *   { entityType: 'wfh', onEvent: (action, payload) => console.log('wfh', action, payload) },
 * ]);
 */
export function useRealtime(configs: EntityConfig[]) {
  const configsRef = useRef(configs);
  configsRef.current = configs;

  const wrappedCallbacks = useRef(new Map<string, RealtimeCallback>());

  useEffect(() => {
    let isActive = true;

    const setup = async () => {
      await connectSocket();
      if (!isActive) return;

      configsRef.current.forEach((config) => {
        const wrappedCallback: RealtimeCallback = (action, payload) => {
          config.onEvent(action, payload);
        };
        wrappedCallbacks.current.set(config.entityType, wrappedCallback);
        subscribeToEntityEvents(config.entityType, wrappedCallback);
      });
    };

    setup();

    return () => {
      isActive = false;
      configsRef.current.forEach((config) => {
        const cb = wrappedCallbacks.current.get(config.entityType);
        if (cb) {
          unsubscribeFromEntityEvents(config.entityType, cb);
          wrappedCallbacks.current.delete(config.entityType);
        }
      });
    };
  }, []);
}

/**
 * Hook specifically for leave-related real-time updates.
 * Provides a callback when leave data changes.
 */
export function useRealtimeLeaves(onChange: (action: string, leave: any) => void) {
  useRealtime([{ entityType: 'leave', onEvent: onChange }]);
}

/**
 * Hook specifically for WFH-related real-time updates.
 */
export function useRealtimeWFH(onChange: (action: string, wfh: any) => void) {
  useRealtime([{ entityType: 'wfh', onEvent: onChange }]);
}

/**
 * Hook specifically for request room real-time updates.
 */
export function useRealtimeRequestRooms(onChange: (action: string, room: any) => void) {
  useRealtime([{ entityType: 'requestRoom', onEvent: onChange }]);
}

/**
 * Hook specifically for employee profile real-time updates.
 */
export function useRealtimeEmployee(onChange: (action: string, employee: any) => void) {
  useRealtime([{ entityType: 'employee', onEvent: onChange }]);
}

/**
 * Hook that subscribes to all major HR entity events at once.
 */
export function useRealtimeHR(onChange: (entityType: string, action: string, payload: any) => void) {
  const handleEvent = useCallback(
    (entityType: string) => (action: string, payload: any) => {
      onChange(entityType, action, payload);
    },
    [onChange]
  );

  useRealtime([
    { entityType: 'leave', onEvent: handleEvent('leave') },
    { entityType: 'wfh', onEvent: handleEvent('wfh') },
    { entityType: 'requestRoom', onEvent: handleEvent('requestRoom') },
    { entityType: 'employee', onEvent: handleEvent('employee') },
    { entityType: 'wfhPermission', onEvent: handleEvent('wfhPermission') },
  ]);
}
