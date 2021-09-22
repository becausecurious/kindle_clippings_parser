import dayjs from 'dayjs';

export const parse = (clippingsTxt) => {

    let noteLineBlocks = splitIntoNoteLineBlocks(clippingsTxt)

    let notes = noteLineBlocks.map(parseNoteLineBlock)

    let groupedNotes = groupBy(notes, "title")

    let books = Object.keys(groupedNotes).map(key => {
        let book_notes = groupedNotes[key]
        let note = book_notes[0]

        let clean_book_notes = book_notes.map(({ title, author, ...keepAttrs }) => keepAttrs)

        return {
            title: note.title,
            author: note.author,
            notes: clean_book_notes
        }
    })

    return books
};

function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
        var key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

function splitIntoNoteLineBlocks(clippingsTxt) {
    const SEPARATOR_LINE = "=========="

    let lines = clippingsTxt.split("\n")

    let blocks = []

    let last_block = []
    for (var i = 0; i < lines.length; ++i) {
        const line = lines[i].replace('\r', '')
        if (line === SEPARATOR_LINE) {
            blocks.push(last_block)
            last_block = []
        } else {
            last_block.push(line)
        }
    }

    return blocks
}


export const parseNoteLineBlock = (noteLines) => {
    const FIRST_NOTE_LINE_REGEXP = /(?<title>.*) \((?<author>.*)\)/

    let groups = noteLines[0].match(FIRST_NOTE_LINE_REGEXP).groups
    const title = groups.title
    const author = groups.author


    const SECOND_EN_NOTE_LINE_REGEXP =
        /- ([Ll]ocation|Highlight Loc\.) (?<location_start>\d+)(-(?<location_end>\d+))? +\| +Added on (?<date>.*)/

    const SECOND_DE_NOTE_LINE_REGEXP =
        /- (Markierung Pos. (?<location_start>\d+)(-(?<location_end>\d+))?)?((Markierung auf Seite (?<page>\d+) \| )?(Notiz )?Pos. (?<position>\d+))? +\| +Hinzugefügt am (?<date>.*)/


    let match = noteLines[1].match(SECOND_EN_NOTE_LINE_REGEXP)

    if (match === null) {
        match = noteLines[1].match(SECOND_DE_NOTE_LINE_REGEXP)
    }

    if (match === null) {
        throw `Can't parse line '${noteLines[1]}' of block '${noteLines.join("\n")}'`
    }
    groups = match.groups

    const location_start = groups.location_start
    const location_end = groups.location_end
    let date = dayjs(groups.date)

    if (!date.isValid()) {
        date = parseGermanDate(groups.date)
    }

    const text = noteLines.slice(3).join('\n')

    const parsed = {
        title: title,
        author: author,
        location_start: location_start,
        location_end: location_end,
        date: date,
        page: groups.page,
        position: groups.position,
        text: text
    }

    return parsed
}

export const parseGermanDate = (date) => {
    var customParseFormat = require('dayjs/plugin/customParseFormat')
    dayjs.extend(customParseFormat)
    require('dayjs/locale/de')

    // Sonntag, 27. September 2020 4.48 Uhr GMT+07:29
    let parsed_date = date.split(', ')[1]
    parsed_date = parsed_date.replace("GMT", "")
    parsed_date = parsed_date.replace("Uhr", "")
    parsed_date = parsed_date.replace(". ", " ")
    parsed_date = parsed_date.replace("  ", " ")
    // 27 September 2020 4.48 +07:29
    // DD MMMM      YYYY H.mm Z
    return dayjs(parsed_date, 'D MMMM YYYY H.mm Z', 'de')
}