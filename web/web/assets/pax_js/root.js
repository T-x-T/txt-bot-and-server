/*
 *
 *  This file contains all front-end javascript logic thats necessary to interface with the backend
 *
 */

//Holder for all functions
var root = {};

//Container for all functions necessary for post.html to work properly
root.post = {};

//Init for post.html
root.post.init = function(){
  if(_internal.getQueryValue('id') === 'new'){ 
    root.post.edit();
    document.getElementById('post-preview').hidden = true;
  }
};

//Changes the editing mode
root.post.edit = function(){
  if(_internal.getQueryValue('id') != 'new'){
    //Get the current data of the post if its not new
    _internal.send('post', false, 'GET', {id: _internal.getQueryValue('id')}, false, function(status, res) {
      if(status == 200){
        document.getElementById('edit-title').value = res[0].title;
        document.getElementById('edit-author').value = res[0].author;
        document.getElementById('edit-body').value = res[0].body;
        document.getElementById('edit-date').value = new Date(res[0].date).toISOString().substring(0, 10);
        document.getElementById('edit-public').checked = res[0].public;
      }else{
        window.alert('Couldnt load post ): ', res);
      }
    });
  }

  //Show the edit form
  document.getElementById("post-edit-form").hidden = false;
};

root.post.send = function(){
  //Build the object
  let postData = {
    title: document.getElementById('edit-title').value,
    author: document.getElementById('edit-author').value,
    body: document.getElementById('edit-body').value,
    date: document.getElementById('edit-date').value,
    public: document.getElementById('edit-public').checked
  };

  //Add the post id to the object, if its not new
  if(_internal.getQueryValue('id') !== 'new') postData.id = _internal.getQueryValue('id');

  _internal.send('post', false, 'POST', false, postData, function(status, res){
    if(status != 200) window.alert(res);
    else window.alert('Success!');
  });
};

