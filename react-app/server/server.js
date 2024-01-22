const express = require('express');
const  users = require("./api/users");
const locations = require("./api/locations");
const app = express();
const path = require("path");
const cookieParser = require('cookie-parser');

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.json());
app.use(express.static("public"));
app.use("/api/users/", users);
app.use("/api/locations/", locations);

app.listen(8080, () => {
    console.log("server listening at port 8080");
});