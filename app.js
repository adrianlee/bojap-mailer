var express = require('express'),
    app = express(),
    nodemailer = require("nodemailer"),
    config = require("./config");

// init nodemailer
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: process.env.GMAIL_USER || config.user,
        pass: process.env.GMAIL_PASS || config.pass
    }
});

// sendMail method
function sendMail(mailOptions, req, res) {
  smtpTransport.sendMail(mailOptions, function(error, response) {
      if (error) {
          console.log(error);
          res.send(error);
      } else {
          console.log("Message sent: " + response.message);
          res.send({ msg: response.message });
      }

      //smtpTransport.close(); // shut down the connection pool, no more messages
  });
}

function mailParse(req, res) {
  var token = req.param("token") || req.get("API-TOKEN");

  console.log(req.body);
  console.log("Token: " + token);

  if (token == config.token) {
    var mailOptions = {
        from: "Team Bojap <team@bojap.com>",
    };

    mailOptions.to = req.body["to"];
    mailOptions.subject = req.body["subject"];
    mailOptions.text = req.body["text"];
    mailOptions.html = req.body["html"];

    if (req.body["to"]) {
      sendMail(mailOptions, req, res);
    } else {
      res.send(400, { error: "Missing to field", msg: mailOptions } );
    }
  } else {
    res.send(403);
  }
}

// express middleware
app.use(express.logger("dev"));
app.use(express.bodyParser());

app.get('/', function (req, res) {
  res.send(200, {
    greeting: "Welcome to bojap-mailer!",
    api_endpoints: ["/mail", "/mail/:token"],
    authentication: "A valid API Token as API-TOKEN request header or part of POST url"
  });
});

// express routes

app.post('/mail/', function(req, res) {
  mailParse(req, res);
});

app.post('/mail/:token', function(req, res) {
  mailParse(req, res);
});

app.listen(3000);