var container = null,
    lockIcon = null,
    isAutoScrollEnabled = true,
    scrollToLatest = function(){
      if(container && isAutoScrollEnabled){
         container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    },
    prevServer = null,
    updateLockIconPos = function(){
      if(lockIcon){ 
         lockIcon.style.setProperty('top',container.scrollTop+'px');
         lockIcon.style.setProperty('right','-'+container.scrollLeft+'px');
      }
    };

on('render',function(ev){
   container = ev.node;
   container.onscroll = updateLockIconPos;
   lockIcon = container.querySelector('#lock');
   cell(['LogEntry','LogEntryService'],function(LogEntry,LES){
      const renderFunc = function(le){
                  LogEntry.render(container,false,le,scrollToLatest);
               };
      LES.presenter.on('logentry',function(le){
         le.serverStyleClass = (prevServer == le.server)?'server':'newServer';
         prevServer = le.server;
         le.date = (new Date(le.date)).toLocaleTimeString();
         window.setTimeout(renderFunc,0,le);
      });
   });
});

// Toggle Auto Scrolling with Spacebar
document.onkeyup = function(e){
   var keyID = (window.event) ? event.keyCode : e.keyCode;
   if(keyID === 32){
      isAutoScrollEnabled = !isAutoScrollEnabled;
      if(isAutoScrollEnabled){
         if(lockIcon){
            lockIcon.className = '';
         }
         scrollToLatest();
      }else{
         if(lockIcon){ 
            lockIcon.className = 'visible';
         }
      }
   }
}
