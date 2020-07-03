const {
  ZonedDateTime,
  DateTimeFormatter,
  ZoneId,
  Period,
} = require('@js-joda/core');
const vega = require('vega');
const vegaLite = require('vega-lite');

const statsForSegment = (segment) => {
  const omaha = ZoneId.of('America/Chicago');
  const today = ZonedDateTime.now(omaha).toLocalDate();
  const dataStats = segment.counts.data
    .filter((t) => t.efforts > 0)
    .map(({ ts, efforts }) => {
      const zdt = ZonedDateTime.parse(ts)
        .minusHours(1)
        .withZoneSameInstant(omaha);
      const hour = zdt.hour();
      const segmentDate = zdt.toLocalDate();
      const p = Period.between(segmentDate, today);
      const daysAway = p.days();
      return { ts, efforts, hour, daysAway };
    });
  return dataStats;
};
const renderHeatmap = async (segment) => {
  const daysToPreserve = 5;
  const stats = statsForSegment(segment).filter(
    (c) => c.daysAway <= daysToPreserve
  );
  const schema = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    data: {
      values: stats,
    },
    mark: 'rect',
    width: 500,
    height: 150,
    encoding: {
      x: {
        bin: { maxbins: 24 },
        step: 1,
        field: 'hour',
        type: 'quantitative',
        axis: {
          tickCount: 24,
          title: 'Hour',
        },
        scale: {
          domain: [0, 23],
        },
      },
      y: {
        bin: { maxbins: daysToPreserve },
        step: 1,
        field: 'daysAway',
        type: 'quantitative',
        axis: {
          tickCount: daysToPreserve,
          title: 'Days Ago',
        },
        scale: {
          domain: [0, daysToPreserve],
        },
      },
      color: {
        aggregate: 'sum',
        field: 'efforts',
        type: 'quantitative',
        axis: {
          title: 'Rides',
        },
      },
    },
    config: {
      view: {
        stroke: 'transparent',
      },
    },
  };
  return await render(schema);
};
const renderChart = async (data) => {
  const withNow = [
    ...data,
    {
      ts: new Date().toISOString(),
      efforts: 0,
    },
  ];
  const schema = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    data: {
      values: withNow.filter((d) => d.efforts >= 0),
    },
    mark: 'bar',
    width: 600,
    height: 300,
    encoding: {
      x: {
        field: 'ts',
        timeUnit: 'hours',
        type: 'temporal',
      },
      y: {
        aggregate: 'sum',
        field: 'efforts',
        type: 'quantitative',
      },
    },
  };
  return await render(schema);
};
const render = async (schema) => {
  const { spec } = vegaLite.compile(schema);
  const view = new vega.View(vega.parse(spec), { renderer: 'none' });
  const svg = await view.toSVG();
  return `<div class="chart">${svg}</div>`;
};
module.exports.renderChart = renderChart;
module.exports.renderHeatmap = renderHeatmap;
module.exports.statsForSegment = statsForSegment;
