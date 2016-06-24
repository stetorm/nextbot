const utils = require('../module/utils');
const webnext = require('../module/clockings.js');

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
            var clockingsDates = utils.convClockingToDate(clockings);
            var workingTime = utils.calculateDayWorkingTime(nowDate, clockingsDates);
            var exitTime = utils.calculateExitTime(nowDate, workingTime.millisec);
            console.log("Working time: " + JSON.stringify(workingTime));
            console.log("Exit time: " + JSON.stringify(exitTime));

            //verify
            assert.equal(result, 5);
        });

        it('Should ', function () {
            //setup
            clockings = [{"orario": "08:00", "verso": "Entrata"},{"orario": "13:00", "verso": "Uscita"},{"orario": "13:50", "verso": "Entrata"},{"orario": "17:00", "verso": "Uscita"}];

            //exercise
            var clockingsDates = utils.convClockingToDate(clockings);

            console.log("Exit time: " + JSON.stringify(clockingsDates));

            //verify
            assert.equal(5, 5);
        });

        it('Should ', function () {
            //setup
            // clockings=[{"orario":"09:00","verso":"Entrata"}];
            clockings = [{"orario": "08:00", "verso": "Entrata"},{"orario": "13:00", "verso": "Uscita"},{"orario": "13:50", "verso": "Entrata"},{"orario": "17:00", "verso": "Uscita"}];

            //exercise
            var nowDate = new Date();
            nowDate.setHours(8, 15, 0, 0);
            clockingsDates =  utils.convClockingToDate(clockings)
            var workingTime = utils.calculateDayWorkingTime(nowDate, clockingsDates);
            console.log("workingTime: " + JSON.stringify(workingTime));

            //verify
            assert.equal(result, 5);
        });

        it('Pausa Pranzo Regolare', function () {
            //setup
            clockings = [{"orario": "08:00", "verso": "Entrata"},{"orario": "13:00", "verso": "Uscita"},{"orario": "13:50", "verso": "Entrata"},{"orario": "17:00", "verso": "Uscita"}];

            //exercise
            var nowDate = new Date();
            nowDate.setHours(14, 0, 0, 0);
            clockingsDates =  utils.convClockingToDate(clockings)

            var pauseData = utils.calculateLaunchBreak(nowDate, clockingsDates);


            console.log("pause Duration; " +JSON.stringify(utils.convertMsec2HoursMin(pauseData.lengthMsec)));
            console.log("pause in progress : " + pauseData.inProgress);

            //verify
            assert.equal(false, pauseData.inProgress);
            assert.equal(3000000, pauseData.lengthMsec);
            assert.equal(true, pauseData.done);
        });

        it('Pausa Pranzo In corso', function () {
            //setup
            clockings = [{"orario": "08:00", "verso": "Entrata"},{"orario": "13:00", "verso": "Uscita"}];

            //exercise
            var nowDate = new Date();
            nowDate.setHours(13, 30, 0, 0);
            clockingsDates =  utils.convClockingToDate(clockings)

            var pauseData = utils.calculateLaunchBreak(nowDate, clockingsDates);


            console.log("pause Duration; " +JSON.stringify(utils.convertMsec2HoursMin(pauseData.lengthMsec)));
            console.log("pause in progress : " + pauseData.inProgress);

            //verify
            assert.equal(true, pauseData.inProgress);
            assert.equal(30 * 60 * 1000, pauseData.lengthMsec);
        });

        it('Oggi finito', function () {
            //setup
            clockings = [{"orario": "08:00", "verso": "Entrata"},{"orario": "13:00", "verso": "Uscita"},{"orario": "13:50", "verso": "Entrata"},{"orario": "17:00", "verso": "Uscita"}];

            //exercise
            var nowDate = new Date();

            webnext.oggi(clockings);


            //verify
            assert.equal(true, true);
        });

        it.only('Oggi in corso', function () {
            //setup
            clockings = [{"orario": "09:15", "verso": "Entrata"},{"orario": "12:34", "verso": "Uscita"},{"orario": "13:38", "verso": "Entrata"}];

            //exercise
            var nowDate = new Date();

            text = webnext.oggi(clockings);

            console.log("oggi :"+text);


            //verify
            assert.equal(true, true);
        });



    });
});
