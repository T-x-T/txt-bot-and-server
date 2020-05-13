function toggleDisplay(me) {
  if(me.getAttribute("opacity")=="100")
    me.setAttribute("opacity","0")
   else
    me.setAttribute("opacity","100")
};

document.addEventListener("onload",fix_toggle()); //lgtm [js/use-of-returnless-function]
function fix_toggle() {
    document.getElementById("dynmap").setAttribute("opacity","100");
    document.getElementById("road_labels").setAttribute("opacity","100");
    document.getElementById("roads").setAttribute("opacity","100");
};

var instance = new SVGPanZoom(document.getElementById('roadmap'), {
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