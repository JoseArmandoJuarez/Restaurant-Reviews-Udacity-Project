//global variables
let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
//Initialize map as soon as the page is loaded.
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods(); //fetch neighborhoods
  fetchCuisines(); //fetchCusines
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  //fetchNeighborhoods from the class DBhelper
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else { //
      //this.neighborhoods is going to hold neighborhoods
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML(); //calls this arrow function
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select'); //get the id from neighbor 
  neighborhoods.forEach(neighborhood => { //draws all neightborhoods 
    const option = document.createElement('option'); //creates an element name option
    option.innerHTML = neighborhood; // draws all neighbohood options
    option.value = neighborhood; //gives the value to options
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  //fetchCuisines from the DBHelper class
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines; //this.cuisines hold the values
      fillCuisinesHTML(); //calls arrow function
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select'); //selects id

  cuisines.forEach(cuisine => { //drawing all cuisines
    const option = document.createElement('option'); //creates option element
    option.innerHTML = cuisine; //draws all cuisine options
    option.value = cuisine; //gives value to the options
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */

initMap = () => {
  //L.map -> The central class of the API — it is used to create a map on a page and manipulate it.
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });

  //L.tileLayer -> Used to load and display tile layers on the map.
  //TODO: in mapboxToken add your API KEY. To get one go to https://www.mapbox.com/install/
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: '<your MAPBOX API KEY HERE>',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" aria-hidden="true" tabindex="-1">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/" aria-hidden="true" tabindex="-1">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/" aria-hidden="true" tabindex="-1">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants(); //calls arrow function
}


/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  //The selectedIndex property sets or returns the index of the selected option in a drop-down list.
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  //what ever value has been chosen it adds it to the following variables
  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  //fetchRestaurantByCuisineAndNeighborhood from the DBHelper class
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      //calls the folloswing arrow functions
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list'); //get element restaurants-list

  restaurants.forEach(restaurant => { //loop tru the restaurants
    ul.append(createRestaurantHTML(restaurant)); //append restaurants to the ul element
  });
  addMarkersToMap(); //calls arrow function
}

/**
 * Create restaurant card HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img'); //create image
  image.className = 'restaurant-img'; //add a class name
  image.src = DBHelper.imageUrlForRestaurant(restaurant); //load image for restaurant
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.setAttribute("tabindex", "0");
  more.innerHTML = 'View Details';
  more.setAttribute("aria-label", "View restaurant details in " + restaurant.neighborhood + " from " + restaurant.name + " at " + restaurant.address);
  more.href = DBHelper.urlForRestaurant(restaurant); //add the Url for the restaurant
  li.append(more)

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => { //loops tru the restaurants
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);

    //when user clicks on maker do the following...
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url; //load restaurant page 
    }
    self.markers.push(marker);
  });

}

// service worker
/**
 * The outer block performs a feature detection test to make sure service workers are supported before trying to register one.
 * The navigator.register() function registers the service worker for this site
 * The .then() promise function is used to chain a success case onto our promise structure.  
 * When the promise resolves successfully, the code inside it executes.
 * Finally, we chain a .catch() function onto the end that will run if the promise is rejected.
 * */
if ('serviceWorker' in navigator) {
  self.addEventListener('load', () => {
    navigator.serviceWorker
      .register('../sw.js')
      .then((reg) => console.log('Service Worker: Registered'))
      .catch((error) => console.log('Service Worker: Error: ' + error));
  })
}
