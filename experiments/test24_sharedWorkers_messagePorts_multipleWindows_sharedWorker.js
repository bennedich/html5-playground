self.ports = [];


self.init = function ( port ) {
    self.ports.push( port );
    port.onmessage = self.manage;
    port.postMessage( 'I\'m alive!' );
};


self.manage = function ( e ) {
    var winId, i, port, ch;
    winId = ports.indexOf( e.target );
    for ( i=0 ; port=ports[ i ] ; i++ ) {
        ch = new MessageChannel();
        port.postMessage( 'window '+ winId +' says '+ e.data, [ch.port1] );
    }
        
};


self.onconnect = function ( e ) {
    self.init( e.ports[ 0 ] );
};
