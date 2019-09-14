Module.register("MMM-EMTValencia",{
	// Default module config.
	defaults: {
		stopNumber: 683,
		stopLine: null,
		updateInterval: 10
	},

	start: function() {

		var wrapper = document.createElement("div");
		wrapper.setAttribute("class", "EMTVALENCIA");
		wrapper.innerHTML = this.translate("WAIT_INFO");
		this.moduleContents = wrapper;

		this.sendSocketNotification("EMT_INIT", this.config);
		this.sendSocketNotification("EMT_LANGUAGE", config.language);
		
	},

	// Override dom generator.
	getDom: function() {
		return this.moduleContents;
	},

	getTranslations: function() {
		return {
				en: "translations/en.json",
				es: "translations/es.json",
				ca: "translations/ca.json"
		}
	},
	
	getStyles: function() {
		return [
			'font-awesome.css', // this file is available in the vendor folder, so it doesn't need to be available in the module folder.
			this.file('MMM-EMTValencia.css'), // this file will be loaded straight from the module folder.
		]
	},
	
	getHeader: function() {
		return this.data.header + " (" + this.translate("BUS_STOP") + ": " + this.config.stopNumber + ")";
	},

	socketNotificationReceived: function (notification, payload) {

		if (notification === "BUS_INFO"){

			var buses = "<table>";

			var mainDiv = document.createElement("div");
			mainDiv.setAttribute("class", "EMTVALENCIA");

			var dataDiv = document.createElement("div");
			dataDiv.setAttribute("class", "EMTestimaciones");
			mainDiv.appendChild(dataDiv);

			var updInfo = document.createElement("div");
			updInfo.setAttribute("class", "EMTupdated");
			mainDiv.appendChild(updInfo);

			Log.info(this.name + ': Info is being processed.');

			for(var i=0; i < payload.data.length; i++){

				var busEntity = payload.data[i].split("|");

				buses += '<tr><td id="nombre"><i class="fas fa-bus"></i> ' + busEntity[0].trim() + '</td><td id="tiempo">' + busEntity[1].trim() + "</td></tr>";

			}

			buses += "</table>";

			// if (payload.data.length == 0){ buses = "No hay estimaciones."; }

			var d = new Date();
			updInfo.innerHTML = this.translate("UPDATED") + ": " + d.toString().substring(0, d.toString().indexOf("GMT")).trim();

			dataDiv.innerHTML = buses;
			this.moduleContents = mainDiv;

			this.updateDom();

		} else { Log.info(this.name + ": Unknown notification received (module)."); }

	},
	
});