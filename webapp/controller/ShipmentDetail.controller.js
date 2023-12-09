sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend(
      "ap.shipmentmanagement.controller.ShipmentDetail",
      {
        //hello
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
            parameters: {
              $expand: "DeliveryItemSet", // Expand DeliveryItemSet
              $filter: "DeliveryItemSet/Vbeln eq Vbeln" // Apply filter on Vbeln field
            },
            template: oTable.getBindingInfo("items").template,
          });
        },

        onExit: function () {
          this.oRouter
            .getRoute("list")
            .detachPatternMatched(this._onShipmentMatched, this);
          this.oRouter
            .getRoute("detail")
            .detachPatternMatched(this._onShipmentMatched, this);
        },
        onNavToShipments: function (oEvent) {
          this.getOwnerComponent().getRouter().navTo("master");
        },
        onListItemPress2: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext();
        
          if (oContext) {
            if (!this.oDialog) {
              this.oDialog = sap.ui.xmlfragment("ap.shipmentmanagement.fragments.Items", this);
              this.getView().addDependent(this.oDialog);
            }
        
            var sPath = oContext.getPath();
        
            var oModel = this.getView().getModel();
            oModel.read(sPath + "/DeliveryItemSet", {
              success: function (oData) {
                if (oData && oData.results) {
                  // Process and use oData.results
                  let oOfferModel = new sap.ui.model.json.JSONModel(oData.results);
                  this.oDialog.setModel(oOfferModel, "offerModel");

                  this.oDialog.open();
                } else {
                  console.error("No data found for DeliveryItemSet");
                }
              }.bind(this),
              error: function () {
                console.error("Failed to fetch DeliveryItemSet data");
              }
            });
          }
        },

        onCloseDialog: function (oEvent) {

          this.oDialog.close();

        }
      }
    );
  }
);
