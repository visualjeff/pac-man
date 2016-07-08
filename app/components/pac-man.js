import Ember from 'ember';
import Pac from '../models/pac';
import SharedStuff from '../mixins/shared-stuff';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export
default Ember.Component.extend(KeyboardShortcuts, SharedStuff, {
    isMoving: false,
    didInsertElement() {
        this.set('pac', Pac.create());
        this.movementLoop();
    },

    score: 0,
    levelNumber: 1,

    screenWidth: Ember.computed(function() {
        return this.get('grid.firstObject.length');
    }),
    screenHeight: Ember.computed(function() {
        return this.get('grid.length');
    }),
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
    drawPellet(x, y) {
        let radiusDivisor = 6;
        this.drawCircle(x, y, radiusDivisor, 'stopped');
    },

    clearScreen() {
        let ctx = this.get('ctx');
        ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
    },

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
