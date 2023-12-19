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

        let oModel = new sap.ui.model.json.JSONModel({ currentDate: new Date() });
        this.getView().setModel(oModel, "settings");

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
        var formattedTime = hours.toString().padStart(2, '0') + ':' +
          minutes.toString().padStart(2, '0') + ':' +
          seconds.toString().padStart(2, '0');

        return formattedTime;
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

        // Open the inplanningDialog and pass the Tknum
        this.openInplanningDialog(oSelectedShipment);
      },
      // Define oDialog as a member variable of the controller
      oDialog: null,

      openInplanningDialog: function (sSelectedTknum) {
        var oModel = this.getView().getModel();

        // Read the specific Shipment data based on Tknum
        oModel.read("/ShipmentSet('" + sSelectedTknum + "')", {
          success: function (oData) {
            if (!this.oDialog) {
              this.oDialog = sap.ui.xmlfragment("ap.shipmentmanagement.fragments.inplanningDialog", this);
              this.getView().addDependent(this.oDialog);
            }

            // Set the model to the fragment
            this.oDialog.setModel(oModel);

            // Bind the specific Shipment data to the dialog
            this.oDialog.bindElement({
              path: "/ShipmentSet('" + sSelectedTknum + "')",
              parameters: {
                select: "Tknum, TimeIn, TimeOut, AppTime, Remarks" // Specify required fields
              }
            });

            // Open the inplanningDialog
            this.oDialog.open();
          }.bind(this),
          error: function () {
            // Handle error while fetching Shipment data
          }
        });
      },

      onCloseInplanningDialog: function () {
        if (this.oDialog) {
          this.oDialog.close();
        }
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

        // Additional filtering for the DatePicker (PlannedDate)
        var oDatePicker = this.getView().byId("planneddate");
        var oSelectedDate = oDatePicker.getValue();

        if (oSelectedDate) {
          // Convert date string to JavaScript Date object
          var oDate = new Date(oSelectedDate);

          // Format the date as yyyy-MM-dd
          var sFormattedDate = oDate.getFullYear() + '-' + ('0' + (oDate.getMonth() + 1)).slice(-2) + '-' + ('0' + oDate.getDate()).slice(-2);

          var oDateFilter = new sap.ui.model.Filter("PlannedDate", sap.ui.model.FilterOperator.EQ, sFormattedDate);
          aFilters.push(oDateFilter);
        }


        // Apply filters to the binding
        if (aFilters.length > 0) {
          oBinding.filter(new sap.ui.model.Filter(aFilters, true)); // Set 'true' for AND logic between multiple filters
        } else {
          oBinding.filter([]); // Clear filters if no filters are selected
        }
      },
      onNavToLog: function (oEvent) {
        this.getOwnerComponent().getRouter().navTo("log");
      },
      onUpdateInplanning: function () {
        var oView = this.getView();
        var oModel = oView.getModel();

        var that = this; // Store reference to 'this' context

        // Update the Shipment inplanning
        oModel.submitChanges({
          success: function () {
            // Success message
            sap.m.MessageToast.show("Update successful");

            // Close the dialog
            that.onCloseInplanningDialog();
          },
          error: function () {
            // Error message
            sap.m.MessageToast.show("Update unsuccessful");
          }
        });
      }

    });
  }
);
