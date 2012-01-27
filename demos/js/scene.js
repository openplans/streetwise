var Sesame = Sesame || {};

(function($, S) {
  'use strict';

  S.Scene = function(spec) {
    var self = {};

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
            angle = thing.angle;

        // Each selector above may refer to multiple elements, so loop through
        // any that there are.
        $els.each(function(i, el) {
          var $el = $(el),
              z = ($.isFunction(thing.z) ? thing.z(i, $el) : thing.z);

          self._renderThing(t, x, y, z, angle, $el);
        });
      });
    };

    /**
     * Render a single object.
     *
     * s - The scroll offset of the window
     * x - starting x
     * y - starting y
     * z - time at which x,y will actually be there on the screen for realz
     * angle - the direction that $el is moving
     * $el - jQuery object of the element we're positioning
     */
    self._renderThing = function(s, x, y, z, angle, $el) {
      var yRate = 1
        , xRate = yRate * Math.tan(angle * Math.PI / 180)

        , xt = x + (z - s) * xRate
        , yt = y + (z - s) * yRate;

      $el.css({
        position: 'fixed',
        left: xt+'px',
        top:  yt+'px'
      });
    };

    self.initialize(spec);
    return self;
  };

})(jQuery, Sesame);
