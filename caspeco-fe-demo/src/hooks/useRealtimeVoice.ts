"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createWebRTCSession, closeSession, type WebRTCSession } from "@/lib/voice/webrtc";
import { toolDefinitions, executeAddProduct, executeGetPageHelp, executeNavigate, executeHighlight, executeHighlightByText, executeApplyFilter } from "@/lib/voice/tools";
import { captureScreenshot, sendScreenshotToDataChannel } from "@/lib/voice/screenshot";
import type { ViewId } from "@/lib/constants";
import type { Product } from "@/data/products";

export type VoiceState = "idle" | "connecting" | "connected" | "ai-speaking" | "user-speaking" | "disabled";

export interface TranscriptEntry {
  role: "user" | "assistant" | "system";
  text: string;
}

interface UseRealtimeVoiceProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  onAddProduct?: (product: Product) => void;
  onApplyFilter?: (view: string, filterType: string, value: string) => void;
  onSendToKB?: (question: string) => void;
}

export function useRealtimeVoice({ currentView, onNavigate, onAddProduct, onApplyFilter, onSendToKB }: UseRealtimeVoiceProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const sessionRef = useRef<WebRTCSession | null>(null);
  const prevViewRef = useRef<ViewId>(currentView);

  // Use refs for callbacks to avoid stale closures in WebRTC event handlers
  const onNavigateRef = useRef(onNavigate);
  const onAddProductRef = useRef(onAddProduct);
  const onApplyFilterRef = useRef(onApplyFilter);
  const onSendToKBRef = useRef(onSendToKB);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);
  useEffect(() => { onAddProductRef.current = onAddProduct; }, [onAddProduct]);
  useEffect(() => { onApplyFilterRef.current = onApplyFilter; }, [onApplyFilter]);
  useEffect(() => { onSendToKBRef.current = onSendToKB; }, [onSendToKB]);

  const addTranscript = useCallback((role: "user" | "assistant" | "system", text: string) => {
    setTranscript((prev) => [...prev, { role, text }]);
  }, []);

  const sendToolResult = useCallback((callId: string, result: string) => {
    const dc = sessionRef.current?.dc;
    if (!dc || dc.readyState !== "open") return;

    dc.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: result,
      },
    }));
    dc.send(JSON.stringify({ type: "response.create" }));
  }, []);

  const sendToolResultWithScreenshot = useCallback(async (callId: string, result: string) => {
    const dc = sessionRef.current?.dc;
    if (!dc || dc.readyState !== "open") return;

    dc.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: result,
      },
    }));

    // Capture and send screenshot (without triggering response) before creating the response
    const img = await captureScreenshot();
    if (img && dc.readyState === "open") {
      sendScreenshotToDataChannel(dc, img, false);
    }

    dc.send(JSON.stringify({ type: "response.create" }));
  }, []);

  const handleToolCall = useCallback((name: string, args: string, callId: string) => {
    try {
      const parsed = JSON.parse(args);

      switch (name) {
        case "navigate_to_page": {
          const result = executeNavigate(parsed.page, onNavigateRef.current);
          addTranscript("system", `→ Navigating to ${parsed.page}`);
          sendToolResultWithScreenshot(callId, JSON.stringify(result));
          break;
        }
        case "add_product_to_order": {
          const result = executeAddProduct(parsed.product_name);
          if (result.success && result.data?.product && onAddProductRef.current) {
            onAddProductRef.current(result.data.product);
            addTranscript("system", `→ Added ${result.data.product.name}`);
          } else if (!result.success) {
            addTranscript("system", `→ Could not find: ${parsed.product_name}`);
          }
          sendToolResultWithScreenshot(callId, JSON.stringify(result));
          break;
        }
        case "get_page_help": {
          const result = executeGetPageHelp(parsed.page);
          sendToolResultWithScreenshot(callId, JSON.stringify(result));
          break;
        }
        case "explain_current_screen": {
          addTranscript("system", "→ Capturing screenshot...");
          captureScreenshot().then((img) => {
            const dc = sessionRef.current?.dc;
            if (img && dc && dc.readyState === "open") {
              // This tool explicitly sends screenshot + triggers response
              sendScreenshotToDataChannel(dc, img, true);
            }
            sendToolResult(callId, JSON.stringify({ success: true, data: { screenshot_sent: !!img } }));
          });
          break;
        }
        case "highlight_element": {
          executeHighlight(parsed.target, parsed.label).then((result) => {
            if (result.success) {
              addTranscript("system", `→ Highlighting ${parsed.target}${parsed.label ? `: "${parsed.label}"` : ""}`);
            }
            sendToolResultWithScreenshot(callId, JSON.stringify(result));
          }).catch((err) => {
            console.error("Highlight error:", err);
            sendToolResult(callId, JSON.stringify({ success: false, error: "Highlight failed" }));
          });
          break;
        }
        case "highlight_by_text": {
          executeHighlightByText(parsed.text, parsed.label).then((result) => {
            if (result.success) {
              addTranscript("system", `→ Highlighting text "${parsed.text}"${parsed.label ? `: "${parsed.label}"` : ""}`);
            }
            sendToolResultWithScreenshot(callId, JSON.stringify(result));
          }).catch((err) => {
            console.error("Highlight by text error:", err);
            sendToolResult(callId, JSON.stringify({ success: false, error: "Highlight by text failed" }));
          });
          break;
        }
        case "send_to_knowledge_base": {
          if (onSendToKBRef.current) {
            onSendToKBRef.current(parsed.question);
            addTranscript("system", `→ Sent to Knowledge Base: "${parsed.question}"`);
            // Delay screenshot to let KB view render
            setTimeout(() => {
              sendToolResultWithScreenshot(callId, JSON.stringify({ success: true, data: { question: parsed.question, navigated_to: "kb" } }));
            }, 1000);
          } else {
            sendToolResult(callId, JSON.stringify({ success: false, error: "KB not available" }));
          }
          break;
        }
        case "apply_filter": {
          if (onApplyFilterRef.current) {
            const result = executeApplyFilter(parsed.view, parsed.filter_type, parsed.value, onApplyFilterRef.current);
            addTranscript("system", `→ Filter: ${parsed.filter_type} = ${parsed.value}`);
            sendToolResultWithScreenshot(callId, JSON.stringify(result));
          } else {
            sendToolResult(callId, JSON.stringify({ success: false, error: "Filter not available" }));
          }
          break;
        }
      }
    } catch (err) {
      console.error("Tool call error:", err);
      sendToolResult(callId, JSON.stringify({ success: false, error: "Tool execution failed" }));
    }
  }, [addTranscript, sendToolResult, sendToolResultWithScreenshot]);

  const toggleMute = useCallback(() => {
    const track = sessionRef.current?.localStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }, []);

  const endSession = useCallback(() => {
    if (sessionRef.current) {
      closeSession(sessionRef.current);
      sessionRef.current = null;
    }
    setState("idle");
    setIsMuted(false);
  }, []);

  const startSession = useCallback(async () => {
    setState("connecting");
    addTranscript("system", "Connecting to voice assistant...");

    try {
      const tokenRes = await fetch("/api/realtime/token", { method: "POST" });
      if (!tokenRes.ok) {
        addTranscript("system", "Could not connect — API key missing or service unavailable.");
        setState("disabled");
        return;
      }

      const { client_secret } = await tokenRes.json();
      const session = await createWebRTCSession(client_secret);
      sessionRef.current = session;

      session.dc.onopen = () => {
        setState("connected");
        addTranscript("system", "Connected! Start speaking...");

        session.dc.send(JSON.stringify({
          type: "session.update",
          session: {
            instructions: `You are a support agent screen-sharing with the user in Caspeco's restaurant management system. You always see what the user sees via screenshots sent automatically. Always respond in English with voice.

You behave like a real support agent in a screen-sharing session:
- You SEE what's displayed on screen via screenshots
- You TALK about what you see and describe it naturally
- You POINT at things using the highlight tools (highlight_element and highlight_by_text)
- You DO NOT navigate for the user — if they need to switch views, tell them where to find it (e.g. "Click on Sales in the menu on the left")
- Exception: If the user explicitly asks you to navigate ("take me to the POS", "open the schedule") — then you may use navigate_to_page
- When the user switches views, you get a new screenshot automatically. ALWAYS confirm they found the right place: "Perfect, I can see you're on the Sales view now!" or "Yes, this is the right place — here you can see..." and then continue guiding.

Talk about what you point at as if you're pointing at the screen: "See this number?", "Look up here in the top right", "This row shows..."
- NEVER mention tool names or that you are "highlighting" / "marking" / "pointing at". Use the tools silently in the background. Instead talk about the CONTENT: "See this?" "Here's the total" "Look at that row". The user should feel like you're pointing naturally, not running commands.

You can:
- Highlight predefined UI elements with highlight_element
- Highlight any visible text with highlight_by_text (for specific values, product names, numbers)
- Filter data with apply_filter (e.g. filter sales by category)
- Add products to the POS order with add_product_to_order
- Describe the screen with explain_current_screen
- Get help about a view with get_page_help
- Navigate ONLY if the user explicitly asks with navigate_to_page
- Hand off questions to the Knowledge Base with send_to_knowledge_base when you don't know the answer

IMPORTANT: If the user asks a question about Caspeco's products, configuration, troubleshooting, or anything you're not sure about — DO NOT guess or make things up. Instead, say something like "Great question! Let me look that up for you in the Knowledge Base" and use send_to_knowledge_base with their question. The KB will open with the answer automatically.

Common support questions and how to handle them:

1. "How can I get a report on what was sold today?"
→ If the user is not on the Sales view, say "Go to Sales in the menu on the left". When they're there: point at sales-tabs ("The Daily Report shows the summary") → Point at category-chart ("Category breakdown") → Point at sales-total ("Today's total")

2. "How do I filter to see how many beers we sold today?"
→ If the user is not on the Sales view, say "You'll find that under Sales in the menu". When they're there: point at category-filter ("Filter by category") → apply_filter("sales", "category", "Local") → Point at product-table ("Here you can see the beer sales")

3. "Can I export the report as PDF?"
→ If the user is not on the Sales view, say "Go to Sales first". When they're there: point at export-button ("Click here for PDF export")

4. "How do I see which category sells the most?"
→ If the user is not on the Sales view, tell them where to find it. When they're there: point at category-chart ("The bar chart shows the breakdown by category")

5. "I want to compare today's bookings with guest count"
→ If the user is not on the Analytics view, say "You'll find that under Analytics in the menu". When they're there: point at booking-chart ("The bookings chart") → Point at kpi-cards ("Here you can see the guest count")

6. "How do I add a product and check out?"
→ If the user is not in the POS, say "Open POS in the menu on the left". When they're there: Point at the products and say "Click on the product you want to add". If they ask you to add a specific product, do it with add_product_to_order and confirm briefly "There, I added it!". Then point at the order panel and the pay button.

7. "Where can I see who's working in the kitchen today?"
→ If the user is not on the Schedule view, say "Go to Schedule in the menu". When they're there: point at schedule-filters ("Filter staff") → Point at station-badges ("Orange = KITCHEN")

8. "How do I find a specific product in the POS?"
→ If the user is not in the POS, tell them where to find it. When they're there: point at search-field ("Search here") → Point at category-pills ("Or filter by category")

9. "We're missing a daily report, how do I resend it?"
→ If the user is not on the Sales view, tell them where to find it. When they're there: point at date-picker ("Select date") → Point at export-button ("Export the report")

10. "How do I see the total for walk-in bookings?"
→ If the user is not on the Analytics view, tell them where to find it. When they're there: point at kpi-cards ("Walk-in shows the number of bookings")

Be brief, clear, and helpful. Actively point at things in the interface, but never mention the tools by name — just talk about what you're pointing at. Describe what you see on screen to show that you're following along.`,
            tools: toolDefinitions,
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: { type: "server_vad", threshold: 0.7, prefix_padding_ms: 300, silence_duration_ms: 500 },
          },
        }));

        // Send initial screenshot so the AI sees the current screen
        setTimeout(() => {
          const dc = sessionRef.current?.dc;
          if (dc && dc.readyState === "open") {
            captureScreenshot().then((img) => {
              if (img && dc.readyState === "open") {
                sendScreenshotToDataChannel(dc, img, false);
              }
            });
          }
        }, 500);
      };

      session.dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        // Debug: log all events to console
        if (!event.type?.includes("audio.delta")) {
          console.log("[Voice]", event.type, event);
        }

        switch (event.type) {
          case "response.audio_transcript.done":
            addTranscript("assistant", event.transcript);
            setState("connected");
            break;
          case "conversation.item.input_audio_transcription.completed":
            if (event.transcript) {
              addTranscript("user", event.transcript);
            }
            break;
          case "response.function_call_arguments.done":
            handleToolCall(event.name, event.arguments, event.call_id);
            break;
          case "input_audio_buffer.speech_started":
            setState("user-speaking");
            break;
          case "input_audio_buffer.speech_stopped":
            setState("connected");
            break;
          case "response.audio.delta":
            setState("ai-speaking");
            break;
          case "response.done":
            setState("connected");
            break;
          case "session.created":
          case "session.updated":
            console.log("[Voice] Session configured:", event.type);
            break;
          case "error":
            console.error("Realtime error:", event.error);
            addTranscript("system", `Error: ${event.error?.message || "Unknown error"}`);
            break;
        }
      };

      session.pc.oniceconnectionstatechange = () => {
        if (session.pc.iceConnectionState === "failed" || session.pc.iceConnectionState === "disconnected") {
          addTranscript("system", "Connection lost.");
          endSession();
        }
      };
    } catch (err) {
      console.error("Voice session error:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        addTranscript("system", "Microphone not available — grant permission in your browser.");
        setState("disabled");
      } else {
        addTranscript("system", `Could not start: ${err instanceof Error ? err.message : "Unknown error"}`);
        setState("idle");
      }
    }
  }, [addTranscript, handleToolCall, endSession]);

  // Auto-screenshot on view navigation only
  useEffect(() => {
    if (prevViewRef.current !== currentView) {
      prevViewRef.current = currentView;
      const dc = sessionRef.current?.dc;
      if (dc && dc.readyState === "open") {
        setTimeout(() => {
          const dc = sessionRef.current?.dc;
          if (dc && dc.readyState === "open") {
            captureScreenshot().then((img) => {
              if (img) sendScreenshotToDataChannel(dc, img, true);
            });
          }
        }, 500);
      }
    }
  }, [currentView]);

  return {
    state,
    transcript,
    startSession,
    endSession,
    isMuted,
    toggleMute,
  };
}
