const fs = require('fs-extra'),
    PDFParser = require("pdf2json");

const pdfParser = new PDFParser();
const path = require('path')
let exportPath = path.normalize(process.cwd() + '/output.json')
let pdfPath = path.normalize(process.cwd() + '/2.pdf')

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    // let data = pdfParser.getRawTextContent()
    // console.log(data)
    let bookList = []
    //获取所有页面
    let pages = pdfData['formImage'].Pages
    //遍历页面
    for (pNum in pdfData['formImage'].Pages) {
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
                if(!temp)
                {
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
        fs.writeFile(path.normalize(process.cwd() + '/' + pNum + '.txt'), bookList[pNum])
    }
    console.log(bookList)
    console.log(bookList.length)
    // fs.writeFile(exportPath, JSON.stringify(pdfData));
    // fs.writeFile(exportPath, JSON.stringify(pdfData));
});

pdfParser.loadPDF(pdfPath);