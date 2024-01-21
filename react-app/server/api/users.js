const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function verifyLoggedIn(request, response, next) {
    console.log("verifying logged in");
    next();
}


router.use(verifyLoggedIn);

//TODO> ENV FILES
const connection =  mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", 
  database: "fruitfarm"
});

router.post('/auth', (req, res) => {
  var userId = req.body.userId;
  var password = req.body.password;
  console.log(userId);
  
  const sql = "SELECT username, email, role FROM USERS WHERE USERNAME = ? AND PASSWORD = ?";
  connection.query(sql, [userId, password], (err,result) => {
    res.contentType = "application/json";
    if (err) {
      console.log(err);
      return res.json(null);
    }
    else if (result && result.length == 1) {
      console.log( userId + " authenticated")
      const name = result[0].userId;
      var secret = process.env.JWT_SECRET;
      const token = jwt.sign({name}, secret, {expiresIn: '1d'});
      res.cookie('token', token);
      return res.json(result[0]);
    } else {
      console.log("auth failed");
      return (res.json(null));
      
    }  
  });
});

router.post('/register', (req,res) => {
    //TODO: Enable email on the front end and do some basic syntax checking
    res.contentType = "application/json";
    const values = [
      req.body.userId,
      req.body.password,
      req.body.email ? req.body.email : "-"
    ];
    const sql = "INSERT INTO USERS ('username', 'email', 'password') values (?,?,?)";
    connection.execute(sql, [values], (err, result,fields) => {
      if (err) {
        console.log(err);
        return res.json({Message: "Error Authenticating"}) ;
      }else {
        return res.json(result);
      }
    });

});

module.exports=router;