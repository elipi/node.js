/**
 * Created with JetBrains WebStorm.
 * User: lipi
 * Date: 13-6-20
 * Time: 下午8:34
 * To change this template use File | Settings | File Templates.
 */


/**
 *
 var SQL1 = SQL.SELECT()
 .table('user')
 .fields(['name','userId','gold'])
 .where({'userId':'10000','exp':1}).toOR().operator('>=')
 .or({'userId':'990'}).operator('>')
 .where({'userId':'1000'}).operator('<');

 SELECT name,userId,gold FROM user WHERE (userId>='10000' OR exp>='1') OR (userId>'990') AND (userId<'1000')


 var SQL2 = SQL.UPDATE()
 .table('user')
 .set({'name':'李','gold':'1212'})
 .where({'userId':'10000'});

 UPDATE user SET name='李',gold='1212' WHERE (userId='10000')


 var SQL3 = SQL.INSERT()
 .table('hero')
 .newData([{'name':'李','gold':'1212'},{'name':'李','gold':'1213'}])
 .newData({'name':'xxx','gold':1214});

 INSERT INTO hero (name,gold) VALUES ('李','1212'),('李','1213'),('xxx','1214')



 var SQL4 = SQL.DELETE()
 .table('user')
 .where({'name':'李'});

 DELETE FROM user WHERE (name='李')



 *
 */




function SQL(type)
{
    this._type = type;//当前查询类别
    this._tableName = null;//表名
    this._conditions = [];//条件
    this._fields = [];//字段名
    this._asFields = {};//字段别名
    this._findName = null;//当前查询的名称，用于后续的方法进行牏
    this._operatorObj = {};//更改操作符
    this._childWhereType = {};//子查询类别，将一个查询条件设为OR
    this._set = [];//UPDATE 的新值
    this._newData = [];//插入的值 INSERT
}

/**
 * SQL 表名
 * @param tableName
 * @returns {SQL}
 */
SQL.prototype.table = function(tableName)
{
    this._tableName = tableName;
    return this;
}


/**
 * 字段列表
 * @param fields
 * @returns {SQL}
 */
SQL.prototype.fields = function(fields)
{
    console.log("tableName::::::::::",this._tableName);
    this._fields.push(fields);
    return this;
}


/**
 * 重命名某个字段(可以用find定位一个字段然后调用as方法,或者在调用field只传入一个字符串类的字段名然后调用as)
 * @param newName
 * @returns {SQL}
 */
SQL.prototype.as = function(newName)
{
    if(this._findName !== null)
    {
        this._asFields[this._findName] = newName;
    }else{
        var mFieldName;
        if(this._fields.length>=1)
        {
            mFieldName = this._fields[this._fields.length-1];
        }
        if(typeof mFieldName === 'string')
        {
            this._asFields[mFieldName] = newName;
        }
    }
    this._findName = null;
    return this;
}


/**
 * 查找一个字段名
 * @param fieldName
 * @returns {SQL}
 */
SQL.prototype.find = function(fieldName)
{
    this._findName = fieldName;
    return this;
}

/**
 * 查询条件
 * @param conditions
 * @returns {SQL}
 */
SQL.prototype.where = function(conditions)
{
    this._conditions.push('AND');
    this._conditions.push(conditions);
    return this;
}

/**
 * 加and 查询
 * @param conditions
 * @returns {SQL}
 */
SQL.prototype.and = function(conditions)
{
    this._conditions.push('AND');
    this._conditions.push(conditions);
    return this;
}

/**
 * OR 查询
 * @param conditions
 * @returns {SQL}
 */
SQL.prototype.or = function(conditions)
{
    this._conditions.push('OR');
    this._conditions.push(conditions);
    return this;
}

/**
 * 将当前的条件语句中内容设置为OR
 * @returns {BASE}
 */
SQL.prototype.toOR = function()
{
    this._childWhereType[this._conditions.length-1] = 'OR';
    return this;
}

