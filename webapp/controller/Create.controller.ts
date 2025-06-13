import ColumnListItem from "sap/m/ColumnListItem";
import ComboBox from "sap/m/ComboBox";
import { SearchField$SearchEvent } from "sap/m/SearchField";
import StepInput from "sap/m/StepInput";
import Table from "sap/m/Table";
import Text from "sap/m/Text";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import BaseController from "./BaseController";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import ListBinding from "sap/ui/model/ListBinding";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { Order } from "ui5training/model/order";
import MessageBox from "sap/m/MessageBox";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { OrderDetails } from "ui5training/model/orderDetails";
import { SelectedProduct } from "ui5training/model/product";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace ui5training.controller
 */
export default class Create extends BaseController {
	private _selectedCustomer: any;
	private _selectedProducts: SelectedProduct[] = [];
	private _handleBackNavigationBound: () => void;
	private isSubmitNav: boolean = false;

	onInit(): void {
		const oRouter = this.getRouter();
		oRouter.getRoute("create").attachMatched(this.onRouteMatched, this);

		// Handle browser back button
		// this._handleBackNavigationBound = this._handleBackNavigation.bind(this);
		// window.addEventListener("popstate", this._handleBackNavigationBound);
		window.addEventListener("popstate", (event) => {
			event.preventDefault();
			// event.returnValue = "";
			if (!this.isSubmitNav) {
				this._handleBackNavigation();
			}
		});
	}

	onExit(): void {
		// if (this._handleBackNavigationBound) {
		// 	window.removeEventListener("popstate", this._handleBackNavigationBound);
		// }
		console.log();
	}

