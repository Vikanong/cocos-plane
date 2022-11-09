import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MovingSceneBg')
export class MovingSceneBg extends Component {

    @property(Node)
    bg01: Node = null;

    @property(Node)
    bg02: Node = null;

    private _bgSpeed = 3;
    private _bgMoveingRange = 1280;

    start() {
        console.log("start");
        this.init();
    }

    update(deltaTime: number) {
        this._moveBackground(deltaTime);
    }

    private init() {
        this.bg01.setPosition(0, 0);
        this.bg02.setPosition(0, this._bgMoveingRange);
    }

    private _moveBackground(deltaTime: number) {

        this.bg01.setPosition(0, this.bg01.position.y - this._bgSpeed);
        this.bg02.setPosition(0, this.bg02.position.y - this._bgSpeed);

        if (this.bg01.position.y < -this._bgMoveingRange) {
            this.bg01.setPosition(0, this.bg02.position.y + this._bgMoveingRange);
        } else if (this.bg02.position.y < -this._bgMoveingRange) {
            this.bg02.setPosition(0, this.bg01.position.y + this._bgMoveingRange);
        }
    }
}

