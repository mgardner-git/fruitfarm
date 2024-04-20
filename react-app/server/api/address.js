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
module.exports = router;