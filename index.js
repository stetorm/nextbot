const Bot = require('node-telegram-bot');
const w = require('winston');
const webnext = require('./module/clockings.js');

w.level = 'debug';

// token was passed from command line
const tToken = process.argv[2];

const bot = new Bot({
    token: tToken
});

// 156387943:AAEYk47F3oy-IhhC0_EwKb_r9kLqGGLVwDo

w.info("Bot token:", tToken);

var mapLogin={};

bot
    .on('message', function (message) {

        if (message && message.entities  && message.entities[0].type == 'bot_command') {
            var params = message.text.trim().split(' ');
            var cmd = params[0];
            console.log('Params: ' + params);

            switch (cmd) {
                case "/start":
                    textMsg = '/login utente password (es mrossi password) \n/oggi (timbrature del giorno)'
                    bot.sendMessage({chat_id: message.from.id, text: textMsg})

                    break;
                case "/badge":
                case "/oggi":
                    var userData = mapLogin[''+message.from.id]
                    if (userData) {
                        webnext.getClockings(userData.cookie).then(function (textClockingsInOut) {

                            var index;
                            var textMsg = 'Nessuna timbratura';
                            console.log(JSON.stringify(textClockingsInOut));


                            textMsg = webnext.oggi(textClockingsInOut);
                            console.log("Oggi: "+textMsg);

                            bot.sendMessage({chat_id: message.from.id, text: textMsg})

                        }, function (err) {
                            console.log('Error getting clockings: ' + error);
                            webnext.login(userData.username, userData.password).then(function (result) {
                                mapLogin[''+message.from.id] = result;
                                bot.sendMessage({chat_id: message.from.id, text: 'Login successful'})

                            }, function (err) {
                                console.log('Error performing login: ' + err);
                                bot.sendMessage({chat_id: message.from.id, text: 'Login error'})
                            });
                        })
                    }
                    else{
                        console.log('Token not found, please relogin');
                        bot.sendMessage({chat_id: message.from.id, text: "Session expired, please relogin"})

                    }
                    break;
                case "/login":
                    var username = params[1] + '@next.dom';
                    var passwd = params[2];
                    webnext.login(username, passwd).then(function (result) {
                        mapLogin[''+message.from.id] = result;
                        bot.sendMessage({chat_id: message.from.id, text: 'Login successful'})

                    }, function (err) {
                        console.log('Error performing login: ' + err);
                        bot.sendMessage({chat_id: message.from.id, text: 'Login error'})
                    });
                    break;
            }
            console.log("It is a bot command ");

        }

        console.log("Received Message: " + message);
    })
    .on('error', function (err) {
        console.error("Error: " +err);
        bot.start();
        console.log("Bot Restarted");

    })

    .start();




