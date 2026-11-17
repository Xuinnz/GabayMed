import MapAPI from './mapApi';

const BrowseAPI = {
  /**
   * Fetches facilities for the Seek Medical Care page using real user location if permitted,
   * and extracts distinct services offered across registered facilities.
   */
  async getSeekCareData() {
    try {
      // 1. Request or check user location permission
      const locRes = await MapAPI.requestUserLocation();
      const userCoords = locRes.granted ? locRes.coords : null;

      // 2. Fetch facilities with resolved coordinates & distance
      const facilities = await MapAPI.getFacilitiesLocations(userCoords);

      // 3. Format for SeekMedicalCare cards (keep unique `id` for facility vs branch, and `facilityId` for booking)
      const processedFacilities = facilities.map(f => ({
        id: String(f.id ?? (f.branchId ? `branch-${f.branchId}` : `facility-${f.facilityId}`)),
        facilityId: f.facilityId ?? f.id,
        branchId: f.branchId ?? null,
        type: f.type || 'facility',
        name: f.name,
        address: f.address,
        phone: f.phone,
        email: f.email,
        rating: 4.8,
        isOpen: true,
        isGabay: f.isGabay !== false,
        distance: f.distanceLabel || 'View on map',
        distValue: f.distanceKm ?? 99999,
        services: Array.isArray(f.services) ? f.services : [],
        imageUrl: f.imageUrl,
        latitude: f.latitude,
        longitude: f.longitude,
      }));

      // 4. Extract distinct services
      const allServices = new Set();
      processedFacilities.forEach(f => {
        if (Array.isArray(f.services)) {
          f.services.forEach(s => {
            if (s && typeof s === 'string') allServices.add(s.trim());
          });
        }
      });
      const distinctServices = Array.from(allServices).sort();

      return {
        facilities: processedFacilities,
        services: distinctServices,
        userCoords,
        locationGranted: locRes.granted,
      };
    } catch (error) {
      console.error('Get Seek Care Data Error:', error);
      return { facilities: [], services: [], userCoords: null, locationGranted: false };
    }
  },
};

export default BrowseAPI;
