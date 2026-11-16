const { randomBytes } = require('node:crypto');
const { RequestError } = require('./provider-accounts');
const { login, rejected } = require('./login');
const {
  OTP_TTL_SECONDS, generateOtpCode, challengeKey, codeHash, tokenHash, maskEmail, defaultSendMail,
} = require('./otp');

// Columns added by security/patient-accounts.sql.
const PROFILE_COLUMNS = 'id, first_name, middle_name, last_name, name_suffix, full_name, email, onboarding_completed_at';
const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

// Same policy as the website: 12-128 characters with upper, lower, number and symbol.
function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return 'Password must be 12 to 128 characters long.';
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Password needs an uppercase letter, a lowercase letter, a number and a symbol.';
  }
  return '';
}

// Accepts 9XXXXXXXXX, 09XXXXXXXXX, 639XXXXXXXXX or +639XXXXXXXXX.
function normalizeMobile(value) {
  const digits = typeof value === 'string' ? value.replace(/[\s()-]/g, '') : '';
  const match = /^(?:\+?63|0)?(9\d{9})$/.exec(digits);
  return match ? '+63' + match[1] : '';
}

function normalizeBirthdate(value) {
  const str = typeof value === 'string' ? value.trim() : '';
  if (!str) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return '';
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) return '';
  if (dt > new Date() || y < 1900) return '';
  return str;
}

function registrationInput(body) {
  if (!body || typeof body !== 'object') throw new RequestError(400, 'Registration details are required.');
  const text = key => typeof body[key] === 'string' ? body[key].trim().replace(/\s+/g, ' ') : '';
  const errors = {};
  const email = text('email').toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'Enter a valid email address.';
  const problem = passwordProblem(body.password);
  if (problem) errors.password = problem;
  const name = (key, label, required) => {
    const value = text(key);
    if (!value) { if (required) errors[key] = `${label} is required.`; return null; }
    if (value.length > 50 || !NAME.test(value)) errors[key] = `Enter a valid ${label.toLowerCase()}.`;
    return value;
  };
  const first_name = name('first_name', 'First name', true);
  const middle_name = name('middle_name', 'Middle name', false);
  const last_name = name('last_name', 'Last name', true);
  const name_suffix = text('name_suffix') || null;
  if (name_suffix && !SUFFIXES.includes(name_suffix)) errors.name_suffix = 'Choose a valid name extension.';

  const date_of_birth = normalizeBirthdate(body.date_of_birth);
  if (date_of_birth === '') errors.date_of_birth = 'Enter a valid birth date in YYYY-MM-DD format.';

  const gender = text('gender') || null;
  if (gender && !GENDERS.includes(gender)) errors.gender = 'Choose a valid gender option.';

  const phone_number = normalizeMobile(body.mobile_number);
  if (!phone_number) errors.mobile_number = 'Enter a valid Philippine mobile number (9XX XXX XXXX).';

  const street_address = text('street_address') || null;
  const barangay = text('barangay') || null;
  const city_municipality = text('city_municipality') || null;
  const province = text('province') || null;
  const zip_code = text('zip_code') || null;
  if (zip_code && !/^\d{4}$/.test(zip_code)) errors.zip_code = 'Enter a valid 4-digit Philippine ZIP code.';

  const address = [street_address, barangay, city_municipality, province, zip_code].filter(Boolean).join(', ')
    || text('address') || null;

  const blood_type = text('blood_type') || null;
  if (blood_type && !BLOOD_TYPES.includes(blood_type)) errors.blood_type = 'Choose a valid blood type.';

  const allergies = text('allergies') ? text('allergies').slice(0, 500) : null;
  const medical_history = text('medical_history') ? text('medical_history').slice(0, 1000) : null;

  if (body.accept_terms !== true || body.accept_privacy !== true) {
    errors.consent = 'Accept the Terms of Service and Privacy Policy to continue.';
  }
  if (Object.keys(errors).length) {
    throw Object.assign(new RequestError(400, Object.values(errors)[0]), { fields: errors });
  }
  const full_name = [first_name, middle_name, last_name, name_suffix].filter(Boolean).join(' ');
  return {
    email, password: body.password, first_name, middle_name, last_name, name_suffix, full_name,
    date_of_birth, gender, phone_number,
    street_address, barangay, city_municipality, province, zip_code, address,
    blood_type, allergies, medical_history
  };
}

