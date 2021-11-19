const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();


// ********************************************
//            SIMPLE ROUTE EXAMPLE
// ********************************************

// Route 1 (handler)
async function hello(req, res) {
    // a GET request to /hello?name=Steve
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the Yelp server!`)
    } else {
        res.send(`Hello! Welcome to the Yelp server!`)
    }
}


/* ---- Query 1, Find basic operation information of all businesses by location (city, state) search, eg. Boston, MA ---- */
const searchByLocation = (req, res) => {
    console.log('Search all businesses by location (city, state), eg. Boston, MA:');
    var state = req.params.state
    var city = req.params.city
    const query = `
    SELECT business_id, name, address, city, state, postal_code, stars, review_count   
    FROM business 
    WHERE state = '${state}' AND city = '${city}'
    ORDER BY stars, review_count LIMIT 10
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 2, Find basic information of restaurants by name search ---- */
const searchByName = (req, res) => {
    var name = req.params.name//req.query.name ? req.query.name: 'good'
    console.log('Find basic information of restaurants by name search:');
    const query = `
    SELECT business_id, name, address, city, state, postal_code, stars, review_count   
      FROM business 
      WHERE name LIKE '%${name}%'
      ORDER BY stars, review_count
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 3, Find restaurants within a specific category (eg. Asian, salad), and specific attributes and facilities (eg. outdoor seating and free wifi available) ---- */
const searchBySpecific = (req, res) => {
    console.log('Find restaurants within a specific category, attributes and facilities:');
    const query = `SELECT business_id, name, address, city, state, postal_code, stars, review_count
    FROM business 
    WHERE stars BETWEEN ${starsLow} AND ${starsHigh}
    AND review_count BETWEEN ${reviewCountLow} AND ${reviewCountHigh}
    AND categories LIKE ‘%${categoryChoice}%’ 
    AND attributes_WiFi = ‘free’ 
    AND attributes_BikeParking LIKE ‘${bikeParkingTF}’ 
    AND attributes_BusinessParking LIKE ‘%${parkingChoice}%’
    AND attributes_BusinessAcceptsCreditCards LIKE ‘%${creditCardTF}%’
    AND attributes_RestaurantsReservations LIKE ‘%${reserveTF}%’
    AND attributes_WheelchairAccessible LIKE ‘%${accessibleTF}%’
    AND attributes_Caters LIKE ‘%${catersTF}%’
    AND attributes_OutdoorSeating LIKE ‘%${outdoorSeatingTF}%’
    AND attributes_RestaurantsGoodForGroups LIKE ‘%${groupsTF}%’
    AND attributes_RestaurantsPriceRange2 BETWEEN ${priceLow} AND ${priceHigh} 
    AND attributes_Ambience LIKE ‘%${ambientChoice}%’
    AND attributes_HasTV LIKE ‘%${tvTF}%’
    AND attributes_Alcohol LIKE ‘%${alcoholChoice}%’
    AND attributes_GoodForMeal LIKE ‘%${mealChoice}%’ 
    AND attributes_RestaurantsTakeOut = ‘%${takeoutTF}%’
    AND attributes_NoiseLevel LIKE ‘%${noiseChoice}%’
    AND attributes_RestaurantsAttire LIKE ‘%${attireChoice}%’
    AND attributes_RestaurantsDelivery = ‘%${deliveryTF}%’
    AND attributes_GoodForKids = ‘%${kidsTF}%’
    AND attributes_ByAppointmentOnly = ‘%${apptOnlyTF}%’
    ORDER BY stars, review_count LIMIT 10
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };


/* ---- Query 4, Select the restaurants (business name) in a specific city that received the most tips given by the users ---- */
const cityMostTip = (req, res) => {
    console.log('Restaurants with most tips in city:');
  
    var city = req.params.city
    const query = `
    With temp AS (
        SELECT business_id, COUNT(*) AS number
        FROM tip_legit
        GROUP BY business_id
        ORDER BY number desc)
        
        SELECT name
        FROM business b join temp t
        ON b.business_id = t.business_id
        WHERE city = '${city}'
      
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 5, Select the business name in a specific city that has the maximum amount of funny reviews ---- */
const cityMostReview = (req, res) => {
    console.log('Top 20 restaurants with most reviews in city:');
    var city = req.params.city
    const query = `
      WITH Temp AS (
        SELECT business_id, SUM(funny) AS funny_review
        FROM reviews_legit
        GROUP BY business_id
        ORDER BY funny_review desc)

        SELECT name
        FROM business b join Temp t
        ON b.business_id = t.business_id
        WHERE city = '${city}'
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 6, Find information of restaurants with scores that are above average in a region.  ---- */
const scoreAboveRegion = (req, res) => {
  console.log('Restaurants with scores above average in region:');
  var state = req.params.state
  var city = req.params.city
  const query = `
    WITH temp AS(
    SELECT AVG(stars) AS avg
    FROM business 
    WHERE state = '${state}' AND city = '${city}'
    )
    SELECT business_id, name, address, city, state, postal_code, stars, review_count, avg FROM temp, business
    WHERE state = '${state}' AND city = '${city}' AND stars > avg
    ORDER BY stars, review_count LIMIT 20
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
};

  

/* ---- Query 7, Find information about high-rated businesses that are among the top-rated businesses, which are also recommended by influencer users, ie. those who have many fans.  ---- */
const highScoreFans = (req, res) => {
    console.log('High-rated businesses with many fans:');
    const query = `
    SELECT user_id, review.text, review.star, business_id
    FROM review JOIN user USING(user_id) JOIN business USING(business_id)
    WHERE review.stars > average_stars
    AND business_id IN (SELECT business_id FROM business ORDER BY stars LIMIT 500)
    ORDER BY fans 
    DESC LIMIT 100
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 8, Find restaurant information currently open and display most recent reviews and tips  ---- */
const openReviewTip = (req, res) => {
    console.log('Open restaurant with most recent reviews and tips:');
    const query = `
    SELECT business_id, name, address, city, state, postal_code, stars, review_count, hours.Monday_open, hours.Monday_close, hours.Tuesday_open, hours.Tuesday_close, hours.Wednesday_open, hours.Wednesday_close, hours.Thursday_open, hours.Thursday_close, hours.Friday_open, hours.Friday_close, hours.Saturday_open, hours.Saturday_close, hours.Sunday_open, hours.Sunday_close, review.text, tip.text
    FROM business JOIN review USING(business_id) JOIN tip USING(business_id)
    WHERE CURRENT_TIME()>= TIME('${hour_day_open}') 
    AND CURRENT_TIME()<= TIME('${hour_day_close}') 
    ORDER BY date
    LIMIT 10
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 9, Find the restaurant category of the 100 most active Yelp users visit most frequently(reviewed multiple times)  ---- */
const categoryActiveUser = (req, res) => {
    console.log('Restaurant category loved by active Yelp users:');
    const query = `
    With yelper as (
        SELECT user_id
        FROM user
        ORDER BY review_count desc
        LIMIT 100)
       SELECT categories, count(*) as visitnumber
    FROM business b JOIN review r
    ON b.business_id = r.business_id
    JOIN yelper ON yelper.user_id = r.user_id
    GROUP BY categories
    ORDER BY visitnumber desc
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 10, Find the restaurants that both user ABC’s friend and user ABC reviewed.  ---- */
const userFriend = (req, res) => {
    console.log('Restaurants loved by User and Friends:');
    const query = `
    SELECT business_id
    FROM review r
    WHERE user_id = ‘ABC’
    JOIN
    (SELECT business_id
    FROM review r
    WHERE user_id IN (SELECT u1.user_id
    FROM user u1 JOIN user u2
    ON u1.user_id in u2.friends
    WHERE u2.user_id = ‘ABC’)) as b ON b.business_id = r.business_id
    `;
    connection.query(query, (err, rows, fields) => {
      if (err) console.log(err);
      else {
          console.log(rows);
          res.json(rows);
      }
      ;
    });
  };

/* ---- Query 11, Find restaurant information with reviews, visited by influencers   ---- */
const visitInfluencer = (req, res) => {
  console.log('Restaurants visited by influencers:');
  const query = `
  SELECT influncer.user_id, influncer.useful, fans, reviews_legit.business_id, reviews_legit.text FROM
(SELECT user_id, useful, fans FROM user_noFriends WHERE fans > 1500) AS influncer
JOIN reviews_legit ON influncer.user_id = reviews_legit.user_id
  `;
  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else {
        console.log(rows);
        res.json(rows);
    }
    ;
  });
};

module.exports = {
    hello,
    searchByLocation:searchByLocation,
    searchByName:searchByName,
    searchBySpecific:searchBySpecific,
    cityMostTip:cityMostTip,
    cityMostReview:cityMostReview,
    scoreAboveRegion:scoreAboveRegion,
    highScoreFans:highScoreFans,
    openReviewTip:openReviewTip,
    categoryActiveUser:categoryActiveUser,
    userFriend:userFriend

}
