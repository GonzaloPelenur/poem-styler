import React from "react";
import { Button } from "@nextui-org/react";

const GenerateImages = ({ textColor, hexColor, generateAllSceneImages }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold pt-6">Click to generate all images</h1>
      <form onSubmit={(event) => generateAllSceneImages(event)}>
        <Button
          type="submit"
          style={{
            color: textColor,
            backgroundColor: hexColor,
          }}
        >
          Generate
        </Button>
      </form>
    </div>
  );
};

export default GenerateImages;
