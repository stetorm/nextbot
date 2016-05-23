const utils=require('../module/utils');

var assert = require('assert');





describe('TBot', function() {
  describe('#handleBotMessage', function () {
    it('Should handle each message received from Telegram Bot', function () {
        //setup
       // clockings=[{"orario":"09:00","verso":"Entrata"}];
        clockings=[{"orario":"09:23","verso":"Entrata"},{"orario":"12:04","verso":"Uscita"},{"orario":"13:04","verso":"Entrata"}];

        //exercise
        var workingTime = utils.calculateDayWorkingTime(clockings);
        var exitTime = utils.calculateExitTime(new Date(),workingTime.millisec);
        console.log("Working time: "+JSON.stringify(workingTime));
        console.log("Exit time: "+JSON.stringify(exitTime));

        //verify
      assert.equal(result,5);
    });
  });
});
