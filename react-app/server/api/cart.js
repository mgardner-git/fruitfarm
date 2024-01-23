const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {verifyLoggedIn} = require('./verifyLoggedIn');

router.use(verifyLoggedIn);
router.get('/', (req, res) => {
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
            return res.json(result);
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
  for (let index=0; index < updateCart.length; index++) {
    var update = updateCart[index];
    if (update.cartId) {
      //update
      const sql = "UPDATE CART SET QUANTITY = ? WHERE ID = ?";
      connection.query(sql, [update.quantity,update.cartId], (err,result) => {
        if (err) {
            console.log(err);
            res.status(500);
            return res.json(null);
        }
        else if (result) {     
            res.status(200);     
            return res.json(result);
        } else {
            console.log("Failed to update cart items");
            res.status(500);
            return (res.json(null)); 
        }
      });
    }else {
      //create 
      const sql = "INSERT INTO CART (QUANTITY, INVENTORYID, USERNAME) VALUES (?,?,?)";
      connection.query(sql, [update.quantity,update.cartId, req.username], (err,result) => {
        if (err) {
          console.log(err);
          res.status(500);
          return res.json(null);
        }
        else if (result) {     
            res.status(200);     
            return res.json(result);
        } else {
            console.log("Failed to update cart items");
            res.status(500);
            return (res.json(null)); 
        }
      });
    } 
  }//end for 
});

module.exports = router;