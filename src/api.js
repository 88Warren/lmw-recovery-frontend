const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  /** GET /api/treatments */
  getTreatments: () => request('GET', '/api/treatments'),

  /**
   * GET /api/slots — returns start times in the window, each with free_minutes
   * (minutes free before the next booking). Pass durationMins to only return
   * slots with at least that much free time; omit it to get every slot
   * (including taken/partial ones) so the UI can grey them out.
   */
  getSlots: (durationMins, date) => {
    const params = new URLSearchParams()
    if (durationMins) params.set('duration', String(durationMins))
    if (date)         params.set('date', date)
    const qs = params.toString()
    return request('GET', `/api/slots${qs ? '?' + qs : ''}`)
  },

  /**
   * POST /api/bookings — reserves the slot as pending and returns a Stripe
   * Checkout URL. The caller should redirect the browser to checkout_url;
   * the booking is only confirmed after payment (via the Stripe webhook).
   */
  createBooking: (payload) => request('POST', '/api/bookings', payload),

  /** POST /api/bookings/pair — for maintenance plan (2 slots) */
  createBookingPair: (payload) => request('POST', '/api/bookings/pair', payload),

  /** GET /api/bookings/status?session_id=… — poll after Stripe redirect */
  getBookingStatus: (sessionId) =>
    request('GET', `/api/bookings/status?session_id=${encodeURIComponent(sessionId)}`),

  /** GET /api/subscriptions/status?email=… — is this email an active member? */
  getSubscriptionStatus: (email) =>
    request('GET', `/api/subscriptions/status?email=${encodeURIComponent(email)}`),

  /** POST /api/subscriptions/portal — returns a Stripe Customer Portal URL */
  openSubscriptionPortal: (email) =>
    request('POST', '/api/subscriptions/portal', { email }),

  /** POST /api/member/request-link — email a passwordless booking link */
  requestMemberLink: (email) =>
    request('POST', '/api/member/request-link', { email }),

  /** GET /api/member/verify?token=… — validate a magic link token */
  verifyMember: (token) =>
    request('GET', `/api/member/verify?token=${encodeURIComponent(token)}`),

  /** GET /api/bookings/manage?token=… — load a booking for self-service */
  getManagedBooking: (token) =>
    request('GET', `/api/bookings/manage?token=${encodeURIComponent(token)}`),

  /** POST /api/bookings/reschedule — move a booking to a new slot */
  rescheduleBooking: (token, newSlotId) =>
    request('POST', '/api/bookings/reschedule', { token, new_slot_id: newSlotId }),

  /** POST /api/bookings/request-cancellation — ask the studio to cancel */
  requestCancellation: (token, reason) =>
    request('POST', '/api/bookings/request-cancellation', { token, reason }),

  /** POST /api/bookings/manage-portal — Stripe portal to cancel a plan */
  openManagePortal: (token) =>
    request('POST', '/api/bookings/manage-portal', { token }),

  /** GET /api/screening?token=… — load the client's name + submission status */
  getScreening: (token) =>
    request('GET', `/api/screening?token=${encodeURIComponent(token)}`),

  /** POST /api/screening — submit the completed health screening form */
  submitScreening: (payload) => request('POST', '/api/screening', payload),

  /** POST /api/contact */
  sendContact: (payload) => request('POST', '/api/contact', payload),
}
