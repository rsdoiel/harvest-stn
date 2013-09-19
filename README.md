harvest-stn
===========

A harvest client for importing Simple Timesheet Notation files into a harvest account.

# Resources and docs

* [Havest API](https://github.com/harvesthq/api) - examples in Python, Ruby, PHP, etc.
* [Timesheet API](https://github.com/harvesthq/api/blob/master/Sections/Time%20Tracking.md) - this is what we want
* [node-harvest](https://github.com/log0ymxm/node-harvest) by Paul English, this could be wrapped to create harvest-import-stn cli

# Our API

## methods

* getDaily(day_of_the_year, year) - /daily/#{day_of_the_year}/#{year}
    dateToDOYY(date) -- return object with day of year, year
* getEntry(entry_id) - /daily/show/#{entry_id}
* addEntry(date, start_at, end_at,  project, task, notes) - /daily/add, returns entry_id or false
    * getTasksId(task) -- given a text task name return a task_id or false
    * getProjectId(project) -- given a text project name return a project_id or false
* updateEntry(entry_id, date, start_at, end_at, project, task, notes) - /daily/update/#{entry_id}
    * getTasksId(task) -- given a text task name return a task_id or false
    * getProjectId(project) -- given a text project name return a project_id or false
* deleteEntry(entry_id)

Notes:

    Supported Data Formats

    The Harvest API supports both XML and JSON data formats.

    For an XML request, send application/xml in the Accept and Content-Type headers. Send application/json for JSON responses. All examples in this documentation assume XML input and output, however JSON output follows similar structure to the XML documented.



