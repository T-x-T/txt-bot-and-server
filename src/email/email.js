/*
 *  EMAIL HELPER
 *  Used to send emails
 */

//Dependencies
const config   = require('../../config.js');
const mailer   = require('nodemailer');
const sanitize = require('sanitize-html');

//Create the container
var email = {};

//Send an email
email.send = function(recipient, subject, text){
  //Set up the mail settings
  const mailTransporter = mailer.createTransport({
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
    to: recipient,
    subject: subject,
    text: sanitize(text,{allowedTags: [], allowedAttributes: {}}),
  };
  mailTransporter.sendMail(mailOptions, function(err, info){
    console.log(err, info);
    if(err){
      global.log(2, 'email.send couldnt sent the email out', {mail: mailOptions});
    }
  });
};

//Export the container
module.exports = email;
