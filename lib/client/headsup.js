var socket = new io.Socket('127.0.0.1',{port:8080});
socket.connect();
socket.on('connect', console.log.bind(console,'connected'));
socket.on('disconnect', console.log.bind(console,'disconnected'));
socket.on('message', function(msg){ 
   console.log(msg); 
});

cell.configure({
 resourceBasePaths: {
    all:'/cells/'
 }
});

cell('App',function(App){
   App.render( 
      document.querySelector('body'),
      false,
      {}
   );
});

