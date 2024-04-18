import React from "react";
import "./Poem.css"; // Importing the CSS file

const Poem = ({ poemData }) => {
  const renderSpaces = (line, count) => {
    return `${"&nbsp;".repeat(count)}${line}`;
  };

  return (
    <div className="poem-container">
      <h1 className="title">{poemData.title}</h1>
      <h2 className="author">By {poemData.author}</h2>
      {poemData.structure.stanza.map((stanza, index) => (
        <div key={index} className="stanza">
          <div>
            {stanza.lines.map((line, lineIndex) => (
              <p key={lineIndex} className="line">
                {line}
              </p>
            ))}
          </div>
          <div>
            {stanza.refrains.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className="refrain"
                dangerouslySetInnerHTML={{
                  __html: renderSpaces(`${line}`, 4 * (lineIndex + 1)),
                }}
              ></p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Poem;
