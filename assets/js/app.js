function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

// Tile size
// Used for movement and bounds
var Tile = {
    offsetTop: 30,
    offsetBottom: 105,
    width: 101,
    height: 83,
};

// Map bounds
// Used for bounding the player and destroying objects
// that leave the map.
var MapBounds = {
    left: 0,
    top: 0 + Tile.offsetTop, // the top edge of the water
    right: Tile.width * 5,
    bottom: Tile.height * 5 + Tile.offsetBottom, // where the grass changes color
};

// Keyboard inputs
var Keyboard = {
    keyCode: {
        left: 37,
        up: 38,
        right: 39,
        down: 40
    },
    keyState: {
        pressed: 0,
        released: null
    },
    // Stores the state of the keys
    keyStates: {},
    isPressedKey: function(keyCode) {
        if (keyCode == null)
            return false;
        return this.keyStates[keyCode] != this.keyState.released;
    },
    pressKey: function(keyCode) {
        this.keyStates[keyCode] = this.keyState.pressed;
    },
    releaseKey: function(keyCode) {
        this.keyStates[keyCode] = this.keyState.released;
    }
};

// Sprite contains the image page, position, 
// and bounding box.
var Sprite = function(imagePath) {
    assert(typeof imagePath === "string");

    this.path = imagePath;
    this.x = 0;
    this.y = 0;
}

Sprite.prototype.getRight = function() {
    return this.x + Tile.width;
}

Sprite.prototype.getLeft = function() {
    return this.x;
}

Sprite.prototype.getTop = function() {
    return this.y + Tile.offsetTop;
}

Sprite.prototype.getBottom = function() {
    return this.y + Tile.height + Tile.offsetTop;
}

// Enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = new Sprite('assets/images/enemy-bug.png');
    this.spawned = false;
};

// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.spawned)
    {
        this.sprite.x += this.speed * dt;
        if (this.sprite.getLeft() > MapBounds.right) {
            this.spawned = false;
        }
    }
};

Enemy.prototype.render = function() {
    if (this.spawned)
    {
        var sprite = this.sprite;
        ctx.drawImage(Resources.get(sprite.path), sprite.x, sprite.y);
        // ctx.strokeRect(sprite.getLeft(), sprite.getTop() + Tile.offsetTop, Tile.width, Tile.height);
    }
};

// Player that is controlled
var Player = function() {
    this.sprite = new Sprite('assets/images/char-cat-girl.png');
    this.dx = this.dy = 0;
};

Player.prototype.update = function(dt) {
    this.sprite.x += this.dx;
    this.sprite.y += this.dy;

    if (this.sprite.getTop() < 0 || 
        this.sprite.getRight() > MapBounds.right ||
        this.sprite.getBottom() > MapBounds.bottom ||
        this.sprite.getLeft() < 0) 
    {
        this.sprite.x -= this.dx;
        this.sprite.y -= this.dy;
    }

    this.dx = this.dy = 0
};

Player.prototype.render = function() {
    var sprite = this.sprite;
    ctx.drawImage(Resources.get(sprite.path), sprite.x, sprite.y);
    // ctx.strokeRect(sprite.getLeft(), sprite.getTop() + Tile.offsetTop, Tile.width, Tile.height);
};

Player.prototype.handleInput = function(key) {
    switch (key) {
        case Keyboard.keyCode.up:
            this.dy = -Tile.height;
        break;
        case Keyboard.keyCode.right:
            this.dx = Tile.width;
        break;

        case Keyboard.keyCode.down:
            this.dy = Tile.height;
        break;
        case Keyboard.keyCode.left:
            this.dx = -Tile.width;
        break;
        default:
    }
};

// Start app here.
var App = {
    maxEnemies: 5,
    timeUntilNextSpawn: 0,
    allEnemies: [],
    player: new Player(),
    init: function() {
        // Input listeners 'keydown', 'keyup'
        // 'keydown' doesn't continuously call handleInput unless
        // it has been released. 
        document.addEventListener('keydown', function(e) {
            if (!Keyboard.isPressedKey(e.keyCode))
            {
                Keyboard.pressKey(e.keyCode);
                App.player.handleInput(e.keyCode);
            }
        });

        document.addEventListener('keyup', function(e) {
            Keyboard.releaseKey(e.keyCode);
        });

        // Using the method of reusing objects by 
        // initializing an array of enemies, 
        // and using a state variable to indicate 
        // whether it should be updated.
        var i = this.maxEnemies;
        while (i-->0)
        {
            var enemy = new Enemy();
            this.allEnemies.push(enemy);
        }

        // Spawn player at the start.
        this.respawnPlayer();
    },
    update: function(dt) {
        this.timeUntilNextSpawn -= dt * 1000;
        if (this.timeUntilNextSpawn < 0)
        {
            this.timeUntilNextSpawn = Math.floor(Math.random() * (3000 - 500) + 500);
            this.spawnEnemyIfAvailable();
        }
    },
    spawnEnemyIfAvailable: function() {
        for (var i in this.allEnemies)
        {
            var enemy = this.allEnemies[i];
            if (!enemy.spawned)
            {
                enemy.sprite.x = -Tile.width;
                // offset by 10 because not centered onto tile
                enemy.sprite.y = 
                    Math.floor((Math.random() * 3) + 1) * Tile.height - 10; 
                enemy.speed = (Math.random() * (303 - 101)) + 101;
                enemy.spawned = true;
                break;
            }
        }
    },
    respawnPlayer: function() {
        this.player.sprite.x = Tile.width * 2;
        this.player.sprite.y = Tile.height * 5 - 10;
    },
};

App.init();
