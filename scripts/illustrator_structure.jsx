(function () {
    var doc = app.activeDocument;
    var layer = doc.layers[0];
    function bounds(item) {
        try { return item.geometricBounds.join(","); } catch (e) { return "n/a"; }
    }
    function fillInfo(item) {
        try {
            if (item.typename === "PathItem" && item.filled) return item.fillColor.typename;
            if (item.typename === "CompoundPathItem" && item.pathItems.length > 0 && item.pathItems[0].filled) return item.pathItems[0].fillColor.typename;
        } catch (e) {}
        return "none";
    }
    function childSummary(group) {
        var map = {};
        try {
            for (var i = 0; i < group.pageItems.length; i++) {
                var type = group.pageItems[i].typename;
                map[type] = (map[type] || 0) + 1;
            }
        } catch (e) {}
        var out = [];
        for (var key in map) out.push(key + ":" + map[key]);
        return out.join(",");
    }

    var lines = [];
    for (var i = 0; i < layer.pageItems.length; i++) {
        var item = layer.pageItems[i];
        lines.push(
            "TOP=" + i +
            "|type=" + item.typename +
            "|bounds=" + bounds(item) +
            "|w=" + item.width +
            "|h=" + item.height +
            "|opacity=" + item.opacity +
            "|hidden=" + item.hidden +
            "|locked=" + item.locked +
            "|fill=" + fillInfo(item) +
            "|children=" + childSummary(item)
        );
    }
    for (var r = 0; r < doc.rasterItems.length; r++) {
        var raster = doc.rasterItems[r];
        lines.push("RASTER=" + r + "|bounds=" + bounds(raster) + "|w=" + raster.width + "|h=" + raster.height + "|embedded=" + raster.embedded + "|opacity=" + raster.opacity);
    }
    var patternPaths = 0;
    for (var p = 0; p < doc.pathItems.length; p++) {
        var path = doc.pathItems[p];
        if (path.filled && path.fillColor.typename === "PatternColor") {
            lines.push("PATTERN_PATH=" + p + "|bounds=" + bounds(path) + "|pattern=" + path.fillColor.pattern.name + "|opacity=" + path.opacity);
            patternPaths++;
        }
    }
    lines.push("PATTERN_PATHS=" + patternPaths);
    return lines.join("\n");
}());
