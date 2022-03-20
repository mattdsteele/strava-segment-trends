const { pluralize } = require('journalize');
const { renderCalendar, renderWeeklyTimeline } = require('./src/charts');
const { ZonedDateTime, ZoneId, DateTimeFormatter } = require('@js-joda/core');
const { Locale } = require('@js-joda/locale_en-us');
module.exports = (eleventyConfig) => {
  eleventyConfig.addFilter('pluralize', (value) => pluralize(value));
  eleventyConfig.addPassthroughCopy('images');
  eleventyConfig.addFilter('localTime', (value) => {
    const z = ZonedDateTime.parse(value)
      .withZoneSameInstant(ZoneId.of('America/Chicago'))
      .format(DateTimeFormatter.ofPattern('MM/dd ha').withLocale(Locale.US));
    return z;
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

  eleventyConfig.setBrowserSyncConfig({
    ghostMode: false,
  });
};