/**
 * 查询的运算符 ">,<,=,>=,<="
 * @param operatorStr
 * @returns {SQL}
 */
SQL.prototype.operator = function(operatorStr)
{
    if(this._findName !== null)
    {
        this._operatorObj[this._findName] = operatorStr;
    }else{
        this._operatorObj[this._conditions.length-1] = operatorStr;
    }
    this._findName = null;
    return this;
}


/**
 * UPDATE, 语句 要更新的值
 * @param data
 * @returns {SQL}
 */
SQL.prototype.set = function(data)
{
    this._set.push(data);
    return this;
}

/**
 * INSERT INTO 语句 要抛入的值
 * @param {Array | Object} data
 * @returns {SQL}
 */
SQL.prototype.newData = function(data)
{
    this._newData = this._newData.concat(data);
    return this;
}


/**
 * 输出sql语句
 * @returns {*}
 */
SQL.prototype.sql = function()
{
    switch (this._type)
    {
        case 'SELECT':
            return this.SELECT();
            break;
        case 'UPDATE':
            return this.UPDATE();
            break;
        case 'INSERT':
            return this.INSERT();
            break;
        case 'DELETE':
            return this.DELETE();
            break;
    }
}



//SELECT //SELECT //SELECT //SELECT //SELECT //SELECT //SELECT

/**
 * 输出SQL语句文本(SELECT)
 */
SQL.prototype.SELECT = function()
{
    var sqlStr = 'SELECT ';
    sqlStr += fieldsHandler(this._fields,this._asFields);
    sqlStr += ' FROM ';
    sqlStr += clear(this._tableName);
    sqlStr += ' WHERE ';
    sqlStr += whereHandler(this._conditions,this._operatorObj,this._childWhereType);
    return sqlStr;
}

/**
 * 输出SQL语句文本(UPDATE)
 */
SQL.prototype.UPDATE = function()
{
    var sqlStr = 'UPDATE ';
    sqlStr += clear(this._tableName);
    sqlStr += ' SET ';
    sqlStr += toKV(this._set);
    sqlStr += ' WHERE ';
    sqlStr += whereHandler(this._conditions,this._operatorObj,this._childWhereType);
    return sqlStr;
    //UPDATE Person SET FirstName = 'Fred' WHERE LastName = 'Wilson'
}

/**
 * 输出SQL语句文本(INSERT)
 */
SQL.prototype.INSERT = function()
{
    var sqlStr = 'INSERT INTO ';
    sqlStr += clear(this._tableName);
    sqlStr += ' ';
    var newDataStrArr = toInsertData(this._newData);
    sqlStr += newDataStrArr[0];
    sqlStr += ' VALUES ';
    sqlStr += newDataStrArr[1];
    return sqlStr;
    //INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees')
}

/**
 * 输出SQL语句文本(DELETE)
 */
SQL.prototype.DELETE = function()
{
    //DELETE FROM Person WHERE LastName = 'Wilson'
    var sqlStr = 'DELETE FROM ';
    sqlStr += clear(this._tableName);
    sqlStr += ' WHERE ';
    sqlStr += whereHandler(this._conditions,this._operatorObj,this._childWhereType);
    return sqlStr;
}



////////////////通用方法

//清理字符串中的空格
function clear(str)
{
    if(typeof str === 'string')
    {
        return str.replace(/(\s*)/g, "");
    }else
    {
        return str;
    }
}


//SELECT 显示字段的名字的生成
function fieldsHandler(fields,asFields)
{
    if(fields === null || fields.length === 0) return '*';

    var mArr = [];
    var str = '';
    for(var i = 0;i<fields.length;i++)
    {
        mArr = mArr.concat(fields[i]);
    }

    for(var i = 0;i<mArr.length;i++)
    {
        var item = mArr[i];
        if(asFields.hasOwnProperty(item))
        {
            var asName = asFields[item];
            str += clear(item);
            str += ' AS ';
            str += clear(asName);
        }else{
            str += clear(item);
        }
        if(i < mArr.length-1 )
        {
            str += ',';
        }
    }
    return str;
}

