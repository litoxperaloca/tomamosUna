pmb_im.services.factory('ModalService', [ function() {

  var modalOBJ = {};
  modalOBJ.activeModal = null;
  modalOBJ.activeModalSecondary = null;


  modalOBJ.checkNoModalIsOpen = function() {
    if(modalOBJ.activeModalSecondary){
      modalOBJ.activeModalSecondary.hide();
      modalOBJ.activeModalSecondary.remove();
    }
    if(modalOBJ.activeModal){
      modalOBJ.activeModal.hide();
      modalOBJ.activeModal.remove();
    }
  }

  modalOBJ.checkNoSecondaryModalIsOpen = function() {
    if(modalOBJ.activeModalSecondary){
      modalOBJ.activeModalSecondary.hide();
      modalOBJ.activeModalSecondary.remove();
    }
  }



  return modalOBJ;

}]);
