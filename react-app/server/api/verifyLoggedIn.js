const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


function verifyLoggedIn(request, response, next) {
    console.log("verifying logged in");
    response.contentType = "application/json";
    const JWT_SECRET = process.env.JWT_SECRET;
    const cookie = request.headers.cookie;
    if (cookie) {
        let parts = cookie.split('=');
        if (parts[0] === 'token'){
            let token = parts[1];
            jwt.verify(token, process.env.JWT_SECRET, function(error, decryptedToken) {
                
                if (error){
                    console.log(error);
                    response.status(500);
                    return response.json(null);
                } else {
                    console.log("decrypted token: ");
                    request.user = decryptedToken.name;
                    console.log(request.user);
                    request.user = request.user.replace('\'', '');
                    next();
                }
            });
        }
    } else {
        response.status(500);
        return response.json(null);
    }
}
module.exports = {verifyLoggedIn}