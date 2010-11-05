console.log('LogEntryService',window.location.host);

var listenermap = {
         'logentry':[]
      }, 
    notifyListener = function(l,le){
         try{
            l(le);
         }catch(e){
            console.log("'logentry' event listener:",v," threw an error:",e);
         }
      },
    jsonWorker = new Worker('/jsonParseWorker.js');

jsonWorker.onmessage = function(les){
      les = les.data;
      listenermap.logentry.forEach(function(l){
         les.forEach(notifyListener.bind(null,l));
      });
   };

var socket = new io.Socket(window.location.hostname,{port:8080});
socket.connect();
socket.on('connect', console.log.bind(console,'connected'));
socket.on('disconnect', console.log.bind(console,'disconnected'));
socket.on('message', jsonWorker.postMessage.bind(jsonWorker));

this.on = function(ev,f){
   if(typeof ev === 'string' && typeof f === 'function'){
      if(listenermap[ev]){
         if(!listenermap[ev].some(function(v){return v === e;})){
            listenermap[ev].push(f);
         }
      }
   }
}
