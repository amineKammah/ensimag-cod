import * as d3 from 'd3';
import DataFrame from 'dataframe-js';

import "core-js/stable"
import "regenerator-runtime/runtime"

export default class{ 
       
    static async loadData(dataPath) {
        const data = await d3.csv(dataPath);
        const df = new DataFrame(data);

        return df;
    }
}