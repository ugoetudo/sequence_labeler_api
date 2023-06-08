var express = require("express");
var mysql = require("mysql");
var moment = require("moment");
var cors = require('cors');
var MyConConfig = require("../db/db.config");


//for dev
//https://sequence-labeler-ui-dot-opim-big-data-analytics.ue.r.appspot.com
var corsOptions = {
    origin: '*',
  }

Array.prototype.contains = function(v) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
        arr.push(this[i]);
        }
    }
    return arr;
};

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
var con = mysql.createConnection(MyConConfig.conConfig);

con.connect(function(err) {
    if (err) throw err;
    console.log("connected");
});

var router = express.Router();
router.use(cors())
router.get('/HITLength', cors(corsOptions), function(req, res, next) {
    var hitid = req.query.hitid;
    res.setHeader('Access-Control-Allow-Origin', '*')
    con.query('select hitid, count(*) as cnt from sentence where hitid = ? group by hitid', 
        [hitid], function(error, results, fields){
            if(error){
                console.log(error);
            }
            else if (results) {
                res.json(results);
            }
        });
    
});

router.get('/submitAnnotation', cors(corsOptions), function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const annotation_labels = {person:1,place:2,organization:3,religion:4,ideology:5,'problem practice':6,'combatant group':7,victim:8, 'other group':9}
    //none label is id 99
    var hitid = req.query.hitid;
    var turkid = req.query.turkid;
    var sid = req.query.sid;
    var tkids = req.query.tkids; //this will be a list of ids //will need to loop to insert each token into annotation table
    var tksjson = JSON.parse(tkids)
    console.log(tksjson)
    con.query('select turkid from turk where amazon_turkid = ?', [turkid], function(error, results, fields) {
        turkid = results[0].turkid;
        con.query('update annotation set deprecated = 1 where sid = ? and turkid = ?',[sid, turkid], function(e,r,f){
            if (e) {
                console.log(e)
            }
            if (Object.keys(tksjson).length > 0)
            {
                var annotations = []
                //deprecate any existing annotation for this sentence made by this turk
                annotations = Object.keys(tksjson)
                var labels = []
                annotations.forEach(key => labels.push(Object.keys(tksjson[key])));
                var unique_labels = []
                var insertAnnotation = function(uuid, tokens, label) {
                    annotation_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    tokens.forEach(tk => {
                        con.query('insert into annotation set ?',
                        {turkid:turkid,
                            spanid:uuid,
                            annotation_time:annotation_time, 
                            labelid:annotation_labels[label], 
                            tkid:tk.token_position,
                            hitid:hitid,
                            sid:sid,
                            token_text:tk.token_literal,
                            deprecated:0});
                    });
                }
                for (var i = 0; i < labels.length; i++) {
                    unique_labels = labels.unique()
                }
                if (unique_labels.length > 0) {
                    unique_labels.forEach(x => {
                        annotations.forEach(key => {
                            
                            //console.log(`processing: ${tksjson[key][x]}`);
                            if (tksjson[key][x]) {
                                insertAnnotation(key,tksjson[key][x],x);
                            }
                        });
                    });
                }
                res.json({status:'OK'});
            }
            else 
            {
                annotation_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                con.query('insert into annotation set ?',
                                {turkid:results[0].turkid,
                                    annotation_time:annotation_time, 
                                    labelid:99, 
                                    tkid:null,
                                    hitid:hitid,
                                    sid:sid,
                                    token_text:null,
                                    deprecated:0});
                res.json({status:'OK',notes:'no labels added'});
            }
        })
    })
});

