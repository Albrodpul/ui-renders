'use strict'

angular.
module('renderApp').
config(['$stateProvider', '$locationProvider', '$urlRouterProvider',
  function ($stateProvider, $locationProvider, $urlRouterProvider) {

    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');

    $stateProvider
      .state('home', {
        url: '/',
        controller: 'HomeController',
        templateUrl: 'app/states/home/home.template.html',
        controllerAs: 'vm'
      })
      .state('renderizer-ui', {
        url: '/?model',
        resolve: {
          //obtiene el contenido del modelo
          apiUrl: ['$http', '$stateParams', function ($http, $stateParams) {
            //read sample model
            return $http({
              method: 'GET',
              url: $stateParams.model
            });
          }],
          //obtiene el objeto
          items: ['$http', 'apiUrl', '$stateParams', function ($http, apiUrl, $stateParams) {
            //si el modelo tiene la linea renders
            if (apiUrl.data.renders) {
              return $http({
                method: 'GET',
                url: apiUrl.data.renders.default
              });
            //en caso de que tenga type y no la línea renders
            } else {
              var urlAux;
              var model = ($stateParams.model.split('/')[7]).split('.')[0];
              if (window.location.hostname == "localhost") {
                urlAux = "http://localhost:8080/api/v1/renders";
              } else {
                urlAux = "https://api-renders.herokuapp.com/api/v1/renders";
              }
              return $http({
                method: 'GET',
                url: urlAux + "?id=" + model
              });
            }
          }]
        },
        controllerProvider: function (items) {
          var ctrl = (items.data[0].ctrl.split('/')[7]).split('.')[0];
          return ctrl;
        },
        templateProvider: function ($templateRequest, items) {
          const view = items.data[0].view.split('/')[7];
          const id = items.data[0].id;
          var pathToTemplate = '../app/states/renders/' + id + '/' + view;
          return $templateRequest(pathToTemplate);
        }
      })


    $urlRouterProvider.otherwise('/');

    $locationProvider.hashPrefix('');

    console.log("App 2 Initialized");


  }

])