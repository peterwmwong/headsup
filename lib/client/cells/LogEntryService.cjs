console.log('LogEntryService',window.location.host);

var socket = new io.Socket(window.location.hostname,{port:8080});
socket.connect();
socket.on('connect', console.log.bind(console,'connected'));
socket.on('disconnect', console.log.bind(console,'disconnected'));
socket.on('message', function(msg){
   var le =  JSON.parse(msg);
   listenermap.logentry.forEach(function(v){
      try{
         v(le);
      }catch(e){
         console.log("'logentry' event listener:",v," threw an error:",e);
      };
   });
});

var listenermap = {
   'logentry':[]
} 

this.on = function(ev,f){
   if(typeof ev === 'string' && typeof f === 'function'){
      if(listenermap[ev]){
         if(!listenermap[ev].some(function(v){return v === e;})){
            listenermap[ev].push(f);
         }
      }
   }
}
