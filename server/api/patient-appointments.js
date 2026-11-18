const { createClient } = require('@supabase/supabase-js');
const appointments = require('../lib/patient-appointments');
const { RequestError } = require('../lib/provider-accounts');

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (target, init) => fetch(target, { ...init, signal: AbortSignal.timeout(10000) }) },
  });
}

function bearer(req) {
  return /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')?.[1];
}

async function verifiedUser(admin, token) {
  if (!token) throw new RequestError(401, 'Please log in again.');
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) throw new RequestError(401, 'Your session expired. Please log in again.');
  return data.user;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.headers.origin;
  if (origin) {
    let sameHost = false;
    try { sameHost = new URL(origin).host === req.headers.host; } catch {}
    if (!sameHost && origin !== (process.env.CLIENT_ORIGIN || 'http://localhost:5173')) {
      return res.status(403).json({ error: 'Origin is not allowed.' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }

  if (req.method === 'OPTIONS') return res.status(204).end();

  const allowedMethods = ['GET', 'POST', 'PATCH', 'DELETE'];
  if (!allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods.join(', '));
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const admin = client();
  if (!admin) {
    return res.status(503).json({ error: 'Appointment service is temporarily unavailable.' });
  }

  try {
    const token = bearer(req);
    const user = await verifiedUser(admin, token);
    const urlObj = new URL(req.url, 'http://localhost');

    // 1. GET: Fetch patient schedule
    if (req.method === 'GET') {
      const status = urlObj.searchParams.get('status');
      const result = await appointments.getPatientSchedule(admin, user.id, { status });
      return res.status(200).json(result);
    }

    // 2. PATCH or DELETE: Process appointment cancellation
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const appointmentId = req.body?.appointmentId || req.body?.appointment_id || urlObj.searchParams.get('id');
      const reason = req.body?.reason || '';
      const result = await appointments.cancelPatientAppointment(admin, user.id, { appointmentId, reason });
      return res.status(200).json(result);
    }

    // 3. POST: Multi-action handler (cancellation, availability check, schedule fetch)
    if (req.method === 'POST') {
      const action = req.body?.action || 'get_schedule';

      if (action === 'cancel') {
        const appointmentId = req.body?.appointmentId || req.body?.appointment_id;
        const reason = req.body?.reason || '';
        const result = await appointments.cancelPatientAppointment(admin, user.id, { appointmentId, reason });
        return res.status(200).json(result);
      }

      if (action === 'check_availability') {
        const { providerId, appointmentDate, durationMinutes } = req.body;
        const result = await appointments.validateSlotAvailability(admin, { providerId, appointmentDate, durationMinutes });
        return res.status(200).json(result);
      }

      // Default POST action: get schedule
      const status = req.body?.status;
      const result = await appointments.getPatientSchedule(admin, user.id, { status });
      return res.status(200).json(result);
    }

  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || 'An error occurred while processing appointment request.',
      code: error.code || undefined
    });
  }
};
