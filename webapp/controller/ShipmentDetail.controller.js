sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/f/library",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Device, fioriLibrary, Sorter, Fragment) {
    "use strict";

    return Controller.extend(
      "ap.shipmentmanagement.controller.ShipmentDetail",
      {
        _mViewSettingsDialogs: {},
        _deliveryCount: 0, // Add a property to store the count
        onInit: function () {
          let oRouter = this.getOwnerComponent().getRouter();
          oRouter
            .getRoute("master")
            .attachPatternMatched(this._onShipmentMatched, this);
          oRouter
            .getRoute("detail")
            .attachPatternMatched(this._onShipmentMatched, this);
        },
        _onShipmentMatched: function (oEvent) {
          var sShipmentID = oEvent.getParameter("arguments").shipment || "0";
          var sShipmentPath = `/ShipmentSet('${sShipmentID}')`;

          this.getView().bindElement({
            path: sShipmentPath,
          });

          var oTable = this.getView().byId("deliveryTable");
          oTable.bindItems({
            path: sShipmentPath + "/DeliverySet",
            template: oTable.getBindingInfo("items").template,
          });
          // Get the count of items and update the title
          var oBinding = oTable.getBinding("items");
          oBinding.attachDataReceived(function (oEvent) {
            var iCount = oEvent.getParameter("data").results.length;
            this.updateDeliveryTableTitle(iCount);
          }, this);
        },

        updateDeliveryTableTitle: function (iCount) {
          var oTitle = this.getView().byId("deliveryTableTitle");
          oTitle.setText("Deliveries (" + iCount + ")");
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
        handleSortButtonPressed: function () {
          this.getViewSettingsDialog(
            "ap.shipmentmanagement.fragments.sortDialogVbeln"
          ).then(function (oViewSettingsDialog) {
            oViewSettingsDialog.open();
          });
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
        handleSortDialogConfirm: function (oEvent) {
          var oTable = this.byId("deliveryTable"),
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
        },

        onExit: function () {
          this.oRouter
            .getRoute("list")
            .detachPatternMatched(this._onShipmentMatched, this);
          this.oRouter
            .getRoute("detail")
            .detachPatternMatched(this._onShipmentMatched, this);
        },
      }
    );
  }
);
