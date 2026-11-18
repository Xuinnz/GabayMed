import { supabase } from '../lib/supabase';
import Session from './session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_CANCELLATION_NOTICE_HOURS = 24;

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;
  if (hostUri) {
    const lanHost = hostUri.split(':')[0];
    if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
      return `http://${lanHost}:3000`;
    }
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

const API_URL = resolveApiUrl();

const AppointmentAPI = {
  DEFAULT_CANCELLATION_NOTICE_HOURS,

  /**
   * Evaluates whether an appointment can be cancelled under facility policies.
   */
  evaluateCancellationPolicy(appointmentDateStr, status, cutoffHours = DEFAULT_CANCELLATION_NOTICE_HOURS) {
    const normStatus = (status || '').toUpperCase();
    if (normStatus === 'CANCELLED') {
      return { cancellable: false, reason: 'Already cancelled', cutoffHours };
    }
    if (normStatus === 'COMPLETED') {
      return { cancellable: false, reason: 'Already completed', cutoffHours };
    }

    const apptTime = new Date(appointmentDateStr).getTime();
    const now = Date.now();
    const diffHours = (apptTime - now) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return { cancellable: false, reason: 'Appointment date has already passed', cutoffHours };
    }

    if (diffHours < cutoffHours) {
      return {
        cancellable: false,
        reason: `Cancellations require at least ${cutoffHours} hours advance notice per facility policy.`,
        cutoffHours,
        hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
      };
    }

    return {
      cancellable: true,
      reason: `Cancellable until ${cutoffHours} hours before the appointment`,
      cutoffHours,
      hoursRemaining: Math.round(diffHours * 10) / 10,
    };
  },

  /**
   * Fetch all appointments for the logged-in patient.
   * Tries the backend API endpoint first, and falls back to Supabase client.
   */
  async getPatientSchedule() {
    try {
      const token = await Session.getAccessToken();
      if (token) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const response = await fetch(`${API_URL}/api/patient-appointments`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.appointments)) {
              return data.appointments;
            }
          }
        } catch (apiErr) {
          // Fall back to direct Supabase query
          console.warn('Backend API unreachable, falling back to Supabase:', apiErr.message);
        }
      }

      // Supabase Direct Query Fallback
      const patientIds = await Session.getAssociatedPatientIds();
      if (patientIds.length === 0) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_date,
          duration,
          status,
          notes,
          patient_id,
          facility_id,
          procedures ( procedure_id, name ),
          providers (
            provider_id,
            name,
            specialization,
            facilities ( facility_id, name, address, contact_num )
          )
        `)
        .in('patient_id', patientIds)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(apt => {
        const facility = apt.providers?.facilities || {};
        const d = new Date(apt.appointment_date);
        const dateStr = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const timeStr = d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const policy = this.evaluateCancellationPolicy(apt.appointment_date, apt.status);

        return {
          id: apt.appointment_id,
          appointmentId: apt.appointment_id,
          appointmentDate: apt.appointment_date,
          formattedDate: dateStr,
          formattedTime: timeStr,
          duration: apt.duration || 60,
          status: apt.status || 'PENDING',
          notes: apt.notes || '',
          facilityId: apt.facility_id || facility.facility_id,
          facilityName: facility.name || 'Medical Facility',
          facilityAddress: facility.address || '',
          facilityPhone: facility.contact_num || '',
          providerName: apt.providers?.name || 'Assigned Provider',
          providerSpecialty: apt.providers?.specialization || 'General Physician',
          procedureName: apt.procedures?.name || 'Consultation',
          cancellationPolicy: policy,
        };
      });
    } catch (error) {
      console.error('Get Patient Schedule Error:', error.message);
      return [];
    }
  },

  /**
   * Cancel an appointment subject to facility time-limit policy.
   * Tries backend PATCH/DELETE endpoint first, falling back to Supabase update.
   */
  async cancelAppointment(appointmentId, reason = '') {
    try {
      if (!appointmentId) throw new Error('Appointment ID is required');

      const token = await Session.getAccessToken();
      if (token) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(`${API_URL}/api/patient-appointments`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ appointmentId, reason }),
            signal: controller.signal,
          });
          clearTimeout(timer);

          const result = await response.json();
          if (!response.ok) {
            return {
              success: false,
              error: result.error || 'Failed to cancel appointment due to policy restrictions.',
            };
          }
          return { success: true, message: result.message || 'Appointment cancelled successfully.' };
        } catch (apiErr) {
          console.warn('Backend API cancel endpoint unreachable, checking policy directly:', apiErr.message);
        }
      }

      // Supabase direct policy verification and update fallback
      const { data: apt, error: fetchErr } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_date,
          status,
          notes,
          providers ( facilities ( name, contact_num ) )
        `)
        .eq('appointment_id', appointmentId)
        .single();

      if (fetchErr) throw fetchErr;

      // Validate policy
      const policy = this.evaluateCancellationPolicy(apt.appointment_date, apt.status);
      if (!policy.cancellable) {
        const facName = apt.providers?.facilities?.name || 'the clinic';
        const facPhone = apt.providers?.facilities?.contact_num;
        const phoneNotice = facPhone ? ` at ${facPhone}` : '';
        return {
          success: false,
          error: `Per ${facName} policy, appointments cannot be cancelled within 24 hours of the scheduled time. Please call the facility directly${phoneNotice}.`,
        };
      }

      const cancellationTag = reason
        ? `[Cancelled by patient - Reason: ${reason.trim()}]`
        : '[Cancelled by patient]';
      const updatedNotes = apt.notes ? `${apt.notes} ${cancellationTag}` : cancellationTag;

      const { error: updateErr } = await supabase
        .from('appointments')
        .update({
          status: 'CANCELLED',
          notes: updatedNotes,
        })
        .eq('appointment_id', appointmentId);

      if (updateErr) throw updateErr;

      return { success: true, message: 'Appointment cancelled successfully.' };
    } catch (error) {
      console.error('Cancel Appointment Error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get providers linked to a specific facility
   */
  async getFacilityProviders(facilityId) {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('facility_id', facilityId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get Providers Error:', error.message);
      return [];
    }
  },

  /**
   * Get services offered by a specific facility
   */
  async getFacilityServices(facilityId) {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('services_offered')
        .eq('facility_id', facilityId)
        .single();

      if (error) throw error;
      return data?.services_offered || [];
    } catch (error) {
      console.error('Get Facility Services Error:', error.message);
      return [];
    }
  },

  /**
   * Check for existing appointments for a provider on a specific date.
   * Returns an array of booked ISO timestamps (excludes CANCELLED).
   */
  async getProviderSchedule(providerId, dateString) {
    try {
      const startDate = new Date(dateString);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateString);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('provider_id', providerId)
        .gte('appointment_date', startDate.toISOString())
        .lte('appointment_date', endDate.toISOString())
        .neq('status', 'CANCELLED');

      if (error) throw error;

      return data.map(a => a.appointment_date);
    } catch (error) {
      console.error('Get Schedule Error:', error.message);
      return [];
    }
  },

  /**
   * Check whether a specific slot is still available right before booking.
   * Returns true if the slot is free, false if already taken.
   */
  async isSlotAvailable(providerId, appointmentDateISO) {
    try {
      const dateObj = new Date(appointmentDateISO);
      const windowStart = new Date(dateObj.getTime() - 30000).toISOString();
      const windowEnd = new Date(dateObj.getTime() + 30000).toISOString();

      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .gte('appointment_date', windowStart)
        .lte('appointment_date', windowEnd)
        .neq('status', 'CANCELLED');

      if (error) throw error;
      return (count || 0) === 0;
    } catch (error) {
      console.error('Slot availability check error:', error.message);
      return true;
    }
  },

  /**
   * Get facility details for the confirmation screen
   */
  async getFacilityName(facilityId) {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('name')
        .eq('facility_id', facilityId)
        .single();

      if (error) throw error;
      return data?.name || 'Medical Facility';
    } catch (error) {
      console.error('Get Facility Name Error:', error.message);
      return 'Medical Facility';
    }
  },

  /**
   * Create a new appointment for the current user.
   * Includes a double-booking guard that re-checks slot availability
   * immediately before inserting.
   */
  async createAppointment(appointmentData) {
    try {
      const userId = Session.getUserId();
      if (!userId) throw new Error('User not authenticated');

      const facilityId = appointmentData.facilityId;

      let patientId = null;
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('profile_id', userId)
        .eq('facility_id', facilityId)
        .maybeSingle();

      if (existingPatient) {
        patientId = existingPatient.patient_id;
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, first_name, middle_name, last_name, phone_number, address, date_of_birth, gender')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw new Error('Could not retrieve user profile to create patient record.');
        }

        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert([{
            profile_id: userId,
            facility_id: facilityId,
            full_name: profile.full_name || 'Guest User',
            first_name: profile.first_name || null,
            middle_name: profile.middle_name || null,
            last_name: profile.last_name || null,
            phone_number: profile.phone_number || null,
            address: profile.address || null,
            date_of_birth: profile.date_of_birth,
            gender: profile.gender,
          }])
          .select('patient_id')
          .single();

        if (createError) throw createError;
        patientId = newPatient.patient_id;
      }

      let appointmentDate;
      try {
        const [year, month, day] = appointmentData.date.split('-').map(Number);
        const [timeStr, modifier] = appointmentData.time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date constructed');
        }

        appointmentDate = dateObj.toISOString();
      } catch (e) {
        throw new Error('Invalid date or time format');
      }

      // Double-booking check
      const slotFree = await this.isSlotAvailable(
        appointmentData.providerId,
        appointmentDate
      );

      if (!slotFree) {
        return {
          success: false,
          error: 'SLOT_TAKEN',
          message: 'This time slot was just booked by another patient. Please choose a different time.',
        };
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          facility_id: facilityId,
          patient_id: patientId,
          provider_id: appointmentData.providerId,
          procedure_id: appointmentData.procedureId || '7b54b7db-ff42-4e8d-a147-133cfb5eab16',
          notes: `Service: ${appointmentData.serviceName}. ${appointmentData.notes || ''}`,
          appointment_date: appointmentDate,
          duration: 60,
          status: 'PENDING',
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: 'SLOT_TAKEN',
            message: 'This time slot was just booked by another patient. Please choose a different time.',
          };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create Appointment Error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

export default AppointmentAPI;
