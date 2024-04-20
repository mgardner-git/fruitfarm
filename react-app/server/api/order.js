const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');




router.use(verifyLoggedIn);
router.post('/', async function(req, res, next) {

    const sql = "select c.id, quantity, inventoryId, price, p.name, I.locationId, L.name as locationName from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) inner join Location L on I.locationId = L.id where c.username=?";
    let cartResults = await connection.promise().query(sql, [req.user]);
    cartResults = cartResults[0];
    if (cartResults.length > 0){
        let currentLocId = cartResults[0].locationId;                
        let responseObject  = {
            orders: [],
            total: 0
        };



        for (var index=0; index < cartResults.length; index++) {              
            let row = cartResults[index];
            
            let order =  {
                locationId: row.locationId,
                destination_address : req.body.address,
                username: req.user,
                items:[], 
                total:0
            };
            
            while(row && row.locationId == currentLocId && index < cartResults.length) {
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
            responseObject.total += order.total;
            
            let createdOrder = await createOrder(order);
            if (createdOrder) {
                responseObject.orders.push(createdOrder); 
            } else {
                res.status(500);
                res.json(null);
                return null;
            }

        }
        console.log(responseObject);
        res.status(200);     
        res.contentType = "application/json";    
        res.json(responseObject);
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
        createdOrder.status = 1; 
    }
    
    return createdOrder;
}
module.exports = router;