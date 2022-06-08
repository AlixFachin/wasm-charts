import {Chart, registerables} from "chart.js"

const ARRAY_LENGTH = 20;
const initialChart = [];
const labels = [];
let sortingChart = [];
const MAX_VALUE = 500;

let chart1, chart2;

function resetCharts() {
    // 1) Randomizing the array
    initialChart.splice(0, initialChart.length);
    labels.splice(0, labels.length);
    for (let i=0; i < ARRAY_LENGTH; i++) {
        initialChart.push(Math.round(Math.random() * MAX_VALUE));
        labels.push(i+1);
    }
    sortingChart = [...initialChart];

    console.log(initialChart);
    console.log(sortingChart);

    // 2) Setting up the context
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    Chart.register(...registerables);

    if (chart1) chart1.destroy();
    chart1 = new Chart( ctx1, {
        type: 'bar',
        data: { 
            labels: labels,
            datasets: [{
                data: initialChart,
                backgroundColor: ['blue'],
                borderColor: ['blue'],
                label: 'initial data',
            }]
        },
        options: {}
    });

    if (chart2) chart2.destroy();
    chart2 = new Chart( ctx2, {
        type: 'bar',
        data: { 
            labels: labels,
            datasets: [{
                data: sortingChart,
                backgroundColor: ['red']
            }]
        },
        options: {}
    });
}

// This function will run the sorting function inside C++
function runSort() {
    const cppSort = Module.cwrap("cppsort", null, ["number", "number"]);

    console.log(sortingChart);

    var input_array = new Int32Array(sortingChart);
    var bpe = input_array.BYTES_PER_ELEMENT;
    var len = input_array.length;

    var array_pointer = Module._malloc(len * bpe);

    console.log('input array: ', Array.from(input_array));

    Module.HEAP32.set(input_array, array_pointer / bpe);
    cppSort(array_pointer, len);

    // copying back array_pointer into the sortingChart
    const sortedi32Array = new Int32Array(Module.HEAP32.buffer, array_pointer, len)
    sortingChart = Array.from(sortedi32Array);

    Module._free(array_pointer);

    console.log('Finished sorting!');
    console.log(sortingChart);
    chart2.data.datasets[0].data = sortingChart;
    chart2.update();
}

document.getElementById('btnReset').addEventListener('click', resetCharts);
document.getElementById('btnSort').addEventListener('click', runSort);