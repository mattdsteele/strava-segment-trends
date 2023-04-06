const { resolve } = require("path");
const flatCache = require("flat-cache");
const cache = flatCache.load("segments", resolve(".cache/flatcache"));
const checkOrGet = async (key, fn, id) => {
  let cached = cache.getKey(key);
  if (!cached) {
    console.log(`getting data for ${key}`);
    cached = await fn(id);
    cache.setKey(key, cached);
  }
  return cache.getKey(key);
};

module.exports.checkOrGet = checkOrGet;
module.exports.saveCache = () => cache.save();
