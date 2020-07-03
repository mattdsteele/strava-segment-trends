const polyline = require('@mapbox/polyline');
const osm = require('osm-static-maps');
const { writeFile, existsSync } = require('fs');
const { promisify } = require('util');
const writeFilep = promisify(writeFile);
const { env } = process;
const { Storage } = require('@google-cloud/storage');

const generateMap = async (strava) => {
  const line = polyline.toGeoJSON(strava.map.polyline);
  try {
    const map = await osm({
      geojson: line,
      vectorserverUrl: `https://api.maptiler.com/maps/topographique/style.json?key=${env.MAPTILER_KEY}`,
    });
    return map;
  } catch (e) {
    console.error('failed while generating map');
    throw e;
  }
};

const saveMap = async (filename, data) => {
  await writeFilep(filename, data);
};

const exists = (filename) => {
  return existsSync(filename);
};

const downloadMap = async (segmentId) => {
  console.log(`downloading image for ${segmentId}`);
  const storage = new Storage();
  const bucket = storage.bucket('segment-maps');
  await bucket.file(`map-${segmentId}.png`).download({
    destination: `images/map-${segmentId}.png`,
  });
};
module.exports.generateMap = generateMap;
module.exports.saveMap = saveMap;
module.exports.exists = exists;
module.exports.downloadMap = downloadMap;
