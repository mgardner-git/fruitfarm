import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from '../protectedRoute';
import {Link} from 'react-router-dom';
import {useNavigate, useSearchParams} from 'react-router-dom';

const ManageOrders = () => {
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
        axios.get("/api/inventory/ordersToApprove/" + locationId).then(function(response) {
            setOrders(response.data);
        });
    }
  }, locationId);

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
          
          <table id = "approveOrders">
            <thead>
                <tr><th>id</th><th>Fulfillable</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                  <tr>
                    <td><h3>{order.id}</h3></td>
                    <td>{order.fulfillable ? "yes":"no"}</td>
                  </tr>
              ))}
            </tbody>
        </table>  
    </ProtectedRoute>
)}
export default ManageOrders;
  