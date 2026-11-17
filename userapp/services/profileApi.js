import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import Session from './session';
import AuthAPI from './authApi';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatReadableDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(String(iso))) return 'Not set';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return `${MONTHS[m - 1] || ''} ${d}, ${y}`;
}

function computeAge(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(String(iso))) return 'N/A';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const md = today.getMonth() + 1 - m;
  if (md < 0 || (md === 0 && today.getDate() < d)) age--;
  return age >= 0 ? String(age) : 'N/A';
}

function normalizePhoneLocal(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('63') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('09') && digits.length === 11) return digits.slice(1);
  if (digits.startsWith('9') && digits.length === 10) return digits;
  return digits.slice(-10);
}

function normalizeRowToUi(raw) {
  const isoDob = raw.date_of_birth ? String(raw.date_of_birth).slice(0, 10) : '';
  const nameParts = (raw.full_name || '').trim().split(/\s+/);
  const firstName = raw.first_name || nameParts[0] || '';
  const lastName = raw.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
  const fullName =
    raw.full_name ||
    [firstName, raw.middle_name, lastName, raw.name_suffix].filter(Boolean).join(' ') ||
    'Patient';

  const allergiesRaw = raw.allergies && raw.allergies !== 'None' ? String(raw.allergies) : '';
  const historyRaw = raw.medical_history ? String(raw.medical_history) : '';

  const addressCombined =
    raw.address ||
    [raw.street_address, raw.barangay, raw.city_municipality, raw.province, raw.zip_code]
      .filter(Boolean)
      .join(', ');

  return {
    id: raw.id,
    firstName,
    middleName: raw.middle_name || '',
    lastName,
    nameSuffix: raw.name_suffix || '',
    name: fullName,
    age: raw.age && raw.age !== 'N/A' ? String(raw.age) : computeAge(isoDob),
    birthdate: formatReadableDate(isoDob),
    rawBirthdate: isoDob,
    gender: raw.gender || 'Not set',
    phone: raw.phone_number || 'Not set',
    mobileLocal: normalizePhoneLocal(raw.phone_number),
    email: raw.email || 'Not set',
    streetAddress: raw.street_address || '',
    barangay: raw.barangay || '',
    cityMunicipality: raw.city_municipality || '',
    province: raw.province || '',
    zipCode: raw.zip_code || '',
    address: addressCombined || 'Not set',
    bloodType: raw.blood_type || 'Not set',
    allergies: allergiesRaw || 'None',
    allergiesList: allergiesRaw
      ? allergiesRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    medicalHistory: historyRaw
      ? historyRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    avatar: raw.avatar_url || '',
    insuranceConsent:
      typeof raw.insurance_consent === 'boolean' ? raw.insurance_consent : true,
    dataSharingConsent:
      typeof raw.data_sharing_consent === 'boolean' ? raw.data_sharing_consent : true,
  };
}

let cachedProfile = null;
const profileListeners = new Set();
let cachedPermissions = null;
const permissionListeners = new Set();

function getPermissionsKey() {
  const uid = Session.getUserId() || 'default';
  return `gabay_permissions_v1_${uid}`;
}

function notifyProfileChanged(profile) {
  cachedProfile = profile;
  profileListeners.forEach(fn => {
    try { fn(profile); } catch {}
  });
}

function notifyPermissionsChanged(perms) {
  cachedPermissions = perms;
  permissionListeners.forEach(fn => {
    try { fn(perms); } catch {}
  });
}

