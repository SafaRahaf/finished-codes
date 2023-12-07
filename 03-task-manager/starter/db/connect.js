const mongoos = require('mongoose');

const connectdb = (url) => {
  return mongoos.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
};

module.exports = connectdb;
