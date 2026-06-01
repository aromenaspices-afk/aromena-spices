import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aromena_cart')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('aromena_cart', JSON.stringify(items))
  }, [items])

  function addItem(product) {
    setItems(prev => {
      const exists = prev.find(
        i => i.id === product.id && i.size === product.size
      )
      if (exists) {
        return prev.map(i =>
          i.id === product.id && i.size === product.size
            ? { ...i, qty: i.qty + 1, price: product.price ?? i.price }
            : i
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeItem(id, size) {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))
  }

  function updateQty(id, size, qty) {
    if (qty < 1) {
      removeItem(id, size)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.id === id && i.size === size ? { ...i, qty } : i
      )
    )
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem('aromena_cart')
  }

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart, count, total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}