const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
  email:{type:String, unique:true},
  password:String,
  name:String,
  surname:String,
  date:{
    type : Date,
    default: Date.now
  },
  file_link: String,
  likes:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }]
})
UserSchema.pre('save',function(next) { //Преобработчик который србатывает перед сохрнием формы пользователь
  var user = this
  if(!user.isModified('password')){ // Если у юзер не заполнил поле пароль тогда пароль не хешируется
    return next()
  }
  bcrypt.genSalt(10, function (err, salt) {// Команд бкрипту на генерировние нового 10 значного текста
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function(err, hash) {// Если ошибки нет тогда бкрипт использует инструмент хэш встроенный в библиотеку б крипт, данный инструмент берет пароль затем берет сгенерированный текст вместе их соединяет (хеширует)
      if (err) return next(err)
      user.password = hash// Присваеваем значение хэша к значению пароля у пользователя
      next()
    })
  })
})

UserSchema.methods.comparePassword = function (password, next) {// Функция Сравнения пароля который ввел пользователь и проля который хрнится в БД
  bcrypt.compare(password, this.password, function(err, isMatch){//Функция  получает значение введеного пасворда и значение пасворда у данного юзер и выдает ответ в виде исМатч
    next(err, isMatch)
  })
}

module.exports= mongoose.model('User', UserSchema);
