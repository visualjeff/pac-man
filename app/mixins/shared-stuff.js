import Ember from 'ember';

//Everything related to Pac's state
export default Ember.Mixin.create({
    direction: 'down',
    intent: 'down',
    x: 1,
    y: 2,
    draw() {
        let x = this.get('x');
        let y = this.get('y');
        let radiusDivisor = 2;
        this.drawCircle(x, y, radiusDivisor, this.get('direction'));
    },
    changeDirection() {
        let intent = this.get('intent');
        if (this.pathBlockedInDirection(intent)) {
            this.set('direction', 'stopped');
        } else {
            this.set('direction', intent);
        }
    },
    pathBlockedInDirection(direction) {
        let cellTypeInDirection = this.cellTypeInDirection(direction);
        return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection === 1;
    },
    cellTypeInDirection(direction) {
        let nextX = this.nextCoordinate('x', direction);
        let nextY = this.nextCoordinate('y', direction);
        return this.get(`grid.${nextY}.${nextX}`);
    },
    nextCoordinate(coordinate, direction) {
        let nextCoordinate = this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
        //console.log(`nextCoordinate: ${nextCoordinate}`);
        return nextCoordinate;
    }, 
    frameCycle: 1,
    framesPerMovement: 30,
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
    squareSize: 40,
    ctx: Ember.computed(function() {
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
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
});
