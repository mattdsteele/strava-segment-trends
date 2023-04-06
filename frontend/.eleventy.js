const { pluralize } = require('journalize');
const { renderCalendar, renderWeeklyTimeline } = require('./src/charts');
const { ZonedDateTime, ZoneId, DateTimeFormatter } = require('@js-joda/core');
const { Locale } = require('@js-joda/locale_en-us');
const d2d = require('degrees-to-direction');
module.exports = (eleventyConfig) => {
  eleventyConfig.addFilter('pluralize', (value) => pluralize(value));
  eleventyConfig.addPassthroughCopy('images');
  eleventyConfig.addFilter('localTime', (value) => {
    const z = ZonedDateTime.parse(value)
      .withZoneSameInstant(ZoneId.of('America/Chicago'))
      .format(DateTimeFormatter.ofPattern('MM/dd ha').withLocale(Locale.US));
    return z;
  });
  eleventyConfig.addFilter("compass", (value) => {
    return d2d(value);
  });
  eleventyConfig.addFilter('pctRound', value => {
    return (value * 100).toFixed(0);
  });
  eleventyConfig.addNunjucksAsyncShortcode('charturi', async (segment, chartType) => {
    const mappings = {
      calendar: renderCalendar,
      timeline: renderWeeklyTimeline
    }
    const svg = await mappings[chartType](segment)
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  });
};
