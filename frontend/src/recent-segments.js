const gql = require('graphql-tag');
const { print } = require('graphql');
const { GraphQLClient } = require('graphql-request');
const { env } = require('process');

const q = gql`
  query foo {
    allSegments {
      data {
        segmentId
        counts {
          data {
            athleteCount
            effortCount
            ts
          }
        }
      }
    }
  }
`;

const endpoint = 'https://graphql.fauna.com/graphql';
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${env.FAUNA_SECRET}`,
  },
});
module.exports.allSegments = async () => {
  res = await client.request(print(q));
  const data = res.allSegments.data;
  return data;
};
