var app = angular.module('decode', [
  'ui.router', 'ngCookies'
]).config(routeConfig);
routeConfig.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];


function routeConfig($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);// Настройк штмл на 5 версию
  $urlRouterProvider.otherwise('/');// Перекидка на главную страницу
  $stateProvider
    .state('home',{ // URL
      url:'/',
      templateUrl: '/views/home.html',
      controller: 'HomeCtrl', // Контроллер который будет упровлять логикой на странице
      controllerAs: 'vm'
    })
    .state('post',{ // URL
      url:'/post/:id',
      templateUrl: '/views/post.html',
      controller: 'PostCtrl',
      controllerAs: 'vm'
    })
    .state('login',{ // URL
      url:'/login',
      templateUrl: '/views/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'vm'
    })
    .state('registration',{ // URL
      url:'/registration',
      templateUrl: '/views/registration.html',
      controller: 'RegCtrl',
      controllerAs: 'vm'
    })
    .state('profile',{ // URL
      url:'/profile/:id',
      templateUrl: '/views/profile.html',
      controller: 'ProfCtrl',
      controllerAs: 'vm'
    })

}
