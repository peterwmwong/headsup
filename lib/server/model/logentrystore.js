const prequire = require('../../../prequire.js');
const LogEntry = prequire('lib/common/model/logentry.js').LogEntry;

const toUTCMilliseconds = (function(utcFields,d){
            return Date.UTC.apply(Date,utcFields.map(function(v){
               return d[v]();
            }));
         }).bind(null,['getFullYear','getMonth','getDate','getHours','getMinutes','getSeconds','getMilliseconds']);
var LogEntryStore = function(db){

   this.store = function(le,cb){
      if(le === null || !(le instanceof LogEntry)){
         cb(new Error((le === null && 'Cannot store null LogEntry') || 'Cannot store non-LogEntry'));
      }else{
         db.incr('numLogEntries',function(e,num){
               const id = num-1,
               ci = le.clientInfo;
               db.hmset('le:'+id, 
                  'date',le.date && toUTCMilliseconds(le.date),
                  'category',le.category,
                  'codeSource',le.codeSource,
                  'clientInfo:ip',ci.ip,
                  'clientInfo:id',ci.id,
                  'clientInfo:siteid',ci.siteid,
                  'clientInfo:userid',ci.userid,
                  'msg',le.msg,
                  function(e){cb(e,id);}
               );
         });
      }
   };

   this.rangeByLine = function(start,end,cb){
       
   };
};

module.exports = {
   LogEntryStore: LogEntryStore
};
