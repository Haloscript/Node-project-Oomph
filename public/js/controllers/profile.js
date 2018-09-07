app.controller('ProfCtrl', ProfCtrl);

ProfCtrl.$inject = ['$http', '$rootScope', '$state'];
function ProfCtrl($http , $rootScope , $state) {
  var vm = this;
  vm.user_id = $state.params.id;
  $http.get('/api/profile/'+ $state.params.id)
  .success(function(response) {
    console.log(response);
    vm.posts=response;
  })
  .error(function (err) {
    console.log(err);
  })
  // Запрос на добовление записи с страницы профиля
  vm.addPost = function () {
  console.log(vm.file);//
  var data = new FormData();
  data.append('title', vm.title);
  data.append('content', vm.content);
  data.append('author', vm.author);
  data.append('file', vm.file);

    $http.post('/api/profile/'+ $state.params.id , data, {
      headers: {'Content-Type' : undefined}
    })
    .success(function (response) {
      $rootScope.addForm = undefined;
      vm.posts.push(response);
    })
    .error(function (err) {
      console.log(err);
    })
  }
  // Функция вызова окна изминение записи
  vm.showEditPost = function () {
    vm.edit_id = !vm.edit_id;
  }
  // Функция вызова окна добовления записи
  vm.show = function () {
    $rootScope.addForm = !$rootScope.addForm;
  }
  // Функция удаления записи
  vm.removePost = function (index, post) {
    $http.delete('/api/profile/'+ post._id)
    .success(function (response) {
      vm.posts.splice(index, 1);
      console.log(response);
    })
    .error(function (err) {
      console.log(err);
    })

  }

  vm.selectPost = function (index, post) {// Функция выбор поста для редктирования т.е данные поля будут заполнятся в зависимости от выбрного поста
    vm.edit_index = index;
    vm.edit_id = post._id;
    vm.edit_title = post.title;
    vm.edit_content = post.content;
    vm.edit_author = post.author;
    console.log(index)
  }
// Изминение записи
vm.editPost = function () {
  var data = new FormData();
  data.append('title', vm.edit_title);  //Само изменение Данных
  data.append('content', vm.edit_content);
  data.append('author', vm.edit_author);
  data.append('file', vm.file)

  $http.put('/api/profile/post/'+ vm.edit_id, data,{
    headers: {'Content-Type' : undefined}
  })
    .success(function (response) {
      vm.edit_id = undefined;// Убирет окно после нажатия подтверждения тзминений
      vm.posts[vm.edit_index] = response;
      console.log(vm.edit_index);

    })
      .error(function (err) {
        console.log(err);

      })
}
// Profile information
$http.get('/api/profile/'+$state.params.id)
.success(function(response) {
  vm.user = response.user;
  vm.posts = response.posts;
})
.error(function (err) {
  console.log(err);
})
  vm.showUserEdit = function(user) {

    vm.editProfile_id = vm.user._id;
    vm.edit_name = vm.user.name;
    vm.edit_surname = vm.user.surname;
    vm.edit_email = vm.user.email;
}
//Ззпрос на изменение профиля
vm.editProfile = function () {
  var data = new FormData();
  data.append('name', vm.edit_name);  //Само изменение Данных
  data.append('surname', vm.edit_surname);
  data.append('email', vm.edit_email);
  data.append('file', vm.avatar)

  $http.put('/api/profile/user/'+ vm.editProfile_id, data,{
    headers: {'Content-Type' : undefined}
  })//Запрос на изминение на сервер
    .success(function (response) {
      vm.editProfile_id = undefined;// Убирет окно после нажатия подтверждения тзминений
      vm.user = response;
    console.log(vm.user);

    })
      .error(function (err) {
        console.log(err);

      })
}
}
