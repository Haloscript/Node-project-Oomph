console.log('hello, world');

// Подключение библиотек
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000; //Задаем  порт
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const upload = multer({dest: 'public/uploads'});
const session = require('express-session');
const mongoStore = require('connect-mongo')(session)
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const redis = require('redis');

mongoose.connect('mongodb://localhost:27017/leson2')// Создание БД

const client = redis.createClient();//Подключение редис клиента
const cache = require('./server/cache')(client);

client.on('error', (err)=>console.log(err));
//Подключем формы БД
const Post = require('./server/models/Post.js');
const User = require('./server/models/User.js');
const Comment = require('./server/models/Comment.js');
// Создаем локальную стратегию для афторизации
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, next)=>{
  User.findOne({email: email})
  .exec((err, user)=>{//
    if(err) return next(err)
    if(!user) return next(null, false)
    user.comparePassword(password, (err, isMatch)=>{
      if(err) return next(err)
      if(!isMatch) return next(null, false)//Проверка совпадения пароля
      next(null, user)
    })
  })

}))
//Функции сохронения и получения данных из сессии
passport.serializeUser((user, next)=>{
  next(null, user._id)
})
passport.deserializeUser((id, next)=>{
  User.findById(id)
  .exec((err, user)=>{
    if(err) return next(err)
    next(null, user)//
  })

})



