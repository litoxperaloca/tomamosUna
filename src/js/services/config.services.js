pmb_im.services.factory('ConfigService', ['$http', function($http) {

  var ConfigObj = {};
  //ConfigObj.baseURL = "https://pmbdev.development.datauy.org";
  ConfigObj.baseURL = "https://backend.e-openbar.com";
  if(ionic.Platform.isWebView()){
    ConfigObj.baseURL = "https://backend.e-openbar.com";
  } else {
    ConfigObj.baseURL = "/backend";
  }
  ConfigObj.AppName = "e-openbar";

  ConfigObj.baseCobrand = "/cobrands/pormibarrio";

  return ConfigObj;

}]);
