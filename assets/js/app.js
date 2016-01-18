
/* Helper functions */

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

function strokeRect(rect) {
    assert(rect instanceof Rect);

    ctx.strokeRect(rect.topLeft.x, rect.topLeft.y, rect.size.x, rect.size.y);
}

/* Some useful classes for 2D space */

/**
 * @typedef {object} Vector
 *
 * @property {number} x
 * @property {number} y
 */

/**
 * A 2D number vector.
 *
 * @constructor
 * @param {number} x
 * @param {number} y
 */
var Vector = function(x, y) {
    if (typeof x === "undefined" && typeof y === "undefined") {
        this.x = 0;
        this.y = 0;
    } else {
        assert(typeof x === "number" && typeof y === "number")
        this.x = x;
        this.y = y;
    }
}

/**
 * Add this vector with another vector.
 *
 * @param {Vector} other - The other vector.
 *
 * @returns {Vector} The sum of the two vectors.
 */
Vector.prototype.add = function(other) {
    assert(other instanceof Vector);

    return new Vector(this.x + other.x, this.y + other.y);
}

/**
 * Check whether this position vector is inside of a
 * rectangle.
 *
 * @param {Rect} rect - The rectangle to check.
 * @param {boolean} includeSides - Include the sides of the rectangle. Default is true.
 *
 * returns {boolean}
 */
Vector.prototype.isIn = function(rect, includeSides) {
    assert(rect instanceof Rect);

    var inclusive = true;
    if (typeof includeSides !== "undefined") {
        assert(typeof includeSides === "boolean", "includeSides must be of type boolean");
        inclusive = includeSides;
    }

    var bottomRight = rect.getBottomRight();
    if (inclusive == true) {
        if (this.x >= rect.topLeft.x && this.x <= bottomRight.x &&
            this.y >= rect.topLeft.y && this.y <= bottomRight.y) {
            return true;
        }
    }
    else if (inclusive == false){
        if (this.x > rect.topLeft.x && this.x < bottomRight.x &&
            this.y > rect.topLeft.y && this.y < bottomRight.y) {
            return true;
        }
    }

    return false;
}

/**
 * Override toString.
 * @returns {string}
 */
Vector.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
}

/**
 * @typedef {object} Rect
 *
 * @property {Vector} topLeft
 * @property {Vector} size
 */

/* A rectangle containing the top left position and 
 * the size. 
 * @constructor
 * @param {Vector} topLeft - The top left point of the rectangle.
 * @param {Vector} size
 */
var Rect = function(topLeft, size) {
    assert(topLeft instanceof Vector && size instanceof Vector,
        "topLeft and size must be of type Vector.");

    assert(size.x > 0 && size.y > 0, "size must be positive.");
    this.topLeft = topLeft;
    this.size = size;
}

/**
 * Set the location of the rectangle.
 *
 * @param {number} x
 * @param {number} y
 */
Rect.prototype.setLocation = function(x, y) {
    assert(typeof x === "number" && typeof y === "number");

    this.topLeft = new Vector(x, y);
}

/**
 * Get the bottom right point of the rectangle.
 *
 * @returns {Vector} The bottom right point.
 */
Rect.prototype.getBottomRight = function() {
    return new Vector(this.topLeft.x + this.size.x, this.topLeft.y + this.size.y);
}

/**
 * Check whether this rectangle is colliding
 * with this rectangle. 
 *
 * @param {Rect} other - The other rectangle.
 * @param {boolean} includeSides - Include the sides of the rectangle. Default is true.
 *
 * @returns {boolean}
 */
Rect.prototype.isColliding = function(other, includeSides) {
    assert(other instanceof Rect, "other must be of type Rect.");

    var inclusive = true;
    if (typeof includeSides !== "undefined") {
        assert(typeof includeSides === "boolean", "includeSides must be of type boolean");
        inclusive = includeSides;
    }

    var bottomRight = this.getBottomRight();
    var bottomLeft = new Vector(this.topLeft.x, bottomRight.y);
    var topRight = new Vector(bottomRight.x, this.topLeft.y);

    for (var x = this.topLeft.x; x < bottomRight.x; x += other.size.x) {
        for (var y = this.topLeft.y; y < bottomRight.y; y += other.size.y) {
            var point = new Vector(x, y);
            if (point.isIn(other, inclusive)) {
                return true;
            }
        }
    }

    var corners = [this.topLeft, bottomRight, bottomLeft, topRight];
    for (var i in corners) {
        var corner = corners[i];

        if (corner.isIn(other, inclusive)) {
            return true;
        }
    }

    return false;
}

