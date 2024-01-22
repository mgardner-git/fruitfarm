import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import { ProtectedRoute  } from './protectedRoute';


const Purchase = () => {

  const [myLocation, setMyLocation] = useState(null);
  //TODO: Store users favorite loc perm
  const [locations, setLocations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    axios.get("/api/locations/").then(function(response) {
      debugger;
      console.log(response.data);
      if (response.status !== 500){
        setLocations(response.data);
      } else {
        setErrorMessage(JSON.stringify(response));        
      }
    });
  }, []);


  
  
  return (
      <ProtectedRoute roles="customer manager">
        <div className = "container">
           <div id = "locations">
              <label htmlFor="locations">Locations:</label>
              <select id = "locs">
                {locations.map((loc) => (
                    <option value = {loc.id}> {loc.name}</option>
                ))}
              </select>
              <div>{locations.length}</div>
              <p className = {errorMessage ? "error":"ofscreen"} aria-live="assertive">
                {errorMessage}
              </p>
           </div>
        </div>
      </ProtectedRoute>
  )
}

export default Purchase;