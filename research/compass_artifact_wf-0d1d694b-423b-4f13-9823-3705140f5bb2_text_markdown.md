# Code examples for Azure AI Foundry and OpenAI Agents SDK

**The fastest path to a live "ask your docs" demo is Azure AI Foundry's Agents + File Search tool — about 25 lines of Python, 15 minutes of setup, and zero external infrastructure.** This approach auto-chunks your PDFs, creates vector embeddings, and returns cited answers. Swedish works out of the box since both `text-embedding-3-large` and GPT-4o are multilingual. Below is everything needed to build and demo document Q&A systems on both platforms, with verified code from official Microsoft and OpenAI repositories.

---

## Azure AI Foundry: the file search agent in 25 lines

The **recommended approach** uses the v2 SDK (`azure-ai-projects >= 2.0.0`) with the `FileSearchTool`. Microsoft manages the chunking, embedding, and hybrid search infrastructure behind the scenes. No Azure AI Search index setup required.

**Install:**
```bash
pip install azure-ai-projects azure-identity python-dotenv
```

**Environment variables:**
```bash
FOUNDRY_PROJECT_ENDPOINT=https://<resource>.services.ai.azure.com/api/projects/<project>
FOUNDRY_MODEL_DEPLOYMENT_NAME=gpt-4o-mini   # or gpt-4o, gpt-4.1-mini
```

**Complete working code** (from the official SDK sample at `azure-sdk-for-python/sdk/ai/azure-ai-projects/samples/agents/tools/sample_agent_file_search.py`):

```python
import os
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import FileSearchTool, PromptAgentDefinition
from azure.identity import DefaultAzureCredential

load_dotenv()

asset_file_path = Path("caspeco_docs.pdf")  # Your document

with (
    DefaultAzureCredential() as credential,
    AIProjectClient(
        endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        credential=credential,
    ) as project_client,
    project_client.get_openai_client() as openai_client,
):
    # 1. Create vector store and upload document
    vector_store = openai_client.vector_stores.create(name="CaspecoDocs")
    with asset_file_path.open("rb") as f:
        openai_client.vector_stores.files.upload_and_poll(
            vector_store_id=vector_store.id, file=f
        )

    # 2. Create agent with file search
    agent = project_client.agents.create_version(
        agent_name="CaspecoAgent",
        definition=PromptAgentDefinition(
            model=os.environ["FOUNDRY_MODEL_DEPLOYMENT_NAME"],
            instructions=(
                "Du är en hjälpsam kundtjänstassistent för Caspeco. "
                "Svara alltid på svenska. Använd filsökning för att "
                "besvara frågor baserat på produktdokumentationen."
            ),
            tools=[FileSearchTool(vector_store_ids=[vector_store.id])],
        ),
    )

    # 3. Ask a question → get cited answer
    conversation = openai_client.conversations.create()
    response = openai_client.responses.create(
        conversation=conversation.id,
        input="Hur fungerar bokningssystemet i Caspeco?",
        extra_body={"agent_reference": {"name": agent.name, "type": "agent_reference"}},
    )
    print(response.output_text)

    # Cleanup
    project_client.agents.delete_version(agent_name=agent.name, agent_version=agent.version)
    openai_client.vector_stores.delete(vector_store.id)
```

**What happens under the hood:** The File Search tool automatically chunks documents into **800-token segments** with 400-token overlap, embeds them with `text-embedding-3-large` (256 dimensions), rewrites your query for optimal search, runs **hybrid keyword + semantic search**, and reranks results before feeding the top 20 chunks to the LLM. Citations come back as `[source†filename]` annotations in the response text.

**Supported file types** include `.pdf`, `.docx`, `.md`, `.txt`, `.html`, `.pptx`, `.json`, `.py`, and more — up to **512 MB per file** and **10,000 files per vector store**.

---

## Official Microsoft GitHub repositories worth bookmarking

The Azure AI Foundry ecosystem has several official sample repos, each serving a different purpose:

