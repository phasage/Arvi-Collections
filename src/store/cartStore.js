import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      // Add item to cart
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
          toast.success(`Updated ${product.name} quantity in cart`)
        } else {
          set({
            items: [...items, { ...product, quantity }]
          })
          toast.success(`Added ${product.name} to cart`)
        }
      },
      
      // Remove item from cart
      removeItem: (productId) => {
        const items = get().items
        const item = items.find(item => item.id === productId)
        
        set({
          items: items.filter(item => item.id !== productId)
        })
        
        if (item) {
          toast.success(`Removed ${item.name} from cart`)
        }
      },
      
      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      // Clear cart
      clearCart: () => {
        set({ items: [] })
        toast.success('Cart cleared')
      },
      
      // Toggle cart visibility
      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },
      
      // Open cart
      openCart: () => {
        set({ isOpen: true })
      },
      
      // Close cart
      closeCart: () => {
        set({ isOpen: false })
      },
      
      // Get cart totals
      getTotals: () => {
        const items = get().items
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        return {
          totalItems,
          totalPrice: parseFloat(totalPrice.toFixed(2))
        }
      },
      
      // Get item count for specific product
      getItemQuantity: (productId) => {
        const item = get().items.find(item => item.id === productId)
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
      })
    }
  )
)

export { useCartStore }