const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn }= require('./verifyLoggedIn');



router.use(verifyLoggedIn);

router.get('/', async function(req, res) {  
    const test = "select serialNumber, quantityAvailable, inventoryId from crate";
    const testResults = await connection.promise().query(test);

    
    const sql = "select I.id, P.name, sum(C.quantityAvailable) as quantityAvailable, I.price from inventory I  inner join produce P  on I.produceId = P.id inner join crate C on (I.id=C.inventoryId) where I.locationId=? group by inventoryId";
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