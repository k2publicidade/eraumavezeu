(function () {
    var doc = app.activeDocument;
    var PT_PER_MM = 72 / 25.4;
    var bleed = 0.5 * PT_PER_MM;
    var outputFolder = new Folder("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/output/illustrator");
    var aiFile = new File(outputFolder.fsName + "/mundo_1_layout_vetor.ai");
    var pdfFile = new File(outputFolder.fsName + "/mundo_1_layout_vetor_impressao.pdf");

    var aiOptions = new IllustratorSaveOptions();
    aiOptions.pdfCompatible = true;
    aiOptions.compressed = true;
    aiOptions.embedICCProfile = true;
    doc.saveAs(aiFile, aiOptions);

    var pdfOptions = new PDFSaveOptions();
    pdfOptions.compatibility = PDFCompatibility.ACROBAT7;
    pdfOptions.pDFXStandard = PDFXStandard.PDFX42007;
    pdfOptions.preserveEditability = true;
    pdfOptions.generateThumbnails = true;
    pdfOptions.optimization = true;
    pdfOptions.bleedLink = false;
    pdfOptions.bleedOffsetRect = [0, 0, 0, 0];
    pdfOptions.trimMarks = false;
    pdfOptions.registrationMarks = false;
    pdfOptions.colorBars = false;
    pdfOptions.pageInformation = false;
    pdfOptions.viewAfterSaving = false;
    var artboard = doc.artboards[0];
    var trimRect = artboard.artboardRect;
    artboard.artboardRect = [
        trimRect[0] - bleed,
        trimRect[1] + bleed,
        trimRect[2] + bleed,
        trimRect[3] - bleed
    ];
    if (pdfFile.exists) pdfFile.remove();
    doc.saveAs(pdfFile, pdfOptions);

    doc.artboards[0].artboardRect = trimRect;
    doc.saveAs(aiFile, aiOptions);

    var proof = new File(outputFolder.fsName + "/mundo_1_layout_vetor_preview.jpg");
    var jpeg = new ExportOptionsJPEG();
    jpeg.antiAliasing = true;
    jpeg.artBoardClipping = true;
    jpeg.horizontalScale = 500;
    jpeg.verticalScale = 500;
    jpeg.qualitySetting = 100;
    jpeg.optimization = true;
    jpeg.matte = true;
    jpeg.matteColor = new RGBColor();
    jpeg.matteColor.red = 255;
    jpeg.matteColor.green = 255;
    jpeg.matteColor.blue = 255;
    doc.exportFile(proof, ExportType.JPEG, jpeg);

    return "AI=" + aiFile.fsName + "\nPDF=" + pdfFile.fsName + "\nPROOF=" + proof.fsName;
}());
