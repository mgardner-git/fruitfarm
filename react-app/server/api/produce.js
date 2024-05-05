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

//returns all produce that are not already marked as inventory items in the given location
//(these can be used co create new inventory items)
router.get("/all/:locationId", async function(req, res) {
    let locationId = req.params.locationId;
    const sql = `select P.id, P.name, P.description from produce P where P.id not in 
    (select produceId from inventory I where I.locationId=?)`

    let result = await connection.promise().query(sql,[locationId]);
    result = result[0];
    res.status(200);
    res.json(result);
});

//returns all produce at the given location as well as the amount, if any, in the current users cart.
router.get("/produceAndCart/:location/:search?", async function(req,res) {
    var locationId = req.params.location;
    const search = req.params.search; //may be null

    let sql = `select I.id, P.name, sum(C.quantityAvailable) as quantityAvailable, I.price 
        from inventory I  inner join produce P  on I.produceId = P.id 
        inner join crate C on (I.id=C.inventoryId) 
        where I.locationId=? `
    sql += search ? ` and P.name like ? ` : '';
    sql += `group by inventoryId 
        having quantityAvailable>0`;

    
    let produceResult = await connection.promise().query(sql, search ? [locationId, '%' + search + '%']:[locationId]);
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

router.post("/", async function(req,res) {
    let product = req.body;
    const sql = "insert into produce(name, description) values(?,?)";
    var result = await connection.promise().query(sql, [product.name, product.description]);
    res.status(200);
    res.json(result[0].insertId);

});

module.exports = router;