pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  //ConfigObj.baseURL = "https://pmbdev.development.datauy.org";
  ConfigObj.baseURL = "http://tomamosuna.info";
  if(ionic.Platform.isWebView()){
    ConfigObj.baseURL = "http://tomamosuna.info";
  } else {
    ConfigObj.baseURL = "/backend";
  }
  ConfigObj.AppName = "¿Tomamos una?";

  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
