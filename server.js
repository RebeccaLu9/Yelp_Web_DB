const express = require('express');
const mysql = require('mysql');


const routes = require('./routes')
const config = require('./config.json')
const cors = require('cors');


const app = express();
app.use(cors({
    origin: '*'
}));

// Route 0 - register as GET 
app.get('/hello', routes.hello)

// Route 1 - register as GET ok
app.get('/searchByLocation/:state/:city', routes.searchByLocation);

// Route 2 - register as GET ok
app.get('/searchByName/:name', routes.searchByName)

// Route 3 - register as GET 
app.get('/searchBySpecific', routes.searchBySpecific)

// Route 4 - register as GET ok
app.get('/cityMostTip/:city', routes.cityMostTip)

// Route 5 - register as GET  load too long
app.get('/cityMostReview/:city', routes.cityMostReview)

// Route 6 - register as GET ok
app.get('/scoreAboveRegion/:state/:city', routes.scoreAboveRegion)

// Route 7 - register as GET load too long
app.get('/highScoreFans', routes.highScoreFans)

// Route 8 - register as GET load too long
app.get('/openReviewTip/:open/:close', routes.openReviewTip)

// Route 9 - register as GET load too long
app.get('/categoryActiveUser', routes.categoryActiveUser)

// Route 10 - register as GET 
app.get('/userFriend', routes.userFriend)

// Route 11 - register as GET ok
app.get('/visitInfluencer', routes.visitInfluencer )

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
