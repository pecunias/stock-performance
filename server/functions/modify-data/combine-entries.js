const combineEntries = (result, portfolio, symbolName) => {
    const results = [];
    for (const [key, value] of Object.entries(result)) {
        value.forEach((element) => {
            const date = `${element.date.getFullYear()}-${(element.date.getMonth() + 1)}-${element.date.getDate()}`;
            const amount = portfolio.getPortfolio().find(({symbol}) => symbol === key).amount;
            
            const entry = {DATE: date, VALUE: element.close * amount, SYMBOL: symbolName};
            const indexExistingResult = results.findIndex((value) => value.DATE === entry.DATE);

            if (indexExistingResult > -1) {
                results[indexExistingResult].VALUE += entry.VALUE;
            } else {
                results.push(entry);
            }
        })
      }
    return results;
}
exports.combineEntries = combineEntries;