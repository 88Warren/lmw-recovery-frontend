const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function getToken() {
  return sessionStorage.getItem('lmw_admin_token') ?? ''
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)

  // 401 means token is wrong — clear it so the login screen shows
  if (res.status === 401) {
    sessionStorage.removeItem('lmw_admin_token')
    throw new Error('unauthorised')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data
}

export const adminApi = {
  // Slots
  listSlots:    ()         => request('GET',    '/api/admin/slots'),
  createSlots:  (payload)  => request('POST',   '/api/admin/slots', payload),
  deleteSlot:   (id)       => request('DELETE', `/api/admin/slots/${id}`),

  // Bookings
  listBookings:   ()   => request('GET',   '/api/admin/bookings'),
  cancelBooking:  (id) => request('PATCH', `/api/admin/bookings/${id}/cancel`),

  // Contacts
  listContacts: () => request('GET', '/api/admin/contacts'),
}
