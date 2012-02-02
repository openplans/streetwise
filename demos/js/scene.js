var Sesame = Sesame || {};

(function($, S) {
  'use strict';

  S.Scene = function(spec, selector, projection) {
    var self = {};

    self.selector = selector;

    self.projection = $.extend({
        XR_x: 1,     YR_x: 0,
        XR_y: 0,     YR_y: -1,
        XR_z: 0.707, YR_z: 0.707
      }, projection);

    /**
     * Set (or reset) the spec for the scene.
     */
    self.initialize = function(spec) {
      var $container = $(self.selector);
      $container.empty();

      self.spec = spec;

      // Initialize all the things
      $.each(spec.things, function(i, thing) {
        thing.$el = self._makeThingEelement(thing);
        $container.append(thing.$el);
      });

      // Initialize all the popups
      $.each(spec.popups, function(i, popup) {
        popup.$el = self._makePopup(popup);
      });
    };

    /**
     * Create a thing element to be added to the scene's parent.
     */
    self._makeThingEelement = function(thing) {
      var $template = $('#' + thing.type + '-template'),
          el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('class', thing.type);
      $(el).append($template.clone().attr('id', ''));

      return $(el);
    };

    /**
     * Create a popup from the spec information.  If there is a selector in the
     * popup data, create a popover with an arrow connected to the element(s)
     * referred to by the selector.  If there is no selector, create a modal
     * box.
     */
    self._makePopup = function(popup) {
      // If there's a selector specified, then use a bootstrap popover.
      if (popup.selector !== undefined) {
        var $els = $(popup.selector);
        $els.each(function(i, el) {
          var $el = $(el);
          $el.popover({
            title: function() { return popup.label; },
            content: function() { return popup.content; },
            trigger: 'manual',
            html: true,
            offset: 10
          });

          $el.click(function(evt) {
            self.hideAllPopovers();
            $el.popover('show');

            evt.stopPropagation();
          });
        });

        return;
      }

      // If there's no selector defined, use a modal.
      else {
        var $el = $('<div class="modal fade"><div class="modal-header"><h3>' + popup.label + '</h3></div><div class="modal-body">' + popup.content + '</div></div>');
        $el.modal();

        return $el;
      }
    };

    /**
     * Render all of the objects in the scene.
     */
    self.render = function(t) {
      $.each(self.spec.things, function(i, thing) {
        var $el = thing.$el,
            xr_x = (thing.xr_x !== undefined ? thing.xr_x : self.projection.XR_x),
            yr_x = (thing.yr_x !== undefined ? thing.yr_x : self.projection.YR_x),
            xr_y = (thing.xr_y !== undefined ? thing.xr_y : self.projection.XR_y),
            yr_y = (thing.yr_y !== undefined ? thing.yr_y : self.projection.YR_y),
            xr_z = (thing.xr_z !== undefined ? thing.xr_z : self.projection.XR_z),
            yr_z = (thing.yr_z !== undefined ? thing.yr_z : self.projection.YR_z),

            x = ($.isFunction(thing.x) ? thing.x(t, $el) : thing.x),
            y = ($.isFunction(thing.y) ? thing.y(t, $el) : thing.y),
            z = ($.isFunction(thing.z) ? thing.z(t, $el) : thing.z);

        self._renderThing(t, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el);
      });

      $.each(self.spec.popups, function(i, popup) {
        var $el = popup.$el;
        if (popup.start !== undefined && popup.end !== undefined) {
          self._renderPopup(t, popup.start, popup.end, $el);
        }
      });
    };

    self._renderPopup = function(t, start, end, $el) {
      if (t >= start && t < end) {
        if ($el.filter(":visible").length == 0)
          $el.modal('show');
      }

      else {
        if ($el.filter(":visible").length > 0)
          $el.modal('hide');
      }
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
      //                  [xr_x, yr_x]
      //  [x, y, (z-s)] * [xr_y, yr_y] = [px, py]
      //                  [xr_z, yr_z]
      //
      var px = x*xr_x + y*xr_y + (z-s)*xr_z
        , py = x*yr_x + y*yr_y + (z-s)*yr_z;

      $el.css({
        position: 'fixed',
        left: px+'px',
        top:  py+'px'
      });
    };

    /**
     * Hide the popovers on any elements where they're visible.
     */
    self.hideAllPopovers = function() {
      $.each(self.spec.popups, function(i, popup) {
        if (popup.selector === undefined) return;
        var $els = $(popup.selector);

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


  /**
   * A subclass of Scene that assumes an SVG context.
   */
  S.SVGScene = function(spec, selector, projection) {
    var self = S.Scene(spec, selector, projection);

    self._renderThing = function(s, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el) {
      // See the comment for Scene._renderThing(...) for more information.
      var px = x*xr_x + y*xr_y + (z-s)*xr_z
        , py = x*yr_x + y*yr_y + (z-s)*yr_z;

      $el
        .attr('x', px+'px')
        .attr('y', py+'px')
        .css('overflow', 'visible');

//      $el
//        .attr('transform', 'translate(' + px + ', ' + py + ')');
    }

    self._makeThingEelement = function(thing) {
      // See the comment for Scene._makeThingElement(...).  This version
      // assumes an SVG context.
      var $template = $('#' + thing.type + '-template'),
          el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('class', thing.type);
      $(el).append($template.clone().attr('id', ''));

      return $(el);
    };

    return self;
  }

})(jQuery, Sesame);
