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

let _MAP,
	_EVENTS = {};

const _THEMES = [
	{ name: "default",	style: "light",	primary: "#f2f2f2",	secondary: "#bfbfbf" },
	{ name: "hot",		style: "light",	primary: "#cc0000",	secondary: "#ffcc66" },
	{ name: "cold",		style: "light",	primary: "#ecf2f9",	secondary: "#336699" },
	{ name: "dark",		style: "dark",	primary: "#a6a6a6",	secondary: "#1a1a1a" }
];

const _BASEMAPS = [
	{ int: true,	name: "OpenStreetMap.Mapnik",			zoom: [0, 19],	preview: "https://b.tile.openstreetmap.org/5/15/10.png" },
	{ int: true,	name: "OpenStreetMap.DE",				zoom: [0, 18],	preview: "https://b.tile.openstreetmap.de/tiles/osmde/5/15/10.png" },
	{ int: true,	name: "OpenStreetMap.France",			zoom: [0, 20],	preview: "https://b.tile.openstreetmap.fr/osmfr/5/15/10.png" },
	{ int: true,	name: "OpenStreetMap.HOT",				zoom: [0, 19],	preview: "https://b.tile.openstreetmap.fr/hot/5/15/10.png" },
	{ int: true,	name: "OpenTopoMap",					zoom: [0, 17],	preview: "https://b.tile.opentopomap.org/5/15/10.png" },
	{ int: true,	name: "Stamen.Toner",					zoom: [0, 20],	preview: "https://stamen-tiles-b.a.ssl.fastly.net/toner/5/15/10.png" },
	{ int: true,	name: "Stamen.TonerLite",				zoom: [0, 20],	preview: "https://stamen-tiles-b.a.ssl.fastly.net/toner-lite/5/15/10.png" },
	{ int: true,	name: "Stamen.Watercolor",				zoom: [0, 16],	preview: "https://stamen-tiles-b.a.ssl.fastly.net/watercolor/5/15/10.png" },
	{ int: true,	name: "Stamen.Terrain",					zoom: [0, 14],	preview: "https://stamen-tiles-b.a.ssl.fastly.net/terrain/5/15/10.png" },
	{ int: true,	name: "Esri.WorldStreetMap",			zoom: [0, 18],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/5/10/15" },
	{ int: true,	name: "Esri.WorldTopoMap",				zoom: [0, 18],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/5/10/15" },
	{ int: true,	name: "Esri.WorldImagery",				zoom: [0, 18],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/15" },
	{ int: true,	name: "Esri.WorldTerrain",				zoom: [0, 13],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/5/10/15" },
	{ int: true,	name: "Esri.OceanBasemap",				zoom: [0, 13],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/5/10/15" },
	{ int: true,	name: "Esri.NatGeoWorldMap",			zoom: [0, 16],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/5/10/15" },
	{ int: true,	name: "Esri.WorldGrayCanvas",			zoom: [0, 16],	preview: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/5/10/15" },
	{ int: true,	name: "CartoDB.Positron",				zoom: [0, 20],	preview: "https://b.basemaps.cartocdn.com/light_all/5/15/10.png" },
	{ int: true,	name: "CartoDB.DarkMatter",				zoom: [0, 20],	preview: "https://b.basemaps.cartocdn.com/dark_all/5/15/10.png" },
	{ int: true,	name: "CartoDB.Voyager",				zoom: [0, 20],	preview: "https://b.basemaps.cartocdn.com/rastertiles/voyager/5/15/10.png" },
	{ int: true,	name: "HikeBike.HikeBike",				zoom: [0, 19],	preview: "https://tiles.wmflabs.org/hikebike/5/15/10.png" },
	{ int: true,	name: "NASAGIBS.ViirsEarthAtNight2012",	zoom: [1,  8],	preview: "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/5/10/15.jpg" },
	{ int: true,	name: "USGS.USTopo",					zoom: [0, 20],	preview: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/5/10/15" },
	{ int: true,	name: "USGS.USImagery",					zoom: [0, 20],	preview: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/5/10/15" },
	{ int: true,	name: "USGS.USImageryTopo",				zoom: [0, 20],	preview: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/5/10/15" },

	{ int: false,	name: "Google Maps – Streets",											url: "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",		zoom: [0, 20],	cc: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>",	preview: "https://mt2.google.com/vt/lyrs=m&x=15&y=10&z=5" },
	{ int: false,	name: "Google Maps – Hybrid",											url: "https://mt2.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",	zoom: [0, 20],	cc: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>",	preview: "https://mt2.google.com/vt/lyrs=s,h&x=15&y=10&z=5" },
	{ int: false,	name: "Google Maps – Satellite",										url: "https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",		zoom: [0, 20],	cc: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>",	preview: "https://mt2.google.com/vt/lyrs=s&x=15&y=10&z=5" },
	{ int: false,	name: "Google Maps – Terrain",											url: "https://mt2.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",		zoom: [0, 20],	cc: "&copy; <a href=\"https://www.google.com/intl/no_no/help/terms_maps/\">Google Maps</a>",	preview: "https://mt2.google.com/vt/lyrs=p&x=15&y=10&z=5" },
	{ int: false,	name: "University of Gothenburg – Digital Atlas of the Roman Empire",	url: "https://dh.gu.se/tiles/imperium/{z}/{x}/{y}.png",			zoom: [4, 11],	cc: "&copy; <a href=\"https://dh.gu.se/dare/\">University of Gothenburg</a>",					preview: "https://dh.gu.se/tiles/imperium/4/8/5.png" }
];
