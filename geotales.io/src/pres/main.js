!function(){"use strict";function t(e){return e?(e^16*Math.random()>>e/4).toString(16):"10000000-1000-4000-8000-100000000000".replace(/[018]/g,t)}function e(t){_OPTIONS=t.options,t.scenes.length<=0||(_SCENES.store.length<=0&&document.dispatchEvent(new Event("_setup")),_SCENES.importData(t.scenes),_TEXTBOXES.importData(t.textboxes),_MAP.importData(t.objects),_SCENES.current())}function o(t,e,o){let i=o*e;return i<=t?[i,e]:[t,t/o]}function i(){this.store=[],this.active="",this.setup=function(){$("#sceneNav #prev").click((t=>{_SCENES.prev()})),$("#sceneNav #next").click((t=>{_SCENES.next()})),this.bind()},this.reset=function(){},this.get=function(t){for(let e=0;e<this.store.length;e++){let o=Object.assign({},this.store[e]);if(o.id==t)return o.index=e,o}return null},this.getPrevScene=function(t){let e=this.get(t);if(e&&!(e.index<=0))return Object.assign({},this.store[e.index-1])},this.getNextScene=function(t){let e=this.get(t);if(e&&!(e.index>=this.store.length-1))return Object.assign({},this.store[e.index+1])},this.bind=function(){$("#bookmarks button#bookmark").off("click"),$("#bookmarks button#bookmark").click((t=>{this.set($(t.target).data("id"))})),$("#textbox #content img").off("click"),$("#textbox #content img").click((t=>{t.stopPropagation(),$("#imageModal img#imgPreview").attr("src",t.target.src),$("#imageModal").modal("show")}))},this.prev=function(){let t=this.getPrevScene(this.active);if(t)return this.set(t.id),t},this.current=function(){this.set(this.active)},this.next=function(){let t=this.getNextScene(this.active);if(t)return this.set(t.id),t},this.set=function(t){let e=this.get(t);this.active=t,_TEXTBOXES.set(e.id),_MAP.set(e.id),setTimeout((()=>{this.bind()}),151)},this.importData=function(t){if(!(t.length<=0)){(this.store.length<=0||!this.active)&&(this.active=t[0].id);for(let e=0;e<t.length;e++){let o=t[e],i=new s(o.id);i.bounds=o.bounds,i.wms=o.wms,i.basemap=o.basemap,i.bookmark=o.bookmark,i.title=o.title,i.bookmark&&$("#bookmarks ul").append(`\n\t\t\t\t\t<li><button type="button" class="dropdown-item" id="bookmark" data-id="${i.id}">${i.title||`Scene ${e+1}`}</button></li>\n\t\t\t\t`),this.store.push(i)}}}}function s(e){this.id=e||t(),this.bounds=null,this.wms=null,this.basemap=null,this.bookmark=!1,this.title=""}function n(){this.store=[],this.setup=function(){},this.reset=function(){},this.get=function(t){for(let e=0;e<this.store.length;e++){let o=Object.assign({},this.store[e]);if(o.sceneId==t)return o.index=e,o}return null},this.delete=function(t){let e=this.get(t);e.disable(),this.store.splice(e.index,1)},this.set=function(t){for(let e of this.store){if(e.sceneId==t){setTimeout((()=>{e.enable()}),150);break}e.disable()}},this.importData=function(t){if(!(t.length<=0))for(let e of t){let t=new a(e.id);t.sceneId=e.sceneId,t.locked=e.locked,t.pos=e.pos,t.dim=e.dim,t.content=e.content,t.disable(),this.store.push(t)}}}function a(e){this.id=e||t(),this.sceneId="",this.locked=!1,this.pos="left",this.dim=[0,.25],this.content="",this.setOrientation=function(){switch(this.pos){case"left":$("#textbox").css({left:"10px",right:"auto"});break;case"right":$("#textbox").css({left:"auto",right:"85px"})}},this.enable=function(){""!=this.content&&(this.setOrientation(),$("#textbox #content").html(this.content),this.dim&&$("#textbox").css({maxWidth:100*this.dim[1]+"%"}),$("#textbox").css("opacity",.85))},this.disable=function(){$("#textbox").css("opacity",0)}}L.Map.addInitHook((function(){this.setAspectRatio(),this.panLock=!0,this.isFullscreen=!1,this.basemap=_BASEMAPS[10].tiles,this.addLayer(this.basemap),this.wms={},this.objects=[],this.objectLayer=L.featureGroup(),this.addLayer(this.objectLayer),this.objectLayer.on("layeradd",(t=>{let e=t.layer,o=e.options.label;o&&(e.bindTooltip(o,{direction:"center",permanent:!0}),e instanceof L.ImageOverlay&&this.updateTooltip(e)),e.on("moveend",(t=>{this.updateTooltip(t.target)})),e instanceof L.ImageOverlay&&this.setIcon(e)})),this.objectLayer.on("layerremove",(t=>{let e=t.layer;e.closeTooltip(),e.unbindTooltip(),e.slideCancel()})),this.on("zoomend",(t=>{for(let t of this.getLayers())this.updateTooltip(t)})),this.on("zoom",(t=>{this._renderer&&this._renderer._reset()}))})),L.Map.include({setup:function(){$("div.leaflet-control-attribution a").prop("target","_blank"),$("#mapNav #zoomIn").click((t=>{this.zoomIn()})),$("#mapNav #zoomOut").click((t=>{this.zoomOut()})),$("#mapNav #panLock").click((t=>{let e="";this.panLock?(e="🔓",this.enable()):(e="🔒",this.disable(),this.fitBounds(_SCENES.get(_SCENES.active).bounds,{maxZoom:this.getMaxZoom(),noMoveStart:!0})),$(t.target).html(e),this.panLock=!this.panLock,$("#mapNav #zoomIn,\n\t\t\t   #mapNav #zoomOut").prop("disabled",this.panLock)})),this.disable()},reset:function(){this.clearLayers()},enable:function(){this.dragging.enable(),this.scrollWheelZoom.enable(),this.touchZoom.enable(),this.tapHold&&this.tapHold.enable(),this.doubleClickZoom.disable()},disable:function(){this.dragging.disable(),this.scrollWheelZoom.disable(),this.touchZoom.disable(),this.tapHold&&this.tapHold.disable(),this.doubleClickZoom.disable()},setAspectRatio:function(){let t=$("#main").outerWidth(),e=$("#main").outerHeight(),i=o(t,e,_OPTIONS.aspectratio),s=i[0]/t*100,n=i[1]/e*100,a=(t-i[0])/2/t*100,r=(e-i[1])/2/e*100;this.isFullscreen&&(s=100,n=100,a=0,r=0),$("#map").css({width:`${s}%`,height:`${n}%`,left:`${a}%`,top:`${r}%`}),$("#textbox").css({maxHeight:$(window).width()<=560?`calc(100% - ${n}% - 60px)`:""}),this.invalidateSize(),_SCENES.active&&this.setFlyTo(_SCENES.get(_SCENES.active).bounds)},setFlyTo:function(t){this.panLock&&this.flyToBounds(t,{maxZoom:this.getMaxZoom(),noMoveStart:!0,duration:_OPTIONS.panningspeed||null})},clearLayers:function(){this.objectLayer.clearLayers()},getLayers:function(){return this.objectLayer.getLayers()},setObjects:function(t){let e=this.getLayers().map((t=>{let e=this.extractObject(t);return{id:e.id,pos:e.pos,radius:e.radius,animationspeed:e.animationspeed}}));this.clearLayers();for(let o=0;o<this.objects.length;o++){let i=Object.assign({},this.objects[o]);if(i.sceneId==t){let t=i.pos,o=i.radius;for(let t of e)if(i.id==t.id){i.pos=t.pos,"circle"==i.type&&(i.radius=t.radius);break}let s=this.createObject(i);this.objectLayer.addLayer(s);for(let n of e)if(i.id==n.id){s.slideTo(t,{radius:o,duration:n.animationspeed||_OPTIONS.animationspeed});break}}}},set:function(t){let e=_SCENES.get(t);this.setBasemap(e.basemap),this.setWMS(e.wms),this.setObjects(t),this.setFlyTo(e.bounds)},setIcon:function(t,e,o){if(t instanceof L.ImageOverlay){if(e){let o=this.getZoom(),i=this.project(t.getBounds().getCenter(),o);t.setBounds([this.unproject([i.x-e[0]/2,i.y-e[1]/2],o),this.unproject([i.x+e[0]/2,i.y+e[1]/2],o)])}o&&t.setUrl(o),$(t._image).css("border-radius",t.options.rounded?"50%":"0"),$(t._image).css("border",`${t.options.borderThickness}px solid ${t.options.borderColor}`),$(t._image).css("filter",`\n\t\t\tblur(${t.options.overlayBlur}px)\n\t\t\tgrayscale(${100*t.options.overlayGrayscale}%)\n\t\t\tdrop-shadow(0 0 ${t.options.overlayBrightness}px yellow)\n\t\t\topacity(${100*(1-t.options.overlayTransparency)}%)\n\t\t`),t.options.label&&this.updateTooltip(t)}},updateTooltip:function(t){if(t.getTooltip()){if(t.closeTooltip(),t instanceof L.ImageOverlay){let e=this.latLngToContainerPoint(t.getBounds().getNorthWest()).distanceTo(this.latLngToContainerPoint(t.getBounds().getSouthWest()));t.getTooltip().options.offset=[0,e/2-10]}t.openTooltip()}},getWMS:function(){return this.wms?{type:"wms",url:this.wms._url,layers:this.wms.options.layers,format:this.wms.options.format,version:this.wms.options.version,transparent:this.wms.options.transparent}:null},setWMS:function(t){if(!t)return void(this.wms=this.wms?this.removeLayer(this.wms):null);if(this.wms&&(t.url||t._url)==this.wms._url&&(t.layers||t.options.layers)==this.wms.options.layers&&(t.format||t.options.format)==this.wms.options.format&&(t.version||t.options.version)==this.wms.options.version)return;let e;if(t instanceof L.TileLayer.WMS)e=t;else{if("wms"!=t.type)return;e=L.tileLayer.wms(t.url,{layers:t.layers,format:t.format,transparent:t.transparent,version:t.version,minZoom:t.minZoom||0,maxZoom:t.maxZoom||22,attribution:t.attribution||""})}this.wms&&this.removeLayer(this.wms),this.wms=e,this.addLayer(this.wms),this.wms.bringToFront()},getBasemap:function(){return this.basemap instanceof L.TileLayer?{type:"tiles",url:this.basemap._url,minZoom:this.basemap.options.minZoom,maxZoom:this.basemap.options.maxZoom,attribution:this.basemap.options.attribution}:this.basemap instanceof L.ImageOverlay?{type:"image",img:this.basemap._url}:null},setBasemap:async function(t){let e;if(t instanceof L.TileLayer){if(this.basemap instanceof L.TileLayer&&t._url==this.basemap._url)return;e=t}else if("tiles"==t.type){if(this.basemap instanceof L.TileLayer&&t.url==this.basemap._url)return;e=L.tileLayer(t.url,{minZoom:t.minZoom||0,maxZoom:t.maxZoom||22,attribution:t.attribution||`&copy; <a href="https://${_HOST}" target="_blank">GeoTales</a>`})}else{if("image"!=t.type)return;{if(this.basemap instanceof L.ImageOverlay&&t.img==this.basemap._url)return;let o=new Image;o.src=t.img,await o.decode();let i=o.width/o.height,s=_SCENES.get(_SCENES.active).bounds,n=[s[0],[]],a=this.latLngToContainerPoint(s[0]),r=this.latLngToContainerPoint(s[1]),l=r.y-a.y,c=r.x-a.x;if(i>=1){let t=this.containerPointToLatLng([r.x,a.y+c/i]);n[1][0]=t.lat,n[1][1]=t.lng}else{let t=this.containerPointToLatLng([a.x+i*l,r.y]);n[1][0]=t.lat,n[1][1]=t.lng}e=L.imageOverlay(t.img,n,{zIndex:0,minZoom:0,maxZoom:1e3,attribution:`&copy; <a href="https://${_HOST}" target="_blank">GeoTales</a>`})}}this.removeLayer(this.basemap),this.basemap=e,this.presetZoom(this.basemap.options.minZoom,this.basemap.options.maxZoom),this.addLayer(this.basemap),this.basemap.bringToBack(),$("div.leaflet-control-attribution a").prop("target","_blank")},resetBasemap:function(){this.setBasemap(_BASEMAPS[10].tiles)},presetZoom:function(t,e){let o=this.getZoom();(o<t||o>e)&&(o<t&&this.setZoom(t),o>e&&this.setZoom(e)),this.setMinZoom(t),this.setMaxZoom(e)},createObject:function(t){let e=null;switch(t.type){case"avatar":e=L.imageOverlay(t.icon,t.pos,{interactive:!1,zIndex:200,label:t.label,ratio:t.ratio,rounded:t.rounded,angle:t.angle,borderColor:t.borderColor,borderThickness:t.borderThickness,overlayBlur:t.blur,overlayBrightness:t.brightness,overlayGrayscale:t.grayscale,overlayTransparency:t.transparency});break;case"polyline":e=L.polyline(t.pos,{interactive:!1,label:t.label,dashArray:t.dashed?"5, 10":"",color:t.color,weight:t.thickness,opacity:1-t.transparency});break;case"polygon":e=L.polygon(t.pos,{interactive:!1,label:t.label,dashArray:t.dashed?"5, 10":"",color:t.lineColor,weight:t.lineThickness,opacity:1-t.lineTransparency,fillColor:t.fillColor,fillOpacity:1-t.fillTransparency});break;case"rectangle":e=L.rectangle(t.pos,{interactive:!1,label:t.label,dashArray:t.dashed?"5, 10":"",color:t.lineColor,weight:t.lineThickness,opacity:1-t.lineTransparency,fillColor:t.fillColor,fillOpacity:1-t.fillTransparency});break;case"circle":e=L.circle(t.pos,{interactive:!1,radius:t.radius,label:t.label,dashArray:t.dashed?"5, 10":"",color:t.lineColor,weight:t.lineThickness,opacity:1-t.lineTransparency,fillColor:t.fillColor,fillOpacity:1-t.fillTransparency});break;default:console.error("object type invalid")}return e.options.id=t.id,e.options.sceneId=t.sceneId,e},extractObject:function(t){let e=null;if(t instanceof L.ImageOverlay){let o=t.getBounds().getNorthWest(),i=t.getBounds().getSouthEast();e={id:t.options.id,sceneId:t.options.sceneId,type:"avatar",pos:[[o.lat,o.lng],[i.lat,i.lng]],label:t.options.label,icon:t._url,ratio:t.options.ratio,rounded:t.options.rounded,angle:0,borderColor:t.options.borderColor,borderThickness:t.options.borderThickness,blur:t.options.overlayBlur,grayscale:t.options.overlayGrayscale,brightness:t.options.overlayBrightness,transparency:t.options.overlayTransparency,animationspeed:t.options.animationspeed}}else if(t instanceof L.Polygon)e={id:t.options.id,sceneId:t.options.sceneId,type:t instanceof L.Rectangle?"rectangle":"polygon",pos:t.getLatLngs(),label:t.options.label,dashed:!!t.options.dashArray,lineColor:t.options.color,lineThickness:t.options.weight,lineTransparency:1-t.options.opacity,fillColor:t.options.fillColor,fillTransparency:1-t.options.fillOpacity,animationspeed:t.options.animationspeed};else if(t instanceof L.Polyline)e={id:t.options.id,sceneId:t.options.sceneId,type:"polyline",pos:t.getLatLngs(),label:t.options.label,dashed:!!t.options.dashArray,color:t.options.color,thickness:t.options.weight,transparency:1-t.options.opacity,animationspeed:t.options.animationspeed};else if(t instanceof L.Circle){let o=t.getLatLng();e={id:t.options.id,sceneId:t.options.sceneId,type:"circle",pos:[o.lat,o.lng],radius:t.getRadius(),label:t.options.label,dashed:!!t.options.dashArray,lineColor:t.options.color,lineThickness:t.options.weight,lineTransparency:1-t.options.opacity,fillColor:t.options.fillColor,fillTransparency:1-t.options.fillOpacity,animationspeed:t.options.animationspeed}}else console.error("object type invalid");return e},importData:function(t){for(let e=0;e<t.length;e++)this.objects.push(t[e])}}),window.onload=function(t){document.addEventListener("touchmove",(function(t){1!==t.scale&&t.preventDefault()}),!1);let o=!1;$(window).on("resize",(function(t){o||$(window).trigger("resizestart"),clearTimeout(o),o=setTimeout((function(){o=!1,$(window).trigger("resizeend")}),250)})).on("resizeend",(function(){_MAP.setAspectRatio()}));let s=null,a=t=>{$("#mapNav, #extraNav").css("opacity",t||0)};$(window).on("mousemove",(function(){a(1),clearTimeout(s),s=setTimeout(a,5e3)})),setTimeout(a,5e3),_SCENES=new i,$("#mapNav #fullscreen").click((t=>{if(_MAP.isFullscreen)document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen&&document.msExitFullscreen();else{let t=document.body;t.requestFullscreen?t.requestFullscreen():t.webkitRequestFullscreen?t.webkitRequestFullscreen():t.msRequestFullscreen&&t.msRequestFullscreen()}_MAP.isFullscreen=!_MAP.isFullscreen,_MAP.setAspectRatio()})),$(document).keydown((t=>{["ArrowUp","ArrowDown","ArrowRight","ArrowLeft","Space"].indexOf(t.code)>-1&&t.preventDefault()})),$(document).keyup((t=>{let e=t.code;["ArrowUp","ArrowLeft"].indexOf(e)>-1&&(t.preventDefault(),_SCENES.prev()),["ArrowDown","ArrowRight","Space"].indexOf(e)>-1&&(t.preventDefault(),_SCENES.next()),["ArrowUp","ArrowDown","ArrowRight","ArrowLeft","Space"].indexOf(e)>-1&&t.preventDefault()})),$("#shareModal input#linkInput").val(`https://${_HOST}/pres.php?id=${_ID}`),$("#shareModal a#facebook").prop("href",`https://www.facebook.com/sharer/sharer.php?u=https://${_HOST}/pres.php?id=${_ID}`),$("#shareModal a#twitter").prop("href",`https://twitter.com/intent/tweet?url=https://${_HOST}/pres.php?id=${_ID}&text=`),$("#shareModal a#linkedin").prop("href",`https://www.linkedin.com/shareArticle?mini=true&url=https://${_HOST}/pres.php?id=${_ID}`),$("#shareModal a#pinterest").prop("href",`https://pinterest.com/pin/create/button/?url=https://${_HOST}/pres.php?id=${_ID}&media=&description=`),$("#shareModal a#email").prop("href",`mailto:?&subject=&cc=&bcc=&body=https://${_HOST}/pres.php?id=${_ID}%0A`),$("#shareModal button#copyLink").click((t=>{navigator.clipboard.writeText($("#shareModal input#linkInput").val())})),$("#shareModal button#clone").click((t=>{$("#loadingModal").modal("show"),$.ajax({type:"POST",url:"api/map.php",data:{op:"clone",id:_ID,password:_PASSWORD},dataType:"json",success:function(t,e,o){window.location.assign(`edit.php?id=${t.id}`)},error:function(t,e,o){console.log(t.status,o),401==t.status?window.location.assign("settings.php"):setTimeout((function(){$("#loadingModal").modal("hide"),$("#shareModal").modal("hide"),$("#errorModal").modal("show")}),750)}})})),_TEXTBOXES=new n,_MAP=L.map("map",{center:[50,6],zoom:window.innerWidth<575.98?3:5,zoomControl:!1,maxZoom:18,doubleClickZoom:!1,zoomAnimationThreshold:100,wheelPxPerZoomLevel:1500,keyboard:!1,tap:!1,boxZoom:!1,contextmenu:!0,contextmenuItems:[{text:"Copy coordinates",callback:t=>{navigator.clipboard.writeText(`${t.latlng.lat}, ${t.latlng.lng}`)}},{text:"Center map here",callback:t=>{_MAP.panTo(t.latlng)}},"-",{text:"Zoom in",icon:"assets/zoom-in.png",callback:t=>{_MAP.zoomIn()}},{text:"Zoom out",icon:"assets/zoom-out.png",callback:t=>{_MAP.zoomOut()}}]}),document.addEventListener("_setup",(t=>{_MAP.setup(),_TEXTBOXES.setup(),_SCENES.setup()})),document.addEventListener("_reset",(t=>{_SCENES.reset(),_TEXTBOXES.reset(),_MAP.reset()})),setTimeout((function(){$("button#closeAd").css("display","block")}),5e3),$("button#closeAd").click((t=>{$("#adsense").css("display","none")})),$("#loadingModal").modal("show"),$.ajax({type:"GET",url:"api/map.php",data:{op:"read",id:_ID,password:""},dataType:"json",success:function(t,o,i){t.data&&e(JSON.parse(t.data)),setTimeout((function(){$("#loadingModal").modal("hide")}),750)},error:function(t,e,o){console.log(t.status,o),401==t.status?setTimeout((function(){$("#loadingModal").modal("hide"),$("#passwordModal").modal("show")}),750):setTimeout((function(){$("#loadingModal").modal("hide"),$("#errorModal").modal("show")}),750)}}),$("#passwordModal button#enter").click((t=>{let o=$("#passwordModal input#passwordInput").val();o=""===o?o:sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(o)),_PASSWORD=o,$("#passwordModal").modal("hide"),$("#loadingModal").modal("show"),$.ajax({type:"GET",url:"api/map.php",data:{op:"read",id:_ID,password:o},dataType:"json",success:function(t,o,i){t.data&&e(JSON.parse(t.data)),setTimeout((function(){$("#loadingModal").modal("hide")}),750)},error:function(t,e,o){console.log(t.status,o),setTimeout((function(){$("#loadingModal").modal("hide"),$("#errorModal").modal("show")}),750)}})}))}}();
//# sourceMappingURL=main.js.map
