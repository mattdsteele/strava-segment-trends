const axios = require('axios').default;
const convert = require('convert-units');
const d2d = require('degrees-to-direction');

observations = async stations => {
  const results = stations.map(async station => {
    return await axios.get(
      `https://api.weather.gov/stations/${station}/observations/latest`, {
      transformResponse: data => { return transform(data) }
    });
  }, transform);

  return Promise.all(results);
}

const transform = data => {
  const d = JSON.parse(data)

  d.properties.temperature.value =
    convert(d.properties.temperature.value).from('C').to('F');
  d.properties.dewpoint.value =
    convert(d.properties.dewpoint.value).from('C').to('F');
  d.properties.windSpeed.value =
    convert(d.properties.windSpeed.value).from('km/h').to('m/h');
  d.properties.windGust.value =
    convert(d.properties.windGust.value).from('km/h').to('m/h');
  d.properties.windDirection.value =
    d2d(d.properties.windDirection.value);
  d.properties.precipitationLast3Hours.value =
    convert(d.properties.precipitationLast3Hours.value).from('m').to('in');

  return d.properties;
}

// const latestObservations = async stationId => {
//   const url = `https://api.weather.gov/stations/${stationId}/observations/latest`

//   // TODO: handle errors
//   const observations = await axios.get(url, {
//     transformResponse: data => { return transform(data).properties; }
//   });

//   return observations.data;
// }

// const stations = [
//   { id: 'KOMA', trails: ['Lewis and Clark'], segments: [18804054] },
//   { id: 'C8198', trails: ['Tranquility'], segments: [10815130, 4481947, 18808579] },
//   { id: 'E7836', trails: ['Swanson'], segments: [8417986, 799024] },
//   { id: 'D9161', trails: ['Jewell'], segments: [1692340, 5904281, 5904382] },
//   { id: 'F2659', trails: ['Walnut Creek'], segments: [9729664] },
//   { id: 'KFET', trails: ['Calvin Crest'], segments: [2843721] },
//   { id: 'D3452', trails: ['Branched Oak'], segments: [4646492] }
//   // { id: 'E9007', trails: ['Platte', 'Oxbow'], segments: [] },
// ]


module.exports.observations = observations;
