/*
 *  APPLICATION HANDLER
 *  This file hanles everything that has something to do with applications
 */

//Dependencies
const mc_helpers = require('../minecraft');
const discord_api= require('../discord_api');
const sanitize   = require('sanitize-html');
const data       = require('../data');
const MemberFactory = require('../user/memberFactory.js');
const memberFactory = new MemberFactory();
memberFactory.connect();

//Create the container
var application = {};

//Save an application
application.write = function(input, callback){
  //Check if all inputs are ok
  mc_helpers.getUUID(input.mc_ign, function(er, uuid){
    if(uuid){
      //Get all applications of the member to find out if they already have accepted or pending review applications
      application.read({$or: [{mc_uuid: uuid}, {discord_id: input.discord_id}]}, false, function(err, docs){
        let ok = true;
        docs.forEach((doc) => {
          if(doc.status == 1 || doc.status == 3) ok = false;
        });
        if(ok){
          input.mc_uuid = uuid;
          //Now we can verify the rest
          input.discord_id       = typeof input.discord_id       == 'string' && input.discord_id.length >= 17 && input.discord_id.length <= 18 ? input.discord_id : false;
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
              _internal.addNicks(document, {fromApi: true}, function(err, newDoc){
                data.new(newDoc, 'application', false, function(err, doc){
                  if(!err){
                    callback(201, false);
                    emitter.emit('application_new', doc);
                  }else{
                    global.log(2, 'application', 'application_write couldnt save an application to the db', {err: err, application: input});
                    callback(500, 'An error occured while trying to save your application');
                  }
                });
              });
            }else{
              global.log(0, 'application', 'application_write received a malformed request', {application: input});
              callback(400, 'One or more inputs are malformed');
            }
          }else{
            global.log(0, 'application', 'application_write received a request where the privacy policy or the rules werent accepted', {application: application});
            callback(400, 'You have to accept the rules and the privacy policy');
          }
        }else{
          callback(400, 'You still have an open application or you got already accepted!');
        }
      });
    }else{
      global.log(0, 'application', 'application_write couldnt verify the mc_ign', {application: input});
      callback(400, 'Couldnt verify your Minecraft In game Name! Maybe you misspelled it or mojangs API is currently down');
    }
  });
};

//Retrieve all applications
application.read = function(filter, options, callback){
  data.get(filter, 'application', false, function(err, docs){
    if(!err){
      if (options.addNicks) {
        //Iterate over all items and add the current discord nick and mc ign
        let count = 0;
        for (let i = 0; i < docs.length; i++) {
          if (!docs[i].mc_ign || !docs[i].discord_nick || docs[i].discord_nick == 'load#ing') {
            _internal.addNicks(docs[i], { fromApi: true }, function (err, newDoc) {
              if (!err) {
                docs[i] = newDoc;
                //If this was the last item, Callback
                count++;
                if (count == docs.length) callback(false, docs);
              } else {
                if (count == docs.length) callback(false, docs);
              }
            });
          } else {
            count++;
            if (count == docs.length) callback(false, docs);
          }
        }
      if(docs.length == 0) callback(false, docs);
      }else{
        if(docs.length === 0){
          callback(err, docs)
        } else {
          //Iterate over all items and add the urls
          for (let i = 0; i < docs.length; i++) {
            discord_api.getAvatarUrl(docs[i].discord_id, function (discord_avatar_url) {
              docs[i].discord_avatar_url = discord_avatar_url;
              docs[i].mc_skin_url = mc_helpers.returnRenderUrl(docs[i].mc_uuid);
              if (i + 1 == docs.length) callback(err, docs)
            });
          }
        }
      }
    }else{
      callback(true, false);
    }
  });
};

