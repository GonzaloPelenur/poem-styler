import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import sharp from "sharp";
import fs from "fs";
import fetch from "node-fetch";
import OpenAI from "openai";
import path from "path";
import sizeOf from "image-size";
import { type } from "os";
// import {
//   initial_ch_prompt,
//   style,
//   update_character_description,
// } from "../../../utils/prompts.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const model_vision = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

async function generate_story(color) {
  console.log("Generating story");
  const prompt = `'Little ${color["Name"]} Riding Hood' is a spin off picture book story of 'Little Red Riding Hood' where the main character's color is called ${color["Name"]} instead of Red, and has the specific color ${color["Name"]}. The story is written for kids. Create a script for this picture book, following the previous description. Return a list of paragraphs, each corresponding to one page of the picture book. Write 5 pages. Be creative, the story is based on 'Little Red Riding Hood’, but the setting of the story can be anywhere, it doesn’t have to be in a forest, choose an appropriate and creative setting based on the color name. Limit your answer to 5 pages.`;
  const result = await model.generateContent(prompt, safetySettings);
  const response = await result.response;
  const text = response.text();
  var pages = [];
  for (let content of text.split("\n")) {
    if (content.length > 0 && !content.includes("*")) {
      pages.push(content);
    }
  }
  // console.log(pages);
  console.log("Story generated");
  return pages;
}

async function downloadImage(imageURL, storyPath, imageName) {
  try {
    const response = await fetch(imageURL);
    if (!response.ok)
      throw new Error(`Failed to fetch ${imageURL}: ${response.statusText}`);

    const imagePath = path.join(storyPath, imageName);
    // console.log("AAAAAAAAAAAAAA");
    console.log(storyPath);
    console.log(`Downloading image to ${imagePath}`);
    const stream = fs.createWriteStream(imagePath);
    response.body.pipe(stream);

    return new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to download image:", error);
  }
}

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function generate_character_description(pages, color, storyPath) {
  console.log(color);
  console.log(color["Name"]);
  console.log("---------------------------");
  console.log("Generating character description");
  const pages_str = pages.join(" ");
  const style = `Create an image for a children’s picture book in the style of Bruno Munari. The drawing style of the image should be simple and hand drawn with pencil. It is, characterized by its use of bold outlines, a simple and muted color scheme centered around the color of '${color["Name"]}', and textural patterns that impart depth. Avoid using many colors. Create simple aesthetic that is appealing in children's literature.`;
  const initial_ch_prompt = `Write a detailed description of the physical appearance of the character 'Little ${color["Name"]} Riding Hood' for a picture book. The character should be wearing a hooded cloak in the specific color ${color["Name"]}, emphasize that the hood should be of that color. The character should be a child. The description should be detailed and include the character's hair color, eye color, clothing style, clothes color, and everything else that is relevant to the character's appearance. Do not use many colors apart from the color ${color["Name"]}. Make your description concise and detailed only in the physical aspects. Do not mention anything other than the physical appearance of the character. Make the style look simple and easy to replicate. Limit your answer to 150 words.`;
  var prompt = `${initial_ch_prompt}. Any information you might need to know about the character is in the story: '${pages_str}'.`;
  const res = await model.generateContent(prompt);
  console.log(res);
  var description = res.response.text();
  var image_prompt = `Create an image of 'Little ${color["Name"]} Riding Hood' for a children's picture book in the following style: '${style}'. Here is a detailed description of the character: '${description}'. Do NOT add text in the image.`;
  image_prompt +=
    " I NEED to test how the tool workswith this EXACT prompt. DO NOT add any detail, just use it AS-IS";
  console.log("Generating image for character description");
  console.log("Image prompt:");
  console.log(image_prompt);
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: image_prompt,
    size: "1792x1024",
    style: "natural",
    quality: "standard",
    n: 1,
  });
  console.log(response);
  const imageURL = response.data[0].url;
  await downloadImage(imageURL, storyPath, "/image-0.png");
  const imagePath = path.join(storyPath, "/image-0.png");
  description = await updateCharacterDescription(imagePath, color);
  const base64Image = fs.readFileSync(imagePath).toString("base64");
  console.log("Character description generated");
  console.log("---------------------------");
  return { description: description, image: base64Image };
}

