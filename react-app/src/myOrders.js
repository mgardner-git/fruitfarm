import React from 'react'
import { ProtectedRoute } from './protectedRoute'
import {useEffect, useState} from 'react';
import axios from 'axios';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get("/api/order/myOrders").then(function(response) {
      
      if (response.status == 200){
        for (let index=0; index < response.data.length; index++) {
          response.data[index].time = new Date(response.data[index].time).toDateString();
        }
        setMyOrders(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }, []);


  return (
    <ProtectedRoute roles="customer">
        <h2>myOrders</h2>


        <table border="1">
          <thead>
            <tr> 
              <th>Id#</th><th>Date</th><th>Status</th><th>Destination</th>
            </tr>

          </thead>
          <tbody>
            {myOrders.map((order) => (
              <tr>
                <td>{order.id}</td>
                <td>{order.time}</td>
                <td>{order.status}</td>
                <td>{order.destination_address}</td>
              </tr>
            ))}

          </tbody>
        </table>
    </ProtectedRoute>
  )
}

export default MyOrders