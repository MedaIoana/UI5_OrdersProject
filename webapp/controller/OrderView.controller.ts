import Controller from "sap/ui/core/mvc/Controller";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace ui5training.controller
 */
export default class OrederView extends Controller {
	onInit(): void {
		const oRouter = UIComponent.getRouterFor(this);
		oRouter
			.getRoute("orderView")
			.attachPatternMatched(this.onRouteMatched, this);
	}

	onRouteMatched(oEvent: any): void {}

	// onRouteMatched(event: Route$PatternMatchedEvent): void {
	// this.getView().bindElement({
	// 	path:
	// 		"/" +
	// 		window.decodeURIComponent(
	// 			(event.getParameter("arguments") as any).orderPath
	// 		),
	// 	model: "",
	// });
	// }
}
