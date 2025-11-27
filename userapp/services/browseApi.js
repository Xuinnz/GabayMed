import { supabase } from '../lib/supabase';

// Helper: Haversine Formula for distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const BrowseAPI = {
  /**
   * Fetches facilities for the Seek Medical Care page.
   * Calculates distance from a proxy location (PUP Sta Mesa).
   * Extracts distinct services.
   */
  async getSeekCareData() {
    try {
      // 1. Proxy User Location: PUP Sta. Mesa
      const USER_LAT = 14.5977;
      const USER_LONG = 121.0112;

      // 2. Fetch all facilities
      const { data: facilities, error } = await supabase
        .from('facilities')
        .select('*');

      if (error) throw error;

      // 3. Process Facilities (Calculate Distance)
      const processedFacilities = facilities.map(f => {
        let distance = 'N/A';
        let distValue = 99999; // For sorting

        if (f.lat && f.long) {
          const km = getDistanceFromLatLonInKm(USER_LAT, USER_LONG, parseFloat(f.lat), parseFloat(f.long));
          distValue = km;
          distance = km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
        }

        return {
          id: f.facility_id,
          name: f.name,
          address: f.address,
          rating: 4.5, // Mock rating if not in DB
          isOpen: true, // Mock open status
          isGabay: f.is_gabay, // Important for booking
          distance: distance,
          distValue: distValue,
          services: f.services_offered || [], // Array of strings
          imageUrl: f.image_url // Added image_url
        };
      });

      // Sort by distance
      processedFacilities.sort((a, b) => a.distValue - b.distValue);

      // 4. Extract Distinct Services (Simulating SELECT DISTINCT unnest)
      const allServices = new Set();
      facilities.forEach(f => {
        if (Array.isArray(f.services_offered)) {
          f.services_offered.forEach(s => allServices.add(s));
        }
      });
      const distinctServices = Array.from(allServices).sort();

      return {
        facilities: processedFacilities,
        services: distinctServices
      };

    } catch (error) {
      console.error("Get Seek Care Data Error:", error);
      return { facilities: [], services: [] };
    }
  }
};

export default BrowseAPI;