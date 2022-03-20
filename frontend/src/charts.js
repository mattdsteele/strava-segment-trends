const {
  ZonedDateTime,
  DateTimeFormatter,
  ZoneId,
  Period,
} = require('@js-joda/core');
const { Temporal, toTemporalInstant } = require("@js-temporal/polyfill");
Date.prototype.toTemporalInstant = toTemporalInstant;
const vega = require('vega');
const vegaLite = require('vega-lite');

const statsForSegment = (segment) => {
  const omaha = ZoneId.of('America/Chicago');
  const today = ZonedDateTime.now(omaha).toLocalDate();
  const dataStats = segment.counts
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
  console.log(Object.keys(segment))
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

const renderCalendar = async (segment) => {
  const spec = {
    title: 'Rides by Day of Week',
    width: 400,
    height: 300,
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "A simple bar chart with embedded data.",
    data: { values: segment.counts },
    mark: "bar",
    encoding: {
      x: {
        field: "ts",
        timeUnit: "day",
        type: "ordinal",
        title: "Day",
      },
      y: {
        field: "ts",
        timeUnit: "month",
        type: "ordinal",
        title: "Month",
        sort: {
          field: "ts",
        },
      },
      color: {
        field: "efforts",
        aggregate: "sum",
        type: "quantitative",
        legend: null,
      },
    },
  };
  return await render(spec);
};

const renderWeeklyTimeline = async (segment) => {
  const values = await generateDaysOfData(segment, 30);
  const spec = {
    title: 'Recent Rides',
    width: 400,
    height: 100,
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "A simple bar chart with embedded data.",
    data: { values },
    mark: "bar",
    encoding: {
      x: { field: "ts", type: "ordinal", title: "Day", axis: {
        formatType: 'time',
        format: '%b %e'
      } },
      y: {
        field: "count",
        aggregate: "sum",
        title: "Rides",
      },
    },
  };
  return await render(spec);
};
const generateDaysOfData = async (segment, daysOfData) => {
  const weekAgo = Temporal.Now.zonedDateTimeISO().subtract({
    days: daysOfData,
  });
  const monthAgoDate = weekAgo.toPlainDate();
  const nowDate = Temporal.Now.zonedDateTimeISO().toPlainDate();
  const days = [];
  const tz = Temporal.Now.timeZone();
  for (let i = monthAgoDate; ; ) {
    if (
      i.toZonedDateTime(tz).epochSeconds >
      nowDate.toZonedDateTime(tz).epochSeconds
    ) {
      break;
    }
    days.push(i);
    i = i.add({ days: 1 });
  }
  const m = new Map();
  days.forEach((d) => m.set(d.toString(), 0));
  const tsValues = segment.counts;
  let entries = [];
  let prev;
  tsValues.forEach((r) => {
    entries.push(r);
  });
  const ep = monthAgoDate.toZonedDateTime(Temporal.Now.timeZone()).epochSeconds;
  entries.forEach((d) => {
    let { effortCount, ts } = d;
    // const tsDate = ts.toDate();
    const temporalInstant = Temporal.Instant.from(ts);
    const tsDate = temporalInstant.toZonedDateTimeISO(tz);
    // const entryAsDate = Temporal.Instant.from(d.ts.toDate()).toPlainDate();
    const entryAsDate = tsDate.toPlainDate()
    const day = entryAsDate.toString();
    if (prev) {
      const f = Temporal.Instant.from(new Date(temporalInstant.epochMilliseconds).toISOString()).epochSeconds;

      if (ep > f) {
        prev = effortCount;
        return;
      }
      const count = effortCount - prev;
      if (m.has(day) && count > 0) {
        const currentValue = m.get(day);
        m.set(day, currentValue + count);
      } else {
      }
    }
    prev = effortCount;
  });
  const dayCounts = [];
  for (const e of m.entries()) {
    dayCounts.push({ ts: e[0], count: e[1]});
  }
  return dayCounts;
};

const render = async (schema) => {
  const { spec } = vegaLite.compile(schema);
  const view = new vega.View(vega.parse(spec), { renderer: 'none' });
  const svg = await view.toSVG();
  return svg;
};
module.exports.renderChart = renderChart;
module.exports.renderCalendar = renderCalendar;
module.exports.renderHeatmap = renderHeatmap;
module.exports.statsForSegment = statsForSegment;
module.exports.renderWeeklyTimeline = renderWeeklyTimeline;
