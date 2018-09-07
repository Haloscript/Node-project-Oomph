const Post = require('./models/Post.js');
const User = require('./models/User.js');
const Comment = require('./models/Comment.js');

const cache = (client) =>{
    return {
      savePost: (id, res) => {
        Post.findById(id)
          .exec((err, post) => {
            if (err) return res.send(err);
            client.set(id, JSON.stringify(post))
          })
      },
        saveComment: (id, res)=>{
          Comment.find({post:id})
          .populate('user')// Команда позволяющая вытаскивать дополнительные данные из модельки которя связана ( т.е модель юзера связана с комментрием теперь по айди хранящемся в коментарии мы вытаскиваем и юзера котоырй его оставил )
          .exec((err, comments)=>{
            if (err) return res.send(err)
            client.set(id+'comment', JSON.stringify(comments))
          })

        },
        saveProfile:(id, res)=>{
          Post.find({user: id})
          .exec((err, posts)=>{
            if (err) return res.send(err)
            User.findById(id)
              .exec((err, user) => {
                if(err) return next(err)
                client.set(id+'profilePosts', JSON.stringify(posts))
                client.set(id+'profileUser', JSON.stringify(user))
        })
      })
     }
    }

}

module.exports = cache;