const ProfileAPI = {
  subscribe(listener) {
    profileListeners.add(listener);
    return () => profileListeners.delete(listener);
  },

  subscribePermissions(listener) {
    permissionListeners.add(listener);
    return () => permissionListeners.delete(listener);
  },

  /**
   * Synchronously returns the cached profile in memory (if already loaded),
   * avoiding any default icon/name flash when switching tabs or opening Profile.
   */
  getCachedProfile() {
    if (cachedProfile) return cachedProfile;
    const sessionProfile = Session.current()?.profile;
    if (sessionProfile) {
      return {
        id: sessionProfile.id,
        firstName: sessionProfile.firstName || '',
        middleName: '',
        lastName: sessionProfile.lastName || '',
        nameSuffix: '',
        name:
          sessionProfile.fullName ||
          [sessionProfile.firstName, sessionProfile.lastName].filter(Boolean).join(' ') ||
          'Patient',
        age: 'N/A',
        birthdate: 'Not set',
        rawBirthdate: '',
        gender: sessionProfile.gender || 'Not set',
        phone: 'Not set',
        mobileLocal: '',
        email: sessionProfile.email || 'Not set',
        streetAddress: '',
        barangay: '',
        cityMunicipality: '',
        province: '',
        zipCode: '',
        address: 'Not set',
        bloodType: 'Not set',
        allergies: 'None',
        allergiesList: [],
        medicalHistory: [],
        avatar: sessionProfile.avatar || '',
        insuranceConsent: true,
        dataSharingConsent: true,
      };
    }
    return null;
  },

  getCachedPermissions() {
    return cachedPermissions;
  },

  /**
   * Reads the user's 4 onboarding/settings permissions (`insuranceConsent`, `dataSharingConsent`,
   * `locationAllowed`, `notificationsAllowed`), combining device SecureStore state, OS location status,
   * and database profile consents.
   */
  async getPermissions({ forceRefresh = false } = {}) {
    if (cachedPermissions && !forceRefresh) {
      return cachedPermissions;
    }
    let stored = {};
    try {
      const raw = await SecureStore.getItemAsync(getPermissionsKey());
      if (raw) stored = JSON.parse(raw) || {};
    } catch {}

    let osLocationGranted = false;
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      osLocationGranted = perm?.status === 'granted';
    } catch {}

    const resolved = {
      insuranceConsent:
        typeof stored.insuranceConsent === 'boolean'
          ? stored.insuranceConsent
          : typeof cachedProfile?.insuranceConsent === 'boolean'
            ? cachedProfile.insuranceConsent
            : true,
      dataSharingConsent:
        typeof stored.dataSharingConsent === 'boolean'
          ? stored.dataSharingConsent
          : typeof cachedProfile?.dataSharingConsent === 'boolean'
            ? cachedProfile.dataSharingConsent
            : true,
      // Location is ON only when both the app toggle is allowed AND OS permission is granted
      locationAllowed:
        typeof stored.locationAllowed === 'boolean'
          ? stored.locationAllowed && osLocationGranted
          : osLocationGranted,
      notificationsAllowed:
        typeof stored.notificationsAllowed === 'boolean'
          ? stored.notificationsAllowed
          : true,
    };
    cachedPermissions = resolved;
    return resolved;
  },

  /**
   * Updates one or more permissions (`insuranceConsent`, `dataSharingConsent`, `locationAllowed`, `notificationsAllowed`),
   * persists them immediately on device (`SecureStore`), notifies active screens (Map, Settings, Notifications),
   * and syncs database consents (`insurance_consent`, `data_sharing_consent`).
   */
  async setPermissions(patch = {}) {
    const currentPerms = cachedPermissions || (await this.getPermissions());
    let stored = {};
    try {
      const raw = await SecureStore.getItemAsync(getPermissionsKey());
      if (raw) stored = JSON.parse(raw) || {};
    } catch {}

    const next = {
      ...currentPerms,
      ...stored,
      ...patch,
    };

    try {
      await SecureStore.setItemAsync(getPermissionsKey(), JSON.stringify(next));
    } catch {}

    notifyPermissionsChanged(next);

    // Sync insurance_consent and data_sharing_consent to Supabase in background if changed
    if (
      typeof patch.insuranceConsent === 'boolean' ||
      typeof patch.dataSharingConsent === 'boolean'
    ) {
      const dbPatch = {};
      if (typeof patch.insuranceConsent === 'boolean') {
        dbPatch.insurance_consent = patch.insuranceConsent;
      }
      if (typeof patch.dataSharingConsent === 'boolean') {
        dbPatch.data_sharing_consent = patch.dataSharingConsent;
      }

      if (cachedProfile) {
        notifyProfileChanged({
          ...cachedProfile,
          ...(typeof patch.insuranceConsent === 'boolean'
            ? { insuranceConsent: patch.insuranceConsent }
            : {}),
          ...(typeof patch.dataSharingConsent === 'boolean'
            ? { dataSharingConsent: patch.dataSharingConsent }
            : {}),
        });
      }

      try {
        const token = await Session.getAccessToken();
        if (token) {
          const res = await AuthAPI.updateConsents(token, dbPatch);
          if (res?.profile) {
            notifyProfileChanged(normalizeRowToUi({ ...res.profile, ...dbPatch }));
            return next;
          }
        }
      } catch {}

      try {
        const userId = Session.getUserId();
        if (userId) {
          const { data } = await supabase
            .from('profiles')
            .update(dbPatch)
            .eq('id', userId)
            .select('*')
            .single();
          if (data) notifyProfileChanged(normalizeRowToUi({ ...data, ...dbPatch }));
        }
      } catch {}
    }

    return next;
  },

  /**
   * READ: Fetches the current patient's personal, demographic, and medical profile.
   * Uses in-memory cache immediately when already loaded unless `forceRefresh: true`.
   */
  async getProfile({ forceRefresh = false } = {}) {
    if (cachedProfile && !forceRefresh) {
      return cachedProfile;
    }
    try {
      const token = await Session.getAccessToken();
      if (token) {
        try {
          const res = await AuthAPI.getProfile(token);
          if (res?.profile) {
            const formatted = normalizeRowToUi(res.profile);
            notifyProfileChanged(formatted);
            return formatted;
          }
        } catch {}
      }

      // Direct Supabase fallback
      const userId = Session.getUserId();
      if (!userId) throw new Error('User not logged in');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      const formatted = normalizeRowToUi(profile);
      notifyProfileChanged(formatted);
      return formatted;
    } catch (error) {
      console.error('Get Profile Error:', error);
      throw error;
    }
  },

  /**
   * Updates ONLY the patient's profile picture or character preset without touching or requiring other fields.
   */
  async updateAvatar(avatarValue) {
    const cleanAvatar = avatarValue || '';
    const token = await Session.getAccessToken();
    if (token) {
      try {
        const res = await AuthAPI.updateAvatar(token, cleanAvatar);
        if (res?.profile) {
          const formatted = normalizeRowToUi(res.profile);
          notifyProfileChanged(formatted);
          return formatted;
        }
      } catch {}
    }

    const userId = Session.getUserId();
    if (!userId) throw new Error('User not logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: cleanAvatar || null })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    const formatted = normalizeRowToUi(data);
    notifyProfileChanged(formatted);
    return formatted;
  },

  /**
   * Updates ONLY the patient's medical records (blood type, allergies list, medical history list).
   */
  async updateMedicalRecords({ bloodType, allergiesList, medicalHistory }) {
    const bt = bloodType && bloodType !== 'Not set' ? bloodType : '';
    const allergiesStr = (allergiesList || []).map(s => String(s || '').trim()).filter(Boolean).join(', ');
    const historyStr = (medicalHistory || []).map(s => String(s || '').trim()).filter(Boolean).join(', ');

    const token = await Session.getAccessToken();
    if (token) {
      try {
        const res = await AuthAPI.updateMedical(token, {
          blood_type: bt,
          allergies: allergiesStr,
          medical_history: historyStr,
        });
        if (res?.profile) {
          const formatted = normalizeRowToUi(res.profile);
          notifyProfileChanged(formatted);
          return formatted;
        }
      } catch {}
    }

    const userId = Session.getUserId();
    if (!userId) throw new Error('User not logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        blood_type: bt || null,
        allergies: allergiesStr || null,
        medical_history: historyStr || null,
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    const formatted = normalizeRowToUi(data);
    notifyProfileChanged(formatted);
    return formatted;
  },

  /**
   * Updates onboarding permission consents (`insurance_consent`, `data_sharing_consent`).
   */
  async updateConsents({ insuranceConsent, dataSharingConsent }) {
    const patch = {};
    if (typeof insuranceConsent === 'boolean') patch.insurance_consent = insuranceConsent;
    if (typeof dataSharingConsent === 'boolean') patch.data_sharing_consent = dataSharingConsent;

    const token = await Session.getAccessToken();
    if (token) {
      try {
        const res = await AuthAPI.updateConsents(token, patch);
        if (res?.profile) {
          const formatted = normalizeRowToUi(res.profile);
          notifyProfileChanged(formatted);
          return formatted;
        }
      } catch {}
    }

    const userId = Session.getUserId();
    if (!userId) throw new Error('User not logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    const formatted = normalizeRowToUi(data);
    notifyProfileChanged(formatted);
    return formatted;
  },

  /**
   * UPDATE:
   * Validates and updates personal, contact, demographic, and medical details via the backend.
   * Supports OTP-verified email update via `newEmail` + `otpToken`.
   */
  async updateProfile(updates) {
    const payload = {
      first_name: (updates.firstName || '').trim(),
      middle_name: (updates.middleName || '').trim(),
      last_name: (updates.lastName || '').trim(),
      name_suffix: (updates.nameSuffix || '').trim(),
      date_of_birth: (updates.rawBirthdate || '').trim(),
      gender: updates.gender && updates.gender !== 'Not set' ? updates.gender : '',
      phone_number: updates.mobileLocal || updates.phone || '',
      street_address: (updates.streetAddress || '').trim(),
      barangay: (updates.barangay || '').trim(),
      city_municipality: (updates.cityMunicipality || '').trim(),
      province: (updates.province || '').trim(),
      zip_code: (updates.zipCode || '').trim(),
      blood_type: updates.bloodType && updates.bloodType !== 'Not set' ? updates.bloodType : '',
      allergies: Array.isArray(updates.allergiesList)
        ? updates.allergiesList.join(', ')
        : updates.allergies && updates.allergies !== 'None'
          ? String(updates.allergies).trim()
          : '',
      medical_history: Array.isArray(updates.medicalHistory)
        ? updates.medicalHistory.join(', ')
        : String(updates.medicalHistory || '').trim(),
      avatar_url: updates.avatar || '',
    };

    if (updates.newEmail) {
      payload.new_email = String(updates.newEmail).trim().toLowerCase();
      payload.otp_token = updates.otpToken || '';
    }

    const token = await Session.getAccessToken();
    if (token) {
      try {
        const res = await AuthAPI.updateProfile(token, payload);
        if (res?.profile) {
          const formatted = normalizeRowToUi(res.profile);
          Session.setProfile({
            id: formatted.id,
            firstName: formatted.firstName,
            lastName: formatted.lastName,
            fullName: formatted.name,
            email: formatted.email,
            onboardingCompleted: true,
          });
          notifyProfileChanged(formatted);
          return formatted;
        }
      } catch (err) {
        if (err.status === 400 || err.status === 401 || err.status === 409) throw err;
      }
    }

    // Fallback direct update if local backend server was not restarted
    const userId = Session.getUserId();
    if (!userId) throw new Error('User not logged in');

    const full_name = [
      payload.first_name,
      payload.middle_name,
      payload.last_name,
      payload.name_suffix,
    ]
      .filter(Boolean)
      .join(' ');
    const address = [
      payload.street_address,
      payload.barangay,
      payload.city_municipality,
      payload.province,
      payload.zip_code,
    ]
      .filter(Boolean)
      .join(', ');
    const phoneDigits = String(payload.phone_number).replace(/\D/g, '').replace(/^0+/, '');
    const normalizedPhone = phoneDigits.startsWith('63') ? `+${phoneDigits}` : `+63${phoneDigits}`;

    const dbUpdates = {
      first_name: payload.first_name,
      middle_name: payload.middle_name || null,
      last_name: payload.last_name,
      name_suffix: payload.name_suffix || null,
      full_name,
      date_of_birth: payload.date_of_birth || null,
      gender: payload.gender || null,
      phone_number: normalizedPhone,
      street_address: payload.street_address || null,
      barangay: payload.barangay || null,
      city_municipality: payload.city_municipality || null,
      province: payload.province || null,
      zip_code: payload.zip_code || null,
      address: address || null,
      blood_type: payload.blood_type || null,
      allergies: payload.allergies || null,
      medical_history: payload.medical_history || null,
      avatar_url: payload.avatar_url || null,
    };

    if (payload.new_email) {
      dbUpdates.email = payload.new_email;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    const formatted = normalizeRowToUi(data);
    Session.setProfile({
      id: formatted.id,
      firstName: formatted.firstName,
      lastName: formatted.lastName,
      fullName: formatted.name,
      email: formatted.email,
      onboardingCompleted: true,
    });
    notifyProfileChanged(formatted);
    return formatted;
  },

  /**
   * DELETE / Clear medical field (`allergies`, `medical_history`, or `all`).
   */
  async clearMedicalRecord(field = 'all') {
    const token = await Session.getAccessToken();
    if (token) {
      const res = await AuthAPI.clearMedicalField(token, field);
      if (res?.profile) {
        const formatted = normalizeRowToUi(res.profile);
        notifyProfileChanged(formatted);
        return formatted;
      }
    }
    const userId = Session.getUserId();
    if (!userId) throw new Error('User not logged in');
    const patch =
      field === 'allergies'
        ? { allergies: null }
        : field === 'medical_history'
          ? { medical_history: null }
          : { blood_type: null, allergies: null, medical_history: null };
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    const formatted = normalizeRowToUi(data);
    notifyProfileChanged(formatted);
    return formatted;
  },

  /**
   * Permanently deletes the signed-in patient's account after OTP verification.
   */
  async deleteAccount({ email, otpToken }) {
    const token = await Session.getAccessToken();
    const userId = Session.getUserId();

    if (token) {
      try {
        const res = await AuthAPI.deleteAccount(token, {
          email: (email || '').trim().toLowerCase(),
          otp_token: otpToken,
        });
        if (res?.deleted) {
          notifyProfileChanged(null);
          await Session.signOut();
          return { deleted: true };
        }
      } catch (err) {
        if (err.status === 401) throw err;
      }
    }

    // Fallback if local server wasn't restarted after OTP was already verified
    if (!userId) throw new Error('User not logged in');
    try {
      await supabase.from('patients').update({ profile_id: null }).eq('profile_id', userId);
    } catch {}
    await supabase.from('profiles').delete().eq('id', userId);
    notifyProfileChanged(null);
    await Session.signOut();
    return { deleted: true };
  },

  async signOut() {
    notifyProfileChanged(null);
    return Session.signOut();
  },
};

export default ProfileAPI;
