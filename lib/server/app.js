const prequire = require('../../prequire.js');

const serverPort = 8080;
var http = require('http');
const express        = prequire('deps/server/express'),
      io             = prequire('deps/server/socket.io-node'),
      LogEntryStream = prequire('lib/server/model/logentrystream.js').LogEntryStream,
      log            = console.log.bind(console,'HeadsUp! '),
      streamFile     = process.argv[2];

// Open server log from command-line argument
LogEntryStream.create(streamFile,null,function(e,leis){
   if(e){
      log(e.stack || e);
   }else{
      log('Streaming log ',streamFile);
      
      // Let it begin
      setupWebApp();

      leis.onError(function(e){
         log(e.stack || e);
      });
      leis.onLogEntries(function(les){
         if(e){
            log(e.stack || e);
         }else if(les && les.length>0){
            broadcast(les);
         }
      });
   }
});

// Setup Web Server
var app = null;
var socket = null;
const broadcast = function(les){
   if(socket){
      les.forEach(function(le){
         socket.broadcast(JSON.stringify(le));
      });
   };
};
const setupWebApp = function(){
   if(app === null){
      app = express.createServer();
      
      //------ CONFIGURE ------//
      app.configure(function(){
            
            app.use(express.gzip());
            
            //------ STATIC ROUTES ------//
            app.use('/jquery',express.staticProvider(__dirname + '/../../deps/client/jquery'));
            //app.use('/cells',express.staticProvider(__dirname + '/../client/cells'));
            app.use('/cell',express.staticProvider(__dirname + '/../../deps/client/cell/dist/current'));
            app.use('/sio',express.staticProvider(__dirname + '/../../deps/client/socket.io/'));
            app.use('/',express.staticProvider(__dirname + '/../client'));
         });

      //------ ROUTES ------//
      app.listen(serverPort);

      // socket.io 
      socket = io.listen(app,{log:
         log.bind(null,'[Client WebSocket]')
      });
      log('WebServer up');
   }
};
