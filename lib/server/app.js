const prequire = require('../../prequire.js');

const serverPort     = 8080;

const express        = prequire('deps/server/express'),
      io             = prequire('deps/server/socket.io-node'),
      LogEntryStream = prequire('lib/server/model/logentrystream.js').LogEntryStream,
      fs             = require('fs'),
      log            = console.log.bind(console,'HeadsUp! '),
      streamConfigFile = process.argv[2],
      ipMapFile      = process.argv[3];

// Map ip addresses to people
var ipMap = ipMapFile ? JSON.parse(fs.readFileSync(ipMapFile)) : {};

// Digest stream config file
var streamConfig = JSON.parse(fs.readFileSync(streamConfigFile));

// Open server log from command-line argument
Object.getOwnPropertyNames(streamConfig).forEach(function(serverName){
   const serverLog = streamConfig[serverName];
   LogEntryStream.create(serverName,serverLog,null,function(e,leis){
      if(e){
         log(e.stack || e);
      }else{
         log('Streaming log ',serverName,serverLog);
         
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
});

// Setup Web Server
const broadcast = function(les){
      if(socket){
         les.forEach(function(le){
            if(le.clientInfo && le.clientInfo.ip){
               var newIp = ipMap[le.clientInfo.ip];
               if(newIp){
                  le.clientInfo.ip = newIp;
               }
            }
            socket.broadcast(JSON.stringify(le));
         });
      };
   };

const app = express.createServer();

//------ CONFIGURE ------//
app.configure(function(){
      
      app.use(express.gzip());
      
      //------ STATIC ROUTES ------//
      app.use('/jquery',express.staticProvider(__dirname + '/../../deps/client/jquery'));
      app.use('/cell',express.staticProvider(__dirname + '/../../deps/client/cell/dist/current'));
      app.use('/sio',express.staticProvider(__dirname + '/../../deps/client/socket.io/'));
      app.use('/',express.staticProvider(__dirname + '/../client'));
   });

//------ ROUTES ------//
app.listen(serverPort);

// socket.io 
const socket = io.listen(app, {log:log.bind(null,'[Client WebSocket]')});

log('WebServer up');
