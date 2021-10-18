//

window.onload = function(ev) {
	let map = L.map("map", {
		center: [ 51.781435604431195, 14.194335937500002 ],
		zoom: window.innerWidth < 575.98 ? 3 : 5,
		zoomControl: false,
		maxZoom: 18,
		timeDimension: true,
		timeDimensionOptions: {
			timeInterval: "P1D/2021-10-15",
			period: "PT5M"
		},
		//timeDimensionControl: true
	});

	/*map.addControl(
		L.control.zoom({ position: "topright" })
	);*/

	map.addControl(
		L.Control.zoomHome({ position: "topright" })
	);

	/*map.addControl(
		L.control.locate({ position: "topright" })
	);*/

	map.addControl(
		new L.Control.Fullscreen({ position: "topright" })
	);

	map.addControl(
		L.control.timeDimension({
			position: "bottomleft",
			loopButton: true,
			limitSliders: true, // TODO: fix width styling for this
			timeSliderDragUpdate: true,
			speedSlider: false,
			//minSpeed: 1,
			//maxSpeed: 5,
			//speedStep: 1,
			//timeSteps: 1,
			timeZones: [ "Local" ],
			playerOptions: {
				startOver: true
			}
		})
	);

	let OSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OSM</a>",
		subdomains: "abc"
	});
	map.addLayer(OSM);


	$("div.leaflet-control-attribution a").attr("target", "_blank");


	let icon = L.icon({
		iconUrl: 'assets/ivar_aasen.jpg',
		iconSize: [44, 44],
		iconAnchor: [11, 11]
	});

	let layer = L.geoJSON(_DATA, {
		pointToLayer: function(feature, latLng) {
			if (feature.properties.hasOwnProperty('last')) {
				return new L.Marker(latLng, {
					icon: icon
				});
			}
			return L.circleMarker(latLng);
		}
	});

	let tdLayer = L.timeDimension.layer.geoJson(layer, {
		updateTimeDimension: true,
		duration: "PT2M",
		updateTimeDimensionMode: "replace",
		addlastPoint: true
	});

	map.addLayer( layer );
	map.addLayer( tdLayer );
};
