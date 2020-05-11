/*
*  WEB HELPERS
*  Contains various helper functions which are only necessary for the webserver
*/

//Dependencies
const fs = require('fs');
const _path = require('path');

//Create the container
var webHelpers = {};

//Extra function to combine readHtmlAndEncapsulate and insertVariables
webHelpers.finishHtml = function(data, site, callback){
  webHelpers.readHtmlAndEncapsulate(data.path, site, function(err, html){
    if(!err){
      webHelpers.insertVariables(data, html, function(err, finishedHtml){
        if(!err){
          callback(false, finishedHtml);
        }else{
          callback(err, false);
        }
      });
    }else{
      callback(err, false);
    }
  });
};

//Reads in an html file and encapsulates it
webHelpers.readHtmlAndEncapsulate = function(path, site, callback){
  let headerPath, footerPath;
  headerPath = site === 'paxterya' ? _path.join(__dirname, '../../web/web/html/header.html') : 'false';
  footerPath = site === 'paxterya' ? _path.join(__dirname, '../../web/web/html/footer.html') : 'false';
  headerPath = site === 'paxteryaIndex' ? _path.join(__dirname, '../../web/web/html/header_index.html') : headerPath;
  footerPath = site === 'paxteryaIndex' ? _path.join(__dirname, '../../web/web/html/footer.html') : footerPath;

  fs.readFile(path, 'utf8', function(err, html){
    if(!err && html.length > 0){
      fs.readFile(headerPath, 'utf8', function(err, header){
        if(!err && header.length > 0){
          fs.readFile(footerPath, 'utf8', function(err, footer){
            if(!err && footer.length > 0){
              callback(false, header + html + footer);
            }else{
              callback('Couldnt open footer', false);
            }
          })
        }else{
          callback('Couldnt open header', false);
        }
      })
    }else{
      callback('Couldnt open file', false);
    }
  });
};

//Finish HTML files by replacing variables
webHelpers.insertVariables = function(data, file, callback){
  data.path = data.path.replace('/web/html', '');
  //Load variables
  require('./variables.js')(data, function(variables){
    //Loop through all possible variables and replace
    for(let key in variables){
      if(variables.hasOwnProperty(key)){
        let find = '{' + key + '}';
        let replace = variables[key];
        if(typeof replace == 'function'){
          replace(function(output){
            file = file.split(find).join(output)
          });
        }else{
          file = file.split(find).join(replace);
        }
      }
    }
    //Callback the new file
    callback(false, file);
  });
};

//Export the container
module.exports = webHelpers;
