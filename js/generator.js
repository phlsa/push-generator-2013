var canvas = document.getElementById( 'canv' );
var ctx = canv.getContext( '2d' );

var state = {
  highlight: -1,
}
var processing;

/***
 * Definition of one point
 **/
var Point = function( x, y, letter ) {
  var self = this;
  this.x = processing.width+100;
  this.y = 300;
  this.destX = x;
  this.destY = y;
  this.letter = letter;
  this.noiseSeed = Math.random()*10;
  this.moveTo = function( x, y ) {
    self.destX = x;
    self.destY = y;
  }
  this.move = function() {
    var offsetX = processing.noise( self.noiseSeed + (processing.frameCount)/300 ) * 16 - 8;
    var offsetY = processing.noise( self.noiseSeed*2 + (processing.frameCount)/100 ) * 6 - 3;
    offsetY*=.5;
    self.x += (self.destX - self.x) / 5 + offsetX;
    self.y += (self.destY - self.y) / 8 + offsetY;
  }
}


/***
 * Represent one language of the point graph
 **/
var PointSet = function( color ) {
  this.color = color;
  this.allPoints = [];
  var self = this;
  this.empty = function() {
    self.allPoints = [];
  };
  this.get = function( index ) {
    return self.allPoints[index];
  };
  this.add = function( arg1, arg2 ) {
    if ( arg2 === undefined ) {
      self.allPoints.push( arg1 );
    } else {
      self.allPoints.push( new Point( arg1, arg2 ) );
    }
  };
  this.layout = function( text, langIndex, w, h, max, step, sketchHeight ) {
    var counter = 0;
    step = step*0.8;
    var offset = w*0.1;
    _.each( text, function( letter, index ) {
      if ( self.get( index ) === undefined ) {
        self.add( offset+step*index, sketchHeight/2+getFrequency(letter,langIndex)/max*h/2*(1-(langIndex%2)*2) );
      } else {
        self.get( index ).moveTo( offset+step*index, sketchHeight/2+getFrequency(letter,langIndex)/max*h/2*(1-(langIndex%2)*2) );
      }
      counter++;
    });
    if ( counter < self.allPoints.length ) {
      self.allPoints.splice( counter, self.allPoints.length );
    }
  };
}

/***
 * Represent ALL points of the graph
 **/
var AllPoints = {
  sets: [],
  layout: function( text, w, h, sketchHeight ) {
    text = text.toLowerCase();
    var step = w / text.length;
    var max = maxPercentage( text );
    _.each( languageData.languageName, function( name, langIndex ) {
      AllPoints.sets[langIndex].layout( text, langIndex, w, h, max, step, sketchHeight );
    });
  },
  move: function() {
    _.each( AllPoints.sets, function( set ) {
      _.invoke( set.allPoints, 'move' );
    });
  },
  init: function() {
    _.each( languageData.languageName, function( item, index ) {
      var col = { r:194, g:0, b:83 };
      AllPoints.sets.push( new PointSet( col ) );
    });
  }
};



var drawPoints = function( p, black ) {
  var w = p.width,
      h = p.height;
  _.each( AllPoints.sets, function( set, index ) {
    if ( black ) {
      p.fill( 50 );
      p.stroke( 50 );
      p.strokeWeight( 1 );
    } else {
      p.fill( set.color.r, set.color.g, set.color.b, 50 );
      if ( index === state.highlight ) {
        p.strokeWeight( 4 );
        p.stroke( 118, 151, 152 );
      } else {
        p.strokeWeight( 1 );
        p.stroke( 118, 151, 152, 150 );
      }
    }
    p.beginShape();
    p.vertex( 0, h/2 );
    p.vertex( 0, h/2 );
    _.each( set.allPoints, function( point ) {
      p.curveVertex( point.x, point.y )
    //  p.ellipse( point.x, point.y, 10, 10 );
    });
    p.vertex( w, h/2 );
    p.vertex( w, h/2 );
    p.vertex( 0, h/2 );
    p.endShape();
  });
}

