const express = require('express');
const  users = require("./api/users");
const locations = require("./api/locations");
const produce  = require("./api/produce");
const cart = require("./api/cart");
const order = require("./api/order");
const address = require("./api/address");
const inventory = require("./api/inventory");
const crate = require("./api/crate");
const app = express();
const path = require("path");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use("/api/users/", users);
app.use("/api/locations/", locations);
app.use("/api/produce/", produce);
app.use("/api/cart/", cart);
app.use("/api/order/", order);
app.use("/api/address/", address);
app.use("/api/inventory/", inventory);
app.use("/api/crates/", crate);
const { validate, ValidationError, Joi } = require('express-validation')


const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof ValidationError) {
      const errorList = [];
      for (let index=0; index < err.details.body.length; index++) {
        errorList.push(err.details.body[index].message);
      }
      return res.status(err.statusCode).json(errorList);
    } else {
      return res.status(500).send(err.message ? err.message : err);
    }
    
  };
  app.use(jsonErrorHandler);

app.listen(8080, () => {
    console.log("server listening at port 8080");
});
