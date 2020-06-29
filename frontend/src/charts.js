const vega = require('vega');
const vegaLite = require('vega-lite');
const example = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  data: {
    values: [
      { bin_start: 8, bin_end: 10, count: 7 },
      { bin_start: 10, bin_end: 12, count: 29 },
      { bin_start: 12, bin_end: 14, count: 71 },
      { bin_start: 14, bin_end: 16, count: 127 },
      { bin_start: 16, bin_end: 18, count: 94 },
      { bin_start: 18, bin_end: 20, count: 54 },
      { bin_start: 20, bin_end: 22, count: 17 },
      { bin_start: 22, bin_end: 24, count: 5 },
    ],
  },
  mark: 'bar',
  encoding: {
    x: {
      field: 'bin_start',
      bin: {
        binned: true,
        step: 2,
      },
      type: 'quantitative',
    },
    x2: { field: 'bin_end' },
    y: {
      field: 'count',
      type: 'quantitative',
    },
  },
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
  const { spec } = vegaLite.compile(schema);
  const view = new vega.View(vega.parse(spec), { renderer: 'none' });
  const svg = await view.toSVG();
  return `<div class="chart">${svg}</div>`;
};
module.exports.renderChart = renderChart;
