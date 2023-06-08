var express = require("express");
var mysql = require("mysql");
var moment = require("moment");
var cors = require('cors');
const conConfig = require("../db/db.config");


//for prod
/*
if (process.env.INSTANCE_CONNECTION_NAME) {
    conConfig = {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
        socketPath: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME,
    }
}
*/
var corsOptions = {
    origin: '*',
  }
var con = mysql.createConnection(conConfig.conConfig_TestAPI);

con.connect(function(err) {
    if (err) throw err;
    console.log("connected");
});

var router = express.Router();
router.use(cors());
router.get("/getPositionInHIT", cors(corsOptions), function(req,res,next) {
    res.setHeader('Content-Type', 'application/json');
    con.query(`select oid, main_text from observation where hitid = ${req.query.htid}`, function (error, results, fields) {
        if (error)
        {
            console.log(error)
        }
        else 
        {
            console.log(results);
            res.json(results);
        } 
    });
});

router.get("/getObservations", cors(corsOptions), function(req,res,next) {
    q_callback = (error, results, fields) => {
        if (error) {throw error};
    }
    let hitid = req.query.hitid;
    let turkid = req.query.turkid;
    res.setHeader('Content-Type', 'application/json');
    //first check if the turker is allowed to request this HIT
    //the turker may not request the hit if they have already completed it 
    //TODO add checks to make sure that a worker is prevented from continuing if the fail the validation test
    //TODO create a HITWork table between HIT and Turk that logs aggregate facts about the turker's interactions with the HIT
    //cont'd... e.g. if the worker failed the validation test, or if the the worker has exceeded the 
    //cont'd... alloted time and the start time of the HIT
    con.query('select count(*) as cnt from turk where amazon_turkid = ?', [turkid], function (error, results, fields) {
        if (results) {
            if (results[0].cnt == 0) {
                con.query('insert into turk SET ?', {amazon_turkid:turkid}, q_callback);
                con.query('select turkid from turk where amazon_turkid = ?', [turkid], function(error, results, fields) {
                    turkid = results[0].turkid;
                    con.query('select distinct t.turkid, a.oid from annotation a, observation o, turk t '+
                              'where a.oid = o.oid and hitid = ? and t.turkid = a.turkid and a.turkid = ?', [hitid, turkid],
                        function (error, results, fields) {
                            let completed_obs = [];
                            if (results.length >= 1) {
                                results.forEach(row => {
                                    completed_obs.push(row.oid);
                                });
                                con.query('select oid,main_text, in_response_text from observation '+
                                          'where hitid = ? and oid not in (?) order by rank_value LIMIT 1',
                                          [hitid, completed_obs], 
                                    function(error,results,fields) {
                                        res.json(results);
                                });
                            }
                            else {
                                con.query('select oid,main_text, in_response_text from observation where hitid = ? order by rank_value LIMIT 1',
                                    [hitid], 
                                    function(error,results,fields) {
                                        res.json(results);
                                });
                            }
                        });
                    });
            }
            else {
                con.query('select turkid from turk where amazon_turkid = ?', [turkid], function(error, results, fields) {
                    turkid = results[0].turkid;
                    con.query('select distinct t.turkid, a.oid from annotation a, observation o, turk t '+
                              'where a.oid = o.oid and hitid = ? and t.turkid = a.turkid and a.turkid = ?', [hitid, turkid],
                        function (error, results, fields) {
                            let completed_obs = [];
                            if (results.length >= 1) {
                                results.forEach(row => {
                                    completed_obs.push(row.oid);
                                });
                                con.query('select oid,main_text, in_response_text from observation '+
                                          'where hitid = ? and oid not in (?) order by rank_value LIMIT 1',
                                          [hitid, completed_obs], 
                                    function(error,results,fields) {
                                        res.json(results);
                                });
                            }
                            else {
                                con.query('select oid,main_text, in_response_text from observation where hitid = ? order by rank_value LIMIT 1',
                                    [hitid], 
                                    function(error,results,fields) {
                                        res.json(results);
                                });
                            }
                        });
                    });
            }
        }
    });
    
});

