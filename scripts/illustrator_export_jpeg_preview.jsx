(function () {
    var doc = app.activeDocument;
    var file = new File("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/tmp/illustrator/layout_v2_check.jpg");
    var options = new ExportOptionsJPEG();
    options.antiAliasing = true;
    options.artBoardClipping = true;
    options.horizontalScale = 500;
    options.verticalScale = 500;
    options.qualitySetting = 100;
    options.optimization = true;
    options.matte = true;
    options.matteColor = new RGBColor();
    options.matteColor.red = 255;
    options.matteColor.green = 255;
    options.matteColor.blue = 255;
    doc.exportFile(file, ExportType.JPEG, options);
    return file.fsName;
}());