function mapProfile(row) {
  return {
    id: row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    fullName: row.full_name || [row.first_name, row.last_name].filter(Boolean).join(' '),
    email: row.email || '',
    onboardingCompleted: !!row.onboarding_completed_at
  };
}

async function loadProfile(admin, userId) {
  const result = await admin.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();
  if (result.error) throw new RequestError(503, 'Your account could not be loaded. Please try again later.');
  return result.data ? mapProfile(result.data) : null;
}

/**
 * Resolves the target email for an OTP challenge.
 * - For 'register': requires a valid email address.
 * - For 'reset': accepts either email or mobile_number (looks up the registered email on the profile).
 */
async function resolveOtpEmail(admin, purpose, body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email) || email.length > 254) {
    throw Object.assign(new RequestError(400, 'Enter a valid email address.'), { fields: { email: 'Enter a valid email address.' } });
  }
  if (purpose === 'register') {
    return email;
  }

  const found = await admin.from('profiles').select('id, email').ilike('email', email).maybeSingle();
  if (found.error) throw new RequestError(503, 'Password reset is temporarily unavailable. Please try again later.');
  if (!found.data?.id || !found.data.email) {
    throw new RequestError(404, 'No patient account was found with that email address.');
  }
  return found.data.email.trim().toLowerCase();
}

/**
 * Issues and emails a 6-character alphanumeric OTP, or verifies a submitted OTP code.
 */
async function handlePatientOtp({ admin, secret, sendMail = defaultSendMail }, body) {
  if (!body || typeof body !== 'object') throw new RequestError(400, 'OTP request details are required.');
  const action = body.action === 'verify' ? 'verify' : 'send';
  const purpose = body.purpose === 'reset' ? 'reset' : 'register';
  const email = await resolveOtpEmail(admin, purpose, body);
  const key = challengeKey(secret, purpose, email);

  if (action === 'send') {
    const code = generateOtpCode();
    const hashedCode = codeHash(secret, purpose, email, code);
    const issued = await admin.rpc('mobile_issue_otp', {
      p_key: key,
      p_purpose: purpose,
      p_email: email,
      p_code_hash: hashedCode,
      p_ttl_seconds: OTP_TTL_SECONDS,
    });
    if (issued.error || !issued.data) {
      throw new RequestError(503, 'OTP verification is not available yet. Run security/mobile-otp.sql in Supabase.');
    }
    if (!issued.data.allowed) {
      const wait = Number(issued.data.retry_after) || 60;
      const reason = issued.data.reason;
      const msg = reason === 'cooldown'
        ? `Please wait ${wait} seconds before requesting another code.`
        : 'Too many OTP requests for this account. Please try again later.';
      throw Object.assign(new RequestError(429, msg), { retryAfter: wait, code: `otp_${reason}` });
    }

    await sendMail({ to: email, code, purpose });
    return {
      sent: true,
      email,
      masked_email: maskEmail(email),
      expires_in: Number(issued.data.expires_in) || OTP_TTL_SECONDS,
      resend_after: Number(issued.data.resend_after) || 60,
    };
  }

  // action === 'verify'
  const rawCode = typeof body.code === 'string' ? body.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '';
  if (rawCode.length !== 6) {
    throw new RequestError(400, 'Enter the 6-character OTP code sent to your email.');
  }
  const verificationToken = randomBytes(24).toString('base64url');
  const hashedCode = codeHash(secret, purpose, email, rawCode);
  const hashedToken = tokenHash(secret, purpose, email, verificationToken);

  const verified = await admin.rpc('mobile_verify_otp', {
    p_key: key,
    p_code_hash: hashedCode,
    p_token_hash: hashedToken,
  });
  if (verified.error || !verified.data) {
    throw new RequestError(503, 'Could not verify the OTP right now. Please try again.');
  }
  if (!verified.data.verified) {
    const reason = verified.data.reason;
    if (reason === 'locked') {
      const wait = Number(verified.data.retry_after) || 900;
      throw Object.assign(
        new RequestError(429, 'Too many incorrect OTP attempts. Please wait 15 minutes and request a new code.'),
        { retryAfter: wait, code: 'otp_locked' }
      );
    }
    if (reason === 'expired') {
      throw new RequestError(400, 'This OTP has expired. Tap Resend to get a new code.');
    }
    const rem = Number(verified.data.remaining);
    throw new RequestError(
      401,
      rem > 0 ? `Incorrect OTP code. ${rem} attempt${rem === 1 ? '' : 's'} remaining.` : 'Incorrect OTP code.'
    );
  }

  return {
    verified: true,
    email,
    otp_token: verificationToken,
  };
}

