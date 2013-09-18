/**
 * harvest-timesheet.js - a command line tool to import Simple Timesheet Notation into Harvest.
 * @author R. S. Doiel, <rsdoiel@gmail.com>
 * copyright (c) 2013 all rights reserved
 * Licensed under the BSD 2-clause license (see: http://opensource.org/licenses/BSD-2-Clause)
 */
/*jslint node: true, indent: 4 */
"use strict";
var fs = require("fs"),
    path = require("path"),
    url = require("url"),
    nopt = require("nopt"),
    stn = require("stn"),
    timesheet;


function Timesheet() {
    var TS = this;
    return {
        help: function (exit_code, msg) {
            var usage = [
                    "USAGE: harvest-timesheet",
                    "--start=1902-01-04 --end=1902-02-26",
                    "--input=TimeSheet.txt --map=TimeSheet.map",
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
        },
        parseCommandLine: function (argv) {
            var knownOptions = {
                    "start": Date,
                    "end": Date,
                    "input": path,
                    "map": path,
                    "user": String,
                    "password": String,
                    "help": null
                },
                shortHands = {
                    "s": [ "--start" ],
                    "e": ["--end"],
                    "i": ["--input"],
                    "m": ["--map"],
                    "u": ["--user"],
                    "h": ["--help"]
                },
                now = new Date(),
                today,
                cmd,
                filename,
                mapname,
                start,
                end,
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
            c = cmd.argv.cooked.indexOf("--map") + 1;
            if (c > 0) {
                mapname = cmd.argv.cooked[c];
            } else {
                mapname = "harvest.map";
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
            return {
                connect: connect,
                start: start,
                end: end,
                filename: filename,
                mapname: mapname
            };
        },
        assemble: function (cmd, src, map) {
            var response = {
                    cmd: cmd,
                    timesheet: {},
                    error: false
                };

            try {
                response.timesheet = stn.parse(src, map);
            } catch (err) {
                response.error = true;
                response.error_msg = "ERROR: Can't parse timesheet " + err;
            }
            
            return response;
        },
        send: function (data) {
            // FIXME: need to send the RESTful transaction
            throw ("send() not implemented");
        },
        runCommandLine: function (cmd) {
            var self = this;

            if (!cmd.connect) {
                this.help(1, "ERROR: Missing Harvest connection string.");
            }
            fs.readFile(cmd.mapname, function (err, buf) {
                var map;
                if (err) {
                    //FIXME: use default map
                    this.help(1, "ERROR: Can't read " + cmd.mapname + "\n" + err);
                }
                try {
                    map = JSON.parse(buf.toString());
                } catch (eMapParse) {
                    this.help(1, "ERROR: Can't parse " + cmd.mapname);
                }
                fs.readFile(cmd.filename, function (err, buf) {
                    var src,
                        data;
                    
                    if (err) {
                        this.help(1, "ERROR: Can't read " + cmd.filename);
                    }
                    src = buf.toString();
                    // generate and send data to harvest.
                    self.send(self.assemble(cmd, src, map));
                });
            });
        }
    };
}

if (!module.parent) {
    timesheet = new Timesheet();
    console.log("DEBUG", timesheet);
    timesheet.runCommandLine(timesheet.parseCommandLine(process.argv));
}

exports.Timesheet = Timesheet;

