const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');




router.use(verifyLoggedIn);
router.get('/', (req, res) => {
    
    
    const sql = "SELECT id, name, latitude, longitude, address from location";
    console.log(sql);
    connection.query(sql, [], (err,result) => {
      console.log("read " + result.length + " locations");      

      if (err) {
        console.log(err);
        res.status(500);
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