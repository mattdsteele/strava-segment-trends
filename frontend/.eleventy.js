const { pluralize } = require('journalize');
const { renderChart } = require('./src/charts');
// const { renderChart } = require('./src/charts');
module.exports = (eleventyConfig) => {
  eleventyConfig.addFilter('pluralize', (value) => pluralize(value));
  eleventyConfig.addNunjucksAsyncShortcode('showchart', renderChart);
};
