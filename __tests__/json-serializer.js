const { dump } = require('js-yaml');

module.exports = {
  serialize(val) {
    return dump(val);
  },

  test(val) {
    return true;
  },
};
