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

