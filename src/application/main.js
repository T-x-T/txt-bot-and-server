/*
 *  APPLICATION HANDLER
 *  This file hanles everything that has something to do with applications
 */

//Dependencies
const config     = require('../../config.js');
const mc_helpers = require('../minecraft/mc_helpers.js');
const discord_api= require('../discord_api');
const sanitize   = require('sanitize-html');
const data       = require('../data');
const discord_helpers = require('../discord_bot/discord_helpers.js');

//Create the container
var application = {};

//Save an application
application.write = function(input, callback){
  //Check if all inputs are ok
  mc_helpers.getUUID(input.mc_ign, function(uuid){
    if(uuid){
      //Get all applications of the member to find out if they already have accepted or pending review applications
      application.read({$or: [{mc_uuid: uuid}, {discord_id: input.discord_id}]}, function(err, docs){
        let ok = true;
        docs.forEach((doc) => {
          if(doc.status == 1 || doc.status == 3) ok = false;
        });
        if(ok){
          input.mc_uuid = uuid;
          //Now we can verify the rest
          input.discord_id       = typeof input.discord_id       == 'string' && input.discord_id.length == 18 ? input.discord_id : false;
          input.email_address    = typeof input.email_address    == 'string' && input.email_address.indexOf('@') > -1 ? input.email_address.trim() : false;
          input.country          = typeof input.country          == 'string' && input.country.length > 0 ? input.country.trim() : false;
          input.birth_month      = Number(input.birth_month)     >= 1 && Number(input.birth_month) <= 12 ? Number(input.birth_month) : false;
          input.birth_year       = Number(input.birth_year)      >= new Date().getFullYear() - 100 && Number(input.birth_year) <= new Date().getFullYear() ? Number(input.birth_year) : false;
          input.about_me         = typeof input.about_me         == 'string' && input.about_me.length > 0 && input.about_me.length <= 1500 ? input.about_me : false;
          input.motivation       = typeof input.motivation       == 'string' && input.motivation.length > 0 && input.motivation.length <= 1500 ? input.motivation : false;
          input.build_images     = typeof input.build_images     == 'string' && input.build_images.length > 0 && input.build_images.length <= 1500 ? input.build_images : '';
          input.publish_about_me = typeof input.publish_about_me == 'boolean' ? input.publish_about_me : false;
          input.publish_age      = typeof input.publish_age      == 'boolean' ? input.publish_age : false;
          input.publish_country  = typeof input.publish_country  == 'boolean' ? input.publish_country : false;

          if(input.accept_privacy_policy && input.accept_rules){
            if(input.discord_id && input.email_address && input.country && input.birth_month && input.birth_year && input.about_me && input.motivation){
              //Everything is fine, write to db
              let document = {
                timestamp:        Date.now(),
                mc_uuid:          input.mc_uuid,
                discord_id:       input.discord_id,
                email_address:    sanitize(input.email_address,{allowedTags: [], allowedAttributes: {}}),
                country:          input.country,
                birth_month:      input.birth_month,
                birth_year:       input.birth_year,
                about_me:         sanitize(input.about_me,{allowedTags: [], allowedAttributes: {}}),
                motivation:       sanitize(input.motivation,{allowedTags: [], allowedAttributes: {}}),
                build_images:     sanitize(input.build_images,{allowedTags: [], allowedAttributes: {}}),
                publish_about_me: input.publish_about_me,
                publish_age:      input.publish_age,
                publish_country:  input.publish_country,
                status:           1
              };
              data.new(document, 'application', false, function(err, doc){
                if(!err){
                  callback(201, false);
                  _internal.addNicks(document, function(err, newDoc){
                    emitter.emit('application_new', newDoc);
                  });
                  //discord_helpers.sendMessage('New application from ' + input.mc_ign + '\nhttps://paxterya.com/staff/application.html?id=' + doc.id, config['new_application_announcement_channel'], function(err){});
                }else{
                  global.log(2, 'application_write couldnt save an application to the db', {err: err, application: input});
                  callback(500, 'An error occured while trying to save your application');
                }
              });
            }else{
              global.log(0, 'application_write received a malformed request', {application: input});
              callback(400, 'One or more inputs are malformed');
            }
          }else{
            global.log(0, 'application_write received a request where the privacy policy or the rules werent accepted', {application: application});
            callback(400, 'You have to accept the rules and the privacy policy');
          }
        }else{
          callback(400, 'You still have an open application or you got already accepted!');
        }
      });
    }else{
      global.log(0, 'application_write couldnt verify the mc_ign', {application: input});
      callback(400, 'Couldnt verify your Minecraft In game Name! Maybe you misspelled it or mojangs API is currently down');
    }
  });
};

