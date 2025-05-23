import MessageBox from "sap/m/MessageBox";
import BaseController from "./BaseController";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { SearchField$SearchEvent } from "sap/m/SearchField";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import type Table from "sap/m/Table";
import Event from "sap/ui/base/Event";
import UIComponent from "sap/ui/core/UIComponent";
import ObjectListItem from "sap/m/ObjectListItem";

/**
 * @namespace ui5training.controller
 */
export default class Main extends BaseController {
	public onInit(): void {
		console.log("Main controller initialized");
	}

	onSearchOrders(event: SearchField$SearchEvent): void {
		// build filter array
		const filter = [];
		const query = event.getParameter("query");

		if (query) {
			const filters = [
				new Filter("Customer/CompanyName", FilterOperator.Contains, query),
				new Filter("Employee/LastName", FilterOperator.Contains, query),
				new Filter("Shipper/CompanyName", FilterOperator.Contains, query),
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
		const list = this.byId("ordersView");
		const binding = list?.getBinding("items") as ListBinding;
		binding?.filter(filter);
	}

	onDeleteItems(event: Event): void {
		var oTable = this.byId("ordersView") as Table;
		var oModel = this.getView().getModel() as ODataModel;
		var oSelected = oTable.getSelectedItems();

		if (oSelected.length === 0) {
			MessageBox.show(this.getResourceBundle().getText("NoSelection"));
			return;
		}

		oSelected.forEach((oItem) => {
			const oContext = oItem.getBindingContext(); // get context for the item
			if (!oContext) return;

			const sPath = oContext.getPath(); // e.g. "/Orders(10248)"
			const oData = oModel.getProperty(sPath); // full object data

			oModel.remove(sPath, {
				success: () => {
					MessageBox.show(
						this.getResourceBundle().getText("Deleted") + ` ${sPath}`
					);
				},
				error: (err: any) => {
					// MessageBox.show(
					// 	this.getResourceBundle().getText("DeletedFailed") + ` ${sPath}`, err
					// );
					console.error("Failed to delete item" + ` ${sPath}`, err);
				},
			});
		});
		oTable.removeSelections();
	}

	onCreateItem(event: Event): void {
		const oRouter = UIComponent.getRouterFor(this);
		oRouter.navTo("create");
	}

	onPress(event: Event): void {
		// const item = event.getSource() as ObjectListItem;

		const oRouter = UIComponent.getRouterFor(this);
		oRouter.navTo("orderView");
		// , {
		// 	orderPath: window.encodeURIComponent(
		// 		item.getBindingContext("").getPath().substring(1)
		// 	),
		// });
	}
}
