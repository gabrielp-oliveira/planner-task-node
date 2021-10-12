require('dotenv').config()

const nodemailer = require("nodemailer");

const SMTP_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  user: process.env.Email,
  pass: process.env.emailPassword,
};

const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: false,
  auth: {
    user: SMTP_CONFIG.user,
    pass: SMTP_CONFIG.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
async function sendEmail(Title, subject, message, code, link, to, message1, resp) {

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
        return resp.send(error)
      } else {
        return resp.send({ok: info.response})
      }
    });

}

module.exports = sendEmail

