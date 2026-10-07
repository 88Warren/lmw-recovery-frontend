import { useState, useCallback } from 'react'

export function useAdminAuth() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('lmw_admin_token') ?? ''
  )

  const login = useCallback((t) => {
    sessionStorage.setItem('lmw_admin_token', t)
    setToken(t)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('lmw_admin_token')
    setToken('')
  }, [])

  return { token, login, logout, isAuthed: token !== '' }
}
