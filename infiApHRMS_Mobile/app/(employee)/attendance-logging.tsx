import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { submitEmployeePunch } from '../../services/auth';
import { getExactCurrentLocation, formatExactLocationLabel } from '../../utils/location';

import { useAppTheme } from '@/context/ThemeContext';
const WORK_MODES = [
  { id: 'office', label: 'Office', icon: 'business-outline', activeIcon: 'business' },
  { id: 'wfh', label: 'WFH', icon: 'home-outline', activeIcon: 'home' },
  { id: 'meeting', label: 'Meeting', icon: 'people-outline', activeIcon: 'people' },
  { id: 'offsite', label: 'Offsite', icon: 'location-outline', activeIcon: 'location' },
];

type CurrentLocation = {
  latitude: number;
  longitude: number;
  addressLine: string;
  localityLine: string;
};

const DEFAULT_MAP_DELTA = 0.005;
const MIN_MAP_DELTA = 0.001;
const MAX_MAP_DELTA = 0.08;

const createLocationRegion = (location: Pick<CurrentLocation, 'latitude' | 'longitude'>): Region => ({
  latitude: location.latitude,
  longitude: location.longitude,
  latitudeDelta: DEFAULT_MAP_DELTA,
  longitudeDelta: DEFAULT_MAP_DELTA,
});

