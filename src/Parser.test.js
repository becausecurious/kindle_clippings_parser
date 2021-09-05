import { parse, parseGermanDate, parseNoteLineBlock } from './Parser.js'

function readFile(path) {
    var fs = require('fs');
    var data = fs.readFileSync(path, 'utf8');
    return data.toString();
}

test('parse shouldn\'t fail on English', () => {
    let data = readFile('test_data/My Clippings.txt')

    parse(data)
});

test('parse shouldn\'t fail on German', () => {
    let data = readFile('test_data/Meine Clippings.txt')

    parse(data)
});

test('parse german date', () => {
    let d = parseGermanDate("Sonntag, 05. September 2021 11.44 Uhr GMT+02:00")

    expect(d.isValid()).toBe(true);
    expect(d.toISOString()).toBe("2021-09-05T09:44:00.000Z");
});


test('parse another format of first line', () => {
    let lines = [
        "Trügerisches Bild: Ein Auftrag für Spenser (German Edition) (Robert B. Parker)",
        "- Markierung auf Seite 5 | Pos. 19  | Hinzugefügt am Dienstag, 27. Dezember 2011 18.19 Uhr GMT+01:00",
        "",
        "erster Klient des Tages – und der"
    ]

    let note = parseNoteLineBlock(lines)

    expect(note.text).toBe("erster Klient des Tages – und der");
});

test('parse yet another format of first line', () => {
    let lines = [
        "The Magic of Thinking Big (David J. Schwartz)",
        "- Notiz Pos. 167  | Hinzugefügt am Samstag, 12. September 2020 5.17 Uhr GMT+07:29",
        "",
        "BELIEVE YOU CAN SUCCEED AND YOU WILL"
    ]

    let note = parseNoteLineBlock(lines)

    expect(note.text).toBe("BELIEVE YOU CAN SUCCEED AND YOU WILL");
});
