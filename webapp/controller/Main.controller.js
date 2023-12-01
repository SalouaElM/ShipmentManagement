sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/Device',
    'sap/f/library',
    '../util/SortAndFilterHelper'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Device, fioriLibrary, SortAndFilterHelper) {
        "use strict";

        return Controller.extend("ap.shipmentmanagement.controller.Main", {
            onInit: function () {
                // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			    this._mViewSettingsDialogs = {};
            },

            onListItemPress: function () {
                var oFCL = this.oView.getParent().getParent();

                oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
            },
            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("ap.shipmentmanagement.fragments.sortDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            }, 
            handleFilterButtonPressed: function () {
                SortAndFilterHelper.handleSortButtonPressed(this, "ap.customerapplication.fragments.sortDialog")
           
            },
            handleSortDialogConfirm: function (oEvent) {
                SortAndFilterHelper.handleSortDialogConfirm(oEvent, this, "customersTable")
            },
            handleFilterDialogConfirm: function (oEvent) {
                SortAndFilterHelper.handleFilterDialogConfirm(oEvent, this, 'customersTable')
            },
        });
    });
