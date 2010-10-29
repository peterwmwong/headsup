const prequire = require('../../../prequire.js');
const examine = prequire('deps/server/examiner').examine,
      LogEntry = prequire('lib/common/model/logentry.js').LogEntry,
      ClientInfo = prequire('lib/common/model/logentry.js').ClientInfo;

const assertClientInfo = require('./asserts.js').assertClientInfo,
      assertLogEntry = require('./asserts.js').assertLogEntry;

examine('LogEntry.parse()',{
  'message only Log Entry': function(a){
      const msg = '123 1241 sdflksd 87324 sk !@%!@%',
            r   = LogEntry.parse(msg);
      a.ok(r !== null && r instanceof Array);
      a.ok(r.length,1);

      const le = r[0];
      a.equal(le.date,null);
      a.equal(le.category,null);
      a.equal(le.codeSource,null);
      a.equal(le.clientInfo,null);
      a.equal(le.msg,'123 1241 sdflksd 87324 sk !@%!@%');
      a.done();
   },

  'message only Log Entry uses parse context': function(a){
      const msg = '123 1241 sdflksd 87324 sk !@%!@%',
            ctx = {date: Date.now(), category:'cat', codeSource:'codesrc', clientInfo: 'ci'},
            r   = LogEntry.parse(msg,ctx);

      a.ok(r !== null && r instanceof Array);
      a.ok(r.length,1);
      
      const le = r[0];
      a.equal(le.date,ctx.date);
      a.equal(le.category,ctx.category);
      a.equal(le.codeSource,ctx.codeSource);
      a.equal(le.clientInfo,ctx.clientInfo);
      a.equal(le.msg,'123 1241 sdflksd 87324 sk !@%!@%');
      a.done();
   },

  'LogEntry': function(a){
      const r = LogEntry.parse('2010-10-12 08:41:31\tINFO\tCatalina\t(127.0.0.1 ID:2 siteID:10 userID:101)\t Initialization processed in 422 ms');
      a.ok(r !== null && r instanceof Array);
      a.ok(r.length === 1);
      
      assertLogEntry(a,r[0],{
         fullYear: 2010,
         month:      10,
         date:       12,
         hours:       8,
         minutes:    41,
         seconds:    31,
         category:   'INFO',
         codeSource: 'Catalina',
         clientInfo: {
            ip: '127.0.0.1',
            id: 2,
            siteid: 10,
            userid: 101
         },
         msg:'Initialization processed in 422 ms'
      });
      a.done();
   },

  'LogEntry ignores parse context': function(a){
      const ctx = {date: Date.now(), category:'cat', codeSource:'codesrc', clientInfo: 'ci'},
            r   = LogEntry.parse('2010-10-12 08:41:31\tINFO\tCatalina\t(127.0.0.1 ID:2 siteID:10 userID:101)\t Initialization processed in 422 ms');
      a.ok(r !== null && r instanceof Array);
      a.ok(r.length === 1);
      
      assertLogEntry(a,r[0],{
         fullYear: 2010,
         month:      10,
         date:       12,
         hours:       8,
         minutes:    41,
         seconds:    31,
         category:   'INFO',
         codeSource: 'Catalina',
         clientInfo: {
            ip: '127.0.0.1',
            id: 2,
            siteid: 10,
            userid: 101
         },
         msg:'Initialization processed in 422 ms'
      });
      a.done();
   },
  
   'LogEntry with NO clientInfo': function(a){
      const r = LogEntry.parse('2010-10-12 08:41:31\tINFO\tCatalina\t()\t Initialization processed in 422 ms');
      a.ok(r !== null && r instanceof Array);
      a.ok(r.length === 1);
      
      assertLogEntry(a,r[0],{
         fullYear: 2010,
         month:      10,
         date:       12,
         hours:       8,
         minutes:    41,
         seconds:    31,
         category:   'INFO',
         codeSource: 'Catalina',
         msg:        'Initialization processed in 422 ms',
         clientInfo: null
      });
      a.done();
   },
   
   'LogEntries': function(a) {
      const mContents = 
               '2010-10-12 08:41:30\tINFO1\tCatalina1\t(127.0.0.1 ID:1 siteID:11 userID:101)\t Initialization processed in 421 ms\n'+
               '2010-10-12 08:41:31\tINFO2\tCatalina2\t(127.0.0.2 ID:2 siteID:12 userID:102)\t Initialization processed in 422 ms\n'+
               '2010-10-12 08:41:32\tINFO3\tCatalina3\t(127.0.0.3 ID:3 siteID:13 userID:103)\t Initialization processed in 423 ms\n'+
               '2010-10-12 08:41:33\tINFO4\tCatalina4\t(127.0.0.4 ID:4 siteID:14 userID:104)\t Initialization processed in 424 ms\n'+
               '2010-10-12 08:41:34\tINFO5\tCatalina5\t(127.0.0.5 ID:5 siteID:15 userID:105)\t Initialization processed in 425 ms',
            r = LogEntry.parse(mContents);
      
      a.equal(r.length,5);

      for(var i=1; i<6; ++i){
         assertLogEntry(a,r[i-1],{
            fullYear: 2010, month: 10, date: 12,
            hours: 8, minutes: 41, seconds: 29+i,
            category:   'INFO'+i,
            codeSource: 'Catalina'+i,
            clientInfo: {
               ip: '127.0.0.'+i,
               id: i,
               siteid: 10+i,
               userid: 100+i
            },
            msg:'Initialization processed in 42'+i+' ms'
         });
      }

      a.done();
   },

   'message only Log Entries pick up context from previous Log Entries': function(a) {
      const mContents = 
               '2010-10-12 08:41:30\tINFO1\tCatalina1\t(127.0.0.1 ID:1 siteID:11 userID:101)\t Initialization processed in 421 ms\n'+
               'Blarg1\n'+
               '2010-10-12 08:41:31\tINFO2\tCatalina2\t(127.0.0.2 ID:2 siteID:12 userID:102)\t Initialization processed in 422 ms\n'+
               'Blarg2\n'+
               'Blarg3\n';
            r = LogEntry.parse(mContents);
      
      a.equal(r.length,5);

          
      assertLogEntry(a,r[0],{
         fullYear: 2010, month: 10, date: 12,
         hours: 8, minutes: 41, seconds: 30,
         category:   'INFO1',
         codeSource: 'Catalina1',
         clientInfo: {
            ip: '127.0.0.1',
            id: 1,
            siteid: 11,
            userid: 101
         },
         msg:'Initialization processed in 421 ms'
      }); 
 
      assertLogEntry(a,r[1],{
         fullYear: 2010, month: 10, date: 12,
         hours: 8, minutes: 41, seconds: 30,
         category:   'INFO1',
         codeSource: 'Catalina1',
         clientInfo: {
            ip: '127.0.0.1',
            id: 1,
            siteid: 11,
            userid: 101
         },
         msg:'Blarg1'
      });

      assertLogEntry(a,r[2],{
         fullYear: 2010, month: 10, date: 12,
         hours: 8, minutes: 41, seconds: 31,
         category:   'INFO2',
         codeSource: 'Catalina2',
         clientInfo: {
            ip: '127.0.0.2',
            id: 2,
            siteid: 12,
            userid: 102
         },
         msg:'Initialization processed in 422 ms'
      });

      assertLogEntry(a,r[3],{
         fullYear: 2010, month: 10, date: 12,
         hours: 8, minutes: 41, seconds: 31,
         category:   'INFO2',
         codeSource: 'Catalina2',
         clientInfo: {
            ip: '127.0.0.2',
            id: 2,
            siteid: 12,
            userid: 102
         },
         msg:'Blarg2'
      });

      assertLogEntry(a,r[4],{
         fullYear: 2010, month: 10, date: 12,
         hours: 8, minutes: 41, seconds: 31,
         category:   'INFO2',
         codeSource: 'Catalina2',
         clientInfo: {
            ip: '127.0.0.2',
            id: 2,
            siteid: 12,
            userid: 102
         },
         msg:'Blarg3'
      });


      a.done();
   }


});



examine('ClientInfo.parse()',{
   'return null on NON ClientInfo': function(a){
      var r = ClientInfo.parse('123 1241 sdflksd 87324 sk !@%!@%');
      a.ok(r === null);
      a.done();
   },

   'return ClientInfo': function(a){
      var r = ClientInfo.parse('127.0.0.1 ID:10 siteID:9 userID:8');
      assertClientInfo(a,r,{
         ip: '127.0.0.1',
         id: 10,
         siteid: 9,
         userid: 8
      });
      a.done();
   },
   
   'return ClientInfo with NO userID, siteID': function(a){
      var r = ClientInfo.parse('127.0.0.1 ID:10');
      assertClientInfo(a,r,{
         ip: '127.0.0.1',
         id: 10,
         siteid: null,
         userid: null
      });
      a.done();
   },

   'return ClientInfo with NO userID': function(a){
      var r = ClientInfo.parse('127.0.0.1 ID:10 siteID:9');
      assertClientInfo(a,r,{
         ip: '127.0.0.1',
         id: 10,
         siteid: 9,
         userid: null
      });
      a.done();
   },
 
   
});

