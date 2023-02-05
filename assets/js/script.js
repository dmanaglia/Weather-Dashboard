var favList = JSON.parse(localStorage.getItem("favCities")) || [];
var openMapsApiK = localStorage.getItem("openMaps");
var access_token = localStorage.getItem("mapBox")


function Location (cityName, lat, lon){
    this.cityName = cityName,
    this.lat = lat,
    this.lon = lon
}


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

function printData(lat, lon){
    var currentUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&APPID=" + openMapsApiK;
    var forcastUrl = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&APPID=" + openMapsApiK;

    fetch(currentUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }else {
            alert("City was not found.")
        }
    })
    .then(function(data){
        console.log(data);
        $("#current-city-h1").text(data.name + ", " + data.sys.country + " " + getIcon(data.weather[0].id, dayjs().$H));
        $("#current-temp").text(data.main.temp);
        $("#current-wind").text(data.wind.speed);
        $("#current-humidity").text(data.main.humidity);
        var found = false;
        for(var i = 0; i < favList.length; i++){
            if(favList[i].cityName === data.name){
                found = true;
            }
        }
        if(!found){
            var addFavEl = $("<button>");
            addFavEl.text(data.name);
            addFavEl.attr("class", "btn btn-secondary city-btn");
            addFavEl.attr("data-city", data.name);
            var deleteEL = $("<p>");
            deleteEL.text("X");
            deleteEL.attr("class", "remove-city");
            deleteEL.attr("data-city", data.name);
            addFavEl.append(deleteEL);
            $("#city-favs").append(addFavEl);
            favList.push(new Location(data.name, lat, lon));
            localStorage.setItem("favCities", JSON.stringify(favList));
        }

    })

    fetch(forcastUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }
    })
    .then(function(data){
        var tomorrow = dayjs().unix() + 86400;
        var daysAhead = 1;
        var daysAdded = 0;
        for(var i = 0; i<data.list.length; i++){
            var dateStr = dayjs.unix(tomorrow).format("YYYY-MM-DD") + " 12:00:00";
            if(data.list[i].dt_txt === dateStr){
                $("#future-day" + daysAhead).text(dayjs.unix(tomorrow).format("ddd M/D"));
                $("#future-day" + daysAhead + "-icon").text(getIcon(data.list[i].weather[0].id, 12));
                $("#future-day" + daysAhead + "-temp").text(data.list[i].main.temp);
                $("#future-day" + daysAhead + "-wind").text(data.list[i].wind.speed);
                $("#future-day" + daysAhead + "-humidity").text(data.list[i].main.humidity);
                tomorrow += 86400;
                daysAhead ++;
                daysAdded ++;
            }
            if(i === data.list.length-1 && daysAdded === 4){ //only happens from 12am - 6am every day when list runs out of data to reach noon in 5 days
                $("#future-day5").text(dayjs.unix(tomorrow).format("ddd M/D"));
                $("#future-day5-icon").text(getIcon(data.list[i].weather[0].id, 12));
                $("#future-day5-temp").text(data.list[i].main.temp);
                $("#future-day5-wind").text(data.list[i].wind.speed);
                $("#future-day5-humidity").text(data.list[i].main.humidity);
            }
        }        
    })
}

// function getCords (cityName) {
//     //ahhhhhh
// }

// figure out if the search button is worth having

// $("#search-btn").on("click", function(event){
//     event.preventDefault();
//     var cityName = $("#search-txt").val();
//     printData(getCords(cityName));
//     $("#search-txt").val("");
// });

function loadFavs(){
    $("#city-favs").empty();
    for(var i = 0; i < favList.length; i++){
        var addFavEl = $("<button>");
        addFavEl.text(favList[i].cityName);
        addFavEl.attr("class", "btn btn-secondary city-btn");
        addFavEl.attr("data-city", favList[i].cityName);
        var deleteEL = $("<p>");
        deleteEL.text("X");
        deleteEL.attr("class", "remove-city");
        deleteEL.attr("data-city", favList[i].cityName);
        addFavEl.append(deleteEL);
        $("#city-favs").append(addFavEl);
    }
}


$("#city-favs").on("click", ".city-btn", function(event){
    if($(event.target).attr("class") !== "remove-city"){
        var cityName = $(event.target).attr("data-city");
        for(var i = 0; i < favList.length; i++){
            if(cityName === favList[i].cityName){
                printData(favList[i].lat, favList[i].lon);
            }
        }
    }
})

$("#city-favs").on("click", ".remove-city", function(event){
    var removeCity = $(event.target).attr("data-city");
    for(var i = 0; i < favList.length; i++) {
        if(favList[i].cityName === removeCity) {
            favList.splice(i, 1);
        }
    }
    localStorage.setItem("favCities", JSON.stringify(favList));
    loadFavs();
})

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        alert("Geolocation is not supported by this browser. Search city manually");
    }
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    printData(lat, lon);
}

loadFavs();
getLocation();

$("#search-txt").on("keyup", function(event){
    fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/" + $(event.target).val() + ".json?limit=5&types=place%2Cpostcode%2Clocality%2Cneighborhood&language=en-US&access_token=" + access_token)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        var availableTags = [];
        var locations = [];

        for(var i = 0; i < data.features.length; i++){
            availableTags.push(data.features[i].place_name);
            locations.push(new Location(data.features[i].place_name, data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]));
        }

        $("#search-txt").autocomplete({
            source: availableTags,
            select: function(event, ui) {
                for(var i = 0; i < locations.length; i++){
                    if(ui.item.label === locations[i].cityName){
                        printData(locations[i].lat, locations[i].lon);
                    }
                }
            }
        });
    })
});


// mapboxgl.accessToken = access_token;
// const geocoder = new MapboxGeocoder({
// accessToken: mapboxgl.accessToken,
// types: 'place,postcode,locality,neighborhood'
// });
 
// geocoder.addTo('#geocoder');
 
// // Get the geocoder results container.
// const results = document.getElementById('result');
 
// // Add geocoder result to container.
// geocoder.on('result', (e) => {
// console.log(e.result);

// });

// ------------------------------------------------------------------------------------------------------------------

// const ACCESS_TOKEN = access_token;
 
// const script = document.getElementById('search-js');
// script.onload = () => {
//     const collection = mapboxsearch.autofill({
//         accessToken: ACCESS_TOKEN,
//         types: 'place,postcode,locality,neighborhood'
//     });
// };

    

