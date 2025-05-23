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
define(["require", "exports", "sap/m/MessageBox", "./BaseController", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/core/UIComponent"], function (require, exports, MessageBox_1, BaseController_1, Filter_1, FilterOperator_1, UIComponent_1) {
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
            var _this = this;
            var oTable = this.byId("ordersView");
            var oModel = this.getView().getModel();
            var oSelected = oTable.getSelectedItems();
            if (oSelected.length === 0) {
                MessageBox_1.default.show(this.getResourceBundle().getText("NoSelection"));
                return;
            }
            oSelected.forEach(function (oItem) {
                var oContext = oItem.getBindingContext(); // get context for the item
                if (!oContext)
                    return;
                var sPath = oContext.getPath(); // e.g. "/Orders(10248)"
                var oData = oModel.getProperty(sPath); // full object data
                oModel.remove(sPath, {
                    success: function () {
                        MessageBox_1.default.show(_this.getResourceBundle().getText("Deleted") + " ".concat(sPath));
                    },
                    error: function (err) {
                        // MessageBox.show(
                        // 	this.getResourceBundle().getText("DeletedFailed") + ` ${sPath}`, err
                        // );
                        console.error("Failed to delete item" + " ".concat(sPath), err);
                    },
                });
            });
            oTable.removeSelections();
        };
        Main.prototype.onCreateItem = function (event) {
            var oRouter = UIComponent_1.default.getRouterFor(this);
            oRouter.navTo("create");
        };
        return Main;
    }(BaseController_1.default));
    exports.default = Main;
});
