const Bot = require('node-telegram-bot');
const utils = require('./module/utils');
const w = require('winston');
const webnext = require('./module/clockings.js');

w.level = 'debug';

// token was passed from command line
const tToken = process.argv[2];

const bot = new Bot({
    token: tToken
});


w.info("Bot token:", tToken);

var mapLogin={};

bot
    .on('message', function (message) {

        if (message.entities  && message.entities[0].type == 'bot_command') {
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
                        webnext.getClockings(userData.cookie).then(function (clockingsInOut) {

                            var index;
                            var textMsg = 'Nessuna timbratura';
                            console.log(JSON.stringify(clockingsInOut));

                            if (clockingsInOut.length > 0) {
                                textMsg = '';
                                for (index = 0; index < clockingsInOut.length; ++index) {
                                    textMsg = textMsg + clockingsInOut[index].verso + ' ' + clockingsInOut[index].orario + '\n';
                                }

                                var workingTime = utils.calculateDayWorkingTime(clockingsInOut);
                                var exitTime = utils.calculateExitTime(new Date(),workingTime.millisec);
                                textMsg += "\nHai lavorato: "+ workingTime.hoursMinutes;
                                textMsg += "\nFai 6 ore alle: "+ exitTime.sixHoursTime;
                                textMsg += "\nFai 8 ore alle: "+ exitTime.eightHoursTime;
                            }

                            bot.sendMessage({chat_id: message.from.id, text: textMsg})

                        }, function (err) {
                            console.log('Error getting clockings: ' + error);
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
        console.error("Errore" +err);
    })

    .start();




