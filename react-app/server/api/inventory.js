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


router.use(verifyLoggedIn);
//find all orders awaiting approval at a given location
router.get('/ordersToApprove/:locationId', async function(req, res) {
    const locationId = req.params.locationId;
    const orders = await getOrdersAtLocationAndStatus(locationId, 1);
    res.status(200);
    res.json(orders);
        
    
});

//find all orders awaiting fulfillment at a given location
router.get('/ordersToFulfill/:locationId', async function(req, res)  {
    const locationId = req.params.locationId;
    const orders = await getOrdersAtLocationAndStatus(locationId, 2);
    res.status(200);
    res.json(orders);
});

async function getOrdersAtLocationAndStatus(locationId, status) {
    const sql = `
    select O.id as orderId, L.price, L.quantity, I.quantityAvailable, P.name, S.status from 
    Orders O inner join LineItem L on (L.orderId = O.id)
    inner join inventory I on (I.id = L.inventoryId) 
    inner join produce P on (I.produceId = P.id)
    inner join (
       select S1.orderId, S1.time, status from order_status s1 inner join (select orderId, max(time) as time from order_status group by orderId) S2 on s1.orderId = S2.orderId and S1.time=S2.time
    ) S on (S.orderId = O.id)
    where O.locationId=? and S.status=?
  `
  
    let result = await connection.promise().query(sql, [locationId, status]);
    const orders= [];
      
    let order = {
        items:[], 
        fulfillable: true
    };
    let lineItems = result[0];
    for (let index=0; index < lineItems.length;) {
        let lineItem = lineItems[index];
        order = {
            id: lineItem.orderId,
            items: [],
            fulfillable: true
        }
        while (index < lineItems.length && lineItem.orderId == order.id) {
            order.items.push(lineItem);
            index++;
            if (lineItem.quantity > lineItem.quantityAvailable) {
                order.isFulfillable =false;
            }
            lineItem = lineItems[index];
        }

        if (lineItems.length > 0) {
            orders.push(order);
        }
    }
    return orders;
}

router.put("/approve/:orderId", async function(req,res)  {
        const orderId = req.params.orderId;
        const statusSql = "INSERT INTO ORDER_STATUS (status, orderId, username, time) values (?,?,?,?)";
        var today = moment().format("YYYY-MM-DD HH:mm:ss");
        let statusResult = await connection.promise().query(statusSql, [2, orderId, req.user, today]);
        res.status(200);
        res.json({});

});

router.put("/fulfill/:orderId", async function(req, res) {
    const orderId = req.params.orderId;
    const statusSql = "INSERT INTO ORDER_STATUS (status, orderId, username, time) values (?,?,?,?)";
    var today = moment().format("YYYY-MM-DD HH:mm:ss");
    let statusResult = await connection.promise().query(statusSql, [3, orderId, req.user, today]);
    //update quantity available for each line item


    let fetchLineItemsSql = "select inventoryId, quantity from lineItem where orderId=?";
    let lineItems = await connection.promise().query(fetchLineItemsSql, [orderId]);
    lineItems = lineItems[0];
    for (let index=0; index < lineItems.length; index++) {
        let lineItem = lineItems[index];
        const reduceInvSql = "update inventory I set quantityAvailable = quantityAvailable - ? where id = ?";
        let reduceResult = await connection.promise().query(reduceInvSql, [lineItem.quantity, lineItem.inventoryId]);
    }
    res.status(200);
    res.json({});
});
module.exports = router;
