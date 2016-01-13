// Keyboard inputs
var Keyboard = {
    keyCode: {
        left: 37,
        up: 38,
        right: 39,
        down: 40
    },
    pressedKeys: {},
    isPressedKey: function(keyCode) {
        if (keyCode == null)
            return false;
        return this.pressedKeys[keyCode] != null;
    },
    pressKey: function(keyCode) {
        this.pressedKeys[keyCode] = 0;
    },
    releaseKey: function(keyCode) {
        this.pressedKeys[keyCode] = null;
    }
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'assets/images/enemy-bug.png';
    this.spawned = false;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'assets/images/char-cat-girl.png';
    this.x = 0;
    this.y = 404;
};

Player.prototype.update = function(dt) {

};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
    switch (key) {
        case Keyboard.keyCode.up:
            this.y -= 83;
        break;
        case Keyboard.keyCode.right:
            this.x += 101;
        break;

        case Keyboard.keyCode.down:
            this.y += 83;
        break;
        case Keyboard.keyCode.left:
            this.x -= 101;
        break;
        default:
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    if (!Keyboard.isPressedKey(e.keyCode))
    {
        Keyboard.pressKey(e.keyCode);
        player.handleInput(e.keyCode);
    }
});

document.addEventListener('keyup', function(e) {
    Keyboard.releaseKey(e.keyCode);
});

var SpawnEnemy = function() {
    var enemy = new Enemy();
    enemy.x = -101;
    enemy.y = [101, 202, 303, 404][Math.floor(Math.random() * 3)];
    enemy.speed = (Math.random() * (10 - 5)) + 5;
};

