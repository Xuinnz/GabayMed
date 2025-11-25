// This service manages the active Facility ID.
// You only need to change the ID here, and it updates everywhere.

const DEV_FACILITY_ID = "69ce8db3-fbac-4c16-94cd-d2a6f2385489";

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