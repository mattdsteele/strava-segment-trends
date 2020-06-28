const { allSegments } = require('../src/recent-segments');
const { segmentData } = require('../src/strava');

module.exports = async () => {
  const segments = await allSegments();
  const [s, b] = segments;
  console.log(s.segmentId);
  // await segmentData(s.segmentId);
  // await segmentData(b.segmentId);
  // const moreSegmentData = await segmentData(s.segmentId);
  // s.name = moreSegmentData.name;
  // return [s];
  return await Promise.all(
    segments.map(async (s) => {
      console.log(s.segmentId);
      const moreSegmentData = await segmentData(s.segmentId);
      s.name = moreSegmentData.name;
      return s;
    })
  );
};
