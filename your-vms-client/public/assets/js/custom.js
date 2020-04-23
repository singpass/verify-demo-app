


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
