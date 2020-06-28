const { allSegments } = require('../src/recent-segments');
const { stravaData } = require('../src/strava');
const { ZoneId, ZonedDateTime } = require('@js-joda/core');
const { Interval } = require('@js-joda/extra');
const flatCache = require('flat-cache');
const cache = flatCache.load('segments');

const generateStats = (segment) => {
  const counts = segment.counts.data;
  const lastEffort = counts[counts.length - 1];
  const prevEffort = counts[counts.length - 2];

  const startOfToday = ZonedDateTime.now()
    .toLocalDate()
    .atStartOfDayWithZone(ZoneId.SYSTEM);
  const endOfToday = ZonedDateTime.now()
    .plusDays(1)
    .toLocalDate()
    .atStartOfDayWithZone(ZoneId.SYSTEM);
  const todayRange = Interval.of(
    startOfToday.toInstant(),
    endOfToday.toInstant()
  );
  console.log(todayRange);
  const eventsToday = counts.filter((e) => {
    const ts = ZonedDateTime.parse(e.ts);
    return todayRange.contains(ts.toInstant());
  });

  const startOfYesterday = ZonedDateTime.now()
    .minusDays(1)
    .toLocalDate()
    .atStartOfDayWithZone(ZoneId.SYSTEM);
  const endOfYesterday = ZonedDateTime.now()
    .minusDays(1)
    .plusDays(1)
    .toLocalDate()
    .atStartOfDayWithZone(ZoneId.SYSTEM);
  const yesterdayRange = Interval.of(
    startOfYesterday.toInstant(),
    endOfYesterday.toInstant()
  );
  const eventsYesterday = counts.filter((e) => {
    const ts = ZonedDateTime.parse(e.ts);
    return yesterdayRange.contains(ts.toInstant());
  });
  const [firstAtStartOfDay] = eventsToday;
  const idxOfStartOfDay = counts.indexOf(firstAtStartOfDay);

  let lastEvent;
  if (idxOfStartOfDay > 0) {
    lastEvent = counts[idxOfStartOfDay - 1];
  }
  const todayStats = {
    baseline: lastEvent,
    events: eventsToday,
    count: eventsToday.reduce((prev, curr) => prev + curr.efforts, 0),
  };

  const yesterdayStats = {
    events: eventsYesterday,
    count: eventsYesterday.reduce((prev, curr) => prev + curr.efforts, 0),
  };

  return {
    lastEffort,
    todayStats,
    yesterdayStats,
  };
};
const generateCounts = (segments) => {
  const data = segments.counts.data;
  data.forEach((c, i) => {
    if (i > 0) {
      const prevCount = data[i - 1].effortCount;
      c.efforts = c.effortCount - prevCount;
    }
  });
};
const allSegmentData = async () => {
  const segmentData = await checkOrGet(
    'segment-counts',
    async () => await allSegments(),
    undefined
  );
  const augmentedSegmentData = await Promise.all(
    segmentData.map(async (segment) => {
      const { segmentId } = segment;
      segment.strava = await checkOrGet(
        `segment-${segmentId}`,
        async (id) => await stravaData(id),
        segmentId
      );
      generateCounts(segment);
      segment.stats = generateStats(segment);
      return segment;
    })
  );
  cache.save();
  return augmentedSegmentData;
};

const checkOrGet = async (key, fn, id) => {
  let cached = cache.getKey(key);
  if (!cached) {
    console.log(`getting data for ${key}`);
    cached = await fn(id);
    cache.setKey(key, cached);
  }
  return cache.getKey(key);
};

module.exports = async () => {
  return await allSegmentData();
};
