const mongoose = require('mongoose');


const commentSchema = mongoose.Schema({
  text:String,
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date:{ type: Date, default: Date.now
  },
  post: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Post'
}
})

module.exports = mongoose.model('Comment', commentSchema);
