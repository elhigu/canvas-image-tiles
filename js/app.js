/**
 * Main app.
 *
 * Handles UI events and uses CanvasShredder to handle and adjust image orientation.
 */


/// Expose app context to make debugging easier
var appContext = (function () {

  /**
   * Adjust preview position on top of tiles.
   */
  var rotationButton = document.querySelector('.ctrl-btn.rotate');
  var moveButton = document.querySelector('.ctrl-btn.move');
  var scaleButton = document.querySelector('.ctrl-btn.scale');

  var moveEl = null;
  var lastPos = null;
  function getPos(event) {
    return { x: event.screenX, y: event.screenY };
  }

  rotationButton.addEventListener('mousedown', startMouseMove, false);
  moveButton.addEventListener('mousedown', startMouseMove, false);
  scaleButton.addEventListener('mousedown', startMouseMove, false);
  function startMouseMove(event) {
    event.preventDefault();
    moveEl = event.target;
    lastPos = getPos(event);
  }

  /**
   * Convert mousedown and mousemove events to relative mouse events
   */
  function mouseMove(event) {
    console.log("Button", event.button, "Which", event.which, "Buttons", event.buttons);
    if (event.buttons === 0) {
      moveEl = null;
    }
    if (moveEl !== null) {
      var currPos = getPos(event);
      var dx = currPos.x - lastPos.x;
      var dy = currPos.y - lastPos.y;
      var speed = Math.sqrt(dx*dx + dy*dy);
      speed = (dy > 0) ? speed : -speed;
      moveEl.dispatchEvent(new CustomEvent('relativemouse', { detail: {
        dx: dx,
        dy: dy,
        speed: speed
      }}));
      lastPos = currPos;
    }
  }
  document.body.addEventListener('mousemove', mouseMove, false);

  /**
   * Adjust image orientation
   */
  rotationButton.addEventListener('relativemouse', function (event) {
    orientation.updateOrientation({ deltaRotation: event.detail.speed/100 });
  }, false);
  moveButton.addEventListener('relativemouse', function (event) {
    orientation.updateOrientation({
      deltaPosition: { x: event.detail.dx, y: event.detail.dy }
    });
  }, false);
  scaleButton.addEventListener('relativemouse', function (event) {
    orientation.updateOrientation({ deltaScale: event.detail.speed/100 });
  }, false);

  return this;
})();
