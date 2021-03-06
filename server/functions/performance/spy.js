const getPerformance = async (startDate) => {
    const yahooFinance = require('yahoo-finance');
    const today = require('../date/today').getDate();

    const results = [];

    await yahooFinance.historical({
        symbol: 'SPY',
        from: startDate,
        to: today,
      }, function (err, result) {
        result.forEach((element) => {
            const date = `${element.date.getFullYear()}-${(element.date.getMonth() + 1)}-${element.date.getDate()}`;
            const entry = {DATE: date, VALUE: element.close, SYMBOL: 'SPY'};
            results.push(entry);
        });
      }
    );
    return results.reverse();
};


exports.getPerformance = getPerformance;
