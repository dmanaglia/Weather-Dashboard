var favList = JSON.parse(localStorage.getItem("favCities")) || [];
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

function printData(cityName){
    
    var currentUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + ",us&units=imperial&APPID=4ea30a86ce27f7ece8c4b07fb49b8979";
    var forcastUrl = "http://api.openweathermap.org/data/2.5/forecast?q=" + cityName + ",us&units=imperial&APPID=4ea30a86ce27f7ece8c4b07fb49b8979";

    fetch(currentUrl)
    .then(function(response){
        if(response.status !== 404){
            return response.json();
        }else {
            alert("City '" + cityName + "' was not found. Check spelling")
        }
    })
    .then(function(data){
        $("#current-city-h1").text(data.name + " " + getIcon(data.weather[0].id, dayjs().$H));
        $("#current-temp").text(data.main.temp);
        $("#current-wind").text(data.wind.speed);
        $("#current-humidity").text(data.main.humidity);
        if(!favList.includes(data.name)){
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
            favList.push(data.name);
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
        console.log(data);
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

$("#search-btn").on("click", function(event){
    event.preventDefault();
    var cityName = $("#search-txt").val();
    printData(cityName);
    $("#search-txt").val("");
});

function loadFavs(){
    $("#city-favs").empty();
    for(var i = 0; i < favList.length; i++){
        var addFavEl = $("<button>");
        addFavEl.text(favList[i]);
        addFavEl.attr("class", "btn btn-secondary city-btn");
        addFavEl.attr("data-city", favList[i]);
        var deleteEL = $("<p>");
        deleteEL.text("X");
        deleteEL.attr("class", "remove-city");
        deleteEL.attr("data-city", favList[i]);
        addFavEl.append(deleteEL);
        $("#city-favs").append(addFavEl);
    }
}


$("#city-favs").on("click", ".city-btn", function(event){
    if($(event.target).attr("class") !== "remove-city"){
        var cityName = $(event.target).attr("data-city");
        printData(cityName);
    }
})

$("#city-favs").on("click", ".remove-city", function(event){
    var removeCity = $(event.target).attr("data-city");
    for(var i = 0; i < favList.length; i++) {
        if(favList[i] === removeCity) {
            favList.splice(i, 1);
        }
    }
    localStorage.setItem("favCities", JSON.stringify(favList));
    loadFavs();
})




loadFavs();



















// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(showPosition);
//     } else { 
//         alert("Geolocation is not supported by this browser. Search city manually");
//     }
// }

// function showPosition(position) {
//     var lat = position.coords.latitude;
//     var lon = position.coords.longitude;
//     var currentData = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&APPID=4ea30a86ce27f7ece8c4b07fb49b8979"
//     var forcastData = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&APPID=4ea30a86ce27f7ece8c4b07fb49b8979"
//     printData(currentData, forcastData);
// }

// getLocation();