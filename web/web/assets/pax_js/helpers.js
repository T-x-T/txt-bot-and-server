/*
 *  Contains helpful functions
 */

var _internal = {};

//Used to send the payload (JS Object) to an api path
_internal.send = function(path, headers, method, queryStringObject, payload, callback){
  //Build the querystring
  let querystring = '';
  for(let key in queryStringObject){
    querystring += key + '=' + queryStringObject[key] + '&';
  }

  //Build the correct requestUrl
  let requestUrl = `https://${document.location.host}/api/${path}?${querystring}`

  console.debug(method + requestUrl);

  //Start building the ajax request
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl);
  xhr.setRequestHeader("Content-type", "application/json");

  //Add the headers
  for(let key in headers){
    if(headers.hasOwnProperty(key)) xhr.setRequestHeader(key, headers[key]);
  }

  //Send the request
  xhr.send(JSON.stringify(payload));

  //Handle the response
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE) {
      var status = xhr.status;
      var response = xhr.responseText;

      // Callback if necessary
      if(callback){
        let error = false;
        try{
          response = JSON.parse(response)
        } catch(err){
          error = true;
        }
        if(!error) callback(status, response);
          else callback(status, false);
      }
    }
  }
};

//Used to get the value of the given querystring param
_internal.getQueryValue = function(param){
  let query = document.location.search.replace('?','').replace('#','').split('&');
  if(query[0].length < 2) query.pop();
  if(query.length > 0){
    let value = 0;
    while(typeof value != 'string'){
      if(query[value].split('=')[0] == param) value = query[value].split('=')[1];
        else value++;
    }
    return value;
  }else{
    return false;
  }
};

_internal.sortings = {
  0: ['joined_date', 'asc'],
  1: ['joined_date', 'desc'],
  2: ['playtime', 'asc'],
  3: ['playtime', 'desc'],
  4: ['age', 'asc'],
  5: ['age', 'desc'],
  6: ['mc_nick', 'asc'],
  7: ['mc_nick', 'desc'],
  8: ['discord_nick', 'asc'],
  9: ['discord_nick', 'desc'],
};

//Sorts an array of objects based on the given key 'asc' or 'desc'
_internal.sortArray = function(input, property, order = 'asc'){
  if(order === 'asc'){
    return input.sort((a, b) => {
      if (a[property] > b[property]) return 1;
      if (a[property] < b[property]) return -1;
      return 0;
    });
  }else{
    return input.sort((a, b) => {
      if (a[property] < b[property]) return 1;
      if (a[property] > b[property]) return -1;
      return 0;
    });
  }
};

//Removes all children of given element, only keeps children with the id == blacklist_id
_internal.clearChildren = function(elementToClear, blacklist_id){
  let children = elementToClear.children;
  
  for (let i = 0; i < children.length; i++) {
    if (children[i].id != blacklist_id) children[i].parentNode.removeChild(children[i]);
  };
};