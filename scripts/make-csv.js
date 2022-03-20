const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore({
  projectId: "secret-strava",
});

(async () => {
  const counts = db.collection("counts");
  const tsValues = await counts
    .where("segmentId", "==", 18808579)
    .where("ts", ">=", )
    .orderBy("ts", "desc")
    .limit(500)
    .get();
  let entries = [];
  let prev;
  tsValues.forEach((r) => {
    entries = [r.data(), ...entries];
  });
  entries.forEach((d) => {
    let { effortCount } = d;
    if (prev) {
      const count = d.effortCount - prev;
      const ts = d.ts.toDate();
      ts.setMinutes(0);
      ts.setSeconds(0);
      ts.setMilliseconds(0);
      entries.push({
        ts,
        count,
      });
    }
    prev = effortCount;
  });
  entries = entries.filter((e) => e.count > 0);
  entries = entries.map((t) => {
    const { ts, count } = t;
    return [ts.toISOString(), count];
  });
  console.log(entries);
  const asCsv = `date,count
${entries.map(([date, count]) => `${date},${count}`).join('\n')}`;
  require("fs").writeFileSync("entries.csv", asCsv);
})();
