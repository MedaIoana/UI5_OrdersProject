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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define(["require", "exports", "sap/ui/core/UIComponent", "sap/ui/core/routing/History", "./BaseController", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel"], function (require, exports, UIComponent_1, History_1, BaseController_1, Filter_1, FilterOperator_1, JSONModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @namespace ui5training.controller
     */
    var OrederView = /** @class */ (function (_super) {
        __extends(OrederView, _super);
        function OrederView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        OrederView.prototype.onInit = function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("orderView").attachMatched(this.onRouteMatched, this);
        };
        OrederView.prototype.onRouteMatched = function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sOrderID = oArgs.orderId;
            var oView = this.getView();
            var oModel = oView.getModel();
            var sPath = oModel.createKey("/Orders", {
                OrderID: Number(sOrderID),
            });
            oView.bindElement({
                path: sPath,
                parameters: {
                    expand: "Customer,Employee,Shipper",
                },
            });
            oModel.read("/Order_Details", {
                filters: [new Filter_1.default("OrderID", FilterOperator_1.default.EQ, sOrderID)],
                success: function (oData) {
                    var aDetails = oData.results.map(function (entry) {
                        var price = Number(entry.UnitPrice) || 0;
                        var quantity = Number(entry.Quantity) || 0;
                        return __assign(__assign({}, entry), { TotalAmount: (price * quantity).toFixed(2) });
                    });
                    var fTotal = aDetails.reduce(function (sum, item) {
                        return sum + Number(item.TotalAmount);
                    }, 0);
                    var oJSONModel = new JSONModel_1.default({
                        items: aDetails,
                        orderTotal: fTotal.toFixed(2),
                    });
                    oView.setModel(oJSONModel, "orderDetailsModel");
                },
            });
        };
        OrederView.prototype.onNavBack = function () {
            var history = History_1.default.getInstance();
            var previousHash = history.getPreviousHash();
            if (previousHash !== undefined) {
                window.history.go(-1);
            }
            else {
                var router = UIComponent_1.default.getRouterFor(this);
                router.navTo("main", {}, true);
            }
        };
        return OrederView;
    }(BaseController_1.default));
    exports.default = OrederView;
});
