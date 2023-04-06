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
  eleventyConfig.addFilter("compass", (value) => {
    const val = Math.floor(value / 22.5 + 0.5);
    const arr = [ "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[val % 16];
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

  eleventyConfig.setBrowserSyncConfig({
    ghostMode: false,
  });
};