async function updateCharacterDescription(imagePath, color) {
  try {
    // Load the image
    const imageBuffer = fs.readFileSync(imagePath);
    const dimensions = sizeOf(imageBuffer);

    // Resize the image to 50% of the original using sharp
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize({
        width: Math.round(dimensions.width * 0.5),
        height: Math.round(dimensions.height * 0.5),
      })
      .toBuffer();

    // Save the resized image
    const newImagePath = imagePath.split(".")[0] + "-resized.png";
    fs.writeFileSync(newImagePath, resizedImageBuffer);

    // Prepare data for Gemini API request
    const imageParts = [fileToGenerativePart(newImagePath, "image/png")];

    // Make request to Gemini API
    const update_character_description = `In the image provided there is character named 'Little ${color["Name"]} Riding Hood' wearing a hood. The character should a child wearing a hooded cloak in the specific color ${color["Name"]}.  Describe the style of that character in detail. The description should be detailed and include the character's racial features, skin color, height, hair color, eye color, clothing style, clothes color, and everything else that is relevant to the character's appearance. Be very specific about physical details, do not use abstract concepts. Talk about the color scheme, the texture, the line work, and the overall feel of the character. Write your answer in 100 words.`;
    const result = await model_vision.generateContent([
      update_character_description,
      ...imageParts,
    ]);

    // Process Gemini API response
    const response = await result.response;
    const description = response.text();
    console.log(description);

    return description;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function generate_scene_description(page, style) {
  const prompt = `Imagine the following scene as a picture book illustration: '${page}'. Write a detailed visual description of the scene. Don't write about the story, only the setting, what does the scene look like? Talk about the colors, characters, objects, and the overall feel of the scene. Be as detailed as possible. Describe any details that you would need to know to recreate the scene without looking at it. Limit your answer to 150 words. The scene should follow this style: ${style}.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const description = response.text();
  return description;
}
/* 
print("---------------------------")
    print(f"Generating image for page: {num}")
    scene_description = get_scene_decritpion(page, style)
    image_prompt = "Use the seed 12345 "
    if len(gen_id) > 0:
        image_prompt += f" and use the Gen ID {gen_id} "
    image_prompt += f"to create an image following style: '{style}'. This is the scene description: '{scene_description}'. Here is a detailed description of the character: '{character_description}'. Do NOT add text in the image. Remember to use the specific color '{color['Name']}'. Leave a blank space in one of the corners of the image."
    image_prompt += " I NEED to test how the tool workswith this EXACT prompt. DO NOT add any detail, just use it AS-IS"
    print("Image Prompt: ")
    print(image_prompt)
    response = client.images.generate(
        model="dall-e-3",
        prompt=image_prompt,
        size="1792x1024",
        style="natural",
        quality="standard",
        n=1,
    )
    image_url = response.data[0].url
    # print(f"Image URL: {image_url}")
    im = Image.open(requests.get(image_url, stream=True).raw)

    print(f"Image URL: {image_url}") 
    gen_id = get_gen_id(image_url)
    image_url = save_name+f"image-{num}.png"
    im.save(image_url)
    print(f"Finished generating image for page: {num}")
    print("---------------------------")
    return (image_url, gen_id)
*/
async function generate_scene_image(
  page,
  characterDescription,
  num,
  style,
  storyPath,
  color,
  genID = ""
) {
  console.log("---------------------------");
  console.log(`Generating image for page: ${num}`);
  if (style.length === 0) {
    style = `Create an image for a children’s picture book in the style of Bruno Munari. The drawing style of the image should be simple and hand drawn with pencil. It is, characterized by its use of bold outlines, a simple and muted color scheme centered around the color of '${color["Name"]}', and textural patterns that impart depth. Avoid using many colors. Create simple aesthetic that is appealing in children's literature.`;
  }
  const sceneDescription = await generate_scene_description(page, style);
  var imagePrompt = `Use the seed 12345 `;
  if (genID.length > 0) {
    imagePrompt += ` and use the Gen ID ${genID} `;
  }
  imagePrompt += `to create an image following style: '${style}'. This is the scene description: '${sceneDescription}'. Here is a detailed description of the character: '${characterDescription}'. Do NOT add text in the image. Remember to use the specific color '${color["Name"]}'. Leave a blank space in one of the corners of the image.`;
  imagePrompt +=
    " I NEED to test how the tool workswith this EXACT prompt. DO NOT add any detail, just use it AS-IS";
  console.log("Image Prompt: ");
  console.log(imagePrompt);
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: imagePrompt,
    size: "1792x1024",
    style: "natural",
    quality: "standard",
    n: 1,
  });
  const imageURL = response.data[0].url;
  const imagePath = path.join(storyPath, `/image-${num}.png`);
  await downloadImage(imageURL, storyPath, `/image-${num}.png`);
  console.log(`Finished generating image for page: ${num}`);
  console.log("---------------------------");
  const base64Image = fs.readFileSync(imagePath).toString("base64");
  return { image: base64Image };
}

async function generate_bg_image(poem, storyPath) {
  console.log("Generating background image");
  const prompt = `Create a background image for the following poem: ${poem}. Your design should be simple, using light colors, and should have patterns related to the poem`;
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    size: "1792x1024",
    style: "natural",
    quality: "standard",
    n: 1,
  });
  const imageURL = response.data[0].url;
  await downloadImage(imageURL, storyPath, "/background.png");
  const imagePath = path.join(storyPath, "/background.png");
  const base64Image = fs.readFileSync(imagePath).toString("base64");
  console.log("Background image generated");
  return { image: base64Image };
}

