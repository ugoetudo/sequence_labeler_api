var conConfig = {
    user: 'app_access', 
    password:"wonton_soup", 
    database: 'sequence_labeler', 
    port: '3307'
  }
var conConfig_TestAPI = {}
if (process.env.INSTANCE_CONNECTION_NAME) {
    conConfig_TestAPI = {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
        socketPath: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME
    },
    conConfig = {
        user: process.env.SQ_SQL_USER,
        password: process.env.SQ_SQL_PASSWORD,
        database: process.env.SQ_SQL_DATABASE,
        socketPath: '/cloudsql/' + process.env.INSTANCE_CONNECTION_NAME
    }
}

module.exports = conConfig;
//module.exports = conConfig_TestAPI;