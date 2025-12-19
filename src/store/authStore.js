import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import jwtDecode from 'jwt-decode'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Initialize auth state from stored token
      initializeAuth: () => {
        const token = get().token
        if (token) {
          try {
            const decoded = jwtDecode(token)
            const currentTime = Date.now() / 1000
            
            if (decoded.exp > currentTime) {
              set({ 
                user: decoded.user, 
                isAuthenticated: true,
                isLoading: false 
              })
            } else {
              // Token expired
              get().logout()
            }
          } catch (error) {
            console.error('Invalid token:', error)
            get().logout()
          }
        } else {
          set({ isLoading: false })
        }
      },

      // Login function
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login(credentials)
          const { token, user } = response.data
          
          // Validate token
          const decoded = jwtDecode(token)
          
          set({
            user: decoded.user || user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Register function
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.register(userData)
          const { token, user } = response.data
          
          const decoded = jwtDecode(token)
          
          set({
            user: decoded.user || user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // SSO Login
      ssoLogin: async (provider, token) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.ssoLogin(provider, token)
          const { token: authToken, user } = response.data
          
          const decoded = jwtDecode(authToken)
          
          set({
            user: decoded.user || user,
            token: authToken,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success(`Login with ${provider} successful!`)
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'SSO login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Logout function
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        toast.success('Logged out successfully')
      },

      // Update user profile
      updateProfile: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.updateProfile(userData)
          const updatedUser = response.data.user
          
          set(state => ({
            user: { ...state.user, ...updatedUser },
            isLoading: false
          }))
          
          toast.success('Profile updated successfully!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user
        return user?.role === 'admin'
      },

      // Refresh token
      refreshToken: async () => {
        try {
          const response = await authAPI.refreshToken()
          const { token } = response.data
          
          const decoded = jwtDecode(token)
          
          set({
            user: decoded.user,
            token,
            isAuthenticated: true
          })
          
          return { success: true }
        } catch (error) {
          get().logout()
          return { success: false }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Initialize auth on store creation
useAuthStore.getState().initializeAuth()

export { useAuthStore }