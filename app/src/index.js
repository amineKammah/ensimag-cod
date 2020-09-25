import DataLoader from './DataLoader';
import "core-js/stable"
import "regenerator-runtime/runtime"

const rootElement = document.getElementById('rootElement');
var conv = new DataLoader(rootElement, '../../data/processed.csv');
conv.render();
