const { RequestError } = require('./provider-accounts');

// Default facility cancellation policy: 24 hours notice required
const DEFAULT_CANCELLATION_NOTICE_HOURS = 24;

/**
 * Format ISO date string into readable date and time components
 */
function formatAppointmentDateTime(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: '' };
    
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  } catch {
    return { dateStr: isoString, timeStr: '' };
  }
}

/**
 * Check if an appointment is cancellable under facility policy
 */
function evaluateCancellationPolicy(appointmentDateStr, status, cutoffHours = DEFAULT_CANCELLATION_NOTICE_HOURS, now = new Date()) {
  const normStatus = (status || '').toUpperCase();
  if (normStatus === 'CANCELLED') {
    return { cancellable: false, reason: 'Already cancelled', cutoffHours };
  }
  if (normStatus === 'COMPLETED') {
    return { cancellable: false, reason: 'Already completed', cutoffHours };
  }

  const apptTime = new Date(appointmentDateStr).getTime();
  const currentTime = now.getTime();
  const diffHours = (apptTime - currentTime) / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return { cancellable: false, reason: 'Appointment has already passed', cutoffHours };
  }

  if (diffHours < cutoffHours) {
    return {
      cancellable: false,
      reason: `Facility policy requires at least ${cutoffHours} hours advance notice to cancel online.`,
      cutoffHours,
      hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10)
    };
  }

  return {
    cancellable: true,
    reason: `Cancellable until ${cutoffHours} hours before appointment`,
    cutoffHours,
    hoursRemaining: Math.round(diffHours * 10) / 10
  };
}

/**
 * Fetch patient's appointments schedule across all facilities
 */