app.use(express.static('./public')) //Обращение чтобы библиотека статически подключилсь к фронт энд части веб страницы
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({limit: '2mb'})) // Мкс кол во входящих данных в сервер за один запрос
app.use(morgan('dev'))
app.use(session({
  secret:'some secret', //Задаем пароль нашей сесии
  key:'some key',// Задаем ключ
  resave:true,// Возможность пересохранения
  saveUninitialized:true,// Возможность сохранения в сессии
  store:new mongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

// Запрос на выгрузку данных с бд с функцией пагинации (выгрузка будет по 10 записей на странице)
app.get('/api/post/home/:page', (req, res, next)=>{
  Post.find()
  .skip((req.params.page - 1)*10)
  .limit(10)
  .exec((err, posts) =>{
    if (err) return res.send(err)
    Post.count().exec((err, count)=>{
    if (err) return res.send(err)
    res.send({posts:posts, count:count})
    })
  })
})

// Запрос на создание записи в БД
app.post('/api/post', upload.single('file'),  (req, res, next)=>{
  if (req.user) {//
  var post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.user.name,
    user:req.user._id
  })
// Работа с файлом
  var type = req.file.originalname.split('.').pop();
  var tempPath = req.file.path;
  var targetPath = `public/uploads/${post._id}.${type}`;

  fs.rename(tempPath, targetPath, (err) =>{
    if (err) return res.send(err)
    post.file_link = `/uploads/${post._id}.${type}`
    post.save((err, post)=>{
      if (err) return res.send(err)
      cache.saveProfile(req.user._id, res)
      res.send(post)
    })
  })
}else {
  res.sendStatus(401);
}

// Запрос на удаление записей
app.delete('/api/post/:id', (req, res, next)=>{
  Post.remove({_id: req.params.id})
  .exec((err, post) =>{
    if (err) return res.send(err)
    res.send(200)
  })
})
// Запрос на изминение записей
app.put('/api/post/:id', upload.single('file'), (req, res, next)=>{
  Post.findById(req.params.id)
  .exec((err, post) =>{
    if (err) return res.send(err)
      post.title = req.body.title
      post.content = req.body.content
      post.author = req.body.author

      var type = req.file.originalname.split('.').pop();//Присваевем расширение файла
      var tempPath = req.file.path; //Путь к файлу в данный момент
      var targetPath = `public/uploads/${post._id}.${type}`;//путь к файлу


      fs.rename(tempPath, targetPath, (err) =>{ // При помощи библиотеки назначаем (где она хранится и куда надо сохранить)
        if (err) return res.send(err)
        post.file_link = `/uploads/${post._id}.${type}`
        post.save((err, post)=>{
          if (err) return res.send(err)
          cache.savePost(req.params.id, res)
          res.send(post)
        })
      })
})

})
// Гетовый запрос на получение страницы одного элемента
app.get('/api/post/:id', (req, res, next)=>{
  client.get(req.params.id, (err,post)=>{//Сначала проверяем есть ли такая запись в redis бд
  if (err) return res.send(err)
    else if(post){
      console.log('redis');
      res.send(JSON.parse(post))// так как в редис объекты хронятся в виде текста данной командой мы экспортируем из текстового формата в объект и отпровляем его во фронт
    } else {
      console.log('mongo');
      Post.findById(req.params.id)
      .exec((err, post)=>{
          if (err) return res.send(err);
        cache.savePost(req.params.id, res)
        res.send(post)// Отпровляем ответ на фронт
      })
    }
  })
})


app.post('/api/login', passport.authenticate('local'),  (req, res, next)=>{
    res.cookie('session', JSON.stringify({id:req.user._id, likes: req.user.likes}))// Сохроняем йди пользовтеля в куки
    res.send(200);



})
// Сохранение пользовтеля в БД
app.post('/api/registration', (req, res, next)=>{
  var user = new User({
    name:req.body.name,
    surname:req.body.surname,
    email:req.body.email,
    password:req.body.password
  })
user.save((err, user)=>{
  if(err) return res.send(err)
  console.log(user)
  res.send(user)
  })
})

app.post('/api/logout', (req, res, next)=>{
  req.logout();
  res.clearCookie('session');
  res.send(200);
})
////////////////Profile ответы

app.get('/api/profile/:id',(req, res, next)=>{//Зпрос на отоброжение постов залогининому автору
  client.get(req.params.id+'profileUser', (err,user)=>{
    if(err) return res.send(err)
    client.get(req.params.id + 'profilePosts', (err, posts) => {
      if(err) return res.send(err)
      console.log('proile dowload on redis id'+req.params.id);
      if(user && posts) res.send({user: JSON.parse(user), posts: JSON.parse(posts)})
      else {
        Post.find({user: req.params.id})
        .exec((err, posts)=>{
          if (err) return res.send(err)
          User.findById(req.params.id)
            .exec((err, user) => {
              if(err) return next(err)
              cache.saveProfile(req.params.id, res)
              res.send({user: user, posts: posts})
            })
        })
      }
    })
  })
})
// Запрос на создание записи с строницы профайла
app.post('/api/profile/:id', upload.single('file'),  (req, res, next)=>{
  var post = new Post({ // ПОСТ с большой буквы это модель которую мы создовали
    title: req.body.title,
    content: req.body.content,
    author: req.user.name,
    user:req.user._id
  })

  var type = req.file.originalname.split('.').pop();
  var tempPath = req.file.path;
  var targetPath = `public/uploads/${post._id}.${type}`;

  fs.rename(tempPath, targetPath, (err) =>{
    if (err) return res.send(err)
    post.file_link = `/uploads/${post._id}.${type}`
    post.save((err, post)=>{
      if (err) return res.send(err)
      cache.saveProfile(req.user._id, res)
      res.send(post)
    })
  })
})
// Запрос об удалении записи
app.delete('/api/profile/:id', (req, res, next)=>{
  Post.remove({_id: req.params.id})
  .exec((err, post) =>{
    if (err) return res.send(err)
    cache.saveProfile(req.user._id, res)
    res.send(200)
  })
})
//Запрос на изминение  записи
app.put('/api/profile/post/:id', upload.single('file'), (req, res, next)=>{
  Post.findById(req.params.id)//обрaщение к конкретному посту по айди
  .exec((err, post) =>{
    if (err) return res.send(err)
      post.title = req.body.title
      post.content = req.body.content
      post.author = req.body.author

      var type = req.file.originalname.split('.').pop();//Присваевем расширение файла сплит делит имя файла на массив  а поп вытаскивает последние значение мссива т.е его расширение
      var tempPath = req.file.path; //Путь к файлу в данный момент
      var date = new Date();// Формируем переенную с данными текущей даты и встовляем ее  в нзвание файла что позволит нам без обновления страницы добавить файл т.е с разницей в несколько секунд имя файла будет измененно и добавлено
      var targetPath = `public/uploads/${post._id}.${date.getTime()}.${type}`;// Показывем куда нужно сохранить и формируем его название которое будет состоять из айди  и тип файла кторый мы вытащили до этого
      console.log(targetPath)
      fs.unlinkSync(`public${post.file_link}`);// Функция удаления предыдущего  файла по его  названию чтобы не было захламленности файлами
      fs.rename(tempPath, targetPath, (err) =>{ // При помощи библиотеки файл систем (фс) мы принимаем 2 значения (где она хранится и куда надо сохранить)
        if (err) return res.send(err)
        post.file_link = `/uploads/${post._id}.${date.getTime()}.${type}`// Изминения пути картинки внутри поста испльзуя строку которая есть в модели этого поста, так же и сдесь добовляем дату и сенуды чтобы применились изминения
      post.save((err, posts)=>{
        if (err) return res.send(err)
          res.send(posts)
          })
      })
})
})
// Запрос на изминение информации пользователя включающий добовление аватара
app.put('/api/profile/user/:id', upload.single('file'), (req, res, next)=>{
  User.findById(req.params.id)
  .exec((err, user) =>{
    if (err) return res.send(err)
      user.name = req.body.name
      user.surname = req.body.surname
      user.email = req.body.email

      var type = req.file.originalname.split('.').pop();
      var date = new Date();
      if(!fs.existsSync(`public/uploads/${user.email}`)) {
        fs.mkdirSync(`public/uploads/${user.email}`)
      }
      var targetPath = `public/uploads/${user.email}/${user._id}.${date.getTime()}.${type}`


      fs.rename(tempPath, targetPath, (err) =>{
        if (err) return res.send(err)
        user.file_link = `/uploads//${user.email}/${user._id}.${date.getTime()}.${type}`;
        user.save((err, user)=>{
          if (err) return res.send(err)
          console.log(user);
          cache.saveProfile(req.params.id, res)
          res.send(user)
        })
      })
})
})

// Comments
app.post('/api/comment/',(req, res, next)=>{// запрос на создание комента
  var comment = new Comment({
    text: req.body.text,
    post: req.body.post,
    user: req.user._id
  })
  comment.save((err, comment)=> {
    if (err) return res.send(err)
    comment.user = req.user
    cache.saveComment(req.body.post, res);
    res.send(comment)
  })
})
// запрос на отоброжение  коментов
app.get('/api/comment/:id', (req, res, next)=>{
  client.get(req.params.id+'comment', (err,comments)=>{
  if (err) return res.send(err)
    else if(comments){
      console.log('redis - comments');
      res.send(JSON.parse(comments))
    } else {
      console.log('mongo - comments');
   Comment.find({post: req.params.id})
   .populate('user')
     if (err) return res.send(err)
     cache.saveComment(req.params.id, res);
     res.send(comments);
   })
}
})
})
// Запрос на удаление коментов
app.delete('/api/comment/:id', (req, res, next)=>{
  Comment.findById(req.params.id)
  .exec((err, comment) =>{
    if (err) return res.send(err)
    comment.remove((err) => {
      if(err) return res.send(err)
      console.log('redis - comments del');
      cache.saveComment(comment.post, res)
    res.send(200) // Ответ 200 обознчает что данные получены т.е success
    })
  })
})
// Запрос на изминение коментов
app.put('/api/comment/:id', (req, res, next)=>{
  Comment.findById(req.params.id)
  .exec((err, comment) =>{
    if (err) return res.send(err)
      comment.text = req.body.text
      comment.save((err, comment)=>{
          if (err) return res.send(err)
          comment.user = req.user// в ответе сервера поле юзер отпровляется как объект а не как айди это позволит изминениям в комментарии сразу отобразить имя автора а не при обновлени( при обновлении производится гетовый запрос )
          cache.saveComment(comment.post, res)
          res.send(comment)
        })
      })
})


//Like
app.put('/api/like/:post_id', (req, res, next)=>{// При пут запросе получем айди поста
    User.findById(req.user._id)// Ищем Юзера по айди
    .exec((err, user)=>{// берем его данные
      if(err)return res.send(err)
      Post.findById(req.params.post_id)
      .exec((err, post)=>{// берем его днные
        if(err)return res.send(err)
        var  index = user.likes.findIndex((like)=> `${like}` == req.params.post_id )
        if(index == -1){// Если лайка нету тогда добовляем его
          post.likes ++;// добавление
          user.likes.push(req.params.post_id)
        }else {
          if (post.likes > 0)
          post.likes--; //если лайк есть тогда убираем его
          user.likes.splice(index, 1)// Удаляем обьект из модели юзера
        }
      user.save((err, user)=>{
        if(err)return res.send(err)
        post.save((err, post)=>{
          if (err) return res.send(err)
        res.cookie('session', JSON.stringify({id: user._id, likes: user.likes}))
        cache.savePost(req.params.post_id, res)
        res.send(post);
      })
      })
    })
})
})

app.get('/api/search/:text', (req, res, next)=>{//Принимем гетовый запрос и текст в нем
    var pattern = new RegExp(`^${req.params.text}`, 'i')// В переменной патерн создаем регулярное вырожение в котором указыем данные который передл фронт энд и игнорируем регистр
    Post.find({
      $or:[
        {title:pattern}, // Ищем совпадения по тайтл строке
        {content:pattern}// Ищем совпадения по контент строке
      ]
    }).limit(6).exec((err, posts)=>{//  устанавливаем лимит в 6 записей
      if (err) return res.send(err)
      res.send(posts)//
    })
})

app.get('*', (req, res, next)=>{// При любом переходе добовлять в урл решотку чтобы при обновлении стрницы подгружалась та же самая страница
  res.redirect('/#'+ req.originalUrl);
})

app.listen(port, () =>{
  console.log(`server listen on port ${port}`);
})
