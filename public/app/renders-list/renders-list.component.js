'use strict'

angular
      .module("rendersList")
      .component("rendersList", {
            templateUrl: 'app/renders-list/renders-list.template.html',
            controller: ["$scope", "$http", "$state", function ($scope, $http, $state) {
                  console.log("Renders Controller initialized");

                  var apiURL;
                  var uiURL;
                  var hostname = window.location.hostname;
                  if (hostname == "localhost") {
                        apiURL = 'http://localhost:8080/api/v1/renders';
                        uiURL = 'http://localhost:8800/app/renders';
                  } else {
                        apiURL = "https://api-renders.herokuapp.com/api/v1/renders";
                        uiURL = "https://ui-renders.herokuapp.com/app/renders";
                  }
                  var deleteURL = '/deleteFiles';

                  var refresh = function () {
                        $http.get(apiURL)
                              .then(function (response) {
                                    $scope.renders = response.data;
                              });
                  }

                  refresh();

                  $scope.getAll = function () {
                        refresh();
                  }

                  $scope.add = function () {
                        console.log("Inserting data...");
                        var name = $scope.name;
                        var modelFile = (document.getElementById('modelFile')).files[0];
                        var viewFile = (document.getElementById('viewFile')).files[0];
                        var ctrlFile = (document.getElementById('ctrlFile')).files[0];
                        if (!name) {
                              $scope.success = "";
                              $scope.error = "Render name input must be fulfilled";
                        } else if (!modelFile) {
                              $scope.success = "";
                              $scope.error = "No sample model file attached";
                        } else if (!viewFile) {
                              $scope.success = "";
                              $scope.error = "No view file attached";
                        } else if (!ctrlFile) {
                              $scope.success = "";
                              $scope.error = "No controller file attached";
                        } else if (name != modelFile.name.split('.')[0]) {
                              $scope.success = "";
                              $scope.error = "Sample model file name must be " + name + ".json";
                        } else if (name != viewFile.name.split('.')[0]) {
                              $scope.success = "";
                              $scope.error = "View file name must be " + name + ".ang";
                        } else if (name != ctrlFile.name.split('.')[0]) {
                              $scope.success = "";
                              $scope.error = "Controller file name must be " + name + ".ctl";
                        } else if (modelFile.name.split('.')[1] != "json") {
                              $scope.success = "";
                              $scope.error = "Model file extension must be .json";
                        } else if (viewFile.name.split('.')[1] != "ang") {
                              $scope.success = "";
                              $scope.error = "View file extension must be .ang";
                        } else if (ctrlFile.name.split('.')[1] != "ctl") {
                              $scope.success = "";
                              $scope.error = "Controller file extension .ctl";
                        } else {
                              var folderUrl = uiURL + '/' + name;
                              var data = '{"id":"' + name + '", "sampleModel":"' + folderUrl + "/" + modelFile.name + '","view":"' + folderUrl + "/" + viewFile.name + '","ctrl":"' + folderUrl + "/" + ctrlFile.name + '","type":"ng"}';
                              var url = uiURL + '/' + name;
                              const reader = new FileReader();
                              reader.onload = () => {
                                    let text = reader.result;
                                    var lines = text.split("\n").toString();
                                    if (!lines.includes('"renders":')) {
                                          $scope.success = "";
                                          $scope.error = modelFile.name + 'must include "renders":. Download and look example.json';
                                          $scope.$apply();
                                    } else if (!lines.includes('"default": "' + url + '"')) {
                                          $scope.success = "";
                                          $scope.error = modelFile.name + 'must include "default": "' + url + '". Download and look example.json';
                                          $scope.$apply();
                                    } else {
                                          const reader = new FileReader();
                                          reader.onload = () => {
                                                let text = reader.result;
                                                var lines = text.split("\n").toString();
                                                if (!lines.includes(".module('renderApp')")) {
                                                      $scope.success = "";
                                                      $scope.error = ctrlFile.name + " must include .module('renderApp'). Download and look example.ctl";
                                                      $scope.$apply();
                                                } else if (!lines.includes(".controller('" + name + "',")) {
                                                      $scope.success = "";
                                                      $scope.error = ctrlFile.name + " must include .controller('" + name + "', function.... Download and look example.ctl";
                                                      $scope.$apply();
                                                } else {
                                                      $http
                                                            .post(apiURL, data)
                                                            .then(function (response) {
                                                                  $scope.success = "Render successfully added";
                                                                  $scope.error = "";
                                                                  $state.reload();
                                                            }, function (err) {
                                                                  if (err.status != 201) {
                                                                        $scope.success = "";
                                                                        $scope.error = "This render already exists";
                                                                  }
                                                            });
                                                }
                                          };
                                          reader.readAsText(ctrlFile);
                                    }
                              };
                              reader.readAsText(modelFile);
                        }
                  };

                  $scope.downloadExampleModel = function () {
                        var url = apiURL + '/example';
                        var jsonContent = '{ \r\n';
                        jsonContent += '  "renders": [{\r\n';
                        jsonContent += '        "default": "' + url + '"\r\n';
                        jsonContent += '   }],\r\n';
                        jsonContent += '  "data": [{\r\n';
                        jsonContent += '        "example":"Example working!",\r\n';
                        jsonContent += '        "example2":"Example is working perfectly!"\r\n';
                        jsonContent += '  }]\r\n';
                        jsonContent += '}';
                        var blob = new Blob([jsonContent], {
                              type: 'text/html;charset=UTF-8;'
                        });
                        if (navigator.msSaveBlob) { // IE 10+
                              navigator.msSaveBlob(blob, "example.json");
                        } else {
                              var link = document.createElement("a");
                              if (link.download !== undefined) { // feature detection
                                    // Browsers that support HTML5 download attribute
                                    var url = URL.createObjectURL(blob);
                                    link.setAttribute("href", url);
                                    link.setAttribute("download", "example.json");
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                              }
                        }
                  }

                  $scope.downloadExampleView = function () {
                        var htmlContent = "<h5>Example Template</h5>\r\n";
                        htmlContent += "<br />\r\n";
                        htmlContent += "{{model.example}}";
                        var blob = new Blob([htmlContent], {
                              type: 'text/html;charset=UTF-8;'
                        });
                        if (navigator.msSaveBlob) { // IE 10+
                              navigator.msSaveBlob(blob, "example.ang");
                        } else {
                              var link = document.createElement("a");
                              if (link.download !== undefined) { // feature detection
                                    // Browsers that support HTML5 download attribute
                                    var url = URL.createObjectURL(blob);
                                    link.setAttribute("href", url);
                                    link.setAttribute("download", "example.ang");
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                              }
                        }
                  }

                  $scope.downloadExampleCtrl = function () {
                        var jsContent = "'use strict'\r\n";
                        jsContent += "\r\n";
                        jsContent += "angular\r\n";
                        jsContent += ".module('renderApp')\r\n";
                        jsContent += "      .controller('example', function ($scope, $http) {\r\n";
                        jsContent += "            console.log('Example Controller Initialized');\r\n";
                        jsContent += "            $http.get('" + uiURL + "/example/example.json';\r\n";
                        jsContent += "                .then(function(response){\r\n";
                        jsContent += "                      $scope.model = response.data.data[0];';\r\n";
                        jsContent += "            });\r\n";
                        jsContent += "\r\n";
                        jsContent += "      });";
                        var blob = new Blob([jsContent], {
                              type: 'text/plain;charset=UTF-8;'
                        });
                        if (navigator.msSaveBlob) { // IE 10+
                              navigator.msSaveBlob(blob, "example.ctl");
                        } else {
                              var link = document.createElement("a");
                              if (link.download !== undefined) { // feature detection
                                    // Browsers that support HTML5 download attribute
                                    var url = URL.createObjectURL(blob);
                                    link.setAttribute("href", url);
                                    link.setAttribute("download", "example.ctl");
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                              }
                        }
                  }

                  $scope.downloadModel = function (model) {
                        var modelUrl = "app/renders/" + (model.split('/')[6]).split('.')[0] + "/" + (model.split('/')[6]).split('.')[0] + ".json";
                        var modelDownload = (model.split('/')[6]).split('.')[0] + ".json";
                        $http({
                              url: modelUrl,
                              method: "GET",
                              responseType: "blob"
                        }).then(function (response) {
                              saveAs(response.data, modelDownload);
                        });
                  }

                  $scope.downloadCtrl = function (ctrl) {
                        var ctrlUrl = "app/renders/" + (ctrl.split('/')[6]).split('.')[0] + "/" + (ctrl.split('/')[6]).split('.')[0] + ".js";
                        var ctrlDownload = (ctrl.split('/')[6]).split('.')[0] + ".ctl";
                        $http({
                              url: ctrlUrl,
                              method: "GET",
                              responseType: "blob"
                        }).then(function (response) {
                              saveAs(response.data, ctrlDownload);
                        });
                  }

                  $scope.downloadView = function (view) {
                        var viewUrl = "app/renders/" + (view.split('/')[6]).split('.')[0] + "/" + (view.split('/')[6]).split('.')[0] + ".html";
                        var viewDownload = (view.split('/')[6]).split('.')[0] + ".ang";
                        $http({
                              url: viewUrl,
                              method: "GET",
                              responseType: "blob"
                        }).then(function (response) {
                              saveAs(response.data, viewDownload);
                        });
                  }

                  $scope.delete = function (id) {
                        console.log("Click");
                        $http.delete(apiURL + "/" + id)
                              .then(function (response) {
                                    console.log("OK");
                                    $http.delete(deleteURL + "/" + id)
                                          .then(function (response) {
                                                $state.reload();
                                          });
                              });
                  }

            }]
      });