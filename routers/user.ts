import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { resolve} from 'path';
import multer from 'multer';
import Sharp from 'sharp';

const uploads = multer({ dest: 'public/uploads' });

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .post('/avatar', uploads.single('avatar'), (req, res, next) => {
            if (!!req.file) {
                res.json({
                    url: `/uploads/${req.file.filename}`,
                });
            } else {
                next(new Error('No file found'));
            }
        })
        .post('/watermark', uploads.single('file'), async (req, res, next) => {
            if (!!req.file) {
                const watermark = Sharp(await readFile(req.file.path)).composite([
                    { input: await readFile(resolve('./images/covalence_trans.png')), left: 20, top: 20 }
                ]).png().toBuffer();

                const fileName = `watermarked-${Date.now()}.png`;

                await writeFile(resolve(`./public/uploads/${fileName}`), await watermark);

                 const watermark2 = Sharp(await readFile(`./public/uploads/${fileName}`)).composite([
                    { input: await readFile(resolve('./images/covalence_trans.png')), left: 300, top: 300 }
                ]).png().toBuffer();
                const fileName2 = `watermarked-${Date.now()}.png`;

                await writeFile(resolve(`./public/uploads/${fileName2}`), await watermark2);
                res.json({
                    url: `/uploads/${fileName2}`,
                });
            } else {
                next(new Error('No file found'));
            }
        });

    return router;
}

function generateDoc(filename: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avatar</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <h1>My Avatar</h1>
    <img src="/uploads/${filename}" alt="" />
</body>
</html>
`;
}