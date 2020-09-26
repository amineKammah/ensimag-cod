import DataFrame from 'dataframe-js'
import { readFileSync } from 'fs';

const jsonData = readFileSync('../data/preprocessed_dataset.json', 'utf8');
const data = JSON.parse(jsonData);
const df = new DataFrame(data)
export default df;