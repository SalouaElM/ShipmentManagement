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
            //model: " ",
          });

          var oTable = this.getView().byId("deliveryTable");
          oTable.bindItems({
            path: sShipmentPath + "/DeliverySet",
            template: oTable.getBindingInfo("items").template,
          });
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
