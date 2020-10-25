const personalPerformance = require('./main/functions/performance/personal');
const express = require('express')
const app = express()
const port = 3000;
const path = require('path');
const { generateCSV } = require('./main/functions/csv/generate');
const calculateSPY = require('./main/functions/performance/spy');
const startDate = '2016-10-22';

personalPerformance.getPerformance(startDate).then((records) => {
    calculateSPY.getPerformance(records[records.length - 1].VALUE, startDate).then((spyRecords) => {
        generateCSV(spyRecords, 'spy');
    });
    generateCSV(records, 'personal');
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/data/personal.csv', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/personal.csv'));
});

app.get('/data/spy.csv', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/spy.csv'));
});

app.listen(port, () => {
  console.log(`Track performance app listening at http://localhost:${port}`)
})