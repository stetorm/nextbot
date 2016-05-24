var moment = require('moment');

var getCurrentDateFromHoursMin = function (hoursMin) {
    var hoursMin = hoursMin.split(':');
    return moment(new Date().setHours(0, 0, 0, 0)).add(hoursMin[0], 'hours').add(hoursMin[1], 'minutes').toDate();

}

exports.getCurrentLocalDate = function () {
    return moment(new Date()).local().toDate();

}

exports.calculateDayWorkingTime = function (clockings) {
    var enter = clockings.filter(function (clocking) {

        return clocking.verso.toLocaleLowerCase() == "entrata"
    }).map(function (clocking) {

        return getCurrentDateFromHoursMin(clocking.orario);
    });

    var exit = clockings.filter(function (clocking) {

        return clocking.verso.toLocaleLowerCase() == "uscita"
    }).map(function (clocking) {
        return getCurrentDateFromHoursMin(clocking.orario);
    });


    var totalSpanMsec = enter.map(function (inDate, index) {
        if (inDate.getHours() < 8 || (inDate.getHours() == 8 && inDate.getMinutes() < 30)) {
            inDate.setHours(8, 30, 0, 0);
        }

        var exitTime = exit[index] ? exit[index] : exports.getCurrentLocalDate();

        if (exitTime.getHours() >= 19) {
            exitTime.setHours(19, 0, 0, 0);
        }

        return exitTime.getTime() - inDate.getTime();

    }).reduce(function (total, oneSpan) {
        return total + oneSpan;
    })

    var d = moment.duration(totalSpanMsec, 'milliseconds');
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes()) - hours * 60;
    console.log("hours:" + hours + " mins:" + mins);


    result = {hoursMinutes: hours + ':' + mins, millisec: totalSpanMsec};
    return result;

}

exports.calculateExitTime = function (currDate, workingTimeMsec) {

    currDate.setSeconds(0);
    var pauseDuration = (currDate.getHours() >= 14 || (currDate.getHours() == 13 && currDate.getMinutes()) > 30) ? 1 : 0;

    var d = moment.duration((9 - pauseDuration ) * 3600 * 1000 - workingTimeMsec, 'milliseconds');
    var remainingTimeToWorkMsec =   (9 - pauseDuration ) * 3600 * 1000 - workingTimeMsec;
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes()) - hours * 60;
    console.log("Current date: " + currDate);
    console.log("Remaining time to work, hours:" + hours + " mins:" + mins);

    sixHoursTime =  moment(currDate.getTime()+remainingTimeToWorkMsec-2*3600000).format("HH:mm")
    eightHoursTime = moment(currDate.getTime()+remainingTimeToWorkMsec).format("HH:mm")

    result = {'sixHoursTime': sixHoursTime, 'eightHoursTime': eightHoursTime};

    return result;

}
