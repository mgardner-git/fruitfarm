//this is mostly for the inventoryManager
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const dollarFormat = require('./dollarFormat').dollarFormat;
const {connect} = require('./connection');
const {verifyLoggedIn} = require('./verifyLoggedIn');
const moment = require('moment');
const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss"
const {validate, ValidationError, Joi} = require('express-validation');
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
    const connection = await connect().promise().getConnection();
    const sql = `
    select O.id as orderId,L.id, L.price, L.quantity, I.id as inventoryId, C.quantityAvailable, P.name, S.status from 
    orders O inner join lineItem L on (L.orderId = O.id)
    inner join inventory I on (I.id = L.inventoryId) 
    inner join produce P on (I.produceId = P.id)
    inner join (
       select S1.orderId, S1.time, status from order_status S1 inner join (select orderId, max(time) as time from order_status group by orderId) S2 on S1.orderId = S2.orderId and S1.time=S2.time
    ) S on (S.orderId = O.id)
    inner join (
        select inventoryId, SUM(quantityAvailable) as quantityAvailable from crate group by inventoryId
    ) C on (C.inventoryId = I.id)
    where O.locationId=? and S.status=?
  `
  
    let result = await connection.query(sql, [locationId, status]);
    const orders= [];
      
    let order = {
        items:[], 
        fulfillable: true
    };
    let lineItems = result[0];
    for (let index=0; index < lineItems.length;) {
        let lineItem = lineItems[index];
        lineItem.price = dollarFormat.format(lineItem.price);
        order = {
            id: lineItem.orderId,
            items: [],
            fulfillable: true
        }
        while (index < lineItems.length && lineItem.orderId == order.id) {
            order.items.push(lineItem);
            index++;
            if (lineItem.quantity > lineItem.quantityAvailable) {
                order.fulfillable =false;
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
        const connection = await connect().promise().getConnection();
        const orderId = req.params.orderId;
        const statusSql = "insert into order_status (status, orderId, username, time) values (?,?,?,?)";
        var today = moment().format(DATE_FORMAT);
        let statusResult = await connection.query(statusSql, [2, orderId, req.user, today]);
        res.status(200);
        res.json({});

});


router.put("/fulfill/:orderId", async function(req, res) {
    const connection = await connect().promise().getConnection();
    await connection.beginTransaction();
    const orderId = req.params.orderId;
    const statusSql = "insert into order_status(status, orderId, username, time) values (?,?,?,?)";
    var today = moment().format(DATE_FORMAT);
    let statusResult = await connection.query(statusSql, [3, orderId, req.user, today]);
            
    /*
        put body structure
            [            
                {
                    id: 1, (inventoryId)
                    quantity: 20
                    crates: [
                        {
                            id: 'ab',
                            quantity: 10
                        }, 
                        {
                            id: 'b2',
                            quantity: 10
                        }

                    ]
                }
            ]                
    */

    const items = req.body;  //each is drawing some amount from some crate to fulfill the order
    let errors = [];
    for (let index=0; index < items.length; index++) {
        let item = items[index];
        let totalQuantityReduced = 0; 
        for (let c = 0; c < item.crates.length; c++) {
            let crate = item.crates[c];
            //verify sufficient quantity available
            let checkSql = "select serialNumber, quantityAvailable from crate where serialNumber=?";
            let checkResult = await connection.query(checkSql,[crate.serialNumber]);
            checkResult = checkResult[0];
            if (checkResult.length == 1 && checkResult[0].quantityAvailable >= parseInt(crate.quantity)) {
                let reduceSql = "update crate set quantityAvailable = quantityAvailable-? where serialNumber=? and inventoryId=?";
                let reduceResult = await connection.query(reduceSql, [crate.quantity, crate.serialNumber, item.inventoryId]);
                if (reduceResult[0].affectedRows != 1) {
                    errors.push("Something went wrong updating crate #" + crate.serialNumber);
                } else {
                    totalQuantityReduced += parseInt(crate.quantity);
                }
            } else {
                errors.push("There is only " + checkResult[0].quantityAvailable + " of product in crate # " + crate.serialNumber);                        
            }            
        }
        if (totalQuantityReduced != parseInt(item.quantity)) {
            errors.push("The quantity marked for  lineItem # " + item.lineItemId + " doesn't match the sum of quantities in the crates");                    
        }
    }
    if (errors.length == 0) {
        await connection.commit();
        res.status(200);
        res.send("fulfilled");
     } else {
        await connection.rollback();
        res.status(400);
        res.send(errors);
    }
});

router.put("/reject/:orderId", async function(req, res) {
    const connection = await connect().promise().getConnection();
    const orderId = req.params.orderId;
    const statusSql = "insert into order_status(status, orderId, username, time) values (?,?,?,?)";
    var today = moment().format(DATE_FORMAT);
    let statusResult = await connection.query(statusSql, [8,orderId, req.user, today]);
    res.status(200);
    res.json({});
});

//get the crates that correspond to each line item in an order.
//note that some lineItems could be fulfilled by multiple crates in some cases.
router.get("/crates/:orderId", async function(req,res) {
    const connection = await connect().promise().getConnection();
    const orderId = req.params.orderId;
    const crateSql = 
    ` select O.id, C.serialNumber, L.inventoryId, C.quantityAvailable from 
        orders O inner join lineItem L on (O.id = L.orderId)
        inner join crate C on (C.inventoryId = L.inventoryId)
        where O.id = ?
    `
    const crates = await connection.query(crateSql, [orderId]);
    let result = crates[0];
    res.status(200);
    res.json(result);    
});

router.get("/byLocation/:locationId/:search?", async function(req,res) {
    const connection = await connect().promise().getConnection();
    const locationId = req.params.locationId;
    const search = req.params.search;
    const produceSql = `select I.id, I.produceId, P.name, I.price from 
        inventory I inner join produce P on (I.produceId = P.id) 
        where locationId=? ` + 
        (search ? ` and P.name like ? ` : ``) +
        ` order by P.name ASC`;
    console.log(produceSql);
    let produce = await connection.query(produceSql, search ? [locationId, '%' + search + '%' ]:[locationId]);
    produce = produce[0];
    for (let index=0; index < produce.length; index++) {
        produce[index].price = dollarFormat.format(produce[index].price);
    }
    res.status(200);
    res.json(produce);
});

const invValidation = {
    body: Joi.object({
        id: Joi.optional(),
        produceId: Joi.number().required().messages({"any.required": "You must select a type of produce"}),
        locationId: Joi.number().required().messages({"any.required": "You must first select a location"}),
        name: Joi.optional(),
        price: Joi.number().min(0.01).required().messages({
            "number.min" : "You must enter a positive price",
            "number.base": "You must enter a valid numeric price"
        })
    })
};
router.post("/", validate(invValidation, {},{}), async function(req,res,next) {

    try {
        const connection = await connect().promise().getConnection();
        let inv = req.body;
        if (inv.produceId) {

        }
        const sql = "replace into inventory(id, price, locationId, produceId) VALUES (?,?,?,?)";
        let result = await connection.query(sql, [inv.id, inv.price, inv.locationId, inv.produceId]);
        res.status(200);
        res.json(result);
    } catch (error) {
        return next(error);
    }

});
module.exports = router;
