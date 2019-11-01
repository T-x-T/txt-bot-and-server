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
const mail       = require('nodemailer');
const oauth      = require('./oauth2.js');

//Create the container
var application = {};

//Save an application
application.write = function(input, callback){
  //Check if all inputs are ok
  mc_helpers.getUUID(input.mc_ign, function(uuid){
    if(uuid){
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
            email_address:    input.email_address,
            country:          input.country,
            birth_month:      input.birth_month,
            birth_year:       input.birth_year,
            about_me:         input.about_me,
            motivation:       input.motivation,
            build_images:     input.build_images,
            publish_about_me: input.publish_about_me,
            publish_age:      input.publish_age,
            publish_country:  input.publish_country
          });
          document.save(function(err, doc){
            console.log(err, doc);
            if(!err){
              callback(201, false);
              application.sendConfirmationEmail(input.mc_uuid);
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
      log.write(0, 'application_write couldnt verify the mc_ign', {application: input});
      callback(400, 'Couldnt verify your Minecraft In game Name! Maybe you misspelled it or mojangs API is currently down');
    }
  });
};

//Retrieve an application by mc_uuid
application.readNewestByMcUUID = function(mc_uuid, callback){
  applicationModel.findOne({mc_uuid: mc_uuid}, {}, {sort: {'timestamp': -1}}, function(err, document){
    if(!err && document){
      callback(document);
    }else{
      callback(false);
    }
  });
}

//Retrieve all applications
application.readAll = function(filter, callback){
  applicationModel.find(filter, {}, {}, function(err, docs){
    if(!err){
      //Iterate over all items and add the current discord nick and mc ign
      let count = 0;
      for(let i = 0; i < docs.length; i++){
        oauth.getUserObjectById(docs[i].discord_id, function(userObject){
          if(userObject){
            mc_helpers.getIGN(docs[i].mc_uuid, function(mc_ign){
              if(mc_ign){
                docs[i] = docs[i].toObject(); //Convert to a normal object
                docs[i].discord_nick = userObject.username + '#' + userObject.discriminator;
                docs[i].mc_ign = mc_ign;

                //If this was the last item, Callback
                count++;
                if(count == docs.length) callback(false, docs);
              }else{
                callback(true, false);
              }
            });
          }else{
            callback(true, false);
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
      //Get the mc ign
      mc_helpers.getIGN(mc_uuid, function(ign){
        if(ign){
          //Get the discord username
          oauth.getUserObjectById(doc.discord_id, function(userObject){
            if(userObject){
              //Build the test for the mail
              let text = `Hi ${ign},\n`;
              text    += 'thank you for applying to join Paxterya! We are happy to tell you that we received your application successfully!\n',
              text    += 'Here are the details you sent us, please verify that this is all correct. If there are any mistakes or questions you may have, please do not hesitate to answer this email.\n\n';
              text    += `MC IGN: ${ign}\n`;
              text    += `MC UUID: ${doc.mc_uuid}\n`;
              text    += `Discord Nick: ${userObject.username}#${userObject.discriminator}\n`;
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
              text    += 'We wish you the best of luck,\nExxplore and TxT';

              //Set up the mail settings
              const mailTransporter = mail.createTransport({
                host: 'mail.gandi.net',
                port: 465,
                secure: true,
                auth: {
                  user: config['mailUser'],
                  pass: config['mailPass']
                }
              });

              let mailOptions = {
                from: config['mailUser'],
                to: doc.email_address,
                subject: 'We received your application!',
                text: text
              };

              mailTransporter.sendMail(mailOptions, function(err, info){
                if(err){
                  log.write(2, 'application_sendConfirmationEmail couldnt sent the email out', {mc_uuid: mc_uuid});
                }
              });
            }else{
              log.write(2, 'application_sendConfirmationEmail couldnt get the user object', {mc_uuid: mc_uuid});
            }
          });
        }else{
          log.write(2, 'application_sendConfirmationEmail cant get an application for mc_uuid', {mc_uuid: mc_uuid});
        }
      });
    }else{
      log.write(2, 'application_sendConfirmationEmail cant get the data for the user', {mc_uuid: mc_uuid});
    }
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

//Export the container
module.exports = application;
