angular.module("pmb_im").run(["$templateCache", function($templateCache) {$templateCache.put("templates/drink_invitation.html","<ion-modal-view class=\"private_chat_modal\">\n    <div class=\"chat_top_bar\">\n      <div class=\"chat_other_user_picture\" style=\"background: url({{invitation.other_user.picture_url}}) no-repeat center;\"></div>\n      <div class=\"chat_other_user_name\">{{invitation.other_user.username}}</div>\n      <div ng-click=\"close_invitation_modal()\" class=\"close_message_modal\">X</div>\n    </div>\n    <ion-scroll direction=\"y\" class=\"private_chat_scroll\">\n      <div ng-repeat=\"invitationItem in invitation.invitations track by $index\" class=\"invitation\">\n        <div class=\"author\">\n          Enviada por: {{getNameFromUidInvitation(invitationItem.uid)}}\n        </div>\n        <div class=\"text\">\n          Bebida: {{invitationItem.drink}}\n        </div>\n        <div class=\"text\">\n          Estado: {{invitationItem.status}}\n        </div>\n        <div class=\"date\">\n          {{timeConverter(invitationItem.created)}}\n        </div>\n        <div ng-if=\"checkIfCanReplyInvitation(invitationItem)\">\n          <div class=\"invitation_button\" ng-click=\"acceptInvitation({{invitationItem.nid}})\">\n            ACEPTAR\n          </div>\n          <div class=\"invitation_button\" ng-click=\"refuseInvitation({{invitationItem.nid}})\">\n            RECHAZAR\n          </div>\n        </div>\n        <div ng-if=\"checkIfWaitingReplyFromInvitation(invitationItem)\">\n          <div class=\"text\" style=\"float: right; margin-right: 15px;\">\n            Esperando respuesta de {{invitation.other_user.username}}\n          </div>\n        </div>\n        <div ng-if=\"canTalkToUser(invitation.other_user.uid)\">\n          <div style=\"float: right;\">\n            <img class=\"img_message_inside_invitation\" ng-click=\"send_message_to({{invitation.other_user.uid}});\" src=\"./img/message_icon.png\" />\n          </div>\n        </div>\n      </div>\n      <div style=\"height: 250px\"></div>\n    </ion-scroll>\n    <div class=\"invitation_options\">\n      <div class=\"new_drink_invitation\">\n        <p><b>Nueva invitación</b></p>\n        <select ng-model=\"invitation.selected_drink\">\n          <option value=\"\" disabled selected>Seleccione una opción</option>\n          <option ng-repeat=\"drink in invitation.available_drinks track by $index\" value=\"{{drink.Nid}}\">{{drink.Nombre}}</option>\n        </select>\n        <div ng-if=\"invitation.selected_drink!=null\" class=\"new_drink_cost\">\n          Costo en créditos: {{getDrinkCostByNid(invitation.selected_drink)}}\n        </div>\n        <div ng-click=\"send_invitation()\" class=\"invitation_button\">\n            Enviar\n        </div>\n      </div>\n      <div class=\"user_credits\">\n        Créditos disponible: {{invitation.user_credits}}\n      </div>\n      <div id=\"error_container\"></div>\n    </div>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><ion-spinner icon=\"spiral\"></ion-spinner></div>\n</ion-modal-view>\n");
$templateCache.put("templates/edit_profile_with_photo.html","<ion-modal-view class=\"new-report-modal\">\n    <ion-content class=\"new-report-scroll\">\n        <div class=\"new-report-slide\">\n          <div class=\"new-report-content\">\n            <div class=\"category-header\">\n              <h3>Editar perfil</h3>\n              <p>Estos son los datos de tu cuenta en {{AppName}}.</p>\n            </div>\n            <div class=\"list\">\n              <div class=\"text-input-header\">\n                <h3>Usuario: {{newuser.username}}</h3>\n              </div>\n              <div class=\"field-separator\"></div>\n              <p>\n                <div style=\"background: url({{actual_photo}}) no-repeat center;\" class=\"userpicture_inside_modal\" />\n              </p>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Género *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.gender\">\n                  <option value=\"\" disabled selected>Seleccione un género</option>\n                  <option value=\"Mujer\">Mujer</option>\n                  <option value=\"Hombre\">Hombre</option>\n                  <option value=\"Otro\">Otro</option>\n                  <option value=\"No responde\">No responde</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Interesado en conocer: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.interested\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Mujeres\">Mujeres</option>\n                  <option value=\"Hombres\">Hombres</option>\n                  <option value=\"Personas en general\">Personas en general</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Tu estado: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.status\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Disponible\">Disponible</option>\n                  <option value=\"Durmiendo\">Durmiendo</option>\n                  <option value=\"Con ganas de charlar\">Con ganas de charlar</option>\n                  <option value=\"Me gustaría tomar algo\">Me gustaría tomar algo</option>\n                  <option value=\"Me gustaría invitar a alguien\">Me gustaría invitar a alguien</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n              <h3>Mostrar mi ubicación a otros usuarios: *</h3>\n            </div>\n            <div class=\"text-input-container\">\n              <select ng-model=\"newuser.show_location\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"1\">Sí, mostrar mi ubicación</option>\n                  <option value=\"0\">No, sólo mostrarme en la lista general</option>\n                </select>\n            </div>\n            <div class=\"field-separator\"></div>\n            <div class=\"foto-header\">\n                <h3>Si deseas, puedes cambiar tu foto</h3>\n              </div>\n              <div class=\"foto-input-container\" style=\"height: 50px;\">\n                <div class=\"foto-picker\">\n                  <div ng-click=\"addImage(0,0,0,1)\" class=\"foto-icon\"></div>\n                  <div ng-click=\"addImage(1,0,0,1)\" class=\"foto-text\">o GALERÍA</div>\n                </div>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"foto-footer\">\n                <h3>El archivo no puede pesar más de 2MB. (JPG)</h3>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"field-separator\"></div>\n              <div id=\"error_container\"></div>\n              <div class=\"padding\">\n                <button class=\"form-button\" ng-click=\"edit_profile_ok()\">Guardar</button>\n                <div class=\"field-separator\"></div>\n                <button class=\"form-button\" ng-click=\"close_edit_profile_modal()\">Cancelar</button>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div style=\"height: 200px\"></div>\n    </ion-content>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><h3>Aguarde por favor</h3><ion-spinner icon=\"spiral\"></ion-spinner><h3 id=\"sent_label\">Enviado: 100%</h3></div>\n</ion-modal-view>\n");
$templateCache.put("templates/edit_profile_with_photo_desktop.html","<ion-modal-view class=\"new-report-modal\">\n    <ion-content class=\"new-report-scroll\">\n        <div class=\"new-report-slide\">\n          <div class=\"new-report-content\">\n            <div class=\"category-header\">\n              <h3>Editar perfil</h3>\n              <p>Estos son los datos de tu cuenta en {{AppName}}.</p>\n            </div>\n            <div class=\"list\">\n              <div class=\"text-input-header\">\n                <h3>Usuario: {{newuser.username}}</h3>\n              </div>\n              <div class=\"field-separator\"></div>\n              <p>\n                <div style=\"background: url({{actual_photo}}) no-repeat center;\" class=\"userpicture_inside_modal\" />\n              </p>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Género *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.gender\">\n                  <option value=\"\" disabled selected>Seleccione un género</option>\n                  <option value=\"Mujer\">Mujer</option>\n                  <option value=\"Hombre\">Hombre</option>\n                  <option value=\"Otro\">Otro</option>\n                  <option value=\"No responde\">No responde</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Interesado en conocer: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.interested\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Mujeres\">Mujeres</option>\n                  <option value=\"Hombres\">Hombres</option>\n                  <option value=\"Personas en general\">Personas en general</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Tu estado: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.status\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Disponible\">Disponible</option>\n                  <option value=\"Durmiendo\">Durmiendo</option>\n                  <option value=\"Con ganas de charlar\">Con ganas de charlar</option>\n                  <option value=\"Me gustaría tomar algo\">Me gustaría tomar algo</option>\n                  <option value=\"Me gustaría invitar a alguien\">Me gustaría invitar a alguien</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n              <h3>Mostrar mi ubicación a otros usuarios: *</h3>\n            </div>\n            <div class=\"text-input-container\">\n              <select ng-model=\"newuser.show_location\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"1\">Sí, mostrar mi ubicación</option>\n                  <option value=\"0\">No, sólo mostrarme en la lista general</option>\n                </select>\n            </div>\n            <div class=\"field-separator\"></div>\n            <div class=\"foto-header\">\n                <h3>Si deseas, puedes cambiar tu foto</h3>\n              </div>\n              <div class=\"foto-input-container\">\n                <input type=\"file\" id=\"upimgfile\" name=\"uploadfile\" onchange=\"angular.element(this).scope().readURL(this,1)\" ng-model=\"newuser.picture_url\">\n                <div class=\"preview-img\"> <img id=\"myImage\" width=\"150\"   size=\"30\" /> </div>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"foto-footer\">\n                <h3>El archivo no puede pesar más de 2MB. (JPG)</h3>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"field-separator\"></div>\n              <div id=\"error_container\"></div>\n              <div class=\"padding\">\n                <button class=\"form-button\" ng-click=\"edit_profile_ok()\">Guardar</button>\n                <div class=\"field-separator\"></div>\n                <button class=\"form-button\" ng-click=\"close_edit_profile_modal()\">Cancelar</button>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div style=\"height: 200px\"></div>\n    </ion-content>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><h3>Aguarde por favor</h3><ion-spinner icon=\"spiral\"></ion-spinner><h3 id=\"sent_label\">Enviado: 100%</h3></div>\n</ion-modal-view>\n");
$templateCache.put("templates/intro.html","<ion-view title=\"Intro\" hide-nav-bar=\"true\" class=\"intro-background\">\n  <ion-content scroll=\"false\">\n    <!--<div class=\"intro-logo\">\n    </div>-->\n    <div id=\"intro-spinner\" class=\"intro-spinner\"><ion-spinner icon=\"spiral\"></ion-spinner></div>\n  </ion-content>\n</ion-view>\n");
$templateCache.put("templates/log_in.html","<ion-modal-view class=\"new-report-modal\">\n    <ion-content direction=\"y\" class=\"new-report-scroll\">\n        <div class=\"new-report-slide\">\n          <div class=\"new-report-content\">\n            <div class=\"category-header\">\n              <h3>Ingresa tus datos si ya tienes cuenta en {{AppName}}:</h3>\n            </div>\n            <div class=\"list\">\n              <div class=\"text-input-header\">\n                <h3>Usuario *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input style=\"color: #ffffff; padding-left: 10px; padding-right: 10px;\" class=\"text-input\" type=\"usuario\" placeholder=\"Tu nombre de usuario\" ng-model=\"nonauth.user\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Contraseña *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Tu contraseña\" type=\"password\" ng-model=\"nonauth.password\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div id=\"error_container\"></div>\n              <div class=\"padding\">\n                <button class=\"form-button\" ng-click=\"login_ok()\">Acceder</button>\n                <div class=\"field-separator\"></div>\n                <button class=\"form-button\" ng-click=\"close_login_modal()\">Cancelar</button>\n              </div>\n              <a ng-click=\"forgot_password()\" style=\"color: #FFFFFF; font-size: 12pt;\">¿Olvidaste tu contraseña?</a>\n            </div>\n          </div>\n        </div>\n    </ion-content>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><h3>Aguarde por favor</h3><ion-spinner icon=\"spiral\"></ion-spinner><h3 id=\"sent_label\">Enviado: 100%</h3></div>\n</ion-modal-view>\n");
$templateCache.put("templates/map.html","<ion-view title=\"{{AppName}}-Map\" hide-nav-bar=\"true\">\n\n<ion-nav-title>\n\n</ion-nav-title>\n\n<div id=\"spinner\" class=\"intro-spinner\"><ion-spinner icon=\"spiral\"></ion-spinner></div>\n<div id=\"pinspinner\" class=\"intro-spinner\"><ion-spinner icon=\"spiral\"></ion-spinner></div>\n\n<!--<div class=\"top-bar-imm\">\n  <div class=\"white-bar-imm\"></div>\n  <div class=\"icon-imm-top\"/></div>\n</div>-->\n\n\n<ion-content data-tap-disabled=\"true\">\n\n  <leaflet defaults=\"map.defaults\" center=\"map.center\" markers=\"map.markers\" ng-if=\"map\"></leaflet>\n\n</ion-content>\n\n\n\n<div id=\"foot_bar\" class=\"foot-bar\">\n  <!--<div class=\"street-search-bar\">\n    <div class=\"search-icon\"></div>\n    <label class=\"search-textbox-label\">\n        <input ion-autocomplete type=\"text\" id=\"search-textbox\" readonly=\"readonly\" class=\"ion-autocomplete\" autocomplete=\"off\"\n               ng-model=\"model\"\n               external-model=\"externalModel\"\n               selected-items=\"selectedItems\"\n               search-items=\"preselectedSearchItems\"\n               item-value-key=\"lat\"\n               item-view-value-key=\"address\"\n               items-method=\"searchLocation(query)\"\n               placeholder=\"Ir a: escribir calle.\"\n               items-clicked-method=\"itemsClicked(callback)\"\n               items-removed-method=\"itemsRemoved(callback)\"\n               cancel-button-clicked-method=\"itemsCanceled(callback)\"\n               max-selected-items=\"1\"\n               select-items-label=\"Seleccione una calle\"\n               manage-externally=\"true\"\n               selected-items-label=\"Calle\"\n               cancel-label=\"Volver\"/>\n    </label>\n  </div>-->\n  <div class=\"options-bar\">\n    <!--<div id=\"button-report\" class=\"option-active\">\n      <div class=\"button-report\" ng-click=\"new_report(0)\"></div>\n    </div>\n    <div id=\"button-list-reports\" class=\"option-inactive\">\n      <div class=\"button-list-reports\" ng-click=\"list_reports()\"></div>\n    </div>\n    <div id=\"button-faq\" class=\"option-inactive\">\n      <div class=\"button-faq\" ng-click=\"help()\"></div>\n    </div>\n    <div id=\"button-find-me\" class=\"option-inactive\">\n      <div class=\"button-find-me\" ng-click=\"find_me()\"></div>\n    </div>-->\n    <div class=\"user-options\">\n      <div id=\"user_picture\" class=\"user-picture\" style=\"background: url({{user_cached_image}}) no-repeat center;\"  ng-click=\"user_options()\"></div>\n    </div>\n  </div>\n  <div id=\"user-options-menu\">\n  </div>\n</div>\n\n</ion-view>\n");
$templateCache.put("templates/menu.html","<ion-side-menus enable-menu-with-back-views=\"false\">\n  <ion-side-menu-content>\n    <ion-nav-bar class=\"bar-stable\">\n    </ion-nav-bar>\n    <ion-nav-view name=\"menuContent\"></ion-nav-view>\n  </ion-side-menu-content>\n</ion-side-menus>\n");
$templateCache.put("templates/private_chat.html","<ion-modal-view class=\"private_chat_modal\">\n  <ion-content>\n      <div class=\"chat_top_bar\">\n        <div class=\"chat_other_user_picture\" style=\"background: url({{chat.other_user.picture_url}}) no-repeat center;\"></div>\n        <div class=\"chat_other_user_name\">{{chat.other_user.username}}</div>\n        <div ng-click=\"close_message_modal()\" class=\"close_message_modal\">X</div>\n      </div>\n      <ion-scroll direction=\"y\" class=\"private_chat_scroll\" delegate-handle=\"content\">\n        <div ng-repeat=\"message in chat.messages track by $index\" class=\"message\">\n          <a id=\"message-{{message.nid}}\"></a>\n          <div class=\"author\">\n            {{getNameFromUid(message.uid)}}:\n          </div>\n          <div class=\"text\">\n            {{message.texto}}\n          </div>\n          <div class=\"date\">\n            {{timeConverter(message.created)}}\n          </div>\n        </div>\n        <div style=\"height: 20px\"></div>\n      </ion-scroll>\n      <div class=\"chat_message_options\">\n        <textarea ng-keyUp=\"key_press($event,\'private_chat\')\" id=\"message_text_area\" class=\"chat_message_textarea\" ng-model=\"chat.new_text_message\"></textarea>\n        <div ng-click=\"send_message_ok()\" class=\"send_message_button\">\n          OK\n        </div>\n      </div>\n      <div style=\"height: 150px\"></div>\n    </ion-content>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><ion-spinner icon=\"spiral\"></ion-spinner></div>\n</ion-modal-view>\n");
$templateCache.put("templates/sign_up.html","<ion-modal-view class=\"new-report-modal\">\n    <ion-content class=\"new-report-scroll\">\n        <div class=\"new-report-slide\">\n          <div class=\"new-report-content\">\n            <div class=\"category-header\">\n              <h3>Regístrate y se parte</h3>\n              <p>Crea una cuenta en {{AppName}} y comienza a conocer gente.</p>\n            </div>\n            <div class=\"list\">\n              <div class=\"text-input-header\">\n                <h3>Correo electrónico *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input style=\"color: #ffffff; padding-left: 10px; padding-right: 10px;\" class=\"text-input\" type=\"email\" placeholder=\"Proporcionar un correo válido\" ng-model=\"newuser.email\">\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Usuario *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Por favor, ingrese nombre de usuario\" ng-model=\"newuser.username\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Contraseña *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Proporcione una contraseña\" ng-model=\"newuser.password\" type=\"password\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n                <div class=\"text-input-header\">\n                <h3>Repetir contraseña *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Repite la contraseña\" ng-model=\"newuser.repassword\" type=\"password\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Género *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.gender\">\n                  <option value=\"\" disabled selected>Seleccione un género</option>\n                  <option value=\"Mujer\">Mujer</option>\n                  <option value=\"Hombre\">Hombre</option>\n                  <option value=\"Otro\">Otro</option>\n                  <option value=\"No responde\">No responde</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Interesado en conocer: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.interested\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Mujeres\">Mujeres</option>\n                  <option value=\"Hombres\">Hombres</option>\n                  <option value=\"Personas en general\">Personas en general</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Tu estado: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.status\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Disponible\">Disponible</option>\n                  <option value=\"Durmiendo\">Durmiendo</option>\n                  <option value=\"Con ganas de charlar\">Con ganas de charlar</option>\n                  <option value=\"Me gustaría tomar algo\">Me gustaría tomar algo</option>\n                  <option value=\"Me gustaría invitar a alguien\">Me gustaría invitar a alguien</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n              <h3>Mostrar mi ubicación a otros usuarios: *</h3>\n            </div>\n            <div class=\"text-input-container\">\n              <select ng-model=\"newuser.show_location\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"1\">Sí, mostrar mi ubicación</option>\n                  <option value=\"0\">No, sólo mostrarme en la lista general</option>\n                </select>\n            </div>\n            <div class=\"field-separator\"></div>\n            <div class=\"foto-header\">\n                <h3>Si deseas, puedes subir tu foto</h3>\n              </div>\n              <div class=\"foto-input-container\" style=\"height: 50px;\">\n                <div class=\"foto-picker\">\n                  <div ng-click=\"addImage(0,0,0,1)\" class=\"foto-icon\"></div>\n                  <div ng-click=\"addImage(1,0,0,1)\" class=\"foto-text\">o GALERÍA</div>\n                </div>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"foto-footer\">\n                <h3>El archivo no puede pesar más de 2MB. (JPG)</h3>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"field-separator\"></div>\n              <div id=\"error_container\"></div>\n              <div class=\"padding\">\n                <button class=\"form-button\" ng-click=\"sign_up_ok()\">Registrarse</button>\n                <div class=\"field-separator\"></div>\n                <button class=\"form-button\" ng-click=\"close_sign_up_modal()\">Cancelar</button>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div style=\"height: 200px\"></div>\n    </ion-content>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><h3>Aguarde por favor</h3><ion-spinner icon=\"spiral\"></ion-spinner><h3 id=\"sent_label\">Enviado: 100%</h3></div>\n</ion-modal-view>\n");
$templateCache.put("templates/sign_up_desktop.html","<ion-modal-view class=\"new-report-modal\">\n    <ion-content class=\"new-report-scroll\">\n        <div class=\"new-report-slide\">\n          <div class=\"new-report-content\">\n            <div class=\"category-header\">\n              <h3>Regístrate y se parte</h3>\n              <p>Crea una cuenta en {{AppName}} y comienza a conocer gente.</p>\n            </div>\n            <div class=\"list\">\n              <div class=\"text-input-header\">\n                <h3>Correo electrónico *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input style=\"color: #ffffff; padding-left: 10px; padding-right: 10px;\" class=\"text-input\" type=\"email\" placeholder=\"Proporcionar un correo válido\" ng-model=\"newuser.email\">\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Usuario *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Por favor, ingrese nombre de usuario\" ng-model=\"newuser.username\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Contraseña *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Proporcione una contraseña\" ng-model=\"newuser.password\" type=\"password\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n                <div class=\"text-input-header\">\n                <h3>Repetir contraseña *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <input class=\"text-input\" style=\"color: #ffffff; padding-left: 10px; padding-right: 10px; padding-top: 10px;\" placeholder=\"Repite la contraseña\" ng-model=\"newuser.repassword\" type=\"password\"/>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Género *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.gender\">\n                  <option value=\"\" disabled selected>Seleccione un género</option>\n                  <option value=\"Mujer\">Mujer</option>\n                  <option value=\"Hombre\">Hombre</option>\n                  <option value=\"Otro\">Otro</option>\n                  <option value=\"No responde\">No responde</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Interesado en conocer: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.interested\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Mujeres\">Mujeres</option>\n                  <option value=\"Hombres\">Hombres</option>\n                  <option value=\"Personas en general\">Personas en general</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n                <h3>Tu estado: *</h3>\n              </div>\n              <div class=\"text-input-container\">\n                <select ng-model=\"newuser.status\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"Disponible\">Disponible</option>\n                  <option value=\"Durmiendo\">Durmiendo</option>\n                  <option value=\"Con ganas de charlar\">Con ganas de charlar</option>\n                  <option value=\"Me gustaría tomar algo\">Me gustaría tomar algo</option>\n                  <option value=\"Me gustaría invitar a alguien\">Me gustaría invitar a alguien</option>\n                </select>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"text-input-header\">\n              <h3>Mostrar mi ubicación a otros usuarios: *</h3>\n            </div>\n            <div class=\"text-input-container\">\n              <select ng-model=\"newuser.show_location\">\n                  <option value=\"\" disabled selected>Seleccione una opción</option>\n                  <option value=\"1\">Sí, mostrar mi ubicación</option>\n                  <option value=\"0\">No, sólo mostrarme en la lista general</option>\n                </select>\n            </div>\n            <div class=\"field-separator\"></div>\n            <div class=\"foto-header\">\n                <h3>Si deseas, puedes subir tu foto</h3>\n              </div>\n              <div class=\"foto-input-container\">\n                <input type=\"file\" id=\"upimgfile\" name=\"uploadfile\" onchange=\"angular.element(this).scope().readURL(this,1)\" ng-model=\"newuser.picture_url\">\n                <div class=\"preview-img\"> <img id=\"myImage\" width=\"150\"   size=\"30\" /> </div>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"foto-footer\">\n                <h3>El archivo no puede pesar más de 2MB. (JPG)</h3>\n              </div>\n              <div class=\"field-separator\"></div>\n              <div class=\"field-separator\"></div>\n              <div id=\"error_container\"></div>\n              <div class=\"padding\">\n                <button class=\"form-button\" ng-click=\"sign_up_ok()\">Registrarse</button>\n                <div class=\"field-separator\"></div>\n                <button class=\"form-button\" ng-click=\"close_sign_up_modal()\">Cancelar</button>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div style=\"height: 200px\"></div>\n    </ion-content>\n    <div id=\"spinner-inside-modal\" class=\"modal-spinner\"><h3>Aguarde por favor</h3><ion-spinner icon=\"spiral\"></ion-spinner><h3 id=\"sent_label\">Enviado: 100%</h3></div>\n</ion-modal-view>\n");}]);