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

//Convert a value to a pixel location
graph.valueToPixel = function (value, input) {
    //Calculate the heigth of the graph
    var height = input.res_y - 200;
    //Return the value
    return Math.round((value / input.scale) * height);
};

//Create a graph
graph.create = function (input, callback) {
    //Validate inputs
    var res_x = typeof input.res_x == 'number' && input.res_x >= 1280 && input.res_x <= 3840 ? input.res_x : 1920;
    var res_y = typeof input.res_y == 'number' && input.res_y >= 720 && input.res_y <= 2160 ? input.res_y : 1080;
    var title = typeof input.title == 'string' && input.title.length > 0 && input.title.length <= 32 ? input.title : false;
    var legend_x = typeof input.legend_x == 'string' && input.legend_x.length > 0 && input.legend_x.length <= 32 ? input.legend_x : false;
    var legend_y = typeof input.legend_y == 'string' && input.legend_y.length > 0 && input.legend_y.length <= 32 ? input.legend_y : false;
    var scale = typeof input.scale == 'number' && input.scale >= 5 ? input.scale : false;
    var scale_res_x = typeof input.scale_res_x == 'number' && input.scale_res_x >= 3 && input.scale_res_x <= 50 ? input.scale_res_x : false;
    var scale_res_y = typeof input.scale_res_y == 'number' && input.scale_res_y >= 3 && input.scale_res_y <= 50 ? input.scale_res_y : false;
    var min_value_x = typeof input.min_value_x == 'string' && input.min_value_x.length > 0 && input.min_value_x.length <= 32 ? input.min_value_x : false;
    var min_value_y = typeof input.min_value_y == 'number' ? input.min_value_y : false;
    var max_value_x = typeof input.max_value_x == 'string' && input.max_value_x.length > 0 && input.max_value_x.length <= 32 ? input.max_value_x : false;
    var max_value_y = typeof input.max_value_y == 'number' ? input.max_value_y : false;
    var unit_y = typeof input.unit_y == 'string' && input.unit_y.length > 0 && input.unit_y.length < 5 ? input.unit_y : '';
    var data = typeof input.data != 'undefined' && input.data.length > 0 ? input.data : false;

    //Check if input is valid and callback if not
    if (!(title || legend_x || legend_y || scale || scale_res_x || scale_res_y || min_value_x || min_value_y || max_value_x || max_value_y || data)) {
        log.write(2, 'Graph.js: Wrong input for create', { input: input }, function (err) { });
        callback(false);
    }

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
                        ////Print max_value_y
                        //image.print(font, 50, 50, max_value_y);

                        ////Print min_value_y
                        //image.print(font, 5, res_y - 150, min_value_y);

                        //Print min_value_x
                        image.print(font, 125, res_y - 75, min_value_x);

                        //Print max_value_x
                        image.print(font, res_x - 200, res_y - 75, max_value_x);

                        //Draw the scale lines on the x axis
                        var pixel_scale_x = Math.round((res_x - 200) / scale_res_x);
                        for (let i = 100 + pixel_scale_x; i < res_x - 100; i += pixel_scale_x) {
                            imageData = graph.drawLine(i, 100, i, res_y - 100, 4, 0x696969ff, imageData);
                        }
                        imageData = graph.drawLine(res_x - 100, 100, res_x - 100, res_y - 100, 4, 0x696969ff, imageData);
                        
                        //Draw the scale lines on the y axis
                        var pixel_scale_y = Math.round((res_y - 200) / scale_res_y);
                        for (let i = 100 + pixel_scale_y; i < res_y - 100; i += pixel_scale_y) {
                            imageData = graph.drawLine(100, i, res_x - 100, i, 4, 0x696969ff, imageData);
                        }
                        imageData = graph.drawLine(100, 100, res_x - 100, 100, 4, 0x696969ff, imageData);

                        //Draw scale text units on the y axis
                        var lines_y = Math.round((res_y - 200) / pixel_scale_y);
                        var value = 0;
                        image.print(font, 115, res_y - 140, value.toString() + unit_y);
                        for (var i = 1; i < lines_y + 1; i++) {
                            value = (max_value_y / lines_y) * i;
                            var y = (res_y - 100) - (pixel_scale_y * i) - 40;
                            image.print(font, 115, y, value.toString() + unit_y);
                        }

                        //Draw vertical outline
                        imageData = graph.drawLine(100, 100, 100, res_y - 75, 8, 0x000000ff, imageData);

                        //Draw horizontal outline
                        imageData = graph.drawLine(75, res_y - 100, res_x - 100, res_y - 100, 8, 0x000000ff, imageData);


                        //Draw the data
                        var graphColor = 0xff0000ff;
                        var width_x = res_x - 200;
                        var new_data = [];
                        //Is data too short?
                        if (data.length < width_x) {
                            //Make it longer
                            var pixels_to_add = width_x / data.length;
                            data.forEach((entry) => {
                                for (var i = 0; i < pixels_to_add; i++) {
                                    new_data.push(entry);
                                }
                            });
                            while (new_data.length + 1 != width_x) {
                                new_data.splice(Math.round(Math.random() * width_x), 1);
                            }
                        } else {
                            //Is data too long
                            if (data.length > width_x) {
                                new_data = data;
                                while (new_data.length + 1 != width_x) {
                                    new_data.splice(Math.round(Math.random() * width_x), 1);
                                }

                            } else {
                                new_data = data;
                            }
                        }
                        for (var x = 0; x < new_data.length; x++) {
                            for (var i = 0; i < 8; i++) {
                                var y = Math.round(res_y - 100 - (graph.valueToPixel(new_data[x], input) + graph.valueToPixel(new_data[x + 1], input) + graph.valueToPixel(new_data[x - 1], input) + graph.valueToPixel(new_data[x + 2], input)) / 4 + (i - 2));
                                try {
                                    imageData[y][x + 103] = graphColor;
                                } catch (e) { }
                            }
                        }



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