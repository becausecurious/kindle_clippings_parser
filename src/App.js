import './bulma.min.css';
import './App.css';
import React from "react";

import { parse } from './Parser.js'

import { Books } from './Books.js'
import Checkbox from "./Checkbox.js";

import sample_de from './samples/Meine Clippings.txt'
import sample_en from './samples/My Clippings.txt'


class App extends React.Component {

  constructor(props) {
    super(props);
    this.handleFile = this.handleFile.bind(this)
    this.reset = this.reset.bind(this)

    this.state = {
      processedNotes: null,
      filename: null,
      showTime: false,
      showPosition: false,
    }
  }


  handleFile(e) {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)

      let data = parse(text)
      this.setState({ processedNotes: data })

    };
    const file = e.target.files[0]
    reader.readAsText(file)

    this.setState({ filename: file.name })
  }

  reset() {
    this.setState({ processedNotes: null, filename: null })
  }

  createStateCheckbox = (label, param) => (
    <Checkbox
      label={label}
      param={param}
      isSelected={this.state[param]}
      onCheckboxChange={this.handleCheckboxChange}
      key={param}
    />
  );

  handleCheckboxChange = changeEvent => {
    const { name } = changeEvent.target;

    this.setState({ [name]: !this.state[name] })
  };

  render() {
    return (
      <div className="App" >

        <h1 className="title">
          Kindle Clippings Parser
        </h1>

        {
          this.state.processedNotes === null &&
          <div className="is-flex is-justify-content-center">
            <div style={{ maxWidth: "500px" }}>
              <h2 className="subtitle mt-4 mb-2">
                What is this?
              </h2>

              <p>
                When you highlight something on your Kindle,
                it goes into <code>My Clippings.txt</code> file and it is not grouped by a book:



                <div className="is-size-7" style={{ wordBreak: "break-all" }}>

                </div>
              </p>

              <div className="my-code is-size-7">
                {`Essays (Paul Graham)
- Highlight Loc. 15620-21  | Added on Sunday, September 05, 2021, 04:39 PM

124 Apple's Mistake
==========
The Magic of Thinking Big (David J. Schwartz)
- Highlight Loc. 3717  | Added on Sunday, September 05, 2021, 04:40 PM

Managed solitude pays off.
==========
The Magic of Thinking Big (David J. Schwartz)
- Highlight Loc. 3722  | Added on Sunday, September 05, 2021, 04:40 PM

Resolve now to set aside some time each day (at least thirty minutes) to be completely by yourself.
==========
Essays (Paul Graham)
- Highlight Loc. 15622-23  | Added on Sunday, September 05, 2021, 04:41 PM

I don't think Apple realizes how badly the App Store approval process is broken. Or rather, I don't think they realize how much it matters that it's broken.
==========`}
              </div>

              <p className="mt-2">
                This app converts that to

                <div className="my-code is-size-7">
                  {`"Essays" by Paul Graham

124 Apple's Mistake
I don't think Apple realizes how badly the App Store approval process is broken. Or rather, I don't think they realize how much it matters that it's broken.


"The Magic of Thinking Big" by David J. Schwartz

Managed solitude pays off.
Resolve now to set aside some time each day (at least thirty minutes) to be completely by yourself.`}
                </div>
              </p>
              <h2 className="subtitle mt-4 mb-2">
                How to use this?
              </h2>

              <ol className="mt-2">
                <li style={{ listStylePosition: "inside" }}>
                  Connect your Kindle via USB</li>
                <li style={{ listStylePosition: "inside" }}>
                  Go to Documents folder</li>
                <li style={{ listStylePosition: "inside" }}>
                  <div className="is-inline-flex is-justify-content-center">
                    <label className="file-label">
                      <input className="file-input" type="file" onChange={(e) => this.handleFile(e)} />
                      <span className={`button is-primary is-rounded ${this.state.filename ? 'is-loading' : ''} `}>
                        <span className="file-label ">
                          Choose My Clippings.txt
                        </span>
                      </span>
                    </label>
                  </div>
                </li>
              </ol>

              <h2 className="subtitle mt-4 mb-2">
                Wait, will you get all my notes ?
              </h2>
              No, this app does not upload your notes, it just works locally on your computer.
              To be sure you can turn off your Internet after opening this page :)

              <h2 className="subtitle mt-4 mb-2">
                Does this work for a Kindle in other languages?
              </h2>
              This works for German (look for <code>Meine Clippings.txt</code> file).

              <h2 className="subtitle mt-4 mb-2">
                Can I try it out?
              </h2>
              Of course, here are the samples: <a href={sample_en} download>
                My Clippings.txt (English Kindle)</a>, <a href={sample_de} download>
                Meine Clippings.tx (German Kindle)</a>.

              <h2 className="subtitle mt-4 mb-2">
                How can I reach out to you?
              </h2>

              <a href="https://becausecurious.me/contact">https://becausecurious.me/contact</a>

            </div>
          </div>
        }



        {
          this.state.processedNotes != null &&
          <>
            <div className="mt-6 is-flex is-justify-content-center is-align-items-center">
              <h2 className="is-size-3">File: {this.state.filename}
              </h2>
              <button onClick={this.reset} className=" ml-3 button is-rounded is-danger is-outlined">Reset</button>
            </div>
            <div>
              Show:
              <span className="m-2">
                {this.createStateCheckbox('time', "showTime")},
              </span>
              {this.createStateCheckbox('position', "showPosition")}
            </div>
            <Books books={this.state.processedNotes}
              showTime={this.state.showTime}
              showPosition={this.state.showPosition} />
          </>
        }
      </div >
    );
  }
}

export default App;
