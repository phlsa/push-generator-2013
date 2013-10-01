var canvas = document.getElementById( 'canv' );
var ctx = canv.getContext( '2d' );

var theText = "";

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
      p.curveVertex( step*index, h/2+getFrequency(letter,langIndex)/max*h/2*(1-(langIndex%2)*2) );
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
    }
    
    p.draw = function() {
      ctx.globalCompositeOperation = 'copy';
      p.background( 51 );
      ctx.globalCompositeOperation = 'lighter';
      buildGraph( theText, p );
    }
});