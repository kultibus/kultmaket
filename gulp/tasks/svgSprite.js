export const svgSprite = () => {
    const config = {
        mode: {
            symbol: {
                dest: ".",
                sprite: "sprite.svg",
                example: true,
            },
        },
        shape: {
            id: {
                separator: "--",
                generator: function (name, file) {
                    // Генерируем id на основе имени файла
                    return file.relative.replace(/\.svg$/, "");
                },
            },
            transform: [
                {
                    svgo: {
                        plugins: [
                            {
                                name: "removeAttrs",
                                params: {
                                    attrs: "(fill|stroke|style)",
                                },
                            }, // удаляем fill, stroke, style
                            { name: "removeTitle", active: true },
                            { name: "removeDesc", active: true },
                            { name: "removeViewBox", active: false }, // оставляем viewBox
                            {
                                name: "removeUselessStrokeAndFill",
                                active: true,
                            },
                            { name: "cleanupIDs", active: true },
                            { name: "collapseGroups", active: true },
                        ],
                    },
                },
            ],
        },
    };

    return app.gulp
        .src(app.path.src.svgIcons)
        .pipe(app.plugins.plumber())
        .pipe(app.plugins.svgSprite(config))
        .pipe(app.gulp.dest(app.path.build.images)); // сохраняем в build/img/
};
