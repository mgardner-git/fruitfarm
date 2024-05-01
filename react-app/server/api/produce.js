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

//returns all produce at the given location as well as the amount, if any, in the current users cart.
router.get("/produceAndCart/:location", async function(req,res) {
    var locationId = req.params.location;

    const sql = `select I.id, P.name, sum(C.quantityAvailable) as quantityAvailable, I.price 
        from inventory I  inner join produce P  on I.produceId = P.id 
        inner join crate C on (I.id=C.inventoryId) 
        where I.locationId=? 
        group by inventoryId 
        having quantityAvailable>0`;
    console.log(sql);
    let produceResult = await connection.promise().query(sql, [locationId]);
    produceResult = produceResult[0];
    
    const cartSql = "select C.id, C.inventoryId, C.quantity from cart C inner join inventory I on (C.inventoryId = I.id) where username=? and I.locationId=?";
    let cartResult = await connection.promise().query(cartSql, [req.user, locationId]);
    cartResult = cartResult[0];
    
    for (let index=0; index < produceResult.length; index++) {
        let checkProduce = produceResult[index];
        for (let c = 0; c < cartResult.length; c++) {
            let checkCart = cartResult[c];
            if (checkCart.inventoryId == checkProduce.id) {
                checkProduce.quantity = checkCart.quantity;
                checkProduce.cartId = checkCart.id;
            }
        }
    }
    res.status(200);
    res.json(produceResult);
    
});

module.exports = router;