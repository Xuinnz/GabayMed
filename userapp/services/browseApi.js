import MapAPI from './mapApi';
import { STANDARD_MEDICAL_SERVICES } from './appointmentApi';

const BrowseAPI = {
  /**
   * Fetches all healthcare facilities for the Seek Medical Care page using real user location if permitted,
   * and enables all medical services (Neurologist, Cardiologist, General Check-up, etc.).
   */
  async getSeekCareData() {
    try {
      // 1. Request or check user location permission
      const locRes = await MapAPI.requestUserLocation();
      const userCoords = locRes.granted ? locRes.coords : null;

      // 2. Fetch facilities with resolved coordinates & distance
      const facilities = await MapAPI.getFacilitiesLocations(userCoords);

      // 3. Format for SeekMedicalCare cards and enable all specialty services
      const processedFacilities = (facilities || []).map((f, idx) => {
        const customServices = (Array.isArray(f.services) ? f.services : [])
          .map(s => String(s || '').trim())
          .filter(s => s && !/^(everything|all|all services|none|n\/a)$/i.test(s));

        const mergedServices = Array.from(new Set([...customServices, ...STANDARD_MEDICAL_SERVICES]));

        return {
          id: String(f.id ?? (f.branchId ? `branch-${f.branchId}` : `facility-${f.facilityId || idx}`)),
          facilityId: f.facilityId ?? f.id,
          branchId: f.branchId ?? null,
          type: f.type || 'facility',
          name: f.name || 'Healthcare Facility',
          address: f.address || f.location || 'Metro Manila, Philippines',
          phone: f.phone || '',
          email: f.email || '',
          rating: 4.8,
          isOpen: true,
          isGabay: true,
          distance: f.distanceLabel || 'View on map',
          distValue: f.distanceKm ?? 99999,
          services: mergedServices,
          imageUrl: f.imageUrl,
          latitude: f.latitude,
          longitude: f.longitude,
        };
      });

      // 4. Extract distinct services (always including all standard medical specialties)
      const allServices = new Set(STANDARD_MEDICAL_SERVICES);
      processedFacilities.forEach(f => {
        if (Array.isArray(f.services)) {
          f.services.forEach(s => {
            if (s && typeof s === 'string') allServices.add(s.trim());
          });
        }
      });
      const distinctServices = Array.from(allServices);

      return {
        facilities: processedFacilities,
        services: distinctServices,
        userCoords,
        locationGranted: locRes.granted,
      };
    } catch (error) {
      console.error('Get Seek Care Data Error:', error);
      return {
        facilities: [],
        services: [...STANDARD_MEDICAL_SERVICES],
        userCoords: null,
        locationGranted: false,
      };
    }
  },
};

export default BrowseAPI;
