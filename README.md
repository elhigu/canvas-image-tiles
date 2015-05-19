## Create 256x256 tiles from huge (over 100Mpixel) input image with html5 canvas 
Checkout the online demo: http://elhigu.github.io/canvas-image-tiles

## Implementation
Plain html/css/javascript and optionally `hammer.js` to support touch screen events better.
Tried to make it as easy as possible to wrap to work for any framework.

Proof of concept type and could use quite a lot refactoring.

## To play around with it
```
git clone https://github.com/elhigu/canvas-image-tiles.git
cd canvas-image-tiles
open index.html
```

## Compatibility notes
On OSX Safari sampling tiles from over 100M pixel images pauses every now and then. Timeline doesn't show any apparent reason why that is happening.

On iOS fails silently if image is too big for mobile browser. Haven't connected to debugger to see if there could be something to do to fix it...

On IE really big images didn't work perfectly some not enough storage error occurred.

Please let me know if you try this with some other browsers to know how it works :)

