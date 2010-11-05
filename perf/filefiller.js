const prequire = require('../prequire.js');

const fs = require('fs'),
      infile = process.argv[2],
      outfile = process.argv[3],
      freq = process.argv[4] || 1000;

if([infile,outfile].every(function(file){return file && typeof file === 'string'})){
   var writeString = fs.readFileSync(infile),
       f = fs.createWriteStream(outfile);
   var writealot = setInterval(function(){
      if(f && f.writable){
         f.write(writeString);
      }
   },freq); 

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
