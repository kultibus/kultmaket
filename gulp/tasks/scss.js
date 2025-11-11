// import * as dartSass from "sass";
// import gulpSass from "gulp-sass";
// import rename from "gulp-rename";
// import cleanCss from "gulp-clean-css";
// import webpCss from "gulp-webpcss";
// import autoPrefixer from "gulp-autoprefixer";
// import groupCssMediaQueries from "gulp-group-css-media-queries";

// const sass = gulpSass(dartSass);

// export const scss = () => {
//     return (
//         app.gulp
//             .src(app.path.src.scss, { sourcemaps: app.isDev })
//             // .pipe(app.plugins.replace(/@img\//g, "../img/"))
//             .pipe(
//                 sass({
//                     outputStyle: "expanded",
//                 })
//             )
//             .pipe(app.plugins.gulpIf(app.isBuild, groupCssMediaQueries()))

//             // .pipe(
//             //     app.plugins.gulpIf(
//             //         app.isBuild,
//             //         webpCss({
//             //             webpClass: ".webp",
//             //             noWebpClass: ".no-webp",
//             //         })
//             //     )
//             // )

//             .pipe(
//                 app.plugins.gulpIf(
//                     app.isBuild,
//                     autoPrefixer({
//                         // grid: "autoplace",
//                         grid: false,
//                         overrideBrowserslist: ["last 3 versions"],
//                         cascade: true,
//                     })
//                 )
//             )

//             .pipe(app.gulp.dest(app.path.build.css))

//             // .pipe(
//             //     app.plugins.gulpIf(app.isDev, app.gulp.dest(app.path.build.css))
//             // )

//             .pipe(app.plugins.gulpIf(app.isBuild, cleanCss()))

//             .pipe(
//                 rename({
//                     extname: ".min.css",
//                 })
//             )
//             .pipe(app.gulp.dest(app.path.build.css))
//             .pipe(app.plugins.browserSync.stream())
//     );
// };


import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import rename from "gulp-rename";
import cleanCss from "gulp-clean-css";
import webpCss from "gulp-webpcss";
import autoPrefixer from "gulp-autoprefixer";
import groupCssMediaQueries from "gulp-group-css-media-queries";

const sass = gulpSass(dartSass);

export const scss = () => {
    return (
        app.gulp
            .src(app.path.src.scss, { sourcemaps: app.isDev })
            .pipe(
                sass({
                    outputStyle: "expanded",
                })
            )
            .pipe(app.plugins.gulpIf(app.isBuild, groupCssMediaQueries()))


            .pipe(
                app.plugins.gulpIf(
                    app.isBuild,
                    autoPrefixer({
                        grid: false,
                        overrideBrowserslist: ["last 3 versions"],
                        cascade: true,
                    })
                )
            )

            .pipe(app.gulp.dest(app.path.build.css))


            .pipe(app.plugins.gulpIf(app.isBuild, cleanCss()))

            .pipe(
                rename({
                    extname: ".min.css",
                })
            )
            .pipe(app.gulp.dest(app.path.build.css))
            .pipe(app.plugins.browserSync.stream())
    );
};
