$(document).ready(function() {
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    if (isMobile.any()) {}
    $('.dev-frame').on('load', function() {
        $('.iframe-loader').addClass('loaded-iframe');
        setTimeout(function() {
            $('.iframe-loader').addClass('loaded-iframe');
        }, 2500)
    });
    $('.dev-frame').on('unload', function() {
        $('.iframe-loader').removeClass('loaded-iframe');
    });
    // setTimeout(function() {
    //     $('.latest').addClass('latest-active');
    // }, 500);
});


var inputRange = document.getElementsByClassName('pullee')[0],
    maxValue = 150, // the higher the smoother when dragging
    speed = 12, // thanks to @pixelass for this
    currValue, rafID;

// listen for unlock
function unlockStartHandler() {
    // clear raf if trying again
    window.cancelAnimationFrame(rafID);

    // set to desired value
    currValue = +this.value;
}

function unlockEndHandler() {

    // store current value
    currValue = +this.value;

    // determine if we have reached success or not
    if(currValue >= maxValue) {
        successHandler();
    }
    else {
        rafID = window.requestAnimationFrame(animateHandler);
    }
}

// handle range animation
function animateHandler() {

    // update input range
    inputRange.value = currValue;

    // determine if we need to continue
    if(currValue > -1) {
    	window.requestAnimationFrame(animateHandler);
    }

    // decrement value
    currValue = currValue - speed;
}

// bind events
if(inputRange){
  inputRange.addEventListener('mousedown', unlockStartHandler, false);
  inputRange.addEventListener('mousestart', unlockStartHandler, false);
  inputRange.addEventListener('mouseup', unlockEndHandler, false);
  inputRange.addEventListener('touchend', unlockEndHandler, false);
}
