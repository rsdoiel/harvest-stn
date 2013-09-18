/**
 * harvest-timesheet_test.js - tests for harvest-timesheet.js.
 * @author R. S. Doiel, <rsdoiel@gmail.com>
 * copyright (c) 2013 all rights reserved
 * Released under the BSD 2-clause License 
 * (see: http://opensource.org/licenses/BSD-2-Clause)
 */
/*jslint node: true, indent: 4 */
var assert = require("assert"),
    fs = require("fs"),
    Timesheet = require("./harvest-timesheet");

(function () {
    "use strict";
    var timesheet = Timesheet.create(),
        input = [
            "node",
            "harvest-timesheet.js",
            "--start=2013-01-04 00:00:00",
            "--end=2013-02-26 23:59:59",
            "--input=TimeSheet.txt",
            "--subdomain=tinyCo.example.com",
            "--user=jdoe@example.com:password"
        ],
        cmd,
        result,
        src = fs.readFileSync("test-data/TimeSheet.txt").toString(),
        expected = {
            connect: 'jdoe@example.com:password',
            start: new Date("2013-01-04 00:00:00"),
            end: new Date("2013-02-26 23:59:59"),
            filename: 'TimeSheet.txt'
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
    process.env.HARVEST_CONNECT = input.pop().substr(7);

    result = timesheet.parseCommandLine(input);

    assert.strictEqual(expected.connect, result.connect);
    assert.strictEqual(expected.start.toString(), result.start.toString());
    assert.strictEqual(expected.end.toString(), result.end.toString());
    assert.strictEqual(expected.filename, result.filename);

    // Test assembly for data outside time range    
    cmd = timesheet.parseCommandLine(input);
    result = timesheet.assemble(cmd, src);
    assert.strictEqual(false, result.error, result.error_msg);
    assert.ok(result.timesheet);

    assert.strictEqual(0, Object.keys(result.timesheet).length,
                       Object.keys(result.timesheet).toString() +
                       " should be zero array");

    // Test assembly for data inside time range
    cmd.start = new Date("2013-08-31 14:00:00");
    cmd.end = new Date("2013-09-02 00:00:00");
    result = timesheet.assemble(cmd, src);
    assert.strictEqual(false, result.error, result.error_msg);
    assert.strictEqual(1, Object.keys(result.timesheet).length);
    assert.strictEqual("2013-09-01", Object.keys(result.timesheet)[0]);
    
    console.log("Success!");
    process.exit(0);
}(this));

