const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');
const {validate, ValidationError, Joi} = require('express-validation');
const dollarFormat = require('./dollarFormat').dollarFormat;


router.use(verifyLoggedIn);
router.get("/byLocation/:locationId", async function(req, res) {
  const sql = "select C.id, quantity, inventoryId, price, P.name, I.locationId, L.name as locationName from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) inner join location L on I.locationId = L.id where C.username=? and L.id=?";    
  const locationId = req.params.locationId;
  let results = await connection.promise().query(sql, [req.user, locationId]);
  results = results[0];
  const returnObj = {
    name: "",
    items: [],
    total: 0
  }
  for (let index=0; index < results.length; index++) {
    const row = results[index];
    returnObj.name = row.locationName;
    const lineItem = {
      id : row.id,
      quantity: row.quantity,
      price: row.price,
      name: row.name
    }
    returnObj.total += row.price*row.quantity;
    lineItem.price = dollarFormat.format(lineItem.price);
    returnObj.items.push(lineItem);
  }
  returnObj.total = dollarFormat.format(returnObj.total);
  res.status(200);
  res.json(returnObj);  
});

router.get('/allLocations', (req, res) => {

    const sql = "select C.id, quantity, inventoryId, price, P.name, I.locationId, L.name as locationName from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) inner join location L on I.locationId = L.id where C.username=?";
    console.log(sql);
    console.log(req.user);
    connection.query(sql, [req.user], (err,result) => {
        if (err) {
            console.log(err);
            res.status(500);
            return res.json(null);
        }
        else if (result) {     
            res.status(200);     
            /*
            {
              total: 111
              locations:[{
                 locationId: 
                 name:,
                 total: 23.01
                 items [
                   {
                     id, name, quantity, price, total
                   }
                 ],
                 total: 20.01                 
              }

            ]}
            */
        
            const returnObj = {
                total:0,
                locations:[]
            };

            console.log(result);
            if (result.length > 0){
              let currentLocId = result[0].locationId;
              let sumByLoc = 0; 
              let locationBlock = null;
              let total = 0;
              
              //increment occurs only in inner while loop
              for (var index=0; index < result.length;) {              
                let row = result[index];
                
                locationBlock =  {items:[], total:0};
                locationBlock.locationId =  row.locationId;
                locationBlock.name = row.locationName;
                currentLocId = row.locationId;

                while(row && row.locationId == currentLocId && index < result.length) {
                  
                  total += row.price*row.quantity;
                  locationBlock.items.push({
                    id: row.inventoryId,
                    name: row.name,
                    quantity: row.quantity, 
                    total: dollarFormat.format(row.quantity*row.price),
                    price: dollarFormat.format(row.price)
                  });

                  locationBlock.total += row.price*row.quantity; //TODO: Do this calculation in database  
                  index++;
                 
                  row = result[index];  //may be undefined                   
                }
                returnObj.total += locationBlock.total;
                locationBlock.total = dollarFormat.format(locationBlock.total);
                returnObj.locations.push(locationBlock);    

              }
              returnObj.total = dollarFormat.format(total);
            }//>0
            res.status(200);
            
            res.json(returnObj);
          } else {
            console.log("Failed to retrieve cart items");
            res.status(500);
            return (res.json(null)); 
          }
    });
});

router.get("/", (req, res) => {
  const sql = "select C.id, quantity, inventoryId, P.name, I.locationId from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) where C.username=?";
  console.log(sql);
  console.log(req.user);
  connection.query(sql, [req.user], (err,result) => {
      if (err) {
          console.log(err);
          res.status(500);
          return res.json(null);
        }
        else if (result) {     
          res.status(200);     
          res.json(result);
        } else {
          console.log("Failed to retrieve cart items");
          res.status(500);
          return (res.json(null)); 
        }  

  });


});

router.delete("/:id", async function(req,res,next) {
  const cartId = req.params.id;
  const connection = await connect().promise().getConnection();
  const sql = "delete from cart where id=? and username=?";
  await connection.query(sql, [cartId, req.user]);
  res.status(200);
  res.json("deleted");

});

//update the cart with new quantities
const cartValidation = {
  body: Joi.array() .items({
      id: Joi.optional(),
      inventoryId: Joi.number().required().messages({"any.required": "You must select a type in inventory."}),
      quantity: Joi.number().required().min(1).messages({
        "any.required": "You must enter a quantity",
        "number.base": "You must enter a numeric quantity",
        "number.min": "You must select at least 1 of each product"
      }),
    })
  };
router.put("/", validate(cartValidation, {},{}), async function(req,res,next) {
  const updateCart = req.body;
  const connection = await connect().promise().getConnection();
  await connection.beginTransaction();
  for (let index=0; index < updateCart.length; index++) {
    var update = updateCart[index];
      
    //update
    const sql = "replace into cart(id, inventoryId, quantity, username) VALUES (?,?,?,?)";
    if (update.quantity < 0) {
        res.status(500);
        res.json("Can't update cart quantity to negative numbers");
        connection.rollback(function() {
          connection.release(); //failure
        });
        break;
    }
    await connection.query(sql, [update.id, update.inventoryId, update.quantity,req.user]);
  }//end for
  await connection.commit();
  res.status(200);
  res.json(true);
  
});

module.exports = router;