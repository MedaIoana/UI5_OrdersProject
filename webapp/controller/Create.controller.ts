import { SearchField$SearchEvent } from "sap/m/SearchField";
import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

/**
 * @namespace ui5training.controller
 */
export default class Create extends Controller {
	onInit(): void {
		const oRouter = UIComponent.getRouterFor(this);
		oRouter.getRoute("create").attachPatternMatched(this.onRouteMatched, this);
	}

	onRouteMatched(oEvent: any): void {}

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
}
