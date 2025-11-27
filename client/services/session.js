// This service manages the active Facility ID.
// You only need to change the ID here, and it updates everywhere.

const DEV_FACILITY_ID = "0d626563-5fca-4a25-a00c-2655d8cd05a7";

export const Session = {
  getFacilityId: () => {
    // 1. Check LocalStorage (if you implement a real Login later)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gabay_facility_id');
      if (stored) return stored;
    }

    // 2. Fallback to the hardcoded ID for development
    return DEV_FACILITY_ID;
  },

  // Call this when the user logs in
  setFacilityId: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gabay_facility_id', id);
    }
  }
};