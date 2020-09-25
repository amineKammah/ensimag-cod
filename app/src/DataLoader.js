import * as d3 from 'd3';
import "core-js/stable"
import "regenerator-runtime/runtime"

export default class {
  
  constructor(rootElement, dataPath) {
    this.rootElement = rootElement;
    this.dataPath = dataPath;
  }
  
  loadData() {
//      DataFrame.fromCSV(this.dataPath).then(df => this.data = df);
       return d3.csv(this.dataPath);
  }
  
  async render() {
    this.data = await this.loadData();
    // define html 
    let content = this.data;
    console.log(content);

    rootElement.innerHTML = content;
  }
  
};
