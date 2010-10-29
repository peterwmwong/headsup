const prequire = require('../../prequire.js');

const express = require('express'),
      path = require('path'),
      LogEntryStream = prequire('lib/server/model/logentrystream.js').LogEntryStream,
      log = console.log;

// TODO Process args: [options] SERVER_LOG_FILE

LogEntryStream.create(process.argv[2],null,function(e,leis){
   if(e){
      log(e.stack || e);
   }else{
      const handleShutdown = function(){
                  console.log('handleShutdown');
                  leis && leis.close();
                  leis = null;
                  app.close();
               };

      ['exit','SIGINT','SIGKILL'].forEach(function(sig){
         process.on(sig,handleShutdown);
      });

      setupWebApp();

      leis.onError(function(e){
         log(e.stack || e);
      });
      leis.onLogEntries(function(les){
         if(e){
            log(e.stack || e);
         }else if(les && les.length>0){
            log(les);
         }
      });
     }
});

// Setup Web Server
var app = null;
const setupWebApp = function(){
   if(app === null){
      app = express.createServer();
      
      //------ CONFIGURE ------//
      app.configure(function(){
            app.use(express.gzip());
            app.use('/',express.staticProvider(__dirname + '/../client'));
            app.use('/deps',express.staticProvider(__dirname + '/../../deps/client/lib'));
            app.use('/cells',express.staticProvider(__dirname + '/../../deps/client/lib'));
         });

      //------ ROUTES ------//
      app.listen(3333);
   }
};
