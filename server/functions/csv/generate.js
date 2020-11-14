const generateCSV = (records, fileName) => {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: `client/data/${fileName}.csv`,
        header: [
            {id: 'DATE', title: 'date'},
            {id: 'VALUE', title: 'value'},
            {id: 'SYMBOL', title: 'symbol'}
        ]
    });
     
    csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log(`Done generating ${fileName}.csv`);
        });
}

exports.generateCSV = generateCSV;
