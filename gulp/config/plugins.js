import replace from "gulp-replace";
import browserSync from "browser-sync";
import newer from "gulp-newer";
import gulpIf from "gulp-if";
import svgSprite from "gulp-svg-sprite";

export const plugins = {
    replace: replace,
    browserSync: browserSync,
    newer: newer,
    gulpIf: gulpIf,
    svgSprite: svgSprite,
};
