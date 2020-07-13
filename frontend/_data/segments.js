const { allSegments } = require('../src/recent-segments');
const { stravaData, generateCounts } = require('../src/strava');
const { ZoneId, ZonedDateTime } = require('@js-joda/core');
const { Interval } = require('@js-joda/extra');
require('@js-joda/timezone');
const { saveMap, exists, generateMap, downloadMap } = require('../src/maps');
const { checkOrGet, saveCache } = require('../src/cache');
const { observations } = require('../src/weather');

const generateStats = (segment) => {
  const counts = segment.counts.data;
  const lastEffort = counts[counts.length - 1];

  const omaha = ZoneId.of('America/Chicago');
  const startOfToday = ZonedDateTime.now(omaha)
    .toLocalDate()
    .atStartOfDayWithZone(omaha);
  const endOfToday = ZonedDateTime.now(omaha)
    .plusDays(1)
    .toLocalDate()
    .atStartOfDayWithZone(omaha);
  const todayRange = Interval.of(
    startOfToday.toInstant(),
    endOfToday.toInstant()
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
    .atStartOfDayWithZone(omaha);
  const endOfYesterday = ZonedDateTime.now(omaha)
    .minusDays(1)
    .plusDays(1)
    .toLocalDate()
    .atStartOfDayWithZone(omaha);
  const yesterdayRange = Interval.of(
    startOfYesterday.toInstant(),
    endOfYesterday.toInstant()
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
    segment.stationId = stations.find(station => {
      return segment.segmentId === station.segmentId;
    }).stationId;
    uniqueStations.add(segment.stationId);
  }

  uniqueStations.delete(null);
  const obs = await observations([...uniqueStations]);

  for (const segment of segmentData) {
    segment.observations = obs.find(o => {
      return o.data.properties.stationId === segment.stationId;
    }).data.properties;
    delete segment.stationId;
  }
}

// TODO: remove when adding stationId to data store
const stations = [
  { segmentId: 18804054, stationId: 'KOMA' },
  { segmentId: 10815130, stationId: 'C8198' },
  { segmentId: 4481947, stationId: 'C8198' },
  { segmentId: 18808579, stationId: 'C8198' },
  { segmentId: 8417986, stationId: 'E7836' },
  { segmentId: 799024, stationId: 'E7836' },
  { segmentId: 1692340, stationId: 'D9161' },
  { segmentId: 5904281, stationId: 'D9161' },
  { segmentId: 5904382, stationId: 'D9161' },
  { segmentId: 9729664, stationId: 'F2659' },
  { segmentId: 2843721, stationId: 'KFET' },
  { segmentId: 4646492, stationId: 'D3452' }
  // { segmentId: 0, stationId: 'E9007', trail: 'Platte' },
  // { segmentId: 0, stationId: 'E9007', trail: 'Oxbow' }
]

module.exports = async () => {
  return await allSegmentData();
};
