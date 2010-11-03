var container = null,
    isAutoScrollEnabled = true,
    scrollToLatest = function(){
      if(container && isAutoScrollEnabled){
         container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    },
    prevServer = null;

on('render',function(ev){
   container = ev.node;

   cell(['LogEntry','LogEntryService'],function(LogEntry,LES){
      console.log('LogEntry',LogEntry);
      console.log('LogEntryService',LES);
      console.log('arguments',arguments);

      LES.presenter.on('logentry',function(le){
         le.serverStyleClass = (prevServer == le.server)?'server':'newServer';
         prevServer = le.server;
         le.date = (new Date(le.date)).toLocaleTimeString();
         container && LogEntry.render(container,false,le,scrollToLatest);
      });
   });
});

// Toggle Auto Scrolling with Spacebar
document.onkeyup = function(e){
   var keyID = (window.event) ? event.keyCode : e.keyCode;
   if(keyID === 32){
      isAutoScrollEnabled = !isAutoScrollEnabled;
      isAutoScrollEnabled && scrollToLatest();
   }
}
