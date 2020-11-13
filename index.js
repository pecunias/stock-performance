const personalPerformance = require('./server/functions/performance/personal');
const express = require('express')
const app = express()
const port = 3000;
const path = require('path');
const { generateCSV } = require('./server/functions/csv/generate');
const calculateSPY = require('./server/functions/performance/spy');
const startDate = '2016-10-22';

personalPerformance.getPerformance(startDate).then((records) => {
    calculateSPY.getPerformance(startDate).then((spyRecords) => {
        generateCSV(spyRecords, 'spy');
    });
    generateCSV(records, 'personal');
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/index.html'));
});

app.get('/data/:csvFile', function(req, res) {
    res.sendFile(path.join(__dirname + `/client/data/${req.params.csvFile}`));
});

app.get('/script.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/script.js'));
});

app.listen(port, () => {
  console.log(`Track performance app listening at http://localhost:${port}`)
})