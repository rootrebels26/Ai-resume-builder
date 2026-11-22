# PRIVACY ARCHITECTURE & DATA POLICY

AI Resume Builder is designed from the ground up as a **privacy-first, database-free** document processing utility.

---

## 1. Core Principles

1. **Zero Server-Side Storage**:
   There is no PostgreSQL, MySQL, MongoDB, Redis database, Firebase, or Supabase associated with this application. Resume data is never written to a permanent disk database.

2. **Browser-Local Persistence**:
   All drafts, edits, templates, and theme customizations are saved locally within your personal browser using IndexedDB via Dexie.js.

3. **Ephemeral Document Processing**:
   When you upload a PDF or DOCX file for extraction, the file is written to an ephemeral, isolated temporary directory with randomized filenames, processed in memory, and immediately deleted upon completion or error.

4. **Zero Account Requirement**:
   Users are never asked for passwords, email confirmations, phone numbers, or social sign-in OAuth tokens.

5. **AI Data Minimization**:
   When using AI enhancement features, only the specific fields necessary for the requested transformation (e.g., a single bullet point or job description) are transmitted to the processing layer.

---

## 2. Client-Side Control

You possess 100% control over your career data:
- **Export JSON**: Download a portable, machine-readable backup of your entire resume at any time.
- **Import JSON**: Restore your resume on any browser or device without transmitting data through our servers.
- **Clear Data**: Wipe all local drafts with a single click.
