const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');




router.use(verifyLoggedIn);
router.post('/:locationId', async function(req, res, next) {
    const locationId = req.params.locationId;
    const sql = "select c.id, quantity, inventoryId, price, p.name, I.locationId, L.name as locationName from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) inner join Location L on I.locationId = L.id where c.username=? and L.id=?";
    let cartResults = await connection.promise().query(sql, [req.user, locationId]);
    cartResults = cartResults[0];
    if (cartResults.length > 0){

        let order =  {
            locationId: locationId,
            destination_address : req.body.address,
            username: req.user,
            items:[], 
            total:0
        };

        for (var index=0; index < cartResults.length; index++) {              
            let row = cartResults[index];
            order.total += row.price*row.quantity;
            order.items.push({
                inventoryId: row.inventoryId,
                name: row.name,
                quantity: row.quantity,                       
                price: row.price
            });  
            index++;
            row = cartResults[index];            
            
        }    
        let createdOrder = await createOrder(order);
        if (createdOrder) {
            order = createdOrder;
        } else {
            res.status(500);
            res.json(null);
            return null;
        }
    
        res.status(200);     
        res.contentType = "application/json";    
        res.json(order);
        return;
    }
});

//TODO: TRANSACTIONALITY
async function createOrder(order) {
    
    const sql = "INSERT INTO ORDERS (userId, locationId, destination_address) values (?,?,?)";
    console.log("Creating order: ");
    console.log(order);
    let createdOrder = {
        items: [],
        total: 0
    }


    let orderResult = await connection.promise().query(sql, [order.username, order.locationId, order.destination_address]);
    createdOrder.id = orderResult[0].insertId;
        
    for (var index=0; index < order.items.length; index++) {
        var lineItem = order.items[index];
        const lineItemSQL = "INSERT INTO LINEITEM (orderId, inventoryId, price, quantity) values (?,?,?,?)";
        let lineItemResult = await connection.promise().query(lineItemSQL, [createdOrder.id, lineItem.inventoryId, lineItem.price, lineItem.quantity]);

        let createdLineItem = {
            id: lineItemResult[0].insertId,
            price: lineItem.price,
            quantity: lineItem.quantity
        }
        createdOrder.total += lineItem.price * lineItem.quantity;
        createdOrder.items.push(createdLineItem);

        //now create the status change object and tie it to the purchasing user
        const statusSql = "INSERT INTO ORDER_STATUS (status, orderId, username) values (?,?,?)";
        let statusResult = await connection.promise().query(statusSql, [1, createdOrder.id, order.username]);

        //now delete all the cart items at that location
        const deleteSql = "delete from cart where id in ( select id from (select c.id from cart c inner join inventory i on (c.inventoryId = i.id) where c.username=? and i.locationId=?) as c1)";
        let deleteCartResult = await connection.promise().query(deleteSql, [order.username, order.locationId]);

        createdOrder.status = 1; 
    }
    
    return createdOrder;
}
module.exports = router;