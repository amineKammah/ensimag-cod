// TODO: Import DataFrame from url instead of installing
import DataFrame from 'dataframe-js'
import { readFileSync } from 'fs';

var jsonData = readFileSync('../data/race_data.json', 'utf8');
var data = JSON.parse(jsonData);
const race_df = new DataFrame(data)

jsonData = readFileSync('../data/shootings_data.json', 'utf8');
data = JSON.parse(jsonData);
const shootings_df = new DataFrame(data)
export { shootings_df, race_df };