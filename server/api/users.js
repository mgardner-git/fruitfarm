const express = require('express');
const router = express.Router();



function verifyLoggedIn(request, response, next) {
    console.log("verifying logged in");
    next();
}


router.use(verifyLoggedIn);

router.get('/auth', (req, res) => {
  var userId = req.params.userId;
  var password = req.params.password;
  console.log(userId);
  console.log(password);
  var result = true; //TODO: Authenticate
  if (result) {
    next();
  } else {
    next("login");
  }
});

router.post('/register', (req,res) => {
    var userId = req.params.userId;
    var password = req.params.password;
    console.log("Register " + userId);
});

export default router;