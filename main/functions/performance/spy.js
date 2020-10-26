const getPerformance = async (initialValue, startDate) => {
    const yahooFinance = require('yahoo-finance');
    const today = require('../date/today').getDate();

    const results = [];

    await yahooFinance.historical({
        symbol: 'SPY',
        from: startDate,
        to: today,
      }, function (err, result) {
        const amountSPY = Math.floor(initialValue / (result[result.length - 1].close));
        result.forEach((element) => {
            const date = `${element.date.getFullYear()}-${(element.date.getMonth() + 1)}-${element.date.getDate()}`;
            const amount = amountSPY;
            const entry = {DATE: date, VALUE: element.close};
            results.push(entry);
        });
      }
    );
    return results;
};


exports.getPerformance = getPerformance;
