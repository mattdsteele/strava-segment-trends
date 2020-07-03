const { checkOrGet } = require('./src/cache');
const { generateCounts } = require('./src/strava');

(async () => {
  const [segment] = await checkOrGet('segment-counts');
  // generateCounts(segment);
  const dataStats = segment.counts.data.map(({ ts, efforts }) => {
    return { ts, efforts };
  });
  console.log(dataStats);
})();
