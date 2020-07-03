const polyline = require('@mapbox/polyline');
const osm = require('osm-static-maps');
const { writeFile, existsSync } = require('fs');
const { promisify } = require('util');
const writeFilep = promisify(writeFile);
const { env } = process;

const generateMap = async (strava) => {
  const line = polyline.toGeoJSON(strava.map.polyline);
  const map = await osm({
    geojson: line,
    vectorserverUrl: `https://api.maptiler.com/maps/topographique/style.json?key=${env.MAPTILER_KEY}`,
    imagemin: true,
  });
  return map;
};

const saveMap = async (filename, data) => {
  await writeFilep(filename, data);
};

const exists = (filename) => {
  return existsSync(filename);
};

module.exports.generateMap = generateMap;
module.exports.saveMap = saveMap;
module.exports.exists = exists;
