import { products } from "@/data/products";
import { VIEW_IDS, type ViewId } from "@/lib/constants";

const validPages = Object.values(VIEW_IDS);

const GUIDE_TARGETS = [
  "sales-tabs", "category-chart", "sales-total", "product-table",
  "category-filter", "export-button", "date-picker",
  "product-grid", "order-panel", "search-field", "category-pills",
  "pay-button", "dine-in-toggle",
  "booking-chart", "kpi-cards", "analytics-header",
  "schedule-grid", "schedule-filters", "station-badges",
] as const;

export type GuideTarget = typeof GUIDE_TARGETS[number];

export const toolDefinitions = [
  {
    type: "function",
    name: "navigate_to_page",
    description: "Navigate the demo to a specific page/view. Available pages: pos (POS), sales (Sales), schedule (Schedule), analytics (Analytics), kb (Knowledge Base), start. Use ONLY when the user explicitly asks to be taken to a page (e.g. 'take me to the POS').",
    parameters: {
      type: "object",
      properties: {
        page: {
          type: "string",
          enum: validPages,
          description: "The page to navigate to",
        },
      },
      required: ["page"],
    },
  },
  {
    type: "function",
    name: "explain_current_screen",
    description: "Capture and analyze the current screen to describe what's visible to the user.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "get_page_help",
    description: "Get help information about the current page/view.",
    parameters: {
      type: "object",
      properties: {
        page: {
          type: "string",
          enum: validPages.filter((p) => p !== VIEW_IDS.START),
          description: "The page to get help for",
        },
      },
      required: ["page"],
    },
  },
  {
    type: "function",
    name: "add_product_to_order",
    description: "Add a product to the current POS order by name. Uses fuzzy matching.",
    parameters: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description: "The name of the product to add (case-insensitive, substring match)",
        },
      },
      required: ["product_name"],
    },
  },
  {
    type: "function",
    name: "highlight_element",
    description: "Highlight a predefined UI element by its data-guide target. Use this for known structural elements. Available targets: " + GUIDE_TARGETS.join(", "),
    parameters: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: GUIDE_TARGETS as unknown as string[],
          description: "The data-guide target to highlight",
        },
        label: {
          type: "string",
          description: "Optional label text to show above the highlighted element",
        },
      },
      required: ["target"],
    },
  },
  {
    type: "function",
    name: "highlight_by_text",
    description: "Highlight any visible element on screen by searching for its text content. Use this to point at specific data values, labels, product names, or any text visible on screen. Finds the most specific (deepest) element matching the text.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to search for on screen (case-insensitive, substring match)",
        },
        label: {
          type: "string",
          description: "Optional label text to show above the highlighted element",
        },
      },
      required: ["text"],
    },
  },
  {
    type: "function",
    name: "send_to_knowledge_base",
    description: "Navigate to the Knowledge Base and send a question on the user's behalf. Use this when you cannot answer a question about Caspeco's products, features, or configuration — hand it off to the KB with the question pre-filled.",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question to send to the Knowledge Base",
        },
      },
      required: ["question"],
    },
  },
  {
    type: "function",
    name: "apply_filter",
    description: "Apply a filter in a view. Currently supports filtering the sales product report by category.",
    parameters: {
      type: "object",
      properties: {
        view: {
          type: "string",
          enum: ["sales"],
          description: "The view to apply the filter in",
        },
        filter_type: {
          type: "string",
          enum: ["category"],
          description: "The type of filter",
        },
        value: {
          type: "string",
          description: "The filter value (e.g. category name like 'Local', 'Coffee')",
        },
      },
      required: ["view", "filter_type", "value"],
    },
  },
];

export interface ToolResult {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
  suggestions?: string[];
}

export function executeAddProduct(productName: string): ToolResult {
  const query = productName.toLowerCase();
  const match = products.find((p) => p.name.toLowerCase().includes(query));

  if (match) {
    return { success: true, data: { product: match } };
  }

  // Better fuzzy: find products where at least half the query chars match
  const suggestions = products
    .map((p) => {
      const name = p.name.toLowerCase();
      const matchCount = query.split("").filter((char) => name.includes(char)).length;
      return { product: p, score: matchCount / query.length };
    })
    .filter((item) => item.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.product.name);

  return { success: false, error: `No product found matching "${productName}"`, suggestions };
}

