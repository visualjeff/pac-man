import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export
default Ember.Component.extend(KeyboardShortcuts, {
    ctx: Ember.computed(function() {
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
    x: 1,
    y: 2,
    squareSize: 40,
    //0 is a blankspace 
    //1 is a wall
    grid: [
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 1, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
    ],
    didInsertElement() {
        this.drawWalls();
        this.drawCircle();
    },
    screenPixelWidth: Ember.computed(function() {
        return this.get('screenWidth') * this.get('squareSize');
    }),
    screenPixelHeight: Ember.computed(function() {
        return this.get('screenHeight') * this.get('squareSize');
    }),
    drawWalls() {
        let squareSize = this.get('squareSize');
        let ctx = this.get('ctx');
        ctx.fillStyle = '#000';
        let grid = this.get('grid');
        grid.forEach(function(row, rowIndex) {
            row.forEach(function(cell, columnIndex) {
                if (cell == 1) {
                    ctx.fillRect(columnIndex * squareSize, rowIndex * squareSize, squareSize, squareSize);
                }
            });
        });
    },
    drawCircle() {
        let ctx = this.get('ctx');
        let x = this.get('x');
        let y = this.get('y');

        let squareSize = this.get('squareSize');
        let pixelX = (x + 1 / 2) * squareSize;
        let pixelY = (y + 1 / 2) * squareSize;

        //console.log(`pixelX: ${pixelX}, pixelY: ${pixelY}`);

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, squareSize / 2, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
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

        if (this.collidedWithBorder() || this.collidedWithGrid()) {
            this.decrementProperty(direction, amount);
        }

        this.clearScreen();
        this.drawWalls();
        this.drawCircle();
    },
    keyboardShortcuts: {
        up: function() {
            this.movePacMan('y', -1);
        },
        down: function() {
            this.movePacMan('y', 1);
        },
        left: function() {
            this.movePacMan('x', -1);
        },
        right: function() {
            this.movePacMan('x', 1);
        }
    }
});
