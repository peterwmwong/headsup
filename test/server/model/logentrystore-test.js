const  prequire = require('../../../prequire.js');

const  numdbs = 24,
       host   = '127.0.0.1';

// Imports
const redis            = require('redis'),
      redisRemote      = require('redis-remote'),
      pool             = new (require('pool').Pool)(numdbs),
      examine          = prequire('deps/server/examiner').examine,
      assertClientInfo = prequire('test/common/model/asserts.js').assertClientInfo,
      assertLogEntry   = prequire('test/common/model/asserts.js').assertLogEntry,
      LogEntry         = prequire('lib/common/model/logentry.js').LogEntry,
      LogEntryStore    = prequire('lib/server/model/logentrystore.js').LogEntryStore;

const l = console.log,
      toUTCMilliseconds = (function(utcFields,d){
            return Date.UTC.apply(Date,utcFields.map(function(v){return d[v]();}));
         }).bind(null,['getFullYear','getMonth','getDate','getHours','getMinutes','getSeconds','getMilliseconds']);

var server = null;

examine('LogEntryStore.store',
      
   // Tests
   {  'error on null':function(a,lestore){
         lestore.store(null,function(e,id){
            a.ok(e);
            a.ok(!id);
            a.done();
         });
      },
      'store LogEntry': function(a,lestore,c){
         const le = LogEntry.parse('2010-10-12 08:41:31\tINFO\tCatalina\t(127.0.0.1 ID:2 siteID:10 userID:101)\t Initialization processed in 422 ms')[0],
               v = function(res,index){return res[index].toString();};

         lestore.store(le,function(e,id){
            a.equal(e,null);
            a.equal(id,0);
            
            c.get('numLogEntries',function(e,num){
               a.equal(num,'1');
               c.hmget('le:'+id, 
                  'date','category','codeSource',
                  'clientInfo:ip','clientInfo:id','clientInfo:siteid','clientInfo:userid',
                  'msg',function(e,r){

                  a.equal(v(r,0),Date.UTC(2010,10,12,8,41,31,0).toString());
                  a.equal(v(r,1),'INFO');
                  a.equal(v(r,2),'Catalina');
                  a.equal(v(r,3),'127.0.0.1'); // clientInfo.ip
                  a.equal(v(r,4),'2');         // clientInfo.id
                  a.equal(v(r,5),'10');        // clientInfo.siteid
                  a.equal(v(r,6),'101');       // clientInfo.userid
                  a.equal(v(r,7),'Initialization processed in 422 ms');
                  a.done();
               });
            });
         });
      }, 

      'store LogEntries (5)': function(a,lestore,c){
         var verifiedCount = 0;
         const les = LogEntry.parse(
               '2010-10-12 08:41:30\tINFO1\tCatalina\t(127.0.0.1 ID:1 siteID:11 userID:101)\t Initialization processed in 421 ms\n'+
               '2010-10-12 08:41:31\tINFO2\tCatalina\t(127.0.0.2 ID:2 siteID:12 userID:102)\t Initialization processed in 422 ms\n'+
               '2010-10-12 08:41:32\tINFO3\tCatalina\t(127.0.0.3 ID:3 siteID:13 userID:103)\t Initialization processed in 423 ms\n'+
               '2010-10-12 08:41:33\tINFO4\tCatalina\t(127.0.0.4 ID:4 siteID:14 userID:104)\t Initialization processed in 424 ms\n'+
               '2010-10-12 08:41:34\tINFO5\tCatalina\t(127.0.0.5 ID:5 siteID:15 userID:105)\t Initialization processed in 425 ms'),
             v = function(res,index){return res[index].toString();},
             verifyLogEntryInDB = function(id){
                c.hmget('le:'+id, 
                   'date','category','codeSource',
                   'clientInfo:ip','clientInfo:id','clientInfo:siteid','clientInfo:userid',
                   'msg',function(e,r){
                      const exple = les[storedleids[id]],
                            ci = exple.clientInfo;
                      a.equal(v(r,0),toUTCMilliseconds(exple.date));
                      a.equal(v(r,1),exple.category);
                      a.equal(v(r,2),exple.codeSource);
                      a.equal(v(r,3),ci.ip);     // clientInfo.ip
                      a.equal(v(r,4),ci.id);     // clientInfo.id
                      a.equal(v(r,5),ci.siteid); // clientInfo.siteid
                      a.equal(v(r,6),ci.userid); // clientInfo.userid
                      a.equal(v(r,7),exple.msg);
                      ++verifiedCount === les.length && a.done();
                   }
                );
             },
             storedleids = [],
             storeHandler = function(leid,e,id){
                a.ok(!e);
                storedleids.push(id);
                storedleids[id] = leid;

                if(storedleids.length == les.length){
                   c.get('numLogEntries',function(e,num){
                      a.equal(num,'5');
                      storedleids.forEach(verifyLogEntryInDB);
                   });
                }
             };

            les.forEach(function(le,i){
               lestore.store(le,storeHandler.bind(null,i));
            });
      }
   },
 
   // Config
   {  setup: function(cb){
         redisRemote.createServer(function(e,s){
            server = s;
            cb();
         },numdbs);
      },
      
      setupTest: function(cb,n){
         pool.alloc(function(dbid){
            var client = redis.createClient(server.port,host);
            var clientForTest = redis.createClient(server.port,host);
            client.select(dbid);
            clientForTest.select(dbid);
            client.flushdb(function(e){
               if(e){
                  cb(e);
               }else{
                  cb(null, new LogEntryStore(clientForTest), client, clientForTest, dbid);
               }
            });
         });
      },
      
      teardownTest: function(cb,n,les,client,clientForTest,dbid){
         client.end();
         clientForTest.end();
         pool.free(dbid);
         cb();
      },

      teardown: function(cb){
         try{ server && server.stop(); }
         catch(e){ l(e); }
         cb();
      }
   }  
);

