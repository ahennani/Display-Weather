const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
let apiKey
let iconImg
let desc
let loc
let tempC
let humidity
let wind
let todatDate
let sunriseDOM
let sunsetDOM
let rest
let cities = []

$(() => {

    // Dom Elements
    apiKey = '2ca252d74a373acc1b59fe6e45e5d3ae';
    iconImg = $('#currentDayIcon');
    desc = $('#currentDayWeatherDescription');
    loc = $("#myCity")
    tempC = $("#currentDayTemperature")
    humidity = $("#currentDayHumidity")
    wind = $("#currentDayWind")
    todatDate = $("#todayDate")
    sunriseDOM = $('#sunrise');
    sunsetDOM = $('#sunset');
    rest = $("#others")
        // Global Variables
    let city = "";
    let long;
    let lat;
    let urlAPI

    $(window).on('load', () => {
        // Resize Warning Bar
        $("#searchArt").on("load resize", function() {
            $("#inputSearch").width($("#btnSearch").width());
        });

        // Store cities in localestoge
        $("#inputSearch").focus(() => {
            $("#warning").html("").removeClass("invisible").fadeIn();
            let citiesHistory = loadHistory()
            console.log(cities);
            console.log(citiesHistory);
            showCities(citiesHistory)
        }).focusout(() => {
            $("#warning").html("").addClass("invisible").fadeOut();
        })

        // Accesing Geolocation of User
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    long = position.coords.longitude;
                    lat = position.coords.latitude;
                    getLocationWeather("single", long, lat);

                    fadeload();
                },
                (error) => {
                    console.log(error);
                    fadeload();
                });
        }
        $("#btnSearch").click(function() {
            city = $("#inputSearch").val().trim();
            getLocationWeather("multy", city);
        });
        $('#inputSearch').on("keypress", function(e) {
            if (e.which == 13) {
                city = $("#inputSearch").val().trim();
                getLocationWeather("multy", city);
                console.log(e.which);
            }
        });

    });

});

const fadeload = () => {
    setTimeout(() => {
        $("#preloader").animate({
                "opacity": "0"
            }, 500)
            .css("visibility", "hidden")
            .fadeOut();
    }, 2000)
}

// Add cities from localstorege to cities Array
const loadHistory = () => {
    cities = []
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("_")) {
            let currentCity = `${localStorage.getItem(localStorage.key(i))}`
            cities.push(currentCity)
        }
    }
    return cities;
}


// Show cities in suggetions bar
const showCities = (citiesH) => {
    citiesH.forEach((e, i) => {
        let div = $("<div>").text(`${e}`).addClass("city")
        $("#warning").append(div)
    })
}

// Get the api reasult and show it in the UI
function getLocationWeather(type, myCity = "", long = -1, lat = -1) {
    if (type === "single") {
        //console.log("single!!");
        urlAPI = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=52414d27dc2eef44fd822fdf41d5fb78&lang=fr`
    } else if (type === "multy") {
        //console.log("multy!!");
        urlAPI = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${myCity}&units=metric&cnt=5&appid=${apiKey}`;
    }

    axios
        .get(urlAPI)
        .then(function(response) {
            //console.log("success");
            if (type === "single") {
                city = response.data.name;
                $("#inputSearch").val(city);
                getLocationWeather("multy", city);
            } else if (type === "multy") {
                console.log(response.data);

                // Converting Epoch(Unix) time to GMT
                let { description, icon } = response.data.list[0].weather[0];
                let { temp } = response.data.list[0];
                //let { feels_like } = response.data.list[0];

                // Converting Epoch(Unix) time to GMT
                let iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
                let speed = ((response.data.list[0].speed) * 18) / 5
                let aDate = new Date(response.data.list[0].dt * 1000)
                let s_set = new Date(response.data.list[0].sunset * 1000)
                let s_rise = new Date(response.data.list[0].sunrise * 1000)
                    // Interacting with DOM to show data
                iconImg.attr("src", `${iconUrl}`)
                desc.text(description)
                loc.text(`${response.data.city.name}, ${response.data.city.country}`)
                tempC.text(`${temp.day.toFixed(0)}`)
                humidity.text(`${response.data.list[0].humidity} %`)
                wind.text(`${speed.toFixed(1)} K / M`)
                todatDate.text(`${aDate.toDateString()}`)
                sunriseDOM.text(`${s_rise.getHours()}:${s_rise.getMinutes()} AM`)
                sunsetDOM.text(`${s_set.getHours()}:${s_set.getMinutes()} PM`)

                // Craete ther other days cards
                rest.html("");
                let row = $("<div>").addClass("row");
                for (const day in response.data.list) {
                    if (day != 0) {
                        let divContainer = $("<div>").addClass("col-12 col-md-3")
                        let div = $("<div>").addClass("day")
                        let header = $("<h3>")
                            .text(`${days[new Date(response.data.list[day].dt * 1000).getDay()]}`)
                            .css({
                                "textTransform": "uppercase"
                            })
                        let divContainerImg = $("<div>").addClass("icon")
                        let img = $("<img>").attr({
                            "src": `http://openweathermap.org/img/wn/${response.data.list[day].weather[0].icon}@2x.png`,
                            "alt": "Icone"
                        })
                        divContainerImg.append(img)
                        let divContainerTempC = $("<div>").addClass("temp")
                        let spanTemp = $("<span>")
                            .text(`${response.data.list[day].temp.eve.toFixed(0)}`)
                            .css({ "display": "block" })
                        let spanDesc = $("<span>")
                            .text(`${response.data.list[day].weather[0].description}`)
                        divContainerTempC.append(spanTemp);
                        divContainerTempC.append(spanDesc);


                        let divContainerMinMax = $("<div>").addClass("minmax d-md-none")
                        let spanMin = $("<span>")
                            .addClass("min")
                            .text(`${response.data.list[day].temp.min.toFixed(0)}`)
                        let spanMax = $("<span>")
                            .addClass("max")
                            .text(`${response.data.list[day].temp.max.toFixed(0)}`)
                        divContainerMinMax.append(spanMin)
                        divContainerMinMax.append(spanMax)

                        div.append(header)
                        div.append(divContainerImg)
                        div.append(divContainerTempC)
                        div.append(divContainerMinMax)
                        divContainer.append(div)
                        row.append(divContainer);
                    }
                }
                rest.append(row)
            }

            // Add current city to LocalStorage
            let tet = $("#inputSearch").val().trim()
            console.log(tet);
            localStorage.setItem(`_${ tet}`, tet);
            console.log(localStorage.getItem(`_${tet}`));
        })
        .catch(function(error) {
            // handle error
            console.log(error);
            $("#warning")
                .html("<div> The city is not found!!")
                .addClass("d-block")
                .css({
                    "margin": "auto",
                    "color": "red"
                })
            fadeload();
        })
        .then(function() {
            // always executed
        });
}