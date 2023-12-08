sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/Device',
    'sap/f/library'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Device, fioriLibrary) {
        "use strict";

        return Controller.extend("ap.shipmentmanagement.controller.Items", {
            onInit: function () {
                this.oDialog = sap.ui.xmlfragment(
                    "ap.shipmentmanagement.fragments.Items",
                    this
                  );
                  this.getView().addDependent(this.oDialog);
            },
            onNavToShipments: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("master");
            },
            onListItemPress2: function(oEvent){
                var oContext = oEvent.getSource().getBindingContext();

                // // Ensure oContext is valid before proceeding
                // if (!oContext) {
                //     // Handle the error or return
                //     return;
                // }
console.log("Ik zit hier")

                // let oOfferModel = new sap.ui.model.json.JSONModel(oContext.getObject());

                // this.getView().setModel(oOfferModel, "offerModel");
                this.oDialog.open()
            },
            onCloseDialog: function(oEvent){

                this.oDialog.close();

            }
        });
    });