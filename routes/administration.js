var express = require("express");
var mysql = require("mysql");
var moment = require("moment");
var cors = require('cors');
var MyConConfig = require("../db/db.config");

var corsOptions = {
    origin: "*",
  }
var router = express.Router();
var con = mysql.createConnection(MyConConfig.conConfig);
con.connect(function(err) {
    if (err) throw err;
    console.log("connected");
});

router.get('/Agreement', cors(corsOptions), function(req, res, next) {
    
});