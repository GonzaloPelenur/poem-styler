"use client";
import { useState, useEffect } from "react";
import * as React from "react";
import InitialInput from "@/components/InitialInput";
import DisplayPoemJSON from "@/components/DisplayPoemJSON";
import Poem from "@/components/Poem";
// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";

async function createDirectory() {
  try {
    const response = await fetch("/api/utils", { method: "POST" });
    if (response.ok) {
      const data = await response.json();
      console.log("Directory created at:", data.path);
      return data.path;
    } else {
      console.error("Failed to create directory:", response.statusText);
    }
  } catch (error) {
    console.error("Error creating directory:", error);
  }
}

async function generate_bg_image(poem, storyPath) {
  try {
    const response = await fetch("api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poem: poem,
        type: "generate_bg_image",
        storyPath: storyPath,
      }),
    });
    console.log(response);
    console.log(response.status);
    if (response.status === 200) {
      console.log("API request successful!");
      const data = await response.json();
      console.log(data);
      return data.result;
    } else {
      console.error("API request failed");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function get_poem_structure(poem) {
  try {
    const response = await fetch("api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "get_poem_structure",
        poem: poem,
      }),
    });
    console.log(response);
    console.log(response.status);
    if (response.status === 200) {
      console.log("API request successful!");
      const data = await response.json();
      console.log(data);
      return data.result;
    } else {
      console.error("API request failed");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [poem, setPoem] = useState("");
  const [onLoadPoem, setOnLoadPoem] = useState(false);
  const [disablePoem, setDisablePoem] = useState(false);

  useEffect(() => {
    // Assuming backgroundImage is the base64 encoded string
    const base64ImageURI = `data:image/png;base64,${backgroundImage}`;

    // Create the background layer
    const bgLayer = document.createElement("div");
    bgLayer.style.position = "fixed";
    bgLayer.style.top = "0";
    bgLayer.style.left = "0";
    bgLayer.style.width = "100%";
    bgLayer.style.height = "100%";
    bgLayer.style.background = `url('${base64ImageURI}') no-repeat center center fixed`;
    bgLayer.style.backgroundSize = "cover";
    bgLayer.style.zIndex = "-2"; // Ensure it's below the white overlay

    // Create the white overlay layer
    const whiteOverlay = document.createElement("div");
    whiteOverlay.style.position = "fixed";
    whiteOverlay.style.top = "0";
    whiteOverlay.style.left = "0";
    whiteOverlay.style.width = "100%";
    whiteOverlay.style.height = "100%";
    whiteOverlay.style.backgroundColor = "rgba(255,255,255,0.7)"; // White with 70% opacity
    whiteOverlay.style.zIndex = "-1"; // Above the image, below the content

    // Append both layers to the body
    document.body.appendChild(bgLayer);
    document.body.appendChild(whiteOverlay);

    // Ensure the body's background is transparent so layers show through
    document.body.style.backgroundColor = "transparent";

    // Cleanup function to remove layers when component unmounts or backgroundImage changes
    return () => {
      document.body.removeChild(bgLayer);
      document.body.removeChild(whiteOverlay);
      document.body.style.background = "";
      document.body.style.backgroundColor = "";
    };
  }, [backgroundImage]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };
  const changeBgImage = async (poem, storyPath) => {
    const res = await generate_bg_image(poem, storyPath);
    console.log(res);
    setBackgroundImage(res.image);
  };
  const poemSubmit = async (event) => {
    event.preventDefault();
    setOnLoadPoem(true);
    setDisablePoem(true);
    const story_path = await createDirectory();
    changeBgImage(inputValue, story_path);
    const res = await get_poem_structure(inputValue);
    setPoem(res.poem);
    setOnLoadPoem(false);
    console.log(res);
  };

  return (
    <NextUIProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <div className="flex flex-col items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-5xl font-bold">Poem Styler</h1>
            </div>
            <div className="flex flex-col items-center justify-between">
              <InitialInput
                handleSubmit={poemSubmit}
                inputValue={inputValue}
                handleChange={handleChange}
                onLoadPoem={onLoadPoem}
                disablePoem={disablePoem}
              />
              {/* if disablePoem is true and onLoadPoem is false, DisplayPoemJSON */}
              {disablePoem && !onLoadPoem && (
                <div className="flex flex-col items-center justify-between space-y-7">
                  <DisplayPoemJSON poem={poem} />
                  <Poem poemData={poem} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </NextUIProvider>
  );
}
