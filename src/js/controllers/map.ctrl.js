pmb_im.controllers.controller('MapController', ['$scope', '_',
  '$cordovaCamera',
  '$cordovaGeolocation',
  '$compile',
  '$ionicModal',
  '$ionicPopup',
  'leafletData',
  'ConfigService',
  'LocationsService',
  'PinService',
  'MessageService',
  'DrinkService',
  'AuthService',
  'UserService',
  'BarService',
  'DBService',
  '$timeout',
  '$interval',
  '$location',
  'ErrorService',
  '$ionicSlideBoxDelegate',
  '$ionicScrollDelegate',
  'PopUpService',
  'ConnectivityService',
  '$cordovaInAppBrowser',
  'MapService',
  'ModalService',
  'SemaphoreService',
  'ValidationService',
  'NotificationService',
  function(
    $scope,
    _,
    $cordovaCamera,
    $cordovaGeolocation,
    $compile,
    $ionicModal,
    $ionicPopup,
    leafletData,
    ConfigService,
    LocationsService,
    PinService,
    MessageService,
    DrinkService,
    AuthService,
    UserService,
    BarService,
    DBService,
    $timeout,
    $interval,
    $location,
    ErrorService,
    $ionicSlideBoxDelegate,
    $ionicScrollDelegate,
    PopUpService,
    ConnectivityService,
    $cordovaInAppBrowser,
    MapService,
    ModalService,
    SemaphoreService,
    ValidationService,
    NotificationService
  ) {

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.online_user_geo = {};
    $scope.online_user_geo_array = new Array();
    $scope.baseURL = ConfigService.baseURL;
    $scope.AppName = ConfigService.AppName;
    $scope.user_cached_image = "./img/icon-user-anonymous.png";
    $scope.one_value_popup = null;
    $scope.myIntervals = new Array();
    $scope.selected_person = null;
    $scope.login = {warning:null};
    $scope.setBackTo="";
    $scope.filter = new Array();
    $scope.filter.filter_people_distance_range = 0;
    $scope.filter.filter_people_online = false;
    $scope.filter.filter_people_interesado_en = "Personas en general";
    $scope.filter.filter_bar_distance_range = 0;
    $scope.filter.filter_bar_open = false;

    $scope.$on("$ionicView.beforeEnter", function() {
      ModalService.checkNoModalIsOpen();
      DBService.initDB();
      if(ConnectivityService.isOnline()){
        $scope.check_user_logged();
      }else{
        $scope.set_offline_user();
      }
      document.getElementById("foot_bar").style.display = "block";
      if(ConnectivityService.isOnline()){
        $scope.create_online_map();
        $scope.myIntervals['userLocation']= $interval(function() {
              $scope.sendUserLocation()
          }, 30000);
      }
    });

    $scope.$on("$ionicView.afterEnter", function() {
      document.getElementById("button_general").className = document.getElementById("button_general").className + " active";
      if(UserService.uid==null){
        var user = DBService.getUser();
         user.then(function (doc) {
           if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
           }else{
             $scope.show_login_modal();
           }
         }).catch(function (err) {
           $scope.show_login_modal();
         });
      }else{
        if($scope.myIntervals['all_chats']){
          $interval.cancel($scope.myIntervals['all_chats']);
        }
        $scope.myIntervals['all_chats'] = $interval(function() {
          MessageService.getAllMessages(UserService.name,UserService.password).then(function(resp2){
            var data2 = $scope.getObjectDataFromResponse(resp2);
            $scope.all_messages = data2;
          });
        }, 3000);
      }
      var map = leafletData.getMap();
      if(LocationsService.initial_lat!=""){
        MapService.centerMapOnCoords(LocationsService.initial_lat, LocationsService.initial_lng, 16);
      }else{
        MapService.centerMapOnCoords(-34.901113, -56.164531, 14);
      }
      $scope.checkNotifications();
    });

    $scope.checkNotifications = function(){
      if($scope.myIntervals['notifications']){
        $interval.cancel($scope.myIntervals['notifications']);
      }
      $scope.myIntervals['notifications']= $interval(function() {

        if(UserService.uid){
          NotificationService.getUnrecivedNotifications(UserService.name, UserService.password).then(function(resp){
            var data = $scope.getObjectDataFromResponse(resp);
            if(!(data.Status && data.Status=="error")){
              if(!$scope.isEqual($scope.notifications,$scope.getObjectDataFromResponse(data).Notifications)){
                $scope.notifications = new Array();
                $scope.notifications = $scope.getObjectDataFromResponse(data).Notifications;
              }
            }
          });
        }
      }, 3000);
    };

    $scope.openNotification = function(notification){
      $scope.dontShowNotificationAgain(notification.nid);
      if(notification.tipo=="nuevo_mensaje"){
        $scope.send_message_to(notification.uid);
      }else if(notification.tipo=="invitacion_a_trago"){
        $scope.openInvitationsModal(notification.uid);
      }else if(notification.tipo=="respuesta_a_invitacion"){
        $scope.openInvitationsModal(notification.uid);
      }
    }

    $scope.dontShowNotificationAgain = function(nid){
      if(UserService.uid){
        NotificationService.dontShowNotificationAgain(UserService.name,UserService.password,nid).then(function(resp){
          //AFTER SENDING NOT SHOW ORDER DO NOTHING
        });
      }
    }

    $scope.closeNotification = function(notification){
      $scope.dontShowNotificationAgain(notification.nid);
    }

    $scope.openWebsite = function(url) {
      var options = {
                location: 'no',
                clearcache: 'yes',
                toolbar: 'no'
            };

     $cordovaInAppBrowser.open(url, '_blank', options)
          .then(function(event) {
            // success
          })
          .catch(function(event) {
            // error
        });
    }

    $scope.create_online_map = function(){
      $scope.map = {
        defaults: {
          //tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          minZoom: 1,
          maxZoom: 18,
          zoomControlPosition: 'topleft',
        },
	layers: {
            baselayers: {
                googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                }
            }
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        },
        center: {
        }
      };
      $scope.loadPinsLayer();
      $scope.map.center = {
          lat: -34.901113,
          lng: -56.164531,
          zoom: 16
        };
      leafletData.getMap().then(function(map) {
	//var googleLayer = new L.Google('ROADMAP');
      	//map.addLayer(googleLayer);
        map.on('moveend', $scope.hideOffScreenPins);
      });
    };



  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };

  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  $scope.back_to_map = function(back_to_map){
    if(back_to_map){
      //LocationsService.initial_lat = $scope.report.lat;
      //LocationsService.initial_lng = $scope.report.lon;
      ModalService.checkNoModalIsOpen();
      document.getElementById("foot_bar").style.display = "block";
      document.getElementById("spinner-inside-modal").style.display = "none";
      //$scope.addReportsLayer();
    }else{
      document.getElementById("spinner-inside-modal").style.display = "none";
    }
  }


  $scope.image = null;

  $scope.addImage = function(isFromAlbum, isUserPhoto, isCommentPhoto, isNewUserPhoto) {
    //alert("addImage");
    $scope.isUserPhoto = isUserPhoto;
    $scope.isCommentPhoto = isCommentPhoto;
    $scope.isNewUserPhoto = isNewUserPhoto;

    var source = Camera.PictureSourceType.CAMERA;
    var fix_orientation = true;
    var save_to_gallery = true;
    if(isFromAlbum==1){
      source = Camera.PictureSourceType.PHOTOLIBRARY;
      fix_orientation = false;
      save_to_gallery = false;
    }

    var options = {
      quality: 90,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      correctOrientation : fix_orientation,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: save_to_gallery,
      targetWidth: 500,
      targetHeight: 500
    };


    $cordovaCamera.getPicture(options).then(function(imageData) {
      onImageSuccess(imageData);

      function onImageSuccess(fileURI) {
        window.FilePath.resolveNativePath(fileURI, function(result) {
          // onSuccess code
          //alert(result);
          fileURI = 'file://' + result;
          if(result.startsWith("file://")){
            fileURI = result;
          }
          if($scope.isUserPhoto==1){
            //UserService.add_photo(fileURI);
            $scope.profile.picture_url = fileURI;
          }else{
            if($scope.isCommentPhoto==1){
              $scope.comment.file = fileURI;
            }else if($scope.isNewUserPhoto==1){
              $scope.newuser.picture_url = fileURI;
            }
          }
          $scope.imgURI = fileURI;
          //createFileEntry(fileURI);
        }, function(error) {
          alert("Error resolveNativePath" + error);
        });

      }

      function createFileEntry(fileURI) {
        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
      }

      // 5
      function copyFile(fileEntry) {
        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
        var newName = makeid() + name;

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
            fileEntry.copyTo(
              fileSystem2,
              newName,
              onCopySuccess,
              fail
            );
          },
          fail);
      }

      // 6
      function onCopySuccess(entry) {
        $scope.$apply(function() {
          $scope.image = entry.nativeURL;
        });
      }

      function fail(error) {

      }

      function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

    }, function(err) {
      //console.log(err);
    });
  };

  $scope.urlForImage = function() {
    var imageURL = "http://placehold.it/200x200";
    if ($scope.image) {
      var name = $scope.image.substr($scope.image.lastIndexOf('/') + 1);
      imageURL = cordova.file.dataDirectory + name;
    }
    //console.log("ImageURL = " + imageURL);
    return imageURL;
  };


    $scope.scrollMe = function(anchor_id){
      $location.hash(anchor_id);
      var handle  = $ionicScrollDelegate.$getByHandle('content');
      handle.anchorScroll();
    }

    $scope.set_active_option = function(buttonid) {
      document.getElementById(buttonid).className = "option-active";
    }

    $scope.hide_special_divs = function(){
      document.getElementById("user-options-menu").style.display="none";
    }

    $scope.close_report_detail_modal = function(){
      ModalService.checkNoModalIsOpen();
      $scope.report_detail_id = null;
    }


    /**
     * Center map on user's current position
     */
    $scope.locate = function() {

      $cordovaGeolocation
        .getCurrentPosition()
        .then(function(position) {
          $scope.map.center.lat = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.map.center.zoom = 15;

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "You Are Here",
            focus: true,
            draggable: false
          };

        }, function(err) {
          // error
          //console.log("Location error!");
          //console.log(err);
        });

    };



    $scope.addMapControls = function() {

      document.getElementById('map_crosshair').style.display = "block";
      document.getElementById('map_crosshair_button').style.display = "block";

    };


    $scope.changeUserLocationPin = function(lat,lon,uid){
      if($scope.online_user_geo_array[uid]){
        layer = $scope.online_user_geo_array[uid];
        var newLatLng = new L.LatLng(lat, lon);
        layer.setLatLng(newLatLng);
      }
    }

    $scope.hideOffScreenPins = function() {
      leafletData.getMap().then(function(map) {
        var mapBounds = map.getBounds();
        $scope.usersVisible = [];
          $scope.online_user_geo_array.forEach(function(layer,key){
            var shouldBeVisible = mapBounds.contains(layer.getLatLng());
            if (!shouldBeVisible) {
                map.removeLayer(layer);
            } else if (shouldBeVisible) {
                if($scope.pinIsNotFiltered(layer)){
                  map.addLayer(layer);
                  $scope.usersVisible.push(layer.feature);
                }
            }
          })
      });
    }

    $scope.removeAllPins = function() {
      leafletData.getMap().then(function(map) {
        $scope.usersVisible = [];
        if($scope.online_user_geo_array){
          $scope.online_user_geo_array.forEach(function(layer,key){
            //console.log("removing");
            //console.log(layer);
            map.removeLayer(layer);
          })
        }
      });
    }

    $scope.loadPinsLayer = function(){
        document.getElementById("spinner").style.display = "block";
        leafletData.getMap().then(function(map) {
          PinService.getAllByUser(UserService.name,UserService.password).then(function (response) {
            if(PinService.lastPinsResponse==null || (PinService.lastPinsResponse && !$scope.isEqual(PinService.lastPinsResponse,response))){
              if($scope.online_user_geo_array){
                $scope.usersVisible = [];
                $scope.online_user_geo_array.forEach(function(layer,key){
                  map.removeLayer(layer);
                })
              }
              PinService.lastPinsResponse = response;
              $scope.reportsByState = {};
              var pinsArray = response.data.features;
              $scope.online_users_geo = response.data.features;
              pinsArray.forEach(function(feature){
                if (feature.properties) {
                  if(feature.properties.Type=="Person"){
                      var lon = feature.geometry.coordinates[0];
                      var lat = feature.geometry.coordinates[1];
                      if(lon&&lat){
                        var onlineStatus = feature.properties.Online_status;
                        var icon = feature.properties.Icon;
                        if(icon=="anon"){
                          icon = "./img/icon-user-anonymous.png";
                        }
                        var markerIcon;
                        if(UserService.uid && UserService.uid==feature.properties.Uid){
                          markerIcon = L.icon({
                            className: 'userIcon',
                            iconUrl: icon,
                            iconSize: [72, 72],
                            iconAnchor: [36, 72],
                            popupAnchor: [0, -72]
                          });
                        }else{
                          if(onlineStatus=="Online"){
                            markerIcon = L.divIcon({
                              //className: 'personIcon personOnline',
                              //iconUrl: icon,
                              iconSize: [52, 60],
                              iconAnchor: [26, 60],
                              popupAnchor: [0, -60],
                              html: '<div><div class="userMarker" /></div><img src="'+icon+'" class="leaflet-marker-icon personOnline leaflet-zoom-animated leaflet-clickable" tabindex="0"><div class="onlineCircle" /></div>'
                            });
                          }else{
                            markerIcon = L.divIcon({
                              //className: 'personIcon personOnline',
                              //iconUrl: icon,
                              iconSize: [52, 60],
                              iconAnchor: [26, 60],
                              popupAnchor: [0, -60],
                              html: '<div><div class="userMarker" /></div><img src="'+icon+'" class="leaflet-marker-icon personOnline leaflet-zoom-animated leaflet-clickable" tabindex="0">'
                            });
                          }

                        }
                        var layer = L.marker([lat, lon], {icon: markerIcon});
                        layer.feature = feature;
                        $scope.online_user_geo_array[layer.feature.properties.Uid] = layer;
                        layer.on('click', function(e) {
                            var uid = e.target.feature.properties.Uid;
                            if(UserService.uid && UserService.uid==uid){
                              //SI HACE CLIC EN SI MISMO NO HAGO NADA
                            }else{
                              $scope.selected_person = e.target.feature.properties;
                              var icon = e.target.feature.properties.Icon;
                              if(icon=="anon"){
                                $scope.selected_person.Icon = "./img/icon-user-anonymous.png";
                              }
                              document.getElementById("spinner").style.display = "block";
                              //$scope.goToCenter($scope.selected_container.lon,$scope.selected_container.lat);
                              $ionicModal.fromTemplateUrl('templates/user_map_popup.html', {
                                scope: $scope,
                                hardwareBackButtonClose: true,
                                animation: 'none',
                                //focusFirstInput: true
                              }).then(function(modal) {
                                  document.getElementById("spinner").style.display = "none";
                                  ModalService.checkNoModalIsOpen();
                                  ModalService.activeModal = modal;
                                  ModalService.activeModal.show();
                                  SemaphoreService.makeAvailableAgain("open-modal");
                              });
                            }
                        });
                      }
                    }
                    if(feature.properties.Type=="Bar"){
                      var lon = feature.geometry.coordinates[0];
                      var lat = feature.geometry.coordinates[1];
                      if(lon&&lat){
                        var icon = feature.properties.Icon;
                        var markerIcon;
                        markerIcon = L.icon({
                          className: 'barIcon',
                          iconUrl: icon,
                          iconSize: [33, 45],
                          iconAnchor: [16, 45],
                          popupAnchor: [0, -45]
                        });
                        var layer = L.marker([lat, lon], {icon: markerIcon});
                        layer.feature = feature;
                        $scope.online_user_geo_array[layer.feature.properties.Nid] = layer;
                        layer.on('click', function(e) {
                            var nid = e.target.feature.properties.Nid;
                            $scope.selected_bar = e.target.feature.properties;
                            var icon = e.target.feature.properties.Photo;
                            $scope.selected_bar.Icon = icon;
                            document.getElementById("spinner").style.display = "block";
                            //$scope.goToCenter($scope.selected_container.lon,$scope.selected_container.lat);
                            $ionicModal.fromTemplateUrl('templates/bar_map_popup.html', {
                              scope: $scope,
                              hardwareBackButtonClose: true,
                              animation: 'none',
                              //focusFirstInput: true
                            }).then(function(modal) {
                                document.getElementById("spinner").style.display = "none";
                                ModalService.checkNoModalIsOpen();
                                ModalService.activeModal = modal;
                                ModalService.activeModal.show();
                                SemaphoreService.makeAvailableAgain("open-modal");
                            });

                      });
                    }
                  }
                }
              });
              document.getElementById("spinner").style.display = "none";
              $scope.hideOffScreenPins();
            }
            $scope.checkTalkStatus();
          });

        });
    }

    $scope.close_active_modal = function(){
      ModalService.checkNoModalIsOpen();
      $scope.setActiveMenuButton('button_general');
    }

    $scope.checkTalkStatus = function(){
      //$scope.myIntervals['canTalk'] = $interval(function() {
        if(SemaphoreService.takeIfAvailable("can_talk")){
          MessageService.checkWhoCanTalk(UserService.name,UserService.password).then(function(resp){
            //SemaphoreService.makeAvailableAgain("submit-form");
            var data = $scope.getObjectDataFromResponse(resp);
            if(!(data.Status && data.Status=="error")){
              data.forEach(function(uid){
                MessageService.canTalkToUsers['uid-'+uid] = 1;
              });
              SemaphoreService.makeAvailableAgain("can_talk");
            }
          });
        }
      //}, 2000);
    };

    $scope.key_press = function(event,stage){
      var keyCode = event.keyCode;
      if(stage=='private_chat'){
        if(keyCode==13){
          try {
            if(cordova===null){

            }else if(cordova&&cordova.plugins.Keyboard){
              cordova.plugins.Keyboard.close();
            }
          }
          catch(err) {
          }

        }
      }
    }

    $scope.setActiveMenuButton = function(button_id){
      var x = document.getElementsByClassName("menu_button");
      var i;
      for (i = 0; i < x.length; i++) {
          x[i].classList.remove('active');
      }
      document.getElementById(button_id).classList.add('active');
    }

    $scope.open_notifications_modal = function(){
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          if(UserService.uid){
              NotificationService.getAllNotifications(UserService.name,UserService.password).then(function(resp){
                var data = $scope.getObjectDataFromResponse(resp);
                //console.log(data);
                $scope.all_notifications = data;
                $ionicModal.fromTemplateUrl('templates/notifications.html', {
                  scope: $scope,
                  hardwareBackButtonClose: true,
                  animation: 'none',
                  //backdropClickToClose: true
                  //focusFirstInput: true
                }).then(function(modal) {
                    document.getElementById("spinner").style.display = "none";
                    ModalService.checkNoModalIsOpen();
                    ModalService.activeModal = modal;
                    document.getElementById("foot_bar").style.display = "block";
                    $scope.setActiveMenuButton('button_notifications');
                    ModalService.activeModal.show();
                    SemaphoreService.makeAvailableAgain("open-modal");
                });
              });
          }else{
            SemaphoreService.makeAvailableAgain("open-modal");
          }
       }
    }

    $scope.open_chat_modal = function(){
        $scope.clear_all_intervals();
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          if(UserService.uid){
              MessageService.getAllMessages(UserService.name,UserService.password).then(function(resp){
                var data = $scope.getObjectDataFromResponse(resp);
                $scope.all_messages = data;
                $ionicModal.fromTemplateUrl('templates/chats.html', {
                  scope: $scope,
                  hardwareBackButtonClose: true,
                  animation: 'none',
                  //backdropClickToClose: true
                  //focusFirstInput: true
                }).then(function(modal) {
                    document.getElementById("spinner").style.display = "none";
                    ModalService.checkNoModalIsOpen();
                    ModalService.activeModal = modal;
                    document.getElementById("foot_bar").style.display = "block";
                    $scope.setActiveMenuButton('button_chat');
                    ModalService.activeModal.show();
                    SemaphoreService.makeAvailableAgain("open-modal");
                });
              });
          }else{
            SemaphoreService.makeAvailableAgain("open-modal");
          }
       }
   }

   $scope.open_user_list = function(barActiveTab){
        //console.log(barActiveTab);
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          if(UserService.uid){
              UserService.getUserList(UserService.name,UserService.password).then(function(resp){
                var data = $scope.getObjectDataFromResponse(resp);
                $scope.all_users = data;
                $scope.filterUsers();
                BarService.getBarList(UserService.name,UserService.password).then(function(resp2){
                  var data2 = $scope.getObjectDataFromResponse(resp2);
                  $scope.all_bars = data2;
                  $scope.filterBars();
                  if(barActiveTab==false){
                    $ionicModal.fromTemplateUrl('templates/user_list.html', {
                      scope: $scope,
                      hardwareBackButtonClose: true,
                      animation: 'none',
                      //backdropClickToClose: true
                      //focusFirstInput: true
                    }).then(function(modal) {
                        document.getElementById("spinner").style.display = "none";
                        ModalService.checkNoModalIsOpen();
                        ModalService.activeModal = modal;
                        document.getElementById("foot_bar").style.display = "block";
                        $scope.setActiveMenuButton('button_general');
                        ModalService.activeModal.show();
                        SemaphoreService.makeAvailableAgain("open-modal");

                    });
                  }else{
                    $ionicModal.fromTemplateUrl('templates/user_list_bar.html', {
                      scope: $scope,
                      hardwareBackButtonClose: true,
                      animation: 'none',
                      //backdropClickToClose: true
                      //focusFirstInput: true
                    }).then(function(modal) {
                        document.getElementById("spinner").style.display = "none";
                        ModalService.checkNoModalIsOpen();
                        ModalService.activeModal = modal;
                        document.getElementById("foot_bar").style.display = "block";
                        $scope.setActiveMenuButton('button_general');
                        ModalService.activeModal.show();
                        SemaphoreService.makeAvailableAgain("open-modal");

                    });
                  }

                });
              });

          }else{
            SemaphoreService.makeAvailableAgain("open-modal");
          }
       }
   }

    $scope.send_message_to = function(uid){
        $scope.clear_all_intervals();
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          if(UserService.uid){
              MessageService.checkWhoCanTalk(UserService.name,UserService.password).then(function(resp){
                //SemaphoreService.makeAvailableAgain("submit-form");
                var data = $scope.getObjectDataFromResponse(resp);
                if(!(data.Status && data.Status=="error")){
                  data.forEach(function(uid){
                    MessageService.canTalkToUsers['uid-'+uid] = 1;
                  });
                  if(!$scope.canTalkToUser(uid)){
                    SemaphoreService.makeAvailableAgain("open-modal");
                    document.getElementById("spinner").style.display = "none";
                    $scope.selected_person.warning = "Debe tener al menos una invitación a un trago aceptada entre usted y esta persona para poder hablar.";
                  }else{
                    $scope.chat = new Array();
                    $scope.chat.my_uid = UserService.uid;
                    $scope.chat.my_picture_url = UserService.picture_url;
                    $scope.chat.other_user = new Array();
                    $scope.chat.other_user.uid = uid;
                    $scope.chat.new_text_message = "";
                    MessageService.getUserInfo(uid).then(function(resp){
                      if($scope.getObjectDataFromResponse(resp).Photo){
                        $scope.chat.other_user.picture_url = $scope.getObjectDataFromResponse(resp).Photo;
                      }else{
                        $scope.chat.other_user.picture_url = "./img/icon-user-anonymous.png";
                      }
                      $scope.chat.other_user.username = $scope.getObjectDataFromResponse(resp).Name;
                      $scope.chat.other_user.online_status = $scope.getObjectDataFromResponse(resp).Online_status;
                      var author_uid = UserService.uid;
                      MessageService.getAllMessagesToUser(UserService.name, UserService.password,uid,author_uid).then(function(resp2){
                        var data = $scope.getObjectDataFromResponse(resp2);
                        if(!(data.Status && data.Status=="error")){
                          if(!$scope.isEqual($scope.chat.messages,$scope.getObjectDataFromResponse(resp2))){
                            $scope.chat.messages = new Array();
                            $scope.chat.messages = $scope.getObjectDataFromResponse(resp2);
                          }
                        }
                        if($scope.myIntervals['privateMessage']){
                          $interval.cancel($scope.myIntervals['privateMessage']);
                        }
                        $scope.myIntervals['privateMessage'] = $interval(function() {
                                        MessageService.getAllMessagesToUser(UserService.name, UserService.password,$scope.chat.other_user.uid,UserService.uid).then(function(resp3){
                                          var data2 = $scope.getObjectDataFromResponse(resp3);
                                          if(!(data2.Status && data2.Status=="error")){
                                            if(!$scope.isEqual($scope.chat.messages,$scope.getObjectDataFromResponse(data2))){
                                              $scope.chat.messages = new Array();
                                              $scope.chat.messages = $scope.getObjectDataFromResponse(data2);
                                              var mnid = $scope.chat.messages[$scope.chat.messages.length-1].nid;
                                              $scope.scrollMe("message-"+mnid);
                                            }
                                          }
                                        });
                                      }, 3000);
                        $ionicModal.fromTemplateUrl('templates/private_chat.html', {
                            scope: $scope,
                            hardwareBackButtonClose: true,
                            animation: 'none',
                            //focusFirstInput: true
                          }).then(function(modal) {
                              document.getElementById("spinner").style.display = "none";
                              document.getElementById("user-options-menu").style.display="none";
                              ModalService.checkNoModalIsOpen();
                              ModalService.activeModal = modal;
                              document.getElementById("foot_bar").style.display = "none";
                              ModalService.activeModal.show();
                              SemaphoreService.makeAvailableAgain("open-modal");
                              var mnid = $scope.chat.messages[$scope.chat.messages.length-1].nid;
                              $scope.scrollMe("message-"+mnid);
                          });
                      });
                    });
                  }
                  //SemaphoreService.makeAvailableAgain("can_talk");
                }
              });
          }else{
            document.getElementById("spinner").style.display = "none";
            SemaphoreService.makeAvailableAgain("open-modal");
            /*var alertPopup = $ionicPopup.alert({
                 title: "Inicie sesión o cree una nueva cuenta",
                 template: "Debe estar logueado para poder enviar y recibir mensajes."
                });
                alertPopup.then(function(res) {
                  //return false;
                });*/
            $scope.selected_person.warning = "Debe estar logueado para poder enviar y recibir mensajes.";
          }
        }else{
          //SEMAFORO OCUPADO
        }

    }

    $scope.checkIfCanReplyInvitation = function(invitation){
      if(UserService.uid){
        if(UserService.uid!=invitation.uid){
          if(invitation.status=="Enviada"||invitation.status=="Recibida"){
            return true;
          }
        }
      }
      return false;
    }

    $scope.checkIfWaitingReplyFromInvitation = function(invitation){
      if(UserService.uid){
        if(UserService.uid==invitation.uid){
          if(invitation.status=="Enviada"||invitation.status=="Recibida"){
            return true;
          }
        }
      }
      return false;
    }

    $scope.getDrinkCostByNid = function(nid){
      var result = 0;
      if($scope.invitation.available_drinks){
        $scope.invitation.available_drinks.forEach(function(drink) {
          if(drink.Nid==nid){
            result = drink.Credits;
          }
        });
      }
      return result;
    }

    $scope.acceptInvitation = function(nid){
      $scope.send_invitation_response("Aceptada",nid);
      $scope.invitation.other_user.talk = true;
    }

    $scope.refuseInvitation = function(nid){
      $scope.send_invitation_response("Rechazada",nid);
    }

    $scope.canTalkToUser = function(uid){
      if(UserService.uid){
          if(MessageService.canTalkToUsers['uid-'+uid]!=null){
            if(MessageService.canTalkToUsers['uid-'+uid]==1){
              return true;
            }else{
              return false;
            }
        }else{
          return false;
        }
      }
    }

    $scope.send_invitation_response = function(response,nid){
      var error = document.getElementById("error_container");
      error.style.display = "none";

      if(nid == null){
        error.style.display = "block";
        error.innerHTML = "Hubo un error. No se encuentra el ID de invitación";
      }else{
        var cost = $scope.getDrinkCostByNid($scope.invitation.selected_drink);
        var credits = $scope.invitation.user_credits;
        if(SemaphoreService.takeIfAvailable("submit-form")){
          document.getElementById("spinner-inside-modal").style.display = "block";
          DrinkService.sendDrinkInvitationResponse(response,UserService.name,UserService.password,nid,UserService.uid).then(function(resp){
            SemaphoreService.makeAvailableAgain("submit-form");
            document.getElementById("spinner-inside-modal").style.display = "none";
            var data = $scope.getObjectDataFromResponse(resp);
            if(!(data.Status && data.Status=="error")){
              //MessageService.canTalkToUsers['uid-'+$scope.invitation.other_user.uid] = null;
            }else{
              error.style.display = "block";
              error.innerHTML = data.Message;
            }
          });
        }
      }
    }

    $scope.select_drink_to_invite = function(drinkNid){
      $scope.invitation.selected_drink = drinkNid;
      var x = document.getElementsByClassName("invitation drink selected");
      var i;
      for (i = 0; i < x.length; i++) {
          x[i].className = "invitation drink";
      }
      document.getElementById("drink_nid_"+drinkNid).className = "invitation drink selected";
    }

    $scope.send_invitation = function(){
      var error = document.getElementById("error_container");
      if($scope.invitation.selected_drink == null){
        error.style.display = "block";
        error.innerHTML = "Debe seleccionar una bebida a invitar";
      }else{
        var cost = $scope.getDrinkCostByNid($scope.invitation.selected_drink);
        var credits = $scope.invitation.user_credits;
        if(parseFloat(cost)>parseFloat(credits)){
          $scope.invitation.warning = "No tienes suficientes créditos.";
          $scope.invitation.warning_sub = "Carga más créditos para seguir invitando.";

          //error.style.display = "block";
          //error.innerHTML = "Créditos insuficientes. Para poder invitar esta bebida debe comprar más créditos";
        }else{
          if(SemaphoreService.takeIfAvailable("submit-form")){
            document.getElementById("spinner-inside-modal").style.display = "block";
            DrinkService.sendDrinkInvitationToUser($scope.invitation.selected_drink,$scope.invitation.other_user.uid,UserService.uid,UserService.name,UserService.password).then(function(resp){
              SemaphoreService.makeAvailableAgain("submit-form");
              document.getElementById("spinner-inside-modal").style.display = "none";
              var data = $scope.getObjectDataFromResponse(resp);
              if(!(data.Status && data.Status=="error")){
                $scope.invitation.user_credits = data.NewCredits;
                $scope.invitation.selected_drink = null;
                MessageService.canTalkToUsers['uid-'+$scope.invitation.other_user.uid] = null;
                $scope.openInvitationsModal($scope.invitation.other_user.uid);
              }else{
                error.style.display = "block";
                error.innerHTML = data.Message;
              }
            });
          }
        }
      }
    }

    $scope.openSingleInvitationModalFromChat = function(uid){
      if($scope.myIntervals['privateMessage']){
        $interval.cancel($scope.myIntervals['privateMessage']);
      }
      $scope.invitation = new Array();
      $scope.invitation.response = null;
      $scope.invitation.other_user = new Array();
      $scope.invitation.other_user = new Array();
      $scope.invitation.other_user.uid = uid;
      $scope.invitation.invitations = new Array();
      $scope.invitation.available_drinks = new Array();
      $scope.invitation.selected_drink = null;
      MessageService.getUserInfo(uid).then(function(data_resp){
        if($scope.getObjectDataFromResponse(data_resp).Photo){
          $scope.invitation.other_user.picture_url = $scope.getObjectDataFromResponse(data_resp).Photo;
        }else{
          $scope.invitation.other_user.picture_url = "./img/icon-user-anonymous.png";
        }
        $scope.invitation.my_uid = UserService.uid;
        $scope.invitation.my_picture_url = UserService.picture_url;
        $scope.invitation.other_user.username = $scope.getObjectDataFromResponse(data_resp).Name;
        $scope.invitation.other_user.online_status = $scope.getObjectDataFromResponse(data_resp).Online_status;
        DrinkService.getAllDrinksAvailable(UserService.name, UserService.password).then(function(resp){
          var data = $scope.getObjectDataFromResponse(resp);
          if(!(data.Status && data.Status=="error")){
            $scope.invitation.available_drinks = data.Drinks;
            $scope.invitation.user_credits = data.UserCredits;
          }
        });
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          if(UserService.uid){
            $ionicModal.fromTemplateUrl('templates/drink_invitation_new_from_chat.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                document.getElementById("user-options-menu").style.display="none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                document.getElementById("foot_bar").style.display = "none";
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          }else{
            document.getElementById("spinner").style.display = "none";
            SemaphoreService.makeAvailableAgain("open-modal");
            $scope.selected_person.warning = "Debe estar logueado para poder enviar y recibir invitaciones.";
          }
        }else{
          //SEMAFORO OCUPADO
        }
      });

    }

    $scope.openSingleInvitationModal = function(uid){
      if(SemaphoreService.takeIfAvailable("open-modal")){
        document.getElementById("spinner").style.display = "block";
        if(UserService.uid){
          $ionicModal.fromTemplateUrl('templates/drink_invitation_new.html', {
            scope: $scope,
            hardwareBackButtonClose: true,
            animation: 'none',
            //focusFirstInput: true
          }).then(function(modal) {
              document.getElementById("spinner").style.display = "none";
              document.getElementById("user-options-menu").style.display="none";
              ModalService.checkNoModalIsOpen();
              ModalService.activeModal = modal;
              document.getElementById("foot_bar").style.display = "none";
              ModalService.activeModal.show();
              SemaphoreService.makeAvailableAgain("open-modal");
          });
        }else{
          document.getElementById("spinner").style.display = "none";
          SemaphoreService.makeAvailableAgain("open-modal");
          $scope.selected_person.warning = "Debe estar logueado para poder enviar y recibir invitaciones.";
        }
      }else{
        //SEMAFORO OCUPADO
      }
    }

    $scope.openInvitationsModal = function(uid){
      $scope.clear_all_intervals();
      if(SemaphoreService.takeIfAvailable("open-modal")){
        document.getElementById("spinner").style.display = "block";
        if(UserService.uid){
          $scope.invitation = new Array();
          $scope.invitation.response = null;
          $scope.invitation.other_user = new Array();
          $scope.invitation.other_user.uid = uid;
          //MessageService.canTalkToUsers['uid-'+$scope.invitation.other_user.uid] = null;
          $scope.invitation.invitations = new Array();
          $scope.invitation.available_drinks = new Array();
          $scope.invitation.selected_drink = null;
          MessageService.getUserInfo(uid).then(function(data_resp){
          if($scope.getObjectDataFromResponse(data_resp).Photo){
            $scope.invitation.other_user.picture_url = $scope.getObjectDataFromResponse(data_resp).Photo;
          }else{
            $scope.invitation.other_user.picture_url = "./img/icon-user-anonymous.png";
          }
          $scope.invitation.my_uid = UserService.uid;
          $scope.invitation.my_picture_url = UserService.picture_url;
          $scope.invitation.other_user.username = $scope.getObjectDataFromResponse(data_resp).Name;
          $scope.invitation.other_user.online_status = $scope.getObjectDataFromResponse(data_resp).Online_status;
            DrinkService.getAllDrinksAvailable(UserService.name, UserService.password).then(function(resp){
              var data = $scope.getObjectDataFromResponse(resp);
              if(!(data.Status && data.Status=="error")){
                $scope.invitation.available_drinks = data.Drinks;
                $scope.invitation.user_credits = data.UserCredits;
              }
              DrinkService.getAllInvitationsWithUser(UserService.name, UserService.password,$scope.invitation.other_user.uid,UserService.uid).then(function(resp2){
                var data2 = $scope.getObjectDataFromResponse(resp2);
                if(!(data2.Status && data2.Status=="error")){
                  $scope.invitation.invitations = data2;
                }
                MessageService.checkWhoCanTalk(UserService.name,UserService.password).then(function(resp){
                  var data = $scope.getObjectDataFromResponse(resp);
                  if(!(data.Status && data.Status=="error")){
                    data.forEach(function(uid){
                      MessageService.canTalkToUsers['uid-'+uid] = 1;
                    });
                  }
                });
                if($scope.myIntervals['drinkInvitation']){
                  $interval.cancel($scope.myIntervals['drinkInvitation']);
                }
                $scope.myIntervals['drinkInvitation'] = $interval(function() {
                  DrinkService.getAllInvitationsWithUser(UserService.name, UserService.password,$scope.invitation.other_user.uid,UserService.uid).then(function(resp3){
                    var data3 = $scope.getObjectDataFromResponse(resp3);
                    if(!(data3.Status && data3.Status=="error")){
                      $scope.invitation.invitations = $scope.getObjectDataFromResponse(data3);
                    }
                    MessageService.checkWhoCanTalk(UserService.name,UserService.password).then(function(resp){
                      var data = $scope.getObjectDataFromResponse(resp);
                      if(!(data.Status && data.Status=="error")){
                        data.forEach(function(uid){
                          MessageService.canTalkToUsers['uid-'+uid] = 1;
                        });
                      }
                    });
                });
              }, 3000);
                $ionicModal.fromTemplateUrl('templates/drink_invitation.html', {
                  scope: $scope,
                  hardwareBackButtonClose: true,
                  animation: 'none',
                  //focusFirstInput: true
                }).then(function(modal) {
                    document.getElementById("spinner").style.display = "none";
                    document.getElementById("user-options-menu").style.display="none";
                    ModalService.checkNoModalIsOpen();
                    ModalService.activeModal = modal;
                    document.getElementById("foot_bar").style.display = "none";
                    ModalService.activeModal.show();
                    SemaphoreService.makeAvailableAgain("open-modal");
                });
              });
            });
          });
        }else{
          document.getElementById("spinner").style.display = "none";
          SemaphoreService.makeAvailableAgain("open-modal");
          /*var alertPopup = $ionicPopup.alert({
               title: "Inicie sesión o cree una nueva cuenta",
               template: "Debe estar logueado para poder enviar y recibir invitaciones."
              });
              alertPopup.then(function(res) {
                //return false;
              });*/
          $scope.selected_person.warning = "Debe estar logueado para poder enviar y recibir invitaciones.";
        }
      }else{
        //SEMAFORO OCUPADO
      }
    }

    $scope.close_message_modal = function(){
      if($scope.myIntervals['privateMessage']){
        $interval.cancel($scope.myIntervals['privateMessage']);
      }
      if($scope.myIntervals['drinkInvitation']){
        $interval.cancel($scope.myIntervals['drinkInvitation']);
      }
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
      $scope.setActiveMenuButton('button_general');
    }

    $scope.close_invitation_modal = function(){
      if($scope.myIntervals['privateMessage']){
        $interval.cancel($scope.myIntervals['privateMessage']);
      }
      if($scope.myIntervals['drinkInvitation']){
        $interval.cancel($scope.myIntervals['drinkInvitation']);
      }
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
      $scope.setActiveMenuButton('button_general');
    }

    $scope.send_message_ok = function(){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        //document.getElementById("spinner-inside-modal").style.display = "block";
        if($scope.chat.new_text_message){
          MessageService.sendTextMessageToUser($scope.chat.new_text_message,$scope.chat.other_user.uid,UserService.uid,UserService.name,UserService.password).then(function(resp){
            //document.getElementById("spinner-inside-modal").style.display = "block";
            SemaphoreService.makeAvailableAgain("submit-form");
            document.getElementById("message_text_area").innerHTML="";
            $scope.chat.new_text_message = "";
            MessageService.getAllMessagesToUser(UserService.name, UserService.password,$scope.chat.other_user.uid,UserService.uid).then(function(resp2){
                $scope.chat.messages = $scope.getObjectDataFromResponse(resp2);
            });
          });
        }else{
          //document.getElementById("spinner-inside-modal").style.display = "none";
          SemaphoreService.makeAvailableAgain("submit-form");
        }
      }
    }

    $scope.getNameFromUid =function(uid){
      if(UserService.uid==uid){
        return UserService.name;
      }else{
        if($scope.chat.other_user.uid==uid){
          return $scope.chat.other_user.username;
        }
      }
    }

    $scope.getNameFromUidInvitation =function(uid){
      if(UserService.uid==uid){
        return UserService.name;
      }else{
        if($scope.invitation.other_user.uid==uid){
          return $scope.invitation.other_user.username;
        }
      }
    }

    $scope.timeConverter = function(UNIX_timestamp){
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
      var year = a.getFullYear();
      //var month = months[a.getMonth()];
      var month = a.getMonth() + 1;
      if(month<10){
        month = "0"+month;
      }
      var day = a.getDate();
      if(day<10){
        day = "0"+day;
      }
      var hour = a.getHours();
      if(hour<10){
        hour = "0"+hour;
      }
      var min = a.getMinutes();
      if(min<10){
        min = "0"+min;
      }
      var sec = a.getSeconds();
      var time = day + '/' + month + '/' + year + ' ' + hour + ':' + min;
      return time;
    }



    // Suggestion
    $scope.model = [];
    $scope.externalModel = [];
    $scope.selectedItems = [];
    $scope.preselectedSearchItems = [];
    $scope.clickedValueModel = "";
    $scope.removedValueModel = "";


    $scope.itemsRemoved = function(callback) {
      $scope.removedValueModel = callback;
    };

    $scope.user_options = function(){
      var menu = document.getElementById("user-options-menu");
      if(menu.style.display=="block"){
        menu.style.display = "none";
      }else{
        //console.log(UserService.name);
        var name = UserService.name;
        if(name==null){
          //No esta logueado
          $scope.show_anonymous_menu();
        }else{
          //Está logueado
          $scope.show_user_menu();
        }
      }
    }

    $scope.show_anonymous_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = "<div id='auth_options'><div class='nonauth-link' ng-click='show_login_modal()'>Iniciar sesión</div>";
      html = html + "<div class='nonauth-link' ng-click='show_sign_up_modal()'>Registrarse</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '120px';
      menu.style.width = '150px';
      menu.style.display = "block";
    }

    $scope.show_user_menu = function(){
      var menu = document.getElementById("user-options-menu");
      var html = UserService.name + "<div id='auth_options'><div class='user-logged-link' ng-click='show_edit_profile_modal()'>Mi perfil</div>";
      //html = html + "<div class='user-logged-link' ng-click='change_password()'>Cambiar contraseña</div>";
      html = html + "<div class='user-logged-link' ng-click='sign_out()'>Cerrar sesión</div></div>";
      menu.innerHTML = html;
      $compile(menu)($scope); //<---- recompilation
      menu.style.height = '220px';
      menu.style.width = '200px';
      menu.style.display = "block";
    };

    $scope.create_field_array = function(name,type,value){
      var field = new Array();
      field.name = name;
      field.type = type;
      field.value = value;
      return field;
    };

    $scope.create_field_array_with_twoFields = function(name,type,value,secondValue){
      var field = new Array();
      field.name = name;
      field.type = type;
      field.value = value;
      field.secondValue = secondValue;
      return field;
    };

    $scope.fix_fb_image_link = function(url){
      if(url.indexOf("http://graph.facebook.com") >= 0){
        var parts = url.split("http://graph.facebook.com");
        var newUrl = "http://graph.facebook.com"+parts[1];
        return newUrl;
      }
      return url;
    };

    $scope.log_in = function(user, password){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        if(ConnectivityService.isOnline()){
          document.getElementById("spinner-inside-modal").style.display = "block";
          var fields = new Array();
          fields.push($scope.create_field_array("Usuario","notNull",user));
          fields.push($scope.create_field_array("Contraseña","notNull",password));
          if(ErrorService.check_fields(fields,$scope.login)){
            AuthService.log_in(user,password).then(function(resp) {
              if(ErrorService.http_response_is_successful(resp,$scope.login)){
                photo = $scope.fix_fb_image_link($scope.getObjectDataFromResponse(resp).Photo);
                if(photo=="anon"){
                  photo="url(./img/icon-user-anonymous.png)";
                }
                UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, $scope.nonauth.password, photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,$scope.nonauth.password,photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                $scope.set_user_picture(1);
                document.getElementById("spinner-inside-modal").style.display = "none";
                SemaphoreService.makeAvailableAgain("submit-form");
                $scope.close_login_modal();
                $scope.sendUserLocation();
              }else{
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
              }
            }, function(resp) {
              //console.log(err);
              //alert("Error en sign_in");
              document.getElementById("spinner-inside-modal").style.display = "none";
              SemaphoreService.makeAvailableAgain("submit-form");
              ErrorService.show_error_message("error_container",resp.statusText);
            });
          }else{
            document.getElementById("spinner-inside-modal").style.display = "none";
            SemaphoreService.makeAvailableAgain("submit-form");
          }

        }else{
          SemaphoreService.makeAvailableAgain("submit-form");
          PopUpService.show_alert("Sin conexión a internet","Para iniciar sesión debe estar conectado a internet");
        }
      }
    }

    $scope.log_in_background = function(user, password){
      AuthService.log_in(user,password).then(function(resp) {
        if(ErrorService.http_response_is_successful_ajax(resp)){
          photo = $scope.fix_fb_image_link($scope.getObjectDataFromResponse(resp).Photo);
          if(photo=="anon"){
            photo="url(./img/icon-user-anonymous.png)";
          }
          UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, password, photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
          DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,password,photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);

          $scope.set_user_picture(1);
          $scope.sendUserLocation();
          return 1;
        }else{
          return 0;
        }

      }, function(resp) {
        //console.log(err);
        //ErrorService.show_error_message_popup(resp.statusText);
        return 0;
      });
    }

    $scope.sendUserLocation = function(){
      if(SemaphoreService.takeIfAvailable("submit-location")){
        if(UserService.show_location==1){
          var posOptions = {timeout: 10000, enableHighAccuracy: true};
          $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
              PinService.sendUserLocation(position.coords.latitude,position.coords.longitude,UserService.name,UserService.password,UserService.uid).then(function(resp) {
                if(ErrorService.http_response_is_successful_ajax(resp)){
                  LocationsService.save_last_user_position(position.coords.latitude,position.coords.longitude);
                  $scope.loadPinsLayer();
                  SemaphoreService.makeAvailableAgain("submit-location");
                  return 1;
                }else{
                  SemaphoreService.makeAvailableAgain("submit-location");
                  return 0;
                }
              });
            }, function(err) {
              SemaphoreService.makeAvailableAgain("submit-location");
              $scope.loadPinsLayer();
              return 0;
          });
        }else{
          SemaphoreService.makeAvailableAgain("submit-location");
          $scope.loadPinsLayer();
        }
      }
    }



    $scope.sign_out = function(){
      UserService.erase_user_data();
      DBService.eraseUser();
      document.getElementById("spinner").style.display = "none";
      $scope.set_user_picture(0);
      document.getElementById("user-options-menu").style.display="none";
    }

    $scope.show_edit_profile_modal = function(){
      $scope.clear_all_intervals();
      //Cargar el modal con la info del usuario logueado y con el submit a edit_profile_ok
      if(SemaphoreService.takeIfAvailable("open-modal")){
        document.getElementById("spinner").style.display = "block";
        $scope.newuser = new Array();
        $scope.newuser.email = UserService.email;
        $scope.newuser.gender = UserService.gender;
        $scope.newuser.username = UserService.name;
        $scope.newuser.interested = UserService.interested;
        $scope.newuser.status = UserService.status;
        $scope.newuser.show_location = UserService.show_location;
        $scope.actual_photo = UserService.picture_url;
        if($scope.actual_photo!=null){
        }else{
          $scope.actual_photo = "./img/icon-user-anonymous.png";
        }
        if($scope.actual_photo=="url(./img/icon-user-anonymous.png)"){
          $scope.actual_photo = "./img/icon-user-anonymous.png";
        }
        ModalService.checkNoModalIsOpen();
          if(ValidationService.isMobileDevice()){
            $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo.html', {
                scope: $scope,
                hardwareBackButtonClose: true,
                animation: 'none',
                //focusFirstInput: true
              }).then(function(modal) {
                  document.getElementById("spinner").style.display = "none";
                  document.getElementById("user-options-menu").style.display="none";
                  ModalService.activeModal = modal;
                  document.getElementById("foot_bar").style.display = "none";
                  ModalService.activeModal.show();
                  SemaphoreService.makeAvailableAgain("open-modal");
              });
          }else{
            $ionicModal.fromTemplateUrl('templates/edit_profile_with_photo_desktop.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                document.getElementById("user-options-menu").style.display="none";
                ModalService.activeModal = modal;
                document.getElementById("foot_bar").style.display = "none";
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          }
        }

    }

    $scope.readURL = function (input,type) {
      if (input.files && input.files[0]) {
        if(type==1){
          $scope.newuser.picture_url = input.files[0];
            }else if (type==2){
          $scope.comment.photo = input.files[0];
        }else{
          $scope.report.file = input.files[0];
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("myImage").src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }

    }

    $scope.close_edit_profile_modal = function(){
      //Cargar el modal con la info del usuario logueado y con el submit a update_user
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
    }

    $scope.edit_profile_ok = function(){
      $scope.edit_profile();
    }

    $scope.getObjectDataFromResponse = function(response){
      if(response.data){
        return response.data;
      }else{
        return response;
      }
    }

    $scope.edit_profile = function(){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        if(ConnectivityService.isOnline()){
          document.getElementById("spinner-inside-modal").style.display = "block";
          /*var fields = new Array();
          fields.push($scope.create_field_array("Correo electrónico","email",new_email));
          //fields.push($scope.create_field_array("Contraseña","notNull",password));
          fields.push($scope.create_field_array("Cédula de Identidad","iddoc_uy",id_doc));
          fields.push($scope.create_field_array("Nombre y apellido","two_words",fullname));*/
          /*if(ErrorService.check_fields(fields,"error_container")){*/
          $scope.newuser.password = UserService.password;
            var edit_request = AuthService.edit_user($scope.newuser);
            if($scope.newuser.picture_url==null || $scope.newuser.picture_url=="" || !ValidationService.isMobileDevice()){
              edit_request.success(function(resp){
                document.getElementById("sent_label").innerHTML = "Enviado: 100%";
                //console.log(resp);
                if(ErrorService.http_response_is_successful(resp,"error_container")){
                  UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, $scope.newuser.password, $scope.getObjectDataFromResponse(resp).Photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,$scope.newuser.password,$scope.getObjectDataFromResponse(resp).Photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  SemaphoreService.makeAvailableAgain("submit-form");
                  $scope.close_edit_profile_modal();
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              })
              .error(function(data, status, headers,config){
                ErrorService.show_error_message("error_container",status);
                document.getElementById("spinner-inside-modal").style.display = "none";
                SemaphoreService.makeAvailableAgain("submit-form");
              })
            }else{
              edit_request.then(function(result) {
                var data = JSON.parse(result.response);
                if(ErrorService.http_data_response_is_successful(data,"error_container")){
                  data = $scope.getObjectDataFromResponse(data);
                  UserService.save_user_data(data.Name, $scope.newuser.password, data.Photo, data.ShowLocation, data.Uid, data.Estado, data.Gender, data.InterestedIn);
                  DBService.saveUser(data.Name,$scope.newuser.password,data.Photo,data.ShowLocation,data.Uid,data.Estado, data.Gender, data.InterestedIn);
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  $scope.close_edit_profile_modal();
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              }, function(error) {
                var alert = "Código: " + error.code;
                alert = alert + " Origen: " + error.source;
                alert = alert + " Destino: " + error.target;
                alert = alert + " http_status: " + error.http_status;
                alert = alert + " Body: " + error.body;
                alert = alert + " Exception: " + error.exception;
                ErrorService.show_error_message("error_container","Hubo un error en el envío: " + alert);
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
              }, function(progress) {
                  $timeout(function() {
                    $scope.uploadProgress = (progress.loaded / progress.total) * 100;
                    document.getElementById("sent_label").innerHTML = "Enviado: " + Math.round($scope.uploadProgress) + "%";
                  });
              });
            }
          /*}else{
            document.getElementById("spinner-inside-modal").style.display = "none";
          }*/
        }else{
          SemaphoreService.makeAvailableAgain("submit-form");
          PopUpService.show_alert("Sin conexión a internet","Para editar su perfil debe estar conectado a internet");
        }
      }
    }


    $scope.show_login_modal = function(){
      $scope.clear_all_intervals();
      //Cargar el modal con el form de login y ahi llama al sign_in
      if(SemaphoreService.takeIfAvailable("open-modal")){
        $scope.nonauth = new Array();
        $scope.nonauth.user = "";
        $scope.nonauth.password = "";
        ModalService.checkNoModalIsOpen();
        $ionicModal.fromTemplateUrl('templates/log_in.html', {
            scope: $scope,
            hardwareBackButtonClose: false,
            animation: 'none',
            //focusFirstInput: true
          }).then(function(modal) {
              $scope.hide_special_divs();
              ModalService.activeModal = modal;
              SemaphoreService.makeAvailableAgain("open-modal");
              document.getElementById("foot_bar").style.display = "none";
              ModalService.activeModal.show();
          });
      }
    }

    $scope.login_ok = function(){
      $scope.log_in($scope.nonauth.user,$scope.nonauth.password);
    }

    $scope.close_login_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
      $scope.setActiveMenuButton('button_general');

    }



    $scope.show_sign_up_modal = function(){
      $scope.clear_all_intervals();
      //cargar el modal con el form de sign_up y de ahi llamar al sign_up
      if(SemaphoreService.takeIfAvailable("open-modal")){
        $scope.newuser = new Array();
        $scope.newuser.email = "";
        $scope.newuser.password = "";
        $scope.newuser.fullname = "";
        $scope.newuser.id_doc = "";
        $scope.newuser.telephone = "";
        $scope.newuser.photo = "";
        ModalService.checkNoModalIsOpen();
        if(ValidationService.isMobileDevice()){
          $ionicModal.fromTemplateUrl('templates/sign_up.html', {
              scope: $scope,
              hardwareBackButtonClose: false,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                $scope.hide_special_divs();
                ModalService.activeModal = modal;
                SemaphoreService.makeAvailableAgain("open-modal");
                document.getElementById("foot_bar").style.display = "none";
                ModalService.activeModal.show();
            });
        }else{
          $ionicModal.fromTemplateUrl('templates/sign_up_desktop.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                $scope.hide_special_divs();
                ModalService.activeModal = modal;
                SemaphoreService.makeAvailableAgain("open-modal");
                document.getElementById("foot_bar").style.display = "none";
                ModalService.activeModal.show();
            });
        }

      }
    }

    $scope.close_sign_up_modal = function(){
      document.getElementById("foot_bar").style.display = "block";
      ModalService.checkNoModalIsOpen();
      $scope.setActiveMenuButton('button_general');

    }

    $scope.sign_up = function(){
      if(SemaphoreService.takeIfAvailable("submit-form")){
        if(ConnectivityService.isOnline()){
          document.getElementById("spinner-inside-modal").style.display = "block";
          var fields = new Array();
          /*fields.push($scope.create_field_array("Correo electrónico","email",$scope.newuser.email));
          fields.push($scope.create_field_array("Contraseña","notNull",$scope.newuser.password));
          fields.push($scope.create_field_array("Usuario","notNull",$scope.newuser.username));
          fields.push($scope.create_field_array("Género","notNull",$scope.newuser.gender));
          fields.push($scope.create_field_array("Interesado en","notNull",$scope.newuser.interested));
          fields.push($scope.create_field_array("Estado","notNull",$scope.newuser.status));
          fields.push($scope.create_field_array("Mostrar ubicación","notNull",$scope.newuser.show_location));
          fields.push($scope.create_field_array_with_twoFields("'Contraseña' y 'Confirmar contraseña'","equalsTo",$scope.newuser.password, $scope.newuser.repassword));*/
          //if(ErrorService.check_fields(fields,"error_container")){
            if($scope.newuser.picture_url!=null && $scope.newuser.picture_url!="" && ValidationService.isMobileDevice()){
              AuthService.create_user($scope.newuser).then(function(data){
                document.getElementById("sent_label").innerHTML = "Enviado: 100%";
                if(ErrorService.http_data_response_is_successful(data,"error_container")){
                  data = $scope.getObjectDataFromResponse(data);
                  UserService.save_user_data(data.name, data.email, $scope.newuser.password, data.identity_document, data.phone, data.picture_url);
                  UserService.save_user_data(data.Name, $scope.newuser.password, data.Photo, data.ShowLocation, data.Uid, data.Estado, data.Gender, data.InterestedIn);
                  DBService.saveUser(data.Name,password,data.Photo,data.ShowLocation,data.Uid,data.Estado, data.Gender, data.InterestedIn);
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  $scope.close_edit_profile_modal();
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              },function(err){
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
              });
            }else{
                AuthService.create_user($scope.newuser).then(function(resp) {
                if(ErrorService.http_response_is_successful(resp,"error_container")){
                  UserService.save_user_data($scope.getObjectDataFromResponse(resp).Name, $scope.newuser.password, $scope.getObjectDataFromResponse(resp).Photo, $scope.getObjectDataFromResponse(resp).ShowLocation, $scope.getObjectDataFromResponse(resp).Uid, $scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  DBService.saveUser($scope.getObjectDataFromResponse(resp).Name,$scope.newuser.password,$scope.getObjectDataFromResponse(resp).Photo,$scope.getObjectDataFromResponse(resp).ShowLocation,$scope.getObjectDataFromResponse(resp).Uid,$scope.getObjectDataFromResponse(resp).Estado, $scope.getObjectDataFromResponse(resp).Gender, $scope.getObjectDataFromResponse(resp).InterestedIn);
                  //$scope.set_user_picture(1);
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                  $scope.close_sign_up_modal();
                  var alertPopup = $ionicPopup.alert({
                   title: "Usuario creado con éxito",
                   template: $scope.getObjectDataFromResponse(resp).message
                  });
                  alertPopup.then(function(res) {
                    //return false;
                  });
                  $scope.check_user_logged();
                }else{
                  SemaphoreService.makeAvailableAgain("submit-form");
                  document.getElementById("spinner-inside-modal").style.display = "none";
                }
              }, function(resp) {
                SemaphoreService.makeAvailableAgain("submit-form");
                document.getElementById("spinner-inside-modal").style.display = "none";
                ErrorService.show_error_message("error_container",resp.statusText);
              });
            }
          /*}else{
            document.getElementById("spinner-inside-modal").style.display = "none";
          }*/
        }else{
          SemaphoreService.makeAvailableAgain("submit-form");
          PopUpService.show_alert("Sin conexión a internet","Para iniciar registrarse debe estar conectado a internet");
        }
      }
    }

    $scope.sign_up_ok = function(){
      //console.log($scope.newuser);
      $scope.sign_up();
    }

    $scope.check_user_logged = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              $scope.log_in_background(doc.name, doc.password);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }

    $scope.set_offline_user = function(){
      var name = UserService.name;
      if(name==null){
          //Si Hay un usuario guardado
          var user = DBService.getUser();
          user.then(function (doc) {
            if(doc.name!=null && doc.name!="" && doc.name!="undefined"){
              UserService.save_user_data(doc.name, doc.password, doc.picture_url, doc.show_location);
            }else{
              $scope.set_user_picture(0);
            }
          }).catch(function (err) {
            $scope.set_user_picture(0);
          });
      }else{
        //Está logueado
        if(UserService.picture_url==null || UserService.picture_url==""){
          //El usuario no tiene foto definida
          $scope.set_user_picture(0);
        }else{
          //El usuario tiene foto
          $scope.set_user_picture(1);
        }
      }
    }



    $scope.set_user_picture = function(hasPhoto){
      var picture = document.getElementById("user_picture");
      if(hasPhoto==0){
        //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
        $scope.user_cached_image="./img/icon-user-anonymous.png";
      }else{
        if(UserService.picture_url!=null && UserService.picture_url!=""){
          //alert(UserService.picture_url);
          $scope.user_cached_image=UserService.picture_url;
          //picture.style.backgroundImage = "url(" + UserService.picture_url + ")";
        }else{
          //picture.style.backgroundImage = "url(./img/icon-user-anonymous.png)";
          $scope.user_cached_image="./img/icon-user-anonymous.png";
        }
      }

    }

    $scope.find_me = function(){
      $scope.set_active_option("button-find-me");
      $scope.hide_special_divs();
      var posOptions = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
              $scope.map.center.lat  = position.coords.latitude;
              $scope.map.center.lng = position.coords.longitude;
              LocationsService.save_new_report_position(position.coords.latitude,position.coords.longitude);
              if(ConnectivityService.isOnline()){
                $scope.map.center.zoom = 18;
              }else{
                $scope.map.center.zoom = 16;
              }
              $scope.map.markers.now = {
                lat:position.coords.latitude,
                lng:position.coords.longitude,
                message: "<p align='center'>Te encuentras aquí <br/> <a ng-click='new_report(1);'>Iniciar reporte en tu posición actual</a></p>",
                focus: true,
                draggable: false,
                getMessageScope: function() { return $scope; }
              };
              //$scope.map.markers.now.openPopup();
            }, function(err) {
              // error
              //console.log("Location error!");
              //console.log(err);
              //ErrorService.show_error_message_popup("No hemos podido geolocalizarlo. ¿Tal vez olvidó habilitar los servicios de localización en su dispositivo?")
              $scope.openCouncilSelector();
            });

        };

      $scope.click_on_perfil_button = function(){
        $scope.clear_all_intervals();
        if(UserService.uid!=null){
          $scope.show_edit_profile_modal();
        }else{
          $scope.show_login_modal();
        }
        $scope.setActiveMenuButton('button_general');
      };


      $scope.isEqual = function(obj1, obj2){
        if(!obj1 || !obj2){
          return false;
        }
        if(Object.keys(obj1).length==Object.keys(obj2).length){
            for(key in obj1) {
                if(key !="params"){
                if(obj1[key] == obj2[key]) {
                    continue;
                }
                else {
                  //console.log("key:" + key);
                    return false
                    break;
                }
              }
            }
        } else {
            return false;
        }
        return true;
      };

      $scope.clear_all_intervals = function(){
        if($scope.myIntervals['privateMessage']){
          $interval.cancel($scope.myIntervals['privateMessage']);
        }
        if($scope.myIntervals['drinkInvitation']){
          $interval.cancel($scope.myIntervals['drinkInvitation']);
        }
      }

      $scope.openFilters = function(){
        var x = document.getElementsByClassName("tab-item tab-item-active");
        if(x.length>0){
          //ESTOY EN LISTADO
          var activeTab = x[0];
          var title = activeTab.firstElementChild.innerHTML;
          if(title=="PERSONAS"){
            $scope.setBackTo = "listado_people";
            $ionicModal.fromTemplateUrl('templates/filter_people.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
                $scope.toggleFilterInteresadoEn($scope.filter.filter_people_interesado_en);
            });
          }else{
            $scope.setBackTo = "listado_bar";
            $ionicModal.fromTemplateUrl('templates/filter_bar.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          }
        }else{
          $scope.setBackTo = "mapa";
          $ionicModal.fromTemplateUrl('templates/filter_people.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
                $scope.toggleFilterInteresadoEn($scope.filter.filter_people_interesado_en);
            });
        }
      }

      $scope.toggleFilterInteresadoEn = function(interest){
        var x = document.getElementsByClassName("filter_interesado_en");
        var i;
        for (i = 0; i < x.length; i++) {
            x[i].classList.remove('active');
        }
        var button_id = "";
        if(interest=="Hombres"){
          button_id = "filter_interesado_en_hombres";
        }
        if(interest=="Mujeres"){
          button_id = "filter_interesado_en_mujeres";
        }
        if(interest=="Personas en general" || interest==""){
          button_id = "filter_interesado_en_personas";
        }
        $scope.filter.filter_people_interesado_en = interest;
        document.getElementById(button_id).classList.add('active');
      }

      $scope.go_back_from_filter_modal = function(){
        $scope.loadPinsLayer();
        if($scope.setBackTo == "mapa"){
          ModalService.checkNoModalIsOpen();
        }
        if($scope.setBackTo == "listado_people"){
          $scope.open_user_list(false);
        }
        if($scope.setBackTo == "listado_bar"){
          $scope.open_user_list(true);
        }
      }

      $scope.filterUsers = function(){
          $scope.all_users.forEach(function(user,key){
            user.filtered=false;
            if($scope.filter.filter_people_distance_range>0){
              if(parseFloat(user.distance)>parseFloat($scope.filter.filter_people_distance_range)){
                user.filtered=true;
              }
            }
            if($scope.filter.filter_people_online==true){
              if(user.online_status!="Online"){
                user.filtered=true;
              }
            }
            if($scope.filter.filter_people_interesado_en=="Hombres"){
              if(user.gender!="Hombre"){
                user.filtered=true;
              }
            }
            if($scope.filter.filter_people_interesado_en=="Mujeres"){
              if(user.gender!="Mujer"){
                user.filtered=true;
              }
            }
          });
      }

      $scope.filterBars = function(){
          $scope.all_bars.forEach(function(bar,key){
            bar.filtered=false;
            if($scope.filter.filter_bar_distance_range>0){
              if(parseFloat(bar.distance)>parseFloat($scope.filter.filter_bar_distance_range)){
                bar.filtered=true;
              }
            }
            if($scope.filter.filter_bar_open==true){
              if(bar.status!="Abierto"){
                bar.filtered=true;
              }
            }
          });
      }

      $scope.pinIsNotFiltered = function(layer){
          var result = true;
          if(layer.feature.properties.Type=="Person"){
            if($scope.filter.filter_people_distance_range>0){
              if(parseFloat(layer.feature.properties.Distance)>parseFloat($scope.filter.filter_people_distance_range)){
                result=false;
              }
            }
            if($scope.filter.filter_people_online==true){
              if(layer.feature.properties.Online_status!="Online"){
                result=false;
              }
            }
            if($scope.filter.filter_people_interesado_en=="Hombres"){
              if(layer.feature.properties.Gender!="Hombre"){
                result=false;
              }
            }
            if($scope.filter.filter_people_interesado_en=="Mujeres"){
              if(layer.feature.properties.Gender!="Mujer"){
                result=false;
              }
            }
          }else if(layer.feature.properties.Type=="Bar"){
            if($scope.filter.filter_bar_distance_range>0){
              if(parseFloat(layer.feature.properties.Distance)>parseFloat($scope.filter.filter_bar_distance_range)){
                result=false;
              }
            }
            if($scope.filter.filter_bar_open==true){
              if(layer.feature.properties.Status!="Abierto"){
                result=false;
              }
            }
          }
          return result;
      }

      $scope.view_profile = function(uid,back_to){
        $scope.setBackTo=back_to;
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          MessageService.getUserInfo(uid).then(function(resp){
            $scope.profile = new Array();
            $scope.profile.other_user = new Array();
            if($scope.getObjectDataFromResponse(resp).Photo){
              $scope.profile.other_user.picture_url = $scope.getObjectDataFromResponse(resp).Photo;
            }else{
              $scope.profile.other_user.picture_url = "./img/icon-user-anonymous.png";
            }
            $scope.profile.other_user.uid = uid;
            $scope.profile.other_user.username = $scope.getObjectDataFromResponse(resp).Name;
            $scope.profile.other_user.online_status = $scope.getObjectDataFromResponse(resp).Online_status;
            $scope.profile.other_user.estado = $scope.getObjectDataFromResponse(resp).Estado;
            $scope.profile.other_user.posts = $scope.getObjectDataFromResponse(resp).Posts;
            $scope.profile.other_user.photos = $scope.getObjectDataFromResponse(resp).Photos;
            $ionicModal.fromTemplateUrl('templates/profile_other.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          });
        }
      }

      $scope.view_bar_profile = function(nid,back_to){
        $scope.setBackTo=back_to;
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          BarService.getBarInfo(nid).then(function(resp){
            $scope.profile = new Array();
            $scope.profile.bar = $scope.getObjectDataFromResponse(resp);
            /*if($scope.getObjectDataFromResponse(resp).Photo){
              $scope.profile.other_user.picture_url = $scope.getObjectDataFromResponse(resp).Photo;
            }else{
              $scope.profile.other_user.picture_url = "./img/icon-user-anonymous.png";
            }
            $scope.profile.other_user.uid = uid;
            $scope.profile.other_user.username = $scope.getObjectDataFromResponse(resp).Name;
            $scope.profile.other_user.online_status = $scope.getObjectDataFromResponse(resp).Online_status;
            $scope.profile.other_user.estado = $scope.getObjectDataFromResponse(resp).Estado;
            $scope.profile.other_user.posts = $scope.getObjectDataFromResponse(resp).Posts;
            $scope.profile.other_user.photos = $scope.getObjectDataFromResponse(resp).Photos;*/
            $ionicModal.fromTemplateUrl('templates/profile_bar.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          });
        }
      }

      $scope.view_my_profile = function(){
        $scope.setBackTo="mapa";
        if(SemaphoreService.takeIfAvailable("open-modal")){
          document.getElementById("spinner").style.display = "block";
          MessageService.getUserInfo(UserService.uid).then(function(resp){
            $scope.profile = new Array();
            $scope.profile.other_user = new Array();
            if($scope.getObjectDataFromResponse(resp).Photo){
              $scope.profile.other_user.picture_url = $scope.getObjectDataFromResponse(resp).Photo;
            }else{
              $scope.profile.other_user.picture_url = "./img/icon-user-anonymous.png";
            }
            $scope.profile.other_user.uid = $scope.getObjectDataFromResponse(resp).uid;
            $scope.profile.other_user.username = $scope.getObjectDataFromResponse(resp).Name;
            $scope.profile.other_user.online_status = $scope.getObjectDataFromResponse(resp).Online_status;
            $scope.profile.other_user.estado = $scope.getObjectDataFromResponse(resp).Estado;
            $scope.profile.other_user.posts = $scope.getObjectDataFromResponse(resp).Posts;
            $scope.profile.other_user.photos = $scope.getObjectDataFromResponse(resp).Photos;
            $ionicModal.fromTemplateUrl('templates/profile_my.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoModalIsOpen();
                ModalService.activeModal = modal;
                ModalService.activeModal.show();
                SemaphoreService.makeAvailableAgain("open-modal");
            });
          });
        }
      }


      $scope.show_galery = function(){
        if(SemaphoreService.takeIfAvailable("open-secondary-modal")){
          document.getElementById("spinner").style.display = "block";
          $ionicModal.fromTemplateUrl('templates/gallery.html', {
            scope: $scope,
            hardwareBackButtonClose: true,
            animation: 'none',
            backdropClickToClose: true
            //focusFirstInput: true
          }).then(function(modal) {
              document.getElementById("spinner").style.display = "none";
              ModalService.checkNoSecondaryModalIsOpen();
              ModalService.activeModalSecondary = modal;
              ModalService.activeModalSecondary.show();
              SemaphoreService.makeAvailableAgain("open-secondary-modal");
          });
        }
      };

      $scope.show_post = function(post){
          //console.log("POST: ");
          //console.log(post);
          $scope.selected_post = post;
          if(SemaphoreService.takeIfAvailable("open-secondary-modal")){
            document.getElementById("spinner").style.display = "block";
            $ionicModal.fromTemplateUrl('templates/post.html', {
              scope: $scope,
              hardwareBackButtonClose: true,
              animation: 'none',
              backdropClickToClose: true
              //focusFirstInput: true
            }).then(function(modal) {
                document.getElementById("spinner").style.display = "none";
                ModalService.checkNoSecondaryModalIsOpen();
                ModalService.activeModalSecondary = modal;
                ModalService.activeModalSecondary.show();
                SemaphoreService.makeAvailableAgain("open-secondary-modal");
            });
          }
      }

      $scope.close_secondary_modal = function(){
        ModalService.checkNoSecondaryModalIsOpen();
      }

      $scope.do_nothing = function(){

      }

  }

]);
