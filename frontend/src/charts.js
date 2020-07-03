const vega = require('vega');
const vegaLite = require('vega-lite');

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
