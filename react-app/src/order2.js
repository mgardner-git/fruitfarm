import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';


const Order2 = () => {

  const [errorMessage, setErrorMessage] = useState(null); 
  const [order, setOrder] = useState({});
  useEffect(() => {
    axios.post("/api/order/").then(function(response) {
      
      console.log(response.data);
      if (response.status == 200){
        setOrder(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }, []);


  return (
    <ProtectedRoute roles="customer manager">
          <h1>Finalize Order</h1>

    </ProtectedRoute>
  );
}
export default  Order2;