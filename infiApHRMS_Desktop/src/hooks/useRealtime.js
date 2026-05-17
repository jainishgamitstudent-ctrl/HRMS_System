import { useEffect, useRef, useCallback } from 'react';
import { subscribeToEntityEvents, unsubscribeFromEntityEvents, connectSocket } from '../services/socket';

/**
 * Subscribe to real-time entity events.
 * Automatically connects socket on mount and cleans up on unmount.
 *
 * @param {Array<{entityType: string, onEvent: (action: string, payload: any) => void}>} configs
 *
 * Example:
 * useRealtime([
 *   { entityType: 'leave', onEvent: (action, payload) => console.log('leave', action, payload) },
 *   { entityType: 'wfh', onEvent: (action, payload) => console.log('wfh', action, payload) },
 * ]);
 */
export function useRealtime(configs) {
  const configsRef = useRef(configs);
  configsRef.current = configs;

  const wrappedCallbacks = useRef(new Map());

  useEffect(() => {
    let isActive = true;

    const setup = async () => {
      await connectSocket();
      if (!isActive) return;

      configsRef.current.forEach((config) => {
        const wrappedCallback = (action, payload) => {
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
 */
export function useRealtimeLeaves(onChange) {
  useRealtime([{ entityType: 'leave', onEvent: onChange }]);
}

/**
 * Hook specifically for WFH-related real-time updates.
 */
export function useRealtimeWFH(onChange) {
  useRealtime([{ entityType: 'wfh', onEvent: onChange }]);
}

/**
 * Hook specifically for request room real-time updates.
 */
export function useRealtimeRequestRooms(onChange) {
  useRealtime([{ entityType: 'requestRoom', onEvent: onChange }]);
}

/**
 * Hook specifically for employee profile real-time updates.
 */
export function useRealtimeEmployee(onChange) {
  useRealtime([{ entityType: 'employee', onEvent: onChange }]);
}

/**
 * Hook that subscribes to all major HR entity events at once.
 */
export function useRealtimeHR(onChange) {
  const handleEvent = useCallback(
    (entityType) => (action, payload) => {
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
