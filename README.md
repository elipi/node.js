node.js
=======

node.js代码收集(自开发)


SQLBuilder.js
使用javascript语法构建SQL语句


代码：
  var SQL = require("./SQLBuilder.js");
  
  var sql = SQL.SELECT()
    .table('user')
    .fields(['name','userId','gold'])
    .where({'userId':'10000','exp':1})
    .sql();

  输出：SELECT name,userId,gold FROM user WHERE (userId>='10000' AND exp>='1')
  
目前支持：SELECT UPDATE INSERT DELETE 语句
