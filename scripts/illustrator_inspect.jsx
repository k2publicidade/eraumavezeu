(function () {
    if (app.documents.length === 0) {
        throw new Error("Nenhum documento ativo no Illustrator.");
    }

    var doc = app.activeDocument;
    var outputFolder = new Folder("C:/Users/LiPeX/Documents/CLAUDE/eraumavezeu/tmp/illustrator");
    if (!outputFolder.exists) outputFolder.create();

    var preview = new File(outputFolder.fsName + "/preview_current.png");
    var png = new ExportOptionsPNG24();
    png.antiAliasing = true;
    png.artBoardClipping = true;
    png.horizontalScale = 500;
    png.verticalScale = 500;
    png.transparency = false;
    doc.exportFile(preview, ExportType.PNG24, png);

    var counts = {};
    var unnamed = 0;
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        counts[item.typename] = (counts[item.typename] || 0) + 1;
        if (!item.name) unnamed++;
    }

    var lines = [];
    lines.push("DOCUMENT=" + doc.name);
    lines.push("COLOR_SPACE=" + doc.documentColorSpace);
    lines.push("ARTBOARD=" + doc.artboards[0].artboardRect.join(","));
    lines.push("PAGE_ITEMS=" + doc.pageItems.length);
    lines.push("LAYERS=" + doc.layers.length);
    lines.push("PATTERNS=" + doc.patterns.length);
    lines.push("SWATCHES=" + doc.swatches.length);
    lines.push("UNNAMED_ITEMS=" + unnamed);

    for (var key in counts) lines.push("TYPE_" + key + "=" + counts[key]);

    for (var l = 0; l < doc.layers.length; l++) {
        var layer = doc.layers[l];
        lines.push("LAYER=" + layer.name + "|items=" + layer.pageItems.length + "|locked=" + layer.locked + "|visible=" + layer.visible);
    }

    for (var p = 0; p < doc.patterns.length; p++) {
        lines.push("PATTERN=" + doc.patterns[p].name);
    }

    for (var t = 0; t < doc.textFrames.length; t++) {
        var text = doc.textFrames[t].contents.replace(/[\r\n]+/g, " ");
        lines.push("TEXT=" + text + "|size=" + doc.textFrames[t].textRange.characterAttributes.size);
    }

    lines.push("PREVIEW=" + preview.fsName);
    return lines.join("\n");
}());
