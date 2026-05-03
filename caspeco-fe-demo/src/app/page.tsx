"use client";

import { useState, useCallback, useRef } from "react";
import { VIEW_IDS, type ViewId } from "@/lib/constants";
import StartView from "@/components/views/StartView";
import Sidebar from "@/components/navigation/Sidebar";
import POSView from "@/components/views/POSView";
import ScheduleView from "@/components/views/ScheduleView";
import AnalyticsView from "@/components/views/AnalyticsView";
import SalesView, { type SalesTab } from "@/components/views/SalesView";
import KBView from "@/components/views/KBView";
import FABButton from "@/components/voice/FABButton";
import StatusIndicator from "@/components/voice/StatusIndicator";
import TranscriptSidebar from "@/components/voice/TranscriptSidebar";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { clearAllHighlights } from "@/lib/voice/tools";
import type { Product } from "@/data/products";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewId>(VIEW_IDS.START);
  const [transitioning, setTransitioning] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [salesCategory, setSalesCategory] = useState<string | null>(null);
  const [salesTab, setSalesTab] = useState<SalesTab>("daily");
  const [kbQuery, setKbQuery] = useState<string | null>(null);
  const posRef = useRef<{ addProduct: (product: Product) => void } | null>(null);

  const clearHighlights = useCallback(() => {
    clearAllHighlights();
  }, []);

  const showView = useCallback((view: ViewId) => {
    clearHighlights();
    setTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setTransitioning(false);
    }, 150);
  }, [clearHighlights]);

  const handleAddProduct = useCallback((product: Product) => {
    if (posRef.current) {
      posRef.current.addProduct(product);
    }
  }, []);

  const handleApplyFilter = useCallback((view: string, filterType: string, value: string) => {
    if (view === "sales" && filterType === "category") {
      setSalesTab("products");
      setSalesCategory(value);
    }
  }, []);

  const handleSendToKB = useCallback((question: string) => {
    setKbQuery(question);
    showView(VIEW_IDS.KB);
  }, [showView]);

  const voice = useRealtimeVoice({
    currentView,
    onNavigate: showView,
    onAddProduct: handleAddProduct,
    onApplyFilter: handleApplyFilter,
    onSendToKB: handleSendToKB,
  });

  const isSystemView = currentView !== VIEW_IDS.START;

  const handleFABClick = () => {
    if (voice.state === "idle" || voice.state === "disabled") {
      voice.startSession();
    } else {
      voice.endSession();
      setTranscriptOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      {currentView === VIEW_IDS.START && (
        <StartView onStart={() => showView(VIEW_IDS.POS)} />
      )}

      {isSystemView && (
        <>
          <Sidebar
            activeView={currentView}
            onNavigate={showView}
            onLogoClick={() => showView(VIEW_IDS.START)}
          />
          <main
            className={`ml-[220px] min-h-screen transition-opacity duration-200
              ${transitioning ? "opacity-0" : "opacity-100"}`}
            id="main-content"
          >
            {currentView === VIEW_IDS.POS && <POSView ref={posRef} />}
            {currentView === VIEW_IDS.SALES && (
              <SalesView
                activeCategory={salesCategory}
                onCategoryChange={setSalesCategory}
                activeTab={salesTab}
                onTabChange={setSalesTab}
              />
            )}
            {currentView === VIEW_IDS.SCHEDULE && <ScheduleView />}
            {currentView === VIEW_IDS.ANALYTICS && <AnalyticsView />}
            {currentView === VIEW_IDS.KB && (
              <KBView
                initialQuery={kbQuery}
                onQueryConsumed={() => setKbQuery(null)}
              />
            )}
          </main>

          <FABButton
            state={voice.state}
            onClick={handleFABClick}
            onTranscriptToggle={() => setTranscriptOpen(!transcriptOpen)}
            isMuted={voice.isMuted}
            onMuteToggle={voice.toggleMute}
          />
          <StatusIndicator state={voice.state} />
          <TranscriptSidebar
            isOpen={transcriptOpen}
            onClose={() => setTranscriptOpen(false)}
            entries={voice.transcript}
          />
        </>
      )}
    </div>
  );
}
