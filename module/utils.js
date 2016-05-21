var moment = require('moment');

var getCurrentDateFromHoursMin = function(hoursMin)
{
    var hoursMin = hoursMin.split(':');
    return moment(new Date().setHours(0,0,0,0)).add(hoursMin[0],'hours').add(hoursMin[1],'minutes').toDate();
}

exports.calculateDayWorkingTime= function( clockings)
{
    var enter = clockings.filter(function(clocking){

        return clocking.verso.toLocaleLowerCase() == "entrata"
    }).map(function(clocking){

        return getCurrentDateFromHoursMin(clocking.orario);
    });

    var exit = clockings.filter(function(clocking){

        return clocking.verso.toLocaleLowerCase() == "uscita"
    }).map(function(clocking){
        return getCurrentDateFromHoursMin(clocking.orario);
    });


    var totalSpanMsec = enter.map(function(inDate,index){

        return exit[index] ?   exit[index].getTime()-inDate.getTime() :  new Date().getTime()-inDate.getTime();

    }).reduce(function(total, oneSpan){
        return total + oneSpan;
    })

    var d = moment.duration(totalSpanMsec, 'milliseconds');
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes()) - hours * 60;
    console.log("hours:" + hours + " mins:" + mins);


    result = { hoursMinutes : hours+':'+mins, millisec : totalSpanMsec };
    return result;

}

exports.calculateExitTime= function (currDate,workingTimeMsec)
{

    currDate.setSeconds(0);
    var pauseDuration = (currDate.getHours()> 13 &&  currDate.getMinutes()> 30) ? 1 : 0;

    var d = moment.duration(workingTimeMsec+pauseDuration*3600000, 'milliseconds');
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes()) - hours * 60;
    console.log("hours:" + hours + " mins:" + mins);

    sixHoursTime =  moment(currDate).add(7,'hours').subtract(hours,'hours').subtract(mins,'minutes').local().format("HH:mm")
    eightHoursTime =  moment(currDate).add(9,'hours').subtract(hours,'hours').subtract(mins,'minutes').local().format("HH:mm")

    result = { 'sixHoursTime' : sixHoursTime, 'eightHoursTime':eightHoursTime};

    return result;

}