//Retrieve all applications
application.read = function(filter, callback){
  data.get(filter, 'application', false, function(err, docs){
    if(!err){
      //Iterate over all items and add the current discord nick and mc ign
      let count = 0;
      for(let i = 0; i < docs.length; i++){
        _internal.addNicks(docs[i], function(err, newDoc){
          if(!err){
            docs[i] = newDoc;
            //If this was the last item, Callback
            count++;
            if(count == docs.length) callback(false, docs);
          }else{
            docs[i] = false;
          }
        });
      }
      if(docs.length == 0) callback(false, docs);
    }else{
      callback(true, false);
    }
  });
};

application.changeStatus = function(id, newStatus, reason, callback){
  //Get the application, so we can update it and save it back
  application.read({id: id}, function(err, doc){
    doc = doc[0];
    if(doc){
      if(doc.status == 1){
        doc.status = newStatus;
        if(newStatus == 2 && reason) doc.deny_reason = reason;

        //Save the changes back to the db
        data.edit(doc, 'application', false, function(err){
          if(!err){
            //Execute the correct workflow based on status
            if(newStatus == 2){
              //Member got denied
              emitter.emit('application_denied', doc);
              //We are done
              callback(200);
            }else{
              if(newStatus == 3){
                //Member got accepted
                emitter.emit('application_accepted', doc);
                //Check if the member is already on the discord server
                if(discord_helpers.isGuildMember(doc.discord_id)){
                  //Start the acception routine
                  application.acceptWorkflow(doc.discord_id, doc);
                  callback(200);
                }else{
                  //Member hasnt joined yet, so there is nothing to do
                  callback(200);
                }
              }else{
                callback(500, 'If we got here, something went very, very wrong');
              }
            }
          }else{
            callback(500, 'Couldnt save the changes back to the database');
          }
        });
      }else{
        callback(401, 'The application got already accepted or denied');
      }
    }else{
      callback(404, 'Couldnt get the application from the database, the id is probably invalid');
    }
  });
};

//This functions does everything necessary to make an accepted member a real member:
//1. Create the member object in the db
//2. Give the member the paxterya role
//3. Whitelist the member on the server
//4. Announce the new member on the discord and if publish_about_me is true, publish that too.
//Then the member will automatically appear in the member list on the website as well
application.acceptWorkflow = function(discord_id){
  application.read({discord_id: discord_id}, function(err, app){
    emitter.emit('application_accepted_joined', app[0]);
    
    
    /* app = app[0];
    if(!err && app){
      //1. Create the member object in the db
      user.checkMemberExist(discord_id, true, function(exists) {
        //It doesnt matter if the member already exists or not, we can now get their object and modify it
        user.getUserData(discord_id, function(err, doc) {
          if(!err) {
            doc.mcName = app.mc_ign;
            doc.mcUUID = app.mc_uuid;
            doc.birth_year = app.birth_year;
            doc.birth_month = app.birth_month;
            doc.country = app.country;
            doc.publish_age = app.publish_age;
            doc.publish_country = app.publish_country;
            doc.status = 1;

            //Save the changes back into the db
            user.updateUserData(discord_id, doc, function(err) {
              if(!err) {
                //2. Give the member the paxterya role
                discord_helpers.addMemberToRole(discord_id, discord_helpers.getRoleId('paxterya'), function(err) {
                  if(!err) {
                    //3. Whitelist the member on the server
                    mc_helpers.rcon(`whitelist add ${app.mc_ign}`);
                    discord_helpers.updateNick(app.discord_id);

                    //4. Announce the new member on the discord and if publish_about_me is true, publish that too.
                    let msg = '';
                    if(app.publish_about_me) msg = `Welcome <@${app.discord_id}> to Paxterya!\nHere is the about me text they sent us:\n${app.about_me}`;
                    else msg = `Welcome <@${app.discord_id}> to Paxterya!`

                    discord_helpers.sendMessage(msg, config['new_member_announcement_channel'], function(err) {
                      if(err) global.log(2, 'application.acceptWorkflow couldnt send the welcome message', {err: err});
                    });
                  } else {
                    global.log(2, 'application.acceptWorkflow couldnt add the member to the paxterya role', {});
                  }
                });
              } else {
                global.log(2, 'application.acceptWorkflow couldnt update the member object', {err: err});
              }
            });
          } else {
            global.log(2, 'application.acceptWorkflow couldnt get the member object', {});
          }
        });
      }); 
    }else{
      global.log(2, 'application.acceptWorkflow couldnt find the user', app);
    }
    */


  });
};



var _internal = {};

//Adds the current discord nick and mc ign to an application object
_internal.addNicks = function(doc, callback){
  discord_api.getUserObject({id: doc.discord_id}, false, function(err, userObject){
    if(userObject){
      mc_helpers.getIGN(doc.mc_uuid, function(mc_ign){
        if(mc_ign){
          try{
            doc = doc.toObject(); //Convert to a normal object
          }catch(e){}

          doc.discord_nick = userObject.username + '#' + userObject.discriminator;
          doc.mc_ign = mc_ign;
          callback(false, doc);
        }else{
          callback(true, false);
        }
      });
    }else{
      callback(true, false);
    }
  });
};

//Export the container
module.exports = application;
