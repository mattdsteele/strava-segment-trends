const { allSegments } = require('../src/recent-segments');
const { segmentData } = require('../src/strava');
const flatCache = require('flat-cache');
const cache = flatCache.load('segments');

const checkOrGet = async () => {
  let segments = cache.getKey('segments');
  if (!segments) {
    segments = await get();
    cache.setKey('segments', segments);
    cache.save();
  }
  return cache.getKey('segments');
};
const get = async () => {
  const segments = await allSegments();
  return await Promise.all(
    segments.map(async (s) => {
      console.log(s.segmentId);
      const moreSegmentData = await segmentData(s.segmentId);
      s.name = moreSegmentData.name;
      return s;
    })
  );
};
module.exports = async () => {
  return await checkOrGet();
};
