import multer from 'multer';


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // cb(null, file.fieldname + '-' + uniqueSuffix)
        // cb(null, Date.now() + "-" + file.originalname);
        // cb(null, crypto.randomUUID() + ".png");
        cb(null, file.originalname)  // yaha per original name save ho rha hai, agar aapko unique name chahiye to upar wale code ko uncomment kar do(kyi ki yaha per agar same name ki file upload hoti hai to overwrite ho jayegi)

    }
})


export const upload = multer({
    // storage: storage
    storage,

})