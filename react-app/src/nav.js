import React from 'react';
import {Link} from 'react-router-dom';
import { ProtectedLink} from './components/protectedLink';
const nav = () => {
  return (
    <ul id="nav">
        <li>
            <Link to="/login">Login</Link>
        </li>
        <li>
            <Link to="/register">Register as a new User</Link>
        </li>
        <li><ProtectedLink roles="customer inventoryManager" to = "/purchase">Purchase Fruit</ProtectedLink></li>
        <li><ProtectedLink roles="customer inventoryManager" to = "/searchProducts">Search Products</ProtectedLink></li>
        <li><ProtectedLink roles="customer" to = "/myOrders">View Previous Orders</ProtectedLink></li>
        <li><ProtectedLink roles="customer" to = "/account">Account</ProtectedLink></li>
        <li><ProtectedLink roles = "inventoryManager" to = "/approveOrders">Approve Orders</ProtectedLink></li>
        <li><ProtectedLink roles = "inventoryManager" to = "/fulfillOrders">Fulfill Orders</ProtectedLink></li>
        <li><ProtectedLink roles = "inventoryManager" to = "/crates">Manage Crates</ProtectedLink></li>
        <li><ProtectedLink roles = "inventoryManager" to = "/inventory">Manage Inventory</ProtectedLink></li>
        <li><ProtectedLink roles = "inventoryManager" to = "/produce">Manage Produce</ProtectedLink></li>
    </ul>
  )
}

export default nav;