var container = null,
    scrollToLatest = function(){
      if(container){
         container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    };
on('render',function(ev){
   container = ev.node;

   cell(['LogEntry','LogEntryService'],function(LogEntry,LES){
      LES.presenter.on('logentry',function(le){
         le.date = (new Date(le.date)).toLocaleTimeString();
         container && LogEntry.render(container,false,le,scrollToLatest);
      });
   });
});


