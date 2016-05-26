const utils = require('../module/utils');

var assert = require('assert');


//156387943:AAEYk47F3oy-IhhC0_EwKb_r9kLqGGLVwDo

describe('TBot', function () {
    describe('#handleBotMessage', function () {
        it('Should handle each message received from Telegram Bot', function () {
            //setup
            // clockings=[{"orario":"09:00","verso":"Entrata"}];
            clockings = [{"orario": "08:00", "verso": "Entrata"}];

            //exercise
            var nowDate = new Date();
            nowDate.setHours(8, 15, 0, 0);
            var workingTime = utils.calculateDayWorkingTime(nowDate, clockings);
            var exitTime = utils.calculateExitTime(nowDate, workingTime.millisec);
            console.log("Working time: " + JSON.stringify(workingTime));
            console.log("Exit time: " + JSON.stringify(exitTime));

            //verify
            assert.equal(result, 5);
        });

        it.only('Should ', function () {
            //setup
            // clockings=[{"orario":"09:00","verso":"Entrata"}];
            clockings = [{"orario": "08:00", "verso": "Entrata"},{"orario": "13:00", "verso": "Uscita"},{"orario": "13:50", "verso": "Entrata"},{"orario": "17:00", "verso": "Uscita"}];

            //exercise
            var nowDate = new Date();
            nowDate.setHours(8, 15, 0, 0);
            var workingTime = utils.calculateDayWorkingTime(nowDate, clockings);

            //verify
            assert.equal(result, 5);
        });

    });
});