/* Constants */

/**
 * Tile size constants
 * Used for movement and bounds
 *
 * @namespace TileSize
 */
var TileSize = {
    /** @type {number} */
    width: 101,

    /** @type {number} */
    height: 83,
};

/**
 * Character sprite constants
 *
 * @namespace CharacterSprite
 */
var CharacterSprite = {
    /** @type {Vector} */
    size: new Vector(100, 76),

    /** @type {Vector} */
    renderOffset: new Vector(0, 64),

    /** @type {Vector} */
    boundingBoxOffset: new Vector(0, 137)
}

/** 
 * Map bounds
 * Used for bounding the player and destroying objects
 * that leave the map.
 *
 * @namespace MapBounds
 */
var MapBounds = {
    /** @type {Vector} */
    rect: new Rect(
            CharacterSprite.boundingBoxOffset.add(new Vector(0, -TileSize.height)), 
            new Vector(TileSize.width * 5, TileSize.height * 6)
        ),

    /** @type {Vector} */
    water: new Rect(
            CharacterSprite.boundingBoxOffset.add(new Vector(0, -TileSize.height)),
            new Vector(TileSize.width * 5, TileSize.height * 1)
        )
}

/**
 * Keyboard inputs and events
 *
 * @namespace Keyboard
 */
var Keyboard = {
    /** key codes used */
    keyCode: {
        left: 37,
        up: 38,
        right: 39,
        down: 40
    },
    /** states a key can be in */
    keyState: {
        pressed: 0,
        released: null
    },
    /** dictionary stores the state of the keys */
    keyStates: {},
    /** 
     * Check whether a key is pressed.
     * @function
     * @param {number} keyCode
     * @returns {boolean}
     */
    isPressedKey: function(keyCode) {
        if (keyCode == null)
            return false;
        return this.keyStates[keyCode] != this.keyState.released;
    },
    /**
     * Set a key's state as pressed.
     * @function
     * @param {number} keyCode
     */
    pressKey: function(keyCode) {
        this.keyStates[keyCode] = this.keyState.pressed;
    },
    /**
     * Set a key's state as released.
     * @function
     * @param {number} keyCode
     */
    releaseKey: function(keyCode) {
        this.keyStates[keyCode] = this.keyState.released;
    }
};

/* App classes */

/**
 * @typedef {object} Sprite
 * @property {string} path
 * @property {Vector} renderOffset
 */

/**
 * A container for a sprites used by our 2D entities.
 * 
 * @constructor
 * @param {string} imagePath - The path to the sprite's image file.
 */
var Sprite = function(imagePath) {
    assert(typeof imagePath === "string");

    /** @member {string} */
    this.path = imagePath;
    /** @member {Vector} */
    this.renderOffset = new Vector();
}

/** 
 * Enemies our player must avoid.
 *
 * @constructor
 */
var Enemy = function() {
    /** 
     * @type {Sprite} 
     */
    this.sprite = new Sprite('assets/images/enemy-bug.png');
    this.sprite.renderOffset = CharacterSprite.renderOffset;

    /** @type {Vector} */
    this.position = new Vector(0, 0);

    /** @type {boolean} */
    this.spawned = false;
};

/**
 * Get the rectangle of the enemy.
 *
 * @returns {Rect}
 */
Enemy.prototype.getRect = function() {
    return new Rect(this.position.add(CharacterSprite.boundingBoxOffset), CharacterSprite.size);
}

/**
 * Update method.
 *
 * @param {number} dt - A time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
    if (this.spawned) {
        this.position.x += this.speed * dt;
        if (this.position.x > MapBounds.rect.getBottomRight().x) {
            this.spawned = false;
        }
    }
};

/** Render method. */
Enemy.prototype.render = function() {
    if (this.spawned) {
        ctx.drawImage(Resources.get(this.sprite.path), 
            this.position.x + this.sprite.renderOffset.x, 
            this.position.y + this.sprite.renderOffset.y);
    }
};

