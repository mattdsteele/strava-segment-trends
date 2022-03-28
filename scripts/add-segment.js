import inquirer from 'inquirer';
import Firestore from "@google-cloud/firestore";
import { uploadMap } from '../frontend/src/maps.js';

const db = new Firestore({
  projectId: "secret-strava"
});
const answers = await inquirer.prompt([{
    type: 'input',
    name: 'stravaUrl',
    message: 'Paste Strava URL:'
}, {
    type: 'list',
    name: 'sport',
    message: 'Sport type',
    choices: ['cycling', 'running'],
    default: 'cycling'
}, {
    type: 'input',
    name: 'weather',
    message: 'Weather Station Id',
    default: 'C8198'
}, {
    type: 'input',
    name: 'trailName',
    message: 'Trail Name'
}]);
const {stravaUrl, sport, weather, trailName} = answers;
const results = stravaUrl.match(/segments\/(.*)/)
const segmentId = results[1]
console.log(segmentId)
await uploadMap(segmentId);
const d = {
    segmentId,
    sport,
    trail: trailName,
    weatherStationId: weather
}
const newDoc = await db.collection("segments").doc();
await newDoc.set(d);
console.log('uploaded')