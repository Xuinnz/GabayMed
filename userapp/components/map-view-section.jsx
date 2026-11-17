import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Linking, TextInput, ScrollView, ActivityIndicator, Keyboard,
} from 'react-native';
import {
  Search, Maximize2, X, Navigation, MapPin, Phone, Crosshair, Building2, Clock, ChevronDown, ChevronUp, CornerDownRight, Compass,
} from 'lucide-react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import MapAPI, { getDistanceKm, formatDistance } from '../services/mapApi';

const DEFAULT_REGION = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

function computeBoundingRegion(points) {
  if (!points || points.length === 0) return DEFAULT_REGION;
  if (points.length === 1) {
    return {
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;
  points.forEach(p => {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  });
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.03, (maxLat - minLat) * 1.45),
    longitudeDelta: Math.max(0.03, (maxLng - minLng) * 1.45),
  };
}

export function MapViewSection({ onSelectFacility }) {
  const inlineMapRef = useRef(null);
  const fullMapRef = useRef(null);
  const inlineMarkerRefs = useRef({});
  const fullMarkerRefs = useRef({});

  const [mapExpanded, setMapExpanded] = useState(false);
  const [locations, setLocations] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [locationGranted, setLocationGranted] = useState(null);
  const [region, setRegion] = useState(DEFAULT_REGION);

  // Initially NO facility is selected and NO route is drawn
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Search state with live suggestions dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    const locResult = await MapAPI.requestUserLocation();
    setLocationGranted(locResult.granted);
    const currentCoords = locResult.granted ? locResult.coords : null;
    setUserCoords(currentCoords);

    const facilities = await MapAPI.getFacilitiesLocations(currentCoords);
    setLocations(facilities);

    const points = currentCoords
      ? [currentCoords, ...facilities]
      : facilities;
    setRegion(computeBoundingRegion(points));
  };

  const ensureUserLocation = async () => {
    if (locationGranted && userCoords) return userCoords;
    const locResult = await MapAPI.requestUserLocation();
    if (!locResult.granted) {
      Linking.openSettings?.();
      return null;
    }
    setLocationGranted(true);
    setUserCoords(locResult.coords);
    if (locResult.coords) {
      setLocations(prev =>
        prev
          .map(loc => {
            const km = getDistanceKm(
              locResult.coords.latitude,
              locResult.coords.longitude,
              loc.latitude,
              loc.longitude
            );
            return { ...loc, distanceKm: km, distanceLabel: formatDistance(km) };
          })
          .sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999))
      );
    }
    return locResult.coords;
  };

  const selectFacilityPin = loc => {
    Keyboard.dismiss();
    setSelectedPin(loc);
    setActiveRoute(null);
    setShowSteps(false);
    setShowSuggestions(false);
    const targetRegion = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };
    setRegion(targetRegion);
    inlineMapRef.current?.animateToRegion?.(targetRegion, 450);
    fullMapRef.current?.animateToRegion?.(targetRegion, 450);

    // Automatically open the marker callout above the pin when selected (both before and after map pan)
    inlineMarkerRefs.current[loc.id]?.showCallout?.();
    fullMarkerRefs.current[loc.id]?.showCallout?.();
    setTimeout(() => {
      inlineMarkerRefs.current[loc.id]?.showCallout?.();
      fullMarkerRefs.current[loc.id]?.showCallout?.();
    }, 520);

    if (onSelectFacility) onSelectFacility(loc);
  };

  const clearSelection = () => {
    if (selectedPin?.id) {
      inlineMarkerRefs.current[selectedPin.id]?.hideCallout?.();
      fullMarkerRefs.current[selectedPin.id]?.hideCallout?.();
    }
    setSelectedPin(null);
    setActiveRoute(null);
    setShowSteps(false);
  };

  const startInAppDirections = async targetFacility => {
    const dest = targetFacility || selectedPin;
    if (!dest) return;

    setSelectedPin(dest);
    setLoadingRoute(true);
    try {
      const origin = await ensureUserLocation();
      if (!origin) {
        setLoadingRoute(false);
        return;
      }
      const routeData = await MapAPI.getInAppRoute(origin, dest);
      setActiveRoute(routeData);

      const framed = computeBoundingRegion([
        origin,
        { latitude: dest.latitude, longitude: dest.longitude },
      ]);
      setRegion(framed);
      inlineMapRef.current?.animateToRegion?.(framed, 500);
      fullMapRef.current?.animateToRegion?.(framed, 500);
    } finally {
      setLoadingRoute(false);
    }
  };

  const recenterOnUser = async () => {
    const coords = await ensureUserLocation();
    if (!coords) return;
    const targetRegion = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
    setRegion(targetRegion);
    inlineMapRef.current?.animateToRegion?.(targetRegion, 450);
    fullMapRef.current?.animateToRegion?.(targetRegion, 450);
    setTimeout(() => {
      inlineMarkerRefs.current.__user__?.showCallout?.();
      fullMarkerRefs.current.__user__?.showCallout?.();
    }, 300);
  };

  const resetNorthOrientation = () => {
    inlineMapRef.current?.animateCamera?.({ heading: 0, pitch: 0 }, { duration: 350 });
    fullMapRef.current?.animateCamera?.({ heading: 0, pitch: 0 }, { duration: 350 });
  };

  const suggestions = searchQuery.trim()
    ? locations.filter(loc => {
        const q = searchQuery.trim().toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q) ||
          (loc.services || []).some(s => s.toLowerCase().includes(q))
        );
      })
    : locations.slice(0, 8);

  const renderCalloutBubble = (title, subtitle, isUser = false) => (
    <Callout tooltip>
      <View style={styles.calloutWrapper}>
        <View style={[styles.calloutBubble, isUser && styles.calloutBubbleUser]}>
          <View style={styles.calloutHeaderRow}>
            <View style={[styles.calloutIconBadge, isUser && styles.calloutIconBadgeUser]}>
              {isUser ? (
                <Crosshair size={13} color="#0284c7" />
              ) : (
                <Building2 size={13} color="#0ea5e9" />
              )}
            </View>
            <Text style={styles.calloutTitle} numberOfLines={2}>
              {title}
            </Text>
          </View>
          <Text style={styles.calloutSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <View style={[styles.calloutArrow, isUser && styles.calloutArrowUser]} />
      </View>
    </Callout>
  );

  const renderMarkersAndRoute = markerRefsMap => (
    <>
      {/* User's current location pin (RED) with matching themed callout */}
      {locationGranted && userCoords && (
        <Marker
          ref={el => {
            if (el) markerRefsMap.current.__user__ = el;
          }}
          coordinate={userCoords}
          pinColor="#ef4444"
        >
          {renderCalloutBubble('You are here', 'Your current location', true)}
        </Marker>
      )}

      {/* In-app road route polyline */}
      {activeRoute?.coordinates?.length > 1 && (
        <Polyline
          coordinates={activeRoute.coordinates}
          strokeColor="#0284c7"
          strokeWidth={4}
        />
      )}

      {/* Registered Hospitals, Clinics & Branches (BLUE) with matching themed callout */}
      {locations.map(loc => {
        const isSelected = selectedPin?.id === loc.id;
        return (
          <Marker
            key={loc.id}
            ref={el => {
              if (el) markerRefsMap.current[loc.id] = el;
            }}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            pinColor={isSelected ? '#1d4ed8' : '#0ea5e9'}
            onPress={() => selectFacilityPin(loc)}
          >
            {renderCalloutBubble(loc.name, loc.address, false)}
          </Marker>
        );
      })}
    </>
  );

  const renderSuggestionsDropdown = () => {
    if (!showSuggestions) return null;
    return (
      <View style={styles.suggestionsDropdown}>
        {suggestions.length === 0 ? (
          <View style={styles.emptySuggestion}>
            <Text style={styles.emptySuggestionText}>No matching hospitals or branches found.</Text>
          </View>
        ) : (
          <ScrollView
            style={{ maxHeight: 220 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {suggestions.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionRow}
                onPress={() => {
                  setSearchQuery(item.name);
                  selectFacilityPin(item);
                }}
              >
                <View style={styles.suggestionIcon}>
                  <MapPin size={15} color="#0ea5e9" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.type === 'branch' && (
                      <View style={styles.branchTag}>
                        <Text style={styles.branchTagText}>Branch</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {item.distanceLabel ? `${item.distanceLabel} • ${item.address}` : item.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderPopupCard = (isCompact = false) => {
    if (!selectedPin) return null;
    return (
      <View style={[styles.selectedCard, isCompact && styles.selectedCardCompact]}>
        <View style={styles.selectedHeader}>
          <View style={styles.selectedIconWrap}>
            <Building2 size={20} color="#0ea5e9" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedTitle} numberOfLines={1}>
              {selectedPin.name}
            </Text>
            <Text style={styles.selectedAddress} numberOfLines={isCompact ? 1 : 2}>
              {selectedPin.address}
            </Text>
            <View style={styles.metaRow}>
              {activeRoute ? (
                <>
                  <View style={styles.routeBadge}>
                    <Clock size={12} color="#0284c7" />
                    <Text style={styles.routeBadgeText}>{activeRoute.durationLabel}</Text>
                  </View>
                  <View style={styles.routeBadge}>
                    <Navigation size={12} color="#0284c7" />
                    <Text style={styles.routeBadgeText}>{activeRoute.distanceLabel}</Text>
                  </View>
                </>
              ) : selectedPin.distanceLabel ? (
                <View style={styles.distancePill}>
                  <MapPin size={12} color="#0284c7" />
                  <Text style={styles.distancePillText}>{selectedPin.distanceLabel}</Text>
                </View>
              ) : null}

              {!isCompact && !!selectedPin.phone && (
                <View style={styles.phoneRow}>
                  <Phone size={11} color="#64748b" />
                  <Text style={styles.phoneText}>{selectedPin.phone}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={clearSelection} hitSlop={8} style={styles.dismissCardBtn}>
            <X size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {activeRoute && showSteps && !isCompact && (
          <ScrollView style={styles.stepsList} nestedScrollEnabled>
            {activeRoute.steps.map(step => (
              <View key={step.id} style={styles.stepRow}>
                <CornerDownRight size={14} color="#0ea5e9" />
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
                <Text style={styles.stepDistance}>{step.distanceLabel}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.cardActions}>
          {!activeRoute ? (
            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => startInAppDirections(selectedPin)}
              disabled={loadingRoute}
              activeOpacity={0.85}
            >
              {loadingRoute ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Navigation size={15} color="#fff" />
              )}
              <Text style={styles.directionsBtnText}>
                {loadingRoute ? 'Finding Route...' : 'Directions from My Location'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeRouteRow}>
              {!isCompact ? (
                <TouchableOpacity
                  style={styles.stepsToggleBtn}
                  onPress={() => setShowSteps(!showSteps)}
                >
                  {showSteps ? (
                    <ChevronDown size={16} color="#0284c7" />
                  ) : (
                    <ChevronUp size={16} color="#0284c7" />
                  )}
                  <Text style={styles.stepsToggleText}>
                    {showSteps ? 'Hide Steps' : `View Steps (${activeRoute.steps.length})`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.stepsToggleBtn}
                  onPress={() => {
                    setMapExpanded(true);
                    setShowSteps(true);
                  }}
                >
                  <ChevronUp size={16} color="#0284c7" />
                  <Text style={styles.stepsToggleText}>View Full Route & Steps</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.clearRouteBtn}
                onPress={() => {
                  setActiveRoute(null);
                  setShowSteps(false);
                }}
              >
                <Text style={styles.clearRouteText}>End Route</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.mapContainer}>
        <MapView
          ref={inlineMapRef}
          style={styles.map}
          region={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          onPress={() => setShowSuggestions(false)}
        >
          {renderMarkersAndRoute(inlineMarkerRefs)}
        </MapView>

        {/* Top search bar with live suggestions + expand button */}
        <View style={styles.inlineTopBar}>
          <View style={styles.searchInputWrap}>
            <Search size={16} color="#0ea5e9" />
            <TextInput
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onSubmitEditing={() => {
                if (suggestions.length > 0) {
                  setSearchQuery(suggestions[0].name);
                  selectFacilityPin(suggestions[0]);
                }
              }}
              returnKeyType="search"
              placeholder="Search hospitals, clinics, or branches..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
            />
            {!!searchQuery && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                hitSlop={8}
              >
                <X size={15} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => {
              setShowSuggestions(false);
              setMapExpanded(true);
            }}
            accessibilityLabel="Expand map"
          >
            <Maximize2 size={18} color="#0ea5e9" />
          </TouchableOpacity>
        </View>

        {renderSuggestionsDropdown()}

        {locationGranted === false && !showSuggestions && (
          <TouchableOpacity
            style={styles.enableLocationChip}
            onPress={recenterOnUser}
            activeOpacity={0.85}
          >
            <Crosshair size={13} color="#0284c7" />
            <Text style={styles.enableLocationText}>Enable my location</Text>
          </TouchableOpacity>
        )}

        {/* Full-width bottom overlay with Compass & Locate Me buttons positioned on top-right of the popup */}
        {!showSuggestions && (
          <View style={styles.mapOverlay}>
            <View style={styles.fabAboveCardRow}>
              <TouchableOpacity
                style={styles.locateButtonSmall}
                onPress={resetNorthOrientation}
                accessibilityLabel="Reset map compass to north"
              >
                <Compass size={17} color="#0ea5e9" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locateButtonSmall}
                onPress={recenterOnUser}
                accessibilityLabel="My location"
              >
                <Crosshair size={17} color="#0ea5e9" />
              </TouchableOpacity>
            </View>
            {selectedPin && renderPopupCard(true)}
          </View>
        )}
      </View>

      {/* Fullscreen Interactive Map Modal */}
      <Modal
        visible={mapExpanded}
        animationType="slide"
        onRequestClose={() => setMapExpanded(false)}
      >
        <View style={styles.fullscreenMapContainer}>
          <MapView
            ref={fullMapRef}
            style={styles.fullscreenMap}
            region={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
            onPress={() => setShowSuggestions(false)}
          >
            {renderMarkersAndRoute(fullMarkerRefs)}
          </MapView>

          {/* Top search bar & close button */}
          <View style={styles.fullscreenTopBar}>
            <View style={styles.fullscreenSearchBox}>
              <Search size={18} color="#0ea5e9" />
              <TextInput
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onSubmitEditing={() => {
                  if (suggestions.length > 0) {
                    setSearchQuery(suggestions[0].name);
                    selectFacilityPin(suggestions[0]);
                  }
                }}
                returnKeyType="search"
                placeholder="Search hospital, clinic, branch, or service..."
                placeholderTextColor="#94a3b8"
                style={styles.fullscreenSearchInput}
              />
              {!!searchQuery && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                >
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowSuggestions(false);
                setMapExpanded(false);
              }}
              accessibilityLabel="Close fullscreen map"
            >
              <X size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {showSuggestions && (
            <View style={styles.fullscreenSuggestionsWrap}>
              {renderSuggestionsDropdown()}
            </View>
          )}

          {/* Full-width bottom container: Compass & Locate Me buttons sit cleanly at the top-right above the popup card */}
          {!showSuggestions && (
            <View style={styles.fullscreenMapOverlay}>
              <View style={styles.fabAboveCardRow}>
                <TouchableOpacity
                  style={styles.myLocationFab}
                  onPress={resetNorthOrientation}
                  accessibilityLabel="Reset map compass to north"
                >
                  <Compass size={20} color="#0ea5e9" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.myLocationFab}
                  onPress={recenterOnUser}
                  accessibilityLabel="My location"
                >
                  <Crosshair size={20} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
              {selectedPin && renderPopupCard(false)}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    height: 330,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutWrapper: {
    alignItems: 'center',
    width: 220,
  },
  calloutBubble: {
    width: 210,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 5,
  },
  calloutBubbleUser: {
    backgroundColor: '#f0f9ff',
    borderColor: '#38bdf8',
  },
  calloutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  calloutIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutIconBadgeUser: {
    backgroundColor: '#bae6fd',
  },
  calloutTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  calloutSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 15,
  },
  calloutArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  calloutArrowUser: {
    borderTopColor: '#f0f9ff',
  },
  inlineTopBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    paddingVertical: 0,
  },
  expandButton: {
    backgroundColor: '#fff',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 54,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
    overflow: 'hidden',
  },
  fullscreenSuggestionsWrap: {
    position: 'absolute',
    top: 48,
    left: 6,
    right: 6,
    zIndex: 20,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitle: {
    flexShrink: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1e293b',
  },
  branchTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  branchTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  suggestionSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  emptySuggestion: {
    padding: 14,
    alignItems: 'center',
  },
  emptySuggestionText: {
    fontSize: 13,
    color: '#64748b',
  },
  enableLocationChip: {
    position: 'absolute',
    top: 56,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
    elevation: 2,
  },
  enableLocationText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0284c7',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  fabAboveCardRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  locateButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  fullscreenMapContainer: {
    flex: 1,
  },
  fullscreenMap: {
    flex: 1,
  },
  fullscreenTopBar: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  fullscreenSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  fullscreenSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 0,
  },
  closeButton: {
    backgroundColor: '#0ea5e9',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationFab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fullscreenMapOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  selectedCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  selectedCardCompact: {
    padding: 12,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  selectedIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  selectedAddress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  distancePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0284c7',
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  routeBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284c7',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  dismissCardBtn: {
    padding: 4,
  },
  stepsList: {
    maxHeight: 130,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  stepInstruction: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
  },
  stepDistance: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  cardActions: {
    marginTop: 10,
  },
  directionsBtn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionsBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  activeRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepsToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingVertical: 9,
    borderRadius: 10,
  },
  stepsToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0284c7',
  },
  clearRouteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearRouteText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#dc2626',
  },
});
