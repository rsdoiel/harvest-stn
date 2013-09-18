/**
 * harvest-timesheet.js - a command line tool to import Simple Timesheet Notation into Harvest.
 * @author R. S. Doiel, <rsdoiel@gmail.com>
 * copyright (c) 2013 all rights reserved
 * Released under the BSD 2-clause license
 * (see: http://opensource.org/licenses/BSD-2-Clause)
 */
/*jslint node: true, indent: 4 */
"use strict";
var fs = require("fs"),
    path = require("path"),
    url = require("url"),
    nopt = require("nopt"),
    stn = require("stn"),
    Harvest = require("harvest"),
    timesheet;


function Timesheet() {
    function help(exit_code, msg) {
        var usage = [
                "USAGE: harvest-timesheet",
                "--start=1902-01-04 --end=1902-02-26",
                "--input=TimeSheet.txt",
                "--subdomain=example.harvesthq.com",
                "--user=jdoe@example.com:password"
            ].join(" "),
            echo = console.log;
        
        if (exit_code === undefined) {
            exit_code = 0;
        }
        if (exit_code > 0) {
            echo = console.error;
        }

        echo(usage);
        if (msg) {
            echo(msg);
        }
        process.exit(exit_code);
    }

    function parseCommandLine(argv) {
        var knownOptions = {
                "start": Date,
                "end": Date,
                "input": path,
                "subdomain": String,
                "user": String,
                "help": null,
                "dry run": null
            },
            shortHands = {
                "s": [ "--start" ],
                "e": ["--end"],
                "i": ["--input"],
                "d": ["--subdomain"],
                "u": ["--user"],
                "h": ["--help"],
                "t": ["--dry-run"]
            },
            dry_run = false,
            now = new Date(),
            today,
            cmd,
            filename,
            start,
            end,
            subdomain,
            connect,
            c = 0;
    
        today = [
            now.getFullYear(),
            (" 0" + (now.getMonth() + 1)).substr(-2),
            (" 0" + now.getDate()).substr(-2)
        ].join("-");
        cmd = nopt(knownOptions, shortHands, argv);
        if (cmd.argv.cooked.indexOf("--help") > -1) {
            timesheet.help();
        }
        c = cmd.argv.cooked.indexOf("--start") + 1;
        if (c > 0) {
            start = new Date(cmd.argv.cooked[c]);
        } else {
            start = new Date(today + " 00:00:00");
        }
        c = cmd.argv.cooked.indexOf("--end") + 1;
        if (c > 0) {
            end = new Date(cmd.argv.cooked[c]);
        } else {
            end = new Date(today + " 23:59:59");
        }
        c = cmd.argv.cooked.indexOf("--user") + 1;
        if (c > 0) {
            connect = cmd.argv.cooked[c].trim();
        } else if (process.env.HARVEST_CONNECT) {
            connect = process.env.HARVEST_CONNECT;
        } else {
            connect = "";
        }
        c = cmd.argv.cooked.indexOf("--input") + 1;
        if (c > 0) {
            filename = cmd.argv.cooked[c].trim();
        } else {
            filename = "TimeSheet.txt";
        }
        c = cmd.argv.cooked.indexOf("--subdomain") + 1;
        if (c > 0) {
            subdomain = cmd.argv.cooked[c].trim();
        } else {
            subdomain = "test.harvestapp.com";
        }
        if (cmd.argv.cooked.indexOf("--dry-run") > -1) {
            dry_run = true;
        }
        return {
            subdomain: subdomain,
            connect: connect,
            start: start,
            end: end,
            filename: filename,
            dry_run: dry_run
        };
    }
    
    function assemble(cmd, src, map) {
        var response = {
                cmd: cmd,
                timesheet: {},
                error: false,
                error_msg: null
            },
            date_range,
            data;

        try {
            data = stn.parse(src);
        } catch (err) {
            response.error = true;
            response.error_msg = "ERROR: Can't parse timesheet " + err;
        }
        // Filter for desired date range
        date_range = Object.keys(data);
        date_range.forEach(function (ky) {
            var timestamp = new Date(ky);

            if (timestamp >= cmd.start &&
                    timestamp <= cmd.end) {
                response.timesheet[ky] = data[ky];
            }
        });
        return response;
    }

    function mkConnection(request) {
        var cmd = request.cmd,
            email,
            password;
        
        email = cmd.connect.substr(0, cmd.connect.indexOf(':'));
        password = cmd.connect.substr(email.length + 1);
        return {
            subdomain: request.subdomain,
            email: email,
            password: password
        };
    }

    function send(request) {
        console.log("DEBUG send() request", JSON.stringify(request, null, 2));
        console.log("DEBUG mkConfig", JSON.stringify(mkConnection(request), null, 2));
        throw ("send() need tests and implementation");
    }
    
    function runCommandLine(cmd) {
        var request;
        
        if (!cmd.connect) {
            help(1, "ERROR: Missing Harvest connection string.");
        }
        if (cmd.filename.indexOf('~') === 0) {
            cmd.filename = path.join(process.env.HOME, cmd.filename.substr(1));
        }
        fs.readFile(cmd.filename, function (err, buf) {
            var src,
                data;
            
            if (err) {
                help(1, "ERROR: Can't read " + cmd.filename + " " + err);
            }
            src = buf.toString();
            // generate and send data to harvest.
            request = assemble(cmd, src);
            if (cmd.dry_run === true) {
                console.log(JSON.stringify(request, null, 2));
                return request;
            } else {
                return send(request);
            }
        });
    }
    return {
        help: help,
        parseCommandLine: parseCommandLine,
        assemble: assemble,
        send: send,
        runCommandLine: runCommandLine
    };
}
// Decorate with a modern style constructor
Timesheet.create = function () {
    return new Timesheet();
};

if (!module.parent) {
    timesheet = Timesheet.create();
    timesheet.runCommandLine(timesheet.parseCommandLine(process.argv));
}

exports.create = Timesheet.create;
exports.Timesheet = Timesheet;
