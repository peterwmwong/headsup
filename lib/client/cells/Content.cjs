var container = null,
    scrollToLatest = function(){
      if(container){
         container.scrollTop = container.scrollHeight - container.clientHeight;
         console.log(container.scrollTop);
      }
    };
on('render',function(ev){
   container = ev.node.querySelector('#Container');
});

cell(['LogEntry','LogEntryService'],function(LogEntry,LES){
   LES.presenter.on('logentry',function(le){
      if(container){
         LogEntry.render(
            container,
            false,
            le,
            scrollToLatest
         );
      }
   });
});
