import JSONModel from "sap/ui/model/json/JSONModel";
import BindingMode from "sap/ui/model/BindingMode";

import Device from "sap/ui/Device";

export default {
	createDeviceModel: () => {
		const oModel = new JSONModel(Device);
		oModel.setDefaultBindingMode(BindingMode.OneWay);
		return oModel;
	},
	createViewModel: () => {
		const oModel = new JSONModel({
			step: 0,
			selectedProducts: [],
			totalPrice: 0,
		});
		return oModel;
	},
};
