export interface WebRTCSession {
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  audioEl: HTMLAudioElement;
  localStream: MediaStream;
}

export async function createWebRTCSession(ephemeralToken: string): Promise<WebRTCSession> {
  const pc = new RTCPeerConnection();
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  // Chrome requires the element to be in the DOM for autoplay
  audioEl.style.display = "none";
  document.body.appendChild(audioEl);

  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0];
  };

  const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  const dc = pc.createDataChannel("oai-events");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Wait for ICE gathering to complete so the SDP includes all candidates.
  // Without this, audio media transport may fail even though the data channel works.
  await new Promise<void>((resolve) => {
    if (pc.iceGatheringState === "complete") {
      resolve();
    } else {
      pc.addEventListener("icegatheringstatechange", () => {
        if (pc.iceGatheringState === "complete") resolve();
      });
    }
  });

  const sdpResponse = await fetch(
    "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ephemeralToken}`,
        "Content-Type": "application/sdp",
      },
      body: pc.localDescription!.sdp,
    }
  );

  if (!sdpResponse.ok) {
    localStream.getTracks().forEach((t) => t.stop());
    pc.close();
    throw new Error("SDP exchange failed");
  }

  const answerSdp = await sdpResponse.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  return { pc, dc, audioEl, localStream };
}

export function closeSession(session: WebRTCSession) {
  session.localStream.getTracks().forEach((t) => t.stop());
  session.dc.close();
  session.pc.close();
  session.audioEl.srcObject = null;
  session.audioEl.remove();
}
