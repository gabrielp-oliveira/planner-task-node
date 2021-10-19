require('dotenv').config()
const nodemailer = require("nodemailer");
const config = require('./config')
const { google } = require('googleapis')
const Oauth2 = google.auth.OAuth2

const OAuth2_client = new Oauth2(config.clientId, config.clientSecret)
OAuth2_client.setCredentials({ refresh_token: config.refresh_token })
const accessToken = OAuth2_client.getAccessToken()


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      type : 'OAuth2',
      user: config.user,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refresh_token,
      accessToken: accessToken
  }
});

function sendEmail(Title, subject, message, code, link, to, message1, resp) {

  transporter.sendMail({
      text: Title,
      subject: subject,
      from: "Planner <Gabriel P.> Resume Project.",
      to: to,
      html: ` <html> 
       <body>
       <h1>${Title}</h1>
       <p>${message}</p>
       <p>Code: ${code}</p>
       <hr/>
       <p>go the the <a href="${link}" target="_blank">planner</a> </p>
       <p>${message1}</p>
       </body>
       </html> 
       `,
    }, function(error, info){
      if (error) {
        return resp.send({error: error})
      } else {
        return resp.send({ok: info.response})
      }
    });

}

module.exports = sendEmail

