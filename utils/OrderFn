/**
 * 异步顺序执行函数
 * User: lipi
 * Date: 13-5-21
 * Time: 下午5:28
 */


function OrderFn()
{
    this._itemFnList = [];//保存要执行的函数
    this._currentPosition = 0;//保存当前执行的位置
    this._isRun = false;//保存当前是否运行中
}

/**
 * 添加一个要执行的函数，如果当前没有函数正在执行则会马上调用
 * @param fn
 */
OrderFn.prototype.add = function(fn)
{
    this._itemFnList.push(fn);
    this.run();
}

/**
 * 调用执行（如果当前某个回调没有完成run不做任何事）
 */
OrderFn.prototype.run = function()
{
    if(this._isRun == false)
    {
        if(this._itemFnList.length - 1 > this._currentPosition)
        {
            var mFn = this._itemFnList[this._currentPosition];
            this._isRun = true;
            this._currentPosition++;
            mFn.call();
        }
    }
}

/**
 * 完成一个函数的执行，程序会自动调用下一个函数（如果有的话）
 */
OrderFn.prototype.finish = function()
{
    this._isRun = false;
    this.run();
}



module.exports = OrderFn;