export function executeGetPageHelp(page: string): ToolResult {
  const helpTexts: Record<string, string> = {
    pos: "The POS shows products on the left and the order on the right. Click products to add them, X to remove. The Pay button completes the order.",
    sales: "The Sales view shows today's sales. The Daily Report tab shows a summary per category with a bar chart. The Product Report tab shows a table of all sold products that can be filtered by category. PDF export is in the header.",
    schedule: "The Schedule shows the staff's weekly schedule with shifts and stations. KITCHEN (orange) and DINING (teal) show station assignments.",
    analytics: "The Analytics dashboard shows booking statistics with a chart and KPIs. Hover over the chart for details.",
  };

  return { success: true, data: { help: helpTexts[page] || "No help available." } };
}

let highlightTimer: ReturnType<typeof setTimeout> | null = null;

export function clearAllHighlights() {
  if (highlightTimer) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
  document.querySelectorAll("[data-guide-active]").forEach((el) => {
    el.removeAttribute("data-guide-active");
    el.querySelector(".guide-label")?.remove();
  });
}

function applyHighlight(el: Element, label?: string) {
  el.setAttribute("data-guide-active", "true");
  el.scrollIntoView({ behavior: "smooth", block: "center" });

  if (label) {
    const labelEl = document.createElement("div");
    labelEl.className = "guide-label";
    labelEl.textContent = label;
    (el as HTMLElement).style.position = (el as HTMLElement).style.position || "relative";
    el.appendChild(labelEl);
  }

  // Auto-dismiss after 4s — re-query DOM to avoid stale reference
  highlightTimer = setTimeout(() => {
    document.querySelectorAll("[data-guide-active]").forEach((activeEl) => {
      activeEl.removeAttribute("data-guide-active");
      activeEl.querySelector(".guide-label")?.remove();
    });
    highlightTimer = null;
  }, 4000);
}

export async function executeHighlight(target: string, label?: string): Promise<ToolResult> {
  // Clear previous highlights
  clearAllHighlights();

  // Retry with backoff — element may not be in DOM yet after navigation
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const el = document.querySelector(`[data-guide="${target}"]`);
    if (el) {
      applyHighlight(el, label);
      return { success: true, data: { highlighted: target, label } };
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return { success: false, error: `Element not found: ${target}` };
}

function isElementVisible(el: HTMLElement): boolean {
  if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") {
    return false;
  }
  const style = getComputedStyle(el);
  return style.visibility !== "hidden" && style.display !== "none" && parseFloat(style.opacity) > 0;
}

function findDeepestMatchingElement(searchText: string): HTMLElement | null {
  const container = document.getElementById("main-content");
  if (!container) return null;

  const normalized = searchText.toLowerCase().trim();
  let bestMatch: HTMLElement | null = null;
  let bestLength = Infinity;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();

  while (node) {
    const el = node as HTMLElement;
    const text = (el.textContent || "").toLowerCase().trim();

    if (text.includes(normalized) && isElementVisible(el)) {
      // Pick the element with the shortest textContent (most specific)
      if (text.length < bestLength) {
        bestLength = text.length;
        bestMatch = el;
      }
    }
    node = walker.nextNode();
  }

  return bestMatch;
}

export async function executeHighlightByText(text: string, label?: string): Promise<ToolResult> {
  clearAllHighlights();

  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const el = findDeepestMatchingElement(text);
    if (el) {
      applyHighlight(el, label);
      return { success: true, data: { highlighted_text: text, label, element_tag: el.tagName.toLowerCase() } };
    }
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return { success: false, error: `No visible element found containing text: "${text}"` };
}

export function executeApplyFilter(
  view: string,
  filterType: string,
  value: string,
  applyFn: (view: string, filterType: string, value: string) => void
): ToolResult {
  applyFn(view, filterType, value);
  return { success: true, data: { view, filterType, value } };
}

export function executeNavigate(page: string, navigateFn: (view: ViewId) => void): ToolResult {
  if (!validPages.includes(page as ViewId)) {
    return { success: false, error: `Invalid page: ${page}` };
  }
  navigateFn(page as ViewId);
  return { success: true, data: { navigated_to: page } };
}
