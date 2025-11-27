import { supabase } from '../lib/supabase';

const MapAPI = {
  /**
   * Fetches all facilities with valid coordinates.
   */
  async getFacilitiesLocations() {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('facility_id, name, lat, long')
        .not('lat', 'is', null)
        .not('long', 'is', null);

      if (error) throw error;

      return data.map(facility => ({
        id: facility.facility_id,
        title: facility.name,
        description: "Tap to get directions", // Keeping description static as requested
        latitude: parseFloat(facility.lat),
        longitude: parseFloat(facility.long),
      }));

    } catch (error) {
      console.error("MapAPI Error:", error);
      return [];
    }
  }
};

export default MapAPI;