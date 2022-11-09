import { _decorator, Component, Node, Collider2D, BoxCollider2D, Contact2DType } from 'cc';
import { Constant } from '../framework/Constant';
import { PoolManager } from '../framework/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _bulletSpeed = 0;
    private _isEnemyBullet = false;
    private _direction = Constant.Direction.MIDDLE;


    start() {
    }

    onEnable() {
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDisable() {
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    update(deltaTime: number) {
        const pos = this.node.position;
        let moveLength = 0;
        const outofrange = this._isEnemyBullet ? -800 : 800;
        if (this._isEnemyBullet) {
            moveLength = pos.y - this._bulletSpeed
            this.node.setPosition(pos.x, moveLength);
            if (moveLength < outofrange) {
                PoolManager.instance().putNode(this.node);
                // console.log("Enemy bullet destroy");
            }
        } else {
            moveLength = pos.y + this._bulletSpeed;
            if (this._direction === Constant.Direction.LEFT) {
                this.node.setPosition(pos.x - this._bulletSpeed * 0.2, moveLength);
            } else if (this._direction === Constant.Direction.RIGHT) {
                this.node.setPosition(pos.x + this._bulletSpeed * 0.2, moveLength);
            } else {
                this.node.setPosition(pos.x, moveLength);
            }
            if (moveLength > outofrange) {
                PoolManager.instance().putNode(this.node);
                // console.log("Player bullet destroy");
            }
        }

    }

    show(speed: number, isEnemyBullet: boolean, direction = Constant.Direction.MIDDLE) {
        this._bulletSpeed = speed;
        this._isEnemyBullet = isEnemyBullet;
        this._direction = direction;
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        PoolManager.instance().putNode(this.node);
    }
}

