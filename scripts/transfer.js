const gql = require("graphql-tag");
const { GraphQLClient } = require("graphql-request");
const { env } = require("process");

const Firestore = require("@google-cloud/firestore");
const db = new Firestore({
  projectId: "secret-strava"
});

// start with Users

const q = gql`
query ($size: Int!, $cursor: String) {
  allCounts(_size: $size, _cursor: $cursor) {
    after
    data {
      effortCount
      ts
      athleteCount
      segment {
        segmentId
      }
    }
  }
}

`;
(async () => {
  const endpoint = "https://graphql.fauna.com/graphql";
  const client = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${env.FAUNA_SECRET}`,
    },
  });

  let nextCursor;

  let users = [];
  while (true) {
    const response = await client.request(q, {
      size: 100,
      cursor: nextCursor,
    });
    const { allCounts } = response;
    const { after, data } = allCounts;
    users = [...data, ...users];
    nextCursor = after;

    await Promise.all(
      data.map(async (d) => {
        d.segmentId = d.segment.segmentId;
        delete d.segment;
        d.ts = new Date(d.ts);
        const newDoc = await db.collection("counts").doc();
        await newDoc.set(d);
      })
    );
    if (!nextCursor) {
      break;
    }
  }

  // we have all users now
  console.log(users);

  // upload into firebase
})();
