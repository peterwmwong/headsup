const prequire = require('../../prequire.js');

const serverPort = 8080;
var http = require('http');
const express        = prequire('deps/server/express'),
      io             = require('socket.io'),
      LogEntryStream = prequire('lib/server/model/logentrystream.js').LogEntryStream,
      log            = console.log.bind(console,'HeadsUp! ');

// Open server log from command-line argument
LogEntryStream.create(process.argv[2],null,function(e,leis){
   if(e){
      log(e.stack || e);
   }else{
      var handleShutdown = function(){
                  if(handleShutdown){ 
                     log('.... going down');
                     handleShutdown = null;
                     [leis,app].forEach(function(closeMe){
                        try{
                           closeMe && closeMe.close();
                        }catch(e){ 
                           log("Couldn't close",closeMe,e); 
                        }
                     });
                  }
               };

      // Listen for various forms of death 
      ['exit','SIGINT','SIGKILL'].forEach(function(sig){
         process.on(sig,handleShutdown);
      });
   
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
      //app = http.createServer(function(req, res){});

      
      //------ CONFIGURE ------//
      app.configure(function(){
            
            app.use(express.gzip());
            
            //------ STATIC ROUTES ------//
            app.use('/',express.staticProvider(__dirname + '/../client'));
            app.use('/jquery',express.staticProvider(__dirname + '/../../deps/client/jquery'));
            app.use('/cell',express.staticProvider(__dirname + '/../../deps/client/cell/dist/current'));
            app.use('/cell',express.staticProvider(__dirname + '/../../deps/client/cell/dist/current'));
            app.use('/sio',express.staticProvider(__dirname + '/../../deps/client/socket.io/'));
         });

      //------ ROUTES ------//
      app.listen(serverPort);

      // socket.io 
      socket = io.listen(app);
      socket.on('connection',function(client){
         console.log('noodle');
      	client.send('hello');
      });
      log(' WEB server up');
   }
};
