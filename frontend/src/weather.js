const axios = require('axios').default;
const convert = require('convert-units');
const d2d = require('degrees-to-direction');

const observations = async stations => {
  const results = stations.map(async station => {
    return await axios.get(
      `https://api.weather.gov/stations/${station}/observations/latest`, {
      transformResponse: data => transform(station, data)
    });
  }, transform);

  return Promise.all(results);
}

const transform = (station, data) => {
  let d;
  try {
    d = JSON.parse(data)
  } catch (e) {
    console.error(`Unable to get weather data for ${station}, response came back as ${data}`);
    const na = {
      value: 'N/A'
    }
    const defaultData = {
      properties: {
        stationId: station,
        temperature: na,
        heatIndex: na,
        windSpeed: na,
        windGust: na,
        windDirection: na,
        precipitationLast3Hours: na
      }
    }
    return defaultData;
  }

  d.properties.stationId = station;
  d.properties.temperature.value =
    convert(d.properties.temperature.value).from('C').to('F');
  d.properties.heatIndex.value =
    convert(d.properties.heatIndex.value).from('C').to('F');
  d.properties.windSpeed.value =
    convert(d.properties.windSpeed.value).from('km/h').to('m/h');
  d.properties.windGust.value =
    convert(d.properties.windGust.value).from('km/h').to('m/h');
  d.properties.windDirection.value =
    d2d(d.properties.windDirection.value);
  d.properties.precipitationLast3Hours.value =
    convert(d.properties.precipitationLast3Hours.value).from('m').to('in');

  return d;
}

module.exports.observations = observations;
