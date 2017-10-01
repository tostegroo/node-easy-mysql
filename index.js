'use strict';

var promise 	= require('bluebird');
var db 				= require('mysql-promise')();

/**
 * Export funciton
 * @param  {Object} config
 {
	 host     		: {String} "mysql host",
	 port 	  		: {String} "mysql port",
	 user     		: {String} "mysql user",
	 password 		: {String} "mysql password",
	 database 		: {String} "mysql database",
	 error_debug	: {Bollean} "a debug flag to log mysql errors"
 }
*/
module.exports = function(config)
{
	if(config)
		return new EasyMySQL(config);
	else
		return false;
}

/**
 * Constructor
 * @param  {Object} config
 */
function EasyMySQL(config)
{
	this.debug = config.error_debug || false;

	if(db)
		db.configure(config);
}

/**
 * End DB pool connections
 * @return {Promise}
 */
EasyMySQL.prototype.end = function()
{
	if(db)
	{
		return new Promise(function (resolve)
		{
			db.end().then(function(result)
			{
				resolve(result);
			});
		});
	}
}

/**
 * Change the configuration of the database instance
 * @param  {Object} config
 */
EasyMySQL.prototype.configure = function(config)
{
	if(db)
		db.configure(config);
}

/**
 * Return the database instance
 * @return {mysql database instance}
 */
EasyMySQL.prototype.getDatabase = function()
{
	return db;
}

/**
 * Executes a query using a given sql string
 * @param  {String} sql - A sql string to query
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Mysql.Database}
 */
EasyMySQL.prototype.query = function query(sql, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		if(db)
		{
			errorcallback = errorcallback || false;
			db.query(sql)
			.then(function(response)
			{
				if(typeof(response)=='object' && typeof(response[0])=='object')
				{
					if(response[0].length==1)
						resolve(response[0][0]);
					else if(response[0].length>0)
						resolve(response[0]);
					else if(response[0].length==undefined)
						resolve(response[0]);
					else
						resolve(false);
				}
				else
				{
					resolve(false);
				}
			})
			.catch(function(err)
			{
				if(self.debug)
					console.log('sqlerror', err);

				if(errorcallback)
					resolve({status:false, message:err});
				else
					resolve(false);
			});
		}
		else
			resolve(false);
	});
}

/**
 * Returns a sql update query string using a given dataset object
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} dataset - An json object dataset to compare to a given data
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @param  {String} where - A string with the where clause to be used on sql
 * @return {String}
 */
EasyMySQL.prototype.getUpdateQueryDataset = function getUpdateQueryDataset(table, dataset, data, where)
{
	if(typeof(data)=='string')
		data = JSONparse(data);

	var values = '';
	var first = 0;
	for (var i = 0; i < dataset.length; i++)
	{
		var table_column = dataset[i];
		var pre = (first==0) ? '' : ',';

		if(data.hasOwnProperty(table_column))
		{
			var value = getStringValue(data[table_column]);
			values += pre + table_column + '=' + value;

			first++;
		}
	}

	var sql = 'UPDATE '+table+' SET ' + values + ' WHERE ' + where;

	return sql;
}

/**
 * Executes a sql update using a given dataset object
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} dataset - An json object dataset to compare to a given data
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @param  {String} where - A string with the where clause to be used on sql
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Object.JSON}
 */
