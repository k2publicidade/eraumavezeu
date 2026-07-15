(function () {
    if (app.documents.length === 0) throw new Error("Nenhum documento ativo.");
    var doc = app.activeDocument;
    var layer = doc.layers[0];
    layer.name = "ARTE_FINAL";

    var PT_PER_MM = 72 / 25.4;
    function mm(value) { return value * PT_PER_MM; }
    function cmyk(c, m, y, k) {
        var color = new CMYKColor();
        color.cyan = c; color.magenta = m; color.yellow = y; color.black = k;
        return color;
    }
    function scaleToWidth(item, targetWidth) {
        var scale = targetWidth / item.width * 100;
        item.resize(scale, scale, true, true, true, true, scale, Transformation.CENTER);
    }
    function placeByTopLeft(item, left, top) {
        item.translate(left - item.left, top - item.top);
    }

    if (layer.pageItems.length < 10) throw new Error("Estrutura de montagem inesperada.");

    var logoMundo = layer.pageItems[0];
    var logoGermano = layer.pageItems[1];
    var scrapA = layer.pageItems[2];
    var scrapB = layer.pageItems[3];
    var backgroundPieces = [
        layer.pageItems[4],
        layer.pageItems[5],
        layer.pageItems[6],
        layer.pageItems[7]
    ];
    var technicalArtifact = layer.pageItems[8];
    var oldRasterComposition = layer.pageItems[9];

    oldRasterComposition.remove();
    technicalArtifact.remove();
    scrapA.remove();
    scrapB.remove();

    logoMundo.name = "LOGO_MUNDO_ENCANTADO";
    logoGermano.name = "LOGO_GERMANO";

    var vectorArt = layer.groupItems.add();
    vectorArt.name = "PADROES_VETORIAIS";
    for (var i = backgroundPieces.length - 1; i >= 0; i--) {
        backgroundPieces[i].move(vectorArt, ElementPlacement.PLACEATBEGINNING);
    }
    var artScale = mm(58.0) / vectorArt.width * 100;
    vectorArt.resize(artScale, artScale, true, true, true, true, artScale, Transformation.CENTER);
    placeByTopLeft(vectorArt, mm(-3.5), mm(33.8));

    var background = layer.groupItems.add();
    background.name = "BACKGROUND_VECTOR";
    var base = layer.pathItems.rectangle(mm(30.5), mm(-0.5), mm(51), mm(31));
    base.name = "BASE_TURQUESA_SANGRIA";
    base.filled = true;
    base.fillColor = cmyk(80, 10, 45, 0);
    base.stroked = false;
    base.move(background, ElementPlacement.PLACEATBEGINNING);
    vectorArt.move(background, ElementPlacement.PLACEATBEGINNING);
    background.zOrder(ZOrderMethod.SENDTOBACK);

    var panelGroup = layer.groupItems.add();
    panelGroup.name = "PAINEL_DADOS";
    var panelLeft = mm(2.15);
    var panelTop = mm(21.25);
    var panelWidth = mm(45.7);
    var panelHeight = mm(16.15);
    var radius = mm(2.25);

    var shadow = layer.pathItems.roundedRectangle(
        panelTop - mm(0.45),
        panelLeft + mm(0.45),
        panelWidth,
        panelHeight,
        radius,
        radius
    );
    shadow.name = "SOMBRA_VERDE";
    shadow.filled = true;
    shadow.fillColor = cmyk(55, 0, 85, 0);
    shadow.stroked = false;
    shadow.move(panelGroup, ElementPlacement.PLACEATBEGINNING);

    var panel = layer.pathItems.roundedRectangle(
        panelTop,
        panelLeft,
        panelWidth,
        panelHeight,
        radius,
        radius
    );
    panel.name = "PAINEL_BRANCO";
    panel.filled = true;
    panel.fillColor = cmyk(0, 0, 0, 0);
    panel.stroked = true;
    panel.strokeColor = cmyk(75, 100, 10, 2);
    panel.strokeWidth = 0.55;
    panel.move(panelGroup, ElementPlacement.PLACEATBEGINNING);

    function addLine(name, x1, x2, y) {
        var line = layer.pathItems.add();
        line.name = name;
        line.setEntirePath([[x1, y], [x2, y]]);
        line.filled = false;
        line.stroked = true;
        line.strokeColor = cmyk(75, 100, 10, 2);
        line.strokeWidth = 0.5;
        line.strokeCap = StrokeCap.ROUNDENDCAP;
        line.move(panelGroup, ElementPlacement.PLACEATBEGINNING);
        return line;
    }

    addLine("LINHA_DE", mm(12.1), mm(45.5), mm(15.15));
    addLine("LINHA_PARA", mm(15.2), mm(45.5), mm(8.65));

    function addOutlinedLabel(name, text, x, baseline) {
        var frame = layer.textFrames.add();
        frame.name = name + "_TEXTO";
        frame.contents = text;
        frame.position = [x, baseline];
        frame.textRange.characterAttributes.textFont = app.textFonts.getByName("Nunito-ExtraBold");
        frame.textRange.characterAttributes.size = 7.3;
        frame.textRange.characterAttributes.fillColor = cmyk(75, 100, 10, 2);
        var outlined = frame.createOutline();
        outlined.name = name;
        outlined.move(panelGroup, ElementPlacement.PLACEATBEGINNING);
        return outlined;
    }

    addOutlinedLabel("ROTULO_DE", "De:", mm(4.4), mm(14.9));
    addOutlinedLabel("ROTULO_PARA", "Para:", mm(4.4), mm(8.4));

    scaleToWidth(logoMundo, mm(19.2));
    placeByTopLeft(logoMundo, (mm(50) - logoMundo.width) / 2, mm(29.15));
    logoMundo.zOrder(ZOrderMethod.BRINGTOFRONT);

    scaleToWidth(logoGermano, mm(13.8));
    placeByTopLeft(logoGermano, (mm(50) - logoGermano.width) / 2, mm(3.45));
    logoGermano.zOrder(ZOrderMethod.BRINGTOFRONT);

    panelGroup.zOrder(ZOrderMethod.BRINGTOFRONT);
    logoMundo.zOrder(ZOrderMethod.BRINGTOFRONT);
    logoGermano.zOrder(ZOrderMethod.BRINGTOFRONT);

    try {
        doc.documentPreferences.documentBleedOffsetRect = [mm(0.5), mm(0.5), mm(0.5), mm(0.5)];
    } catch (e) {}

    var outputFolder = new Folder("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/output/illustrator");
    var aiFile = new File(outputFolder.fsName + "/mundo_1_layout_vetor.ai");
    var aiOptions = new IllustratorSaveOptions();
    aiOptions.pdfCompatible = true;
    aiOptions.compressed = true;
    aiOptions.embedICCProfile = true;
    doc.saveAs(aiFile, aiOptions);

    var previewFolder = new Folder("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/tmp/illustrator");
    var preview = new File(previewFolder.fsName + "/layout_v1.png");
    var png = new ExportOptionsPNG24();
    png.antiAliasing = true;
    png.artBoardClipping = true;
    png.horizontalScale = 800;
    png.verticalScale = 800;
    png.transparency = false;
    doc.exportFile(preview, ExportType.PNG24, png);

    return "AI=" + aiFile.fsName + "\nPREVIEW=" + preview.fsName + "\nRASTERS=" + doc.rasterItems.length + "\nITEMS=" + doc.pageItems.length;
}());