async function consumeVerifiedOtp(admin, secret, purpose, email, rawToken) {
  if (!secret) return; // Allow unit tests that omit secret
  if (typeof rawToken !== 'string' || !rawToken) {
    throw Object.assign(new RequestError(401, 'Please complete email OTP verification first.'), {
      fields: { otp: 'Please verify the OTP sent to your email.' }
    });
  }
  const key = challengeKey(secret, purpose, email);
  const hashedToken = tokenHash(secret, purpose, email, rawToken);
  const consumed = await admin.rpc('mobile_consume_otp', { p_key: key, p_token_hash: hashedToken });
  if (consumed.error || !consumed.data?.valid) {
    throw Object.assign(new RequestError(401, 'Your OTP verification expired. Please request a new code.'), {
      fields: { otp: 'Your OTP verification expired.' }
    });
  }
}

async function registerPatient(admin, body, { secret } = {}) {
  const input = registrationInput(body);
  const readiness = await admin.from('profiles').select(PROFILE_COLUMNS).limit(1);
  if (readiness.error) throw new RequestError(503, 'Registration is not available yet. Run security/patient-accounts.sql first.');

  await consumeVerifiedOtp(admin, secret, 'register', input.email, body.otp_token);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.email, password: input.password, email_confirm: true,
    app_metadata: { account_type: 'patient' },
    user_metadata: { full_name: input.full_name }
  });
  if (createError || !created?.user) {
    if (['email_exists', 'user_already_exists'].includes(createError?.code)) {
      throw Object.assign(new RequestError(409, 'An account with this email already exists. Log in instead.'),
        { fields: { email: 'This email is already registered.' } });
    }
    if (createError?.code === 'weak_password') {
      throw Object.assign(new RequestError(400, 'Choose a stronger password.'), { fields: { password: 'Choose a stronger password.' } });
    }
    throw new RequestError(503, 'Your account could not be created. Please try again later.');
  }
  const id = created.user.id;
  // Link to an existing walk-in patient profile created by a clinic (matched by email),
  // or insert a new profile row linked to this Auth user ID.
  const { password, ...profile } = input;
  const payload = {
    ...profile,
    terms_accepted_at: new Date().toISOString(),
    privacy_accepted_at: new Date().toISOString(),
  };
  const existing = await admin.from('profiles').select('id').ilike('email', input.email).maybeSingle();
  let saved;
  if (existing.data && existing.data.id !== id) {
    // Re-key the walk-in profile (and any linked patients rows) to the new Auth user ID.
    const oldId = existing.data.id;
    saved = await admin.from('profiles').update({ id, ...payload }).eq('id', oldId);
    if (!saved.error) {
      await admin.from('patients').update({ profile_id: id }).eq('profile_id', oldId);
    }
  } else {
    saved = await admin.from('profiles').upsert({ id, ...payload }, { onConflict: 'id' });
  }
  if (saved.error) {
    await admin.from('profiles').delete().eq('id', id);
    const cleanup = await admin.auth.admin.deleteUser(id);
    if (cleanup.error) throw new RequestError(500, 'Registration failed and the login needs administrator cleanup before retrying.');
    throw new RequestError(500, 'Registration failed. No account was created. Please try again.');
  }
  return { success: true };
}

