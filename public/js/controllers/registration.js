app.controller('RegCtrl', RegCtrl);

RegCtrl.$inject = ['$http', '$state'];

function RegCtrl($http, $state) {
  var vm = this;
//Функция при нажатие кнопки регистрации
  vm.registration = function() {
   var data = {
     email:vm.reg_email,
     name:vm.reg_name,
     surname:vm.reg_surname,
     password:vm.reg_password
    }
    $http.post('/api/registration', data)
    .success(function(response) {
      $state.go('login')
    })
    .error(function(err) {
      console.log(err);
    });
  }

}
