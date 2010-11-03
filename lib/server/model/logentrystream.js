const prequire = require('../../../prequire.js');
const child_process = require('child_process'),
      path = require('path'),
      tail = function(logpath,cb){
         if(!logpath){
            cb(new Error('Log Path must not be null'));
         }else{
            path.exists(logpath,function(exists){
               (exists)
                  ? cb(null,child_process.spawn('tail',['-f',logpath,'-n','+0']))
                  : cb(new Error(logpath+' does not exist'));
            });
         }
      };

var defaultParser = null;

const LogEntryStream = function(serverName,logpath,logentryparser,cb){
   if(cb){
      if(!(this instanceof LogEntryStream)){
         return new LogEntryStream(logpath,logentryparser,cb);
      }

      const self = this,
            parser = logentryparser 
               || defaultParser 
               || (defaultParser = prequire('lib/common/model/logentry.js').LogEntry.parse);

      var taillog = null;
      this.close = function(){
         taillog && taillog.kill('SIGINT');
         taillog = null;
      };
      this.onError = function(errorCb){
         taillog && taillog.stderr.on('data',errorCb);
      };
      this.onLogEntries = function(lesCb){
         var curCtx = {server:serverName};
         taillog && taillog.stdout.on('data',function(data){
            const les =  parser(data.toString(),curCtx);
            if(les.length > 0){
               curCtx = les[les.length-1];
            }
            lesCb(les);
         });
      };

      tail(logpath,function(e,tl){
         if(e){
            cb(e);
         }else{
            taillog = tl;
            cb(null,self);
         }
      });
   }
};
LogEntryStream.create = function(serverName, logpath,logentryparser,cb){
   return new LogEntryStream(serverName, logpath, logentryparser, cb);
};

module.exports = {
   LogEntryStream: LogEntryStream
}
