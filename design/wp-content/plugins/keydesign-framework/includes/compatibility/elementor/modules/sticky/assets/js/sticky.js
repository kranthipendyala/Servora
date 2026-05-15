(function($){
    'use strict';
    
    var $stickyElements = $('[data-keydesign-sticky]');
    if(!$stickyElements.length) return;
    
    var adminBarHeight = $('#wpadminbar').length ? $('#wpadminbar').outerHeight() : 0;
    var isTablet = window.matchMedia("(max-width:1024px) and (min-width: 768px)");
    var isMobile = window.matchMedia("(max-width: 767px)");

    var $regularStickyElements = $stickyElements.not('[data-keydesign-sticky-stay-in-column="yes"]');
    
    function initSticky($sticky) {
        var untilSelector = $sticky.data('keydesign-sticky-until');
        var $until = untilSelector ? $('#' + untilSelector) : null;
        
        var offset = 0;
        var style = $sticky.attr('style') || '';
        var match = style.match(/--keydesign-sticky-offset:\s*([-\d]+)/);
        if (match) offset = parseInt(match[1], 10) || 0;
        
        var totalOffset = offset + adminBarHeight;
        var initialTop = $sticky.offset().top;
        var initialLeft = $sticky.offset().left;
        var initialWidth = $sticky.outerWidth();
        var initialHeight = $sticky.outerHeight();

        var $placeholder = $('<div class="sticky-placeholder"></div>');
        $placeholder.css({
            height: initialHeight,
            width: initialWidth,
            display: 'none'
        });
        
        return {
            $element: $sticky,
            $placeholder: $placeholder,
            $until: $until,
            totalOffset: totalOffset,
            initialTop: initialTop,
            initialLeft: initialLeft,
            initialWidth: initialWidth,
            initialHeight: initialHeight
        };
    }
    
    function updateSticky(instance) {
        var $sticky = instance.$element;
        var $placeholder = instance.$placeholder;
        var $until = instance.$until;
        var totalOffset = instance.totalOffset;
        var initialTop = instance.initialTop;
        var initialLeft = instance.initialLeft;
        var initialWidth = instance.initialWidth;
        var initialHeight = instance.initialHeight;

        if (
            ($sticky.data('keydesign-sticky-disable-tablet') === 'yes' && isTablet.matches) ||
            ($sticky.data('keydesign-sticky-disable-mobile') === 'yes' && isMobile.matches)
        ) {
            $sticky.css({position:'',top:'',left:'',zIndex:'',transform:'',width:''});
            $placeholder.hide();
            $sticky.data('sticky-active', false);
            return;
        }
        
        var scroll = $(window).scrollTop();
        var stickyHeight = $sticky.outerHeight();
        var left = $sticky.offset().left;
        
        if(scroll + totalOffset < initialTop){
            $sticky.css({position:'',top:'',left:'',zIndex:'',transform:'',width:''});
            $placeholder.hide();
        } else {
            if (!$sticky.data('sticky-active')) {
                $sticky.after($placeholder);
                $sticky.data('sticky-active', true);
            }

            var currentWidth = $sticky.outerWidth();
            $sticky.css({
                position: 'fixed',
                top: totalOffset,
                left: left,
                zIndex: 99,
                width: currentWidth
            });
            $placeholder.show();
            
            var stickyBottom = scroll + totalOffset + stickyHeight;
            
            if ($until && $until.length) {
                var untilBottom = $until.offset().top + $until.outerHeight();
                if (stickyBottom > untilBottom) {
                    var overlap = stickyBottom - untilBottom;
                    $sticky.css('transform', 'translateY(' + (-overlap) + 'px)');
                } else {
                    $sticky.css('transform', '');
                }
            } else {
                var pageHeight = $(document).height();
                var viewportHeight = $(window).height();
                var pageBottom = pageHeight - viewportHeight;
                if (stickyBottom > pageBottom) {
                    var overlap = stickyBottom - pageBottom;
                    $sticky.css('transform', 'translateY(' + (-overlap) + 'px)');
                } else {
                    $sticky.css('transform', '');
                }
            }
        }
    }
    
    var stickyInstances = [];
    $regularStickyElements.each(function() {
        stickyInstances.push(initSticky($(this)));
    });
    
    function update() {
        stickyInstances.forEach(updateSticky);
    }
    
    $(window).on('scroll resize', update);
    update();
})(jQuery);
  