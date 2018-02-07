'use strict'

angular
    .module("rendersDelete")
    .component("rendersDelete", {
        templateUrl: 'app/renders-list/renders-delete/renders-delete.template.html',
        controller: ["$scope", "$http", "$state", function ($scope, $http, $state) {
            console.log("Renders Delete Controller initialized");

            var hostname = window.location.hostname;
            var http = window.location.protocol;
            var baseURL = http + '//' + hostname + ':8080/api/v1/renders';
            var deleteUrl = '/deleteFiles';

            $scope.delete = function (id) {
                $http.delete(baseURL + "/" + id)
                    .then(function (response) {
                        console.log("OK");
                        $http.delete(deleteUrl + "/" + id)
                            .then(function (response) {
                                $state.reload();
                            });
                    });
            }

        }]
    });