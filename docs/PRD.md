# Product Requirements Document (PRD): VaiTAL

> **Vision**: A "magic lens" that transforms messy medical paper trails into clear, actionable health intelligence.

---

## 1. Project Overview
*   **Name**: VaiTAL (formerly: `personal-health-tracker`)
*   **Tagline**: Your personal AI health archivist.
*   **Problem**: Patients receive critical health data (biomarkers) on localized, inconsistent paper or PDF reports. These get lost in drawers, making it impossible to see long-term trends (e.g., "Is my creatinine creeping up over 5 years?").
*   **Solution**: A PWA that ingests photos of ANY lab result, uses AI to extract and normalize the data, and presents a unified dashboard of health trends.

## 2. Target Audience
*   **Primary**: Individuals with chronic conditions (e.g., diabetes, hypertension) or bio-hackers who track the "Magic 12" and other markers regularly.
*   **Secondary**: Caregivers tracking elderly parents' health.

## 3. Core Features (MVP)

### 3.1 Data Ingestion (" The Lens")
*   **Universal Ingest**:
    *   **Camera**: Snap photo of a printed paper.
    *   **Upload**: Select PDF or Image from device.
*   **AI Extraction (The "Brain")**:
    *   Uses Cloud Vision LLM (Gemini 1.5 Pro / GPT-4o).
    *   **Dynamic Marker Discovery**: Does NOT rely on hard-coded templates.
    *   *Logic*: "Reading this image, I see 'HbA1c' with value '5.7%'. Is 'HbA1c' in our DB? Yes -> Map it. No -> Create new Marker Type."

### 3.2 Intelligence & Logic
*   **Smart Grouping**:
    *   Dates within a short window (e.g., 2-3 days) are grouped into a single **"Checkup Event"**.
    *   Large gaps (> 1 month) start a new Event.
*   **Normalization**:
    *   Captures the **Value** and the **Unit** (e.g., mg/dL vs mmol/L).
    *   Captures the **Reference Range** printed on the paper (if available) for tooltips.

### 3.3 The Dashboard
*   **Longitudinal Trends**:
    *   Line charts for any selected marker (e.g., Cholesterol over 5 years).
    *   "Traffic Light" indicators (Green/Yellow/Red) based on the *extracted* reference range.
*   **Batch Evaluation**:
    *   AI summary of the *latest* batch (e.g., "Compared to Feb 2024, your lipids have improved, but potassium is low.").

### 3.4 User Experience
*   **Platform**: Web-based (Next.js) optimized as a **PWA** (Installable on iOS/Android home screen).
*   **Auth**: Email/Password (Supabase Auth). Private by default.
*   **Multi-Tenancy**: Support for multiple users (data strictly isolated via Row Level Security).

## 4. Technical Architecture

### 4.1 Tech Stack
*   **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion (for "beautiful" feel).
*   **Database**: **Supabase** (PostgreSQL).
    *   *Why*: Relational core (Users, Visits) + JSONB columns for the "Test Results" (to handle specific, unpredictable schema).
*   **AI/OCR**: Gemini 1.5 Pro API (via Vertex AI or Google AI Studio).
*   **Charting**: Recharts or Visx.

### 4.2 Data Model (Conceptual)

**Table: `users`**
*   `id` (UUID)
*   `email`

**Table: `checkups` (The Event)**
*   `id` (UUID)
*   `user_id` (FK)
*   `date` (Date)
*   `summary` (Text - AI generated analysis)
*   `original_files` (Array of Storage URLs)

**Table: `results` (The Data Points)**
*   `id` (UUID)
*   `checkup_id` (FK)
*   `marker_name` (Text - e.g. "LDL Cholesterol")
*   `value` (Numeric)
*   `unit` (Text)
*   `reference_range_min` (Numeric)
*   `reference_range_max` (Numeric)
*   `confidence` (Numeric - AI confidence score)

## 5. Success Metrics
*   **Accuracy**: AI extracts >95% of handwritten/printed markers correctly.
*   **Speed**: "Snap to Graph" time under 10 seconds.
*   **Retention**: User logs at least 3 checkups (proving value in effective trending).

## 6. Risks
*   **Hallucination**: AI misreading "5.7" as "57".
    *   *Mitigation*: "Human in the Loop" confirmation step. User sees the extracted table and must click "Confirm" before saving.
*   **Privacy**: Uploading medical data to cloud.
    *   *Mitigation*: Data encryption at rest (Supabase) + strict RLS. Images deleted or moved to secure Private Buckets after processing.
