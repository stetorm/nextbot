/**
 * Created by stefano on 28/03/16.
 */


var request = require('request');
var https = require('https');
var Q = require('q');


var cheerio = require('cheerio');


exports.getClockings = function (username, password) {

    var functionDefer = Q.defer();
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
            return console.log('Error:', error);
        }

        //Check for right status code
        if (response.statusCode !== 200) {
            console.log('Invalid Status Code Returned:', response.statusCode);
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
                Username: username,
                Password: password
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                console.log("-Status code:- " + response.statusCode, body);
                var cookie = "";
                response.headers['set-cookie'].forEach(function (entry) {
                    cookie = cookie + entry + ";"
                });

                values.cookie = cookie;

            }
            defer2.resolve(values);
        });


    })

    defer2.promise.then(function (values) {

        request({
            url: 'https://nis.next.it/TimbratureDelGiorno.aspx', //URL to hit
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'user-agent': 'Mozilla/5.0',
                'Cookie': values.cookie
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                console.log("-Status code last:- " + response.statusCode, body);
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


    })

    return functionDefer.promise;
}
