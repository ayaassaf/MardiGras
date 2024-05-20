// ===================== Winter 2021 EECS 493 Assignment 2 =====================
// This starter code provides a structure and helper functions for implementing
// the game functionality. It is a suggestion meant to help you, and you are not
// required to use all parts of it. You can (and should) add additional functions
// as needed or change existing functions.

// ==============================================
// ============ Page Scoped Globals Here ========
// ==============================================

// Counters
let throwingItemIdx = 1;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;


// ==============================================
// ============ Functional Code Here ============
// ==============================================

// Main
$(document).ready(function () {
  console.log("Ready!");

  $('#settings').hide();
  $('#actualGame').hide();
  setTimeout(startgame, 3000);
});

// TODO: Event handlers for the settings panel

// TODO: Add a splash screen and delay starting the game

// Set global handles (now that the page is loaded)
// Allows us to quickly access parts of the DOM tree later
function startgame() {
  $('#actualGame').show();
  $('#splash').fadeTo(0, 0, function () {
    $(this).remove();
  });

  gwhGame = $('#actualGame');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  player = $('#player');  // set the global player handle
  paradeRoute = $("#paradeRoute");
  paradeFloat1 = $("#paradeFloat1");
  paradeFloat2 = $("#paradeFloat2");

  // Set global positions for thrown items
  maxItemPosX = $('.game-window').width() - 50;
  maxItemPosY = $('.game-window').height() - 40;

  // Set global positions for the player
  maxPersonPosX = $('.game-window').width() - player.width();
  maxPersonPosY = $('.game-window').height() - player.height();

  // Keypress event handler
  $(window).keydown(keydownRouter);

  // Periodically check for collisions with thrown items (instead of checking every position-update)
  setInterval(function () {
    checkCollisions();
  }, 100);

  // Move the parade floats
  startParade();

  // Throw items onto the route at the specified frequency
  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);

}

// Key down event handler
// Check which key is pressed and call the associated function
function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

// Handle player movement events
// TODO: Stop the player from moving into the parade float. Only update if
// there won't be a collision


function movePerson(arrow) {

  switch (arrow) {
    case KEYS.left: { // left arrow
      if (!willCollide(player, paradeFloat2, -PERSON_SPEED, 0)) {

        let newPos = parseInt(player.css('left')) - PERSON_SPEED;
        if (newPos < 0) {
          newPos = 0;
        }
        player.css('left', newPos);
      }
      break;
    }
    case KEYS.right: { // right arrow
      if (!willCollide(player, paradeFloat1, PERSON_SPEED, 0)) {
        let newPos = parseInt(player.css('left')) + PERSON_SPEED;
        if (newPos > maxPersonPosX) {
          newPos = maxPersonPosX;
        }
        player.css('left', newPos);
      }
      break;
    }
    case KEYS.up: { // up arrow
      if (!willCollide(player, paradeFloat1, 0, -PERSON_SPEED) && !willCollide(player, paradeFloat2, 0, -PERSON_SPEED)) {
        let newPos = parseInt(player.css('top')) - PERSON_SPEED;
        if (newPos < 0) {
          newPos = 0;
        }
        player.css('top', newPos);
      }
      break;
    }
    case KEYS.down: { // down arrow
      if (!willCollide(player, paradeFloat1, 0, PERSON_SPEED) && !willCollide(player, paradeFloat2, 0, PERSON_SPEED)) {
        let newPos = parseInt(player.css('top')) + PERSON_SPEED;
        if (newPos > maxPersonPosY) {
          newPos = maxPersonPosY;
        }
        player.css('top', newPos);
      }
      break;
    }
  }
}
// Check for any collisions with thrown items
// If needed, score and remove the appropriate item
let Beads = 0;
let Candy = 0;
function checkCollisions() {
  $('.throwingItem').each(function () {
    if (isColliding($(this), player)) {
      console.log("Item Collecting");
      $(this).css("backgroundColor", "yellow");
      $(this).css("border-radius", "25px");
      // document.getElementById($(this).attr('id')).classList.add('yellowcircle');
      $(this).fadeTo(1000, 0, function () {
        $(this).remove();
        gwhScore.html(parseInt(gwhScore.html()) + SCORE_UNIT);
        if ($(this).attr('class').includes('candy')) {
          Candy++;
        }
        else {
          Beads++;
        }
        $('#candyCounter').html(parseInt(Candy));
        $('#beadsCounter').html(parseInt(Beads));
      });
    }
  });

}

