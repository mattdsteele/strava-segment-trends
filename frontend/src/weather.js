const { env } = require('process');
const EleventyFetch = require('@11ty/eleventy-fetch');

module.exports.pirateweather = async (lat, lon) => {
  const pirateKey = env['PIRATEWEATHER_KEY'];
  const url = `https://api.pirateweather.net/forecast/${pirateKey}/${lat},${lon}`;
  console.log(url);
  return await EleventyFetch(url, {duration: '6h', type: 'json'});
};