| Repository | What it contains | Stars |
|-----------|-----------------|-------|
| [azure-sdk-for-python/.../azure-ai-projects](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/ai/azure-ai-projects) | **SDK source + samples** including `sample_agent_file_search.py` | SDK repo |
| [microsoft-foundry/foundry-samples](https://github.com/microsoft-foundry/foundry-samples) | Official quickstart code from docs (Python/C#/JS/Java) | ~231★ |
| [Azure-Samples/get-started-with-ai-agents](https://github.com/Azure-Samples/get-started-with-ai-agents) | **Deployable web app** with file search, Azure Container Apps | Active |
| [Azure-Samples/azure-search-openai-demo](https://github.com/Azure-Samples/azure-search-openai-demo) | Flagship full-stack RAG app (React + FastAPI) | **11k+★** |
| [Azure/ai-foundry-workshop](https://github.com/Azure/ai-foundry-workshop) | 4-5 hour hands-on workshop | Active |
| [Azure-Samples/ai-foundry-agents-samples](https://github.com/Azure-Samples/ai-foundry-agents-samples) | Agent templates and demos | Active |
| [microsoft/Agent-Framework-Samples](https://github.com/microsoft/Agent-Framework-Samples) | Cross-provider agent framework including RAG examples | Active |

The **single most demo-relevant file** is the SDK sample at `sdk/ai/azure-ai-projects/samples/agents/tools/sample_agent_file_search.py` in the Azure SDK for Python repo — it's the exact pattern shown above.

---

## Azure AI Search integration for production scenarios

For more control over indexing and Swedish text analysis, use the `AzureAISearchTool` instead of the built-in File Search. This connects an agent to a pre-existing Azure AI Search index where you control the schema, analyzers, and chunking strategy.

```python
from azure.ai.projects.models import (
    AzureAISearchTool, AzureAISearchToolResource,
    AISearchIndexResource, AzureAISearchQueryType,
    PromptAgentDefinition,
)

agent = project_client.agents.create_version(
    agent_name="CaspecoSearchAgent",
    definition=PromptAgentDefinition(
        model="gpt-4o",
        instructions="Du är en hjälpsam assistent. Ge alltid källhänvisningar.",
        tools=[
            AzureAISearchTool(
                azure_ai_search=AzureAISearchToolResource(
                    indexes=[AISearchIndexResource(
                        project_connection_id=os.environ["AI_SEARCH_CONNECTION_ID"],
                        index_name="caspeco-docs-index",
                        query_type=AzureAISearchQueryType.SIMPLE,
                    )]
                )
            )
        ],
    ),
)
```

Azure AI Search provides a dedicated **`sv.microsoft` analyzer** for Swedish with word decompounding (critical for Swedish compound words like "bokningssystem"), lemmatization, and entity recognition. Set this on your index's searchable text fields for optimal keyword search alongside vector search.

---

## OpenAI Agents SDK: the essentials

The [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) (`pip install openai-agents`) shipped in early 2025 as Swarm's successor. It provides a clean, declarative API for single and multi-agent systems. Requires **Python 3.10+** and an `OPENAI_API_KEY`.

**Hello world — 4 lines:**
```python
from agents import Agent, Runner

agent = Agent(name="Assistant", instructions="You are a helpful assistant")
result = Runner.run_sync(agent, "Write a haiku about recursion in programming.")
print(result.final_output)
```

**File search for document Q&A** — create a vector store with the OpenAI API, then pass it to a `FileSearchTool`:

```python
from openai import OpenAI
from agents import Agent, FileSearchTool, Runner

# Step 1: Upload docs to OpenAI vector store
client = OpenAI()
file = client.files.create(file=open("caspeco_docs.pdf", "rb"), purpose="assistants")
vector_store = client.vector_stores.create(name="CaspecoDocs", file_ids=[file.id])

# Step 2: Create agent with file search
agent = Agent(
    name="Caspeco Support",
    instructions="Svara på svenska. Använd filsökning för att besvara frågor.",
    tools=[FileSearchTool(vector_store_ids=[vector_store.id], max_num_results=5)],
)

# Step 3: Ask a question
result = Runner.run_sync(agent, "Hur fungerar bokningssystemet?")
print(result.final_output)
```

**Multi-agent handoff — the triage pattern** (from `examples/customer_service/main.py`):

```python
from agents import Agent, Runner, function_tool

@function_tool
def faq_lookup(question: str) -> str:
    """Look up frequently asked questions."""
    return "You are allowed 1 carry-on bag and 1 personal item."

faq_agent = Agent(
    name="FAQ Agent",
    instructions="You answer FAQ questions using the lookup tool.",
    tools=[faq_lookup],
)

seat_agent = Agent(
    name="Seat Booking Agent",
    instructions="You handle seat changes and upgrades.",
)

triage_agent = Agent(
    name="Triage Agent",
    instructions="Route customer requests to the right specialist.",
    handoffs=[faq_agent, seat_agent],
)

result = Runner.run_sync(triage_agent, "I want to change my seat assignment")
print(f"{result.last_agent.name}: {result.final_output}")
```

**Agents-as-tools pattern** — the orchestrator keeps control instead of handing off:

```python
from agents import Agent, Runner

swedish_agent = Agent(name="swedish_agent", instructions="Translate to Swedish")
french_agent = Agent(name="french_agent", instructions="Translate to French")

orchestrator = Agent(
    name="orchestrator",
    instructions="You use tools to translate text to requested languages.",
    tools=[
        swedish_agent.as_tool(tool_name="translate_swedish", tool_description="Translate to Swedish"),
        french_agent.as_tool(tool_name="translate_french", tool_description="Translate to French"),
    ],
)

result = Runner.run_sync(orchestrator, "Say 'Hello, how are you?' in Swedish and French.")
print(result.final_output)
```

The key difference: **handoffs** transfer conversation control to the specialist (decentralized), while **agents-as-tools** keeps the orchestrator in control and calls specialists as bounded subtasks (centralized).

---

## OpenAI Agents SDK official examples directory

The repo at [github.com/openai/openai-agents-python/tree/main/examples](https://github.com/openai/openai-agents-python/tree/main/examples) contains production-quality examples:

| Directory | What it demonstrates |
|-----------|---------------------|
| `basic/` | Hello world, streaming, function tools, lifecycle hooks |
| `tools/` | **File search**, web search, code interpreter, computer use |
| `agent_patterns/` | Routing, agents-as-tools, guardrails, parallelization, LLM-as-judge |
| `customer_service/` | Full airline support with triage→specialist handoffs |
| `research_bot/` | Multi-agent deep research (planner → searcher → writer) |
| `financial_research_agent/` | Structured financial analysis with agent collaboration |
| `handoffs/` | Message filtering during handoffs |
| `realtime/` | Voice agents and Twilio integration |

A separate full-stack customer service demo lives at [github.com/openai/openai-cs-agents-demo](https://github.com/openai/openai-cs-agents-demo) with FastAPI backend + Next.js frontend, including input/output guardrails.

---

## Which approach to use for your live Caspeco demo

For a **live workshop demo** showing "upload Caspeco docs → ask questions in Swedish → get grounded answers," here is how the options compare:

| Approach | Setup time | Code complexity | Citations | Swedish | Demo impact |
|----------|-----------|----------------|-----------|---------|-------------|
| **Agents + File Search** | ~15 min | ~25 lines | ✅ Auto | ✅ Native | ⭐⭐⭐⭐⭐ |
| Agents + AI Search Tool | ~30 min | ~30 lines | ✅ Yes | ✅ With `sv.microsoft` | ⭐⭐⭐⭐ |
| azure-search-openai-demo | 30-60 min | Full app | ✅ Full UI | ✅ Configurable | ⭐⭐⭐ |
| OpenAI Agents SDK + FileSearch | ~10 min | ~15 lines | ✅ Yes | ✅ Native | ⭐⭐⭐⭐ |

**The recommended demo script** uses Agents + File Search on Azure AI Foundry:

1. **Pre-demo prep** (~15 min): Create an Azure AI Foundry project in the portal, deploy `gpt-4o-mini`, run `az login`, set environment variables
2. **Live demo step 1** (2 min): Show the Caspeco PDF, explain what you're building
3. **Live demo step 2** (3 min): Run the script — it uploads the doc, creates the agent, and asks a question in Swedish
4. **Live demo step 3** (2 min): Ask follow-up questions interactively, show cited answers
5. **Optional wow factor**: Add `WebSearchTool()` to the agent's tools list to let it also search the web, or add a second document to the vector store live

The entire agent infrastructure is **Microsoft-managed in the "basic" setup** — no Azure AI Search resource, no blob storage account, no index schema design. For production, switch to the "standard" setup where your data stays in your own Azure resources.

## Conclusion

Azure AI Foundry's **Agents + File Search** pattern is the clear winner for a live demo: minimal code, automatic chunking and embedding, built-in citations, and native multilingual support. The v2 SDK (`azure-ai-projects >= 2.0.0`) uses a clean pattern where `project_client.agents.create_version()` creates the agent and `openai_client.responses.create()` with an `agent_reference` queries it. For the OpenAI Agents SDK side, the `FileSearchTool` with vector stores provides an almost identical developer experience in fewer lines, making it useful for comparison demos. The critical insight for a Swedish-language deployment is that **no special configuration is needed** — both embedding models and GPT-4o handle Swedish natively, though adding the `sv.microsoft` analyzer on an Azure AI Search index improves keyword search quality for Swedish compound words.