/*
 *  Contains our selfmade framework to make lots of things easier
 */

var framework = {};

//Everything handling popups
framework.popup = {};

//Create a basic popup from a div
//options: div: the div to put into the popup; confirmClose: add confirmation before closing if true; closeCall: function to call before destroying giving back the popup and callback; title: the title lol
//callback: entire popup div
framework.popup.create = function(options, callback){
  if(options.hasOwnProperty('div')){
    //Clone template
    let popup = document.getElementById('popup').cloneNode(true);
    
    //Add title
    if(options.title) popup.childNodes[1].childNodes[1].childNodes[1].childNodes[1].innerText = options.title;
    else popup.childNodes[1].childNodes[1].childNodes[1].childNodes[1].innerText = "";

    //Add the given div as child
    popup.childNodes[1].childNodes[3].appendChild(options.div);
    
    //Attach popup to the DOM   
    document.body.appendChild(popup);

    //Make popup visible
    popup.hidden = false;

    $('html').css('overflow', 'hidden');

    //Add options to popup
    popup.options = options;

    //Add close function to popup
    popup.close = function(){
      //Check if we need to confirm the close
      if(popup.options.confirmClose){
        //Ask for confirmation
        framework.popup.create_confirmation({}, function(confirmed){
          if(confirmed){
            //Yes, close the popup please
            framework.popup.close_for_real(popup);
          }else{
            //Do nothing
          }
        });
      }else{
        //Dont ask for confirmation
        framework.popup.close_for_real(popup);
      }
    };

    //Callback the popup
    callback(popup);
  }else{
    callback(false);
  }
};

//Deletes the given popup, no confirmation, NEVER CALL THIS!! THIS IS ONLY TO BE CALLED FROM WITHING popup.close()
framework.popup.close_for_real = function(popup){
  //Execute the closeCall function if it got attached
  if(typeof popup.options.closeCall == 'function') {
    popup.options.closeCall(popup, function() {
      popup.parentNode.removeChild(popup);
    });
  } else {
    //No closeCall function given, just delete
    popup.parentNode.removeChild(popup);
  }
  $('html').css('overflow', 'scroll');
};

//Calls the close function of the popup
framework.popup.bg_click = function(popup) {
  popup.close();
};

//Calls the close function of the popup
framework.popup.cancel_click = function(popup) {
  popup.close();
};

//Uses framework.popup.create to create a textbox for inputing text
//options: maxlength, required, text; title: the title lol
//callback: user input, or false if there is no input given (was cancelled by user)
framework.popup.create_textbox = function(options, callback){
  //Clone textbox template
  let textbox = document.getElementById('textbox-popup').cloneNode(true);
  textbox.hidden = false;

  //Apply options
  if(options.maxLength) textbox.childNodes[1].maxLength = options.maxLength;
  if(options.required) textbox.childNodes[1].required = options.required;
  if(options.text) textbox.childNodes[1].innerText = options.text;

  let title = 'Sample textbox title';
  if(options.title) title = options.title;

  //Create the popup; confirmClose gets set to true once text gets entered
  framework.popup.create({div: textbox, confirmClose: false, title: title, closeCall: function(popup, _callback){
    //Stuff that should be done before closing
    //Check if we need to save
    if(popup.save){
      //Save input
      let input = textbox.childNodes[1].value;

      //Callback the user input
      callback(input);
    }else{
      callback(false);
    }
    //Callback to finally delete this
    _callback();
  }}, function(popup){
    //Callback of the create function
    
  });
};

//Saves the user input and closes the popup
framework.popup.textbox_save_click = function(popup){
  //Check if the user has entered any text, abort if not
  if(popup.childNodes[1].childNodes[3].childNodes[1].childNodes[1].value){
    //User entered text
    popup.save = true;
    popup.options.confirmClose = false;
    popup.close();
  }else{
    //User didnt enter text - show info popup
    framework.popup.create_info({text: 'Please enter some text before saving your new bulletin.'}, function(){});
  }
};

