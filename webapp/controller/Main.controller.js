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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
            return __awaiter(this, void 0, void 0, function () {
                var oTable, oModel, oSelected, i18nModel, bundle, deletePromises;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            oTable = this.byId("ordersView");
                            oModel = this.getView().getModel();
                            oSelected = oTable.getSelectedItems();
                            i18nModel = this.getView().getModel("i18n");
                            return [4 /*yield*/, i18nModel.getResourceBundle()];
                        case 1:
                            bundle = _a.sent();
                            if (oSelected.length === 0) {
                                MessageBox_1.default.information(bundle.getText("NoSelection"));
                                return [2 /*return*/];
                            }
                            deletePromises = oSelected.map(function (oItem) {
                                var oContext = oItem.getBindingContext();
                                if (!oContext)
                                    return Promise.resolve();
                                var sPath = oContext.getPath();
                                return new Promise(function (resolve, reject) {
                                    oModel.remove(sPath, {
                                        success: function () { return resolve(); },
                                        error: function (err) { return reject({ path: sPath, error: err }); },
                                    });
                                });
                            });
                            Promise.allSettled(deletePromises).then(function (results) {
                                var failed = results.filter(function (r) { return r.status === "rejected"; });
                                var successCount = results.length - failed.length;
                                if (successCount > 0) {
                                    MessageBox_1.default.success(bundle.getText("Deleted") + " ".concat(successCount));
                                }
                                if (failed.length > 0) {
                                    var failedPaths = failed.map(function (r) { return r.reason.path; }).join(", ");
                                    MessageBox_1.default.error(bundle.getText("DeletedFailed") + ": ".concat(failedPaths));
                                }
                                oTable.removeSelections();
                                _this.onSelectionChange();
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        Main.prototype.onCreateItem = function (event) {
            var oRouter = UIComponent_1.default.getRouterFor(this);
            oRouter.navTo("create");
        };
        Main.prototype.onPress = function (oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext();
            var oOrder = oContext.getObject();
            var orderId = String(oOrder.OrderID);
            var oRouter = UIComponent_1.default.getRouterFor(this);
            oRouter.navTo("orderView", {
                orderId: orderId,
            });
        };
        Main.prototype.onSelectionChange = function () {
            var oTable = this.byId("ordersView");
            var oSelected = oTable.getSelectedItems();
            var oButton = this.byId("deleteButton");
            if (oSelected.length > 0) {
                oButton.setEnabled();
            }
            else {
                oButton.setEnabled(false);
            }
        };
        return Main;
    }(BaseController_1.default));
    exports.default = Main;
});
