const prequire = require('../../../prequire.js');
const log = console.log;
const fs = require('fs'),
      path = require('path'),
      repl = require('repl'),
      examine = prequire('deps/server/examiner').examine,
      LogEntry = prequire('lib/common/model/logentry.js').LogEntry,
      LogEntryStream = prequire('lib/server/model/logentrystream.js').LogEntryStream,
      assertClientInfo = prequire('test/common/model/asserts.js').assertClientInfo,
      assertLogEntry = prequire('test/common/model/asserts.js').assertLogEntry;

var   curTmpFiles = [];
const createTmpFile = function(){
            if(curTmpFiles){
               const f = '/tmp/logentryinputstream-test'+Date.now()+curTmpFiles.length;
               curTmpFiles.push(f);
               return f;
            }
         },
      lesToClose = [],
      removeAllTmpFiles = 
      writeToFile = function(f,content,append){
            var fid = fs.openSync(f,(append)?'a':'w+');
            fs.writeSync(fid,content);
            fs.closeSync(fid);
         };

const range = function(s,e){
            var result = [];
            for(var i=s; i<=e; ++i){
               result.push(i);
            }
            return result;
         },
      createContent = function(r,ctx){
            const expects = {};

            return {
               expects: expects,
               fileContents: r.reduce(function(r,v){
                                          
                     var c = (expects[v] = (!ctx)
                        ? {
                           fullYear: 2010, month: 10, date: 12,
                           hours: 8, minutes: 41, seconds: 30+v,
                           category:   'INFO'+v,
                           codeSource: 'Catalina'+v,
                           clientInfo: {
                              ip: '127.0.0.'+v,
                              id: v,
                              siteid: 10+v,
                              userid: 100+v
                           },
                           msg:'Initialization processed in '+(420+v)+' ms'
                        }
                        : {
                           fullYear: ctx.fullYear, month: ctx.month, date: ctx.date,
                           hours: ctx.hours, minutes: ctx.minute, seconds: ctx.seconds,
                           category:   ctx.category,
                           codeSource: ctx.codeSource,
                           clientInfo: ctx.clientInfo,
                           msg:'Initialization processed in '+(420+v)+' ms'
                        });
                     var ci = c.clientInfo;
                     var result = r
                        +((!ctx) 
                          ? c.fullYear+'-'+c.month+'-'+c.date+' 0'+c.hours+':'+c.minutes+':'+c.seconds
                            +'\t'+c.category+'\t'+c.codeSource
                            +'\t('+ci.ip+' ID:'+ci.id+' siteID:'+ci.siteid+' userID:'+ci.userid+')\t '
                          : '')
                        +c.msg+'\n';
                     return result;
                  },' ')
            };
         };

examine('LogEntryStream',{
   'errors on non-existent log file':function(a){
      LogEntryStream.create('ultraBogusPaThOfDOOOM',null,function(e,lestream){
         a.ok(e);
         a.ok(!lestream);
         a.done();
      });      
   },
   'streams current contents':function(a){
      // Create 11 to make sure tail commands default of 
      // 'last 10 lines' is NOT being used
      const contents = createContent(range(0,10)),
            f = createTmpFile();

      writeToFile(f,contents.fileContents);
      
      lesToClose.push(LogEntryStream.create(f,null,function(e,leis){
         a.ok(!e && leis && leis instanceof LogEntryStream);
         
         leis.onError(function(e){
            a.ok(!e);  
         });
         leis.onLogEntries(function(les){
            a.equal(les.length,11);
            les.forEach(function(v,i){
               a.ok(v instanceof LogEntry);
               assertLogEntry(a,v,contents.expects[i]);
            });

            try{
               leis.close();
            }catch(e){
               a.ok('LogEntryStream.close() should not throw error='+e,!e)
            }
         });
         
         a.done();
      }));
   },

   'streamed message-only Log Entries inherit context':function(a){
      var curRange = range(0,2),
          writeCount = 0,
          contents = createContent(curRange);
      const f = createTmpFile();

      writeToFile(f,contents.fileContents);    
 
      lesToClose.push(LogEntryStream.create(f,null,function(e,leis){
         a.ok(!e && leis && leis instanceof LogEntryStream);
         leis.onError(a.ok.bind(a,false));
         leis.onLogEntries(function(les){
            les.forEach(function(v,i){
               i = curRange[i];
               a.ok(v instanceof LogEntry);
               assertLogEntry(a,v,contents.expects[i]);
            });

            if(++writeCount<5){
               curRange = range(writeCount*3,writeCount*3+2);
               contents = createContent(curRange,(writeCount%2)?contents[writeCount*3-1]:null);
               writeToFile(f,contents.fileContents,true);
            }else{
               try{
                  leis.close();
               }catch(e){
                  a.ok('LogEntryStream.close() should not throw error='+e,!e)
               }
               a.done();
            }
         });
      }));
   },

   'streams appended content':function(a){
      var curRange = range(0,2),
          writeCount = 0,
          contents = createContent(curRange);
      const f = createTmpFile();

      writeToFile(f,contents.fileContents);  
      
      lesToClose.push(LogEntryStream.create(f,null,function(e,leis){
         a.ok(!e && leis && leis instanceof LogEntryStream);
         leis.onError(a.ok.bind(a,false));
         leis.onLogEntries(function(les){
            les.forEach(function(v,i){
               i = curRange[i];
               a.ok(v instanceof LogEntry);
               assertLogEntry(a,v,contents.expects[i]);
            });

            if(++writeCount<5){
               curRange = range(writeCount*3,writeCount*3+2);
               contents = createContent(curRange);
               writeToFile(f,contents.fileContents,true);
            }else{
               try{
                  leis.close();
               }catch(e){
                  a.ok('LogEntryStream.close() should not throw error='+e,!e)
               }
               a.done();
            }
         });
      }));
   }

},{
   teardown: function(cb){
      lesToClose.forEach(function(v){
         v.close();
      });
      curTmpFiles.forEach(function(p){
         fs.unlinkSync(p);
      });
      cb();
   }
});