//Creates a confirmation popup
//options: text: text that is shown in the popup; title: the title lol
//Callback: true if user said yes, false if otherwise
framework.popup.create_confirmation = function(options, callback){
  //Clone the template
  let confirmation = document.getElementById('confirmation-popup').cloneNode(true);
  confirmation.hidden = false;

  let title = 'Confirmation';
  if(options.title) title = options.title;

  //Create the popup
  framework.popup.create({div: confirmation, confirmClose: false, title: title, closeCall: function(popup, _callback){
    //Stuff that should be done before closing
    callback(popup.confirmation);
    _callback();
  }}, function(popup){
    //Callback of the create function
    popup.options.confirmClose = false;
  });
};

//Gets executed when yes is clicked
framework.popup.confirmation_yes = function(popup){
  popup.confirmation = true;
  popup.close();
};

//Create a information popup
//options: text: text that is shown in the popup; title: the title lol
//callback: gets called once user closed it (no parameters)
framework.popup.create_info = function(options, callback){
  //Clone the template
  let info = document.getElementById('info-popup').cloneNode(true);
  info.hidden = false;

  //Apply the options
  if(options.text) info.childNodes[1].innerText = options.text;

  let title = 'Information';
  if(options.title) title = options.title;

  //Create the popup
  framework.popup.create({div: info, confirmClose: false, title: title}, function(){
    //Callback of the create function

  });
};


//everything handling tables
framework.table = {};

//Initialize a table; This sets up the DOM object with our custom functions
//options: required:api_path to get data, data_mapping: function that turns one object from the api into an array of values that can be put into a single row
//         optional: api_method, edit_bar id of the edit_bar, edit_bar_filter_column: set a column for filtering, edit_bar_filter_value: value for the filter, row_onclick: function, expand_row: (bool) when true it expands the clicked row
framework.table.init = function(table, options){
  if(!options.hasOwnProperty('api_method')) options.api_method = 'GET';
  if(!options.hasOwnProperty('edit_bar')) options.edit_bar = false;
  if(!options.hasOwnProperty('row_onclick')) options.row_onclick = false;

  //Attach all the neccessary things to the table
  table.options = options;
  table.update = framework.table.update;
  table.filter = framework.table.filter;
  table.data_mapping = options.data_mapping;
  table.add_row = framework.table.add_row;
  table.remove_row = framework.table.remove_row;
  table.remove_all_rows = framework.table.remove_all_rows;
  table.select_row = framework.table.select_row;

  //If we have an edit bar, remove it from the DOM and store in the table
  if(table.options.edit_bar){
    let edit_bar = document.getElementById(table.options.edit_bar);
    edit_bar.hidden = true;
    table.edit_bar = edit_bar.cloneNode(true);
    table.tBodies[0].removeChild(edit_bar);
  }

  //Update table, to fill it with data
  table.update();
};

//Update the data of the table, based on filter, if given
framework.table.update = function(filter){
  if(typeof filter == 'undefined') filter = false;
  if(!filter) filter = this.options.filter;

  //Set table to this, so we can use it later on
  let table = this;

  //Query the api for the data
  _internal.send(this.options.api_path, false, this.options.api_method, filter, false, function(status, res){
    if(status == 200 && res.length > 0){
      //Remove all existing rows including the edit row
      if(table.options.edit_bar && table.hasOwnProperty('last_expanded_row' && document.getElementById(table.options.edit_bar))) table.tBodies[0].removeChild(document.getElementById(table.options.edit_bar));
      table.remove_all_rows();

      //Add the data to the table
      res.forEach((_res) => {
        table.add_row(_res);
      });
    }else{
      window.alert('Failed to update table');
    }
  });
};

