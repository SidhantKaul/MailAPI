require('dotenv').config()
const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const bodyParser = require("body-parser");
let oAuthClient;
let transport;
//to catch the body data
app.use(bodyParser.urlencoded({
  extended: true
}));
app.get("/auth", async function(req,res){
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = "https://developers.google.com/oauthplayground";
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

  oAuthClient = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
  oAuthClient.setCredentials({refresh_token: REFRESH_TOKEN});
  const accessToken = await oAuthClient.getAccessToken();
  transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "sidhantkaul10@gmail.com",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken
    }
  });
  res.send("Sucessfuly Authorized");
});
app.post("/send",async function(req,res){
  try {
    console.log(process.env.CLIENT_ID);
    const mailOptions = {
      from: "sidhantkaul10@gmail.com",
      to: req.body.recieverEmail,
      subject: req.body.subject,
      text: req.body.text
    }
    const result = await transport.sendMail(mailOptions);
    res.send(result);
  } catch (e) {
    console.log(e);
    if(!oAuthClient)
    res.send("Not authorized")
    res.send("Some Problem Occured at the time of sending mail")
  }
});
app.listen(3000, function(){
  console.log("server started");
})
