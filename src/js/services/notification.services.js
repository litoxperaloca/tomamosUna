pmb_im.services.factory('NotificationService', ['$http', 'ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/api/";

  return {
    getUnrecivedNotifications: function (username,password) {
      var body = 'user='+username+'&password='+password+'&hash_id='+Math.random();
      //body = body +'&interested='+userObj.interested+'&status='+userObj.status+'&show_location='+userObj.show_location;
      return $http.post(baseURL + 'get_unrecived_notifications', body,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    }

  };
}]);