//Filters the table
//The id is the number of which td to filter after and the filter is the keyword that should be checked, include: include/exclude keyword
framework.table.filter = function(id, filter, include){
  let table = this;
  let rows = table.rows;

  if(!filter){
    //No filter given, show all rows again
    for(let i = 1;i < rows.length;i++) rows[i].hidden = false;
  }else{
    //Loop through all rows and test them against our filter, hide if neccessary
    for(let i = 1;i < rows.length;i++) {
      let match = rows[i].cells[id].innerText == filter;
      rows[i].hidden = ((include && !match) || (!include && match)) //Credit to Zyl 
    }
  }
};

//Add row to the table
//Values: either an array or an object of values, if its an object convert to an array using the data_mapping function
//raw_data: optional object containing the raw data for the row, useful for editing/removing it later on and passing that data to the api
framework.table.add_row = function(values, raw_data){
  //Check if we got an object and thus have to convert it first
  if(!Array.isArray(values)){
    //We gotta convert the object to an array using the data_mapping function
    this.add_row(this.data_mapping(values), values);
  }else{
    //We got an array, create the row and append to the table
    //Create row and append values in separate td's
    let row = document.createElement('tr');
    values.forEach((value) => {
      let temp_td = document.createElement('td');
      temp_td.innerText = value;
      row.appendChild(temp_td);
    });
    //Add the onclick event 
    row.onclick = this.select_row;
    row.table = this;

    //Add raw_data if neccessary
    if(typeof raw_data == 'object') row.raw_data = raw_data;

    //Append row to the table
    this.tBodies[0].appendChild(row);
  }
};

//Remove row from the table
//when index is given remove row at index, otherwise remove row this was called on
framework.table.remove_row = function(index){
  if(typeof index != 'undefined'){
    //Remove row at index
    this.deleteRow(index);
  }
};

//Cleares all rows from table                               @TODO removes one row too few when called from update
framework.table.remove_all_rows = function(){
  while(this.rows.length > 1) this.remove_row(-1);
};

//Select row; this is called to append the edit_row behind this one
//when index is given act on the row at the index, otherwise at the row this was called on; bs is the click event
framework.table.select_row = function(bs, index){
  if(typeof index == 'undefined') index = this.rowIndex;
  let table = this.table;
  let row = table.rows[index];
  
  //Check if we need to expand this row
  if(table.options.expand_row == true){
    //Check if there already is an expanded row
    if(table.hasOwnProperty('last_expanded_row') && index !== table.last_expanded_row){
      //There is already an expanded row, collapse it
      table.rows[table.last_expanded_row].style["white-space"] = "nowrap";
    }
    //Check if user clicked same row again
    if(index === table.last_expanded_row){
      //User clicked it again, collapse it
      row.style["white-space"] = "nowrap";
      delete table.last_expanded_row;

      //Remove the edit bar, if neccessary
      let edit_bar = document.getElementById(table.options.edit_bar);
      if(edit_bar) row.parentNode.removeChild(edit_bar);

    }else{
      //Expand current row
      table.last_expanded_row = index;
      row.style["white-space"] = "pre-line";

      //Check if we need to do something about the edit bar
      if(table.options.edit_bar) {
        //Check if we need to extra work with filtering
        if(table.options.edit_bar_filter_value){
          //Check if the filter applies here
          if(row.cells[table.options.edit_bar_filter_column].innerText == table.options.edit_bar_filter_value){
            let edit_bar = row.parentNode.insertBefore(table.edit_bar, row.nextSibling);
            edit_bar.hidden = false;
          }
        }else{
          let edit_bar = row.parentNode.insertBefore(table.edit_bar, row.nextSibling);
          edit_bar.hidden = false;
        }
      }
    }
  }

  //Execute the onclick function if neccessary
  if(table.options.row_onclick) this.onclick = table.options.row_onclick(this);

  //Set the onclick property to this function here again; no idea why, but the onclick event gets cleared once we execute it
  row.onclick = framework.table.select_row;
};


