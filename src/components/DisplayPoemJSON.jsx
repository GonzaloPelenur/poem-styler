import React from "react";
console.log("DisplayPoemJSON.jsx");
const DisplayPoemJSON = ({ poem }) => {
  console.log("DisplayPoemJSON.jsx poem", poem);
  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <h1>Poem Structure</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          backgroundColor: "white",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        {JSON.stringify(poem, null, 2)}
      </pre>
    </div>
  );
};

export default DisplayPoemJSON;
