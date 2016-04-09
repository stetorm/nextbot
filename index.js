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

bot.on('message', function (msg) {
    console.log(JSON.stringify(msg));
    webnext.getClockings('sbrega@next.dom', 'stefano1').then(function (clockingsInOut) {

        var index;
        var textMsg = 'Nessuna timbratura';
        if (clockingsInOut.length > 0) {
            textMsg='';
            for (index = 0; index < clockingsInOut.length; ++index) {
                textMsg = textMsg + clockingsInOut[index].verso + ' ' + clockingsInOut[index].orario + '\n';
            }
        }


        bot.sendMessage({chat_id: msg.from.id, text: textMsg})


    })

});

bot.start();




