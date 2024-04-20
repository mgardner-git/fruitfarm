const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();



//TODO> ENV FILES
let connection = null;

const connect = () => {
    if (connection) {
        return connection;
    }else {
        connection =  mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_SCHEMA
        });
        return connection;
    }
}
module.exports = {connect}
  