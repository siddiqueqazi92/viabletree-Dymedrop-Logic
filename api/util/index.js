const randomstring = require("randomstring");
const moment = require("moment")

module.exports = {

  
  generateRandomString: function (length = 30) {
    return randomstring.generate({ length });
  },
  generatePageUrl: function (slug) {    
    return `/${slug}`;
  },
  sumBy: function (arr, key) {
    let sum = 0;
    try {
      for (obj of arr) {
        sum += obj[key];
      }
    } catch (err) {
      
    }
    return sum;
  },
   convertUnixToUtc: function (unix) {
    return moment.unix(unix ).utc().format("YYYY-MM-DDTHH:mm:ss")
}
};
