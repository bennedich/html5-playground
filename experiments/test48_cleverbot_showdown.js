/*
Cleverbot Showdown

Joakim Bennedich
2012-03-13

Go to http://cleverbot.com
Open the JavaScript console ( F12 | ctrl-shift-J | cmd-alt-J | etc )
Paste all the code into the console and press [Enter]
Make sure the popup window with the second cleverbot opens
    ( some browsers block them )
Make sure the console reports 'External window initalized'
    ( if not, try closing the popup window and reloading the page )
Align the windows
Press one of the 'Think' buttons or type something
Wait for it...
PROFIT!
*/

/*****************
** EventEmitter **
*****************/

var EventEmitter = ( function () {
	'use strict';
	var p = EventEmitter.prototype;
	
	function EventEmitter () {
	    this._lstnrs = {};
	}
	
	p.on = function ( e, lstnr ) {
	    if ( ! this._lstnrs.hasOwnProperty( e ) ) this._lstnrs[ e ] = [];
	    this._lstnrs[ e ].push( lstnr );
	};
	
	p.off = function ( e, lstnr ) {
	    var i = this._lstnrs[ e ].indexOf( lstnr );
	    i > -1 && this._lstnrs[ e ].splice( i, 1 );
	};
	
	p.emit = function ( e, arg ) {
	    var i = 0, lstnr, lstnrs = this._lstnrs[ e ];
	    if ( ! lstnrs ) return;
	    while ( lstnr = lstnrs[ i++ ] ) lstnr( arg );
	};
	
	return EventEmitter;
} )();


/************************
** Cleverbot UIWrapper **
************************/

var UIWrapper = ( function () {
    'use strict';
    var p = UIWrapper.prototype;
    
    function UIWrapper ( win ) {
        EventEmitter.call( this );
        
        this.window = win;
        this.document = win.document;
        this.inSelector = '#stimulus';
        this.outSelector = '#typArea';
        this.in = null;
        this.out = null;
        this.timerId = null;
        this.respArea = this.document.querySelector( '#respArea' );
        
        this.init = this.init.bind( this );
        this.listen = this.listen.bind( this );
        this._listen = this._listen.bind( this );
        this.read = this.read.bind( this );
        this._read = this._read.bind( this );
        
        this.init();
    }
    
    // inherit EventEmitter
    p = UIWrapper.prototype = Object.create(
        EventEmitter.prototype,
        { constructor : { value : UIWrapper } }
    );
    
    p.init = function () {
        var self = this;
        // wait for cleverbot to get ready then start listening for inital changes
        setTimeout( function () {
            self.respArea.addEventListener( 'DOMSubtreeModified', function onInit () {
                self.respArea.removeEventListener( 'DOMSubtreeModified', onInit );
                self.listen();
            } );
        }, 3e3 );
    };
    
    p.listen = function () {
        setTimeout( this._listen, 50 );
    };
    
    p._listen = function () {
        //console.log( '*' );
        this.respArea = this.document.querySelector( '#respArea' );
        this.respArea.addEventListener( 'DOMNodeRemoved', this.listen );
        this.out = this.document.querySelector( this.outSelector );
        this.out.addEventListener( 'DOMSubtreeModified', this.read );
    };
    
    p.read = function () {
        //console.log( '**', this.out.textContent );
        if ( this.out.textContent.length < 2 )
            return;
        clearTimeout( this.timerId );
        // wait until cleverbot finished writing
        this.timerId = setTimeout( this._read, 5e2 );
    };

    p._read = function () {
        //console.log( '***', this.out.textContent );
        this.emit( 'newData', this.out.textContent );
    };
    
    p.write = function ( data ) {
        this.in = this.document.querySelector( this.inSelector );
        this.in.value = data;
        this.window.lCBtn( 'Say' );
    };
    
    return UIWrapper;
} )();


/*********
** MAIN **
*********/

var Main = ( function () {
    'use strict';
    var p = Main.prototype;
    
    function Main () {
        this.initExtUIWrapper = this.initExtUIWrapper.bind( this );
        this.onNewDataFromExt = this.onNewDataFromExt.bind( this );
        this.onNewDataFromMain = this.onNewDataFromMain.bind( this );
        
        this.initExtWindow();
        this.ext.window.addEventListener( 'load', this.initExtUIWrapper );
        this.initMainUIWrapper();
    }
    
    p.initExtWindow = function () {
        var url  = '.',
            name = 'ext',
            opts = 'width=1024,height=720,top=0,left=0';
        this.ext = window.open( url, name, opts );
    };
    
    p.initExtUIWrapper = function () {
        this.extUIWrapper = new UIWrapper( this.ext.window );
        this.extUIWrapper.on( 'newData', this.onNewDataFromExt );
        console.log( 'External window initalized' );
    };
    
    p.initMainUIWrapper = function () {
        this.mainUIWrapper = new UIWrapper( window );
        this.mainUIWrapper.on( 'newData', this.onNewDataFromMain );
    };
    
    p.onNewDataFromExt = function ( data ) {
        //console.log( '[ext]:', data );
        this.mainUIWrapper.write( data );
    };
    
    p.onNewDataFromMain = function ( data ) {
        //console.log( '[main]:', data );
        this.extUIWrapper.write( data );
    };
    
    return Main;
} )();


var m = new Main;
