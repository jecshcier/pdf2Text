const fs = require('fs-extra'),
    PDFParser = require("pdf2json");

const pdfParser = new PDFParser();
const path = require('path')
let inputPath = '/Users/jecshcier/Desktop/pdfinput'
let outputPath = '/Users/jecshcier/Desktop/pdfoutput'
    // let pdfPath = path.normalize(process.cwd() + '/2.pdf')

fs.readdir(inputPath).then((files) => {
    readPdf(files, 0, outputPath)
}, (err) => {
    console.log(err)
})

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));

function readPdf(fileArr, index, outputPath) {
    if (!fileArr[index]) {
        if (!index) {
            console.log("已完成")
        } else {
            return false
        }
    }
    let pdfPath = path.normalize(inputPath + '/' + fileArr[index])
    let spArr = fileArr[index].split(".")
    let pos = spArr[spArr.length - 1]
    if (pos !== "pdf") {
        console.log("后缀名不正确")
        return false
    }
    let dirName = fileArr[index].replace(/.pdf/g, '')
    pdfParser.once("pdfParser_dataReady", pdfData => {
        // let data = pdfParser.getRawTextContent()
        // console.log(data)
        let bookList = []
            //获取所有页面
        let pages = pdfData['formImage'].Pages
            //遍历页面
        let savePath = path.normalize(outputPath + '/' + dirName)
        fs.ensureDir(savePath, (err) => {
            if (err) {
                console.log(err)
                return false
            }
            for (let pNum in pdfData['formImage'].Pages) {
                bookList[pNum] = ''
                    //当前页
                let currentPage = pages[pNum].Texts
                let currentY = 0;
                let temp = false
                for (let i = 0; i < currentPage.length; i++) {
                    let str = decodeURIComponent(currentPage[i].R[0].T)
                    let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                    let reg2 = /^[0-9]+.?[0-9]*$/;
                    if (!reg.test(str) || reg2.test(str)) {
                        if (!temp) {
                            bookList[pNum] += '   '
                            temp = true
                        }
                        continue;
                    }
                    temp = false
                    if (currentPage[i].y !== currentY && currentY !== 0) {
                        bookList[pNum] += '\n'
                    }
                    bookList[pNum] += str
                    currentY = currentPage[i].y
                }

                try {
                    fs.writeFileSync(path.normalize(savePath + '/' + pNum + '.txt'), bookList[pNum])
                } catch (e) {
                    console.log("文件写入出错")
                    console.log(e)
                    return false
                }
                console.log("写入完成")
                console.log(pNum)
                console.log(pdfData['formImage'].Pages.length)
                if (parseInt(pNum) === pdfData['formImage'].Pages.length - 1) {
                    let num = index + 1;
                    console.log('test')
                    readPdf(fileArr, num, outputPath)
                }
            }
        })
        console.log(bookList)
        console.log(bookList.length)
            // fs.writeFile(exportPath, JSON.stringify(pdfData));
            // fs.writeFile(exportPath, JSON.stringify(pdfData));
    });
    pdfParser.loadPDF(pdfPath);
}