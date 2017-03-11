easy-mysql-promise
==================

A simple nodejs mysql-promise implementation to make sql easier

## Current features

- Basic implementation with insert, update and delete helpers
- Normalized responses

## Installation

This module is installed via npm:

```bash
$ npm install easy-mysql-promise
```

## Example Usage

load and iniciate

```javascript
var db = require('easy-mysql-promise')(
	{
		host        : MYSQL_HOST,
		port        : MYSQL_PORT,
		user        : MYSQL_USER,
		password    : MYSQL_PASSWORD,
		database    : MYSQL_DB,
		error_debug : true
	}
);
```

execute a query

```javascript
db.query("SELECT * FROM table WHERE id=74")
.then(function(response)
{
    console.log(response)
});
```

execute an update query

```javascript
db.updateTable('table', {name:"George Miles"}, "id=75")
.then(function(response)
{
	console.log(response);
});
```

execute an insert query

```javascript
db.addToTable('table', {name:"Carlo Mars"})
.then(function(response)
{
	console.log(response);
});
```

execute a delete query

```javascript
db.deleteFromTable('table', "id=75")
```

## Licence
The MIT License (MIT)

Copyright (c) 2017 Fabio Toste

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
