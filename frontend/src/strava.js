const { SegmentsApi } = require('strava-client');
require('axios-debug-log');
const { env } = require('process');
const createAuthRefresh = require('axios-auth-refresh').default;
const axios = require('axios').default;

const clientId = env.STRAVA_CLIENT_ID;
const clientSecret = env.STRAVA_CLIENT_SECRET;
let accessToken = env.STRAVA_ACCESS_TOKEN;
let refreshToken = env.STRAVA_REFRESH_TOKEN;

const refreshAuthLogic = async (failedRequest) => {
  console.log('getting refresh token');
  const res = await axios.post('https://www.strava.com/oauth/token', {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  accessToken = res.data.access_token;
  refreshToken = res.data.refresh_token;
  failedRequest.response.config.headers[
    'Authorization'
  ] = `Bearer ${res.data.access_token}`;
  return Promise.resolve();
};
const newBearerToken = () => {
  return `Bearer ${accessToken}`;
};
axios.interceptors.request.use((r) => {
  const token = newBearerToken();
  r.headers.Authorization = token;
  return r;
});
createAuthRefresh(axios, refreshAuthLogic, {
  skipWhileRefreshing: false,
});
const api = new SegmentsApi(
  {
    baseOptions: {},
    accessToken,
  },
  'https://www.strava.com/api/v3',
  axios
);
const stravaData = async (segmentId) => {
  const segment = await api.getSegmentById(segmentId);
  return segment.data;
};

const generateCounts = (segment) => {
  const data = segment.counts;
  data.forEach((c, i) => {
    if (i > 0) {
      const prevCount = data[i - 1].effortCount;
      c.efforts = c.effortCount - prevCount;
    }
  });
};

module.exports.stravaData = stravaData;
module.exports.generateCounts = generateCounts;
