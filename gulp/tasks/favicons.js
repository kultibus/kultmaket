export const copyFavicons = () => {
    return app.gulp
        .src(`${app.path.src.favicons}`, { encoding: false })
        .pipe(app.gulp.dest(app.path.build.html));
};