//Everything handling lists
framework.list = {};

//Call this to initialize div-list
//Options:
//Required: div:          div that should act as the root of the list, this will get all the functions attached to it
//          api_path:     path to the api endpoint that serves the raw_data
//          data_mapping: function that converts raw_data to array of values to populate the template div
//          template:     template that gets cloned and filled with data from data_mapping
//          default_sort: default sort of the list, the default this is the first item returned by data_mapping in asc order
//Optional: api_method:   api method for querying the api, GET per default
//          onclick:      function that should get executed when the user clicks on an element
//          display_mode: horizontal or vertical (default)
framework.list.init = function(options){
  //Set default values for optional options that arent specified
  if(!options.hasOwnProperty('api_method')) options.api_method = 'GET';
  if(!options.hasOwnProperty('onclick')) options.onclick = false;
  if(!options.hasOwnProperty('display_mode')) options.display_mode = 'vertical';

  //Attach everything to the root div
  options.div.options = options;
  options.div.update = framework.list.update;
  options.div.filter = framework.list.filter;
  options.div.sort = framework.list.sort;
  options.div.classList.add('horizontal-scroll-container');

  //DOM object is set-up, update
  options.div.update({});
};

//optional options: filter, sort
framework.list.update = function(options){
  let div = this;
  let sort = options.hasOwnProperty('sort') ? options.sort : div.options.default_sort;
  let filter = options.hasOwnProperty('filter') ? options.filter : false;

  //Get data from api
  _internal.send(div.options.api_path, false, div.options.api_method, filter, false, function(status, res){
    if(status == 200){
      
      div.raw_data = res;
      div.sort(sort)

    }else{
      console.log(status, res)
      framework.popup.create_info({title: 'Error', text: `status code: ${status}, response:\n${res}`});
    }
  });
};

//Sort all items based on sorting
framework.list.sort = function (sort) {
  let div = this;

  //Remove all child object from div
  while (div.firstChild) div.removeChild(div.lastChild);

  //Sort res
  div.raw_data = _internal.sortArray(div.raw_data, sort.split('.')[0], sort.split('.')[1]);

  //Call add_element function to build up the list
  div.raw_data.forEach((raw_data) => {
    framework.list.add_element(raw_data, div.options.div);
  });
};

//Only show items that match filter
framework.list.filter = function(filter){
  Array.from(this.childNodes).forEach((element) => {
    let match = false;
    if(this.options.hasOwnProperty('filterable') && Array.isArray(this.options.filterable)){
      this.options.filterable.forEach((single) => {
        if(element.hasOwnProperty('raw_data') && element.raw_data.hasOwnProperty(single) && typeof element.raw_data[single] === 'string' && element.raw_data[single].toLowerCase().includes(filter.toLowerCase())) match = true;
      });
    }else{
      for(let key in element.raw_data) if(typeof element.raw_data[key] === 'string' && element.raw_data[key].toLowerCase().includes(filter.toLowerCase())) match = true;
    }
    if (match) {
      element.style = "display: flex;";
    } else {
      element.style = "display: none;"
    }
  });
};

//Appends new element and fill it with data
framework.list.add_element = function(raw_data, div){
  let element = div.options.template.cloneNode(true);

  //Send raw_data through data mapping
  let mapped_data = div.options.data_mapping(raw_data);
  
  //Use mapped_data to fill out the template
  mapped_data.forEach((data) => {
    let child = element.querySelector(`#${data.element_id}`)
    if(child) child[data.property] = data.value;

    //Remove all elements and descriptors with value false
    if(child && (!data.value || data.value == "false")){
      child.parentNode.removeChild(element.querySelector(`#${data.descriptor_id}`));
      child.parentNode.removeChild(child);
    }
  });

  //Add raw_data to element
  element.raw_data = raw_data;
  
  //Append element to div
  div.appendChild(element);

  //Make element visible
  element.style.display = null;
};