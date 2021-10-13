import React from "react";
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';


const NEW_LINE = "\r\n";

export class Books extends React.Component {

    constructor(props) {
        super(props);
        this.exportAll = this.exportAll.bind(this)
    }

    exportAll() {
        let result = ""

        this.props.books.forEach(book => {
            result += `${book.header}` + NEW_LINE + NEW_LINE
            result += convertToString(book, this.props.showTime, this.props.showPosition)
            result += NEW_LINE + NEW_LINE + NEW_LINE
        })

        var blob = new Blob([result],
            { type: "text/plain;charset=utf-8" });

        saveAs(blob, 'notes.txt')
    }


    render() {
        return (
            <div>
                <div className="mt-5 is-flex is-justify-content-center is-align-items-center">
                    <h3 className="is-size-4">Books</h3>
                    <button onClick={this.exportAll} className="ml-3 button is-rounded is-info is-small">Download</button></div>
                <div>
                    {
                        this.props.books?.map(book =>
                        (
                            <div className="conversation-block" >
                                <Book book={book}
                                    showTime={this.props.showTime}
                                    showPosition={this.props.showPosition} />
                            </div>
                        )
                        )
                    }
                </div>
            </div>
        )
    }
}

function convertToString(book, showTime, showPosition) {
    return book?.notes.map(
        note => TxtNote(note, showTime, showPosition)
    ).join(NEW_LINE)
}

class Book extends React.Component {

    constructor(props) {
        super(props);
        this.export = this.export.bind(this)
    }

    export() {
        let conversationString = convertToString(this.props.book,
            this.props.showTime, this.props.showPosition)

        var blob = new Blob([conversationString],
            { type: "text/plain;charset=utf-8" });

        saveAs(blob, `${this.props.book.header} notes.txt`)
    }

    render() {
        return (
            <div className="mt-5 is-flex is-justify-content-center is-align-items-center is-flex-direction-column">
                <div className="mt-5 is-flex is-justify-content-center is-align-items-center">
                    <b>{this.props.book?.header}</b>

                    <button onClick={this.export} className="ml-3 button is-rounded is-info is-small">Download</button>
                </div>

                <div>
                    {
                        this.props.book?.notes.map(note =>
                        (
                            <div>
                                <Note note={note}
                                    showTime={this.props.showTime}
                                    showPosition={this.props.showPosition} />
                            </div>
                        )
                        )
                    }
                </div>
            </div >
        );
    }
}

function timeToString(time) {
    return time.format("L LTS")
}

function Note(props) {

    var localizedFormat = require('dayjs/plugin/localizedFormat')
    dayjs.extend(localizedFormat)

    return (

        < div className="is-flex" >
            <div className="ml-2" style={{ maxWidth: "500px" }}>


                {props.note?.text}

                <span className=" is-size-7">
                    {props.showPosition &&
                        <span className="ml-2">
                            <NotePosition note={props.note} />
                        </span>
                    }
                    {props.showTime && props.note?.date &&
                        <span className="ml-2">
                            {timeToString(props.note?.date)}
                        </span>
                    }
                </span>
            </div>
        </div >
    );
}

function NotePosition(props) {

    return (
        <>
            {props.note.page != null &&
                <>
                    page {props.note?.page}
                </>
            }

            {props.note.position != null &&
                <>
                    position {props.note?.position}
                </>
            }

            {props.note.location_start != null &&
                <>
                    location {props.note?.location_start}

                    {props.note.location_end != null &&
                        <>
                            -{props.note?.location_end}
                        </>
                    }
                </>
            }
        </>
    );
}

function TxtNote(note, showTime, showPosition) {
    var time_block = ""
    if (showTime && note.date) {
        time_block = `${timeToString(note.date)}`
    }

    var position_block = ""
    if (showPosition) {
        if (note.page) {
            position_block += `page ${note.page} `
        }
        if (note.position) {
            position_block += `position ${note.position} `
        }
        if (note.location_start) {
            position_block += `location ${note.location_start}`
            if (note.location_end) {
                position_block += `-${note.location_start}`
            }
        }
    }

    var additional = ""
    if (time_block || position_block) {
        let separator = ""
        if (time_block && position_block) {
            separator = " "
        }

        additional = ` (${position_block}${separator}${time_block})`
    }

    return `${note.text}${additional}`
}