import { createNextStorySubdirectory } from "../../../utils/utils.js";
import { NextResponse } from "next/server";

export async function POST(req) {
  var res = {};
  try {
    const newDirectoryPath = createNextStorySubdirectory();
    res = { message: "Directory created", path: newDirectoryPath };
  } catch (error) {
    console.error("Error creating directory:", error);
    res = { error: "Failed to create directory" };
  }
  return NextResponse.json(res);
}
