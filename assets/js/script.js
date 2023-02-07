var favList = JSON.parse(localStorage.getItem("favCities")) || [];
var openMapsApiK = "c4569ddf88609f987ce3eae232bd2c96";
var access_token = "pk.eyJ1IjoiZG1hbmFnbGlhIiwiYSI6ImNsZHRtMzE0ZjFxdDAzcHA2MWh2ZjRwOG4ifQ.a6vf0lK-YsPOBxknrJMJSA";
//location object that hold all necessary information of a given city
function Location (cityName, lat, lon, state, country){
    this.cityName = cityName,
    this.lat = lat,
    this.lon = lon
    this.state = state,
    this.country = country
}
//simple function that retrieves a specific emoji based on the weather id
function getIcon(id, hour) {
    if(id > 199 && id < 300){
        return "🌩️";
    } else if (id > 299 && id < 600) {
        return "🌧️";
    } else if (id > 599 && id < 700) {
        return "❄️";
    } else if (id > 699 && id < 800) {
        return "🌫️";
    } else if (id === 800) {
        if(hour > 4 && hour < 19){
            return "☀️";
        }else {
            return "🌖";
        }
    } else {
        return "☁️";
    }
}
//main functionality of the page, takes in a location object and updates page elements to display the weather information
function printData(locationObj){
    var currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + locationObj.lat + "&lon=" + locationObj.lon + "&units=imperial&APPID=" + openMapsApiK;
    var forcastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + locationObj.lat + "&lon=" + locationObj.lon + "&units=imperial&APPID=" + openMapsApiK;
    //fetch for current weather of the city
    fetch(currentUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }else {
            alert("City was not found.");
        }
    })
    .then(function(data){
        //stops the loading spinner and updates elements
        $("#spinner-current").remove();
        $("#current-city-h1").text(locationObj.cityName + ", " + locationObj.state + ", " + locationObj.country + " " + getIcon(data.weather[0].id, dayjs().$H));
        $("#current-temp").text(data.main.temp);
        $("#current-wind").text(data.wind.speed);
        $("#current-humidity").text(data.main.humidity);
        //checks to see if the current city is already in the favorite city list
        var found = false;
        for(var i = 0; i < favList.length; i++){
            if(favList[i].lat === locationObj.lat && favList[i].lon === locationObj.lon){
                found = true;
            }
        }
        //if its not then also creates a new button element and updates the favorite elements list
        if(!found){
            var addFavEl = $("<button>");
            addFavEl.text(locationObj.cityName + ", " + locationObj.state);
            addFavEl.attr("class", "btn btn-secondary city-btn");
            addFavEl.attr("data-city", locationObj.lat + "_" + locationObj.lon);
            var deleteEL = $("<p>");
            deleteEL.text("X");
            deleteEL.attr("class", "remove-city");
            deleteEL.attr("data-city", locationObj.lat + "_" + locationObj.lon);
            addFavEl.append(deleteEL);
            $("#city-favs").append(addFavEl);
            favList.push(locationObj);
            localStorage.setItem("favCities", JSON.stringify(favList));
        }

    })
    //fetch for the forcasted weather of the city
    fetch(forcastUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }
    })
    .then(function(data){
        //removes all the spinners from each card
        for(var i = 1; i < 6; i++){
            $("#spinner-future"+i).remove();
        }
        //gets the current time in unix format and adds 86400 (amount of time in a day in unix format)
        var tomorrow = dayjs().unix() + 86400;
        var daysAhead = 1; //acts as an index for the forcast
        var daysAdded = 0;
        for(var i = 0; i<data.list.length; i++){
            //creates a string in the same time format as dt_txt inside data
            //I only want the forcast once per day at noon for the next 5 days
            var dateStr = dayjs.unix(tomorrow).format("YYYY-MM-DD") + " 12:00:00";
            if(data.list[i].dt_txt === dateStr){ //once it finds tomorrows forcast at noon it updates the elements
                $("#future-day" + daysAhead).text(dayjs.unix(tomorrow).format("ddd M/D"));
                $("#future-day" + daysAhead + "-icon").text(getIcon(data.list[i].weather[0].id, 12));
                $("#future-day" + daysAhead + "-temp").text(data.list[i].main.temp);
                $("#future-day" + daysAhead + "-wind").text(data.list[i].wind.speed);
                $("#future-day" + daysAhead + "-humidity").text(data.list[i].main.humidity);
                //updates tomorrow variable to the day after
                tomorrow += 86400;
                //increases forcast index and count
                daysAhead ++;
                daysAdded ++;
            }
            //only happens from 12am - 6am every day when forcast list runs out of data to reach noon in 5 days
            //if so sets the 5th and final forcast info card to the last index in the forcast list (earliest it can be is 6:00 am in 5 days)
            if(i === data.list.length-1 && daysAdded === 4){ 
                $("#future-day5").text(dayjs.unix(tomorrow).format("ddd M/D"));
                $("#future-day5-icon").text(getIcon(data.list[i].weather[0].id, 12));
                $("#future-day5-temp").text(data.list[i].main.temp);
                $("#future-day5-wind").text(data.list[i].wind.speed);
                $("#future-day5-humidity").text(data.list[i].main.humidity);
            }
        }        
    })
}
//event listener that will retrive the data-city custom attribute of the city button and find the Location obj with matching coords. in favList local variable
$("#city-favs").on("click", ".city-btn", function(event){
    if($(event.target).attr("class") !== "remove-city"){ //ensures that the user didnt click the remove button. if they did the data wont be displayed
        var cityCords = $(event.target).attr("data-city");
        for(var i = 0; i < favList.length; i++){
            if(cityCords === favList[i].lat + "_" + favList[i].lon){
                addSpinners(); //adds spinners then prints data
                printData(favList[i]);
            }
        }
    }
})
//event listener for the p tag on the each city button that acts like a remove button
//same process as above it gets the custom attribute and find the location object in the local variable 'cityFavs' and removes that location obj
$("#city-favs").on("click", ".remove-city", function(event){
    var cityCords = $(event.target).attr("data-city");
    for(var i = 0; i < favList.length; i++) {
        if(cityCords === favList[i].lat + "_" + favList[i].lon) {
            favList.splice(i, 1);
        }
    }
    localStorage.setItem("favCities", JSON.stringify(favList));
    loadFavs(); //once it is found and removed the list will reload
})
//event listener for the search city input element. Fires any time a key is pressed 
$("#search-txt").on("keyup", function(event){
    //passes the new string to the geocoding API
    fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/" + $(event.target).val() + ".json?limit=5&types=place%2Cpostcode%2Clocality%2Cneighborhood&language=en-US&access_token=" + access_token)
    .then(function(response){
        if(response.ok){
            return response.json();
        }
    })
    .then(function(data){
        if(data.features){ //makes sure the expected data exists 
            var availableTags = [];//will be passed to the autocomplete for reference
            var locations = [];//will hold location objects with all necessary info
            //fetch will give a list of 5 cities that resemble the search text. this gets the necessary data for each city returned
            for(var i = 0; i < data.features.length; i++){
                var placeInfo = data.features[i].place_name.split(",");
                if(placeInfo[0] && placeInfo[1] && placeInfo[2]) {
                    var city = placeInfo[0].trim();
                    var state = placeInfo[1].trim();
                    var country = placeInfo[2].trim();
                    availableTags.push(data.features[i].place_name);
                    locations.push(new Location(city, data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0], state, country));
                }
            }
            //creates a new autocomplete
            $("#search-txt").autocomplete({
                minLength: 1,
                source: availableTags,
                select: function(event, ui) {
                    var tagInfo = ui.item.label.split(",");
                    var city = tagInfo[0].trim();
                    var state = tagInfo[1].trim();
                    var country = tagInfo[2].trim();
                    for(var i = 0; i < locations.length; i++){//once a selection is made it find the matching selection in the list of location objs
                        if(city === locations[i].cityName && state === locations[i].state && country === locations[i].country){
                            addSpinners(); //starts the spinners
                            printData(locations[i]); //calls printData function with the selected location object
                            $(this).val(''); //resets the input element to an empty string
                            return false; //prevents the automplete from actually filling in the input element
                        }
                    }
                }
            });
        }
    })
});
//simple function that resets any information on the page to empty and creates spinners while the code waits for the fetch response
function addSpinners(){
    $("#current-city-h1").text("");
    $("#current-temp").text("--");
    $("#current-wind").text("--");
    $("#current-humidity").text("--");
    var spinner = $("<div>");
    spinner.attr("class", "spinner-border");
    spinner.attr("role", "status");
    spinner.attr("id", "spinner-current");
    $("#current-place").prepend(spinner);
    for(var i = 1; i < 6; i++){
        $("#future-day"+i).text("");
        $("#future-day"+i+"-icon").text("--");
        $("#future-day"+i+"-temp").text("--");
        $("#future-day"+i+"-wind").text("--");
        $("#future-day"+i+"-humidity").text("--");
        var spinner = $("<div>");
        spinner.attr("class", "spinner-border");
        spinner.attr("role", "status");
        spinner.attr("id", "spinner-future"+i);
        $("#card"+i).prepend(spinner);
    }
}
//simple function that clears the favorite cities list then creates a new button for every location object in the local storage variable 'favList'
function loadFavs(){
    $("#city-favs").empty();
    for(var i = 0; i < favList.length; i++){
        var addFavEl = $("<button>");
        addFavEl.text(favList[i].cityName + ", " + favList[i].state);
        addFavEl.attr("class", "btn btn-secondary city-btn");
        addFavEl.attr("data-city", favList[i].lat + "_" + favList[i].lon);
        var deleteEL = $("<p>");
        deleteEL.text("X");
        deleteEL.attr("class", "remove-city");
        deleteEL.attr("data-city", favList[i].lat + "_" + favList[i].lon);
        addFavEl.append(deleteEL);
        $("#city-favs").append(addFavEl);
    }
}
//program starts by loading any favorite city buttons to the webpage if the user already has any location objects in storage
loadFavs();