const { observations } = require('../src/weather');

// STATIONS: https://www.wrh.noaa.gov/map/?obs=true&wfo=sto&basemap=OpenStreetMap&boundaries=true,false&obs_popup=true

const _stations = [
  'KOMA',   // Lewis and Clark 18804054
  'C8198',  // Tranquility 10815130, 4481947, 18808579
  'E7836',  // Swanson 8417986, 799024
  'D9161',  // Jewell 1692340, 5904281, 5904382
  'F2659',  // Walnut Creek 9729664
  // 'E9007',  // Platte, Oxbow
  'KFET',   // Calvin Crest 2843721
  'D3452'   // Branched Oak 4646492
];

const stations = [
  { id: 'KOMA', segments: [18804054] },
  { id: 'C8198', segments: [10815130, 4481947, 18808579] },
  { id: 'E7836', segments: [8417986, 799024] },
  { id: 'D9161', segments: [1692340, 5904281, 5904382] },
  { id: 'F2659', segments: [9729664] },
  { id: 'KFET', segments: [2843721] },
  { id: 'D3452', segments: [4646492] }
]

module.exports = observations(stations);