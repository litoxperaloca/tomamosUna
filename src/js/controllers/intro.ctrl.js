pmb_im.controllers.controller('IntroCtrl', ['$scope', '$state',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicPlatform',
  '$ionicPopup',
  'LocationsService',
  'DBService',
  'ConfigService',
  'UserService',
  function($scope, $state, $cordovaGeolocation, $stateParams, $ionicPlatform, $ionicPopup, LocationsService, DBService, ConfigService, UserService) {

  var db = DBService.initDB();
  db.info().then(
    console.log.bind(console)
  );
  $scope.AppName = ConfigService.AppName;


  $scope.geolocate = function() {

      var posOptions = {timeout: 3500, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function(position) {
          LocationsService.save_initial_position(position);
          $state.go("app.map");
        }, function(err) {
          $state.go("app.map");
        });
    };

   $scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
      $scope.geolocate();
   });

  }
]);
