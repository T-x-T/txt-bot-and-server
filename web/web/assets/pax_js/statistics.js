//Contains js for statistics.html

window.onload = function () {
    // scale worldmap correctly
    
    document.getElementById("map-container").children[0].setAttribute('viewBox', '0 50 900 400');

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
};