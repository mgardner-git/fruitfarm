const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const {connect} = require('./connection');
const connection = connect();
const {validate, ValidationError, Joi} = require('express-validation');


function verifyLoggedIn(request, response, next) {
    console.log("verifying logged in");
    next();
}
router.use(verifyLoggedIn);

router.post('/auth', (req, res) => {
  var userId = req.body.userId;
  var password = req.body.password;
  console.log(userId);
  
  const sql = "SELECT username, email, role from user where username = ? and password = ?";
  connection.query(sql, [userId, password], (err,result) => {
    res.contentType = "application/json";
    if (err) {
      console.log(err);
      return res.json(null);
    }
    else if (result && result.length == 1) {
      console.log( userId + " authenticated")
      const name = result[0].username;
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

const regValidation = {
  body: Joi.object({
      userId: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required()
  })
};
router.post('/register', validate(regValidation, {},{}), async (req,res) => {
    res.contentType = "application/json";
    const checkSql = "select count(*) as count from user where username=?";
    let checkResult = await connection.promise().query(checkSql,[req.body.userId]);
    checkResult = checkResult[0][0];

    const checkEmail = "select count(*) as count from user where email=?"
    let emailResult = await connection.promise().query(checkEmail, [req.body.email]);
    emailResult = emailResult[0][0];
    
    if (emailResult.count == 0 && checkResult.count == 0) {
      const values = [
        req.body.userId,
        req.body.password,
        req.body.email ? req.body.email : "-",
        'customer'
      ];
      const sql = "INSERT INTO user (username, password, email, role) values (?,?,?,?)";
      let result = await connection.promise().query(sql, values);      
      res.json(result);
    } else if (checkResult.count > 0) {
      res.status(400);
      res.send("The username " + req.body.userId + " is already taken");
    } else if (emailResult.count > 0) {
      res.status(400);
      res.send("The email " + req.body.email + " is already taken.");
    }    
});

module.exports=router;