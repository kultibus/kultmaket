import fs from "fs/promises";
import path from "path";

export const copyFonts = () => {
    return app.gulp
        .src([`${app.path.srcFolder}/fonts/**/*.woff2`], { encoding: false })
        .pipe(app.plugins.plumber())
        .pipe(app.gulp.dest(`${app.path.build.fonts}`));
};

export const fontsStyle = () => {
    return processFontsStyle();
};

async function processFontsStyle() {
    const fontsFile = `${app.path.srcFolder}/scss/fonts/fonts.scss`;
    
    try {
        // Рекурсивно получаем все файлы шрифтов
        const allFontFiles = await getAllFontFiles(app.path.build.fonts);
        
        if (allFontFiles.length === 0) {
            await safeUnlink(fontsFile);
            console.log("Шрифты не найдены, файл fonts.scss удален");
            return app.gulp.src(`${app.path.srcFolder}`);
        }

        if (await fileExists(fontsFile)) {
            console.log("Файл scss/fonts/fonts.scss уже существует. Для обновления файла нужно его удалить!");
            return app.gulp.src(`${app.path.srcFolder}`);
        }

        await fs.writeFile(fontsFile, "");
        await generateFontFaces(allFontFiles, fontsFile);
        console.log(`Файл fonts.scss успешно создан с ${allFontFiles.length} шрифтами`);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("Папка со шрифтами не найдена");
        } else {
            console.error("Ошибка при обработке шрифтов:", error);
        }
    }
    
    return app.gulp.src(`${app.path.srcFolder}`);
}

// Рекурсивно получаем все WOFF2 файлы из папки и подпапок
async function getAllFontFiles(dir) {
    const fontFiles = [];
    
    async function scanDirectory(currentDir) {
        try {
            const items = await fs.readdir(currentDir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item.name);
                
                if (item.isDirectory()) {
                    await scanDirectory(fullPath); // Рекурсивный обход подпапок
                } else if (item.isFile() && item.name.endsWith('.woff2')) {
                    fontFiles.push({
                        fullPath,
                        relativePath: path.relative(app.path.build.fonts, fullPath)
                    });
                }
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`Ошибка при сканировании папки ${currentDir}:`, error);
            }
        }
    }
    
    await scanDirectory(dir);
    return fontFiles;
}

async function generateFontFaces(fontFiles, fontsFile) {
    const processedFonts = new Set();
    const fontFaceRules = [];

    for (const fontFile of fontFiles) {
        const fontFileName = path.basename(fontFile.fullPath, '.woff2');
        
        if (processedFonts.has(fontFileName)) continue;
        processedFonts.add(fontFileName);

        const [fontName, weightSuffix] = parseFontFileName(fontFileName);
        const fontWeight = convertWeight(weightSuffix);

        const fontFaceRule = generateFontFaceCSS(fontName, fontFile.relativePath, fontWeight);
        fontFaceRules.push(fontFaceRule);
    }

    if (fontFaceRules.length > 0) {
        await fs.appendFile(fontsFile, fontFaceRules.join('\n\n'));
    }
}

function parseFontFileName(fileName) {
    const parts = fileName.split('-');
    return parts.length > 1 
        ? [parts[0], parts[1]] 
        : [fileName, fileName];
}

function convertWeight(weight) {
    const weightMap = {
        'thin': 100,
        'hairline': 100,
        'extralight': 200,
        'ultralight': 200,
        'light': 300,
        'medium': 500,
        'semibold': 600,
        'demibold': 600,
        'bold': 700,
        'extrabold': 800,
        'ultrabold': 800,
        'heavy': 800,
        'black': 900,
        'extrablack': 950,
        'ultrablack': 950
    };
    
    return weightMap[weight?.toLowerCase()] || 400;
}

function generateFontFaceCSS(fontName, relativePath, fontWeight) {
    // Нормализуем путь для корректной работы в CSS
    const cssPath = relativePath.replace(/\\/g, '/');
    
    return `@font-face {
    font-family: "${fontName}";
    font-display: swap;
    src: url("../fonts/${cssPath}") format("woff2");
    font-weight: ${fontWeight};
    font-style: normal;
}`;
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function safeUnlink(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}