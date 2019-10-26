/*
 *  APPLICATION HANDLER
 *  This file hanles everything that has something to do with applications
 */

//Dependencies
const config = require('./../config.js');
const data = require('./data.js');
const log = require('./log.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mc_helpers = require('./mc_helpers.js');
const mail = require('nodemailer');

//Create the container
var application = {};

//Get the db object
var db;
data.getDB(function(err, con){
  db = con;
});

//Save an application
application.write = function(input, callback){
  //Check if all inputs are ok
  mc_helpers.getUUID(input.mc_ign, function(uuid){
    if(uuid){
      input.mc_uuid = uuid;

      //Now we can verify the rest
      input.discord_nick     = typeof input.discord_nick     == 'string' && input.discord_nick.indexOf('#') > -1 ? input.discord_nick.trim() : false;
      input.email_address    = typeof input.email_address    == 'string' && input.email_address.indexOf('@') > -1 ? input.email_address.trim() : false;
      input.country          = typeof input.country          == 'string' && input.country.length > 2 ? input.country.trim() : false;
      input.birth_month      = Number(input.birth_month)     >= 1 && Number(input.birth_month) <= 12 ? Number(input.birth_month) : false;
      input.birth_year       = Number(input.birth_year)      >= new Date().getFullYear() - 100 && Number(input.birth_year) <= new Date().getFullYear() ? Number(input.birth_year) : false;
      input.about_me         = typeof input.about_me         == 'string' && input.about_me.length > 0 && input.about_me.length <= 1500 ? input.about_me : false;
      input.motivation       = typeof input.motivation       == 'string' && input.motivation.length > 0 && input.motivation.length <= 1500 ? input.motivation : false;
      input.build_images     = typeof input.build_images     == 'string' && input.build_images.length > 0 && input.build_images.length <= 1500 ? input.build_images : '';
      input.publish_about_me = typeof input.publish_about_me == 'boolean' ? input.publish_about_me : false;
      input.publish_age      = typeof input.publish_age      == 'boolean' ? input.publish_age : false;
      input.publish_country  = typeof input.publish_country  == 'boolean' ? input.publish_country : false;

      if(input.accept_privacy_policy && input.accept_rules){
        if(input.discord_nick && input.email_address && input.country && input.birth_month && input.birth_year && input.about_me && input.motivation){
          //Everything is fine, write to db
          let document = new applicationModel({
            timestamp:        Date.now(),
            mc_uuid:          input.mc_uuid,
            discord_nick:     input.discord_nick,
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

//Send an success email to tell the applicant that the application was sent successfully
application.sendConfirmationEmail = function(mc_uuid){
  //Get the latest application from the mc_uuid
  application.readNewestByMcUUID(mc_uuid, function(doc){
    if(doc){
      //Get the mc ign
      mc_helpers.getIGN(mc_uuid, function(ign){
        if(ign){
          //Build the test for the mail
          let text = `Hi ${ign},\n`;
          text += 'we are happy to tell you that we received your application successfully!\n',
          text += 'Here are your details you send us, please verify that this all correct and if not please reply to this email\n\n';
          text += `MC IGN: ${ign}\n`;
          text += `MC UUID: ${doc.mc_uuid}\n`;
          text += `Discord Nick: ${doc.discord_nick}\n`;
          text += `Country: ${doc.country}\n`;
          text += `Birth Month: ${doc.birth_month}\n`;
          text += `Birth Year: ${doc.birth_year}\n`;
          text += `About me: ${doc.about_me}\n`;
          text += `Motivation: ${doc.motivation}\n`;
          text += `Buildings: ${doc.build_images}\n`;
          text += `Publish about me: ${doc.publish_about_me}\n`;
          text += `Publish age: ${doc.publish_age}\n`;
          text += `Publish country: ${doc.publish_country}\n`;

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
  timestamp:        Date,
  mc_uuid:          String,
  discord_nick:     String,
  email_address:    String,
  country:          String,
  birth_month:      Number,
  birth_year:       Number,
  about_me:         String,
  motivation:       String,
  build_images:     String,
  publish_about_me: Boolean,
  publish_age:      Boolean,
  publish_country:  Boolean
});

//Set up the model
var applicationModel = mongoose.model('applications', applicationSchema);

//Export the container
module.exports = application;
