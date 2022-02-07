
// 🍂class ImageOverlay

L.ImageOverlay.include({

	_slideToUntil:    undefined,
	_slideToDuration: undefined,
	_slideToBounds:   undefined,
	_slideFromBounds: undefined,
	_slideDraggingWasAllowed: undefined,

	// 🍂method slideTo(bounds: Bounds, options: Slide Options): this
	// Moves this imageOverlay until `bounds`, like `setBounds()`, but with a smooth
	// sliding animation. Fires `movestart` and `moveend` events.
	slideTo: function slideTo(bounds, options) {
		if (!this._map) return;

		this._slideToDuration = options.duration;
		this._slideToUntil    = performance.now() + options.duration;
		this._slideFromBounds = this.getBounds();
		this._slideToBounds   = bounds;
		this._slideDraggingWasAllowed =
			this._slideDraggingWasAllowed !== undefined ?
				this._slideDraggingWasAllowed :
				this._map.dragging.enabled();

		this.fire('movestart');
		this._slideTo();

		return this;
	},

	// 🍂method slideCancel(): this
	// Cancels the sliding animation from `slideTo`, if applicable.
	slideCancel: function slideCancel() {
		L.Util.cancelAnimFrame(this._slideFrame);
	},

	_slideTo: function _slideTo() {
		if (!this._map) return;

		var remaining = this._slideToUntil - performance.now();

		if (remaining < 0) {
			this.setBounds(this._slideToBounds);
			this.fire("moveend");
			if (this._slideDraggingWasAllowed ) {
				this._map.dragging.enable();
				this._map.doubleClickZoom.enable();
				this._map.options.touchZoom = true;
				this._map.options.scrollWheelZoom = true;
			}
			this._slideDraggingWasAllowed = undefined;
			return this;
		}

		var zoom = this._map.getZoom(), b;
		b = [ this._slideFromBounds.getNorthWest(), this._slideFromBounds.getSouthEast() ].map(p => this._map.project(p, zoom));
		var startSize = [ b[1].x - b[0].x, b[1].y - b[0].y ];
		b = [ this._slideToBounds.getNorthWest(), this._slideToBounds.getSouthEast() ].map(p => this._map.project(p, zoom));
		var endSize = [ b[1].x - b[0].x, b[1].y - b[0].y ];

		var startPoint = this._map.latLngToContainerPoint( this._slideFromBounds.getCenter() );
		var endPoint   = this._map.latLngToContainerPoint( this._slideToBounds.getCenter() );
		var percentDone = (this._slideToDuration - remaining) / this._slideToDuration;

		var currSize = [
			endSize[0] * percentDone + startSize[0] * (1 - percentDone),
			endSize[1] * percentDone + startSize[1] * (1 - percentDone)
		];
		var currPoint = endPoint.multiplyBy(percentDone).add(
			startPoint.multiplyBy(1 - percentDone)
		);
		var currBounds = [
			this._map.containerPointToLatLng([ currPoint.x - currSize[0] / 2, currPoint.y - currSize[1] / 2 ]),
			this._map.containerPointToLatLng([ currPoint.x + currSize[0] / 2, currPoint.y + currSize[1] / 2 ])
		];
		this.setBounds(currBounds);

		this._slideFrame = L.Util.requestAnimFrame(this._slideTo, this);
	}

});

L.ImageOverlay.addInitHook(function(){
	this.on('move', this.slideCancel, this);
});

/*
🍂miniclass Slide options (ImageOverlay)
🍂section

🍂option duration: Number = 1000
Duration of the sliding animation, in milliseconds.

*/
