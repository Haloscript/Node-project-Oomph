app.controller('PostCtrl', PostCtrl);// Создание контрллера

PostCtrl.$inject = ['$http', '$state','$rootScope', '$cookies'];//Внедрениние контроллера в шттп запрос


function PostCtrl($http, $state, $rootScope, $cookies) {
  vm.post_id = $state.params.id;// Вытаскивем айди

// Функция лайка
        vm.setLike = function (post_id) {
          $http.put('/api/like/'+ post_id)
          .success(function(response) {
            $rootScope.session = $cookies.getObject('session');
            console.log($rootScope.session);
            console.log(response);
            vm.post = response;
          })
          .error(function (err) {
            console.log(err);

          })
        }
// Запрос выбранной запси
$http.get('/api/post/'+ vm.post_id)
  .success(function (response) {
    vm.post= response;
  })
    .error(function (err) {
      console.log(err);
    })
// Запрос коментов выбранной запси
  $http.get('/api/comment/'+ $state.params.id)
    .success(function(response) {
      console.log(response);
        vm.comments= response;
    })
    .error(function(response) {
      console.log(err);
    })
// Добовление коментов к этой записи
  vm.addComment = function() {
    var data = {
      text: vm.text,
      post: $state.params.id
    }
    $http.post('/api/comment', data)
    .success(function(response) {
      console.log(response);
      vm.comments.push(response);
    })
    .error(function(err) {
      console.log(err);
    })
  }
  // Удаление  коментов к этой записи
    vm.removeComment = function (index, comment) {//Запрос на удаление
      $http.delete('/api/comment/' + comment._id)// передаем айди юзера
      .success(function (response) {
        vm.comments.splice(index, 1);//С какова индеса необходимо наччать удаление и кол во удалений
        console.log(response);
      })
      .error(function (err) {
        console.log(err);
      })
  }

  vm.selectComment = function (index, comment) {// Функция выбор поста для редктирования т.е данные поля будут заполнятся в зависимости от выбрного поста
    vm.edit_comment_index = index;
    vm.edit_comment_id = comment._id;
    vm.edit_comment_text = comment.text;
    console.log(index)
  }

// Изминение  коментов к этой записи 
vm.editComment = function () {// фУНКЦИЯ для отпрвки зпроса на изменение
  var data = {
    text: vm.edit_comment_text
  }
  $http.put('/api/comment/'+ vm.edit_comment_id, data)
    .success(function (response) {
      vm.edit_comment_id = undefined;// Убирет окно после нажатия подтверждения тзминений
      console.log(response);

      vm.comments[vm.edit_comment_index] = response;// По индексу выбирем пост и заменяем его на ответ с сервера
      console.log(vm.edit_comment_index);

    })
      .error(function (err) {
        console.log(err);

      })
      }
}
