//Contains js for statistics.html


// scale worldmap correctly
document.addEventListener("onload",fix_worldmap());
function fix_worldmap() {
      document.getElementById("map-container").children[0].setAttribute('viewBox', '0 50 900 400');
}

  // select first child of #map-container
  var instance = new SVGPanZoom(document.getElementById("map-container").children[0], {
      eventMagnet: document.getElementById('SVGContainer')
  });

  document.getElementById('zoomin').addEventListener('click', function () {
      instance.zoomIn(null, 0.4);
  });
  document.getElementById('zoomout').addEventListener('click', function () {
      instance.zoomOut(null, 0.4);
  });
  document.getElementById('resetSVG').addEventListener('click', function () {
      instance.reset();
  });
  document.getElementById('panleft').addEventListener('click', function() {
      instance.panLeft(200);
  });
  document.getElementById('panright').addEventListener('click', function() {
      instance.panRight(200);
  });
  document.getElementById('panup').addEventListener('click', function() {
      instance.panUp(200);
  });
  document.getElementById('pandown').addEventListener('click', function() {
      instance.panDown(200);
  });