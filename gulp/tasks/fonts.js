import fs from "fs";
import { encode } from "punycode";

export const copyFonts = () => {
    return app.gulp
        .src(`${app.path.srcFolder}/fonts/*.woff2`, { encoding: false })
        .pipe(app.gulp.dest(`${app.path.build.fonts}`));
};

export const fonstStyle = () => {
    let fontsFile = `${app.path.srcFolder}/scss/fonts/fonts.scss`;
    // Если передан флаг --rewrite удаляем файл подключения шрифтов
    // app.isFontsReW ? fs.unlink(fontsFile, cb) : null;
    // Проверяем существуют ли файлы шрифтов
    fs.readdir(app.path.build.fonts, function (err, fontsFiles) {
        if (fontsFiles) {
            // Проверяем существует ли файл стилей для подключения шрифтов
            if (!fs.existsSync(fontsFile)) {
                // Если файла нет, создаем его
                fs.writeFile(fontsFile, "", cb);
                let newFileOnly;
                for (var i = 0; i < fontsFiles.length; i++) {
                    // Записываем подключения шрифтов в файл стилей
                    let fontFileName = fontsFiles[i].split(".")[0];
                    if (newFileOnly !== fontFileName) {
                        let fontName = fontFileName.split("-")[0]
                            ? fontFileName.split("-")[0]
                            : fontFileName;
                        let fontWeight = fontFileName.split("-")[1]
                            ? fontFileName.split("-")[1]
                            : fontFileName;
                        if (fontWeight.toLowerCase() === "thin") {
                            fontWeight = 100;
                        } else if (fontWeight.toLowerCase() === "extralight") {
                            fontWeight = 200;
                        } else if (fontWeight.toLowerCase() === "light") {
                            fontWeight = 300;
                        } else if (fontWeight.toLowerCase() === "medium") {
                            fontWeight = 500;
                        } else if (fontWeight.toLowerCase() === "semibold") {
                            fontWeight = 600;
                        } else if (fontWeight.toLowerCase() === "bold") {
                            fontWeight = 700;
                        } else if (
                            fontWeight.toLowerCase() === "extrabold" ||
                            fontWeight.toLowerCase() === "heavy"
                        ) {
                            fontWeight = 800;
                        } else if (fontWeight.toLowerCase() === "black") {
                            fontWeight = 900;
                        } else {
                            fontWeight = 400;
                        }
                        fs.appendFile(
                            fontsFile,
                            `@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`,
                            cb
                        );
                        newFileOnly = fontFileName;
                    }
                }
            } else {
                // Если файл есть, выводим сообщение
                console.log(
                    "Файл scss/fonts/fonts.scss уже существует. Для обновления файла нужно его удалить!"
                );
            }
        } else {
            // Если шрифтов нет
            fs.unlink(fontsFile, cb);
        }
    });
    return app.gulp.src(`${app.path.srcFolder}`);
};
function cb() {}
