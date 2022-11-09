import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class Constant {
    public static EnemyPlaneType = {
        TYPE1: 1,
        TYPE2: 2,
    }

    public static Combination = {
        PLANE1: 1,
        PLANE2: 2,
        PLANE3: 3,
    }

    public static CollistionType = {
        SELF_PLAN: 1 << 1,
        ENEMY_PLAN: 1 << 2,
        SELF_BULLET: 1 << 3,
        ENEMY_BULLET: 1 << 4,
        BULLET_PROP: 1 << 5,
    }

    public static BulletPropType = {
        BULLET_M: 1,
        BULLET_H: 2,
        BULLET_S: 3
    }

    public static Direction = {
        LEFT: 1,
        MIDDLE: 2,
        RIGHT: 3
    }

}

