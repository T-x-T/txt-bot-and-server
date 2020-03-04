/*
 *  APPLICATION HANDLER
 *  This file hanles everything that has something to do with applications
 */

//Dependencies
const config     = require('./../config.js');
const log        = require('./log.js');
const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;
const mc_helpers = require('./mc_helpers.js');
const email      = require('./email.js');
const oauth      = require('./oauth2.js');
const sanitize   = require('sanitize-html');
const data       = require('./data.js');
const discord_helpers = require('./../discord-bot/discord_helpers.js');

//Create the container
var application = {};

//Save an application
application.write = function(input, callback){
  //Check if all inputs are ok
  mc_helpers.getUUID(input.mc_ign, function(uuid){
    if(uuid){
      //Get all applications of the member to find out if they already have accepted or pending review applications
      application.readAll({$or: [{mc_uuid: uuid}, {discord_id: input.discord_id}]}, function(err, docs){
        console.log(docs);
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
              let document = new applicationModel({
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
                publish_country:  input.publish_country
              });
              document.save(function(err, doc){
                if(!err){
                  callback(201, false);
                  application.sendConfirmationEmail(input.mc_uuid);
                  discord_helpers.sendMessage('New application from ' + input.mc_ign + '\nhttps://paxterya.com/staff/application.html?id=' + doc.id, config['new_application_announcement_channel'], function(err){});
                }else{
                  log.write(2, 'application_write couldnt save an application to the db', {err: err, application: input});
                  callback(500, 'An error occured while trying to save your application');
                }
              });
            }else{
              log.write(0, 'application_write received a malformed request', {application: input});
              callback(400, 'One or more inputs are malformed');
            }
          }else{
            log.write(0, 'application_write received a request where the privacy policy or the rules werent accepted', {application: application});
            callback(400, 'You have to accept the rules and the privacy policy');
          }
        }else{
          callback(400, 'You still have an open application or you got already accepted!');
        }
      });
    }else{
      log.write(0, 'application_write couldnt verify the mc_ign', {application: input});
      callback(400, 'Couldnt verify your Minecraft In game Name! Maybe you misspelled it or mojangs API is currently down');
    }
  });
};

//Retrieve an application by mc_uuid
application.readNewestByMcUUID = function(mc_uuid, callback){
  applicationModel.findOne({mc_uuid: mc_uuid}, {}, {sort: {'timestamp': -1}}, function(err, doc){
    if(!err && doc){
      _internal.addNicks(doc, function(err, newDoc){
        if(!err){
          callback(newDoc);
        }else{
          callback(false);
        }
      });
    }else{
      callback(false);
    }
  });
};

//Retrieve an application by id
application.readById = function(id, callback){
  applicationModel.findOne({id: id}, {}, {}, function(err, doc){
    if(!err && doc){
      _internal.addNicks(doc, function(err, newDoc){
        if(!err){
          callback(newDoc);
        }else{
          callback(false);
        }
      });
    }else{
      callback(false);
    }
  });
};

