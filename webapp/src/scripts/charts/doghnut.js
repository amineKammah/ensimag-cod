/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var ctx = document.getElementById('myDoughnutChart');
var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
            datasets: [{
                data: [10, 20, 30],
                backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f"]
            }],

            labels: [
                'White',
                'Black',
                'Hispanic'
            ]
        },
    options: {
        title: {
            display : true,
            text: 'First Doghnut'
        }
    }
});