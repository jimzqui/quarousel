# Quarousel v1.0 (Work on Progress)

This project is a sample demonstration of a slider made from Quarousel. Quarousel is a jQuery slider plugin with stunning effects and compatible to Bootstrap's carousel component. Currently have 4 effects and multiple animation variants. Planning to add 50 more.

## Basic Usage
```javascript
$('#quarousel').quarousel();
```

## More Options
The default options below works same way as the Bootstrap's carousel. Example, interval indicates how many seconds it auto-slide. Setting interval to false stops the auto-slide.
```javascript
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
```

## Pause
```javascript
$('#quarousel').quarousel('pause');
```

## Cycle
```javascript
$('#quarousel').quarousel('cycle');
```

## Carousel Effect
```javascript
$('#quarousel').quarousel({
	effect: {
        name: 'carousel',
        easing: 'easeInOutQuart' // easeInOutQuart, easeInSine with 20 more. Refer to http://easings.net/
    }
});
```

## Fade Effect
```javascript
$('#quarousel').quarousel({
	effect: {
        name: 'fade',
    }
});
```

## Box Effect
```javascript
$('#quarousel').quarousel({
	effect: {
        name: 'box',
        type: 'slant', // slant, swirl, horizontal, vertical, random
        start: 'topleft', // topleft, topright, botleft, botright, random
        interval: 50,
        x: 10,
        y: 5
    }
});
```

## Slice Effect
```javascript
$('#quarousel').quarousel({
	effect: {
        name: 'slice',
        easing: 'easeInOutQuart', // easeInOutQuart, easeInSine with 20 more. Refer to http://easings.net/
        type: 'vertical', // vertical, horizontal, random
        start: 'right', // right, left, top, bottom, random
        interval: 50,
        x: 10,
        y: 5
    }
});
```

## Before Slide Event
This event fires immediately when the slide instance method is invoked.
```javascript
$('#quarousel').on('slide.bs.carousel', function (e, active) {
    // do someting...
});
```

## After Slide Event
This event is fired when the carousel has completed its slide transition.
```javascript
$('#quarousel').on('slid.bs.carousel', function (e, active) {
    // do someting...
});
```

* Author: Jimbo Quijano
* Homepage: jimboquijano.com
* Email: jimzqui@yahoo.com