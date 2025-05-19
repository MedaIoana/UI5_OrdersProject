var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "sap/m/MessageBox", "./BaseController", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (require, exports, MessageBox_1, BaseController_1, Filter_1, FilterOperator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @namespace ui5training.controller
     */
    var Main = /** @class */ (function (_super) {
        __extends(Main, _super);
        function Main() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Main.prototype.onInit = function () {
            console.log("Main controller initialized");
        };
        Main.prototype.onSearchOrders = function (event) {
            // build filter array
            var filter = [];
            var query = event.getParameter("query");
            if (query) {
                var filters = [
                    new Filter_1.default("Customer/CompanyName", FilterOperator_1.default.Contains, query),
                    new Filter_1.default("Employee/LastName", FilterOperator_1.default.Contains, query),
                    new Filter_1.default("Shipper/CompanyName", FilterOperator_1.default.Contains, query),
                ];
                // Combine filters using OR
                filter.push(new Filter_1.default({
                    filters: filters,
                    and: false,
                }));
            }
            // filter binding
            var list = this.byId("ordersView");
            var binding = list === null || list === void 0 ? void 0 : list.getBinding("items");
            binding === null || binding === void 0 ? void 0 : binding.filter(filter);
        };
        Main.prototype.onDeleteItems = function (event) {
            var oTable = this.byId("ordersView");
            var oModel = oTable.getModel();
            var aData = oModel.getProperty("/Orders"); // all data
            if (!Array.isArray(aData)) {
                MessageBox_1.default.error("Model data '/Orders' is not available or is not an array.");
                return;
            }
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageBox_1.default.error("Please select items to delete.");
                return;
            }
            // Get indexes of selected items
            var aIndexesToDelete = aSelectedItems.map(function (oItem) {
                return oTable.indexOfItem(oItem);
            });
            aIndexesToDelete.sort(function (a, b) { return b - a; }); // Delete from highest to lowest
            // Modify the data directly
            aIndexesToDelete.forEach(function (iIndex) {
                aData.splice(iIndex, 1);
            });
            // Update the model with modified array
            oModel.setProperty("/Orders", aData);
            // Clear selection and update checkbox if needed
            oTable.removeSelections();
            var oSelectAllCheckbox = this.byId("selectAllCheckbox");
            if (oSelectAllCheckbox) {
                oSelectAllCheckbox.setSelected(false);
            }
            MessageBox_1.default.show("Selected items deleted.");
        };
        return Main;
    }(BaseController_1.default));
    exports.default = Main;
});
