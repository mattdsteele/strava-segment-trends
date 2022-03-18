const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore({
  projectId: "secret-strava"
});

(async () => {
   const counts = db.collection('counts');
   const tsValues = await counts.where('ts', '>=', '202').get();
   console.log(tsValues.size);
   tsValues.forEach(async r => {
       const d = r.data();
       const ts = new Date(d.ts);
       await r.ref.update({
           ts
       })
   })
})();