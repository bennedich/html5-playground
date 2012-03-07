self.port = null;


self.init = function ( e ) {
    self.onmessage = self.manage;
    var msg = 'I\'m alive!';
    if ( e.ports )
        msg += '(You sent me '+ e.ports.length +' ports)';
    self.postMessage( msg );
};


self.manage = function ( e ) {
    var msg = 'You said '+ e.data;
    
    // passes a message port first time
    if ( ! self.port && self.MessageChannel ) {
        var ch = new MessageChannel();
        self.port = ch.port1;
        self.port.onmessage = self.portManage;
        self.postMessage( msg + ' (have a port)', [ ch.port2 ] );
    }
    
    else
        self.postMessage( msg );
    
};


self.portManage = function ( e ) {
    self.port.postMessage( 'You SAY '+ e.data );
};


self.onmessage = self.init;
