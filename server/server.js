const express = require('express');
const app = express();

app.get("/api", (req, res) => {
    res.json({"users": ["userone", "userTwo", "userThree"]});
});

app.listen(5000, () => {
    console.log("server listening at port 5000");
})