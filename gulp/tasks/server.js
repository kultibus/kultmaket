export const server = done => {
    app.plugins.browserSync.init({
        server: {
            baseDir: `${app.path.build.html}`,
        },
        notify: false,
        port: 3000,
        // Добавьте эти опции:
        open: true, // не открывать браузер автоматически
        reloadDelay: 100, // задержка перед перезагрузкой
        injectChanges: true, // инжект изменений вместо полной перезагрузки
    });
};
