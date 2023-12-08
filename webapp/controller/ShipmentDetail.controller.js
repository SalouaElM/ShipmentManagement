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
            model: "",
          });

          var oTable = this.getView().byId("deliveryTable");
          oTable.bindItems({
            path: sShipmentPath + "/DeliverySet",
            template: oTable.getBindingInfo("items").template,
          });
          
          var oTable2 = this.getView().byId("deliveryTabledd"); // Ensure the correct table ID is used
          oTable2.bindItems({
            path: sShipmentPath + "/DeliverySet/DeliveryItemSet",
            template: oTable2.getBindingInfo("items").template,
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
          if(this.oDialog){
            this.getView().addDependent(this.oDialog);
          }
          else 
          {this.oDialog = sap.ui.xmlfragment(
            "ap.shipmentmanagement.fragments.Items",
            this
          );
        }

          let oOfferModel = new sap.ui.model.json.JSONModel(oContext.getObject());

          this.getView().setModel(oOfferModel, "offerModel");

                    
          this.oDialog.open()
      },
      onCloseDialog: function(oEvent){

          this.oDialog.close();

      }
      }
    );
  }
);
