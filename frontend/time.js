const { checkOrGet } = require('./src/cache');
const { statsForSegment } = require('./src/charts');
require('@js-joda/timezone');

(async () => {
 
  const [segment] = await checkOrGet('segment-counts');
  console.log(statsForSegment(segment));
})();
