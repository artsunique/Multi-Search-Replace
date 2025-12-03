/**
 * Multi Search & Replace Script für Adobe InDesign
 * Palette-Version: Dokument bleibt im Hintergrund bedienbar
 */

#target indesign
#targetengine "multiSearchReplace"

(function() {
    // Prüfen ob ein Dokument geöffnet ist
    if (app.documents.length === 0) {
        alert("Bitte öffne zuerst ein Dokument.", "Kein Dokument");
        return;
    }

    var numFields = 5;

    // Palette erstellen (nicht-modales Fenster)
    var palette = new Window("palette", "Multi Search & Replace");
    palette.orientation = "column";
    palette.alignChildren = ["fill", "top"];

    // Header-Zeile
    var headerGroup = palette.add("group");
    headerGroup.alignChildren = ["fill", "center"];
    var headerSearch = headerGroup.add("statictext", undefined, "Suchen");
    headerSearch.preferredSize.width = 200;
    var headerReplace = headerGroup.add("statictext", undefined, "Ersetzen");
    headerReplace.preferredSize.width = 200;

    // Eingabefelder-Arrays
    var searchFields = [];
    var replaceFields = [];

    // 5 Zeilen mit Eingabefeldern erstellen
    for (var i = 0; i < numFields; i++) {
        var row = palette.add("group");
        row.alignChildren = ["fill", "center"];
        
        var searchField = row.add("edittext", undefined, "");
        searchField.preferredSize.width = 200;
        searchFields.push(searchField);
        
        var replaceField = row.add("edittext", undefined, "");
        replaceField.preferredSize.width = 200;
        replaceFields.push(replaceField);
    }

    // Trennlinie
    palette.add("panel", undefined, "").preferredSize.height = 2;

    // Optionen
    var optionsGroup = palette.add("group");
    optionsGroup.alignChildren = ["left", "center"];
    var caseSensitive = optionsGroup.add("checkbox", undefined, "Groß-/Kleinschreibung beachten");
    var wholeWord = optionsGroup.add("checkbox", undefined, "Ganzes Wort");

    // Buttons
    var buttonGroup = palette.add("group");
    buttonGroup.alignment = ["right", "top"];
    var clearBtn = buttonGroup.add("button", undefined, "Leeren");
    var replaceBtn = buttonGroup.add("button", undefined, "Ersetzen");

    // Leeren-Button Handler
    clearBtn.onClick = function() {
        for (var i = 0; i < numFields; i++) {
            searchFields[i].text = "";
            replaceFields[i].text = "";
        }
    };

    // Ersetzen-Button Handler
    replaceBtn.onClick = function() {
        // Prüfen ob noch ein Dokument offen ist
        if (app.documents.length === 0) {
            alert("Kein Dokument geöffnet.", "Fehler");
            return;
        }

        var doc = app.activeDocument;
        var totalReplacements = 0;
        var replacementDetails = [];

        // GREP-Optionen zurücksetzen
        app.findGrepPreferences = NothingEnum.nothing;
        app.changeGrepPreferences = NothingEnum.nothing;

        // Alle Felder durchgehen
        for (var i = 0; i < numFields; i++) {
            var searchText = searchFields[i].text;
            var replaceText = replaceFields[i].text;

            // Nur wenn Suchfeld nicht leer ist
            if (searchText !== "") {
                // Sonderzeichen für GREP escapen
                var escapedSearch = escapeGrep(searchText);
                
                // Optionen anwenden
                if (wholeWord.value) {
                    escapedSearch = "\\b" + escapedSearch + "\\b";
                }

                // Case-insensitive Flag wenn nötig
                if (!caseSensitive.value) {
                    escapedSearch = "(?i)" + escapedSearch;
                }

                app.findGrepPreferences.findWhat = escapedSearch;
                app.changeGrepPreferences.changeTo = replaceText;

                var found = doc.changeGrep();
                var count = found.length;
                totalReplacements += count;
                
                if (count > 0) {
                    replacementDetails.push("\"" + searchText + "\" → \"" + replaceText + "\": " + count + "x");
                }

                // Reset für nächste Suche
                app.findGrepPreferences = NothingEnum.nothing;
                app.changeGrepPreferences = NothingEnum.nothing;
            }
        }

        // Ergebnis anzeigen
        var message = "Ersetzungen abgeschlossen!\n\n";
        message += "Gesamt: " + totalReplacements + " Ersetzung(en)\n\n";
        
        if (replacementDetails.length > 0) {
            message += "Details:\n" + replacementDetails.join("\n");
        } else {
            message += "Keine Übereinstimmungen gefunden.";
        }
        
        alert(message, "Ergebnis");
    };

    // Hilfsfunktion: GREP-Sonderzeichen escapen
    function escapeGrep(str) {
        return str.replace(/([\\.\[\]{}()*+?^$|])/g, "\\$1");
    }

    // Palette anzeigen
    palette.show();

})();