router.get('/getObservationByRank', cors(corsOptions), function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    var hitid = req.query.hitid;
    var rank_value = req.query.value_rank;
    var turkid = req.query.turkid;

    con.query('select turkid from turk where amazon_turkid = ? ',
        [turkid], function(error, results, fields) {
            let int_turkid = results[0].turkid;
            if (error) {console.log(error)}
            console.log(int_turkid)
            con.query('select spanid, s.sid, tkid, token_text, label_name, rank_value '+
                      'from annotation a, sentence s, label l where a.sid = s.sid and l.labelid = a.labelid '+
                      'and turkid = ? and rank_value = ? and a.hitid = ? and deprecated = 0', [int_turkid, rank_value-1, hitid], 
                function (e,r,f) {
                    if (e) {
                        console.log(e)
                    }
                    else {
                        
                        con.query('select s.sid, t.tkid, token_text, s.rank_value from token t, sentence s where t.sid = s.sid ' + 
                                  'and s.hitid = ? and s.sid = ?', [hitid, r[0].sid], function (er, re, ef){
                                    if (er) {
                                        console.log(er)
                                    }
                                    else {
                                        console.log(r)
                                        res.json([r,re]);
                                        
                                    }
                                  });
                    }
            });
        });
});

router.get('/getObservation', cors(corsOptions), function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*')
    console.log("get obs called")
    obs_callback = (error, results, fields) => {
        if (error) {throw error}
    }
    let hitid = req.query.hitid;
    let turkid = req.query.turkid;
    console.log([hitid, turkid]);
    let turkid_isset = false;
    //first check if this request is coming from a turker already in our database
    con.query('select count(*) as cnt from turk where amazon_turkid = ?', 
    [turkid], function (error, results, fields) {
        if (results) {
            console.log(results)
            if (results[0].cnt == 0) { //cnt is the column name
                //if the request is not coming from a turker in our database,
                //then we create a new turker and retrieve its turkid
                console.log(results)
                con.query('insert into turk SET ?', {amazon_turkid:turkid}, obs_callback);
            }
        }
        else 
            console.log('no results');
        con.query('select turkid from turk where amazon_turkid = ?', 
        [turkid], function(error, results, fields) {
            turkid = results[0].turkid;
            console.log('turk_id is '+ turkid)
            //turkids and not amazon_turkids are used for internal annotation
            //we want to check if this turkid has been used to annotate any part of this hit before
            con.query('SELECT DISTINCT sid FROM annotation WHERE hitid = ? AND turkid = ?',
                        [hitid,turkid], function(e,r,f) {
                            let completed_sents = [];
                            //console.log(r)
                            if (r.length > 0) {
                                //if it has been used to annotate this hit before, lets get a list of the sentences that it has
                                //annotated
                                r.forEach(row => {
                                    completed_sents.push(row.sid)
                                });
                                //now lets retrieve the NEXT sentence and its tokens (only returning a single sentence)
                                con.query('select s.sid, tkid, token_text, rank_value from token t, sentence s where s.sid = t.sid and s.sid = '+
                                            '(select sid from sentence where hitid = ? and sid not in (?)'+ 
                                            'order by rank_value asc limit 1) order by tkid asc',
                                            [hitid, completed_sents], function(e,r,f) {
                                                console.log(r)
                                                res.json(r);
                                            });
                            }
                            else
                            {
                                console.log(hitid)
                                con.query('select s.sid, tkid, token_text, rank_value from token t, sentence s where s.sid = t.sid and s.sid = '+
                                            '(select sid from sentence where hitid = ?'+ 
                                            'order by rank_value asc limit 1) order by tkid asc',
                                            [hitid], function(e,r,f){
                                                if (r) {
                                                    console.log('called');
                                                    res.json(r);
                                                }
                                                else {console.log('not r')}
                                            });
                            }
                        });
        });
    });
});

router.get('/getButtons', cors(corsOptions), function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    con.query('select label_name from label', function (e,r,f){
        if (e) {
            throw e;
        }
        else {
            res.json(r)
        }
    });
});

router.get('/getHITSize', cors(corsOptions), function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*')
    let hitid = req.query.hitid
    con.query('select count(*) as hit_size from sentence where hitid = ?',[hitid],
        function(e,r,f){
            if (e) {throw e}
            else {
                res.json(r);
            }
        })
});

module.exports = router;