/*©agpl*************************************************************************
*                                                                              *
* TellUs                                                                       *
* Copyright (C) 2021  TellUs AS                                                *
*                                                                              *
* This program is free software: you can redistribute it and/or modify         *
* it under the terms of the GNU Affero General Public License as published by  *
* the Free Software Foundation, either version 3 of the License, or            *
* (at your option) any later version.                                          *
*                                                                              *
* This program is distributed in the hope that it will be useful,              *
* but WITHOUT ANY WARRANTY; without even the implied warranty of               *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 *
* GNU Affero General Public License for more details.                          *
*                                                                              *
* You should have received a copy of the GNU Affero General Public License     *
* along with this program. If not, see <http://www.gnu.org/licenses/>.         *
*                                                                              *
*****************************************************************************©*/

"use strict";

let _CLUSTERING = "default",
	_AVATARSPEED = 2000,
	_PANNINGSPEED,
	_FONT = "inherit",
	_THEME = "default",
	_SCENES = [];

let _EVENTS = {},
	_MAP,
	_IS_MAP_MOVING = false;

/*const _THEMES = [
	{ name: "default",	style: "light",	primary: "#f2f2f2",	secondary: "#bfbfbf" },
	{ name: "hot",		style: "light",	primary: "#cc0000",	secondary: "#ffcc66" },
	{ name: "cold",		style: "light",	primary: "#ecf2f9",	secondary: "#336699" },
	{ name: "dark",		style: "dark",	primary: "#a6a6a6",	secondary: "#1a1a1a" }
];*/

