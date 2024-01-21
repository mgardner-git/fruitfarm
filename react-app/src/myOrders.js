import React from 'react'
import { ProtectedRoute } from './protectedRoute'
const myOrders = () => {
  return (
    <ProtectedRoute roles="customer">
        <div>myOrders</div>
    </ProtectedRoute>
  )
}

export default myOrders