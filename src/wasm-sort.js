import {Chart, registerables} from "chart.js"

const ARRAY_LENGTH = 2000;
const initialChart = [];
const labels = [];
let sortingChart = [];
const MAX_VALUE = 500;

let chart1, chart2, chart3;

const cppSort = Module.cwrap("cppsort", null, ["number", "number"]);

Chart.register(...registerables);

function resetCharts() {
    // 1) Randomizing the array
    initialChart.splice(0, initialChart.length);
    labels.splice(0, labels.length);
    for (let i=0; i < ARRAY_LENGTH; i++) {
        initialChart.push(Math.round(Math.random() * MAX_VALUE));
        labels.push(i+1);
    }
    sortingChart = [...initialChart];

    // 2) Setting up the context
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    if (chart1) chart1.destroy();
    chart1 = new Chart( ctx1, {
        type: 'bar',
        data: { 
            labels: labels,
            datasets: [{
                data: initialChart,
                backgroundColor: ['#FB5607'],
                label: 'initial data',
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                }
            }
        },
    });
    
    if (chart2) chart2.destroy();
    chart2 = new Chart( ctx2, {
        type: 'bar',
        data: { 
            labels: labels,
            datasets: [{
                data: sortingChart,
                backgroundColor: ['#FF006E']
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                }
            }
        }
    });
}

// This function will run the sorting function inside C++
function runSort() {

    var input_array = new Int32Array(sortingChart);
    var bpe = input_array.BYTES_PER_ELEMENT;
    var len = input_array.length;

    const startTime_cpp = performance.now();
    var array_pointer = Module._malloc(len * bpe);
    Module.HEAP32.set(input_array, array_pointer / bpe);
    cppSort(array_pointer, len);

    // copying back array_pointer into the sortingChart
    const sortedi32Array = new Int32Array(Module.HEAP32.buffer, array_pointer, len)
    sortingChart = Array.from(sortedi32Array);
    Module._free(array_pointer);
    const endTime_cpp = performance.now();

    chart2.data.datasets[0].data = sortingChart;
    chart2.update();

    // Performance comparison
    const arrayCopy = [...initialChart];
    const startTime_js = performance.now();
    arrayCopy.sort();
    const endTime_js = performance.now();

    console.log(`CPP duration: ${endTime_cpp - startTime_cpp} (ms)`);
    console.log(`JS duration: ${endTime_js - startTime_js} (ms)`);

}

function compareSorts() {
    const sizeArray = [200, 500, 10000, 50000, 200000, 500000];
    const jsPerf = [];
    const cppPerf = [];

    for (let curSize of sizeArray) {
        console.log(`Sorting ${curSize} elements...`)
        const initArray = [];
        for (let i=0; i < curSize; i++) {
            initArray.push(Math.round(Math.random() * MAX_VALUE));
        }

        // CPP Sorting -=--=-=-=-=-=-=-=-=--=--=-=-=-=-=-=-=-=-
        const input_array = new Int32Array(initArray);
        const bpe = input_array.BYTES_PER_ELEMENT;
        const len = input_array.length;
    
        const startTime_cpp = performance.now();
        const array_pointer = Module._malloc(len * bpe);
        Module.HEAP32.set(input_array, array_pointer / bpe);
        cppSort(array_pointer, len);
    
        // copying back array_pointer into the sortingChart
        const sortedi32Array = new Int32Array(Module.HEAP32.buffer, array_pointer, len)
        const sortedResult = Array.from(sortedi32Array);
        Module._free(array_pointer);
        const endTime_cpp = performance.now();
        
        // JavaScript Sorting -=--=-=-=-=-=-=-=-=--=--=-=-=-=-=-=-=-=-
        const startTime_js = performance.now();
        const jsArray = [...initArray];
        jsArray.sort();
        const endTime_js = performance.now();

        // JavaScript Sorting -=--=-=-=-=-=-=-=-=--=--=-=-=-=-=-=-=-=-
        jsPerf.push(endTime_js - startTime_js);
        cppPerf.push(endTime_cpp - startTime_cpp);


    }

    for (let i=0; i < sizeArray.length; i++) {
        console.log(`Results for size ${sizeArray[i]}: JS=${jsPerf[i]}, C++=${cppPerf[i]}`);
    }

    // displaying the results in the third graph
    const ctx3 = document.getElementById('chart3').getContext('2d');
    if (chart3) chart3.destroy();

    chart3 = new Chart( ctx3, {
        type: 'line',
        data: {
            labels: sizeArray,
            datasets: [ {
                data: jsPerf,
                label: 'JavaScript',
                backgroundColor: ['#662C91'],
            }, 
            {
                data: cppPerf,
                label: 'C++/WASM',
                backgroundColor: ['#FF006E'],
        }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'JS / WASM Array sorting comparison (ms)'
                }
            }
        }
    });

}

document.getElementById('btnReset').addEventListener('click', resetCharts);
document.getElementById('btnSort').addEventListener('click', runSort);
document.getElementById('btnCompare').addEventListener('click', compareSorts);