export const copy = () => {
    return app.gulp
        .src(app.path.src.files)
        .pipe(app.plugins.plumber())
        .pipe(app.gulp.dest(app.path.build.files));
};
