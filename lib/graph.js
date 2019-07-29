/*
 *  A LIBRARY FOR MAKING GRAPHS
 *  This will make cool graphs
 */

//Dependencies
const config = require('./../config.js');
const Jimp = require('jimp');
const log = require('./log.js');
//Create the container
var graph = {};

//Draw vertical lines
graph.drawLine = function (start_x, start_y, end_x, end_y, thiccness, color, pixels) {
    //Find out if the line is vertical or horizontal
    if (start_x == end_x) {
        //We are vertical
        for (let x = start_y; x < end_y; x++) {
            for (let y = start_x - thiccness / 2; y < start_x + thiccness / 2; y++) {
                pixels[x][y] = color;
            }
        }
    } else {
        //Check if we are horizontal
        if (start_y == end_y) {
            //We are horizontal
            for (let y = start_y - thiccness / 2; y < start_y + thiccness / 2; y++) {
                for (let x = start_x; x < end_x; x++) {
                    pixels[y][x] = color;
                }
            }
        } else {
            //Wrong input
            log.write(2, 'Graph.js: Wrong input for drawLine', {
                start_x: start_x,
                start_y: start_y,
                end_x: end_x,
                end_y: end_y
            }, function (err) { });
        }
    }
    return pixels;
};

//Create a graph
graph.create = function (res_x, res_y, title, legend_x, legend_y, scale_x, scale_y, scale_res_x, scale_res_y, min_value_x, min_value_y, max_value_x, max_value_y, data, callback) {
    var fileName = title + '.png';

    var imageData = Array.from(Array(res_x), () => new Array(res_y));
    
    var image = new Jimp(res_x, res_y, 0xfafafaff, function (err, image) {
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

                //Print legend_x
                image.print(font, res_x / 2, res_y - 80, legend_x);

                Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
                    .then(font => {
                        //Print max_value_y
                        image.print(font, 50, 50, max_value_y);

                        //Print min_value_y
                        image.print(font, 5, res_y - 150, min_value_y);

                        //Print min_value_x
                        image.print(font, 125, res_y - 75, min_value_x);

                        //Print max_value_x
                        image.print(font, res_x - 200, res_y - 75, max_value_x);

                        //Draw the scale lines on the x axis
                        for (let i = 100 + scale_res_x; i < res_x - 100; i += scale_res_x) {
                            imageData = graph.drawLine(i, 100, i, res_y - 100, 4, 0x696969ff, imageData);
                        }
                        //Draw the scale lines on the y axis
                        for (let i = 100 + scale_res_y; i < res_y - 100; i += scale_res_y) {
                            imageData = graph.drawLine(100, i, res_x - 100, i, 4, 0x696969ff, imageData);
                        }

                        //Draw vertical outline
                        imageData = graph.drawLine(100, 100, 100, res_y - 75, 8, 0x000000ff, imageData);

                        //Draw horizontal outline
                        imageData = graph.drawLine(75, res_y - 100, res_x - 100, res_y - 100, 8, 0x000000ff, imageData);

                        imageData.forEach((row, y) => {
                            row.forEach((color, x) => {
                                image.setPixelColor(color, x, y);
                            });
                        });

                        image.write('temp/' + fileName, (err) => {
                            if (err) console.log(err);
                        });
                    });
            });
    });

    callback(fileName);
};

//Export the container
module.exports = graph;