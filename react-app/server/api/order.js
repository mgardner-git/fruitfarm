const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');


/*
#1. Approval
#2. Invoice
#3. Paid
#4. Fulfillment
#5. Shipped
#6. Received
#7. closed
*/

router.use(verifyLoggedIn);

router.get("/myOrders", async function(req, res, next) {
    const sql = 
    `
    select O.id, O.userId, O.locationId,A.street1, A.street2, A.city, A.state, A.zip, UNIX_TIMESTAMP(S1.time)*1000 as time , 
    case 
      when S1.status=1 then "Awating Approval"
      when S1.status=2 then "Invoice Sent"
      when S1.status=3 then "Order Paid, Awaiting Fulfillment"
      when S1.status=4 then "In Fulfillment"
      when S1.status=5 then "Shipped"
      when S1.status=6 then "Received"
      when S1.status=7 then "Closed"
      when S1.status=8 then "Rejected"
   end as status, 
   S1.username as auth 
   from orders O 
   inner join (
   select S2.username, S2.orderId, S2.status, S2.time
    from order_status S2 inner join
       (select orderId, MAX(time) as time from order_status group by orderId) S3 ON (S2.orderId = S3.orderId and S2.time = S3.time)
   ) S1 on (O.id = S1.orderId)
   inner join address A on (A.id=O.destination_address)
   where O.userId=?
   `    
    
    let orderResults = await connection.promise().query(sql, [req.user]);
    orderResults = orderResults[0];
    res.status(200);
    res.json(orderResults);
});
router.post('/:locationId', async function(req, res, next) {
    const locationId = req.params.locationId;
    const sql = "select C.id, quantity, inventoryId, price, p.name, I.locationId, L.name as locationName from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) inner join location L on I.locationId = L.id where C.username=? and L.id=?";
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
    
    const sql = "insert into orders (userId, locationId, destination_address) values (?,?,?)";
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
        const lineItemSQL = "insert into lineItem(orderId, inventoryId, price, quantity) values (?,?,?,?)";
        let lineItemResult = await connection.promise().query(lineItemSQL, [createdOrder.id, lineItem.inventoryId, lineItem.price, lineItem.quantity]);

        let createdLineItem = {
            id: lineItemResult[0].insertId,
            price: lineItem.price,
            quantity: lineItem.quantity
        }
        createdOrder.total += lineItem.price * lineItem.quantity;
        createdOrder.items.push(createdLineItem);

        //now create the status change object and tie it to the purchasing user
        const statusSql = "INSERT INTO order_status (status, orderId, username, time) values (?,?,?,?)";
        var today = moment().format("YYYY-MM-DD HH:mm:ss");
        let statusResult = await connection.promise().query(statusSql, [1, createdOrder.id, order.username, today]);

        //now delete all the cart items at that location
        const deleteSql = "delete from cart where id in ( select id from (select C.id from cart C inner join inventory I on (C.inventoryId = I.id) where C.username=? and I.locationId=?) as C1)";
        let deleteCartResult = await connection.promise().query(deleteSql, [order.username, order.locationId]);

        createdOrder.status = 1; 
    }
    
    return createdOrder;
}

router.get("/history/:orderId", async function(req, res, next) {
    const sql = 
    `
    select O.id, O.userId, O.locationId, UNIX_TIMESTAMP(S.time)*1000 as time, S.username as auth , 
    case 
      when S.status=1 then "Awating Approval"
      when S.status=2 then "Invoice Sent"
      when S.status=3 then "Order Paid, Awaiting Fulfillment"
      when S.status=4 then "In Fulfillment"
      when S.status=5 then "Shipped"
      when S.status=6 then "Received"
      when S.status=7 then "Closed"
      when S.status=8 then "Rejected"
   end as status  
   from orders O inner join order_status S on (O.id=S.orderId)
   where O.id=?`
   const orderId = req.params.orderId;
   let results = await connection.promise().query(sql,[orderId]);
   results = results[0];
   res.status(200);
   res.json(results);
});
   
   
module.exports = router;