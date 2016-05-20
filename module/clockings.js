/**
 * Created by stefano on 28/03/16.
 */


var request = require('request');
var https = require('https');
var Q = require('q');


var cheerio = require('cheerio');




exports.login = function (username, password) {


    console.log('Performing login user: '+username+ ', passwd '  +password);

    var defer1 = Q.defer();
    request({
        url: 'https://nis.next.it/Login.aspx', //URL to hit
        method: 'GET',
        //Lets post the following key/values as form
        qs: {ReturnUrl: '/'},
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0'
        }
    }, function (error, response, body) {
        //Check for error
        if (error) {
            defer1.reject(error);
            console.log('Error:', error);
        }

        //Check for right status code
        if (response.statusCode !== 200) {
            var err = 'Invalid Status Code Returned:'+ response.statusCode;
            console.log(err);
            defer1.reject(err);
        }
        else {
            console.log('All OK:', response.statusCode);
        }

        //All is good. Print the body
        $ = cheerio.load(body);


        var result = {
            viewState: $('#__VIEWSTATE').val(),
            eventValidation: $('#__EVENTVALIDATION').val(),
            viewStateGenerator: $('#__VIEWSTATEGENERATOR').val(),
            username: username,
            password: password

        };

        console.log("Result: " + JSON.stringify(result));
        var cookie = response.headers['set-cookie'];
        if (cookie) {
            cookie = (cookie + "").split(";").shift()
            result.cookie = cookie;
        }


        defer1.resolve(result);

    });

    var defer2 = Q.defer();

    defer1.promise.then(function (values) {

        request({
            url: 'https://nis.next.it/Login.aspx', //URL to hit
            method: 'POST',
            //Lets post the following key/values as form
            qs: {ReturnUrl: '/'},
            form: {
                __VIEWSTATE: values.viewState,
                __EVENTVALIDATION: values.eventValidation,
                __VIEWSTATEGENERATOR: values.viewStateGenerator,
                ButtonLogin: 'Entra',
                Username: values.username,
                Password: values.password
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                defer2.reject(error);
            } else {
               // console.log("-Status code:- " + response.statusCode, body);
                var cookie = "";
                response.headers['set-cookie'].forEach(function (entry) {
                    var authToken=entry.match('^\.ASPXAUTH=([^;]*)');
                    cookie = cookie + entry + ";"
                });


                values.cookie = cookie;
                defer2.resolve(values);

            }
        });


    })

    return defer2.promise;
}

exports.getClockings = function (cookie) {

    var functionDefer = Q.defer();

    request({
        url: 'https://nis.next.it/TimbratureDelGiorno.aspx', //URL to hit
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0',
            'Cookie': cookie
        }
    }, function (error, response, body) {
        if (error) {
            console.log(error);
            functionDefer.reject(error);
        } else {
           // console.log("-Status code last:- " + response.statusCode, body);
            var $ = cheerio.load(body);
            var timbrature = []
            $('#DGvisualizzaOrari tr').each(function (index, el) {
                if (index != 0) {
                    console.log($(el).html());
                    var timbratura = {}
                    var tds = $(el).find('td');
                    timbratura.orario = $(tds[0]).html();
                    timbratura.verso = $(tds[1]).html();
                    timbrature.push(timbratura);
                }
            })

            console.log(JSON.stringify(timbrature));
            functionDefer.resolve(timbrature);

        }
    });


    return functionDefer.promise;
}
