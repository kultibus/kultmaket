import fileinclude from "gulp-file-include";
import webpHtmlNosvg from "gulp-webp-html-nosvg";
import htmlClean from "gulp-htmlclean";

export const html = () => {
    return app.gulp
        .src(app.path.src.html)
        .pipe(app.plugins.plumber(plumberConfig))
        .pipe(fileinclude())
        .pipe(app.plugins.replace(/@img\//g, "img/"))
        .pipe(app.plugins.gulpIf(app.isBuild, webpHtmlNosvg()))
        .pipe(app.plugins.gulpIf(app.isBuild, htmlClean()))
        .pipe(app.gulp.dest(app.path.build.html))
        .pipe(app.plugins.browserSync.stream());
};
