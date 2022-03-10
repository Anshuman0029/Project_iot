const API_URL = 'http://localhost:5000/api';

$.get(`${API_URL}/devices`)
.then(response => {
  response.forEach(device => {
    $('#devices tbody').append(`
      <tr>
        <td>${device.name}</td>
        <td>${device.temperature}</td>
      </tr>`
    );
    if(device.temperature> 10)
    {
         
         document.querySelector('#status').innerHTML = "It is Hot. AC Mode turned ON"
    }
    else{
        
        document.querySelector('#status').innerHTML = "It is cold. Heater Mode turned ON"
    }
  });
})
.catch(error => {
  console.error(`Error: ${error}`);
});

var fetchWeather = "/weather";

const weatherForm = document.querySelector('form');
const search = document.querySelector('input')

const weatherIcon = document.querySelector('.weatherIcon i')
const weatherCondition = document.querySelector('.weatherCondition');

const tempElement = document.querySelector('.temperature span');

const locationElement = document.querySelector('.place');

const dateElement = document.querySelector('.date');

const monthNames =["January","February","March","April","May","June","July","August","September","October","November","December"]
dateElement.textContent = new Date().getDate()+", "+monthNames[new Date().getMonth()].substring(0,3);

weatherForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    console.log(search.value);
    locationElement.textContent ="Loading...";
    tempElement.textContent = "";
    weatherCondition.textContent = "";
    const locationApi = fetchWeather + "?address=" + search.value ;
    fetch(locationApi).then(response =>{
        response.json().then(data =>{
            if(data.error){
                locationElement.textContent =data.error;
                 tempElement.textContent = "";
                weatherCondition.textContent = "";
            } 
            else{
                console.log(data.description);
                if(data.description === "rain" || data.description === "fog" )
                {
                    weatherIcon.className = "wi wi-day" + data.description
                }
                else{
                    weatherIcon.className = "wi wi-cloudy"
                }

                locationElement.textContent = data.cityName;
                tempElement.textContent = (data.temperature - 273.5).toFixed(2)+ String.fromCharCode(176);
                weatherCondition.textContent = data.description.toUpperCase();
            }
        })
        console.log(response);
    });
})

