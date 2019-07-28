/*
 *  A LIBRARY FOR MAKING GRAPHS
 *  This will make cool graphs
 */

//Dependencies
const config = require('./../config.js');
const Jimp = require('jimp');
//Create the container
var graph = {};

//Create a graph
graph.create = function (res_x, res_y, title, legend_x, legend_y, scale_x, scale_y, scale_res_x, res_scale_y, data, callback) {
    var fileName = title + '.png';

    let imageData = [];
    for (var x = 0; x < 255; x++) {
        var row = [];
        for (var y = 0; y < 255; y++) {
            row.push(Jimp.rgbaToInt(y, x, y, 255));
        }
        imageData.push(row);
        row = [];
    }
    let image = new Jimp(res_x, res_y, 0xfafafaff, function (err, image) {
        if (err) console.log(err);
        //Load the font
        Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
            .then(font => {
                //Print title
                image.print(font, res_x / 2, 20, title);

                //Print legend_y
                var start_y = res_y / 8;
                for (var i = 0; i < legend_y.length; i++) {
                    image.print(font, 20, start_y + (i * 60), legend_y[i]);
                }

                //Print title
                image.print(font, res_x / 2, res_y - 80, legend_x);

                //Draw outline

                //imageData.forEach((row, y) => {
                //    row.forEach((color, x) => {
                //        image.setPixelColor(color, x, y);
                //    });
                //});

                image.write('temp/' + fileName, (err) => {
                    if (err) console.log(err);
                });
            });
    });

    callback(fileName);
};

//Export the container
module.exports = graph;