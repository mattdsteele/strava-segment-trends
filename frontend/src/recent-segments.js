const { LocalDateTime, convert, ZoneId } = require("@js-joda/core");

const Firestore = require("@google-cloud/firestore");
const db = new Firestore({ projectId: "secret-strava" });
const firebaseAllSegments = async () => {
  const omaha = ZoneId.of("America/Chicago");
  const today = LocalDateTime.now(omaha);
  const startDateTime = today.minusMonths(5).withDayOfMonth(1);
  const startDate = convert(startDateTime).toDate();
  const segments = await db.collection("segments").get();

  const addRecentCounts = async (segment) => {
    const countsRef = db.collection("counts");
    const counts = [];
    const segmentCountsRef = await countsRef
      .where("segmentId", "==", segment.segmentId)
      .where("ts", ">", startDate)
      .get();

    // munge to fit closer to graphql structure
    segmentCountsRef.forEach((countRef) => {
      const count = countRef.data();
      count.ts = count.ts.toDate().toISOString();
      counts.push(count);
    });
    segment.counts = counts;
    return segment;
  };

  const segmentPromises = [];
  segments.forEach((segmentRef) => {
    const segment = segmentRef.data();
    segmentPromises.push(addRecentCounts(segment));
  });
  return Promise.all(segmentPromises).then((segments) => {
    segments.sort((a, b) => a.trail < b.trail ? -1 : 1);
    return segments;
  });
};
module.exports.allSegments = firebaseAllSegments;
