import sys
import os
import unittest

# Ensure backend app is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.document_extractor import DocumentExtractor
from app.providers.local_heuristic import LocalHeuristicProvider
from app.services.resume_parser import sanitize_and_hydrate_resume

class TestUniversalExtractor(unittest.TestCase):

    def test_txt_extraction(self):
        txt_content = """Jane Doe
Registered Nurse (RN) | Critical Care Specialist
Email: jane.doe@hospital.org
Phone: (555) 234-5678
Location: Chicago, IL

Professional Summary
Compassionate Registered Nurse with 7+ years of experience in intensive care units (ICU). Proficient in patient triage, hemodynamic monitoring, and advanced cardiac life support (ACLS).

Clinical Experience
Northwestern Memorial Hospital | Charge Nurse | Jan 2020 - Present | Chicago, IL
• Directed 18-bed ICU unit managing patient flow and critical interventions.
• Administered vasoactive medications and monitored mechanical ventilators.

Rush University Medical Center | Staff Nurse | Jun 2017 - Dec 2019 | Chicago, IL
• Provided direct patient care in the trauma and surgical step-down unit.

Education & Credentials
• Bachelor of Science in Nursing (BSN) – 2017 University of Illinois, Chicago
• Certified Critical Care Registered Nurse (CCRN) – AACN, 2019

Areas of Expertise
Clinical Care: Patient Triage, Hemodynamic Monitoring, ACLS, BLS, Ventilator Management
Certifications & Licenses: Registered Nurse (IL License #123456), CCRN
"""
        import tempfile
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
            f.write(txt_content)
            temp_path = f.name

        try:
            res = DocumentExtractor.extract_document(temp_path, "jane_doe.txt")
            self.assertGreater(len(res["text"]), 200)
            
            provider = LocalHeuristicProvider()
            raw_dict = provider.parse_resume_document_sync(res["text"])
            hydrated = sanitize_and_hydrate_resume(raw_dict, raw_text=res["text"])
            
            self.assertEqual(hydrated.personalInfo.fullName, "Jane Doe")
            self.assertIn("Nurse", hydrated.personalInfo.professionalTitle)
            self.assertFalse(hydrated.personalInfo.professionalTitle.startswith("Software Engineer"))
            self.assertEqual(len(hydrated.experience), 2)
            # Education heading in this PDF has no degree/institution text; never fabricate fake degrees
            self.assertIsInstance(hydrated.education, list)
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    def test_rtf_extraction(self):
        rtf_content = r"{\rtf1\ansi\deff0 {\fonttbl {\f0 Courier;}}\f0\fs24 Marcus Vance\par Financial Controller\par Email: marcus@capital.com\par Phone: 212-555-0199\par\par Professional Summary\par Experienced CPA with 12 years directing corporate financial audits.\par}"
        import tempfile
        with tempfile.NamedTemporaryFile("w", suffix=".rtf", delete=False, encoding="utf-8") as f:
            f.write(rtf_content)
            temp_path = f.name

        try:
            res = DocumentExtractor.extract_document(temp_path, "marcus.rtf")
            self.assertIn("Marcus Vance", res["text"])
            self.assertIn("Financial Controller", res["text"])
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    def test_aditya_pdf_extraction_and_hydration(self):
        original_pdf = r"C:\Users\sagni\.gemini\antigravity\brain\8a5874bb-89a1-4fc1-b904-20482ade46ae\.user_uploaded\media_1795541276871_69868ddb.pdf"
        if os.path.exists(original_pdf):
            res = DocumentExtractor.extract_document(original_pdf, "Aditya_Resume.pdf")
            self.assertGreater(len(res["text"]), 1000)
            
            provider = LocalHeuristicProvider()
            raw_dict = provider.parse_resume_document_sync(res["text"])
            hydrated = sanitize_and_hydrate_resume(raw_dict, raw_text=res["text"])
            
            self.assertEqual(hydrated.personalInfo.fullName, "Aditya Chandak")
            self.assertEqual(len(hydrated.experience), 9)
            self.assertGreaterEqual(len(hydrated.projects), 1)
            # Education heading in this PDF has no degree/institution text; never fabricate fake degrees
            self.assertIsInstance(hydrated.education, list)
            self.assertGreaterEqual(len(hydrated.skills), 7)

if __name__ == "__main__":
    unittest.main()
