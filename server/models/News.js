const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
  name: String,
  surname: String,
  news: String,
  date: Date
});

module.exports = mongoose.model('News', newsSchema);
