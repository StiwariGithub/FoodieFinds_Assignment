let express = require('express');
let { resolve } = require('path');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');
let app = express();
let port = 3000;
let cors = require('cors');
app.use(cors());
app.use(express.static('static'));
app.use(express.json());
let db;
(async () => {
  db = await open({
    filename: './BD4_Assignment1/database.sqlite',
    driver: sqlite3.Database,
  });
})();

//Exercise 1: Get All Restaurants

// create the end point /restaurants
// in function write the query to fetch all restaurants
async function getAllRestaurants() {
  let restaurants = 'select * from restaurants';
  let results = await db.all(restaurants, []);
  return results;
}
app.get('/restaurants', async (req, res) => {
  let allRestaurants = await getAllRestaurants();
  if (allRestaurants.length === 0) {
    return res.status(404).json({ message: 'No restaurants are available' });
  }
  res.status(200).json({ restaurants: allRestaurants });
});

// restaurants by id
async function restaurantsBasedOnId(id) {
  let query = 'select * from restaurants where id= ?';
  let results = await db.get(query, [id]);
  return { restaurant: results };
}
app.get('/restaurants/details/:id', async (req, res) => {
  let id = req.params.id;
  let restaurantsList = await restaurantsBasedOnId(id);
  console.log(restaurantsList);
  res.status(200).json(restaurantsList);
});

//3 - Exercise 3: Get Restaurants by Cuisine
async function restaurantsBasedOncuisine(cuisine) {
  let query = 'select * from restaurants where cuisine= ?';
  let results = await db.all(query, [cuisine]);
  return { restaurant: results };
}

app.get('/restaurants/:cuisine', async (req, res) => {
  let cuisine = req.params.cuisine;
  let restaurantsList = await restaurantsBasedOncuisine(cuisine);
  res.status(200).json(restaurantsList);
});
// Exercise 4: Get Restaurants by Filter Objective: Fetch restaurants based on filters such as veg/non-veg, outdoor seating, luxury, etc.

async function getRestaurants(isVeg, hasOutdoorSeating, isLuxury) {
  let query =
    'select * from restaurants where isVeg=? AND hasOutdoorSeating = ? AND isLuxury=?';
  let results = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
  console.log(results);
  return results;
}
app.get('/restaurants/filter/All', async (req, res) => {
  console.log('Al starting' + req.query.isVeg);
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;

  let restaurantsLists = await getRestaurants(
    isVeg,
    hasOutdoorSeating,
    isLuxury
  );
  return res.status(200).json(restaurantsLists);
});

// Get Restaurants Sorted by Rating
function sortedRestaurants(restaurant1, restaurant2) {
  return restaurant1.rating - restaurant2.rating;
}
app.get('/restaurants/filter/rating', async (req, res) => {
  let allRestaurants = await getAllRestaurants();
  console.log(allRestaurants);
  let restaurant = await allRestaurants.sort(sortedRestaurants);
  res.status(200).json({ restaurants: restaurant });
});

// Get All Dishes
async function getAllDishes() {
  let query = 'select * from dishes';
  let results = await db.all(query, []);
  return results;
}

app.get('/dishes', async (req, res) => {
  let result = await getAllDishes();
  res.status(200).json(result);
});

// Dishes by id
async function filterById(id) {
  let query = 'select * from dishes where id = ?';
  let result = await db.get(query, [id]);
  return result;
}
app.get('/dishes/details/:id', async (req, res) => {
  let id = req.params.id;
  let results = await filterById(id);
  res.status(200).json({ dishes: results });
});

// Get Dishes by Filter
async function dishesByType(isVeg) {
  let query = 'select * from dishes where isVeg = ?';
  let result = db.all(query, [isVeg]);
  console.log(query);
  return result;
}
app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let allRestaurants = await dishesByType(isVeg);
  res.status(200).json({ dishes: allRestaurants });
});

//Get Dishes Sorted by Price
async function sortByPrice() {
  let query = 'SELECT * FROM dishes ORDER BY price asc';
  let result = await db.all(query, []);
  return result;
}
app.get('/dishes/sort-by-price', async (req, res) => {
  let result = await sortByPrice();
  res.status(200).json(result);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