// Move the parade floats (Unless they are about to collide with the player)
function startParade() {
  console.log("Starting parade...");
  paradeTimer = setInterval(function () {

    let pos1 = parseInt(paradeFloat1.css('left')) + FLOAT_SPEED;
    let pos2 = parseInt(paradeFloat2.css('left')) + FLOAT_SPEED;

    if (!willCollide(paradeFloat2, player, FLOAT_SPEED, 0)) {
      parseInt(paradeFloat1.css('left')) + FLOAT_SPEED;
      parseInt(paradeFloat2.css('left')) + FLOAT_SPEED;
    }
    if (parseInt(paradeFloat1.css('left')) > 500 && parseInt(paradeFloat2.css('left')) > 500) {
      pos1 = -300;
      pos2 = -150;

    }

    paradeFloat1.css('left', pos1);
    paradeFloat2.css('left', pos2);

  }, OBJECT_REFRESH_RATE);
}

// Get random position to throw object to, create the item, begin throwing
function createThrowingItem() {
if(parseInt(paradeFloat2.css("left")) < 480) {

  let type = throwingItemIdx % 3 == 0 ? 'beads' : 'candy';
  gwhGame.append(createItemDivString(throwingItemIdx, type, type + '.png'));
  var throwItem = $('#i-' + throwingItemIdx);
  throwingItemIdx++;
  throwItem.css ("top", "230px");
  throwItem.css("left", parseInt(paradeFloat2.css("left")) + 30 + "px");
  let x = getRandomNumber(1 - parseInt(paradeFloat2.css("left")), maxItemPosX - parseInt(paradeFloat2.css("left")));
  let completeX = x/30;
  
  let y = getRandomNumber(-230, maxItemPosY - 230);
  let completeY = y/30;
  updateThrownItemPosition(throwItem, completeX, completeY, 30);
}

}

// Helper function for creating items
// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString) {
  return "<div id='i-" + itemIndex + "' class='throwingItem " + type + "'><img src='img/" + imageString + "'/></div>";
}

// Throw the item. Meant to be run recursively using setTimeout, decreasing the 
// number of iterationsLeft each time. You can also use your own implementation.
// If the item is at it's final postion, start removing it.
function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft) {
  let xPos = parseInt(elementObj.css('left')) + xChange;
  let yPos = parseInt(elementObj.css('top')) + yChange;
  elementObj.css('left', xPos + 'px');
  elementObj.css('top', yPos + 'px');
  if (parseInt(iterationsLeft) == 0) {
    setTimeout(function () {
      graduallyFadeAndRemoveElement(elementObj);
    }, 5000);
    return;
  }
  setTimeout(function () {
    updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft - 1);
  }, 30);



}


function graduallyFadeAndRemoveElement(elementObj) {
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function () {
    $(this).remove();
  });
}

function openSettings() {
  $('#openSettingButton').hide();
  $('#settings').show();
}

function saveSettings() {
  let freq = document.getElementById("frequency");
  if (parseFloat(freq.value) < 100) {
    alert("Frequency must be a number greater than or equal to 100");
  }
    currentThrowingFrequency = parseFloat(freq.value);
    $('#openSettingButton').show();
    $('#settings').hide();
  clearTimeout(createThrowingItemIntervalHandle);
  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
}

function discardSettings() {
  let freq = document.getElementById("frequency");
  freq.value = currentThrowingFrequency;
  $('#openSettingButton').show();
  $('#settings').hide();
}

// ==============================================
// =========== Utility Functions Here ===========
// ==============================================

// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}