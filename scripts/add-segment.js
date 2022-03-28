import inquirer from 'inquirer';
import Firestore from "@google-cloud/firestore";
import { uploadMap } from '../frontend/src/maps.js';

const db = new Firestore({
  projectId: "secret-strava"
});
const {stravaUrl} = await inquirer.prompt([{
    type: 'input',
    name: 'stravaUrl',
    message: 'Paste Strava URL:'
}]);
const results = stravaUrl.match(/segments\/(.*)\w+/)
const segmentId = results[1]
console.log(segmentId)
await uploadMap(segmentId);
console.log('uploaded')