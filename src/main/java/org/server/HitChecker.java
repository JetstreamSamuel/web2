package org.server;

public final class HitChecker {

    private HitChecker() {}

    public static boolean isHit(int x, double y, double r) {
        boolean rectangle = (y >= 0 && x >= 0 && x <= r && y <= r/2.0);

        boolean triangular = (y <= 0 && x <= 0 && Math.abs(x) <= r &&
                Math.abs(y) <= r/2 && y >= -1.0/2 * x - 1);

        boolean circle = (y <= 0 && x >= 0 && x <= r/2.0 && y <= r/2.0 &&
                Math.pow(y, 2) + Math.pow(x, 2) <= Math.pow(r/2.0, 2));

        return rectangle || triangular || circle;
    }
}
