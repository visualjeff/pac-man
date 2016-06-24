import Ember from 'ember';
import Pac from '../models/pac';
import SharedStuff from '../mixins/shared-stuff';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export
default Ember.Component.extend(KeyboardShortcuts, SharedStuff, {
    ctx: Ember.computed(function() {
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
    score: 0,
    levelNumber: 1,
    squareSize: 40,
    //0 is a blankspace 
    //1 is a wall
    //2 is a pellet
    grid: [
        [2, 2, 2, 2, 2, 2, 2, 1],
        [2, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 2, 2, 2, 2, 1],
        [2, 2, 2, 2, 2, 2, 2, 1],
        [2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1],
    ],
    isMoving: false,
    didInsertElement() {
        let pac = Pac.create();
        this.set('pac', pac);
        this.movementLoop();
    },
    screenPixelWidth: Ember.computed(function() {
        return this.get('screenWidth') * this.get('squareSize');
    }),
    screenPixelHeight: Ember.computed(function() {
        return this.get('screenHeight') * this.get('squareSize');
    }),
    drawWall(x, y) {
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');
        ctx.fillStyle = '#000';
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    },
    drawPellet(x, y) {
        let radiusDivisor = 6;
        this.drawCircle(x, y, radiusDivisor, 'stopped');
    },
    drawGrid() {
        let grid = this.get('grid');
        //NOTE the use of the fat array below.  Facilitates scope of this.
        grid.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell == 1) {
                    this.drawWall(columnIndex, rowIndex);
                }
                if (cell == 2) {
                    this.drawPellet(columnIndex, rowIndex);
                }
            });
        });
    },
    drawCircle(x, y, radiusDivisor, direction) {
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');
        let pixelX = (x + 1 / 2 + this.offsetFor('x', direction)) * squareSize;
        let pixelY = (y + 1 / 2 + this.offsetFor('y', direction)) * squareSize;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, squareSize / radiusDivisor, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    },
    offsetFor(coordinate, direction) {
        let frameRatio = this.get('frameCycle') / this.get('framesPerMovement');
        return this.get(`directions.${direction}.${coordinate}`) * frameRatio;
    },
    screenWidth: Ember.computed(function() {
        return this.get('grid.firstObject.length');
    }),
    screenHeight: Ember.computed(function() {
        return this.get('grid.length');
    }),
    clearScreen() {
        let ctx = this.get('ctx');
        ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
    },
    collidedWithBorder() {
        let x = this.get('x');
        let y = this.get('y');
        //console.log(`x: ${x}, y: ${y}`);
        let screenWidth = this.get('screenWidth');
        let screenHeight = this.get('screenHeight');
        //console.log(`screenWidth: ${screenWidth}, screenHeight: ${screenHeight}`);
        let pacOutOfBounds = x < 0 ||
            y < 0 ||
            x >= screenWidth ||
            y >= screenHeight;
        //console.log(`pacOutOfBounds? ${pacOutOfBounds}`);
        return pacOutOfBounds;
    },
    collidedWithGrid() {
        let x = this.get('x');
        let y = this.get('y');
        let grid = this.get('grid');
        return grid[y][x] == 1; //The order of y and x is important here
    },
    movePacMan(direction, amount) {
        this.incrementProperty(direction, amount);

        if (this.get('isMoving') || this.pathBlockedInDirection(direction)) {
            // do nothing, just wait it out
        } else {
            this.set('direction', direction);
            this.set('isMoving', true);
            this.movementLoop();
        }
    },
    frameCycle: 1,
    framesPerMovement: 30,
    movementLoop() {
        if (this.get('frameCycle') == this.get('framesPerMovement')) {
            let direction = this.get('direction');
            this.set('x', this.nextCoordinate('x', direction));
            this.set('y', this.nextCoordinate('y', direction));

            this.set('frameCycle', 1);
            this.processAnyPellets();
            this.changeDirection();
        } else if (this.get('direction') == 'stopped') {
            this.changeDirection();
        } else {
            this.incrementProperty('frameCycle');
        }
        this.clearScreen();
        this.drawGrid();
        this.draw();

        Ember.run.later(this, this.movementLoop, 1000 / 60);
    },
    nextCoordinate(coordinate, direction) {
        let nextCoordinate = this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
        //console.log(`nextCoordinate: ${nextCoordinate}`);
        return nextCoordinate;
    },
    cellTypeInDirection(direction) {
        let nextX = this.nextCoordinate('x', direction);
        let nextY = this.nextCoordinate('y', direction);
        return this.get(`grid.${nextY}.${nextX}`);
    },
    processAnyPellets() {
        let x = this.get('x');
        let y = this.get('y');
        let grid = this.get('grid');
        if (grid[y][x] == 2) {
            grid[y][x] = 0;
            this.incrementProperty('score');
            if (this.levelComplete()) {
                this.incrementProperty('levelNumber');
                this.restartLevel();
            }
        }
    },
    levelComplete() {
        let hasPelletsLeft = false;
        let grid = this.get('grid');
        grid.forEach((row) => {
            row.forEach((cell) => {
                if (cell == 2) {
                    hasPelletsLeft = true;
                }
            });
        });
        return !hasPelletsLeft;
    },
    restartLevel: function() {
        this.set('x', 0);
        this.set('y', 0);
        let grid = this.get('grid');
        grid.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell == 0) {
                    grid[rowIndex][columnIndex] = 2;
                }
            });
        });
    },
    directions: {
        'up': {
            x: 0,
            y: -1
        },
        'down': {
            x: 0,
            y: 1
        },
        'left': {
            x: -1,
            y: 0
        },
        'right': {
            x: 1,
            y: 0
        },
        'stopped': {
            x: 0,
            y: 0
        }
    },
    keyboardShortcuts: {
        up() {
                this.set('intent', 'up');
            },
            down() {
                this.set('intent', 'down');
            },
            left() {
                this.set('intent', 'left');
            },
            right() {
                this.set('intent', 'right');
            }
    }
});
