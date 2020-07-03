const { checkOrGet } = require('./src/cache');
const { generateCounts } = require('./src/strava');

(async () => {
  const [segment] = await checkOrGet('segment-counts');
  // generateCounts(segment);
  console.log(segment.counts.data);
})();
