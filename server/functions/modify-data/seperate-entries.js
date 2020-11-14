const seperateEntries = (result, portfolio) => {
    const results = [];
    for (const [key, value] of Object.entries(result)) {
        value.forEach((element) => {
            const date = `${element.date.getFullYear()}-${(element.date.getMonth() + 1)}-${element.date.getDate()}`;
            const amount = portfolio.getPortfolio().find(({symbol}) => symbol === key).amount;
            const symbol = portfolio.getPortfolio().find(({symbol}) => symbol === key).symbol;
            
            const entry = {DATE: date, VALUE: element.close * amount, SYMBOL: symbol};
            results.push(entry);
        })
      }
    return results.reverse();
}
exports.seperateEntries = seperateEntries;