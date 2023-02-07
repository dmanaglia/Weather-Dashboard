var favList = JSON.parse(localStorage.getItem("favCities")) || [];
var openMapsApiK = "c4569ddf88609f987ce3eae232bd2c96";
var access_token = "pk.eyJ1IjoiZG1hbmFnbGlhIiwiYSI6ImNsZHRtMzE0ZjFxdDAzcHA2MWh2ZjRwOG4ifQ.a6vf0lK-YsPOBxknrJMJSA";

function Location (cityName, lat, lon, state, country){
    this.cityName = cityName,
    this.lat = lat,
    this.lon = lon
    this.state = state,
    this.country = country
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

function printData(locationObj){
    var currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + locationObj.lat + "&lon=" + locationObj.lon + "&units=imperial&APPID=" + openMapsApiK;
    var forcastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + locationObj.lat + "&lon=" + locationObj.lon + "&units=imperial&APPID=" + openMapsApiK;

    fetch(currentUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }else {
            alert("City was not found.")
        }
    })
    .then(function(data){
        $("#spinner-current").remove();
        $("#current-city-h1").text(locationObj.cityName + ", " + locationObj.state + ", " + locationObj.country + " " + getIcon(data.weather[0].id, dayjs().$H));
        $("#current-temp").text(data.main.temp);
        $("#current-wind").text(data.wind.speed);
        $("#current-humidity").text(data.main.humidity);
        var found = false;
        for(var i = 0; i < favList.length; i++){
            if(favList[i].lat === locationObj.lat && favList[i].lon === locationObj.lon){
                found = true;
            }
        }
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

    fetch(forcastUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }
    })
    .then(function(data){
        for(var i = 1; i < 6; i++){
            $("#spinner-future"+i).remove();
        }
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

$("#city-favs").on("click", ".city-btn", function(event){
    if($(event.target).attr("class") !== "remove-city"){
        var cityCords = $(event.target).attr("data-city");
        for(var i = 0; i < favList.length; i++){
            if(cityCords === favList[i].lat + "_" + favList[i].lon){
                addSpinners();
                printData(favList[i]);
            }
        }
    }
})

$("#city-favs").on("click", ".remove-city", function(event){
    var cityCords = $(event.target).attr("data-city");
    for(var i = 0; i < favList.length; i++) {
        if(cityCords === favList[i].lat + "_" + favList[i].lon) {
            favList.splice(i, 1);
        }
    }
    localStorage.setItem("favCities", JSON.stringify(favList));
    loadFavs();
})

$("#search-txt").on("keyup", function(event){
    fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/" + $(event.target).val() + ".json?limit=5&types=place%2Cpostcode%2Clocality%2Cneighborhood&language=en-US&access_token=" + access_token)
    .then(function(response){
        if(response.ok){
            return response.json();
        }
    })
    .then(function(data){
        if(data.features){
            var availableTags = [];
            var locations = [];
            
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
                
            $("#search-txt").autocomplete({
                minLength: 1,
                source: availableTags,
                select: function(event, ui) {
                    var tagInfo = ui.item.label.split(",");
                    var city = tagInfo[0].trim();
                    var state = tagInfo[1].trim();
                    var country = tagInfo[2].trim();
                    for(var i = 0; i < locations.length; i++){
                        if(city === locations[i].cityName && state === locations[i].state && country === locations[i].country){
                            addSpinners();
                            printData(locations[i]);
                            $(this).val('');
                            return false;
                        }
                    }
                }
            });
        }    
    })
});

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

loadFavs();

// mapboxgl.accessToken = access_token;
// const geocoder = new MapboxGeocoder({
// accessToken: mapboxgl.accessToken,
// types: 'place,postcode,locality,neighborhood'
// });
// geocoder.addTo('#geocoder');
// const results = document.getElementById('result');
// geocoder.on('result', (e) => {
// console.log(e.result);
// });
    

