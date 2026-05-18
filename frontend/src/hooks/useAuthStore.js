import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        const res = await api.post('/auth/login', { email, password })
        const { user, token } = res.data
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ user, token, isLoading: false })
        return user
      },

      register: async (data) => {
        set({ isLoading: true })
        const res = await api.post('/auth/register', data)
        const { user, token } = res.data
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ user, token, isLoading: false })
        return user
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null })
      },

      updateUser: (updatedUser) => set({ user: updatedUser }),

      initAuth: () => {
        const { token } = get()
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },
    }),
    { name: 'clinic-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)

export default useAuthStore
