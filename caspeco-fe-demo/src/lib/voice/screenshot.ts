import html2canvas from "html2canvas";

export async function captureScreenshot(elementId: string = "main-content"): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    // Calculate scale to produce ~720px wide output directly
    const targetWidth = 720;
    const scale = Math.min(0.5, targetWidth / element.offsetWidth);

    const canvas = await html2canvas(element, {
      backgroundColor: "#1a1f2e",
      scale,
      logging: false,
    });

    return canvas.toDataURL("image/jpeg", 0.7);
  } catch (err) {
    console.error("Screenshot capture failed:", err);
    return null;
  }
}

export function sendScreenshotToDataChannel(dc: RTCDataChannel, imageData: string, triggerResponse: boolean = false) {
  const base64 = imageData.replace(/^data:image\/jpeg;base64,/, "");
  const event = {
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_image",
          image: base64,
        },
      ],
    },
  };
  dc.send(JSON.stringify(event));
  if (triggerResponse) {
    dc.send(JSON.stringify({ type: "response.create" }));
  }
}