//Retrieve all applications
application.readAll = function(filter, callback){
  applicationModel.find(filter, {}, {}, function(err, docs){
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

//Send an success email to tell the applicant that the application was sent successfully
application.sendConfirmationEmail = function(mc_uuid){
  //Get the latest application from the mc_uuid
  application.readNewestByMcUUID(mc_uuid, function(doc){
    if(doc){
      _internal.addNicks(doc, function(err, doc){
        if(!err){
          //Build the test for the mail
          let text = `Hi ${doc.mc_ign},\n`;
          text    += 'thank you for applying to join Paxterya! We are happy to tell you that we received your application successfully!\n',
          text    += 'Here are the details you sent us, please verify that this is all correct. If there are any mistakes or questions you may have, please do not hesitate to answer this email.\n\n';
          text    += `MC IGN: ${doc.mc_ign}\n`;
          text    += `MC UUID: ${doc.mc_uuid}\n`;
          text    += `Discord Nick: ${doc.discord_nick}\n`;
          text    += `Discord ID: ${doc.discord_id}\n`;
          text    += `Country: ${doc.country}\n`;
          text    += `Birth Month: ${doc.birth_month}\n`;
          text    += `Birth Year: ${doc.birth_year}\n`;
          text    += `About me: ${doc.about_me}\n`;
          text    += `Motivation: ${doc.motivation}\n`;
          text    += `Buildings: ${doc.build_images}\n`;
          text    += `Publish about me: ${doc.publish_about_me}\n`;
          text    += `Publish age: ${doc.publish_age}\n`;
          text    += `Publish country: ${doc.publish_country}\n\n`;
          text    += 'You will hear back from us within a few days tops.\n';
          text    += 'We wish you the best of luck,\nExxPlore and TxT';

          email.send(doc.email_address, 'We have received your application', text);
        }else{
          log.write(2, 'application_sendConfirmationEmail couldnt get the nicks for the user', {mc_uuid: mc_uuid});
        }
      });
    }else{
      log.write(2, 'application_sendConfirmationEmail cant get the data for the user', {mc_uuid: mc_uuid});
    }
  });
};

application.changeStatus = function(id, newStatus, reason, callback){
  //Get the application, so we can update it and save it back
  application.readById(id, function(doc){
    if(doc){
      if(doc.status == 1){
        doc.status = newStatus;
        if(newStatus == 2 && reason) doc.deny_reason = reason;

        //Save the changes back to the db
        applicationModel.findOneAndUpdate({id: id}, doc, function(err){
          if(!err){
            //Execute the correct workflow based on status
            if(newStatus == 2){
              //Member got denied
              //Build the text for the email
              let text = '';
              text += `Hi ${doc.mc_ign},\n`;
              text += 'we read your application and decided it was not good enough and didnt meet our standards.\n';
              text += 'We came to this conclusion for the following reason:\n';
              text += reason;
              text += '\nYou have two options now:\n';
              text += 'If you believe you can write a better application, then we welcome you to write us another one!\n';
              text += 'Alternatively, you can search for another server that better suits your needs and preferences.\n';
              text += 'No matter how you decide, we wish you the best of luck for the future!\n';
              text += 'Yours sincerly,\nExxPlore and TxT';

              //Send the email
              email.send(doc.email_address, 'Your application was unsuccessful :(', text);

              //We are done
              callback(200);
            }else{
              if(newStatus == 3){
                //Member got accepted
                //Build the text for the email
                let text = '';
                text += `Hi ${doc.mc_ign},\n`;
                text += 'we liked your application and want you in our community. Congratulations!\n';
                text += 'Please read the rest of this mail, so you know what you have to do now!\n';
                text += '1. Join our Discord server if you havent already. Here is the invite link in case you missed it: http://discord.gg/mAjZCTG\n';
                text += '2. Once you have joined, our bot will notice and give you the right roles and whitelist you on the Minecraft server.\n';
                text += '3. Join the server and have fun!\n';
                text += '4. Engage with the community for even more fun.\n';
                text += 'For more information please check out the FAQ on our website: https://paxterya.com/faq\n';
                text += 'If something isnt working properly or if you have questions and suggestions for the application process, please do not hesitate to contact TxT#0001 on Discord or reply to this mail.\n';
                text += 'Yours sincerly,\nExxPlore and TxT';

                //Send the email
                email.send(doc.email_address, 'Welcome! You got accepted :)', text);

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
application.acceptWorkflow = function(discord_id, app){
  //1. Create the member object in the db
  data.checkMemberExist(discord_id, true, function(exists){
    //It doesnt matter if the member already exists or not, we can now get their object and modify it
    data.getUserData(discord_id, function(err, doc){
      if(!err){
        doc.mcName = app.mc_ign;
        doc.mcUUID = app.mc_uuid;
        doc.birth_year = app.birth_year;
        doc.birth_month = app.birth_month;
        doc.country = app.country;
        doc.publish_age = app.publish_age;
        doc.publish_country = app.publish_country;
        doc.status = 1;

        //Save the changes back into the db
        data.updateUserData(discord_id, doc, function(err){
          if(!err){
            //2. Give the member the paxterya role
            discord_helpers.addMemberToRole(discord_id, discord_helpers.getRoleId('paxterya'), function(err){
              if(!err){
                //3. Whitelist the member on the server
                mc_helpers.rcon(`whitelist add ${app.mc_ign}`);
                discord_helpers.updateNick(app.discord_id);

                //4. Announce the new member on the discord and if publish_about_me is true, publish that too.
                let msg = '';
                if(app.publish_about_me) msg = `Welcome <@${app.discord_id}> to Paxterya!\nHere is the about me text they sent us:\n${app.about_me}`;
                  else msg = `Welcome <@${app.discord_id}> to Paxterya!`

                discord_helpers.sendMessage(msg, config['new_member_announcement_channel'], function(err){
                  if(err) log.write(2, 'application.acceptWorkflow couldnt send the welcome message', {err: err});
                });
              }else{
                log.write(2, 'application.acceptWorkflow couldnt add the member to the paxterya role', {});
              }
            });
          }else{
            log.write(2, 'application.acceptWorkflow couldnt update the member object', {err: err});
          }
        });
      }else{
        log.write(2, 'application.acceptWorkflow couldnt get the member object', {});
      }
    });
  });
};

//Set up the application schema
var applicationSchema = new Schema({
  id:{
    type:           Number,
    index:          true,
    unique:         true,
    default:        0
  },
  timestamp:        Date,
  mc_uuid:          String,
  discord_id:       String,
  email_address:    String,
  country:          String,
  birth_month:      Number,
  birth_year:       Number,
  about_me:         String,
  motivation:       String,
  build_images:     String,
  publish_about_me: Boolean,
  publish_age:      Boolean,
  publish_country:  Boolean,
  status:           {
    type:           Number,
    default:        1         //1 = pending review; 2 = denied; 3 = accepted
  },
  deny_reason:      String,
  testing:          {
    type:           Boolean,
    default:        false
  }
});

//Code from stackoverflow to increment the counter id
applicationSchema.pre('save', function (next) {
  // Only increment when the document is new
  if (this.isNew) {
    applicationModel.count().then(res => {
      this.id = res; // Increment count
      next();
    });
  } else {
    next();
  }
});

//Set up the model
var applicationModel = mongoose.model('applications', applicationSchema);

var _internal = {};

//Adds the current discord nick and mc ign to an application object
_internal.addNicks = function(doc, callback){
  oauth.getUserObjectById(doc.discord_id, function(userObject){
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
