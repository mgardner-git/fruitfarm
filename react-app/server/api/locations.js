const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();


console.log("initializing location api.");

function verifyLoggedIn(request, response, next) {
    console.log("verifying logged in");
    response.contentType = "application/json";
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log(request.cookies);
    next();
}
router.use(verifyLoggedIn);

router.get('/', (req, res) => {
    
    
    const sql = "SELECT id, name, latitude, longitude, address from location";
    console.log(sql);
    connection.query(sql, [], (err,result) => {
      console.log(result);      

      if (err) {
        console.log(err);
        return res.json(null);
      }
      else if (result) {
        return res.json(result);
      } else {
        console.log("Failed to retrieve locations");
        return (res.json(null));        
      }  
    });
});

  module.exports=router;