/***
 * Extract the frequency of a single letter
 **/
var getFrequency = function( letter, language ) {
  if ( languageData[letter] === undefined ) {
    return 0;
  }

  if ( language === undefined ) {
    return languageData[letter];
  } else {
    return languageData[letter][language];
  }
}

/***
 * Calculate maximum letter frequency of any letter within @text
 **/
var maxPercentage = function( text, language ) {
  if ( language === undefined ) {
    // when no language is defined, return the maximum of any letter in the text in any language
    return _.max( _.flatten( _.map( text, function( letter ) {
        if ( languageData[letter] === undefined ) {
          return 0;
        }
        return languageData[letter];
    })));
  } else {
    // if a language is defined, look directly into that language
    return _.max( _.map( text, function( letter ) {
      if ( languageData[letter] === undefined ) {
        return 0;
      }
      return languageData[letter][language];
    }));
  }
}


var updateLocationBar = function( text ) {
    text = text.split( ' ' ).join( '_' );
    url = location.protocol + '//' + location.host + location.pathname + '?push=' + encodeURIComponent( text );
    rawUrl = location.protocol + '//' + location.host + location.pathname + '?push=' + text;
    window.history.replaceState( null, "push.generator: " + text, url );
    $( 'a.fb-share' ).attr( 'href', 'https://www.facebook.com/sharer/sharer.php?u=' + url );
    $( 'a.tw-share' ).attr( 'href', 'https://twitter.com/share?text=I created something with the push.generator!' );
}
var getURLVars = function() {
  var vars = {}
  var parts = window.location.href.replace( /[?&]+([^=&]+)=([^&]*)/gi, function( m,key,value ) {
      vars[key] = value
  });
  return vars
}
var insertURLVars = function() {
  if ( window.getURLVars()['push'] && window.getURLVars()['push'] != '' ) {
    setTimeout( function() {
    var text = decodeURIComponent( window.getURLVars()['push'] );
    text = text.split( '_' ).join( ' ' );
      $( '#generator-input' ).val( text ).trigger( 'keyup' );
    }, 0 );
  }
}


var generateStaticImage = function() {
  img = $( Canvas2Image.saveAsPNG( canv, true, processing.width, processing.height ));
  $( '.image-container' ).append( img );
}


$(document).ready( function() {
  /***
   * Create Processing instance
   **/
  var proc = new Processing( canvas, function( p ) {
    p.setup = function() {
      var w = $('.generator-main').width();
      var h = $('.generator-main').height();
      p.size( w, h );
      AllPoints.init();
      processing = p;
      AllPoints.layout( $('#generator-input').val(), w, h*0.8, h );
      insertURLVars();
    }
    
    p.draw = function() {
      ctx.clearRect( 0, 0, p.width, p.height );
      ctx.globalCompositeOperation = 'source-over';
      AllPoints.move();
      drawPoints( p, true );
      ctx.globalCompositeOperation = 'lighter';
      drawPoints( p );
    }
  });

  /***
   * Bind handlers
   **/
  $('#generator-input').on( 'keyup', function( e ) {
      var val = $(e.currentTarget).val();
      AllPoints.layout( val, processing.width, processing.height*0.8, processing.height );
      updateLocationBar( val );
  }).focus();

  $('#save-image').on( 'click', function( e ) {
    e.preventDefault();
    generateStaticImage();
  });

  _.each( languageData.languageName, function( item, index ) {
    var elem = $('<li data-index="'+index+'"><span>'+item+'</span></li>');
    elem.on( 'mouseenter', function( e ) {
      state.highlight = parseInt( $(e.currentTarget).attr('data-index') );
    }).on( 'mouseleave', function( e ) {
      state.highlight = -1;
    });
    $('#language-list').append( elem );
  });
});