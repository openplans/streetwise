var Sesame = Sesame || {};

(function($, S) {
  'use strict';

  /**
   * Constructs a Scene.
   *
     spec - The object that specifies the scene.  A spec has 'things' and
            'popups'.  A thing must at least have a position specified by x, y,
            and z coordinates, and a type string.  The type string will be used
            to find the template element for the thing.

            A popup must at least have a label and a content string. Also, it
            should either have a selector, or a pair of start and end times. If
            it has a selector, it will be constructed as a popover, attached to
            each of the elements identified by the selector. If it has no
            selector but has start and end, it will be constructed as a modal
            and appear when the time (scroll position) is between start and end.

     selector - The jQuery of the element that will serve as the container for
            the scene elements.

     projection - An object defining how scene coordinates should be translated
            into screen coordinates.
   */
  S.Scene = function(spec, selector, projection) {
    this.selector = selector;
    this.projection = $.extend({
        XR_x: 1,     YR_x: 0,
        XR_y: 0,     YR_y: -1,
        XR_z: 0.707, YR_z: 0.707
      }, projection);

    this.initialize(spec);
    return this;
  };

  $.extend(S.Scene.prototype, {

    /**
     * Set (or reset) the spec for the scene.
     */
    initialize: function(spec) {
      var self = this,
          $container = $(self.selector);

      $container.empty();
      self.spec = spec;

      // Initialize all the things
      $.each(spec.things, function(i, thing) {
        thing.$el = self._makeThingElement(thing);
        $container.append(thing.$el);
      });

      // Initialize all the messages
      $.each(spec.messages, function(i, message) {
        message.$el = self._makeMessage(message);
      });

      // Initialize all the bubbles
      $.each(spec.bubbles, function(i, bubble) {
        bubble.$el = self._makeBubble(bubble);
      });
    },

    /**
     * Create a thing element to be added to the scene's parent.  Derived
     * classes can override this method to use different elements to show the
     * scene things (i.e., for SVG, mobile, etc.).
     */
    _makeThingElement: function(thing) {
      console.error('_makeThingElement not implemented here');
      // See SVGScene._makeThingElement(...).
      //
      //var self = this;
      //return $(el);
    },

    /**
     * Create a popover with an arrow connected to the element(s) referred to by
     * the selector.
     */
    _makeBubble: function(popup) {
      var self = this;

      // If there's a selector specified, then use a bootstrap popover.
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

      return $els;
    },

    /**
     * Create a modal box.
     */
    _makeMessage: function(message) {
      var self = this,
          $el = $('<div class="modal fade">' +
                  '  <div class="modal-header">' +
                  '    <a class="close" data-dismiss="modal">&times;</a>' +
                  '    <h3>' + message.title + '</h3>' +
                  '  </div>' +
                  '  <div class="modal-body">' + message.content + '</div>' +
                  '</div>');

      $el.modal();
      return $el;
    },

    /**
     * Render all of the objects in the scene.
     */
    render: function(t) {
      var self = this;

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

      $.each(self.spec.messages, function(i, message) {
        var $el = message.$el;
        self._renderMessage(t, message.start, message.end, $el);
      });

      $.each(self.spec.bubbles, function(i, popup) {
        var $el = popup.$el;
        if (popup.start !== undefined && popup.end !== undefined) {
          self._renderBubble(t, popup.start, popup.end, $el);
        }
      });
    },

    _renderBubble: function(t, start, end, $el) {
      var self = this;

      if (t >= start && t < end) {
        if ($el.filter(":visible").length == 0)
          $el.popover('show');
      }

      else {
        if ($el.filter(":visible").length > 0)
          $el.popover('hide');
      }
    },

    _renderMessage: function(t, start, end, $el) {
      var self = this;

      if (t >= start && t < end) {
        if ($el.filter(":visible").length == 0)
          $el.modal('show');
      }

      else {
        if ($el.filter(":visible").length > 0)
          $el.modal('hide');
      }
    },

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
    _renderThing: function(s, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el) {
      // Calculate the projected x (px) and y (py) values from the thing's
      // world x, y, and z values using the xr and yr components.  Offset the
      // z value by s.  This is the matrix transformation:
      //
      //                  [xr_x, yr_x]
      //  [x, y, (z-s)] * [xr_y, yr_y] = [px, py]
      //                  [xr_z, yr_z]
      //
      var self = this
        , px = x*xr_x + y*xr_y + (z-s)*xr_z
        , py = x*yr_x + y*yr_y + (z-s)*yr_z;

      $el.css({
        position: 'fixed',
        left: px+'px',
        top:  py+'px'
      });
    },

    /**
     * Hide the popovers on any elements where they're visible.
     */
    hideAllPopovers: function() {
      var self = this;

      $.each(self.spec.bubbles, function(i, popup) {
        if (popup.selector === undefined) return;
        var $els = $(popup.selector);

        // Each selector above may refer to multiple elements, so loop through
        // any that there are.
        $els.each(function(i, el) {
          var $el = $(el);
          $el.popover('hide');
        });
      });
    }
  });


  /**
   * A subclass of Scene that assumes an SVG context.
   */
  S.SVGScene = function(spec, selector, projection) {
    return S.Scene.call(this, spec, selector, projection)
  };

  $.extend(S.SVGScene.prototype, S.Scene.prototype, {
    _renderThing: function(s, x, y, z, xr_x, yr_x, xr_y, yr_y, xr_z, yr_z, $el) {
      var self = this;

      // See the comment for Scene._renderThing(...) for more information.
      var px = x*xr_x + y*xr_y + (z-s)*xr_z
        , py = x*yr_x + y*yr_y + (z-s)*yr_z;

      $el
        .attr('x', px+'px')
        .attr('y', py+'px')
        .css('overflow', 'visible');
    },

    _makeThingElement: function(thing) {
      var self = this;

      // See the comment for Scene._makeThingElement(...).  This version
      // assumes an SVG context.
      var $template = $('#' + thing.type + '-template'),
          el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('class', thing.type);
      $(el).append($template.clone().attr('id', ''));

      return $(el);
    }
  });

})(jQuery, Sesame);
