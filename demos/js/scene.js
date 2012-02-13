var Sesame = Sesame || {};

(function($, S) {
  'use strict';

  /**
   * Constructs a Scene.
   *
     spec
        The object that specifies the scene. A spec has 'things', 'messages',
        and 'bubbles'. A thing must at least have a position specified by x, y,
        and z coordinates, and a type string. The type string will be used to
        find the template element for the thing.

        A message must at least have a label, a content string, and a pair of
        start and end times. The message will be constructed as a modal and
        appear when the time (scroll position) is between start and end.

        A bubble must at least have a label, a content string, and a selector
        designating an element or set of elements that the bubble should be
        attached to. It can also have a pair of start and end times. It will be
        constructed as a popover, attached to each of the elements identified by
        its selector. If it has a start and end, it will be appear when the time
        (scroll position) is between start and end. Otherwise it will appear
        when the user clicks on one of the selected elements.

     selector
        The jQuery of the element that will serve as the container for the scene
        elements.

     projection
        An object defining how scene coordinates should be translated into
        screen coordinates.
   */
  S.Scene = function(spec, selector, scrollSpeed, projection, velocity) {
    this.selector = selector;

    this.projection = $.extend({
        xr_x: 1,     yr_x: 0,
        xr_y: 0,     yr_y: -1,
        xr_z: 0.707, yr_z: 0.707
      }, projection);

    this.velocity = $.extend({
        x: 0, y:0, z:1
      }, velocity);
    
    this.speed = scrollSpeed;

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

      // Initialize all the anchors (that didn't come with messages)
      $.each(spec.anchors, function(i, anchor) {
        anchor.$el = self._makeAnchor(anchor.name, anchor.position);
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
        $el.popover($.extend({
          title: (popup.label ? function() { return popup.label; } : undefined),
          content: (popup.content ? function() { return popup.content; } : undefined),
          trigger: 'manual',
          html: true,
          offset: 10
        }, popup.options));

        $el.click(function(evt) {
          self.hideAllPopovers();
          $el.popover('show');

          evt.stopPropagation();
        });
      });

      return $els;
    },

    /**
     * Create a scene anchor.  The scene will handle smoothly scrolling to
     * these anchors.
     */
    _makeAnchor: function(name, s) {
      // Project the point (x=0, y=0, z=t) at t=0 into screen coordinates
      // to find the scroll position for the anchor.
      var x = 0, y = 0, z = s, t = 0
        , p = this._project(t, x, y, z)

        , anchor = $('<div class="anchor"></div>')
            .addClass(name)
            .css({
                position: 'absolute',
                left: '0px',
                top: s / this.speed + 'px'
              });
      
      console.log(s)
      console.log(this.speed);
      
      $('body').append(anchor);
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

      $el.css(message.style || {});

      if (message.anchorName) {
        self._makeAnchor(message.anchorName, message.start);
      }

      return $el;
    },

    /**
     * Render all of the objects in the scene.
     */
    render: function(ps) {
      var self = this
        , s = ps * self.speed;

      $.each(self.spec.things, function(i, thing) {
        var $el = thing.$el,

            x = ($.isFunction(thing.x) ? thing.x(s, $el) : thing.x),
            y = ($.isFunction(thing.y) ? thing.y(s, $el) : thing.y),
            z = ($.isFunction(thing.z) ? thing.z(s, $el) : thing.z);
      
        self._renderThing(s, x, y, z, thing.projection, $el);
      });

      $.each(self.spec.messages, function(i, message) {
        var $el = message.$el;
        self._renderMessage(s, message.start, message.end, $el);
      });

      $.each(self.spec.bubbles, function(i, popup) {
        var $el = popup.$el;
        self._renderBubble(s, popup.start, popup.end, $el);
      });
    },

    _renderBubble: function(s, start, end, $els) {
      var self = this;

      $els.each(function(i, el) {
        var $el = $(el),
            visible = ($el.data('popover').tip().filter(':visible').length > 0);

        // For a timed bubble...
        if (start !== undefined && end !== undefined) {
          if (s >= start && s < end) {
            if (!visible)
              $el.popover('show');
            else
              $el.popover('place');
          }

          else {
            if (visible)
              $el.popover('hide');
          }
        }

        // For a clicked bubble...
        else {
          if (visible)
            $el.popover('place');
        }
      });
    },

    _renderMessage: function(s, start, end, $el) {
      var self = this;
      
      if (s >= start && s < end) {
        if ($el.filter(":visible").length == 0){
        console.log(s)
          $el.modal('show');}
      }

      else {
        if ($el.filter(":visible").length > 0)
          $el.modal('hide');
      }
    },

    _offset: function(s, x, y, z, V) {
      // Offset the coordinates based on the scroll offset and the velocity.
      var self = this
        , V = V || self.velocity

        , tx = (x - s*V.x)
        , ty = (y - s*V.y)
        , tz = (z - s*V.z);
      
      return {'x': tx, 'y': ty, 'z': tz};
    },

    _project: function(s, x, y, z, P, V) {
      // Calculate the projected x (px) and y (py) values from the thing's
      // world x, y, and z values using world projection matrix P and velocity
      // vector V.  This is the matrix transformation:
      //
      //                        [xr_x, yr_x]
      //  ([x, y, z] - s * V) * [xr_y, yr_y] = [px, py]
      //                        [xr_z, yr_z]
      //
      var self = this
        , P = P || self.projection
        , V = V || self.velocity

        , t = self._offset(s, x, y, z, V)

        , px = t.x*P.xr_x + t.y*P.xr_y + t.z*P.xr_z
        , py = t.x*P.yr_x + t.y*P.yr_y + t.z*P.yr_z;
      
      return {'x': px, 'y': py};
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
     * P - the projection matrix containing the rates of change of screen x
     *     and y positions with respect to a unit of change in the isometric
     *     world's x, y, or z axes.
     *
     * $el - jQuery object of the element we're positioning
     */
    _renderThing: function(s, x, y, z, P, $el) {
      var self = this
        , p = self._project(s, x, y, z, P);

      $el.css({
        position: 'fixed',
        left: p.x+'px',
        top:  p.y+'px'
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
  S.SVGScene = function(spec, selector, scrollSpeed, projection, velocity) {
    return S.Scene.call(this, spec, selector, scrollSpeed, projection, velocity);
  };

  $.extend(S.SVGScene.prototype, S.Scene.prototype, {
    _renderThing: function(s, x, y, z, P, $el) {
      var self = this
        , p = self._project(s, x, y, z, P);

      $el
        .attr('x', p.x+'px')
        .attr('y', p.y+'px')
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