function validateRefrainLengths(poem) {
  // Iterate through each stanza in the poem
  for (let stanza of poem.poem.structure.stanza) {
    // Check if the length of the refrain array matches lines_number
    console.log(stanza);
    console.log(stanza.refrain.length);
    if (stanza.refrain.length !== stanza.lines_number) {
      return false; // Return false if they don't match
    }
  }
  // Return true if all stanzas have matching refrain lengths and lines_number
  return true;
}

async function get_poem_structure(poem) {
  console.log("Getting poem structure");
  const messages = [
    {
      role: "user",
      content: poem,
    },
  ];
  const functions = [
    {
      name: "get_poem_structure",
      description:
        "Get the structure of a poem in json format. Return a json object containing the title, author, and structure of the poem. The structure object should cointain stanza_number, lines_number, lines with all the lines that are not refrains separeted in a lis, refrains with all the remaining lines that are refrains. Maintain all original formatting including indentation and spacing to accurately reflect the poem's structure",
      parameters: {
        type: "object",
        properties: {
          poem: {
            type: "object",
            description: "object that contains all the information of the poem",
            properties: {
              title: {
                type: "string",
                description: "title of the poem",
              },
              author: {
                type: "string",
                description: "author of the poem",
              },
              rhyme_scheme: {
                type: "string",
                description: "rhyme scheme of the poem",
              },
              total_amount_of_lines: {
                type: "number",
                description: "total amount of lines in the poem",
              },
              structure: {
                type: "object",
                description: "object that contains the structure of the poem",
                properties: {
                  total_stanzas: {
                    type: "number",
                    description: "total number of stanzas in the poem",
                  },
                  stanza: {
                    type: "array",
                    description:
                      "array that contains the structure of each stanza",
                    items: {
                      stanza_number: {
                        type: "integer",
                        description: "index of current stanza in the poem",
                      },
                      lines_number: {
                        type: "integer",
                        description: "number of lines in the stanza",
                      },
                      lines: {
                        type: "array",
                        description:
                          "list of lines of the stanza of the poem. A line is defined to be all text between two line breaks. Include ALL lines in the stanza, including blank lines",
                        items: {
                          type: "string",
                          description: "line of the stanza",
                        },
                      },
                      refrains: {
                        type: "array",
                        description:
                          "list of lines of the stanza that are refrains. A refrain is defined to be all text between two line breaks that is a line, phrase, or word that is repeated in a poem to create emphasis, rhythm, or drama.",
                        items: {
                          type: "string",
                          description: "refrain of the stanza",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: messages,
    functions: functions,
    function_call: { name: "get_poem_structure" }, // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message.function_call.arguments;
  console.log("Response message:");
  console.log(responseMessage);
  const poemObject = JSON.parse(responseMessage);
  console.log(poemObject);

  console.log("Poem structure retrieved");
  return poemObject;
}

export async function POST(request) {
  console.log("GEMINI API POST request received!");
  const params = await request.json();
  let res = {};
  let maxRetries = 3; // Maximum number of retries

  async function withRetry(operation) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.log(`Attempt ${attempt} failed with error: ${error.message}`);
        if (attempt === maxRetries) throw error;
      }
    }
  }

  if (params.type === "generate_story") {
    console.log("Received generate_story request");
    console.log(params.color);
    // Wrap the operation in a retry mechanism
    const pages = await withRetry(() => generate_story(params.color));
    res = { result: pages };
  }
  if (params.type === "generate_character") {
    console.log("Received generate_character request");
    // Wrap the operation in a retry mechanism
    const result = await withRetry(() =>
      generate_character_description(
        params.pages,
        params.color,
        params.storyPath
      )
    );
    res = { result: result };
  }
  if (params.type === "generate_scene_image") {
    console.log("Received generate_scene request");
    // Wrap the operation in a retry mechanism
    const result = await withRetry(() =>
      generate_scene_image(
        params.page,
        params.characterDescription,
        params.num,
        params.style,
        params.storyPath,
        params.color,
        params.genID
      )
    );
    res = { result: result };
  }
  if (params.type === "generate_bg_image") {
    console.log("Received generate_bg_image request");
    // Wrap the operation in a retry mechanism
    const result = await withRetry(() =>
      generate_bg_image(params.poem, params.storyPath)
    );
    res = { result: result };
  }
  if (params.type === "get_poem_structure") {
    console.log("Received get_poem_structure request");
    // Wrap the operation in a retry mechanism
    const result = await withRetry(() => get_poem_structure(params.poem));
    res = { result: result };
  }
  console.log("GEMINI API POST request completed!");
  return NextResponse.json(res);
}
