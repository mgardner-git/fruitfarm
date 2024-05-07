const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');


router.use(verifyLoggedIn);
router.get('/byUser', (req, res) => {

    const sql = "select id, street1, city, state,zip from address where userId = ?";

    connection.query(sql, [req.user], (err,result) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

router.post("/", async (req, res) => {
    let addr = req.body;    

    const sql = `insert into address(id, street1, street2, city,state,zip,userId) values(?, ?,?, ?,?,?,?) 
        on duplicate key update street1=?, street2=?, city=?, state=?, zip=?`;

    var result = await connection.promise().query(sql, [addr.id,addr.street1, addr.street2, addr.city, addr.state, addr.zip, req.user, addr.street1, addr.street2, addr.city, addr.state, addr.zip]);
    res.status(200);
    res.json(result[0].insertId);
});
module.exports = router;