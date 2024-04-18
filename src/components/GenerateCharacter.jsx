import React from "react";
import { Button, Spinner } from "@nextui-org/react";
const GenerateCharacter = ({
  textColor,
  hexColor,
  handleCharacterDescription,
  onLoadCharacter,
  characterDescription,
}) => {
  return (
    <div>
      {onLoadCharacter ? (
        <div>
          <Spinner
            label="Generating character description and image..."
            style={{
              color: hexColor,
            }}
          />
        </div>
      ) : (
        <div>
          {characterDescription.length === 0 ? (
            <div>
              <h1 className="text-2xl font-bold pt-6">
                Click to generate character description and image
              </h1>
              <Button
                type="submit"
                style={{
                  color: textColor,
                  backgroundColor: hexColor,
                }}
                onClick={handleCharacterDescription}
              >
                Generate Character
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GenerateCharacter;
