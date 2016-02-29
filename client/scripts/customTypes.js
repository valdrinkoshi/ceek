var t = require('tcomb-form');

var CeekDate = t.irreducible('CeekDate', function (x) {
  return dateTransformer.parse(x) instanceof Date;
});

function dateToTcombDateString (date) {
  return [date.getUTCFullYear(),  date.getUTCMonth(), date.getUTCDate()];
};

var dateTransformer = {
  format: function (value) {
    if (value instanceof Date) {
      return dateToTcombDateString(value);
    } else if (typeof value === 'string') {
      return dateToTcombDateString(new Date(value));
    } else if (Array.isArray(value)) {
      return value;
    }
    return [null, null, null];
  },
  parse: function (value) {
    if (Array.isArray(value) && value[0] === null  && value[1] === null && value[2] === null) {
      return null
    } else if (Array.isArray(value)) {
      return new Date(value[0], value[1], value[2]);
    } else if (typeof value === 'string') {
      return new Date(value)
    } else if (value instanceof Date) {
      return value;
    }
  }
};

module.exports = {
  CeekDate: CeekDate,
  dateTransformer: dateTransformer
}