async function getPatientSchedule(admin, userId, options = {}) {
  if (!userId) throw new RequestError(401, 'User authentication required.');

  // 1. Resolve all patient IDs associated with this user's profile
  const { data: patientRows, error: pError } = await admin
    .from('patients')
    .select('patient_id, facility_id')
    .eq('profile_id', userId);

  if (pError) throw new RequestError(500, 'Failed to fetch patient records: ' + pError.message);
  if (!patientRows || patientRows.length === 0) {
    return { appointments: [] };
  }

  const patientIds = patientRows.map(p => p.patient_id);

  // 2. Query appointments for these patients
  let query = admin
    .from('appointments')
    .select(`
      appointment_id,
      appointment_date,
      duration,
      status,
      notes,
      procedure_id,
      provider_id,
      facility_id,
      patient_id,
      created_at,
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

  if (options.status) {
    query = query.eq('status', options.status.toUpperCase());
  }

  const { data: appointments, error: aptError } = await query;
  if (aptError) throw new RequestError(500, 'Failed to retrieve appointments: ' + aptError.message);

  const now = options.now ? new Date(options.now) : new Date();
  const cutoffHours = options.cutoffHours ?? DEFAULT_CANCELLATION_NOTICE_HOURS;

  const formatted = (appointments || []).map(apt => {
    const facility = apt.providers?.facilities || {};
    const { dateStr, timeStr } = formatAppointmentDateTime(apt.appointment_date);
    const policy = evaluateCancellationPolicy(apt.appointment_date, apt.status, cutoffHours, now);

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
      providerId: apt.provider_id,
      providerName: apt.providers?.name || 'Assigned Provider',
      providerSpecialty: apt.providers?.specialization || 'General Physician',
      procedureId: apt.procedure_id,
      procedureName: apt.procedures?.name || 'General Consultation',
      cancellationPolicy: policy,
      createdAt: apt.created_at
    };
  });

  return { appointments: formatted };
}

/**
 * Cancel an appointment with facility time-limit policy enforcement
 */
async function cancelPatientAppointment(admin, userId, { appointmentId, reason = '' }, options = {}) {
  if (!userId) throw new RequestError(401, 'User authentication required.');
  if (!appointmentId) throw new RequestError(400, 'Appointment ID is required.');

  // 1. Resolve patient IDs for this user
  const { data: patientRows, error: pError } = await admin
    .from('patients')
    .select('patient_id')
    .eq('profile_id', userId);

  if (pError) throw new RequestError(500, 'Failed to verify patient identity: ' + pError.message);
  const patientIds = (patientRows || []).map(p => p.patient_id);
  if (patientIds.length === 0) {
    throw new RequestError(404, 'No patient records found for this account.');
  }

  // 2. Fetch the appointment to verify ownership and check policy
  const { data: appointment, error: aptError } = await admin
    .from('appointments')
    .select(`
      appointment_id,
      appointment_date,
      status,
      notes,
      patient_id,
      facility_id,
      providers (
        name,
        facilities ( name, contact_num )
      )
    `)
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (aptError) throw new RequestError(500, 'Failed to fetch appointment: ' + aptError.message);
  if (!appointment) throw new RequestError(404, 'Appointment not found.');

  if (!patientIds.includes(appointment.patient_id)) {
    throw new RequestError(403, 'You are not authorized to manage this appointment.');
  }

  // 3. Status checks
  const currentStatus = (appointment.status || '').toUpperCase();
  if (currentStatus === 'CANCELLED') {
    throw new RequestError(400, 'This appointment has already been cancelled.');
  }
  if (currentStatus === 'COMPLETED') {
    throw new RequestError(400, 'Cannot cancel an appointment that has already been completed.');
  }

  // 4. Policy validation (Time-limit check)
  const now = options.now ? new Date(options.now) : new Date();
  const cutoffHours = options.cutoffHours ?? DEFAULT_CANCELLATION_NOTICE_HOURS;
  const policy = evaluateCancellationPolicy(appointment.appointment_date, currentStatus, cutoffHours, now);

  if (!policy.cancellable) {
    const facilityName = appointment.providers?.facilities?.name || 'the clinic';
    const facilityPhone = appointment.providers?.facilities?.contact_num;
    const contactMsg = facilityPhone ? ` (${facilityPhone})` : '';

    if (policy.reason === 'Appointment has already passed') {
      throw new RequestError(400, 'Cannot cancel an appointment that has already passed.');
    }

    throw new RequestError(
      400,
      `Per ${facilityName} policy, cancellations must be made at least ${cutoffHours} hours in advance. ` +
      `Please contact the facility directly${contactMsg} to adjust your schedule.`
    );
  }

  // 5. Update appointment status to CANCELLED in DB
  const cleanReason = typeof reason === 'string' ? reason.trim().slice(0, 300) : '';
  const cancellationNote = cleanReason
    ? `[Cancelled on ${now.toISOString()} - Reason: ${cleanReason}]`
    : `[Cancelled on ${now.toISOString()}]`;

  const updatedNotes = appointment.notes ? `${appointment.notes} ${cancellationNote}` : cancellationNote;

  const { data: updated, error: updateError } = await admin
    .from('appointments')
    .update({
      status: 'CANCELLED',
      notes: updatedNotes
    })
    .eq('appointment_id', appointmentId)
    .select(`
      appointment_id,
      appointment_date,
      status,
      notes
    `)
    .single();

  if (updateError) throw new RequestError(500, 'Failed to update appointment: ' + updateError.message);

  return {
    success: true,
    message: 'Appointment successfully cancelled.',
    appointment: updated
  };
}

/**
 * Validate requested time slot and prevent double-booking
 */
async function validateSlotAvailability(admin, { providerId, appointmentDate, durationMinutes = 60 }) {
  if (!providerId) throw new RequestError(400, 'Provider ID is required.');
  if (!appointmentDate) throw new RequestError(400, 'Appointment date and time is required.');

  const targetDate = new Date(appointmentDate);
  if (isNaN(targetDate.getTime())) {
    throw new RequestError(400, 'Invalid appointment date format.');
  }

  // Check if requested date is in the past
  if (targetDate <= new Date()) {
    throw new RequestError(400, 'Cannot book an appointment in the past.');
  }

  // Buffer window (slot duration)
  const windowStart = new Date(targetDate.getTime() - (durationMinutes - 1) * 60000).toISOString();
  const windowEnd = new Date(targetDate.getTime() + (durationMinutes - 1) * 60000).toISOString();

  // Check existing appointments for the provider
  const { data: conflicts, error } = await admin
    .from('appointments')
    .select('appointment_id, appointment_date')
    .eq('provider_id', providerId)
    .gte('appointment_date', windowStart)
    .lte('appointment_date', windowEnd)
    .neq('status', 'CANCELLED');

  if (error) throw new RequestError(500, 'Failed to check provider schedule: ' + error.message);

  const isAvailable = !conflicts || conflicts.length === 0;

  return {
    available: isAvailable,
    conflicts: conflicts || []
  };
}

module.exports = {
  DEFAULT_CANCELLATION_NOTICE_HOURS,
  formatAppointmentDateTime,
  evaluateCancellationPolicy,
  getPatientSchedule,
  cancelPatientAppointment,
  validateSlotAvailability
};
