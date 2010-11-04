const  prequire = require('../../prequire.js');

const data = [
   '2010-10-12 08:41:30	INFO 	TransactionTimeoutOverride	()	Unable to find file: ..\\..\\fsc\\bin\\transactiontimeouts.properties',
   '2010-10-12 08:41:31	INFO 	Embedded	()	Catalina naming disabled',
   '2010-10-12 08:41:31	WARN 	Connector	()	Property debug not found on the protocol handler.',
   "2010-10-12 08:41:31	WARN 	Digester	()	  No rules found matching 'Server/Service/Engine/Host/Logger'.",
   "2010-10-12 08:41:31	INFO 	AprLifecycleListener	()	The Apache Tomcat Native library which allows optimal performance in production environments was not found on the java.library.path: ../lib",
   "2010-10-12 08:41:31	INFO 	Http11NioProtocol	()	Initializing Coyote HTTP/1.1 on http-0.0.0.0-80",
   "2010-10-12 08:41:31	INFO 	Http11NioProtocol	()	Initializing Coyote HTTP/1.1 on http-0.0.0.0-443",
   "2010-10-12 08:41:31	INFO 	AjpProtocol	()	Initializing Coyote AJP/1.3 on ajp-0.0.0.0-8009",
   "2010-10-12 08:41:31	INFO 	Catalina	()	Initialization processed in 422 ms",
   "2010-10-12 08:41:31	INFO 	StandardService	()	Starting service jboss.web",
   "2010-10-12 08:41:31	INFO 	StandardEngine	()	Starting Servlet Engine: JBossWeb/2.0.1.GA",
   "2010-10-12 08:41:39	ERROR	STDERR	()	SLF4J: Class path contains multiple SLF4J bindings.",
   "2010-10-12 08:41:39	ERROR	STDERR	()	SLF4J: Found binding in [jar:file:/D:/deploy/FSC-Destiny/jboss/server/destiny/deploy/destiny.ear/lib/slf4j-log4j12.jar!/org/slf4j/impl/StaticLoggerBinder.class]",
   "2010-10-12 08:41:39	ERROR	STDERR	()	SLF4J: Found binding in [jar:file:/D:/deploy/FSC-Destiny/jboss/server/destiny/deploy/destiny.ear/lib/slf4j-simple.jar!/org/slf4j/impl/StaticLoggerBinder.class]",
   "2010-10-12 08:41:39	ERROR	STDERR	()	SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation."
];

const fs = require('fs');
const file = process.argv[2];

if(file && typeof file === 'string'){
   var f = fs.createWriteStream(process.argv[2]);
   var curline = 0;
   var writealot = setInterval(function(){
      if(f && f.writable){
         f.write(data[curline]+'\n');
         curline = (++curline % data.length);
      }
   },250); 

   const handleDeath = function(){
      writealot && clearInterval(writealot);
      writealot = null;
      f && f.end();
      f = null;
   };
   ['exit','SIGKILL','SIGINT'].forEach(function(sig){
      process.on(sig,handleDeath);
   });
}
