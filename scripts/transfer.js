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
  allSegments(_size: $size, _cursor: $cursor) {
    after
    data {
      trail
      segmentId
      weatherStationId
      sport
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
      size: 2,
      cursor: nextCursor,
    });
    const { allSegments } = response;
    const { after, data } = allSegments;
    users = [...data, ...users];
    nextCursor = after;

    await Promise.all(
      data.map(async (d) => {
        const newDoc = await db.collection("segments").doc();
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
