sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/f/library",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Device, fioriLibrary, Sorter, Fragment, Filter) {
    "use strict";

    return Controller.extend("ap.shipmentmanagement.controller.Main", {
      onInit: function () {
        // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
        this._mViewSettingsDialogs = {};
      },

      onListItemPress: function (oEvent) {
        //var oFCL = this.oView.getParent().getParent();
        let sShipmentPath = oEvent.getSource().getBindingContext().getPath(),
          oSelectedShipment = sShipmentPath.split("'")[1]; // We split the path /ShipmentSet('145999') into 3 pieces by splitting on

        //oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
        this.getOwnerComponent().getRouter().navTo("detail", {
          layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
          shipment: oSelectedShipment,

        });
      },
      //implementation that when you click on the Tknum, it opens the inplanning details.
      onTknumClick: function (oEvent) {
        let sShipmentPath = oEvent.getSource().getBindingContext().getPath();
        let oSelectedShipment = sShipmentPath.split("'")[1];

        this.openInplanningDialog(oSelectedShipment);
    },

      openInplanningDialog: function (oSelectedShipment) {
        var oModel = this.getView().getModel(); // Assuming OData model is set on the view
        oModel.read("/ShipmentSet('" + oSelectedShipment + "')", {
            success: function (oData) {
                var oView = this.getView();
                var oDialog = oView.byId("inplanningDialog");

                var plannedDate = oData.PlannedDate ? new Date(oData.PlannedDate).toLocaleString() : "";
                var timeIn = oData.TimeIn ? new Date(oData.TimeIn.ms).toLocaleTimeString() : "";
                var timeOut = oData.TimeOut ? new Date(oData.TimeOut.ms).toLocaleTimeString() : "";
                var appTime = oData.AppTime ? new Date(oData.AppTime.ms).toLocaleTimeString() : "";

                // Set formatted values to the respective Text controls
                oView.byId("plannedDateText").setText(plannedDate);
                oView.byId("timeInText").setText(timeIn);
                oView.byId("timeOutText").setText(timeOut);
                oView.byId("appTimeText").setText(appTime);
                oView.byId("remarksText").setText(oData.Remarks);
                
                oDialog.open();
            }.bind(this),
            error: function () {
                // Handle error
            }
        });
    },

    onCloseInplanningDialog: function () {
        var oView = this.getView();
        var oDialog = oView.byId("inplanningDialog");
        oDialog.close();
    },

      handleSortButtonPressed: function () {
        this.getViewSettingsDialog(
          "ap.shipmentmanagement.fragments.sortDialog"
        ).then(function (oViewSettingsDialog) {
          oViewSettingsDialog.open();
        });
      },
      handleFilterButtonPressed: function () {
        this.getViewSettingsDialog(
          "ap.shipmentmanagement.fragments.filterDialog"
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
        var oTable = this.byId("shipmentTable"),
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
      handleFilterDialogConfirm: function (oEvent) {
        var oTable = this.byId("shipmentTable"),
          mParams = oEvent.getParameters(),
          oBinding = oTable.getBinding("items"),
          aFilters = [];

        mParams.filterItems.forEach(function (oItem) {
          let sPath = oItem.getParent().getKey(),
            sOperator = "EQ",
            sValue1 = oItem.getKey(),
            oFilter = new Filter(sPath, sOperator, sValue1);
          aFilters.push(oFilter);
        });

        // apply filter settings
        oBinding.filter(aFilters);
      },
    });
  }
);
