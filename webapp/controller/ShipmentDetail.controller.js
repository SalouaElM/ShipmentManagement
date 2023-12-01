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
            .getRoute("main")
            .attachPatternMatched(this._onShipmentMatched, this);
          oRouter
            .getRoute("detail")
            .attachPatternMatched(this._onShipmentMatched, this);
        },
        _onShipmentMatched: function (oEvent) {
          let sTknum = oEvent.getParameter("arguments").shipment || "0";
          this.getView().bindElement({
            path: `//ShipmentSet('${sTknum}')`,
            model: "",
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
      }
    );
  }
);
