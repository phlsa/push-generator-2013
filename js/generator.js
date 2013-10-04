var canvas = document.getElementById( 'canv' );
var ctx = canv.getContext( '2d' );

var state = {
  highlight: -1
}
var processing;

/***
 * Definition of one point
 **/
var Point = function( x, y, letter ) {
  var self = this;
  this.x = 1200;
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
    var offset = processing.noise( self.noiseSeed + (processing.frameCount)/300 ) * 6 - 3;
    self.x += (self.destX - self.x) / 5;
    self.y += (self.destY - self.y) / 8 + offset;
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
  this.layout = function( text, langIndex, w, h, max, step ) {
    var counter = 0;
    _.each( text, function( letter, index ) {
      if ( self.get( index ) === undefined ) {
        self.add( step*index, h/2+getFrequency(letter,langIndex)/max*h/2*(1-(langIndex%2)*2) );
      } else {
        self.get( index ).moveTo( step*index, h/2+getFrequency(letter,langIndex)/max*h/2*(1-(langIndex%2)*2) );
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
  layout: function( text, w, h ) {
    text = text.toLowerCase();
    var step = w / text.length;
    var max = maxPercentage( text );
    _.each( languageData.languageName, function( name, langIndex ) {
      AllPoints.sets[langIndex].layout( text, langIndex, w, h, max, step );
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



var drawPoints = function( p ) {
  var w = p.width,
      h = p.height;
  _.each( AllPoints.sets, function( set, index ) {
    p.fill( set.color.r, set.color.g, set.color.b, 50 );
    if ( index === state.highlight ) {
      p.strokeWeight( 4 );
      p.stroke( 118, 151, 152 );
    } else {
      p.strokeWeight( 1 );
      p.stroke( 118, 151, 152, 150 );
    }
    p.beginShape();
    p.vertex( 0, h/2 );
    p.vertex( 0, h/2 );
    _.each( set.allPoints, function( point ) {
      p.curveVertex( point.x, point.y )
    //  p.ellipse( point.x, point.y, 10, 10 );
    });
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

/***
 * Create Processing instance
 **/
var proc = new Processing( canvas, function( p ) {
    p.setup = function() {
      p.size( 1200, 600 );
      p.background( 250 );
      AllPoints.init();
      processing = p;
    }
    
    p.draw = function() {
      ctx.globalCompositeOperation = 'copy';
      p.background( 51 );
      ctx.globalCompositeOperation = 'lighter';
      AllPoints.move();
      drawPoints( p );
    }
});

AllPoints.layout( "", 1200, 600 );

$(document).ready( function() {
  $('#textbox').on( 'keyup', function( e ) {
      var val = $(e.currentTarget).val();
      AllPoints.layout( val, 1200, 600 );
  });

  _.each( languageData.languageName, function( item, index ) {
    var elem = $('<li data-index="'+index+'">'+item+'</li>');
    elem.on( 'mouseenter', function( e ) {
      state.highlight = parseInt( $(e.currentTarget).attr('data-index') );
    }).on( 'mouseleave', function( e ) {
      state.highlight = -1;
    });
    $('#language-list').append( elem );
  });
});