sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/Device',
    'sap/f/library',
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Device, fioriLibrary, Sorter, Fragment) {
        "use strict";

        return Controller.extend("ap.shipmentmanagement.controller.Log", {
            onInit: function () {
                this._mViewSettingsDialogs = {};
            },
            onNavToShipments: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("master");
            },
            formatTime: function (oTime) {
                if (!oTime || !oTime.ms) {
                  return "";
                }
                var time = oTime.ms / 1000; // Convert milliseconds to seconds
                var hours = Math.floor(time / 3600);
                var minutes = Math.floor((time % 3600) / 60);
                var seconds = Math.floor(time % 60);
      
                // Format the time
                var formattedTime =
                  hours.toString().padStart(2, "0") +
                  ":" +
                  minutes.toString().padStart(2, "0") +
                  ":" +
                  seconds.toString().padStart(2, "0");
      
                return formattedTime;
              },
              getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
    
                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sDialogFragmentName,
                        controller: this,
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },
              handleSortButtonPressed2: function () {
                this.getViewSettingsDialog(
                  "ap.shipmentmanagement.fragments.sortLogDialog"
                ).then(function (oViewSettingsDialog) {
                  oViewSettingsDialog.open();
                });
              },
              handleSortDialogConfirm2: function (oEvent) {
                var oTable = this.byId("shipmentLogTable"),
                  mParams = oEvent.getParameters(),
                  oBinding = oTable.getBinding("items"),
                  sPath,
                  bDescending,
                  aSorters = [];
        
                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));
        
                // apply the selected sort and group settings
                oBinding.sort(aSorters);
              }
        });
    });