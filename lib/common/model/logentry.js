var ClientInfo = function(ip,id,siteid,userid){
   if(!(this instanceof ClientInfo)){
      return new ClientInfo(ip,id,siteid,userid);
   }

   this.ip = ip;
   this.id = id;
   this.siteid = siteid;
   this.userid = userid;

   Object.freeze(this);
};

ClientInfo.parse = (function(ciregex,line){
   var p = ciregex.exec(line.toString().trim());
   return (p != null) ? new ClientInfo(p[1],p[3],p[5],p[7]) : null;
}).bind(null,/([^ ]*) (ID:(\d*)( siteID:(\d*)( userID:(\d*))?)?)/);

var LogEntry = function(d,category,codeSource,clientInfo,msg){
   if(!(this instanceof LogEntry)){
      return new LogEntry(d,category,codeSource,clientInfo,msg);
   }

   this.date = d;
   this.category = category;
   this.codeSource = codeSource;
   this.clientInfo = clientInfo;
   this.msg = msg;

   Object.freeze(this);
}
LogEntry.parse = (function(leregex,lines,ctx){
   ctx = ctx || {
      date: null,
      category: null,
      codeSource: null,
      clientInfo: null
   };

   return lines.split('\n').reduce(function(result,line){
      if( (line = line.trim()).length > 0 ){
         const p = leregex.exec(line);
         result.push(
            (p != null)
               ? (ctx = new LogEntry(
                     new Date( p[1], p[2], p[3], p[4], p[5], p[6], 0), 
                     p[7], p[8], ClientInfo.parse(p[9]), p[10]))
               : new LogEntry(ctx.date,ctx.category,ctx.codeSource,ctx.clientInfo,line)
         );
      }
      return result;
   },[]);   
}).bind(null,/^(\d\d\d\d)-(\d\d)-(\d\d)\s+(\d\d):(\d\d):(\d\d)\s+(\w*)\s+(\w*)\s+[(]([^)]*)[)]\s*(.*)\s*/);

module.exports = {
   LogEntry: LogEntry,
   ClientInfo: ClientInfo
};
