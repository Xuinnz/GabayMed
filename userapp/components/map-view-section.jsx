import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
import { Search, Maximize2, X } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';

export function MapViewSection() {
  const [mapExpanded, setMapExpanded] = useState(false);

  const hospitalLocation = {
    latitude: 14.5764,
    longitude: 120.9883,
    title: "Philippine General Hospital",
    description: "Tap to get directions"
  };

  const openInMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${hospitalLocation.title}@${hospitalLocation.latitude},${hospitalLocation.longitude}`,
      android: `geo:0,0?q=${hospitalLocation.latitude},${hospitalLocation.longitude}(${hospitalLocation.title})`,
    });
    Linking.openURL(url);
  };

  const mapRegion = {
    latitude: hospitalLocation.latitude,
    longitude: hospitalLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
        >
          <Marker
            coordinate={{
              latitude: hospitalLocation.latitude,
              longitude: hospitalLocation.longitude,
            }}
            title={hospitalLocation.title}
            description={hospitalLocation.description}
            onCalloutPress={openInMaps}
          />
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
            initialRegion={mapRegion}
          >
            <Marker
              coordinate={{
                latitude: hospitalLocation.latitude,
                longitude: hospitalLocation.longitude,
              }}
              title={hospitalLocation.title}
              description={hospitalLocation.description}
              onCalloutPress={openInMaps}
            />
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
    height: '200%',
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
