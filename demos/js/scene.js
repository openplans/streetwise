var Sesame = Sesame || {};

(function($, S) {
  'use strict';

  S.Scene = function(spec, projection) {
    var self = {};

    self.projection = $.extend({
        XR_x: 1,     YR_x: 0,
        XR_y: 0,     YR_y: -1,
        XR_z: 0.707, YR_z: 0.707
      }, projection);

    /**
     * Set (or reset) the spec for the scene.
     */
    self.initialize = function(spec) {
      self.spec = spec;
    };

    /**
     * Render all of the objects in the scene.
     */
    self.render = function(t) {
      $.each(self.spec, function(i, thing) {
        var $els = $(thing.selector),
            x = thing.x,
            y = thing.y,
            xr_x = (thing.xr_x !== undefined ? thing.xr_x : self.projection.XR_x),
            yr_x = (thing.yr_x !== undefined ? thing.yr_x : self.projection.YR_x),
            xr_y = (thing.xr_y !== undefined ? thing.xr_y : self.projection.XR_y),
            yr_y = (thing.yr_y !== undefined ? thing.yr_y : self.projection.YR_y),
            xr_z = (thing.xr_z !== undefined ? thing.xr_z : self.projection.XR_z),
            yr_z = (thing.yr_z !== undefined ? thing.yr_z : self.projection.YR_z);

        // Each selector above may refer to multiple elements, so loop through
        // any that there are.
        $els.each(function(i, el) {
          var $el = $(el),
              z = ($.isFunction(thing.z) ? thing.z(i, $el) : thing.z);

          if (thing.label && thing.information) {
            self._setThingInformation(thing.label, thing.information, $el);
          }
          self._renderThing(t, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el);
        });
      });
    };

    /**
     * Render a single object.  Requires projection from the thing's world
     * coordinates into screen coordinates.
     *
     * s - The scroll offset of the window
     * x - starting x
     * y - starting y
     * z - time at which x,y will actually be there on the screen for realz
     *
     * xr_x - the rate of change of screen x position with respect to a unit
     *        of change in the isometric world's x axis.
     * yr_x - the rate of change of screen y position with respect to a unit
     *        of change in the isometric world's x axis.
     * xr_y - the rate of change of screen x position with respect to a unit
     *        of change in the isometric world's y axis.
     * yr_y - the rate of change of screen y position with respect to a unit
     *        of change in the isometric world's y axis.
     * xr_z - the rate of change of screen x position with respect to a unit
     *        of change in the isometric world's z axis.
     * yr_z - the rate of change of screen y position with respect to a unit
     *        of change in the isometric world's z axis.
     *
     * $el - jQuery object of the element we're positioning
     */
    self._renderThing = function(s, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el) {
      // Calculate the projected x (px) and y (py) values from the thing's
      // world x, y, and z values using the xr and yr components.  Offset the
      // z value by s.  This is the matrix transformation:
      //
      //              [xr_x, yr_x]
      //  [x, y, z] * [xr_y, yr_y] = [px, py]
      //              [xr_z, yr_z]
      //
      var px = x*xr_x + y*xr_y + z*xr_z - s*xr_z
        , py = x*yr_x + y*yr_y + z*yr_z - s*yr_z;

      $el.css({
        position: 'fixed',
        left: px+'px',
        top:  py+'px'
      });
    };

    /**
     * Initialize the information box for a scene object.
     */
    self._setThingInformation = function(label, information, $el) {
      $el.popover({
        title: function() { return label; },
        content: function() { return information; },
        trigger: 'manual',
        html: true,
        offset: 10
      });

      $el.click(function(evt) {
        self.hideAllPopovers();
        $el.popover('show');

        evt.stopPropagation();
      })
    };

    /**
     * Hide the popovers on any elements where they're visible.
     */
    self.hideAllPopovers = function() {
      $.each(self.spec, function(i, thing) {
        var $els = $(thing.selector);

        // Each selector above may refer to multiple elements, so loop through
        // any that there are.
        $els.each(function(i, el) {
          var $el = $(el);
          $el.popover('hide');
        });
      });
    };

    self.initialize(spec);
    return self;
  };


  S.SVGScene = function(spec, projection) {
    var self = S.Scene(spec, projection);

    self._renderThing = function(s, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el) {
      var xt = x*xr_x + y*xr_y + z*xr_z - s*xr_z
        , yt = x*yr_x + y*yr_y + z*yr_z - s*yr_z;

      $el
        .attr('x', xt+'px')
        .attr('y', yt+'px');
    }

    return self;
  }

})(jQuery, Sesame);
