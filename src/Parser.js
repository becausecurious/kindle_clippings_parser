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

const parseEnglishDateToken = (token) => {
    const REGEXP = /Added on (?<date>.*)/
    let match = token.match(REGEXP)
    if (match === null) {
        return {}
    }
    let raw_date = match.groups.date
    let date = dayjs(raw_date)

    if (date.isValid()) {
        return { date: date }
    }
    return {}
}

const parseGermanDateToken = (token) => {
    const REGEXP = /Hinzugefügt am (?<date>.*)/
    let match = token.match(REGEXP)
    if (match === null) {
        return {}
    }
    let raw_date = match.groups.date
    let date = parseGermanDate(raw_date)

    if (date.isValid()) {
        return { date: date }
    }
    return {}
}

export const parseEnglishLocationToken = (token) => {
    const REGEXP = /([Ll]ocation|Highlight Loc\.) (?<location_start>\d+)(-(?<location_end>\d+))?/
    let match = token.match(REGEXP)
    if (match === null) {
        return {}
    }
    let result = { location_start: match.groups.location_start }
    if (match.groups.location_end) {
        result.location_end = match.groups.location_end
    }
    return result
}

export const parseGermanLocationToken = (token) => {
    const REGEXP = /Markierung Pos. (?<location_start>\d+)(-(?<location_end>\d+))?/
    let match = token.match(REGEXP)
    if (match === null) {
        return {}
    }
    let result = { location_start: match.groups.location_start }
    if (match.groups.location_end) {
        result.location_end = match.groups.location_end
    }
    return result
}

export const parseGermanPageToken = (token) => {
    const REGEXP = /Markierung auf Seite (?<page>\d+)/
    let match = token.match(REGEXP)
    if (match === null) {
        return {}
    }
    return { page: match.groups.page }
}

export const parseGermanPositionToken = (token) => {
    const REGEXP = /(Notiz )?Pos. (?<position>\d+)/
    let match = token.match(REGEXP)
    if (match === null) {
        return {}
    }
    return { position: match.groups.position }
}

let METADATA_TOKEN_PARSERS = [
    parseEnglishDateToken,
    parseGermanDateToken,
    parseEnglishLocationToken,
    parseGermanLocationToken,
    parseGermanPageToken,
    parseGermanPositionToken,
]

export const parseMetadataLine = (line) => {
    // sample line:
    // - Markierung Pos. 9339-41  | Hinzugefügt am Donnerstag, 1. Juli 2021 4.45 Uhr GMT+07:29
    if (line.length > 0 && line[0]) {
        line = line.slice(1)
    }

    var tokens = line.split("|")

    var result = {}

    tokens.forEach(token => {
        METADATA_TOKEN_PARSERS.forEach(parser => {
            result = mergeDicts(result, parser(token.trim()))
        })
    });

    return result
}

const mergeDicts = (a, b) => {
    return Object.assign({}, a, b)
}

export const parseNoteLineBlock = (noteLines) => {
    var parsed = {}

    const FIRST_NOTE_LINE_REGEXP = /(?<title>.*) \((?<author>.*)\)/

    let groups = noteLines[0].match(FIRST_NOTE_LINE_REGEXP).groups
    parsed.title = groups.title
    parsed.author = groups.author

    parsed = mergeDicts(parsed, parseMetadataLine(noteLines[1]))

    parsed.text = noteLines.slice(3).join('\n')

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