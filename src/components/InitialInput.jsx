import React from "react";
import { Input, Button, Spinner, Textarea } from "@nextui-org/react";

const InitialInput = ({
  handleSubmit,
  inputValue,
  handleChange,
  onLoadPoem,
  disablePoem,
}) => {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold pt-6">
          Enter a poem and click submit to style style it
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-between"
        >
          <div style={{ marginRight: "8spx", width: "900px" }}>
            {disablePoem ? (
              <Textarea
                isDisabled
                placeholder="poem"
                description="Enter a Poem"
                value={inputValue}
                onChange={handleChange}
                fullWidth={true}
                disableAnimation
                disableAutosize
                classNames={{
                  base: "max-w-xxl",
                  input: "resize-y min-h-[500px]",
                }}

                // max width
              />
            ) : (
              <div className="flex items-center justify-between">
                <Textarea
                  placeholder="poem"
                  description="Enter a Poem"
                  value={inputValue}
                  onChange={handleChange}
                  fullWidth={true}
                  disableAnimation
                  disableAutosize
                  classNames={{
                    base: "max-w-xxl",
                    input: "resize-y min-h-[500px]",
                  }}

                  // max width
                />
                <Button type="submit">Submit</Button>
              </div>
            )}
          </div>
        </form>
        {onLoadPoem && (
          <div className="flex flex-col items-center justify-between">
            <Spinner label={`Loading`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InitialInput;
