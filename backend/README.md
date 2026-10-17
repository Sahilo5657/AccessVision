# AccessVision Backend Microservice

This microservice provides AI-assisted and heuristic assistive capabilities for the **AccessVision** ecosystem, including:
1. **Extractive Text Summarization** – Transforms long web articles into concise key takeaways without reliance on external paid APIs.
2. **Context-Aware Alt-Text Generation** – Determines meaningful descriptions for images lacking accessibility markup.
3. **Automated WCAG 2.2 Auditor** – Evaluates HTML markup against WCAG 2.2 Level A/AA criteria.

---

## 🚀 Quick Start (Dual-Stack: Python or Node.js)

The AccessVision backend microservice can be run using either Python or Node.js, both providing identical endpoints on port 3001:

### Option A: Python 3.8+ (Zero Dependencies — Recommended)
Runs on pure standard library Python (`http.server`, `urllib.request`). No `pip install` or external packages required!

```bash
cd AccessVision/backend
python server.py
```

### Option B: Node.js & Express
```bash
cd AccessVision/backend
npm install
npm start
# Or with live reload
npm run dev
```

Server starts by default at `http://localhost:3001`.

---

## 📡 API Endpoints

### 1. Health Check
- **`GET /api/health`**
- Response:
```json
{
  "status": "healthy",
  "service": "AccessVision Backend Service",
  "version": "1.0.0",
  "uptime": 12.4
}
```

### 2. Page / Text Summarization
- **`POST /api/summarize`**
- Body:
```json
{
  "text": "Accessibility on the web ensures people with visual disabilities can read content smoothly...",
  "maxSentences": 3
}
```
- Response:
```json
{
  "success": true,
  "data": {
    "summary": "Accessibility on the web ensures people with visual disabilities can read content smoothly.",
    "keyPoints": [
      "Accessibility on the web ensures people with visual disabilities can read content smoothly."
    ],
    "originalWordCount": 12,
    "summaryWordCount": 12,
    "compressionRatio": "0% reduction",
    "readingTimeMinutes": 1
  }
}
```

### 3. Contextual Alt-Text Generation
- **`POST /api/alt-text`**
- Body:
```json
{
  "src": "https://example.com/assets/annual-growth-chart-2025.png",
  "context": "Annual growth figures increased by 14% across all accessibility programs.",
  "caption": ""
}
```
- Response:
```json
{
  "success": true,
  "data": {
    "altText": "Annual growth chart (Annual growth figures increased by 14% across all accessibility programs.)",
    "confidence": 0.78,
    "type": "heuristic_contextual",
    "isDecorative": false
  }
}
```

### 4. Accessibility Audit
- **`POST /api/audit`**
- Body:
```json
{
  "html": "<!DOCTYPE html><html lang='en'><head><title>Test</title></head><body><main><h1>Title</h1><p>Test paragraph</p></main></body></html>"
}
```
- Response:
```json
{
  "success": true,
  "report": {
    "score": 100,
    "wcagLevel": "WCAG 2.2 AA Compliant",
    "passedChecks": 3,
    "violationsCount": 0,
    "violations": []
  }
}
```

---

## 🔒 Privacy & Security
- No user data, passwords, or speech recordings are ever permanently logged or sold.
- The service processes content in-memory and immediately returns results.
