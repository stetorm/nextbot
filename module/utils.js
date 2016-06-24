var moment = require('moment');

var getCurrentDateFromHoursMin = function (hoursMin) {
    var hoursMin = hoursMin.split(':');
    return moment(new Date().setHours(0, 0, 0, 0)).add(hoursMin[0], 'hours').add(hoursMin[1], 'minutes').toDate();

}

exports.getCurrentLocalDate = function () {
    return moment(new Date()).local().toDate();

}

var truncStartWorkingTime = function (date) {
    if (date.getHours() < 8 || (date.getHours() == 8 && date.getMinutes() < 30)) {
        date.setHours(8, 30, 0, 0);
    }
    return date;

}

var truncEndWorkingTime = function (date) {
    if (date.getHours() >= 19) {
        date.setHours(19, 0, 0, 0);
    }
    return date;

}

exports.convClockingToDate = function (clockings) {

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


    result = {'enter': enter, 'exit': exit};
    return result;

}

exports.calculateDayWorkingTime = function (nowTime, clockings) {

    var totalSpanMsec = clockings.enter.map(function (inDate, index) {

        truncEndWorkingTime(truncStartWorkingTime(nowTime));

        var exitTime = clockings.exit[index] ? clockings.exit[index] : nowTime;

        truncStartWorkingTime(inDate);
        truncEndWorkingTime(exitTime);

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

exports.convertMsec2HoursMin = function (msec) {


    var d = moment.duration(msec, 'milliseconds');
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes()) - hours * 60;

    return {hoursMinutes: hours + ':' + mins, millisec: msec};

}


exports.calculateLaunchBreak = function (nowTime, clockingsDate) {

    var result = {'lengthMsec': 0, 'inProgress': false,'done':false}

    if (clockingsDate.exit.length>0) {
        var pauseList = clockingsDate.exit.filter(function (date) {

            // Seleziona le timbrature d'uscita nell'intervallo ammissibile per l'inizio della pausa pranzo
            var pauseStartTime = new Date();
            pauseStartTime.setHours(12, 0, 0, 0);

            var pauseEndTime = new Date();
            pauseEndTime.setHours(13, 30, 0, 0);

            return date.getTime() >= pauseStartTime.getTime() && date.getTime() <= pauseEndTime.getTime();

        }).map(function (outDate, index) {

            // c'� la timbratura d'ingresso corrispondente?
            result.inProgress = clockingsDate.enter[index + 1] == undefined;
            result.done = !result.inProgress;
            var endTime = result.inProgress ? nowTime : clockingsDate.enter[index + 1] ;

            return endTime.getTime() - outDate.getTime();

        })

        result.lengthMsec = Math.max.apply(Math, pauseList);


    }


    return result;

}

exports.calculateExitTime = function (currDate, workingTimeMsec) {

    currDate.setSeconds(0);
    var pauseDuration = (currDate.getHours() >= 14 || (currDate.getHours() == 13 && currDate.getMinutes()) > 30) ? 1 : 0;

    var d = moment.duration((9 - pauseDuration ) * 3600 * 1000 - workingTimeMsec, 'milliseconds');
    var remainingTimeToWorkMsec = (9 - pauseDuration ) * 3600 * 1000 - workingTimeMsec;
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes()) - hours * 60;
    console.log("Current date: " + currDate);
    console.log("Remaining time to work, hours:" + hours + " mins:" + mins);

    sixHoursTime = moment(currDate.getTime() + remainingTimeToWorkMsec - 2 * 3600000).format("HH:mm")
    eightHoursTime = moment(currDate.getTime() + remainingTimeToWorkMsec).format("HH:mm")

    result = {'sixHoursTime': sixHoursTime, 'eightHoursTime': eightHoursTime};

    return result;

}

exports.calculateLaunchBreakTime = function (clockings) {

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


    var totalSpanMsec = exit.map(function (outDate, index) {

        truncEndWorkingTime(truncStartWorkingTime(nowTime));

        var exitTime = exit[index] ? exit[index] : nowTime;

        truncStartWorkingTime(outDate);
        truncEndWorkingTime(exitTime);

        return exitTime.getTime() - outDate.getTime();

    }).reduce(function (total, oneSpan) {
        return total + oneSpan;
    })

}
