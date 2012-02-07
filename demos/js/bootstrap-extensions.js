/* ===========================================================
 * Modifications to the Bootstrap default behaviors.
 * =========================================================== */

(function($) {
  "use strict";

  function maybeCall ( thing, ctx, args ) {
    return typeof thing == 'function' ? thing.apply(ctx, args) : thing
  }

  /* ===========================================================
   * Change the Twipsy class to separate out the placement of
   * the tip from the showing of the tip.  This is so that we
   * can recalculate where the tip should go without having to
   * re-show it, since show does the whole fading out/in thing.
   * =========================================================== */
  $.extend($.fn.twipsy.Twipsy.prototype, {
    show: function() {
      var $tip
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animate) {
          $tip.addClass('fade')
        }

        $tip
          .remove()
          .css({ top: 0, left: 0, display: 'block' })
          .prependTo(document.body)

        this.place();

        $tip
          .addClass('in')
      }
    }

  , place: function() {
      var pos
        , actualWidth
        , actualHeight
        , placement
        , $tip
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()

        // Check for getBBox if out element doesn't have offsetWidth/Height.
        // Only HTML elements have offsetWidth/Height; SVG elements' equivalent
        // is the bounding box width/height.
        pos = $.extend({}, this.$element.offset(), {
          width: this.$element[0].offsetWidth || this.$element[0].getBBox().width
        , height: this.$element[0].offsetHeight || this.$element[0].getBBox().height
        })

        // Since our bubbles are fixed-position, we only want the distance from
        // the top of the window, not the top of the document.
        pos.top -= $(window).scrollTop();

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        placement = maybeCall(this.options.placement, this, [ $tip[0], this.$element[0] ])

        switch (placement) {
          case 'below':
            tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'above':
            tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset}
            break
        }

        $tip
          .css(tp)
          .addClass(placement)
      }
    }
  });

})(jQuery);
