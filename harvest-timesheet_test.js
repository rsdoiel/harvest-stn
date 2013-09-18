/**
 * harvest-timesheet_test.js - tests for harvest-timesheet.js.
 * @author R. S. Doiel, <rsdoiel@gmail.com>
 * copyright (c) 2013 all rights reserved
 * Licensed under the BSD 2-clause License (see: http://opensource.org/licenses/BSD-2-Clause)
 */
/*jslint node: true, indent: 4 */
var assert = require("assert"),
    fs = require("fs"),
    ht = require("./harvest-timesheet");

(function () {
    "use strict";
    var timesheet = new ht.Timesheet(),
        input = [
            "node",
            "harvest-timesheet.js",
            "--start=2019-01-04 00:00:00",
            "--end=2019-02-26 23:59:59",
            "--input=TimeSheet.txt",
            "--map=harvest.map",
            "--user=jdoe@example.com:password"
        ],
        result,
        src = fs.readFileSync("test-data/TimeSheet.txt").toString(),
        map = JSON.parse(fs.readFileSync("test-data/harvest.map").toString()),
        expected = {
            connect: 'jdoe@example.com:password',
            start: new Date("2019-01-04 00:00:00"),
            end: new Date("2019-02-26 23:59:59"),
            filename: 'TimeSheet.txt',
            mapname: 'harvest.map'
        };
    
    // Make sure command line parsing is working.
    assert.ok(timesheet);
    assert.strictEqual("function", typeof timesheet.parseCommandLine);
    assert.strictEqual("function", typeof timesheet.runCommandLine);

    result = timesheet.parseCommandLine(input);
    assert.strictEqual(expected.connect, result.connect);
    assert.strictEqual(expected.start.toString(), result.start.toString());
    assert.strictEqual(expected.end.toString(), result.end.toString());
    assert.strictEqual(expected.filename, result.filename);
    assert.strictEqual(expected.mapname, result.mapname);
    process.env.HARVEST_CONNECT = input.pop().substr(7);

    result = timesheet.parseCommandLine(input);

    assert.strictEqual(expected.connect, result.connect);
    assert.strictEqual(expected.start.toString(), result.start.toString());
    assert.strictEqual(expected.end.toString(), result.end.toString());
    assert.strictEqual(expected.filename, result.filename);
    assert.strictEqual(expected.mapname, result.mapname);
    
    result = timesheet.assemble(result, src, map);
    
    console.log("Success!");
    process.exit(0);
}(this));

