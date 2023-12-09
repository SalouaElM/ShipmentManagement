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

        this.openInplanningDialog(oSelectedShipment);
      },
      // Define oDialog as a member variable of the controller
      oDialog: null,

      openInplanningDialog: function (oSelectedShipment) {
        var oModel = this.getView().getModel();
      
        oModel.read("/ShipmentSet('" + oSelectedShipment + "')", {
          success: function (oData) {
            if (!this.oDialog) {
              this.oDialog = sap.ui.xmlfragment("ap.shipmentmanagement.fragments.inplanningDialog", this);
              this.getView().addDependent(this.oDialog);
            }
      
            this.oDialog.setModel(oModel);
      
            var oFragmentContent = this.oDialog.getContent()[0];
      
            if (oFragmentContent instanceof sap.m.VBox) {
              var oTextTknum = oFragmentContent.getItems()[1];
              var oTimeInPicker = oFragmentContent.getItems()[3];
              var oTimeOutPicker = oFragmentContent.getItems()[5];
              var oAppTimePicker = oFragmentContent.getItems()[7];
              var oTextAreaRemarks = oFragmentContent.getItems()[9];
      
              oTextTknum.setText(oData.Tknum);
      
              function formatTime(oTime) {
                if (!oTime || !oTime.ms) {
                  return "";
                }
                var time = oTime.ms / 1000;
                var hours = Math.floor(time / 3600);
                var minutes = Math.floor((time % 3600) / 60);
                var seconds = Math.floor(time % 60);
                return hours.toString().padStart(2, '0') + ':' +
                       minutes.toString().padStart(2, '0') + ':' +
                       seconds.toString().padStart(2, '0');
              }
      
              if (oData.TimeIn) {
                var formattedTimeIn = formatTime(oData.TimeIn);
                oTimeInPicker.setDateValue(new Date("01/01/1970 " + formattedTimeIn));
                oTimeInPicker.setValue(formattedTimeIn);
              }
      
              if (oData.TimeOut) {
                var formattedTimeOut = formatTime(oData.TimeOut);
                oTimeOutPicker.setDateValue(new Date("01/01/1970 " + formattedTimeOut));
                oTimeOutPicker.setValue(formattedTimeOut);
              }
      
              if (oData.AppTime) {
                var formattedAppTime = formatTime(oData.AppTime);
                oAppTimePicker.setDateValue(new Date("01/01/1970 " + formattedAppTime));
                oAppTimePicker.setValue(formattedAppTime);
              }
      
              oTextAreaRemarks.setValue(oData.Remarks);
      
              this.oDialog.open();
            }
          }.bind(this)
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

        // apply filter settings
        oBinding.filter(aFilters);
      },

    });
  }
);
