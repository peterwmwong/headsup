const assertClientInfo = function(a,act,e){
   if(e !== null){
      a.ok(act !== null);
      a.equal(act.ip,e.ip);
      a.equal(act.id,e.id);

      a.equal(act.siteid,e.siteid);
      a.equal(act.userid,e.userid);
   }else{
      a.ok(act === null);
   }
};

const assertLogEntry = function(a,act,e){
   a.equal(act.server,e.server);

   const d = act.date
   a.ok(d instanceof Date);
   a.equal(d.getFullYear(),e.fullYear);
   a.equal(d.getMonth(),e.month);
   a.equal(d.getDate(),e.date);
   a.equal(d.getHours(),e.hours);
   a.equal(d.getMinutes(),e.minutes);
   a.equal(d.getSeconds(),e.seconds);

   a.equal(act.category,e.category);
   a.equal(act.codeSource,e.codeSource);
   a.equal(act.msg,e.msg);
   
   assertClientInfo(a,act.clientInfo,e.clientInfo);
};

module.exports = {
   assertLogEntry: assertLogEntry,
   assertClientInfo: assertClientInfo
};
