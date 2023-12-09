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

        return Controller.extend("ap.shipmentmanagement.controller.Log", {
            onInit: function () {
            },
            onNavToShipments: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("master");
            },
        });
    });