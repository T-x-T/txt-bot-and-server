/*
 *  EMAIL HELPER
 *  Used to send emails
 */

//Dependencies
const mailer   = require('nodemailer');
const sanitize = require('sanitize-html');

//Create the container
var email = {};

//Container for application related emails
email.application = {};

email.application.confirmation = function(doc){
  //Build the test for the mail
  let text = `Hi ${doc.mc_ign},\n`;
  text += 'thank you for applying to join Paxterya! We are happy to tell you that we received your application successfully!\n';
  text += 'Here are the details you sent us, please verify that this is all correct. If there are any mistakes or questions you may have, please do not hesitate to answer this email.\n\n';
  text += `MC IGN: ${doc.mc_ign}\n`;
  text += `MC UUID: ${doc.mc_uuid}\n`;
  text += `Discord Nick: ${doc.discord_nick}\n`;
  text += `Discord ID: ${doc.discord_id}\n`;
  text += `Country: ${doc.country}\n`;
  text += `Birth Month: ${doc.birth_month}\n`;
  text += `Birth Year: ${doc.birth_year}\n`;
  text += `About me: ${doc.about_me}\n`;
  text += `Motivation: ${doc.motivation}\n`;
  text += `Buildings: ${doc.build_images}\n`;
  text += `Publish about me: ${doc.publish_about_me}\n`;
  text += `Publish age: ${doc.publish_age}\n`;
  text += `Publish country: ${doc.publish_country}\n\n`;
  text += 'You will hear back from us within a few days tops.\n';
  text += 'We wish you the best of luck,\nExxPlore and TxT';

  email.send(doc.email_address, 'We have received your application', text);
};

email.application.denied = function(doc){
  //Build the text for the email
  let text = '';
  text += `Hi ${doc.mc_ign},\n`;
  text += 'we read your application and decided it was not good enough and didnt meet our standards.\n';
  text += 'We came to this conclusion for the following reason:\n';
  text += doc.deny_reason;
  text += '\nYou have two options now:\n';
  text += 'If you believe you can write a better application, then we welcome you to write us another one!\n';
  text += 'Alternatively, you can search for another server that better suits your needs and preferences.\n';
  text += 'No matter how you decide, we wish you the best of luck for the future!\n';
  text += 'Yours sincerly,\nExxPlore and TxT';

  //Send the email
  email.send(doc.email_address, 'Your application was unsuccessful :(', text);
};

email.application.accepted = function(doc){
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
};

//Send an email
email.send = function(recipient, subject, text){
  //Set up the mail settings
  const mailTransporter = mailer.createTransport({
    host: 'mail.gandi.net',
    port: 465,
    secure: true,
    auth: {
      user: config.email.mailUser,
      pass: config.email.mailPass
    }
  });

  let mailOptions = {
    from: config.email.mailUser,
    to: recipient,
    subject: subject,
    text: sanitize(text,{allowedTags: [], allowedAttributes: {}}),
  };
  mailTransporter.sendMail(mailOptions, function(err, info){
    global.log(0, 'mail', 'email.send sent email', {recipient: recipient, subject: subject, text: text, err: err, info: info});
    if(err){
      global.log(2, 'email', 'email.send couldnt sent the email out', {mail: mailOptions});
    }
  });
};

//Export the container
module.exports = email;
