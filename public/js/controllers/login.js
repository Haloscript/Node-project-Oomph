app.controller('LoginCtrl', LoginCtrl);// Создание контрллера

LoginCtrl.$inject = ['$http', '$state', '$rootScope', '$cookies'];//Внедрениние контроллера


function LoginCtrl($http, $state, $rootScope, $cookies) {
  vm.login = function () {
    var data ={
      email: vm.email,
      password: vm.password
    }
    $http.post('/api/login/', data)
    .success(function (response) {
        $rootScope.session = $cookies.getObject('session');
        $state.go('home'); // При получении ответа переходит во вкладку хом

    })
      .error(function (err) {
        console.log(err);
        alert('no password');
      });
  }
}