export default function AttendanceLogging() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => AttendanceLoggingStyles(colors), [colors]);
  const mapRef = useRef<MapView | null>(null);
  const [selectedMode, setSelectedMode] = useState('office');
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [followLocation, setFollowLocation] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  // Animations
  const logoScale = useSharedValue(0);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Logo entrance with optimized spring
    logoScale.value = withSpring(1, { damping: 30, mass: 1, overshootClamping: false });

    // Ripple effect for map marker - smoother and more efficient
    rippleScale.value = withRepeat(withTiming(2.5, { duration: 1800 }), -1, false);
    rippleOpacity.value = withRepeat(withTiming(0, { duration: 1800 }), -1, false);
  }, [logoScale, rippleOpacity, rippleScale]);

  useEffect(() => {
    let isActive = true;

    const loadCurrentLocation = async () => {
      try {
        setLocationLoading(true);
        setLocationError('');

        const location = await getExactCurrentLocation();

        if (!isActive) {
          return;
        }

        const nextLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          addressLine: formatExactLocationLabel(location),
          localityLine: location.localityLabel,
        };

        setCurrentLocation(nextLocation);
        setMapRegion((previousRegion) => {
          const nextRegion = previousRegion
            ? {
              ...previousRegion,
              latitude: nextLocation.latitude,
              longitude: nextLocation.longitude,
            }
            : createLocationRegion(nextLocation);

          if (followLocation) {
            mapRef.current?.animateToRegion(nextRegion, 550);
          }

          return followLocation || !previousRegion ? nextRegion : previousRegion;
        });
      } catch (error: any) {
        if (isActive) {
          setCurrentLocation(null);
          const errorMsg = error?.message || 'Unable to fetch the current location.';
          setLocationError(errorMsg);
        }
      } finally {
        if (isActive) {
          setLocationLoading(false);
        }
      }
    };

    loadCurrentLocation();

    // Set up automatic location refresh every 30 seconds for live tracking
    const locationRefreshInterval = setInterval(() => {
      if (isActive) {
        loadCurrentLocation();
      }
    }, 30000);

    return () => {
      isActive = false;
      clearInterval(locationRefreshInterval);
    };
  }, [followLocation]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getExactCurrentLocation();
      const nextLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        addressLine: formatExactLocationLabel(location),
        localityLine: location.localityLabel,
      };
      const nextRegion = mapRegion
        ? { ...mapRegion, latitude: nextLocation.latitude, longitude: nextLocation.longitude }
        : createLocationRegion(nextLocation);

      setCurrentLocation(nextLocation);
      setMapRegion(nextRegion);
      setFollowLocation(true);
      mapRef.current?.animateToRegion(nextRegion, 550);
      setLocationError('');
    } catch (error: any) {
      const errorMsg = error?.message || 'Unable to fetch the current location.';
      setLocationError(errorMsg);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRecenterMap = () => {
    if (!currentLocation) {
      return;
    }

    const nextRegion = mapRegion
      ? { ...mapRegion, latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      : createLocationRegion(currentLocation);

    setFollowLocation(true);
    setMapRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 450);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!mapRegion) {
      return;
    }

    const zoomFactor = direction === 'in' ? 0.55 : 1.65;
    const nextRegion = {
      ...mapRegion,
      latitudeDelta: Math.max(MIN_MAP_DELTA, Math.min(MAX_MAP_DELTA, mapRegion.latitudeDelta * zoomFactor)),
      longitudeDelta: Math.max(MIN_MAP_DELTA, Math.min(MAX_MAP_DELTA, mapRegion.longitudeDelta * zoomFactor)),
    };

    setMapRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 250);
  };

  const cycleMapType = () => {
    setMapType((previousType) => (
      previousType === 'standard' ? 'satellite' : previousType === 'satellite' ? 'hybrid' : 'standard'
    ));
  };

  const handleConfirm = async () => {
    if (!currentLocation) {
      setLocationError('Location is required to check-in.');
      return;
    }

    setIsConfirming(true);
    setLocationError(''); // Clear any previous errors

    try {
      const response = await submitEmployeePunch({
        PunchType: 1,
        Latitude: currentLocation.latitude,
        Longitude: currentLocation.longitude,
        WorkMode: selectedMode === 'wfh' ? 2 : selectedMode === 'meeting' ? 3 : selectedMode === 'offsite' ? 4 : 1,
      });

      // Check if response indicates success
      if (response && (response.status === 'Success' || response.status === 'success' || response.PunchTime)) {
        router.back();
      } else {
        setLocationError(response?.message || 'Unable to submit the check-in. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unable to submit the check-in. Please check your internet connection and try again.';
      setLocationError(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header
        title="Attendance Logging"
        showBack={true}
        rightElement={
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={handleRefreshLocation}
            disabled={locationLoading}
          >
            <Ionicons
              name={locationLoading ? "sync" : "refresh"}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Branding Section */}
          <Animated.View style={[styles.branding, logoAnimatedStyle]}>
            <Text style={styles.sessionSub}>Please verify your location to proceed.</Text>
          </Animated.View>

          {/* Work Mode Selection */}
          <View style={styles.modeSection}>
            <Text style={styles.sectionLabel}>WORK MODE</Text>
            <View style={styles.modeGrid}>
              {WORK_MODES.map((mode) => {
                const isActive = selectedMode === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeCard, isActive && styles.modeCardActive]}
                    onPress={() => setSelectedMode(mode.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={(isActive ? mode.activeIcon : mode.icon) as any}
                      size={24}
                      color={isActive ? '#fff' : '#64748b'}
                    />
                    <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            {currentLocation && mapRegion ? (
              <MapView
                ref={mapRef}
                style={styles.mapImage}
                initialRegion={mapRegion}
                mapType={mapType}
                onPanDrag={() => setFollowLocation(false)}
                onRegionChangeComplete={(region) => setMapRegion(region)}
                showsUserLocation={true}
                showsMyLocationButton={true}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="You are here"
                  description={currentLocation.addressLine}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Animated.View style={[styles.mapRipple, rippleAnimatedStyle]} />
                    <View style={styles.mapMarker} />
                  </View>
                </Marker>
              </MapView>
            ) : (
              <View style={[styles.mapImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }]}>
                {locationLoading ? (
                  <ActivityIndicator size="large" color="#4f46e5" />
                ) : (
                  <Ionicons name="map-outline" size={48} color={colors.textMuted} />
                )}
              </View>
            )}
            {currentLocation && mapRegion ? (
              <>
                <View style={styles.mapTopControls} pointerEvents="box-none">
                  <TouchableOpacity
                    style={[styles.mapPillButton, followLocation && styles.mapPillButtonActive]}
                    onPress={() => (followLocation ? setFollowLocation(false) : handleRecenterMap())}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="navigate" size={15} color={followLocation ? '#fff' : '#1e293b'} />
                    <Text style={[styles.mapPillText, followLocation && styles.mapPillTextActive]}>
                      {followLocation ? 'Live' : 'Pan'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.mapIconButton} onPress={cycleMapType} activeOpacity={0.85}>
                    <Ionicons name="layers-outline" size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.mapZoomControls}>
                  <TouchableOpacity style={styles.mapControlButton} onPress={() => handleZoom('in')} activeOpacity={0.85}>
                    <Ionicons name="add" size={22} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.mapControlDivider} />
                  <TouchableOpacity style={styles.mapControlButton} onPress={() => handleZoom('out')} activeOpacity={0.85}>
                    <Ionicons name="remove" size={22} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.mapControlDivider} />
                  <TouchableOpacity style={styles.mapControlButton} onPress={handleRecenterMap} activeOpacity={0.85}>
                    <Ionicons name="locate-outline" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>

          {/* Location Details Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationTitle}>CURRENT LOCATION</Text>
              <View style={styles.verifiedBadge}>
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#16a34a" />
                ) : (
                  <Ionicons
                    name={locationError ? 'warning-outline' : 'shield-checkmark'}
                    size={14}
                    color={locationError ? '#dc2626' : '#16a34a'}
                  />
                )}
                <Text style={[styles.verifiedText, locationError && styles.errorText]}>
                  {locationLoading ? 'Fetching current location' : locationError || 'Location Verified'}
                </Text>
              </View>
            </View>

            {currentLocation ? (
              <>

                <View style={styles.addressRow}>
                  <View style={styles.addressIcon}>
                    <Ionicons name="location" size={20} color="#4f46e5" />
                  </View>
                  <View style={styles.addressTextWrap}>
                    <Text style={styles.addressMain}>{currentLocation.addressLine}</Text>
                    <Text style={styles.addressSub}>{currentLocation.localityLine}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.locationFallback}>
                <Text style={styles.locationFallbackText}>
                  {locationLoading ? 'Detecting your current location...' : 'Current location could not be detected.'}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, isConfirming && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isConfirming}
            activeOpacity={0.9}
          >
            {isConfirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in" size={24} color="#fff" />
                <Text style={styles.confirmBtnText}>Confirm Check-In</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.securityFooter}>SECURE AI VERIFICATION ACTIVE</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function AttendanceLoggingStyles(colors: any) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4f46e5',
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sessionSub: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  modeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  modeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeCardActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 8,
  },
  modeLabelActive: {
    color: '#fff',
  },
  mapContainer: {
    height: 180,
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapTopControls: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapPillButton: {
    minWidth: 72,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  mapPillButtonActive: {
    backgroundColor: '#4f46e5',
  },
  mapPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  mapPillTextActive: {
    color: '#fff',
  },
  mapIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  mapZoomControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  mapControlButton: {
    width: 42,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapControlDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  mapMarkerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  mapRipple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    zIndex: 1,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  errorText: {
    color: '#dc2626',
  },
  coordRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 32,
  },
  coordItem: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  addressTextWrap: {
    flex: 1,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressMain: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  addressSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  locationFallback: {
    paddingVertical: 12,
  },
  locationFallbackText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  confirmBtn: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  securityFooter: {
    fontSize: 10,
    fontWeight: '800',
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1,
  },
});
}
