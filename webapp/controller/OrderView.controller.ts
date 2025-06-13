import UIComponent from "sap/ui/core/UIComponent";
import History from "sap/ui/core/routing/History";
import BaseController from "./BaseController";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace ui5training.controller
 */
export default class OrederView extends BaseController {
	onInit(): void {
		const oRouter = this.getRouter();
		oRouter.getRoute("orderView").attachMatched(this.onRouteMatched, this);
	}

	onRouteMatched(oEvent: any): void {
		const oArgs = oEvent.getParameter("arguments" as any);
		const sOrderID = oArgs.orderId;
		const oView = this.getView();
		const oModel = oView.getModel() as ODataModel;

		const sPath = oModel.createKey("/Orders", {
			OrderID: Number(sOrderID),
		});

		oView.bindElement({
			path: sPath,
			parameters: {
				expand: "Customer,Employee,Shipper",
			},
		});

		oModel.read("/Order_Details", {
			filters: [new Filter("OrderID", FilterOperator.EQ, sOrderID)],
			success: (oData: any) => {
				const aDetails = oData.results.map((entry: any) => {
					const price = Number(entry.UnitPrice) || 0;
					const quantity = Number(entry.Quantity) || 0;
					return {
						...entry,
						TotalAmount: (price * quantity).toFixed(2),
					};
				});

				const fTotal = aDetails.reduce((sum: number, item: any) => {
					return sum + Number(item.TotalAmount);
				}, 0);

				const oJSONModel = new JSONModel({
					items: aDetails,
					orderTotal: fTotal.toFixed(2),
				});

				oView.setModel(oJSONModel, "orderDetailsModel");
			},
		});
	}

	onNavBack(): void {
		const history = History.getInstance();
		const previousHash = history.getPreviousHash();

		if (previousHash !== undefined) {
			window.history.go(-1);
		} else {
			const router = UIComponent.getRouterFor(this);
			router.navTo("main", {}, true);
		}
	}
}
