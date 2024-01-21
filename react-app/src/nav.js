import React from 'react';
import {Link} from 'react-router-dom';
const nav = () => {
  return (
    <ul id="nav">
        <li>
            <Link to="/login">Login</Link>
        </li>
        <li>
            <Link to="/register">Register as a new User</Link>
        </li>
        <li><Link to = "/purchase">Purchase Fruit</Link></li>
        <li><Link to = "/myOrders">View Previous Orders</Link></li>

    </ul>
  )
}

export default nav;