const log = console.log.bind(console);

const Indicators = function(parentNode){
   if(!(this instanceof Indicators)){
      return new Indicators(parentNode);
   }
   
   const self = this;
         $ = parentNode.querySelector.bind(parentNode),
         ind = $('#indicators'),
         lockIcon = $('#lock'),
         refreshIcon = $('#refresh');

   self.scrollLock = function(enable){
      lockIcon.className = (enable === false)?'':'visible';
   };
   self.disconnect = function(enable){
      refreshIcon.className = (enable === false)?'':'visible';
      self.scrollLock(!enable);
   };
   self.updatePos = function(){
      ind.style.setProperty('top',parentNode.scrollTop+'px');
      ind.style.setProperty('right','-'+parentNode.scrollLeft+'px');
   };
};

var container = null,
    indicators = null,
    isConnected = true,
    isScrollLock = false,
    scrollToLatest = function(){
      if(!isScrollLock && isConnected){
         container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    },
    prevServer = null;

on('render',function(ev){
   container = ev.node;
   indicators = new Indicators(container);
   container.onscroll = indicators.updatePos;
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
      LES.presenter.on('disconnect',function(){
         isConnected = false;
         indicators.disconnect(true);
      });
   });
});

// Toggle Auto Scrolling with Spacebar
document.onkeyup = function(e){
   var keyID = (window.event) ? event.keyCode : e.keyCode;
   if(keyID === 32 && isConnected){
      isScrollLock = !isScrollLock;
      isScrollLock && scrollToLatest();
      indicators.scrollLock(isScrollLock);
   }
}
