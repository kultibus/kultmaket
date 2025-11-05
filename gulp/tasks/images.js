import webp from "gulp-webp";
import imagemin from "gulp-imagemin";

export const images = () => {
    const { isBuild } = app;
    const { src, build } = app.path;
    const { newer, gulpIf, browserSync } = app.plugins;

    const processImages = app.gulp
        .src(src.images, { encoding: false })
        .pipe(newer(build.images))
        .pipe(app.gulp.dest(build.images))
        .pipe(webp())
        .pipe(app.gulp.dest(build.images))
        .pipe(gulpIf(isBuild, app.gulp.src(src.images, { encoding: false })))
        .pipe(gulpIf(isBuild, newer(build.images)))
        .pipe(
            gulpIf(
                isBuild,
                imagemin({
                    progressive: true,
                    interlaced: true,
                    optimizationLevel: 3,
                })
            )
        )
        .pipe(app.gulp.dest(build.images));

    const processSVG = app.gulp
        .src(src.svg)
        .pipe(newer(build.images))
        .pipe(
            gulpIf(
                isBuild,
                imagemin({
                    svgoPlugins: [{ removeViewBox: false }],
                })
            )
        )
        .pipe(app.gulp.dest(build.images));

    return Promise.all([
        new Promise(resolve => processImages.on("end", resolve)),
        new Promise(resolve => processSVG.on("end", resolve)),
    ]).then(() => browserSync.stream());
};

// import webp from "gulp-webp";
// import imagemin from "gulp-imagemin";

// export const images = () => {
//     return app.gulp
//         .src(app.path.src.images, { encoding: false })
//         .pipe(app.plugins.newer(app.path.build.images))

//         .pipe(app.plugins.gulpIf(app.isBuild, webp()))
//         .pipe(
//             app.plugins.gulpIf(
//                 app.isBuild,
//                 app.gulp.dest(app.path.build.images)
//             )
//         )

//         .pipe(
//             app.plugins.gulpIf(
//                 app.isBuild,
//                 app.gulp.src(app.path.src.images, { encoding: false })
//             )
//         )
//         .pipe(
//             app.plugins.gulpIf(
//                 app.isBuild,
//                 app.plugins.newer(app.path.build.images)
//             )
//         )
//         .pipe(
//             app.plugins.gulpIf(
//                 app.isBuild,
//                 imagemin({
//                     progressive: true,
//                     svgoPlugins: [{ removeViewBox: false }],
//                     interlaced: true,
//                     optimizationLevel: 3, // 0 to 7
//                 })
//             )
//         )
//         .pipe(app.gulp.dest(app.path.build.images))
//         .pipe(app.gulp.src(app.path.src.svg))
//         .pipe(app.gulp.dest(app.path.build.images))
//         .pipe(app.plugins.browserSync.stream());
// };
