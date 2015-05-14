# Quarousel v1.0 (Work on Progress)

This project is a sample demonstration of a slider made from Quarousel. Quarousel is a jQuery slider plugin with stunning effects and compatible to Bootstrap's carousel component. Currently have 4 effects and multiple animation variants. Planning to add 50 more.

## Basic Usage
<code>
	$('#quarousel').quarousel();
</code>

## More Options
The default options below works same way as the Bootstrap's carousel. Example, interval indicates how many seconds it auto-slide. Setting interval to false stops the auto-slide.
<code>
	$('#quarousel').quarousel({
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
	});
</code>

## Pause
<code>
	$('#quarousel').quarousel('pause');
</code>

## Cycle
<code>
	$('#quarousel').quarousel('cycle');
</code>

## Carousel Effect
<code>
	$('#quarousel').quarousel({
		effect: {
            name: 'carousel',
            easing: 'easeInOutQuart' // easeInOutQuart, easeInSine, easeOutSine, easeInOutSine with 18 more. Refer to http://easings.net/
        }
	});
</code>

## Fade Effect
<code>
	$('#quarousel').quarousel({
		effect: {
            name: 'fade',
        }
	});
</code>

## Box Effect
<code>
	$('#quarousel').quarousel({
		effect: {
            name: 'box',
            type: 'slant', // slant, swirl, horizontal, vertical
            start: 'topleft', // topleft, topright, botleft, botright
            interval: 50,
            x: 10,
            y: 5
        }
	});
</code>

## Slice Effect
<code>
	$('#quarousel').quarousel({
		effect: {
            name: 'slice',
            easing: 'easeInOutQuart', // easeInOutQuart, easeInSine, easeOutSine, easeInOutSine with 18 more. Refer to http://easings.net/
            type: 'vertical', // vertical, horizontal
            start: 'right', // right, left, top, bottom
            interval: 50,
            x: 10,
            y: 5
        }
	});
</code>

* Author: Jimbo Quijano
* Homepage: jimboquijano.com
* Email: jimzqui@yahoo.com