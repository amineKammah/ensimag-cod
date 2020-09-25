import DataFrame from 'dataframe-js';

export default class {
  
  constructor(rootElement, dataPath) {
    this.rootElement = rootElement;
    this.dataPath = dataPath;
  }
  
  loadData() {
      DataFrame.fromCSV(this.dataPath).then(df => this.data = df);
  }
  
  render() {
    this.loadData()
    // define html 
    let content = this.data.dim();

    rootElement.innerHTML = content;
  }
  
};
