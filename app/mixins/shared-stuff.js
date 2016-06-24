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
    }
});