/**
 * Forgot password (with verified OTP token):
 */
async function resetPatientPassword(admin, body, { secret } = {}) {
  if (!body || typeof body !== 'object') throw new RequestError(400, 'Reset details are required.');
  const email = await resolveOtpEmail(admin, 'reset', body);

  const problem = passwordProblem(body.password);
  if (problem) throw new RequestError(400, problem);

  await consumeVerifiedOtp(admin, secret, 'reset', email, body.otp_token);

  const found = await admin.from('profiles').select('id, email').ilike('email', email).maybeSingle();
  if (found.error || !found.data?.id) {
    throw new RequestError(404, 'No patient account was found with that email address.');
  }

  const updated = await admin.auth.admin.updateUserById(found.data.id, { password: body.password });
  if (updated.error) {
    throw new RequestError(503, 'Could not update your password. Please try again later.');
  }
  return { success: true, email: found.data.email || email };
}

// Only accounts with a patient profile may use the mobile app.
async function patientAccount(admin, user, session) {
  const profile = await loadProfile(admin, user.id);
  if (!profile) return null;
  return { expires_at: session.expires_at, profile };
}

function loginPatient(deps, body) {
  return login({ ...deps, authorize: patientAccount }, body);
}

async function refreshPatientSession({ admin, auth }, body) {
  const token = body?.refresh_token;
  if (typeof token !== 'string' || !token || token.length > 4096) throw new RequestError(401, 'Please log in again.');
  const { data, error } = await auth.auth.refreshSession({ refresh_token: token });
  if (error || !data?.session || !data.user) {
    if (error && error.status !== 400 && error.status !== 401) throw new RequestError(503, 'Could not reach GabayMed. Please try again.');
    throw new RequestError(401, 'Your session expired. Please log in again.');
  }
  const extra = await patientAccount(admin, data.user, data.session);
  if (!extra) throw new RequestError(401, 'Please log in again.');
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token, ...extra };
}

async function verifiedUser(admin, token) {
  if (!token) throw new RequestError(401, 'Please log in again.');
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) throw new RequestError(401, 'Your session expired. Please log in again.');
  return data.user;
}

async function completeOnboarding(admin, token, body) {
  const user = await verifiedUser(admin, token);
  const consent = key => body?.[key] === true;
  const update = await admin.from('profiles').update({
    insurance_consent: consent('insurance_consent'),
    data_sharing_consent: consent('data_sharing_consent'),
    onboarding_completed_at: new Date().toISOString()
  }).eq('id', user.id).select(PROFILE_COLUMNS).maybeSingle();
  if (update.error) throw new RequestError(503, 'Your preferences could not be saved. Please try again.');
  if (!update.data) throw new RequestError(403, 'This account is not a patient account.');
  return { profile: mapProfile(update.data) };
}

async function logoutPatient(admin, token) {
  if (!token) return { success: true };
  // Revokes this device's refresh token. A failure must not block signing out locally.
  try { await admin.auth.admin.signOut(token, 'local'); } catch {}
  return { success: true };
}

module.exports = {
  registrationInput, normalizeMobile, passwordProblem, handlePatientOtp, registerPatient,
  resetPatientPassword, loginPatient, refreshPatientSession, completeOnboarding, logoutPatient, patientAccount, rejected
};