/** 
 * Player that is controlled.
 * 
 * @constructor
 */
var Player = function() {
    /** 
     * @type {Sprite} 
     */
    this.sprite = new Sprite('assets/images/char-cat-girl.png');
    this.sprite.renderOffset = CharacterSprite.renderOffset;

    /** @type {Vector} */
    this.position = new Vector(0, 0);

    /** @type {boolean} */
    this.dx = this.dy = 0;
};

/**
 * Get the rectangle of the enemy.
 *
 * returns {Rect}
 */
Player.prototype.getRect = function() {
    return new Rect(this.position.add(CharacterSprite.boundingBoxOffset), CharacterSprite.size);
}

/**
 * Update method.
 *
 * @param {number} dt - A time delta between ticks.
 */
Player.prototype.update = function(dt) {
    this.position.x += this.dx;
    this.position.y += this.dy;

    var outOfBounds = !this.getRect().isColliding(MapBounds.rect, false);

    if (outOfBounds) {
        this.position.x -= this.dx;
        this.position.y -= this.dy;
    }

    this.dx = this.dy = 0;
};

/** Render method. */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite.path), 
        this.position.x + this.sprite.renderOffset.x, 
        this.position.y + this.sprite.renderOffset.y);
};

/**
 * Keyboard key press handler for a player. 
 * Handles movement of the player. 
 *
 * @param {number} key - The key that is pressed.
 */
Player.prototype.handleInput = function(key) {
    switch (key) {
        case Keyboard.keyCode.up:
            this.dy = -TileSize.height;
        break;
        case Keyboard.keyCode.right:
            this.dx = TileSize.width;
        break;

        case Keyboard.keyCode.down:
            this.dy = TileSize.height;
        break;
        case Keyboard.keyCode.left:
            this.dx = -TileSize.width;
        break;
        default:
    }
};

/**
 * Our app.
 *
 * @namespace App
 * @property {number} maxEnemies
 * @property {Array} allEnemies
 * @property {Player} player
 */
var App = {
    maxEnemies: 5,
    timeUntilNextSpawn: 0,
    allEnemies: [],
    player: new Player(),
    /** @function */
    init: function() {
        // Input listeners 'keydown', 'keyup'
        // 'keydown' doesn't continuously call handleInput unless
        // it has been released. 
        document.addEventListener('keydown', function(e) {
            if (!Keyboard.isPressedKey(e.keyCode)) {
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
        while (i-->0) {
            var enemy = new Enemy();
            this.allEnemies.push(enemy);
        }

        // Spawn player at the start.
        this.respawnPlayer();
    },
    /** @function */
    update: function(dt) {
        this.timeUntilNextSpawn -= dt * 1000;
        if (this.timeUntilNextSpawn < 0) {
            this.timeUntilNextSpawn = Math.floor(Math.random() * (3000 - 500) + 500);
            this.spawnEnemyIfAvailable();
        }

        var playerRect = this.player.getRect();
        for (var i in this.allEnemies) {
            var enemy = this.allEnemies[i];
            if (enemy.spawned && playerRect.isColliding(enemy.getRect())) {
                this.respawnPlayer();
            }
        }

        if (this.player.getRect().isColliding(MapBounds.water, false))
            this.respawnPlayer();
    },
    /** @function */
    spawnEnemyIfAvailable: function() {
        for (var i in this.allEnemies) {
            var enemy = this.allEnemies[i];
            if (!enemy.spawned) {
                enemy.position.x = -TileSize.width;
                // offset by 10 because not centered onto tile
                enemy.position.y = 
                    Math.floor((Math.random() * 3) + 0) * TileSize.height; 
                enemy.speed = (Math.random() * (303 - 101)) + 101;
                enemy.spawned = true;
                break;
            }
        }
    },
    /** @function */
    respawnPlayer: function() {
        this.player.position.x = TileSize.width * 2;
        this.player.position.y = TileSize.height * 4;
    },
};

App.init();