const _BASEMAPS = [
	{ name: "OpenStreetMap",		tiles: L.tileLayer.provider("OpenStreetMap.Mapnik",				{ minZoom: 0, maxZoom: 19 }),	preview: "https://b.tile.openstreetmap.org/5/15/10.png" },
	{ name: "OpenStreetMap.DE",		tiles: L.tileLayer.provider("OpenStreetMap.DE",					{ minZoom: 0, maxZoom: 18 }),	preview: "https://b.tile.openstreetmap.de/tiles/osmde/5/15/10.png" },
	{ name: "OpenStreetMap.FR",		tiles: L.tileLayer.provider("OpenStreetMap.France",				{ minZoom: 0, maxZoom: 20 }),	preview: "https://b.tile.openstreetmap.fr/osmfr/5/15/10.png" },
	{ name: "OpenStreetMap.HOT",	tiles: L.tileLayer.provider("OpenStreetMap.HOT",				{ minZoom: 0, maxZoom: 19 }),	preview: "https://b.tile.openstreetmap.fr/hot/5/15/10.png" },
	{ name: "OpenTopoMap",			tiles: L.tileLayer.provider("OpenTopoMap",						{ minZoom: 0, maxZoom: 17 }),	preview: "https://b.tile.opentopomap.org/5/15/10.png" },
	{ name: "Stamen.Toner",			tiles: L.tileLayer.provider("Stamen.Toner",						{ minZoom: 0, maxZoom: 20 }),	preview: "https://stamen-tiles-b.a.ssl.fastly.net/toner/5/15/10.png" },
	{ name: "Stamen.TonerLite",		tiles: L.tileLayer.provider("Stamen.TonerLite",					{ minZoom: 0, maxZoom: 20 }),	preview: "https://stamen-tiles-b.a.ssl.fastly.net/toner-lite/5/15/10.png" },
	{ name: "Stamen.Watercolor",	tiles: L.tileLayer.provider("Stamen.Watercolor",				{ minZoom: 0, maxZoom: 16 }),	preview: "https://stamen-tiles-b.a.ssl.fastly.net/watercolor/5/15/10.png" },
	{ name: "Stamen.Terrain",		tiles: L.tileLayer.provider("Stamen.Terrain",					{ minZoom: 0, maxZoom: 14 }),	preview: "https://stamen-tiles-b.a.ssl.fastly.net/terrain/5/15/10.png" },
	{ name: "Esri.StreetMap",		tiles: L.tileLayer.provider("Esri.WorldStreetMap",				{ minZoom: 0, maxZoom: 18 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/5/10/15" },
	{ name: "Esri.TopoMap",			tiles: L.tileLayer.provider("Esri.WorldTopoMap",				{ minZoom: 0, maxZoom: 18 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/5/10/15" },
	{ name: "Esri.Imagery",			tiles: L.tileLayer.provider("Esri.WorldImagery",				{ minZoom: 0, maxZoom: 18 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/15" },
	{ name: "Esri.Terrain",			tiles: L.tileLayer.provider("Esri.WorldTerrain",				{ minZoom: 0, maxZoom: 13 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/5/10/15" },
	{ name: "Esri.OceanBasemap",	tiles: L.tileLayer.provider("Esri.OceanBasemap",				{ minZoom: 0, maxZoom: 13 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/5/10/15" },
	{ name: "Esri.NatGeo",			tiles: L.tileLayer.provider("Esri.NatGeoWorldMap",				{ minZoom: 0, maxZoom: 12 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/5/10/15" },
	{ name: "Esri.GrayCanvas",		tiles: L.tileLayer.provider("Esri.WorldGrayCanvas",				{ minZoom: 0, maxZoom: 16 }),	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/5/10/15" },
	{ name: "CartoDB.Positron",		tiles: L.tileLayer.provider("CartoDB.Positron",					{ minZoom: 0, maxZoom: 20 }),	preview: "https://b.basemaps.cartocdn.com/light_all/5/15/10.png" },
	{ name: "CartoDB.DarkMatter",	tiles: L.tileLayer.provider("CartoDB.DarkMatter",				{ minZoom: 0, maxZoom: 20 }),	preview: "https://b.basemaps.cartocdn.com/dark_all/5/15/10.png" },
	{ name: "CartoDB.Voyager",		tiles: L.tileLayer.provider("CartoDB.Voyager",					{ minZoom: 0, maxZoom: 20 }),	preview: "https://b.basemaps.cartocdn.com/rastertiles/voyager/5/15/10.png" },
	{ name: "HikeBike",				tiles: L.tileLayer.provider("HikeBike.HikeBike",				{ minZoom: 0, maxZoom: 19 }),	preview: "https://tiles.wmflabs.org/hikebike/5/15/10.png" },
	{ name: "NASA.EarthAtNight",	tiles: L.tileLayer.provider("NASAGIBS.ViirsEarthAtNight2012",	{ minZoom: 0, maxZoom:  8 }),	preview: "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/5/10/15.jpg" },
	{ name: "USGS.Topo",			tiles: L.tileLayer.provider("USGS.USTopo",						{ minZoom: 0, maxZoom: 16 }),	preview: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/5/10/15" },
	{ name: "USGS.Imagery",			tiles: L.tileLayer.provider("USGS.USImagery",					{ minZoom: 0, maxZoom: 16 }),	preview: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/5/10/15" },
	{ name: "USGS.ImageryTopo",		tiles: L.tileLayer.provider("USGS.USImageryTopo",				{ minZoom: 0, maxZoom: 16 }),	preview: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/5/10/15" },

	{ name: "Google Maps – Streets",				tiles: L.tileLayer("https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",								{ minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>" }),	preview: "https://mt2.google.com/vt/lyrs=m&x=15&y=10&z=5" },
	{ name: "Google Maps – Hybrid",					tiles: L.tileLayer("https://mt2.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",								{ minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>" }),	preview: "https://mt2.google.com/vt/lyrs=s,h&x=15&y=10&z=5" },
	{ name: "Google Maps – Satellite",				tiles: L.tileLayer("https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",								{ minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>" }),	preview: "https://mt2.google.com/vt/lyrs=s&x=15&y=10&z=5" },
	{ name: "Google Maps – Terrain",				tiles: L.tileLayer("https://mt2.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",								{ minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>" }),	preview: "https://mt2.google.com/vt/lyrs=p&x=15&y=10&z=5" },
	{ name: "Google – Star map",					tiles: L.tileLayer("https://mw1.google.com/mw-planetary/sky/skytiles_v1/{x}_{y}_{z}.jpg",				{ minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/sky/\">Google Sky</a>" }),						preview: "https://mw1.google.com/mw-planetary/sky/skytiles_v1/15_9_5.jpg" },
	{ name: "Google – Lunar surface",				tiles: L.tileLayer("https://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw/{z}/{x}/{y}.jpg",	{ tms: true, minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/moon/\">Google Moon</a>" }),			preview: "https://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw/5/15/21.jpg" },
	{ name: "Google – Lunar elevation",				tiles: L.tileLayer("https://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/terrain/{z}/{x}/{y}.jpg",	{ tms: true, minZoom: 0, maxZoom: 20, attribution: "&copy; <a href=\"https://www.google.com/moon/\">Google Moon</a>" }),			preview: "https://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/terrain/5/18/19.jpg" },
	{ name: "Digital Atlas of the Roman Empire",	tiles: L.tileLayer("https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png",									{ minZoom: 4, maxZoom: 11, attribution: "&copy; <a href=\"https://dh.gu.se/dare/\">University of Gothenburg</a>" }),				preview: "https://dh.gu.se/tiles/imperium/4/8/5.png" }
];