/**
 * 搜索条件的生成
 * @param {Array} conditions
 * @param operatorObj
 * @param childWhereType
 */
function whereHandler(conditions,operatorObj,childWhereType)
{
    if(conditions === null || conditions.length == 0) return 1;

    var sqlStr = '';
    for(var i = 0;i<conditions.length;i++)
    {
        var obj = conditions[i];
        if(obj === 'AND' || obj === 'OR')
        {
            if(i !== 0)
            {
                sqlStr += ' ';
                sqlStr += obj;
                sqlStr += ' ';
            }
            continue;
        }
        sqlStr += '(';
        if(typeof obj === 'string')
        {
            sqlStr += clear(obj);
        }else{
            var mArr = [];
            for(var key in obj)
            {
                var mStr = clear(key);
                if(operatorObj.hasOwnProperty(i.toString()))
                {
                    mStr += clear(operatorObj[i]);
                }else if(operatorObj.hasOwnProperty(key))
                {
                    mStr += clear(operatorObj[key]);
                }else{
                    mStr += '=';
                }
                mStr += "'";
                mStr += clear(obj[key]);
                mStr += "'"
                mArr.push(mStr)
            }
            if(childWhereType.hasOwnProperty(i.toString()))
            {
                sqlStr += mArr.join(' OR ');
            }else{
                sqlStr += mArr.join(' AND ');
            }
        }
        sqlStr += ')';
    }
    return sqlStr;
}


/**
 * 将set 中的数据生成 key='val',key2='val2'格式
 * @param {Array} data
 */
function toKV(data)
{
    if(data == null || data.length == 0) return '';
    var mArr = [];
    for(var i = 0;i<data.length;i++)
    {
        var mObj = data[i];
        if(typeof mObj === 'string')
        {
            mArr.push(clear(mStr));
        }else{
            for(var key in mObj)
            {
                var mStr = '';
                mStr += clear(key);
                mStr += '=';
                mStr += "'";
                mStr += clear(mObj[key]);
                mStr += "'";
                mArr.push(mStr);
            }
        }
    }
    return mArr.join(',');
}

/**
 * 将new Data 生成 INSERT 中的数据，返回数组，[0] 字段名列表，[1]为插入的值
 * @param arr
 * @returns {Array}
 */
function toInsertData(arr)
{
    if(arr == null || arr.length == 0) return [1,1];
    var aKeys = null;
    var aVals = [];
    for(var i = 0;i<arr.length;i++)
    {
        var mObj = arr[i];
        var mKeys = [];
        var mVals = [];
        for(var key in mObj)
        {
            if(aKeys === null) mKeys.push(key);
            mVals.push("'" + clear(mObj[key]) + "'");
        }
        if(aKeys === null) aKeys = mKeys;
        aVals.push(mVals.join(','));
    }
    var mKeyStr = '(' + aKeys.join(',') + ')';
    var mValStr = '(' + aVals.join('),(') + ')';
    return [mKeyStr,mValStr];
}



/**
 * 实例化SELECT
 * @returns {SQL}
 */
function newSELECT()
{
    return new SQL('SELECT');
}

/**
 * 实例化UPDATE
 * @returns {SQL}
 */
function newUPDATE()
{
    return new SQL('UPDATE');
}

/**
 * 实例化INSERT INTO
 * @returns {SQL}
 */
function newINSERT()
{
    return new SQL('INSERT');
}

/**
 * 实例化一个删除操作
 * @returns {SQL}
 */
function newDelete()
{
    return new SQL('DELETE');
    //DELETE FROM Person WHERE LastName = 'Wilson'
}



exports.SELECT = newSELECT;
exports.UPDATE = newUPDATE;
exports.INSERT = newINSERT;
exports.DELETE = newDelete;


