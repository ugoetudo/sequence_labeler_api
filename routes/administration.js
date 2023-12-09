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
    var all_sentences_stmt = `SELECT s.sid, tkid, a.hitid, t.token_text 
    FROM sentence s JOIN token t ON s.sid = t.sid 
    JOIN assignment a ON s.sid = a.sid 
    WHERE a.hitid = ?`
    
    var worker_annotation_statement = `SELECT DISTINCT s.sid, amazon_turkid AS worker_name, a.labelid, label_name, t.tkid, 
    t.token_text 
    FROM token t JOIN sentence s ON t.sid = s.sid JOIN assignment amt ON amt.sid = s.sid`
});