	onRouteMatched(oEvent: any): void {
		const oView = this.getView();
		const oModel = oView.getModel() as ODataModel;
		this.isSubmitNav = false; // Reset flag on route match

		const nOrderId = Math.floor(10000 + Math.random() * 90000);
		const oOrder: Order = {
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
			success: (oData: any) => {
				const sPath = (oView.getModel() as ODataModel).createKey("/Orders", {
					OrderID: oData.OrderID,
				});

				oView.bindElement(sPath, {
					success: (oData: any) => {
						console.log("success binding");
					},
					error: (oResponse: any) => {
						console.log("failed binding");
					},
				});
			},
			error: (oResponse: any) => {
				console.log("Failed to create order.");
			},
		});
	}

	navigationChange(Event: Event) {
		const oWizard = this.byId("wizardId") as Wizard;
		const oFromStep = this.byId(oWizard.getCurrentStep()) as WizardStep;
		const oToStep = (Event as any).getParameter("step") as WizardStep;
		const aSteps = oWizard.getSteps();
		const iFromIndex = aSteps.indexOf(oFromStep);
		const iToIndex = aSteps.indexOf(oToStep);

		const oResourceBundleOrPromise = (
			this.getView().getModel("i18n") as ResourceModel
		).getResourceBundle();

		const handleWarning = (oResourceBundle: any) => {
			const sText = oResourceBundle.getText("discardChangesText");

			if (iToIndex < iFromIndex) {
				MessageBox.warning(sText, {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: (sAction: string) => {
						if (sAction === MessageBox.Action.OK) {
							for (let i = iToIndex; i <= iFromIndex; i++) {
								oWizard.invalidateStep(aSteps[i]);
							}

							oWizard.discardProgress(oToStep, false);
							oWizard.goToStep(oToStep, false);

							const oView = this.getView();
							const oViewModel = oView.getModel(
								"viewModelButtons"
							) as JSONModel;

							if (iToIndex === 0) {
								const oProductsTable = this.byId("selectProducts") as Table;
								oProductsTable.removeSelections(true);

								oViewModel.setProperty("/step", iToIndex);
								this._selectedProducts = [];

								const oComboBox = this.byId("selectCustomer") as ComboBox;
								oComboBox.setSelectedKey("");
							} else if (iToIndex === 1) {
								oViewModel.setProperty("/step", iToIndex);
							}
						}
					},
				});

				Event.preventDefault?.();
			}
		};

		if (
			oResourceBundleOrPromise &&
			typeof (oResourceBundleOrPromise as Promise<any>).then === "function"
		) {
			(oResourceBundleOrPromise as Promise<any>).then(handleWarning);
		} else {
			handleWarning(oResourceBundleOrPromise);
		}
	}

	onCustomerSelected(oEvent: any): void {
		const oView = this.getView();
		const oModel = oView.getModel() as ODataModel;
		const oWizard = this.byId("wizardId") as Wizard;

		const oComboBox = oEvent.getSource() as ComboBox;
		const oSelectedItem = oComboBox.getSelectedItem();

		const oCurrentStep = this.byId(oWizard.getCurrentStep()) as WizardStep;

		if (oSelectedItem) {
			const sCustomerID = oSelectedItem.getKey();
			const sCompanyName = oSelectedItem.getText();
			const sOrderPath = oView.getBindingContext()?.getPath();
			const oContext = oSelectedItem.getBindingContext();
			const oCustomerData = oContext?.getObject();

			if (sOrderPath) {
				oModel.setProperty(`${sOrderPath}/CustomerID`, sCustomerID);
				oModel.setProperty(`${sOrderPath}/Customer/CompanyName`, sCompanyName);
				this._selectedCustomer = oCustomerData;
				oWizard.validateStep(oCurrentStep);
				oWizard.nextStep();
			}
		} else {
			oWizard.invalidateStep(oCurrentStep);
		}
	}

	onSearchProducts(event: SearchField$SearchEvent): void {
		// build filter array
		const filter = [];
		const query = event.getParameter("query");

		if (query) {
			const filters = [
				new Filter("ProductName", FilterOperator.Contains, query),
				new Filter("Category/CategoryName", FilterOperator.Contains, query),
			];

			// Combine filters using OR
			filter.push(
				new Filter({
					filters: filters,
					and: false,
				})
			);
		}

		// filter binding
		const list = this.byId("selectProducts");
		const binding = list?.getBinding("items") as ListBinding;
		binding?.filter(filter);
	}

	onProductSelect(): void {
		const oView = this.getView();
		const oModel = oView.getModel() as ODataModel;
		const oWizard = this.byId("wizardId") as Wizard;
		const oViewModelButtons = oView.getModel("viewModelButtons") as JSONModel;

		const oTable = this.byId("selectProducts") as Table;
		const aSelectedItems = oTable.getSelectedItems();

		const oCurrentStep = this.byId(oWizard.getCurrentStep()) as WizardStep;

		if (aSelectedItems.length > 0) {
			const aSelectedContexts = oTable.getSelectedContexts();
			const aSelectedProducts: SelectedProduct[] = aSelectedContexts.map(
				(ctx) => {
					const product = ctx.getObject() as SelectedProduct;
					const quantity = "1"; // Because Quantity is a string in my model

					return {
						...product,
						Quantity: quantity,
						TotalPrice: parseFloat(
							(parseFloat(product.UnitPrice) * parseFloat(quantity)).toFixed(2)
						),
					};
				}
			);

			this._selectedProducts = aSelectedProducts;

			const sOrderPath = oView.getBindingContext()?.getPath();
			if (sOrderPath) {
				oModel.setProperty(`${sOrderPath}`, aSelectedProducts);
			}

			oWizard.validateStep(oCurrentStep);

			const oNextStep = oWizard.getProgressStep();
			const iNextIndex = oWizard.getSteps().indexOf(oNextStep);
			oViewModelButtons.setProperty("/step", iNextIndex);
			console.log();
		} else {
			oWizard.invalidateStep(oCurrentStep);
		}
	}

	private _onQuantityChange(oEvent: any): void {
		const oItem = oEvent.getSource().getParent(); // ColumnListItem
		const oContext = oItem.getBindingContext("viewModel");
		const oProduct = oContext.getObject();

		oProduct.TotalPrice = oProduct.UnitPrice * oProduct.Quantity;

		const oModel = this.getView().getModel("viewModel") as JSONModel;
		oModel.refresh(true); // refresh binding

		const aProducts = oModel.getProperty("/selectedProducts");
		const total = aProducts.reduce(
			(sum: number, p: SelectedProduct) =>
				sum + (Number(p.TotalPrice.toFixed(2)) ?? 0),
			0
		);
		oModel.setProperty("/totalPrice", parseFloat(total).toFixed(2));
	}

	onNext(): void {
		const oWizard = this.byId("wizardId") as Wizard;
		const oCurrentStep = this.byId(oWizard.getCurrentStep()) as WizardStep;
		const oView = this.getView();
		const oViewModelButtons = oView.getModel("viewModelButtons") as JSONModel;

		// Update selected products to include TotalPrice
		this._selectedProducts = this._selectedProducts.map((product) => {
			const quantity = product.Quantity ?? 1;
			const unitPrice = product.UnitPrice ?? 0;

			return {
				...product,
				Quantity: String(quantity),
				TotalPrice: parseFloat(
					(Number(unitPrice) * Number(quantity)).toFixed(2)
				),
			};
		});

		// Calculate total
		const total = this._selectedProducts.reduce((sum, p) => {
			return sum + (p.TotalPrice ?? 0);
		}, 0);

		const oViewModel = new JSONModel({
			selectedProducts: this._selectedProducts,
			totalPrice: parseFloat(total.toFixed(2)),
		});

		this.getView().setModel(oViewModel, "viewModel");

		const oCustomerModel = new JSONModel(this._selectedCustomer);
		oView.setModel(oCustomerModel, "customerData");

		const oTableProd = this.byId("selectedProducts") as Table;
		oTableProd.setModel(oViewModel, "viewModel");
		oTableProd.bindItems({
			path: "viewModel>/selectedProducts",
			template: new ColumnListItem({
				cells: [
					new Text({
						text: "{viewModel>ProductName}",
					}),
					new Text({
						text: "{viewModel>Category/CategoryName}",
					}),
					new Text({
						text: "{viewModel>Category/Description}",
					}),
					new Text({
						text: "{viewModel>UnitPrice}",
					}),
					new Text({
						text: "{viewModel>QuantityPerUnit}",
					}),
					new StepInput({
						value: "{viewModel>Quantity}",
						min: 1,
						max: "{viewModel>UnitsInStock}",
						change: (oEvent) => this._onQuantityChange(oEvent),
					}),
					new Text({
						text: "{= (Number(${viewModel>UnitPrice} || 0) * Number(${viewModel>Quantity} || 0)).toFixed(2) + ' $'}",
					}),
				],
			}),
		});

		oWizard.validateStep(oCurrentStep);
		oWizard.nextStep();

		const oNextStep = oWizard.getProgressStep();
		const iNextIndex = oWizard.getSteps().indexOf(oNextStep);
		oViewModelButtons.setProperty("/step", iNextIndex);
	}

	onCancel(): void {
		const oView = this.getView();
		const oRouter = this.getRouter();
		const oModel = oView.getModel() as ODataModel;
		const oWizard = this.byId("wizardId") as Wizard;
		const oViewModelButtons = oView.getModel("viewModelButtons") as JSONModel;

		const oResourceModel = this.getView().getModel("i18n") as ResourceModel;
		const oResourceBundleOrPromise = oResourceModel?.getResourceBundle() as any;

		// const handleConfirm = (oResourceBundle: any) => {
		MessageBox.confirm(
			oResourceBundleOrPromise?.getText("cancelConfirmationText"),
			{
				title: oResourceBundleOrPromise?.getText("cancelMessasgeBoxTitle"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: (sAction: string) => {
					if (sAction === MessageBox.Action.OK) {
						oModel.remove(oView.getBindingContext().getPath(), {
							success: () => {
								console.log();
							},
							error: () => {
								console.log();
							},
						});

						oWizard.discardProgress(oWizard.getSteps()[0], false);

						const oComboBox = this.byId("selectCustomer") as ComboBox;
						oComboBox.setSelectedKey("");

						const oProductsTable = this.byId("selectProducts") as Table;
						oProductsTable.removeSelections(true);

						oViewModelButtons.setProperty("/step", 0);
						this.isSubmitNav = true; // Reset flag to allow back navigation
						oRouter.navTo("main");
					}
				},
			}
		);
		// };

		// if (
		// 	oResourceBundleOrPromise &&
		// 	typeof (oResourceBundleOrPromise as Promise<any>).then === "function"
		// ) {
		// 	(oResourceBundleOrPromise as Promise<any>).then(handleConfirm);
		// } else {
		// 	handleConfirm(oResourceBundleOrPromise);
		// }
	}

	onSubmit(): void {
		const oView = this.getView();
		const oRouter = this.getRouter();
		const oModel = oView.getModel() as ODataModel;
		const oWizard = this.byId("wizardId") as Wizard;
		const oViewModelButtons = oView.getModel("viewModelButtons") as JSONModel;
		const sOrderPath = oView.getBindingContext()?.getPath();
		const oOrderId = sOrderPath?.match(/\((\d+)\)/)?.[1];

		if (sOrderPath) {
			this._selectedProducts.forEach((product) => {
				const oOrderDetail: OrderDetails = {
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
					success: (oData: any) => {
						const oCurrentStep = this.byId(
							oWizard.getCurrentStep()
						) as WizardStep;
						oWizard.validateStep(oCurrentStep);

						oWizard.discardProgress(oWizard.getSteps()[0], false);

						const oComboBox = this.byId("selectCustomer") as ComboBox;
						oComboBox.setSelectedKey("");

						const oProductsTable = this.byId("selectProducts") as Table;
						oProductsTable.removeSelections(true);

						oViewModelButtons.setProperty("/step", 0);
						this.isSubmitNav = true; // Set flag to true to prevent back navigation
						oRouter.navTo("main");
					},
					error: (oError: any) => {
						console.error();
					},
				});
			});
		}
	}

	public _handleBackNavigation(): void {
		const oView = this.getView();
		const oRouter = this.getRouter();
		const oModel = oView.getModel() as ODataModel;
		const oWizard = this.byId("wizardId") as Wizard;
		const oViewModelButtons = oView.getModel("viewModelButtons") as JSONModel;

		const oResourceModel = this.getView().getModel("i18n") as ResourceModel;
		const oResourceBundleOrPromise = oResourceModel?.getResourceBundle() as any;

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
			success: () => {
				console.log("Order deleted successfully.");
				oWizard.discardProgress(oWizard.getSteps()[0], false);

				const oComboBox = this.byId("selectCustomer") as ComboBox;
				oComboBox.setSelectedKey("");

				const oProductsTable = this.byId("selectProducts") as Table;
				oProductsTable.removeSelections(true);

				oViewModelButtons.setProperty("/step", 0);

				// Avoid staying on create page after cancel via back
				oRouter.navTo("main");
			},
			error: () => {
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
	}
}
