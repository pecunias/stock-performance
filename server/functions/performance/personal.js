const getPerformance = async (startDate) => {
    const yahooFinance = require('yahoo-finance');
    const { combineEntries } = require('../modify-data/combine-entries');
    const today = require('../date/today').getDate();
    const portfolio = require('../../objects/portfolio');

    let results = [];

    await yahooFinance.historical({
        symbols: portfolio.getPortfolio().map(item => item.symbol),
        from: startDate,
        to: today,
      }, function (err, result) {
        results = combineEntries(result, portfolio, 'PERS');
      }
    );
    return results.reverse();
};


exports.getPerformance = getPerformance;
