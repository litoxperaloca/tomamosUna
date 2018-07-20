pmb_im.services.factory('DrinkService', ['$http', 'ConfigService', function($http, ConfigService) {

  var baseURL = ConfigService.baseURL + "/api/";

  return {
    getAllDrinksAvailable: function (username,password) {
      var body = 'user='+username+'&password='+password;
      //body = body +'&interested='+userObj.interested+'&status='+userObj.status+'&show_location='+userObj.show_location;
      return $http.post(baseURL + 'get_possible_drinks', body,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    },

    getAllInvitationsWithUser: function (username,password,destination_uid,author_uid) {
      var body = 'user='+username+'&password='+password;
      body = body +'&uid='+destination_uid+'&author_uid='+author_uid;
      return $http.post(baseURL + 'get_invitations_between_users', body,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    },

    sendDrinkInvitationToUser: function(drink_nid,destination_uid,author_uid,username,password){
      var body = 'user='+username+'&password='+password+'&drink_nid='+drink_nid+'&destination_uid='+destination_uid+'&author_uid='+author_uid;
      return $http.post(baseURL + 'send_drink_invitation', body,{withCredentials: true, headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    },

    sendDrinkInvitationResponse: function(response,username,password,invitation_nid,destination_uid){
      var body = 'response='+response+'&user='+username+'&password='+password+'&invitation_nid='+invitation_nid+'&destination_uid='+destination_uid;
      return $http.post(baseURL + 'invitation_response', body,{withCredentials: true, headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    }

  };
}]);
