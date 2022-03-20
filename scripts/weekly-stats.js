const { Firestore } = require("@google-cloud/firestore");
const { Temporal, toTemporalInstant } = require("@js-temporal/polyfill");
Date.prototype.toTemporalInstant = toTemporalInstant;
const db = new Firestore({
  projectId: "secret-strava",
});

(async () => {
  const counts = db.collection("counts");
  const weekAgo = Temporal.Now.zonedDateTimeISO().subtract({days: 30})
  const monthAgoDate = weekAgo.toPlainDate();
  const nowDate = Temporal.Now.zonedDateTimeISO().toPlainDate();
  const days = [];
  const tz = Temporal.Now.timeZone();
  for (let i = monthAgoDate;;) {
    if (i.toZonedDateTime(tz).epochSeconds > nowDate.toZonedDateTime(tz).epochSeconds) {
      break;
    }
    days.push(i);
    i = i.add({days: 1})
  }
  console.log(days);
  const m = new Map();
  days.forEach(d => m.set(d.toString(), 0));
  console.log(m);
  console.log(weekAgo.toString());
  console.log(monthAgoDate.toString());
  const tsValues = await counts
    .where("segmentId", "==", 18808579)
    .orderBy("ts", "desc")
    .limit(500)
    .get();
  let entries = [];
  let prev;
  tsValues.forEach((r) => {
    entries = [r.data(), ...entries];
  });
      const ep = monthAgoDate.toZonedDateTime(
        Temporal.Now.timeZone()
      ).epochSeconds;
  entries.forEach((d) => {
    console.log('prev', prev);
    let { effortCount, ts } = d;
    const tsDate = ts.toDate();
    // const entryAsDate = Temporal.Instant.from(d.ts.toDate()).toPlainDate();
    const ins = Temporal.Now.instant();
    const entryAsDate = ts.toDate().toTemporalInstant().toZonedDateTimeISO(tz).toPlainDate();
    const day = entryAsDate.toString();
    if (prev) {
      const f = Temporal.Instant.from(tsDate.toISOString()).epochSeconds;

      if (ep > f) {
        prev = effortCount;
        return;
      }
      const count = effortCount - prev;
      if (m.has(day)) {
        const currentValue = m.get(day);
        console.log(`has ${entryAsDate.toString()}, currently ${currentValue}, prev ${prev}, new ${effortCount}, diff ${count}`);
        m.set(day, currentValue + count);
      } else {
        // console.log(`does not have ${entryAsDate}`)
      }
      tsDate.setMinutes(0);
      tsDate.setSeconds(0);
      tsDate.setMilliseconds(0);
      entries.push({
        ts: tsDate,
        count,
      });
    }
    prev = effortCount;
  });
  const dayCounts = [];
  for (const e of m.entries()) {
    dayCounts.push([e[0], e[1]])
  };
  const asCsv = `date,count
${dayCounts.map(([date, count]) => `${date},${count}`).join('\n')}`;
  require("fs").writeFileSync("entries-last-week.csv", asCsv);
})();
