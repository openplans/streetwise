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
            xr = thing.xr,
            yr = thing.yr;

        // Each selector above may refer to multiple elements, so loop through
        // any that there are.
        $els.each(function(i, el) {
          var $el = $(el),
              z = ($.isFunction(thing.z) ? thing.z(i, $el) : thing.z);

          if (thing.label && thing.information) {
            self._setThingInformation(thing.label, thing.information, $el);
          }
          self._renderThing(t, x, y, z, xr, yr, $el);
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
     *
     * xr - the rate of change of x with respect to s
     * yr - the rate of change of y wrt s
     *
     * $el - jQuery object of the element we're positioning
     */
    self._renderThing = function(s, x, y, z, xr, yr, $el) {
      var xt = x + (z - s) * xr
        , yt = y + (z - s) * yr;

      $el.css({
        position: 'fixed',
        left: xt+'px',
        top:  yt+'px'
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


  S.SVGScene = function(spec) {
    var self = S.Scene(spec);

    self._renderThing = function(s, x, y, z, xr, yr, $el) {
      var xt = x + (z - s) * xr
        , yt = y + (z - s) * yr;

      $el
        .attr('x', xt+'px')
        .attr('y', yt+'px');
    }

    return self;
  }

})(jQuery, Sesame);