application.changeStatus = function(id, newStatus, reason, force, callback){
  //Get the application, so we can update it and save it back
  application.read({id: id}, false, function(err, doc){
    doc = doc[0];
    if(doc){
      if(doc.status == 1 || force){
        doc.status = newStatus;
        if(newStatus == 2 && reason) doc.deny_reason = reason;

        //Save the changes back to the db
        data.edit(doc, 'application', false, function(err, newDoc){
          if(!err && newDoc){
            //Execute the correct workflow based on status
            if(newStatus == 2){
              //Member got denied
              emitter.emit('application_denied', newDoc);
              //We are done
              callback(200);
            }else{
              if(newStatus == 3){
                //Member got accepted
                emitter.emit('application_accepted', newDoc);
                callback(200);
              }else{
                if(newStatus === 1){
                  global.log(2, 'application', 'application.changestatus changed a status the pending again, this gets triggered through an admin command or its a terrible bug', { err: err, id: id, newStatus: newStatus, reason: reason, application: doc });
                  callback(200);
                }else{
                  callback(500, 'If we got here, something went very, very wrong');
                }
              }
            }
          }else{
            global.log(2, 'application', 'application.changestatus couldnt save changes into the database', {err: err, id: id, newStatus: newStatus, reason: reason, application: doc});
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

//This functions emits the even necessary so everything makes an accepted member a real member:
//1. Create the member object in the db
//2. Give the member the paxterya role
//3. Whitelist the member on the server
//4. Announce the new member on the discord and if publish_about_me is true, publish that too.
//Then the member will automatically appear in the member list on the website as well
application.acceptWorkflow = function(discord_id, app){
  if (!app.mc_ign || !app.discord_nick || app.discord_nick == 'load#ing') {
    _internal.addNicks(app, false, function (err, doc) {
      if (err || !doc) global.log(2, 'application', 'application.acceptWorkflow couldnt get the ign', { application: app, newDoc: doc, err: err });
      if (!err) app = doc;
      global.log(0, 'application', 'emitted application_accepted_joined with having to add nicks', { application: app });
      emitter.emit('application_accepted_joined', app);
      _internal.createMember(app);
    });
  } else {
    global.log(0, 'application', 'emitted application_accepted_joined without having to add nicks', { application: app });
    emitter.emit('application_accepted_joined', app);
    _internal.createMember(app);
  }
};


var _internal = {};

_internal.createMember = function(a){
  memberFactory.getByDiscordId(a.discord_id)
  .then(member => {
    if(member){
      try{
        member.setDiscordUserName(a.discord_nick);
        member.setMcUuid(a.mc_uuid);
        member.setMcIgn(a.mc_ign);
        member.setCountry(a.country);
        member.setBirthMonth(a.birth_month);
        member.setBirthYear(a.birth_year);
        member.setPublishAge(a.publish_age);
        member.setPublishCountry(a.publish_country);
        member.setStatus(1);
        member.save();
      }catch(e){
        global.log(2, 'application', 'failed to configure existing member object', {application: a, member: member, err: e.message});
        throw e;
      }
    }else{
      memberFactory.create(a.discord_id, a.discord_nick, a.mc_uuid, a.mc_ign, a.country, a.birth_month, a.birth_year, a.publish_age, a.publish_country, 1);
    }
  })
  .catch(e => {
    global.log(2, 'application', 'failed to get user object of accepted member', {application: a, err: e.message});
  });
};

//Adds the current discord nick and mc ign to an application object
_internal.addNicks = function (doc, options, callback) {
  discord_api.getUserObject({ id: doc.discord_id }, options, function (err, userObject) {
    if (err || !userObject) global.log(0, 'application', 'application.addNicks couldnt get the discord user object', { doc: doc });
    mc_helpers.getIGN(doc.mc_uuid, function (err, mc_ign) {
      if (!err && mc_ign) {
        try {
          doc = doc.toObject(); //Convert to a normal object
        } catch (e) { }

        doc.discord_nick = userObject.username + '#' + userObject.discriminator;
        doc.mc_ign = mc_ign;
        callback(false, doc);
      } else {
        global.log(0, 'application', 'application.addNicks couldnt get the mc_ign', { doc: doc, userObject: userObject });
        callback('application.addNicks couldnt get the mc_ign', false);
      }
    });
  });
};

//Export the container
module.exports = application;
