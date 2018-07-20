pmb_im.services.factory('MessageService', ['$http', 'leafletData','ConfigService', function($http, leafletData, ConfigService) {

  var pinsURL = ConfigService.baseURL + "/sites/tomamos_una/files/json/online_users_geo.json";
  var apiURL = ConfigService.baseURL + "/api/"
/**
   * Constructor, with class name
   */
  function Message(_data) {
    angular.extend(this, _data);
  }


  Message.getAllMessagesToUser = function(username,password,uid,author_uid){
    var body = 'user='+username+'&password='+password+'&author_uid='+author_uid+'&uid='+uid+'&hash_id='+Math.random();
    return $http.post(apiURL + 'get_all_messages_to_user', body,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
  }

  Message.getUserInfo = function(uid){
    return $http.get(apiURL + 'get_user_info', {cache: false, params: {uid:uid, hash_id:Math.random()}});
  }

  Message.sendTextMessageToUser = function(text,destination_uid,author_uid,username,password){
    var body = 'user='+username+'&password='+password+'&text='+text+'&destination_uid='+destination_uid+'&author_uid='+author_uid;
    return $http.post(apiURL + 'send_text_message', body,{withCredentials: true, headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
  }

  Message.checkWhoCanTalk = function(username,password){
    var body = 'user='+username+'&password='+password;
    return $http.post(apiURL + 'check_user_talk', body,{withCredentials: true, headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
  }


    Message.canTalkToUsers = new Array();
    Message.current = {};


    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    Message.build = function(_data) {

      return new Message(
        _data
      );
    };


    /**
     * Return the constructor function
     */
    return Message;

}]);
