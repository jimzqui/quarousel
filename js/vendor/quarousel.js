/*!
 * Quarousel
 * jQuery slider plugin
 *
 * By Jimbo Quijano
 * https://github.com/jimzqui
 *
 * Copyright 2015
 * Released under the MIT license
 */


(function (factory) {
if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module depending on jQuery.
    define(['jquery'], factory);
} else {
    // No AMD. Register plugin with global jQuery object.
    factory(jQuery);
}
}(function ($) {

    /*!
     * Defaults
     * Do not change
     */
    var pluginName = 'quarousel';
    var defaults = {
        indicators: '.carousel-indicators',
        wrapper: '.carousel-inner',
        control: '.carousel-control',
        bar: '.carousel-bar',
        item: '.item',
        width: $(window).width(),
        height: $(window).height(),
        speed: 600,
        interval: 5000,
        wrap: false,
        effect: 'carousel'
    };

    /*!
     * Main constructor
     * Quarousel plugin
     */
    function Plugin(element, options) {
        var that = this;

        // Set elements
        that.el = { main: element };
        that._options = options;

        // Set settings
        that.settings();

        // Initialize
        that.init();
    }

    // Animation effects
    Plugin.prototype.settings = function() {
        var that = this;

        // Override dimension if explicitly set via css
        defaults.width = (that.el.main.width() != undefined) ? that.el.main.width() : defaults.width;
        defaults.height = (that.el.main.height() != undefined) ? that.el.main.height() : defaults.height;

        // Create final settings
        that._defaults = $.extend(true, {}, defaults, that._options);

        // Set more elements
        that.el.bar = $(that._defaults.bar);
        that.el.wrapper = $(that._defaults.wrapper);
        that.el.control = $(that._defaults.control);
        that.el.indicators = $(that._defaults.indicators + ' li');
        that.el.items = $(that._defaults.wrapper + ' ' + that._defaults.item);
    };

    // Init method
    Plugin.prototype.init = function () {
        var that = this;
        that.animating = false;

        // Setup slide
        that.preloadImages();
        that.styleSlide();
        that.setEffect();

        // Setup controls
        $('body').on('click', that._defaults.control, function() {
            that.recycle($(this).attr('href'), $(this).data('slide'));
            return false;
        });

        // Setup indicators
        $('body').on('click', that._defaults.indicators + ' li', function() {
            that.recycle($(this).data('target'), $(this).data('slide-to'));
            return false;
        });

        // Cycle slides
        that.cycle();
    };

    // Preload slide images
    Plugin.prototype.preloadImages = function() {
        var that = this;
        var promises = [];

        that.images = [];
        that.el.items.each(function() {
            that.images.push($(this).find('img').attr('src'));
        });

        for (var i = 0; i < that.images.length; i++) {
            (function(url, promise) {
                var img = new Image();
                img.onload = function() {
                    promise.resolve();
                };
                img.src = url;
            })(that.images[i], promises[i] = $.Deferred());
        }

        $.when.apply($, promises).done(function() {
            that.el.main.show();
        });
    };

    // Style container and wrapper
    Plugin.prototype.styleSlide = function () {
        var that = this;

        // Style container
        that.el.main.css({
            background: '#eaeaea',
            position: 'relative',
            width: that._defaults.width,
            height: that._defaults.height,
            overflow: 'hidden'
        });

        // Style wrapper
        that.el.wrapper.css({
            position: 'absolute',
            width: that._defaults.width,
            height: that._defaults.height,
            left: 0,
            top: 0,
            margin: 0,
            padding: 0
        });

        // Style control
        that.el.control.css({
            zIndex: 9
        });

        // Style bar
        that.el.bar.css({
            position: 'absolute',
            width: '100%',
            height: 2,
            bottom: 1,
            left: 0,
            zIndex: 9
        });

        that.el.bar.find('span').css({
            background: '#ddd',
            width: '0%',
            height: '100%',
            float: 'left'
        });
    };

    // Animation effects
    Plugin.prototype.setEffect = function() {
        var that = this;
        var effect = (typeof(that._defaults.effect) == 'object') ? 
        that._defaults.effect.name : that._defaults.effect;

        // Create effect
        switch(effect) {
            case 'carousel': that.effect = new Effect_Carousel(that); break;
            case 'fade': that.effect = new Effect_Fade(that); break;
            case 'box': that.effect = new Effect_Box(that); break;
            case 'slice': that.effect = new Effect_Slice(that); break;
            default: that.effect = new Effect_Carousel(that);
        }
    };

    // Animate to next slide
    Plugin.prototype.slide = function (to) {
        var that = this;
        if (that.el.items.length <= 1) return;
        if (that.animating == true) return;
        
        // Get slides
        that.coming = that.comingItem(to);
        that.active = that.activeItem();

        // Slide in
        that.el.main.trigger('slide.qs', [that.active]);
        that.el.main.trigger('slide.bs.carousel', [that.active]);
        that.animating = true;
        that.effect.in();

        // Slide out
        that.effect.out(function() {
            that.animating = false;

            that.el.indicators
            .removeClass('active')
            .eq(that.coming.index()).addClass('active');

            that.el.items
            .removeClass('active')
            .eq(that.coming.index()).addClass('active');

            that.el.main.trigger('slid.qs', [that.active]);
            that.el.main.trigger('slid.bs.carousel', [that.active]);
        });
    };

    // Cycle through slides
    Plugin.prototype.cycle = function() {
        var that = this;

        if (that._defaults.interval != false) {
            that._animInterval = setInterval(function() {
                that.slide('next');

                that.el.bar.find('span').stop().css({
                    width: '0%'
                }).animate({
                    width: '100%'
                }, that._defaults.interval);
            }, that._defaults.interval);

            that.el.bar.find('span').stop().animate({
                width: '100%'
            }, that._defaults.interval);
        }
    };

    // Pause cycle
    Plugin.prototype.pause = function() {
        var that = this;

        if (that._defaults.interval != false) {
            clearInterval(that._animInterval);

            that.el.bar.find('span').stop().css({
                width: '0%'
            });
        }
    };

    // Run extra method after instantiation
    Plugin.prototype.trigger = function (method) {
        var that = this;

        switch(method) {
            case 'next': that.slide(method); break;
            case 'prev': that.slide(method); break;
            case 'cycle': that.cycle(); break;
            case 'pause': that.pause(); break;
            default: that.slide(method);
        }
    };

    // On controls and inidicators click
    Plugin.prototype.recycle = function(target, slide) {
        var that = this;
        if (that.animating == true) return;

        $(target).quarousel(slide);
        if (that._defaults.wrap == false) {
            $(target).quarousel('pause');
            $(target).quarousel('cycle');
        }
    };

    // Get active slide
    Plugin.prototype.activeItem = function() {
        var that = this;
        return that.el.wrapper.find('.active');
    };

    // Get next item
    Plugin.prototype.comingItem = function(to) {
        var that = this;
        var active = that.activeItem();

        // If to is a number
        if (!isNaN(parseFloat(to)) && isFinite(to)) {
            var item = that.el.items.eq(to);
            item = (item[0] === active[0]) ? false : item;
            that.action = (item.index() > active.index()) ? 'next' : 'left';
        } else {
            that.action = (to == undefined) ? 'next' : to;
            if (to == 'next') {
                var item = active.next();
                item = (item.length == 0) ? that.el.items.first() : item;
            } else {
                var item = active.prev();
                item = (item.length == 0) ? that.el.items.last() : item;
            }
        }

        return item;
    };

    // Get aspect ratio of item image based on main container
    Plugin.prototype.aspectRatio = function(item) {
        var that = this;
        var img = item.find('img');

        return {
            height: img.height() / img.width() * that._defaults.width,
            width: img.width() / img.height() * that._defaults.height
        };
    };

    // Different easing type 
    Plugin.prototype.getEasing =  function(easing) {
        var that = this;

        switch(easing) {
            case 'easeInSine': return 'cubic-bezier(0.47, 0, 0.745, 0.715)'; break;
            case 'easeOutSine': return 'cubic-bezier(0.39, 0.575, 0.565, 1)'; break;
            case 'easeInOutSine': return 'cubic-bezier(0.445, 0.05, 0.55, 0.95)'; break;
            case 'easeInQuad': return 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'; break;
            case 'easeOutQuad': return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; break;
            case 'easeInCubic': return 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'; break;
            case 'easeOutCubic': return 'cubic-bezier(0.215, 0.61, 0.355, 1)'; break;
            case 'easeInOutCubic': return 'cubic-bezier(0.645, 0.045, 0.355, 1)'; break;
            case 'easeInQuart': return 'cubic-bezier(0.895, 0.03, 0.685, 0.22)'; break;
            case 'easeOutQuart': return 'cubic-bezier(0.165, 0.84, 0.44, 1)'; break;
            case 'easeInOutQuart': return 'cubic-bezier(0.77, 0, 0.175, 1)'; break;
            case 'easeInQuint': return 'cubic-bezier(0.755, 0.05, 0.855, 0.06)'; break;
            case 'easeOutQuint': return 'cubic-bezier(0.23, 1, 0.32, 1)'; break;
            case 'easeInExpo': return 'cubic-bezier(0.95, 0.05, 0.795, 0.035)'; break;
            case 'easeOutExpo': return 'cubic-bezier(0.19, 1, 0.22, 1)'; break;
            case 'easeInOutExpo': return 'cubic-bezier(1, 0, 0, 1)'; break;
            case 'easeInCirc': return 'cubic-bezier(0.6, 0.04, 0.98, 0.335)'; break;
            case 'easeOutCirc': 'cubic-bezier(0.075, 0.82, 0.165, 1)'; break;
            case 'easeInOutCirc': return 'cubic-bezier(0.785, 0.135, 0.15, 0.86)'; break;
            case 'easeInBack': return 'cubic-bezier(0.6, -0.28, 0.735, 0.045)'; break;
            case 'easeOutBack': return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'; break;
            case 'easeInOutBack': return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'; break;
            default: return 'cubic-bezier(0.77, 0, 0.175, 1)';
        }
    };

    // Position boxes
    Plugin.prototype.positionBox = function(box, type) {
        var that = this;
        var width = that._defaults.width / that._defaults.effect.x;
        var height = that._defaults.height / that._defaults.effect.y;
        var x = box.data('x') * height;
        var y = box.data('y') * width;
        var _x = x * -1;
        var _y = y * -1;

        switch(type) {
            case 'topleft': var pos = { left: y, top: x, right: 'auto', bottom: 'auto' }; break;
            case 'botleft': var pos = { left: y, bottom: x, right: 'auto', top: 'auto' }; break;
            case 'topright': var pos = { right: y, top: x, left: 'auto', bottom: 'auto' }; break;
            case 'botright': var pos = { right: y, bottom: x, left: 'auto', top: 'auto' }; break;
            default: var pos = { left: y, top: x, right: 'auto', bottom: 'auto' };
        }

        // Style box
        box.css(pos);

        for (var key in pos) {
            if (typeof(pos[key]) == 'number') {
                pos[key] = pos[key] * -1;
            }
        }

        // Style box span
        box.find('span').css(pos);
    };

    // Construct swirl animation path
    Plugin.prototype.swirlPath = function(x, y) {
        var that = this;
        var xpath = x;
        var ypath = y;
        var path = 0;
        var swirl = -1;
        var change = 0;
        var arr = [];

        for (var i = 0; i < y; i++) {
            for (var j = 0; j < x; j++) {
                switch(path) {
                    case 0:
                        swirl = parseInt(swirl) + parseInt(1);
                        change += 1;
                        if (change == xpath) {
                            ypath -= 1;
                            path += 1;
                            change = 0;
                        }
                    break;
                    case 1:
                        swirl = parseInt(swirl) + parseInt(x);
                        change += 1;
                        if (change == ypath) {
                            xpath -= 1;
                            path += 1;
                            change = 0;
                        }
                    break;
                    case 2:
                        swirl = parseInt(swirl) - parseInt(1);
                        change += 1;
                        if (change == xpath) {
                            ypath -= 1;
                            path += 1;
                            change = 0;
                        }
                    break;
                    case 3:
                        swirl = parseInt(swirl) - parseInt(x);
                        change += 1;
                        if (change == ypath) {
                            xpath -= 1;
                            path = 0;
                            change = 0;
                        }
                    break;
                }

                swirl = (swirl < 10) ? '0' + swirl : swirl;
                arr.push(swirl);
            };
        };

        return arr;
    };

    // Construct scatter animation path
    Plugin.prototype.scatterPath = function(x, y) {
        var that = this;
        var arr = [];
        var total = x * y;

        for (var i = 0; i < total; i++) {
            var scatter = i;
            scatter = (scatter < 10) ? '0' + scatter : scatter;
            arr.push(scatter);
        };

        return that.shuffleArr(arr);
    };

    // Shuffle array
    Plugin.prototype.shuffleArr = function(arr) {
        var that = this;
        var cur_index = arr.length, temp_value, rand_index;

        // While there remain elements to shuffle
        while (0 !== cur_index) {

            // Pick a remaining element
            rand_index = Math.floor(Math.random() * cur_index);
            cur_index -= 1;

            // And swap it with the current element
            temp_value = arr[cur_index];
            arr[cur_index] = arr[rand_index];
            arr[rand_index] = temp_value;
        }

        return arr;
    };

    /*!
     * Effect constructor
     * Carousel
     */
    function Effect_Carousel(qs) {
        var that = this;
        that.qs = qs;

        // Effect defaults
        that._defaults = {
            speed: 600,
            effect: {
                name: 'carousel',
                easing: 'easeInOutQuart'
            }
        };

        // Update settings
        that.qs._defaults = $.extend(true, {}, that._defaults, that.qs._options);
        that.qs._defaults = $.extend(true, {}, defaults, that.qs._defaults);

        // Construct slide items
        that.qs.el.items.each(function() {
            that.construct($(this));
        });
    }

    // Construct slide item
    Effect_Carousel.prototype.construct = function (item) {
        var that = this;
        var src = item.find('img').attr('src');
        var title = item.find('img').attr('title');

        item.css({
            display: 'block',
            backgroundImage: 'url(' + src + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            position: 'absolute',
            width: that.qs._defaults.width,
            height: that.qs._defaults.height,
            overflow: 'hidden',
            transition: 'none',
            WebkitTransition: 'none',
            top: 0
        }).empty().data('title', title);

        if (item.is('.active')) {
            item.css({
                left: 0
            });
        } else {
            item.css({
                left: that.qs._defaults.width
            });
        }
    };

    // Coming item slide in
    Effect_Carousel.prototype.in = function () {
        var that = this;

        // Setup
        that.qs.coming.queue(function() {
            $(this).css({
                transition: 'none',
                WebkitTransition: 'none'
            }).dequeue();
        });

        that.qs.coming.queue(function() {
            $(this).delay(100).css({
                left: (that.qs.action == 'next') ? 
                that.qs._defaults.width : that.qs._defaults.width * -1,
            }).dequeue();
        });

        that.qs.coming.queue(function() {
            $(this).delay(1).css({
                transition: 'all ' + that.qs._defaults.speed + 'ms ' + that.qs.getEasing(that.qs._defaults.effect.easing),
                WebkitTransition: 'all ' + that.qs._defaults.speed + 'ms ' + that.qs.getEasing(that.qs._defaults.effect.easing)
            }).dequeue();
        });

        that.qs.coming.queue(function() {
            $(this).delay(1).css({
                left: 0
            }).dequeue();
        });
    };

    // Active item slide in
    Effect_Carousel.prototype.out = function (callback) {
        var that = this;

        // Animate out
        setTimeout(function() {
            that.qs.active.css({
                left: (that.qs.action == 'next') ? 
                that.qs._defaults.width * -1 : that.qs._defaults.width,
                transition: 'all ' + that.qs._defaults.speed + 'ms ' + that.qs.getEasing(that.qs._defaults.effect.easing),
                WebkitTransition: 'all ' + that.qs._defaults.speed + 'ms ' + that.qs.getEasing(that.qs._defaults.effect.easing)
            });
        }, 100);

        setTimeout(function() {
            if (callback != undefined) callback();
        }, that.qs._defaults.speed + 100);
    };

    /*!
     * Effect constructor
     * Fade
     */
    function Effect_Fade(qs) {
        var that = this;
        that.qs = qs;

        // Effect defaults
        that._defaults = {
            speed: 600,
            effect: {
                name: 'fade',
            }
        };

        // Update settings
        that.qs._defaults = $.extend(true, {}, that._defaults, that.qs._options);
        that.qs._defaults = $.extend(true, {}, defaults, that.qs._defaults);

        // Construct slide items
        that.qs.el.items.each(function() {
            that.construct($(this));
        });
    }

    // Construct slide item
    Effect_Fade.prototype.construct = function (item) {
        var that = this;
        var src = item.find('img').attr('src');
        var title = item.find('img').attr('title');

        item.css({
            display: 'none',
            backgroundImage: 'url(' + src + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            position: 'absolute',
            width: that.qs._defaults.width,
            height: that.qs._defaults.height,
            overflow: 'hidden',
            transition: 'none'
        }).empty().data('title', title);

        if (item.is('.active')) {
            item.css({
                left: 0,
                right: 0
            }).show();
        }
    };

    // Coming item slide in
    Effect_Fade.prototype.in = function () {
        var that = this;

        // Setup
        that.qs.active.css({
            left: 0,
            zIndex: 2
        });

        // Animate in
        that.qs.coming.css({
            left: 0,
            zIndex: 1
        }).show();
    };

    // Active item slide in
    Effect_Fade.prototype.out = function (callback) {
        var that = this;

        // Animate out
        that.qs.active.fadeOut(that.qs._defaults.speed, function() {
            if (callback != undefined) callback();
        });
    };

    /*!
     * Effect constructor
     * Box
     */
    function Effect_Box(qs) {
        var that = this;
        that.qs = qs;

        // Effect defaults
        that._defaults = {
            speed: 600,
            effect: {
                name: 'box',
                type: 'slant',
                start: 'topleft',
                interval: 50,
                x: 10,
                y: 5
            }
        };

        // Update settings
        that.qs._defaults = $.extend(true, {}, that._defaults, that.qs._options);
        that.qs._defaults = $.extend(true, {}, defaults, that.qs._defaults);

        // Construct slide items
        that.qs.el.items.each(function() {
            that.construct($(this));
        });
    }

    // Construct slide item
    Effect_Box.prototype.construct = function (item) {
        var that = this;
        var src = item.find('img').attr('src');
        var title = item.find('img').attr('title');
        var width = that.qs._defaults.width / that.qs._defaults.effect.x;
        var height = that.qs._defaults.height / that.qs._defaults.effect.y;

        item.css({
            display: 'none',
            position: 'absolute',
            width: that.qs._defaults.width,
            height: that.qs._defaults.height,
            overflow: 'hidden',
            transition: 'none',
            WebkitTransition: 'none'
        }).empty().data('title', title);

        if (item.is('.active')) {
            item.css({
                left: 0,
                right: 0
            }).show();
        }

        // Construct boxes
        for (var i = 0; i < that.qs._defaults.effect.y; i++) {
            for (var j = 0; j < that.qs._defaults.effect.x; j++) {
                var box = $('<div class="box' + i + j + '"><span></span></div>').appendTo(item);
                box.css({
                    position: 'absolute',
                    overflow: 'hidden',
                    width: width,
                    height: height
                }).data('x', i).data('y', j).find('span').css({
                    backgroundImage: 'url(' + src + ')',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    position: 'absolute',
                    overflow: 'hidden',
                    width: that.qs._defaults.width,
                    height: that.qs._defaults.height
                });

                switch(that.qs._defaults.effect.start) {
                    case 'topleft': that.qs.positionBox(box, 'topleft'); break;
                    case 'botleft': that.qs.positionBox(box, 'botleft'); break;
                    case 'topright': that.qs.positionBox(box, 'topright'); break;
                    case 'botright': that.qs.positionBox(box, 'botright'); break;
                    default: that.qs.positionBox(box, 'topleft');
                }
            };
        };
    };

    // Coming item slide in
    Effect_Box.prototype.in = function () {
        var that = this;

        // If start point is random
        if (that.qs._defaults.effect.start == 'random') {
            var rand = Math.floor(Math.random() * 4);
            var arr = ['topleft', 'botleft', 'topright', 'botright'];

            // Iterate all boxes
            that.qs.active.find('div').each(function() {
                var box = $(this);
                that.qs.positionBox(box, arr[rand]);
            });
        }

        // Setup
        that.qs.active.css({
            left: 0,
            zIndex: 2
        });

        // Animate in
        that.qs.coming.css({
            left: 0,
            zIndex: 1
        }).show().find('div').show();
    };

    // Active item slide in
    Effect_Box.prototype.out = function (callback) {
        var that = this;
        var promises = [];

        // If animation type is random
        if (that.qs._defaults.effect.type == 'random') {
            var rand = Math.floor(Math.random() * 5);
            var arr = ['slant', 'horizontal', 'vertical', 'swirl', 'scatter'];
            var type = arr[rand];
        } else {
            var type = that.qs._defaults.effect.type;
        }

        // Animate out
        switch(type) {
            case 'slant':
                var count = 0;
                for (var i = 0; i < that.qs._defaults.effect.y; i++) {
                    for (var j = 0; j < that.qs._defaults.effect.x; j++) {
                        (function(j, i, count, promise) {
                            setTimeout(function() {
                                that.qs.active.find('.box' + i + j).fadeOut(that.qs._defaults.speed, function() {
                                    promise.resolve();
                                });
                            }, that.qs._defaults.effect.interval * (j + i));
                        })(j, i, count, promises[count] = $.Deferred());
                        count++;
                    };
                };
            break;
            case 'horizontal':
                var count = 0;
                for (var i = 0; i < that.qs._defaults.effect.y; i++) {
                    for (var j = 0; j < that.qs._defaults.effect.x; j++) {
                        (function(j, i, count, promise) {
                            setTimeout(function() {
                                that.qs.active.find('.box' + i + j).fadeOut(that.qs._defaults.speed, function() {
                                    promise.resolve();
                                });
                            }, that.qs._defaults.effect.interval * count);
                        })(j, i, count, promises[count] = $.Deferred());
                        count++;
                    };
                };
            break;
            case 'vertical':
                var count = 0;
                for (var i = 0; i < that.qs._defaults.effect.x; i++) {
                    for (var j = 0; j < that.qs._defaults.effect.y; j++) {
                        (function(j, i, count, promise) {
                            setTimeout(function() {
                                that.qs.active.find('.box' + j + i).fadeOut(that.qs._defaults.speed, function() {
                                    promise.resolve();
                                });
                            }, that.qs._defaults.effect.interval * count);
                        })(j, i, count, promises[count] = $.Deferred());
                        count++;
                    };
                };
            break;
            case 'swirl':
                var count = 0;
                var path = that.qs.swirlPath(that.qs._defaults.effect.x, that.qs._defaults.effect.y);
                for (var i = 0; i < path.length; i++) {
                    (function(i, count, promise) {
                        setTimeout(function() {
                            that.qs.active.find('.box' + path[i]).fadeOut(that.qs._defaults.speed, function() {
                                promise.resolve();
                            });
                        }, that.qs._defaults.effect.interval * count);
                    })(i, count, promises[count] = $.Deferred());
                    count++;
                };
            break;
            case 'scatter':
                var count = 0;
                var path = that.qs.scatterPath(that.qs._defaults.effect.x, that.qs._defaults.effect.y);
                for (var i = 0; i < path.length; i++) {
                    (function(i, count, promise) {
                        setTimeout(function() {
                            that.qs.active.find('.box' + path[i]).fadeOut(that.qs._defaults.speed, function() {
                                promise.resolve();
                            });
                        }, that.qs._defaults.effect.interval * (count / 2));
                    })(i, count, promises[count] = $.Deferred());
                    count++;
                };
            break;
            default:
                var count = 0;
                for (var i = 0; i < that.qs._defaults.effect.y; i++) {
                    for (var j = 0; j < that.qs._defaults.effect.x; j++) {
                        (function(j, i, count, promise) {
                            setTimeout(function() {
                                that.qs.active.find('.box' + i + j).fadeOut(that.qs._defaults.speed, function() {
                                    promise.resolve();
                                });
                            }, that.qs._defaults.effect.interval * (j + i));
                        })(j, i, count, promises[count] = $.Deferred());
                        count++;
                    };
                };
        }

        $.when.apply($, promises).done(function() {
            that.qs.active.hide();
            if (callback != undefined) callback();
        });
    };

    /*!
     * Effect constructor
     * Slice
     */
    function Effect_Slice(qs) {
        var that = this;
        that.qs = qs;

        // Effect defaults
        that._defaults = {
            speed: 400,
            effect: {
                name: 'slice',
                easing: 'easeInOutQuart',
                type: 'vertical',
                start: 'right',
                interval: 50,
                x: 10,
                y: 5
            }
        };

        // Update settings
        that.qs._defaults = $.extend(true, {}, that._defaults, that.qs._options);
        that.qs._defaults = $.extend(true, {}, defaults, that.qs._defaults);

        // Construct slide items
        that.qs.el.items.each(function() {
            that.construct($(this), that.qs._defaults.effect.type, that.qs._defaults.effect.start);
        });
    }

    // Construct slide item
    Effect_Slice.prototype.construct = function (item, type, start) {
        var that = this;

        if (item.data('img') == undefined) {
            item.data('img', item.find('img').attr('src'));
            item.data('title', item.find('img').attr('title'));
        }

        item.css({
            display: 'none',
            position: 'absolute',
            width: that.qs._defaults.width,
            height: that.qs._defaults.height,
            overflow: 'hidden',
            transition: 'none',
            WebkitTransition: 'none',
            left: 0,
            top: 0
        }).empty().data('title', item.data('title'));

        if (item.is('.active')) {
            item.css({
                left: 0,
                right: 0
            }).show();
        }

        if (type == 'horizontal') {
            var z = that.qs._defaults.effect.y;
            var width = that.qs._defaults.width;
            var height = that.qs._defaults.height / that.qs._defaults.effect.y;
        } else {
            var z = that.qs._defaults.effect.x;
            var width = that.qs._defaults.width / that.qs._defaults.effect.x;
            var height = that.qs._defaults.height;
        }

        // Construct boxes
        for (var i = 0; i < z; i++) {
            var box = $('<div class="box' + i + '"><span></span></div>').appendTo(item);
            box.css({
                position: 'absolute',
                overflow: 'hidden',
                width: width,
                height: height,
                transition: 'none',
                WebkitTransition: 'none'
            }).find('span').css({
                backgroundImage: 'url(' + item.data('img') + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                position: 'absolute',
                overflow: 'hidden',
                width: that.qs._defaults.width,
                height: that.qs._defaults.height
            });

            if (type == 'horizontal') {
                box.data('x', i).data('y', 0);
            } else {
                box.data('x', 0).data('y', i);
            }

            // Position slices
            if (type == 'horizontal') {
                switch(start) {
                    case 'bottom': that.qs.positionBox(box, 'topleft'); break;
                    case 'right': that.qs.positionBox(box, 'botleft'); break;
                    case 'left': that.qs.positionBox(box, 'topright'); break;
                    case 'top': that.qs.positionBox(box, 'botright'); break;
                    default: that.qs.positionBox(box, 'botright');
                }
            } else {
                switch(start) {
                    case 'top': that.qs.positionBox(box, 'topleft'); break;
                    case 'right': that.qs.positionBox(box, 'botleft'); break;
                    case 'left': that.qs.positionBox(box, 'topright'); break;
                    case 'bottom': that.qs.positionBox(box, 'botright'); break;
                    default: that.qs.positionBox(box, 'topright');
                }
            }
        };
    };

    // Get start
    Effect_Slice.prototype.getStart = function () {
        var that = this;

        // If start point is random
        if (that.qs._defaults.effect.start == 'random') {
            var rand = Math.floor(Math.random() * 4);
            var arr = ['top', 'bottom', 'left', 'right'];
            var start = arr[rand];
        } else {
            var start = that.qs._defaults.effect.start;
        }

        return start;
    };

    // Get start
    Effect_Slice.prototype.getType = function () {
        var that = this;

        // If animation type is random
        if (that.qs._defaults.effect.type == 'random') {
            var rand = Math.floor(Math.random() * 2);
            var arr = ['vertical', 'horizontal'];
            var type = arr[rand];
        } else {
            var type = that.qs._defaults.effect.type;
        }

        return type;
    };

    // Coming item slide in
    Effect_Slice.prototype.in = function () {
        var that = this;
        that._start = that.getStart();
        that._type = that.getType();

        // Reconstruct slide items if type is random
        if (that.qs._defaults.effect.type == 'random' 
        || that.qs._defaults.effect.start == 'random') {
            that.construct(that.qs.coming, that._type, that._start);
        }

        // Setup
        that.qs.active.css({
            zIndex: 1
        });

        that.qs.coming.css({
            zIndex: 2
        }).show().find('div').show();

        // Turn off transition
        that.qs.coming.find('div').queue(function() {
            $(this).css({
                transition: 'none',
                WebkitTransition: 'none'
            }).dequeue();
        });

        // Remember position
        that.qs.coming.find('div').each(function() {
            var box = $(this);
            box.data('offset', box.position());
        });
        
        switch(that._start) {
            case 'top':
                that.qs.coming.find('div').queue(function() {
                    $(this).delay(100).css({
                        top: that.qs._defaults.height * -1
                    }).dequeue();
                });
            break;
            case 'bottom':
                that.qs.coming.find('div').queue(function() {
                    $(this).delay(100).css({
                        top: that.qs._defaults.height
                    }).dequeue();
                });
            break;
            case 'left':
                that.qs.coming.find('div').queue(function() {
                    $(this).delay(100).css({
                        left: that.qs._defaults.width * -1
                    }).dequeue();
                });
            break;
            case 'right':
                that.qs.coming.find('div').queue(function() {
                    $(this).delay(100).css({
                        left: that.qs._defaults.width
                    }).dequeue();
                });
            break;
            default:
                that.qs.coming.find('div').queue(function() {
                    $(this).delay(100).css({
                        top: that.qs._defaults.height * -1
                    }).dequeue();
                });
        }
    };

    // Active item slide in
    Effect_Slice.prototype.out = function (callback) {
        var that = this;
        var promises = [];

        // Animate out
        if (that._type == 'horizontal') {
            var z = that.qs._defaults.effect.y;
        } else {
            var z = that.qs._defaults.effect.x;
        }

        // Turn on transition
        that.qs.coming.find('div').queue(function() {
            $(this).delay(1).css({
                transition: 'all ' + that.qs._defaults.speed + 'ms ' + that.qs.getEasing(that.qs._defaults.effect.easing),
                WebkitTransition: 'all ' + that.qs._defaults.speed + 'ms ' + that.qs.getEasing(that.qs._defaults.effect.easing)
            }).dequeue();
        });

        // Construct boxes
        var count = 0;
        for (var i = 0; i < z; i++) {
            (function(i, count, promise) {
                setTimeout(function() {
                    var box_el = that.qs.coming.find('.box' + i);

                    setTimeout(function() {
                        box_el.css(box_el.data('offset'));
                    }, 100)

                    setTimeout(function() {
                        promise.resolve();
                    }, that.qs._defaults.speed + 100)
                    
                }, that.qs._defaults.effect.interval * count);
            })(i, count, promises[count] = $.Deferred());
            count++;
        };

        $.when.apply($, promises).done(function() {
            that.qs.active.hide().find('div').hide();
            if (callback != undefined) callback();
        });
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin($(this), options));
            } else {
                var plugin = $.data(this, 'plugin_' + pluginName);
                plugin.trigger(options);
            }
        });
    };

}));