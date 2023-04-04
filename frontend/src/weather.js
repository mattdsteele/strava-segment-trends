const axios = require('axios').default;
const convert = require('convert-units');
const d2d = require('degrees-to-direction');
const { env } = require('process');

const observations = async stations => {
  const results = stations.map(async station => {
    try {
      return await axios.get(
        `https://api.weather.gov/stations/${station}/observations/latest`, {
        transformResponse: data => transform(station, data)
      });
    } catch (e) {
      console.error(`Unable to get weather data for ${station}`, e);
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
      return { data: defaultData };
    }
  }, transform);
  return Promise.all(results);
}

const transform = (station, data) => {
  const d = JSON.parse(data)
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

module.exports.pirateweather = async (lat, lon) => {
  const pirateKey = env['PIRATEWEATHER_KEY'];
  const url = `https://api.pirateweather.net/forecast/${pirateKey}/${lat},${lon}`;
  console.log(url);
  const pirateResponse = await axios.get(url);
  console.log(pirateResponse.data);
  return pirateResponse.data;
};