// Импорт основного модуля
import gulp from "gulp";
// Импорт общих плагинов
import { plugins } from "./gulp/config/plugins.js";
// Импорт путей
import { path } from "./gulp/config/path.js";

// Передаем значения в глобальную переменную
global.app = {
    isBuild: process.argv.includes("--build"),
    isDev: !process.argv.includes("--build"),
    gulp: gulp,
    path: path,
    plugins: plugins,
};

// Импорт задач
import { copy } from "./gulp/tasks/copy.js";
import { reset } from "./gulp/tasks/reset.js";
import { html } from "./gulp/tasks/html.js";
import { server } from "./gulp/tasks/server.js";
import { scss } from "./gulp/tasks/scss.js";
import { js } from "./gulp/tasks/js.js";
import { images } from "./gulp/tasks/images.js";
import { copyFonts, fonstStyle } from "./gulp/tasks/fonts.js";
import { copyFavicons } from "./gulp/tasks/favicons.js";
import { svgSprite } from "./gulp/tasks/svgSprite.js";

function watcher() {
    gulp.watch(path.watch.files, copy);
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.scss, scss);
    gulp.watch(path.watch.js, js);
    gulp.watch(path.watch.images, images);
    gulp.watch(path.watch.favicons, copyFavicons);
    gulp.watch(path.watch.svgIcons, svgSprite);
}

// Последовательная обработака шрифтов
const fonts = gulp.series(copyFonts, fonstStyle);

const favicons = gulp.parallel(copyFavicons);

const mainTasks = gulp.series(
    fonts,
    favicons,
    gulp.parallel(copy, html, scss, js, images, svgSprite)
);

// Построение сценариев выполнения задач
export const development = gulp.series(
    reset,
    mainTasks,
    gulp.parallel(watcher, server)
);

export const build = gulp.series(reset, mainTasks, server);

// Выполнение сценария по умолчанию
gulp.task("default", development);

// Отдельная задача для спрайтов
export { svgSprite };
