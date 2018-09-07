app.controller('HomeCtrl', HomeCtrl);// Создание контрллера

HomeCtrl.$inject = ['$http', '$rootScope', '$cookies'];//Внедрениние контроллера

//Создание функций контроллера
function HomeCtrl($http, $rootScope, $cookies) {
  var vm = this;
  console.log($rootScope.session);
      vm.current_page = 1;// Переменная с номером текущей страницы
      vm.setLike = function (post_id, index) {
        $http.put('/api/like/'+ post_id)
        .success(function(response) {
          $rootScope.session = $cookies.getObject('session');
          console.log($rootScope.session);
          console.log(response);
          vm.posts[index]= response;
        })
        .error(function (err) {
          console.log(err);

        })
      }
      //  Открытие окон
      vm.showEditPost = function () {
        vm.edit_id = !vm.edit_id;
      }
      vm.show = function () {
        $rootScope.addForm = !$rootScope.addForm;
      }
      // Запрос на главную страницу
      $http.get('/api/post/home/'+ vm.current_page)
      .success(function(response) {
        vm.posts = response.posts;
        vm.count = response.count ;
        vm.count_page = Math.ceil(vm.count/10);//Получаем количество страниц с сожержнием 10 постов или менее
        vm.all_pages =new  Array(vm.count_page)// создаем массив данных в количестве который получили до этого
        for (var i = 0; i < vm.all_pages.length; i++) {
          vm.all_pages[i] = i;//Присваевем номирацию страницам
        }
        vm.pages = vm.all_pages.slice(0, 10);//Сохраняем массив данных от 0 до 10 объектов
      })
      .error(function(err){
        console.log(err);
      });
      // Единая функция пагинации по страницам далее она будет вызыватся
      vm.getPosts = function () {
        $http.get('/api/post/home/'+ vm.current_page)
          .success(function(response) {
            vm.posts = response.posts;
      })
      .error(function (err) {
        console.log(err);
      })
    }
      vm.nextPage = function() {
        if (vm.current_page % 10 == 0 && vm.current_page < vm.count_page){
          vm.pages = vm.all_pages.slice(vm.current_page, vm.current_page + 10);
        }else if (vm.current_page < vm.count_page){
          vm.current_page ++;
        }
        vm.getPosts();
      }
      vm.prevPage = function () {
        if((vm.current_page - 1) % 10 ==0 && vm.current_page != 1 ){
          vm.current_page--;
          vm.pages = vm.all_pages.slice(vm.current_page - 10, 10);
        }else if(vm.current_page != 1){
          vm.current_page--;
        }
        vm.getPosts();
      }
        vm.setPage = function(page) {
            vm.current_page = page;
              vm.getPosts();
        }
      vm.addPost = function () { // Запрос на сервер  и фомирование объекта в котором содержится массив данных
      console.log(vm.file);//
      var data = new FormData();
      data.append('title', vm.title);
      data.append('content', vm.content);
      data.append('author', vm.author);
      data.append('file', vm.file);

        $http.post('/api/post', data, {
          headers: {'Content-Type' : undefined}//отправка объекта MultiPart data  что обозначает что в нем могут хранится любые типы данных
        })// Делаем запрос и отпровляем объект на сервер
        .success(function (response) {
          $rootScope.addForm = undefined;// При получении ответа от сервера обратно свернуть форму
          vm.posts.push(response);
        })
        .error(function (err) {
          console.log(err);
        })
      }
      //Запрос на удаление
      vm.removePost = function (index, post) {
        $http.delete('/api/post/' + post._id)
        .success(function (response) {
          vm.posts.splice(index, 1);
          console.log(response);
        })
        .error(function (err) {
          console.log(err);
        })

      }
      // Функция выбор поста для редктирования
      vm.selectPost = function (index, post) {
        vm.edit_index = index;
        vm.edit_id = post._id;
        vm.edit_title = post.title;
        vm.edit_content = post.content;
        vm.edit_author = post.author;
        console.log(index)
      }
      // фУНКЦИЯ для отпрвки зпроса на изменение
      vm.editPost = function () {
        var data = new FormData();
        data.append('title', vm.edit_title);
        data.append('content', vm.edit_content);
        data.append('author', vm.edit_author);
        data.append('file', vm.file)
        //Запрос на изминение на сервер
        $http.put('/api/post/'+ vm.edit_id, data,{
          headers: {'Content-Type' : undefined}
        })
          .success(function (response) {
            vm.edit_id = undefined;
            vm.posts[vm.edit_index] = response;
            console.log(vm.edit_index);

          })
            .error(function (err) {
              console.log(err);

            })
      }

}
