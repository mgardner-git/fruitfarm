//this is mostly for the inventoryManager
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');


router.use(verifyLoggedIn);
//find all orders awaiting approval at a given location
router.get('/ordersToApprove/:locationId', (req, res) => {

    const sql = `
      select O.id as orderId, L.price, L.quantity, I.quantityAvailable, P.name, S.status from 
      Orders O inner join LineItem L on (L.orderId = O.id)
      inner join inventory I on (I.id = L.inventoryId) 
      inner join produce P on (I.produceId = P.id)
      inner join (
	    select orderId, status, time from order_status O1 where time = (select MAX(time) from order_status where orderId = O1.id) 
      ) S on (S.orderId = O.id)
      where O.locationId=? and S.status=1
    `
    const locationId = req.params.locationId;
    connection.query(sql, [locationId], (err,result) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.json(err);
        } else {
            let orders = [];
            let order = {
                items:[], 
                fulfillable: true
            };
            let lineItems = result;
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
            }
            if (lineItems.length > 0) {
                orders.push(order);
            }
            res.status(200);
            res.json(orders);
        }
    });
});
module.exports = router;