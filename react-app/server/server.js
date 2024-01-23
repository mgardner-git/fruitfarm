const express = require('express');
const  users = require("./api/users");
const locations = require("./api/locations");
const produce  = require("./api/produce");
const cart = require("./api/cart");
const app = express();
const path = require("path");
const cookieParser = require('cookie-parser');

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.json());
app.use(express.static("public"));
app.use("/api/users/", users);
app.use("/api/locations/", locations);
app.use("/api/produce/", produce);
app.use("/api/cart/", cart);
app.listen(8080, () => {
    console.log("server listening at port 8080");
});