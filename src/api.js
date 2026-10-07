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

  /** GET /api/slots?duration=60 — returns available start times for a given treatment duration */
  getSlots: (durationMins, date) => {
    const params = new URLSearchParams()
    if (durationMins) params.set('duration', String(durationMins))
    if (date)         params.set('date', date)
    const qs = params.toString()
    return request('GET', `/api/slots${qs ? '?' + qs : ''}`)
  },

  /** POST /api/bookings */
  createBooking: (payload) => request('POST', '/api/bookings', payload),

  /** POST /api/bookings/pair — for maintenance plan (2 slots) */
  createBookingPair: (payload) => request('POST', '/api/bookings/pair', payload),

  /** POST /api/contact */
  sendContact: (payload) => request('POST', '/api/contact', payload),
}
