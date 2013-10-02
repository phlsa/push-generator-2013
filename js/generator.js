var canvas = document.getElementById( 'canv' );
var ctx = canv.getContext( '2d' );

var theText = "";

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
  this.moveTo = function( x, y ) {
    self.destX = x;
    self.destY = y;
  }
  this.move = function() {
    self.x += (self.destX - self.x) / 5;
    self.y += (self.destY - self.y) / 8;
  }
}


/***
 * Represent one language of the point graph
 **/
var PointSet = function() {
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
      self.allPoints.splice( counter-1, self.allPoints.length );
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
      AllPoints.sets.push( new PointSet() );
    });
  }
};


/***
 * Draw a graph of all points (once)
 **/
var buildGraph = function( text, p ) {
  text = text.toLowerCase();
  var w = p.width,
      h = p.height;
  var step = w / text.length;
  var max = maxPercentage( text );
  
  // draw the graph
  _.each( languageData.languageName, function( name, langIndex ) {
    p.fill( 194, 0, 83, 50 );
    p.stroke( 255, 25 );
    p.beginShape();
    p.vertex( 0, h/2 );
    p.vertex( 0, h/2 );
    _.each( text, function( letter, index ) {
      //p.ellipse( step*index, h-getFrequency(letter,langIndex)/max*h/2, 10, 10 );
      p.vertex( step*index, h/2+getFrequency(letter,langIndex)/max*h/2*(1-(langIndex%2)*2) );
    });
    p.vertex( w, h/2 );
    p.vertex( 0, h/2 );
    p.endShape();
  });
}

var drawPoints = function( p ) {
  var w = p.width,
      h = p.height;
  _.each( AllPoints.sets, function( set ) {
    p.fill( 194, 0, 83, 50 );
    p.stroke( 255, 25 );
    p.beginShape();
    p.vertex( 0, h/2 );
    p.vertex( 0, h/2 );
    _.each( set.allPoints, function( point ) {
      p.vertex( point.x, point.y )
      p.ellipse( point.x, point.y, 10, 10 );
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
    }
    
    p.draw = function() {
      ctx.globalCompositeOperation = 'copy';
      p.background( 51 );
      ctx.globalCompositeOperation = 'lighter';
      //buildGraph( theText, p );
      AllPoints.move();
      drawPoints( p );
    }
});

AllPoints.layout( theText, 1200, 600 );

$(document).ready( function() {
  $('#textbox').on( 'keyup', function( e ) {
    console.log( "changed" );
    var val = $(e.currentTarget).val();
    AllPoints.layout( val, 1200, 600 );
  });
});