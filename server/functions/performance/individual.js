const getPerformance = async (startDate) => {
    const yahooFinance = require('yahoo-finance');
    const { seperateEntries } = require('../modify-data/seperate-entries');
    const today = require('../date/today').getDate();
    const portfolio = require('../../objects/portfolio');

    let results = [];

    await yahooFinance.historical({
        symbols: portfolio.getPortfolio().map(item => item.symbol),
        from: startDate,
        to: today,
      }, function (err, result) {
        results = seperateEntries(result, portfolio);
      }
    );
    return results.reverse();
};


exports.getPerformance = getPerformance;
