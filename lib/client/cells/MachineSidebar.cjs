var testMsgs = [1,2,3,4,5].map(function(v){return 'server msg '+v;});

var d = new Date(Date.now());

var Incident = function(text){
   return {
      msg: text,
      date: d.getMonth()+' / '+d.getDate()
   };
};

var Machine = function(name, incMsgs){
   return {
      name: name,
      incidents: incMsgs.map(Incident)
   }
};

delegate('getRenderData',function(d,r){
   r({
      machines: [
         Machine('dev-01vm',testMsgs),
         Machine('destiny-01',testMsgs)
      ]
   });
});
