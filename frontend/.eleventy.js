const { pluralize } = require('journalize');
const makeChart = (data) => {
  return `<pre>${JSON.stringify(data)}</pre>`;
};
module.exports = (eleventyConfig) => {
  eleventyConfig.addFilter('pluralize', (value) => pluralize(value));
  eleventyConfig.addShortcode('chart', makeChart);
};
