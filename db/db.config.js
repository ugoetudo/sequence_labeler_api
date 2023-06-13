/*
var conConfig = {
    user: 'app_access', 
    password:"wonton_soup", 
    database: 'sequence_labeler', 
    port: '3307'
  }
  var conConfig = {
    user: 'root', 
    password:"G*z7LN83%d&i^xBrMbpxb9P", 
    database: 'mturk_sg', 
    port: '3307'
  }
 */

if (process.env.INSTANCE_CONNECTION_NAME) {
    conConfig = {
        conConfig_TestAPI : {
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DATABASE,
            socketPath: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME
        },
        conConfig : {
            user: process.env.SQ_SQL_USER,
            password: process.env.SQ_SQL_PASSWORD,
            database: process.env.SQ_SQL_DATABASE,
            socketPath: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME
        }
    }
}
else {
    conConfig = {
        conConfig_TestAPI : {
            user: 'root', 
            password:"G*z7LN83%d&i^xBrMbpxb9P", 
            database: 'mturk_sg', 
            port: '3307'
            },
        conConfig : {
            user: 'root', 
            password:"G*z7LN83%d&i^xBrMbpxb9P", 
            database: 'sequence_labeler', 
            port: '3307'
        }
    }
}

module.exports = conConfig;
