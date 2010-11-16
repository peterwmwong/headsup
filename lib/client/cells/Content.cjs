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
    prevServer = null,
    firstLEIndex = 0,
    lastLEIndex = 0;

const MAX_LOG_ENTRIES = 3000;

on('render',function(ev){
   container = ev.node;
   indicators = new Indicators(container);
   container.onscroll = indicators.updatePos;
   window.setInterval(function(){
      var node = null;
      while(lastLEIndex - firstLEIndex > MAX_LOG_ENTRIES) {
         try{
            node = document.querySelector('#LogEntry'+firstLEIndex);
            if(node){
               node.parentElement.removeChild(node);
            }
         }catch(e){
         }finally{
            ++firstLEIndex;
         }
      }
   },1000);
   cell(['LogEntry','WelcomeEntry','LogEntryService'],function(LogEntry,WE,LES){
      const renderFunc = function(le){
                  LogEntry.render(container,false,le,scrollToLatest);
               };
      LES.presenter.on('logentry',function(le){
         le.serverStyleClass = (prevServer == le.server)?'server':'newServer';
         prevServer = le.server;
         le.date = (new Date(le.date)).toLocaleTimeString();
         ++lastLEIndex;
         window.setTimeout(renderFunc,0,le);
      });
      LES.presenter.on('disconnect',function(){
         isConnected = false;
         indicators.disconnect(true);
      });
      LES.presenter.on('welcome',function(){
         console.log('WELCOMED!');
         WE.render(container,false,{},scrollToLatest);
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
};
