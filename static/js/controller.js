var myControllers = angular.module('myControllers', ['ngSanitize']);

myControllers.controller('NavCtrl', ['$scope', '$location',
  function($scope, $location) {
    $scope.isActive = function (viewLocation) { 
      return viewLocation === $location.path();
    };
  }
]);

myControllers.controller('ToolCtrl', ['$scope', '$http', function($scope, $http) {
  /*
    $http.get('data/interest.json').success(function(data) {
      $scope.interests = data;
    });
    */
  $scope.submit = function() {
    var tbl = document.getElementById('tbl-data');
    var data = [];
    for (var i=1; i<tbl.rows.length; ++i){
      var cells = tbl.rows.item(i).cells;
      var tmp = [];
      for(var j=0; j<cells.length; ++j){
        var span = cells.item(j).getElementByTagName('span');
        var val = parseFloat(span.innerHTML);
        if(val == NaN) {
          alert("All values should be numbers!");
          return false;
        }
        tmp.push(val);
      }
      data.push(tmp);
    }
    alert(data);
  };
}]);

