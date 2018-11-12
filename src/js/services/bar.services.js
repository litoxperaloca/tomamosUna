pmb_im.services.factory('BarService', ['$http', 'ConfigService', function($http, ConfigService) {

  var apiURL = ConfigService.baseURL + "/api/"
  var BarObj = {};
  BarObj.uid = null;
  BarObj.name = null;


  BarObj.getBarList = function(username,password,uid,author_uid){
    var body = 'user='+username+'&password='+password+'&hash_id='+Math.random();
    return $http.post(apiURL + 'get_bar_list', body,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
  }

  BarObj.getBarInfo = function(nid){
    return $http.get(apiURL + 'get_bar_info', {cache: false, params: {nid:nid, hash_id:Math.random()}});
  }

  return BarObj;

}]);
