const axios = require('axios').default;

const latestObservation = station => {
  const url = `https://api.weather.gov/stations/${station.id}/observations/latest`

  return axios.get(url, {
    transformResponse: data => {
      const d = JSON.parse(data)
      d.properties.stationId = station.id;
      d.properties.segments = station.segments;
      return d;
    }
  });
}

const observations = async stations => {
  const requests = [];
  stations.forEach(s => requests.push(latestObservation(s)));
  const results = await Promise.all(requests);
  return results;
}

module.exports.observations = observations;
