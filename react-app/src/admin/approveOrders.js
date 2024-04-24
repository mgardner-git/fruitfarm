import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../protectedRoute';
import {Link} from 'react-router-dom';
import {useNavigate, useSearchParams} from 'react-router-dom';
import App from '../App';

const ApproveOrders = () => {
  const navigate = useNavigate();
  
  const [locationId, setLocationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); 
  const [orders, setOrders] = useState([]);
  const [locations, setLocations] = useState([]);
 
    
  useEffect(() => {
    axios.get("/api/locations").then(function(response) {
        setLocations(response.data);
    });
  }, []);


  useEffect(() => {
    if (locationId) {
        loadOrders();
    }
  }, locationId);

  function loadOrders() {
    axios.get("/api/inventory/ordersToApprove/" + locationId).then(function(response) {
        setOrders(response.data);
    });
  }
  function approveOrder(e, orderId) {
    e.preventDefault();
    console.log("approving " + orderId);
    axios.put("/api/inventory/approve/" + orderId).then(function(response) {
        loadOrders();
    });
  }

  function rejectOrder(e, orderId) {
    e.preventDefault();
    console.log("rejecting " + orderId);
    axios.put("/api/inventory/reject/" + orderId).then(function(response) {
        loadOrders();
    });
  }


  return (
    <ProtectedRoute roles="inventoryManager">
        <h1>Approve Orders</h1>
          <label>Locations</label>
          
          <select id = "locs" onChange={(e) => setLocationId(e.target.value)}>
                <option value = {null}> </option>
                {locations.map((loc) => (
                    <option value = {loc.id}> {loc.name}</option>
                ))}
          </select>
          {locationId != null && orders.length > 0 ? ( 
          <table id = "approveOrders">
            <thead>
                <tr><th>id</th><th>Fulfillable</th></tr>
            </thead>
            <tbody>              
              {orders.map((order) => (
                <>
                  <tr>
                    <td><h3>{order.id}</h3></td>
                    <td>{order.fulfillable ? "yes":"no"}</td>
                    {order.fulfillable && 
                        <td>
                            <button onClick={(e) => approveOrder(e, order.id)}>Aprove Order</button>                            
                            <button onClick={(e) => rejectOrder(e,order.id)}>Reject Order</button>
                        </td>
                    }
                  </tr>
                  <tr>
                    <td></td>
                    <td>

                        <table id = "lineItems">
                            <thead>
                                <tr><th>Name</th><th>Price</th><th>Quantity Ordered</th><th>Quantity Available</th></tr>
                            </thead>
                            <tbody>
                            {order.items.map((item) => (
                                <tr>
                                    <td>{item.name}</td>
                                    <td>{item.price}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.quantityAvailable}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
        </table>  
          ): (
            <h3>There are no orders to approve</h3>
          )}
    </ProtectedRoute>
)}
export default ApproveOrders;
  