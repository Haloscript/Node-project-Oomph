app.controller('HeaderCtrl', HeaderCtrl);

HeaderCtrl.$inject = ['$http', '$rootScope', '$cookies', '$state'];

function HeaderCtrl($http, $rootScope, $cookies, $state) {
    var vm =this;

     if ($cookies.getObject('session')) {
        $rootScope.session = $cookies.getObject('session');
     }
      vm.show = function () {
        $rootScope.addForm = !$rootScope.addForm;
      }

      vm.logout = function() {
        $http.post('/api/logout')
          .success(function(response) {
            $rootScope.session = false;
            $state.go('home');
          })
          .error(function(err) {
            console.log(err);
          })
      }
//Search modules
     vm.debounce = function(func, wait, immediate) {// Функцция временной задержки поиска которая уменьшая количество обращения на сервер
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

      vm.search = vm.debounce( function() {// Запуск функции поиска она обернута в дебакнс функцию
        if(vm.search_text.length >0 ){
          $http.get('/api/search/'+ vm.search_text)
            .success(function(response) {
              vm.search_result = response;
              console.log(vm.search_result)
            })
            .error(function (err) {
              console.log(err);

            })
        }
      }, 1000);// Время отклика сервера в дебаунсе

      vm.goToResult = function (id) {// Переход на страницу поста при поиске
          vm.search_text = '';
          $state.go('post', {id: id});
      }
}
