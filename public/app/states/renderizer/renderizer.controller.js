'use strict'

angular
      .module("renderApp")
      .controller("renderizer", function ($scope, $http, $state) {
                  console.log("Renderizer Controller initialized");

                  var apiURL;
                  var uiURL;
                  var hostname = window.location.hostname;
                  if (hostname == "localhost") {
                        apiURL = 'http://localhost:8080/api/v1/renders';
                        uiURL = 'http://localhost:8800/app/states/renders';
                  } else {
                        apiURL = "https://api-renders.herokuapp.com/api/v1/renders";
                        uiURL = "https://ui-renders.herokuapp.com/app/states/renders";
                  }

                  $http.get(apiURL)
                        .then(function (response) {
                              var idlist = [];
                              for (var i = 0; i < response.data.length; i++) {
                                    idlist.push(response.data[i].id);
                              }
                              $scope.idlist = idlist;
                        })

                  $scope.ids = function (id) {
                        if (!id) {
                              delete $scope.model;
                              delete $scope.view;
                              delete $scope.ctrl;
                              $state.go("renderizer");
                        } else {
                              $http.get(apiURL + "?id=" + id)
                                    .then(function (response) {
                                          $scope.model = response.data[0].sampleModel;
                                          $scope.view = response.data[0].view;
                                          $scope.ctrl = response.data[0].ctrl;
                                    })
                        }
                  }

                  $scope.checkState = function (id, model, view, ctrl) {
                        if (!id && !model && !view && !ctrl) {
                              $state.go("renderizer");
                        } else {
                              $http.get(apiURL + "?id=" + id)
                                    .then(function (response) {
                                          $scope.error = "";
                                          $state.go("renderizer.render", {
                                                "model": model
                                          });
                                    }, function (err) {
                                          $scope.error = "Render not found";
                                          $state.go("renderizer");
                                    });
                        }
                  }

                  $scope.downloadModel = function (id) {
                        var modelUrl = "app/states/renders/" + id + "/" + id + ".json";
                        var modelDownload = id + ".json";
                        $http({
                              url: modelUrl,
                              method: "GET",
                              responseType: "blob"
                        }).then(function (response) {
                              saveAs(response.data, modelDownload);
                        });
                  }

                  $scope.downloadCtrl = function (id) {
                        var ctrlUrl = "app/states/renders/" + id + "/" + id + ".ctl";
                        var ctrlDownload = id + ".ctl";
                        $http({
                              url: ctrlUrl,
                              method: "GET",
                              responseType: "blob"
                        }).then(function (response) {
                              saveAs(response.data, ctrlDownload);
                        });
                  }

                  $scope.downloadView = function (id) {
                        var viewUrl = "app/states/renders/" + id + "/" + id + ".ang";
                        var viewDownload = id + ".ang";
                        $http({
                              url: viewUrl,
                              method: "GET",
                              responseType: "blob"
                        }).then(function (response) {
                              saveAs(response.data, viewDownload);
                        });
                  }
      });