(function () {
    var doc = app.activeDocument;
    var PT_PER_MM = 72 / 25.4;
    function mm(value) { return value * PT_PER_MM; }

    var labelDe = doc.pageItems.getByName("ROTULO_DE");
    var labelPara = doc.pageItems.getByName("ROTULO_PARA");
    var lineDe = doc.pageItems.getByName("LINHA_DE");
    var linePara = doc.pageItems.getByName("LINHA_PARA");

    labelDe.translate(0, 9.0);
    labelPara.translate(0, 9.0);
    lineDe.setEntirePath([[mm(8.9), mm(15.15)], [mm(45.5), mm(15.15)]]);
    linePara.setEntirePath([[mm(11.3), mm(8.65)], [mm(45.5), mm(8.65)]]);

    var aiFile = new File("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/output/illustrator/mundo_1_layout_vetor.ai");
    var aiOptions = new IllustratorSaveOptions();
    aiOptions.pdfCompatible = true;
    aiOptions.compressed = true;
    aiOptions.embedICCProfile = true;
    doc.saveAs(aiFile, aiOptions);

    var preview = new File("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/tmp/illustrator/layout_v2.png");
    var png = new ExportOptionsPNG24();
    png.antiAliasing = true;
    png.artBoardClipping = true;
    png.horizontalScale = 800;
    png.verticalScale = 800;
    png.transparency = false;
    doc.exportFile(preview, ExportType.PNG24, png);
    return "PREVIEW=" + preview.fsName;
}());
