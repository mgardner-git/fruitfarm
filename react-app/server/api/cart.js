const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');

router.use(verifyLoggedIn);
router.get('/byLocation', (req, res) => {

    // Create our number formatter.
    const dollarFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',

      // These options are needed to round to whole numbers if that's what you want.
      //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    }); //TODO: Componentize this


    const sql = "select c.id, quantity, inventoryId, price, p.name, I.locationId, L.name as locationName from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) inner join Location L on I.locationId = L.id where c.username=?";
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
              
              for (var index=0; index < result.length; index++) {              
                let row = result[index];
                
                locationBlock =  {items:[], total:0};
                locationBlock.locationId =  row.locationId;
                locationBlock.name = row.locationName;

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
                  currentLocId = row.locationId;
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
  const sql = "select c.id, quantity, inventoryId, p.name, I.locationId from cart C inner join inventory I on (C.inventoryId = I.id) inner join produce P on (I.produceId = P.id) where c.username=?";
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

//update the cart with new quantities
router.put("/", (req,res) => {
  /*
  [
   {cartId: 1, inventoryId: 2, QUANTITY: 2 },
  ]
  ]
  */
  const updateCart = req.body;
  //TODO: This is not transactional
  for (let index=0; index < updateCart.length; index++) {
    var update = updateCart[index];
    
    //update
    const sql = "REPLACE INTO CART(id, inventoryId, quantity, username) VALUES (?,?,?,?)";
    console.log(sql);
    console.log(update);
    console.log(req.user);
    connection.query(sql, [update.id, update.inventoryId, update.quantity,req.user], (err,result) => {
      if (err) {
          console.log(err);
          res.status(500);
          return res.json(null);
      }
    });
  }//end for
  res.status(200);
  res.json(true);
});

module.exports = router;