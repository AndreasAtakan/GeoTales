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

let _FONT,
	_BASEMAP,
	_CLUSTERING,
	_SCENES = [],
	_PINNED_MARKER;

let _MAP,
	_EVENTS = {};

const _BASEMAPS = [
	{ name: "OpenStreetMap.Mapnik", url: "https://b.tile.openstreetmap.org/5/15/10.png" },
	{ name: "OpenStreetMap.DE", url: "https://b.tile.openstreetmap.de/tiles/osmde/5/15/10.png" },
	{ name: "OpenStreetMap.France", url: "https://b.tile.openstreetmap.fr/osmfr/5/15/10.png" },
	{ name: "OpenStreetMap.HOT", url: "https://b.tile.openstreetmap.fr/hot/5/15/10.png" },
	{ name: "OpenTopoMap", url: "https://b.tile.opentopomap.org/5/15/10.png" },
	{ name: "Stamen.Toner", url: "https://stamen-tiles-b.a.ssl.fastly.net/toner/5/15/10.png" },
	{ name: "Stamen.TonerLite", url: "https://stamen-tiles-b.a.ssl.fastly.net/toner-lite/5/15/10.png" },
	{ name: "Stamen.Watercolor", url: "https://stamen-tiles-b.a.ssl.fastly.net/watercolor/5/15/10.png" },
	{ name: "Stamen.Terrain", url: "https://stamen-tiles-b.a.ssl.fastly.net/terrain/5/15/10.png" },
	{ name: "Esri.WorldStreetMap", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/5/10/15" },
	{ name: "Esri.WorldTopoMap", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/5/10/15" },
	{ name: "Esri.WorldImagery", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/15" },
	{ name: "Esri.WorldTerrain", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/5/10/15" },
	{ name: "Esri.OceanBasemap", url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/5/10/15" },
	{ name: "Esri.NatGeoWorldMap", url: "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/5/10/15" },
	{ name: "Esri.WorldGrayCanvas", url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/5/10/15" },
	{ name: "CartoDB.Positron", url: "https://b.basemaps.cartocdn.com/light_all/5/15/10.png" },
	{ name: "CartoDB.DarkMatter", url: "https://b.basemaps.cartocdn.com/dark_all/5/15/10.png" },
	{ name: "CartoDB.Voyager", url: "https://b.basemaps.cartocdn.com/rastertiles/voyager/5/15/10.png" },
	{ name: "HikeBike.HikeBike", url: "https://tiles.wmflabs.org/hikebike/5/15/10.png" },
	{ name: "NASAGIBS.ViirsEarthAtNight2012", url: "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/5/10/15.jpg" },
	{ name: "USGS.USTopo", url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/5/10/15" },
	{ name: "USGS.USImagery", url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/5/10/15" },
	{ name: "USGS.USImageryTopo", url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/5/10/15" }
];
