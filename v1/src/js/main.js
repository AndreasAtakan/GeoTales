//

window.onload = function(ev) {
	let map = L.map("map", {
		center: [26.58852714730864, -6.152343750000001],
		zoom: 3,
		zoomControl: false,
		maxZoom: 18
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

	let OSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OSM</a>",
		subdomains: "abc"
	});
	map.addLayer(OSM);


	$("div.leaflet-control-attribution a").attr("target", "_blank");
};