router.get("/submitAnnotation", cors(corsOptions), function(req, res, next) {
    //1, diagnostic
    //2, prognostic
    //3, motivational
    //4, action mobilization
    //5, gratitude motivation
    //6, none
    //7, success motivation
    //8, consensus mobilization
    var submit = false;
    let hitid = req.query.hitid;
    var turkid = req.query.turkid;
    let oid = req.query.oid;
    let mf = (req.query.mf == 'true');
    let pf = (req.query.pf == 'true');
    let df = (req.query.df == 'true');
    let gf = (req.query.gf == 'true');
    let sf = (req.query.sf == 'true');
    let nf = (req.query.nf == 'true');
    let am = (req.query.am == 'true');
    let cm = (req.query.cm == 'true');
    res.setHeader('Content-Type', 'application/json');
    annotation = {turkid:turkid, oid:oid, frameid:null};
    q_callback = (error, results, fields) => {
        if (error) {throw error};
    }
        con.query('select turkid from turk where amazon_turkid = ?', [turkid],
            function(error, result, next){
                turkid = result[0].turkid;
                annotation_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                con.query('DELETE FROM annotation WHERE oid = ? AND turkid = ?', [oid, turkid], function (e,r,f){
                    if (mf) { con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:3,annotation_time:annotation_time},
                            q_callback);
                            submit = true};
                    if (pf) { con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:2,annotation_time:annotation_time},
                            q_callback);
                            submit = true};
                    if (df) { con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:1,annotation_time:annotation_time},
                            q_callback);
                            submit = true};
                    if (gf) { con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:5,annotation_time:annotation_time}, 
                            q_callback);
                            submit = true};
                    if (sf) { con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:7,annotation_time:annotation_time}, 
                            q_callback);
                            submit = true};
                    if (nf) { con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:6,annotation_time:annotation_time}, 
                            q_callback);
                            submit = true};
                    if (am) {con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:4,annotation_time:annotation_time}, 
                            q_callback);
                            submit = true};
                    if (cm) {con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid, frameid:8,annotation_time:annotation_time}, 
                            q_callback);
                            submit = true};
                    //where there is no frame present, the below is inserted
                    if (!submit) {con.query('INSERT INTO annotation SET ?', {turkid:turkid, oid:oid,annotation_time:annotation_time},
                            q_callback);
                            submit = true;};
                    if (submit) {res.json({status:'OK'})} else {res.json({status:'FAILED'})};
                });
        }); 

});

router.get("/getAnObservation", cors(corsOptions), function(req,res,next) {
    
    if (req.query.oid) {
        let oid = req.query.oid;
        let turkid = req.query.turkid;
        let turkid_isset = false;
        con.query('select turkid from turk where amazon_turkid = ?', [turkid], function(e,r,f) {
            turkid = r[0].turkid;
            res.setHeader('Content-Type', 'application/json');

            con.query('select main_text, in_response_text, observation_type, rank_value, max_observations, frameid '+
            'from observation o left join hit h on o.hitid = h.hitid left join annotation a on a.oid=o.oid '+
            'where o.oid = ? and turkid = ?', [oid, turkid],
            function(error,results,fields) {
                if (error) {throw error}
                else {
                    console.log(results);
                    if (results.length > 0) {
                        res.json(results);
                    }
                    else {
                        con.query('select main_text, in_response_text, observation_type, rank_value, max_observations ' +
                        'from observation o left join hit h on o.hitid = h.hitid ' +
                        'where o.oid = ?', [oid],
                        function(error,results,fields) {
                            if (error) {throw error}
                            else {res.json(results)}
                        });
                    }
                }
            });
        });
        
        
    }
    else if (req.query.hitid && req.query.value_rank) {
        console.log('getobs is called');
        let hitid = req.query.hitid;
        let value_rank = req.query.value_rank;
        value_rank = value_rank - 1;
        let turkid = req.query.turkid;
        con.query('select turkid from turk where amazon_turkid = ?', [turkid], function(e,r,f) {
            turkid = r[0].turkid;
            res.setHeader('Content-Type', 'application/json');
            con.query('select o.oid, main_text, in_response_text, observation_type, rank_value, max_observations, frameid ' + 
                    'from observation o left join annotation a on o.oid = a.oid '+
                    'left join hit h on h.hitid = o.hitid where o.hitid = ? and rank_value = ? and turkid = ?', 
                    [hitid, value_rank, turkid],
                function(error, results, fields) {
                    if (error) {throw error} 
                    else {
                    res.json(results);
                    }
                    
                });
            });
    }
});

router.get('')
module.exports = router;