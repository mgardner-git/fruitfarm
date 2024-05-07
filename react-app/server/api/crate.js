//this is mostly for the inventoryManager
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');
const moment = require('moment');


const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss"

router.use(verifyLoggedIn);

router.get('/:locationId/:search?', async function(req, res) {
    const locationId = req.params.locationId;
    const search = req.params.search; //may be null
    let sql = `select serialNumber, C.locationId, C.inventoryId, quantityAvailable, P.name
        from crate C left join inventory I on (C.inventoryId = I.id)
        inner join produce P on (P.id = I.produceId)
        where C.locationId = ? `;
    sql += search ? ` and serialNumber like ? ` : '';
    sql += `order by serialNumber`;
    let results = await connection.promise().query(sql, search ? [locationId, '%' + search + '%'] : [locationId]);
    results = results[0];
    res.status(200);
    res.json(results);
});

router.delete('/:serialNumber', async function(req,res) {
    let sql = "delete from crate where serialNumber=?";
    let serialNumber = req.params.serialNumber;
    let deleteResult = await connection.promise().query(sql, [serialNumber]);
    res.status(200);
    res.json("deleted"); 
});



router.post('/', async function(req, res, next) {
    try {
            let sql = "replace into  crate (serialNumber, locationId, inventoryId, quantityAvailable) values (?,?,?,?)";
            let crate = req.body;
            let serialNumber = req.params.serialNumber;
            let updateResult = await connection.promise().query(sql, [crate.serialNumber, crate.locationId, crate.inventoryId, crate.quantityAvailable]);
            res.status(200);
            res.json("Completed");
    } catch (err) {
        next(err.message);
    }
});


module.exports = router;
