import DataLoader from './DataLoader';

const rootElement = document.getElementById('rootElement');
var conv = new DataLoader(rootElement, '../../data/processed.csv');
conv.render();