EasyMySQL.prototype.updateTableDataset = function updateTableDataset(table, dataset, data, where, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		var sql = self.getUpdateQueryDataset(table, dataset, data, where);

		self.query(sql, errorcallback)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

/**
 * Returns a sql update query string
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @param  {String} where - A string with the where clause to be used on sql
 * @return {String}
 */
EasyMySQL.prototype.getUpdateQuery = function getUpdateQuery(table, data, where)
{
	if(typeof(data)=='string')
		data = JSONparse(data);

	var values = '';
	var first = 0;

	for (var key in data)
	{
		var table_column = key;
		var pre = (first==0) ? '' : ',';

		var value = getStringValue(data[table_column]);
		values += pre + table_column + '=' + value;

		first++;
	}

	var sql = 'UPDATE '+table+' SET ' + values + ' WHERE ' + where;

	return sql;
}

/**
 * Executes a sql update
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @param  {String} where - A string with the where clause to be used on sql
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Object.JSON}
 */
EasyMySQL.prototype.updateTable = function updateTable(table, data, where, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		var sql = self.getUpdateQuery(table, data, where);

		self.query(sql, errorcallback)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

/**
 * Returns a sql insert query string using a given dataset object
 * @param  {String} table - A valid table to insert
 * @param  {Object.JSON} dataset - An json object dataset to compare to a given data
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @return {String}
 */
EasyMySQL.prototype.getInserQueryDataset = function getInserQueryDataset(table, dataset, data)
{
	if(typeof(data)=='string')
		data = JSONparse(data);

	var columns = '';
	var values = '';
	var first = 0;
	for (var i = 0; i < dataset.length; i++)
	{
		var table_column = dataset[i];
		var pre = (first==0) ? '' : ',';

		if(data.hasOwnProperty(table_column))
		{
			var value = getStringValue(data[table_column]);
			columns += pre + table_column;
			values += pre + value;

			first++;
		}
	}

	var sql = 'INSERT INTO ' + table + ' (' + columns + ') VALUES (' + values + ');';

	return sql;
}

/**
 * Executes a sql insert using a given dataset object
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} dataset - An json object dataset to compare to a given data
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Object.JSON}
 */
EasyMySQL.prototype.addToTableDataset = function addToTableDataset(table, dataset, data, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		var sql = self.getInserQueryDataset(table, dataset, data);

		self.query(sql, errorcallback)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

/**
 * Returns a sql insert query string
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @return {String}
 */
EasyMySQL.prototype.getInserQuery = function getInserQuery(table, data)
{
	if(typeof(data)=='string')
		data = JSONparse(data);

	var columns = '';
	var values = '';
	var first = 0;
	for (var key in data)
	{
		var table_column = key;
		var pre = (first==0) ? '' : ',';

		var value = getStringValue(data[table_column]);
		columns += pre + table_column;
		values += pre + value;

		first++;
	}

	var sql = 'INSERT INTO ' + table + ' (' + columns + ') VALUES (' + values + ');';

	return sql;
}

/**
 * Executes a sql insert
 * @param  {String} table - A valid table to update
 * @param  {Object.JSON} data - An json object with a pair key value to update the table
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Object.JSON}
 */
EasyMySQL.prototype.addToTable = function addToTable(table, data, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		var sql = self.getInserQuery(table, data);

		self.query(sql, errorcallback)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

/**
 * Returns a sql delete query string
 * @param  {String} table - A valid table to update
 * @param  {String} where - A string with the where clause to be used on sql
 * @return {String}
 */
EasyMySQL.prototype.getDeleteQuery = function getDeleteQuery(table, where)
{
	var sql = 'DELETE FROM ' + table + ' WHERE ' + where + ';';

	return sql;
}

/**
 * Executes a sql delete
 * @param  {String} table - A valid table to update
 * @param  {String} where - A string with the where clause to be used on sql
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Object.JSON}
 */
EasyMySQL.prototype.deleteFromTable = function deleteFromTable(table, where, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		var sql = self.getDeleteQuery(table, where);

		self.query(sql, errorcallback)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

/**
 * Executes a sql transaction
 * @param  {Object.ARRAY} querylist - A list of sql strings to transaction
 * @param  {Bollean} errorcallback - A bollean to inform if it will return a sql error or false
 * @return {Object.JSON}
 */
EasyMySQL.prototype.doTransaction = function doTransaction(querylist, errorcallback)
{
	var self = this;

	return new promise(function(resolve)
	{
		if(typeof(querylist)=='object')
		{
			var sql= "BEGIN;"
			sql += "START TRANSACTION;";

			for (var i = 0; i < querylist.length; i++)
				sql += querylist[i];

			sql += "COMMIT;";

			self.query(sql, errorcallback)
			.then(function(response)
			{
				console.log(response);
				resolve(response);
			});
		}
		else
		{
			resolve(false);
		}
	});
}

/**
 * A private function to normalize the value for sql query
 * @param  {String|Number|Object} value - The given value
 * @return {String}
 */
function getStringValue(value)
{
	var return_value = '';
	switch(typeof(value))
	{
		case 'string':
			return_value = "'" + value + "'";
			break;

		case 'number':
			return_value = value;
			break;

		case 'object':

			if(value==null)
					return_value = value;
			else
			{
					var valuestring = JSON.stringify(value);
					return_value = "'" + valuestring + "'";
			}
			break;

		default:
			return_value = "'" + value + "'";
			break;
	}
  return return_value;
}

/**
 * A private function get a Json object
 * @param  {String} string - The given string
 * @return {JSON Object}
 */
function JSONparse(string)
{
	string = string.replace(/:\s*"([^"]*)"/g, function(match, p1) {
		return ': "' + p1.replace(/:/g, '@colon@') + '"';
	}).replace(/:\s*'([^']*)'/g, function(match, p1) {
		return ': "' + p1.replace(/:/g, '@colon@') + '"';
	}).replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ');

	string = string.replace(/@colon@/g, ':');
	
	return JSON.parse(string);
}
