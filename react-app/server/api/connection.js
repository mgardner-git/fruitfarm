const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();



//TODO> ENV FILES
const connect = () => {
    const connection =  mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA
    });
    return connection;
}
module.exports = {connect}
  