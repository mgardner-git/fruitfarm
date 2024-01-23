const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn }= require('./verifyLoggedIn');



router.use(verifyLoggedIn);

router.get('/', (req, res) => {        
    const sql = "select I.id, P.name, I.quantityAvailable, I.price from inventory I  inner join produce P  on I.produceId = P.id where I.locationId=?;";
    const locationId = req.query.location;
    console.log(sql);
    connection.query(sql, [locationId], (err,result) => {
        if (err) {
            res.status(500);
            res.json(null);
        } else if (result) {
            res.status(200);
            res.json(result);
        }
    });
});

module.exports = router;