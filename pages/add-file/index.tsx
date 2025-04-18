import React, { useState } from "react";
import { supabase_vector_store } from "@/libs/supabase/supabase_client";

// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf";
// @ts-ignore
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const CHUNK_SIZE = 1000; // characters per chunk

function chunkText(text: string, size: number) {
  // Simple paragraph-based chunking, fallback to character split
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > size && current) {
      chunks.push(current);
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current) chunks.push(current);
  
  console.log(`Created ${chunks.length} chunks`);
  if (chunks.length > 0) {
    console.log(`First chunk size: ${chunks[0].length}`);
    console.log(`Last chunk size: ${chunks[chunks.length - 1].length}`);
  }
  
  return chunks;
}

async function getEmbedding(text: string) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });
  const data = await res.json();
  if (data.data && data.data[0] && data.data[0].embedding) {
    return data.data[0].embedding;
  }
  throw new Error(data.error?.message || "OpenAI embedding failed");
}

// Improved PDF text extraction function
const getPageText = async (page: any) => {
  const tokenizedText = await page.getTextContent();
  
  // Improve text extraction with better spacing handling
  let lastY = null;
  let text = '';
  
  for (const item of tokenizedText.items) {
    if (lastY !== item.transform[5] && lastY !== null) {
      text += '\n'; // Add line break when y-position changes
    }
    text += item.str + ' ';
    lastY = item.transform[5];
  }
  
  return text;
};

const AddFilePage = () => {
  const [fileText, setFileText] = useState<string>("");
  const [manualText, setManualText] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Handles file upload and text extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        try {
            // Use the already imported worker
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let text = "";
            
            setStatus(`Extracting text from ${pdf.numPages} pages...`);
            
            for (let i = 1; i <= pdf.numPages; i++) {
              setStatus(`Processing page ${i} of ${pdf.numPages}...`);
              const page = await pdf.getPage(i);
              text += await getPageText(page) + '\n\n';
            }
            
            console.log(`Total extracted text length: ${text.length} characters`);
            if (text.length > 0) {
              console.log(`First 50 chars: ${text.substring(0, 50)}`);
              console.log(`Last 50 chars: ${text.substring(text.length - 50)}`);
            }
            
            setFileText(text);
            setPreviewText(text.slice(0, 1000) + (text.length > 1000 ? "..." : ""));
            setStatus(`PDF successfully processed. Extracted ${text.length} characters.`);
        } catch (err) {
            console.error("PDF processing error:", err);
            setPreviewText(`Failed to extract PDF text: ${err || "Unknown error"}`);
            setStatus("Error: Failed to process PDF.");
            setFileText("");
        }
        };
        reader.readAsArrayBuffer(file);
    } else if (file.type === "text/plain") {
      const text = await file.text();
      console.log(`TXT file length: ${text.length} characters`);
      setFileText(text);
      setPreviewText(text.slice(0, 1000) + (text.length > 1000 ? "..." : ""));
    } else {
      setPreviewText("Unsupported file type. Please upload a PDF or TXT file.");
      setFileText("");
    }
  };

  // Handles manual text input
  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualText(e.target.value);
    setPreviewText(e.target.value.slice(0, 1000) + (e.target.value.length > 1000 ? "..." : ""));
  };

  // Process and store handler
  const handleProcessAndStore = async () => {
    setStatus("Processing...");
    // Use the full text, not just the preview
    const textToProcess = fileText || manualText;
    
    if (!textToProcess.trim()) {
      setStatus("No text to process.");
      return;
    }
    
    try {
      console.log(`Starting to process ${textToProcess.length} characters of text`);
      const chunks = chunkText(textToProcess, CHUNK_SIZE);
      console.log("Number of chunks:", chunks.length);
      
      let processedChunks = 0;
      for (const chunk of chunks) {
        // Get embedding from OpenAI
        const embedding = await getEmbedding(chunk);
        // Store in Supabase
        const { error } = await supabase_vector_store
          .from("documents_test")
          .insert([
            {
              text: chunk,
              embedding,
              source: fileText ? "file" : "manual",
            },
          ]);
        if (error) throw error;
        
        processedChunks++;
        setStatus(`Processed ${processedChunks} of ${chunks.length} chunks...`);
      }
      setStatus(`Success! Processed and stored ${chunks.length} chunks of text.`);
    } catch (err: any) {
      console.error("Processing error:", err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <h2>Add File or Text</h2>
      <div>
        <label>
          Upload PDF or TXT:
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            style={{ display: "block", margin: "8px 0" }}
          />
        </label>
      </div>
      <div style={{ margin: "16px 0" }}>
        <label>
          Or enter text manually:
          <textarea
            rows={6}
            style={{ width: "100%", marginTop: 8 }}
            value={manualText}
            onChange={handleManualInput}
            placeholder="Type or paste your text here"
          />
        </label>
      </div>
      <div>
        <h4>Preview: <span style={{ fontSize: '0.8em', color: '#666' }}>(First 1000 characters)</span></h4>
        <div
          style={{
            minHeight: 80,
            border: "1px solid #ccc",
            padding: 8,
            background: "#fafafa",
            whiteSpace: "pre-wrap",
          }}
        >
          {previewText}
        </div>
        {(fileText || manualText) && (
          <div style={{ marginTop: 8, fontSize: '0.8em', color: '#666' }}>
            Total text length: {(fileText || manualText).length} characters
          </div>
        )}
      </div>
      <button
        onClick={handleProcessAndStore}
        style={{ marginTop: 24, padding: "8px 20px" }}
        disabled={!(fileText || manualText)}
      >
        Process & Store
      </button>
      <div style={{ marginTop: 16, color: "#444" }}>{status}</div>
    </div>
  );
};

export default AddFilePage;