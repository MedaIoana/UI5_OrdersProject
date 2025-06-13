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
import ColumnListItem from "sap/m/ColumnListItem";
import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

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

	async onDeleteItems(event: Event): Promise<void> {
		const oTable = this.byId("ordersView") as Table;
		const oModel = this.getView().getModel() as ODataModel;
		const oSelected = oTable.getSelectedItems();

		const i18nModel = this.getView().getModel("i18n") as ResourceModel;
		const bundle = await i18nModel.getResourceBundle();

		if (oSelected.length === 0) {
			MessageBox.information(bundle.getText("NoSelection"));
			return;
		}

		const deletePromises = oSelected.map((oItem) => {
			const oContext = oItem.getBindingContext();
			if (!oContext) return Promise.resolve();

			const sPath = oContext.getPath();

			return new Promise<void>((resolve, reject) => {
				oModel.remove(sPath, {
					success: () => resolve(),
					error: (err: any) => reject({ path: sPath, error: err }),
				});
			});
		});

		Promise.allSettled(deletePromises).then((results) => {
			const failed = results.filter((r) => r.status === "rejected");
			const successCount = results.length - failed.length;

			if (successCount > 0) {
				MessageBox.success(bundle.getText("Deleted") + ` ${successCount}`);
			}

			if (failed.length > 0) {
				const failedPaths = failed.map((r: any) => r.reason.path).join(", ");
				MessageBox.error(bundle.getText("DeletedFailed") + `: ${failedPaths}`);
			}

			oTable.removeSelections();
			this.onSelectionChange();
		});
	}

	onCreateItem(event: Event): void {
		const oRouter = UIComponent.getRouterFor(this);
		oRouter.navTo("create");
	}

	onPress(oEvent: Event): void {
		const oSelectedItem = oEvent.getSource() as ColumnListItem;
		const oContext = oSelectedItem.getBindingContext();

		let oOrder: any = oContext.getObject();
		let orderId = String(oOrder.OrderID);

		const oRouter = UIComponent.getRouterFor(this);
		oRouter.navTo("orderView", {
			orderId: orderId,
		});
	}

	onSelectionChange(): void {
		var oTable = this.byId("ordersView") as Table;
		var oSelected = oTable.getSelectedItems();
		const oButton = this.byId("deleteButton") as Button;

		if (oSelected.length > 0) {
			oButton.setEnabled();
		} else {
			oButton.setEnabled(false);
		}
	}
}
