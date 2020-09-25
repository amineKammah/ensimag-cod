//import DataLoader from './DataLoader';
import ChartPlotter from './ChartPlotter';

const rootElement = document.getElementById('myChart');

const chart = new ChartPlotter();

chart.render(rootElement);
//chart.perRaceDeathsDoughnut(rootElement); 