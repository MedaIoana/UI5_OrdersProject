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
define(["require", "exports", "sap/m/ColumnListItem", "sap/m/StepInput", "sap/m/Text", "./BaseController", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"], function (require, exports, ColumnListItem_1, StepInput_1, Text_1, BaseController_1, Filter_1, FilterOperator_1, JSONModel_1, MessageBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @namespace ui5training.controller
     */
    var Create = /** @class */ (function (_super) {
        __extends(Create, _super);
        function Create() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._selectedProducts = [];
            _this.isSubmitNav = false;
            return _this;
        }
        Create.prototype.onInit = function () {
            var _this = this;
            var oRouter = this.getRouter();
            oRouter.getRoute("create").attachMatched(this.onRouteMatched, this);
            // Handle browser back button
            // this._handleBackNavigationBound = this._handleBackNavigation.bind(this);
            // window.addEventListener("popstate", this._handleBackNavigationBound);
            window.addEventListener("popstate", function (event) {
                event.preventDefault();
                // event.returnValue = "";
                if (!_this.isSubmitNav) {
                    _this._handleBackNavigation();
                }
            });
        };
        Create.prototype.onExit = function () {
            // if (this._handleBackNavigationBound) {
            // 	window.removeEventListener("popstate", this._handleBackNavigationBound);
            // }
            console.log();
        };
        Create.prototype.onRouteMatched = function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel();
            this.isSubmitNav = false; // Reset flag on route match
            var nOrderId = Math.floor(10000 + Math.random() * 90000);
            var oOrder = {
                OrderID: nOrderId,
                CustomerID: "",
                EmployeeID: 1,
                OrderDate: "",
                RequiredDate: "",
                ShippedDate: "",
                ShipVia: 1,
                Freight: "",
                ShipName: "Popescu Paul",
                ShipAddress: "Blv. Cetatii, Nr. 93",
                ShipCity: "Timisoara",
                ShipRegion: "Timis",
                ShipPostalCode: "300199",
                ShipCountry: "Romania",
                Customer: {
                    CompanyName: ".msg",
                },
                Employee: {
                    FirstName: "Andreea",
                    LastName: "Pop",
                },
                Shipper: {
                    CompanyName: "Fan Courier",
                },
            };
            oModel.create("/Orders", oOrder, {
                success: function (oData) {
                    var sPath = oView.getModel().createKey("/Orders", {
                        OrderID: oData.OrderID,
                    });
                    oView.bindElement(sPath, {
                        success: function (oData) {
                            console.log("success binding");
                        },
                        error: function (oResponse) {
                            console.log("failed binding");
                        },
                    });
                },
                error: function (oResponse) {
                    console.log("Failed to create order.");
                },
            });
        };
        Create.prototype.navigationChange = function (Event) {
            var _this = this;
            var oWizard = this.byId("wizardId");
            var oFromStep = this.byId(oWizard.getCurrentStep());
            var oToStep = Event.getParameter("step");
            var aSteps = oWizard.getSteps();
            var iFromIndex = aSteps.indexOf(oFromStep);
            var iToIndex = aSteps.indexOf(oToStep);
            var oResourceBundleOrPromise = this.getView().getModel("i18n").getResourceBundle();
            var handleWarning = function (oResourceBundle) {
                var _a;
                var sText = oResourceBundle.getText("discardChangesText");
                if (iToIndex < iFromIndex) {
                    MessageBox_1.default.warning(sText, {
                        actions: [MessageBox_1.default.Action.OK, MessageBox_1.default.Action.CANCEL],
                        onClose: function (sAction) {
                            if (sAction === MessageBox_1.default.Action.OK) {
                                for (var i = iToIndex; i <= iFromIndex; i++) {
                                    oWizard.invalidateStep(aSteps[i]);
                                }
                                oWizard.discardProgress(oToStep, false);
                                oWizard.goToStep(oToStep, false);
                                var oView = _this.getView();
                                var oViewModel = oView.getModel("viewModelButtons");
                                if (iToIndex === 0) {
                                    var oProductsTable = _this.byId("selectProducts");
                                    oProductsTable.removeSelections(true);
                                    oViewModel.setProperty("/step", iToIndex);
                                    _this._selectedProducts = [];
                                    var oComboBox = _this.byId("selectCustomer");
                                    oComboBox.setSelectedKey("");
                                }
                                else if (iToIndex === 1) {
                                    oViewModel.setProperty("/step", iToIndex);
                                }
                            }
                        },
                    });
                    (_a = Event.preventDefault) === null || _a === void 0 ? void 0 : _a.call(Event);
                }
            };
            if (oResourceBundleOrPromise &&
                typeof oResourceBundleOrPromise.then === "function") {
                oResourceBundleOrPromise.then(handleWarning);
            }
            else {
                handleWarning(oResourceBundleOrPromise);
            }
        };
        Create.prototype.onCustomerSelected = function (oEvent) {
            var _a;
            var oView = this.getView();
            var oModel = oView.getModel();
            var oWizard = this.byId("wizardId");
            var oComboBox = oEvent.getSource();
            var oSelectedItem = oComboBox.getSelectedItem();
            var oCurrentStep = this.byId(oWizard.getCurrentStep());
            if (oSelectedItem) {
                var sCustomerID = oSelectedItem.getKey();
                var sCompanyName = oSelectedItem.getText();
                var sOrderPath = (_a = oView.getBindingContext()) === null || _a === void 0 ? void 0 : _a.getPath();
                var oContext = oSelectedItem.getBindingContext();
                var oCustomerData = oContext === null || oContext === void 0 ? void 0 : oContext.getObject();
                if (sOrderPath) {
                    oModel.setProperty("".concat(sOrderPath, "/CustomerID"), sCustomerID);
                    oModel.setProperty("".concat(sOrderPath, "/Customer/CompanyName"), sCompanyName);
                    this._selectedCustomer = oCustomerData;
                    oWizard.validateStep(oCurrentStep);
                    oWizard.nextStep();
                }
            }
            else {
                oWizard.invalidateStep(oCurrentStep);
            }
        };
        Create.prototype.onSearchProducts = function (event) {
            // build filter array
            var filter = [];
            var query = event.getParameter("query");
            if (query) {
                var filters = [
                    new Filter_1.default("ProductName", FilterOperator_1.default.Contains, query),
                    new Filter_1.default("Category/CategoryName", FilterOperator_1.default.Contains, query),
                ];
                // Combine filters using OR
                filter.push(new Filter_1.default({
                    filters: filters,
                    and: false,
                }));
            }
            // filter binding
            var list = this.byId("selectProducts");
            var binding = list === null || list === void 0 ? void 0 : list.getBinding("items");
            binding === null || binding === void 0 ? void 0 : binding.filter(filter);
        };
        Create.prototype.onProductSelect = function () {
            var _a;
            var oView = this.getView();
            var oModel = oView.getModel();
            var oWizard = this.byId("wizardId");
            var oViewModelButtons = oView.getModel("viewModelButtons");
            var oTable = this.byId("selectProducts");
            var aSelectedItems = oTable.getSelectedItems();
            var oCurrentStep = this.byId(oWizard.getCurrentStep());
            if (aSelectedItems.length > 0) {
                var aSelectedContexts = oTable.getSelectedContexts();
                var aSelectedProducts = aSelectedContexts.map(function (ctx) {
                    var product = ctx.getObject();
                    var quantity = "1"; // Because Quantity is a string in my model
                    return __assign(__assign({}, product), { Quantity: quantity, TotalPrice: parseFloat((parseFloat(product.UnitPrice) * parseFloat(quantity)).toFixed(2)) });
                });
                this._selectedProducts = aSelectedProducts;
                var sOrderPath = (_a = oView.getBindingContext()) === null || _a === void 0 ? void 0 : _a.getPath();
                if (sOrderPath) {
                    oModel.setProperty("".concat(sOrderPath), aSelectedProducts);
                }
                oWizard.validateStep(oCurrentStep);
                var oNextStep = oWizard.getProgressStep();
                var iNextIndex = oWizard.getSteps().indexOf(oNextStep);
                oViewModelButtons.setProperty("/step", iNextIndex);
                console.log();
            }
            else {
                oWizard.invalidateStep(oCurrentStep);
            }
        };
        Create.prototype._onQuantityChange = function (oEvent) {
            var oItem = oEvent.getSource().getParent(); // ColumnListItem
            var oContext = oItem.getBindingContext("viewModel");
            var oProduct = oContext.getObject();
            oProduct.TotalPrice = oProduct.UnitPrice * oProduct.Quantity;
            var oModel = this.getView().getModel("viewModel");
            oModel.refresh(true); // refresh binding
            var aProducts = oModel.getProperty("/selectedProducts");
            var total = aProducts.reduce(function (sum, p) { var _a; return sum + ((_a = Number(p.TotalPrice.toFixed(2))) !== null && _a !== void 0 ? _a : 0); }, 0);
            oModel.setProperty("/totalPrice", parseFloat(total).toFixed(2));
        };
        Create.prototype.onNext = function () {
            var _this = this;
            var oWizard = this.byId("wizardId");
            var oCurrentStep = this.byId(oWizard.getCurrentStep());
            var oView = this.getView();
            var oViewModelButtons = oView.getModel("viewModelButtons");
            // Update selected products to include TotalPrice
            this._selectedProducts = this._selectedProducts.map(function (product) {
                var _a, _b;
                var quantity = (_a = product.Quantity) !== null && _a !== void 0 ? _a : 1;
                var unitPrice = (_b = product.UnitPrice) !== null && _b !== void 0 ? _b : 0;
                return __assign(__assign({}, product), { Quantity: String(quantity), TotalPrice: parseFloat((Number(unitPrice) * Number(quantity)).toFixed(2)) });
            });
            // Calculate total
            var total = this._selectedProducts.reduce(function (sum, p) {
                var _a;
                return sum + ((_a = p.TotalPrice) !== null && _a !== void 0 ? _a : 0);
            }, 0);
            var oViewModel = new JSONModel_1.default({
                selectedProducts: this._selectedProducts,
                totalPrice: parseFloat(total.toFixed(2)),
            });
            this.getView().setModel(oViewModel, "viewModel");
            var oCustomerModel = new JSONModel_1.default(this._selectedCustomer);
            oView.setModel(oCustomerModel, "customerData");
            var oTableProd = this.byId("selectedProducts");
            oTableProd.setModel(oViewModel, "viewModel");
            oTableProd.bindItems({
                path: "viewModel>/selectedProducts",
                template: new ColumnListItem_1.default({
                    cells: [
                        new Text_1.default({
                            text: "{viewModel>ProductName}",
                        }),
                        new Text_1.default({
                            text: "{viewModel>Category/CategoryName}",
                        }),
                        new Text_1.default({
                            text: "{viewModel>Category/Description}",
                        }),
                        new Text_1.default({
                            text: "{viewModel>UnitPrice}",
                        }),
                        new Text_1.default({
                            text: "{viewModel>QuantityPerUnit}",
                        }),
                        new StepInput_1.default({
                            value: "{viewModel>Quantity}",
                            min: 1,
                            max: "{viewModel>UnitsInStock}",
                            change: function (oEvent) { return _this._onQuantityChange(oEvent); },
                        }),
                        new Text_1.default({
                            text: "{= (Number(${viewModel>UnitPrice} || 0) * Number(${viewModel>Quantity} || 0)).toFixed(2) + ' $'}",
                        }),
                    ],
                }),
            });
            oWizard.validateStep(oCurrentStep);
            oWizard.nextStep();
            var oNextStep = oWizard.getProgressStep();
            var iNextIndex = oWizard.getSteps().indexOf(oNextStep);
            oViewModelButtons.setProperty("/step", iNextIndex);
        };
        Create.prototype.onCancel = function () {
            var _this = this;
            var oView = this.getView();
            var oRouter = this.getRouter();
            var oModel = oView.getModel();
            var oWizard = this.byId("wizardId");
            var oViewModelButtons = oView.getModel("viewModelButtons");
            var oResourceModel = this.getView().getModel("i18n");
            var oResourceBundleOrPromise = oResourceModel === null || oResourceModel === void 0 ? void 0 : oResourceModel.getResourceBundle();
            // const handleConfirm = (oResourceBundle: any) => {
            MessageBox_1.default.confirm(oResourceBundleOrPromise === null || oResourceBundleOrPromise === void 0 ? void 0 : oResourceBundleOrPromise.getText("cancelConfirmationText"), {
                title: oResourceBundleOrPromise === null || oResourceBundleOrPromise === void 0 ? void 0 : oResourceBundleOrPromise.getText("cancelMessasgeBoxTitle"),
                actions: [MessageBox_1.default.Action.OK, MessageBox_1.default.Action.CANCEL],
                emphasizedAction: MessageBox_1.default.Action.OK,
                onClose: function (sAction) {
                    if (sAction === MessageBox_1.default.Action.OK) {
                        oModel.remove(oView.getBindingContext().getPath(), {
                            success: function () {
                                console.log();
                            },
                            error: function () {
                                console.log();
                            },
                        });
                        oWizard.discardProgress(oWizard.getSteps()[0], false);
                        var oComboBox = _this.byId("selectCustomer");
                        oComboBox.setSelectedKey("");
                        var oProductsTable = _this.byId("selectProducts");
                        oProductsTable.removeSelections(true);
                        oViewModelButtons.setProperty("/step", 0);
                        _this.isSubmitNav = true; // Reset flag to allow back navigation
                        oRouter.navTo("main");
                    }
                },
            });
            // };
            // if (
            // 	oResourceBundleOrPromise &&
            // 	typeof (oResourceBundleOrPromise as Promise<any>).then === "function"
            // ) {
            // 	(oResourceBundleOrPromise as Promise<any>).then(handleConfirm);
            // } else {
            // 	handleConfirm(oResourceBundleOrPromise);
            // }
        };
        Create.prototype.onSubmit = function () {
            var _this = this;
            var _a, _b;
            var oView = this.getView();
            var oRouter = this.getRouter();
            var oModel = oView.getModel();
            var oWizard = this.byId("wizardId");
            var oViewModelButtons = oView.getModel("viewModelButtons");
            var sOrderPath = (_a = oView.getBindingContext()) === null || _a === void 0 ? void 0 : _a.getPath();
            var oOrderId = (_b = sOrderPath === null || sOrderPath === void 0 ? void 0 : sOrderPath.match(/\((\d+)\)/)) === null || _b === void 0 ? void 0 : _b[1];
            if (sOrderPath) {
                this._selectedProducts.forEach(function (product) {
                    var oOrderDetail = {
                        OrderID: Number(oOrderId),
                        ProductID: product.ProductID,
                        UnitPrice: product.UnitPrice,
                        Quantity: String(product.Quantity),
                        Discount: "0",
                        Product: {
                            ProductID: product.ProductID,
                            ProductName: product.ProductName,
                            SupplierID: product.SupplierID,
                            CategoryID: product.CategoryID,
                            QuantityPerUnit: product.QuantityPerUnit,
                            UnitPrice: product.UnitPrice,
                            UnitsInStock: product.UnitsInStock,
                            UnitsOnOrder: product.UnitsOnOrder,
                            ReorderLevel: product.ReorderLevel,
                            Discontinued: product.Discontinued,
                            Category: product.Category,
                            Supplier: product.Supplier,
                        },
                    };
                    oModel.create("/Order_Details", oOrderDetail, {
                        success: function (oData) {
                            var oCurrentStep = _this.byId(oWizard.getCurrentStep());
                            oWizard.validateStep(oCurrentStep);
                            oWizard.discardProgress(oWizard.getSteps()[0], false);
                            var oComboBox = _this.byId("selectCustomer");
                            oComboBox.setSelectedKey("");
                            var oProductsTable = _this.byId("selectProducts");
                            oProductsTable.removeSelections(true);
                            oViewModelButtons.setProperty("/step", 0);
                            _this.isSubmitNav = true; // Set flag to true to prevent back navigation
                            oRouter.navTo("main");
                        },
                        error: function (oError) {
                            console.error();
                        },
                    });
                });
            }
        };
        Create.prototype._handleBackNavigation = function () {
            var _this = this;
            var oView = this.getView();
            var oRouter = this.getRouter();
            var oModel = oView.getModel();
            var oWizard = this.byId("wizardId");
            var oViewModelButtons = oView.getModel("viewModelButtons");
            var oResourceModel = this.getView().getModel("i18n");
            var oResourceBundleOrPromise = oResourceModel === null || oResourceModel === void 0 ? void 0 : oResourceModel.getResourceBundle();
            //const handleConfirm = (oResourceBundle: any) => {
            // MessageBox.confirm(
            // 	oResourceBundleOrPromise?.getText("cancelConfirmationText"),
            // 	{
            // 		title: oResourceBundleOrPromise?.getText("cancelMessasgeBoxTitle"),
            // 		actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            // 		emphasizedAction: MessageBox.Action.OK,
            // 		onClose: (sAction: string) => {
            // 			if (sAction === MessageBox.Action.OK) {
            oModel.remove(oView.getBindingContext().getPath(), {
                success: function () {
                    console.log("Order deleted successfully.");
                    oWizard.discardProgress(oWizard.getSteps()[0], false);
                    var oComboBox = _this.byId("selectCustomer");
                    oComboBox.setSelectedKey("");
                    var oProductsTable = _this.byId("selectProducts");
                    oProductsTable.removeSelections(true);
                    oViewModelButtons.setProperty("/step", 0);
                    // Avoid staying on create page after cancel via back
                    oRouter.navTo("main");
                },
                error: function () {
                    console.log("Failed to delete order.");
                },
            });
            // 			} else {
            // 				// Prevent going back if canceled
            // 				history.pushState(null, "", location.href);
            // 			}
            // 		},
            // 	}
            // );
            //};
            // if (
            // 	oResourceBundleOrPromise
            // 	// typeof (oResourceBundleOrPromise as Promise<any>).then === "function"
            // ) {
            // 	(oResourceBundleOrPromise as Promise<any>).then(handleConfirm);
            // } else {
            // 	handleConfirm(oResourceBundleOrPromise);
            // }
        };
        return Create;
    }(BaseController_1.default));
    exports.default = Create;
});
