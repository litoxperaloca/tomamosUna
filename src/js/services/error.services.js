pmb_im.services.factory('ErrorService', ['$http','$ionicPopup', 'ValidationService', function($http,$ionicPopup,ValidationService) {

  return {
    http_response_is_successful: function (jsonResult, warningObj) {
      if(jsonResult.data && jsonResult.data.Status=="success" || jsonResult.Status=="success"){
        return true;
      }else{
        if(jsonResult.data){
          warningObj.warning = jsonResult.data.Message;
        }else{
          warningObj.warning = jsonResult.Message;
        }
        return false;
      }
    },

    http_response_is_successful_ajax: function (jsonResult) {
      if(jsonResult.data.result==0){
        return false;
      }else{
        return true;
      }
    },

    http_response_is_successful_popup: function (jsonResult) {
      if(jsonResult.data.result==0){
        var alertPopup = $ionicPopup.alert({
         title: "Error",
         template: jsonResult.data.message
        });
        alertPopup.then(function(res) {
          return false;
        });
        return false;
      }else{
        return true;
      }
    },

    http_data_response_is_successful: function (data, errorContainerId) {
      var errorDiv = document.getElementById(errorContainerId);
      if(data.Status!='success'){
        errorDiv.innerHTML="<h3>" + data.Message + "</h3>";
        errorDiv.style.display = "block";
        return false;
      }else{
        errorDiv.style.display = "none";
        return true;
      }
    },

    http_data_response_is_successful_ajax: function (data) {
      if(data.result==0){
        return false;
      }else{
        return true;
      }
    },

    show_error_message: function (errorContainerId, message) {
        var errorDiv = document.getElementById(errorContainerId);
        errorDiv.innerHTML="<h3>" + message + "</h3>";
        errorDiv.style.display = "block";
        return false;
    },

    show_error_message_popup: function (message) {
        var alertPopup = $ionicPopup.alert({
         title: "Error",
         template: message
        });
        alertPopup.then(function(res) {
          return false;
        });
        return false;
    },

    check_fields: function (fields, warningObj) {
      var errors = "";
      fields.forEach(function(field) {
        if(field.type=="notNull"){
          if(!ValidationService.validate_not_empty(field.value)){
            errors = errors + 'El campo "' + field.name + '" no puede estar vacío. ';
          }
        }
        if(field.type=="email"){
          if(!ValidationService.validate_email(field.value)){
            errors = errors + 'El campo "' + field.name + '" no es una dirección de correo válida. ';
          }
        }
        if(field.type=="iddoc_uy"){
          if(!ValidationService.validate_iddoc_uy(field.value)){
            errors = errors + 'El campo "' + field.name + '" no es una cédula uruguaya válida. ';
          }
        }
        if(field.type=="two_words"){
          if(!ValidationService.validate_two_words(field.value)){
            errors = errors + 'El campo "' + field.name + '" debe contener al menos dos palabras. ';
          }
        }
        if(field.type=="equalsTo"){
          if(!ValidationService.validate_equalsTo(field.value, field.secondValue)){
            errors = errors + 'Los campos "' + field.name + '" no coinciden. ';
          }
        }
      });
      if(errors ==""){
        return true;
      }else{
        warningObj.warning = errors;
        /*var errorDiv = document.getElementById(errorContainerId);
        errorDiv.innerHTML= errors;
        errorDiv.style.display = "block";*/
        return false;
      }
    }


  };
}]);
