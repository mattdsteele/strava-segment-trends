const { allSegments } = require('../src/recent-segments');
const { stravaData, generateCounts } = require('../src/strava');
const { ZoneId, ZonedDateTime, ZoneOffset, LocalDateTime } = require('@js-joda/core');
const { Interval } = require('@js-joda/extra');
require('@js-joda/timezone');
const { exists, downloadMap } = require('../src/maps');
const { checkOrGet, saveCache } = require('../src/cache');
const { observations } = require('../src/weather');

const generateStats = (segment) => {
  const counts = segment.counts;
  const lastEffort = counts[counts.length - 1];

  const omaha = ZoneId.of('America/Chicago');
  const omahaOffset = omaha.rules().offset(LocalDateTime.now());
  const startOfToday = ZonedDateTime.now(omaha)
    .toLocalDate()
    .atStartOfDay();
  const endOfToday = ZonedDateTime.now(omaha)
    .plusDays(1)
    .toLocalDate()
    .atStartOfDay();
  const todayRange = Interval.of(
    startOfToday.toInstant(omahaOffset),
    endOfToday.toInstant(omahaOffset)
  );
  const eventsToday = counts
    .filter((e) => {
      const ts = ZonedDateTime.parse(e.ts);
      return todayRange.contains(ts.toInstant());
    })
    .filter((e) => e.efforts > 0);

  const startOfYesterday = ZonedDateTime.now(omaha)
    .minusDays(1)
    .toLocalDate()
    .atStartOfDay();
  const endOfYesterday = ZonedDateTime.now(omaha)
    .minusDays(1)
    .plusDays(1)
    .toLocalDate()
    .atStartOfDay();
  const yesterdayRange = Interval.of(
    startOfYesterday.toInstant(omahaOffset),
    endOfYesterday.toInstant(omahaOffset)
  );
  const eventsYesterday = counts
    .filter((e) => {
      const ts = ZonedDateTime.parse(e.ts);
      return yesterdayRange.contains(ts.toInstant());
    })
    .filter((e) => e.efforts > 0);
  const [firstAtStartOfDay] = eventsToday;
  const idxOfStartOfDay = counts.indexOf(firstAtStartOfDay);

  let lastEvent;
  if (idxOfStartOfDay > 0) {
    lastEvent = counts[idxOfStartOfDay - 1];
  }
  const todayStats = {
    baseline: lastEvent,
    events: eventsToday,
    count: eventsToday.reduce((prev, curr) => prev + curr.efforts || 0, 0),
  };

  const yesterdayStats = {
    events: eventsYesterday,
    count: eventsYesterday.reduce((prev, curr) => prev + curr.efforts || 0, 0),
  };

  return {
    lastEffort,
    todayStats,
    yesterdayStats,
  };
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

  await Promise.all(
    augmentedSegmentData.map(async ({ segmentId }) => {
      if (!exists(`images/map-${segmentId}.png`)) {
        await downloadMap(segmentId);
      }
    })
  );

  await addWeatherObservations(segmentData);

  saveCache();
  return augmentedSegmentData;
};

const addWeatherObservations = async (segmentData) => {
  const uniqueStations = new Set();

  for (const segment of segmentData) {
    uniqueStations.add(segment.weatherStationId);
  }

  uniqueStations.delete(null);
  const obs = await checkOrGet(
    'weatherObservations',
    async () => observations([...uniqueStations]),
    undefined
  );

  for (const segment of segmentData) {
    segment.observations = obs.find((o) => {
      return o.data.properties.stationId === segment.weatherStationId;
    }).data.properties;
  }
};

module.exports = async () => {
  return await allSegmentData();
};
