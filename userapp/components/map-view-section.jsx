import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
import { Search, Maximize2, X } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import MapAPI from '../services/mapApi'; // Import MapAPI

export function MapViewSection() {
  const USER_LAT = 14.5977;
  const USER_LONG = 121.0112;

  const [mapExpanded, setMapExpanded] = useState(false);
  const [locations, setLocations] = useState([]);
  const [initialRegion, setInitialRegion] = useState({
    latitude: USER_LAT, // Start centered on user
    longitude: USER_LONG,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    const loadLocations = async () => {
      const data = await MapAPI.getFacilitiesLocations();
      if (data && data.length > 0) {
        setLocations(data);
        // Optional: Keep map centered on user initially, or fit to elements
      }
    };
    loadLocations();
  }, []);

  const openInMaps = (loc) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${loc.title}@${loc.latitude},${loc.longitude}`,
      android: `geo:0,0?q=${loc.latitude},${loc.longitude}(${loc.title})`,
    });
    Linking.openURL(url);
  };

  return (
    <>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={initialRegion} // Use region to update when data loads
          onRegionChangeComplete={(region) => setInitialRegion(region)}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={{
              latitude: USER_LAT,
              longitude: USER_LONG,
            }}
            title="You are here"
            description="Current Location"
            pinColor="#0ea5e9" // Blue color for user
          />

          {locations.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={{
                latitude: loc.latitude,
                longitude: loc.longitude,
              }}
              title={loc.title}
              description={loc.description}
              onCalloutPress={() => openInMaps(loc)}
            />
          ))}
        </MapView>
        <View style={styles.mapOverlay}>
          <TouchableOpacity style={styles.mapSearchBar}>
            <Search size={20} color="#0ea5e9" />
            <View style={styles.divider} />
            <Text style={styles.mapSearchText}>Browse Available Locations</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setMapExpanded(true)}
        >
          <Maximize2 size={20} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      {/* Fullscreen Map Modal */}
      <Modal
        visible={mapExpanded}
        animationType="slide"
        onRequestClose={() => setMapExpanded(false)}
      >
        <View style={styles.fullscreenMapContainer}>
          <MapView
            style={styles.fullscreenMap}
            region={initialRegion}
          >
            {/* User Location Marker */}
            <Marker
              coordinate={{
                latitude: USER_LAT,
                longitude: USER_LONG,
              }}
              title="You are here"
              description="Current Location"
              pinColor="#0ea5e9"
            />

            {locations.map((loc) => (
              <Marker
                key={loc.id}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
                title={loc.title}
                description={loc.description}
                onCalloutPress={() => openInMaps(loc)}
              />
            ))}
          </MapView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setMapExpanded(false)}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.fullscreenMapOverlay}>
            <TouchableOpacity style={styles.mapSearchBar}>
              <Search size={20} color="#0ea5e9" />
              <View style={styles.divider} />
              <Text style={styles.mapSearchText}>Browse available locations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%', // Fixed height percentage
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  mapSearchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
  },
  mapSearchText: {
    color: '#6b7280',
    fontSize: 14,
  },
  expandButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullscreenMapContainer: {
    flex: 1,
  },
  fullscreenMap: {
    flex: 1,
  },
  fullscreenMapOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#0ea5e9',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
