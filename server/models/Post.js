const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  title: String,
  content: String,
  author: String,
  user:{ type: mongoose.Schema.Types.ObjectId, ref:'User'},
  date: {
    type: Date,
    default: Date.now
  },
  file_link: String,
  likes:{
    type:Number,
    default:0
  }
});
module.exports = mongoose.model('Post', postSchema); //Экспорт модели БД!
