const personalPerformance = require('./server/functions/performance/personal');
const individualPerformance = require('./server/functions/performance/individual');
const express = require('express')
const app = express()
const port = 3000;
const path = require('path');
const { generateCSV } = require('./server/functions/csv/generate');
const calculateSPY = require('./server/functions/performance/spy');
const startDate = '2016-10-22';

personalPerformance.getPerformance(startDate).then((records) => {
    generateCSV(records, 'personal');
    individualPerformance.getPerformance(startDate).then((individualRecords) => {
        generateCSV(individualRecords, 'individual');   
    });
    calculateSPY.getPerformance(startDate).then((spyRecords) => {
        generateCSV(spyRecords, 'spy');
    });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/index.html'));
});

app.get('/data/:csvFile', function(req, res) {
    res.sendFile(path.join(__dirname + `/client/data/${req.params.csvFile}`));
});

app.get('/scripts/:id', function(req, res) {
    res.sendFile(path.join(__dirname + `/client/scripts/${req.params.id}`));
});

app.get('/script.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/script.js'));
});

app.listen(port, () => {
  console.log(`Track performance app listening at http://localhost:${port}`)
})