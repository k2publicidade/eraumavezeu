(function () {
    var doc = app.activeDocument;
    var outputFolder = new Folder("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/output/illustrator");
    if (!outputFolder.exists) outputFolder.create();
    var previewFolder = new Folder("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/tmp/illustrator");
    if (!previewFolder.exists) previewFolder.create();

    var workingFile = new File(outputFolder.fsName + "/mundo_1_layout_vetor.ai");
    var saveOptions = new IllustratorSaveOptions();
    saveOptions.pdfCompatible = true;
    saveOptions.compressed = true;
    saveOptions.embedICCProfile = true;
    doc.saveAs(workingFile, saveOptions);

    var artboard = doc.artboards[0];
    var originalRect = artboard.artboardRect;
    artboard.artboardRect = [-350, 190, 160, -85];

    var preview = new File(previewFolder.fsName + "/assets_overview.png");
    var png = new ExportOptionsPNG24();
    png.antiAliasing = true;
    png.artBoardClipping = true;
    png.horizontalScale = 180;
    png.verticalScale = 180;
    png.transparency = false;
    doc.exportFile(preview, ExportType.PNG24, png);

    artboard.artboardRect = originalRect;
    doc.save();
    return "WORKING_FILE=" + workingFile.fsName + "\nPREVIEW=" + preview.fsName;
}());
