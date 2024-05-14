import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const Locations = (props) => {
    let [locations, setLocations] = useState([]);

    useEffect(() => {
        axios.get("/api/locations/").then(function(response) {          
            setLocations(response.data);
        }).catch (function(err) {
            console.log(err);
        });
    }, []);

    return (
        <FormControl key={props.value}>
           
        <Select id = "locs" onChange={props.onChange}  value={props.value}>            
            {locations.map((loc) => (
                <MenuItem value = {loc.id}> {loc.name}</MenuItem>
            ))}
        </Select>
        </FormControl>
    )
}
export default Locations;