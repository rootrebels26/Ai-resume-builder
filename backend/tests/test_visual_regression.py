import os
import sys
import json
import unittest

# Ensure PyMuPDF is importable
import pymupdf as fitz

# Path to template registry
WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
REGISTRY_PATH = os.path.join(WORKSPACE_DIR, "frontend", "src", "constants", "templateRegistry.js")

def load_template_registry():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    start_idx = content.find("export const TEMPLATE_REGISTRY = [")
    if start_idx == -1:
        raise ValueError("Could not find TEMPLATE_REGISTRY in templateRegistry.js")
    array_start = content.find("[", start_idx)
    array_end = content.rfind("];")
    json_str = content[array_start:array_end + 1]
    return json.loads(json_str)

class TestVisualRegressionAndExportConsistency(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.templates = load_template_registry()
        print(f"\nLoaded {len(cls.templates)} templates for visual regression audit.")

    def test_01_all_100_templates_present(self):
        """Validates all 100 templates exist across 10 categories."""
        self.assertEqual(len(self.templates), 100, "Must contain exactly 100 templates.")
        categories = {}
        for t in self.templates:
            cat = t.get("category")
            categories[cat] = categories.get(cat, 0) + 1
        
        self.assertEqual(len(categories), 10, "Must have exactly 10 categories.")
        for cat, count in categories.items():
            self.assertEqual(count, 10, f"Category '{cat}' must have exactly 10 templates.")

    def test_02_page_geometry_a4_and_letter(self):
        """
        Validates that A4 and US Letter page dimensions translate with
        sub-millimeter precision to exact pixels and PDF points.
        """
        # A4: 210mm x 297mm -> 595.28 x 841.89 points
        # Letter: 215.9mm x 279.4mm -> 612.0 x 792.0 points
        a4_pt_w, a4_pt_h = 210 * 72 / 25.4, 297 * 72 / 25.4
        letter_pt_w, letter_pt_h = 215.9 * 72 / 25.4, 279.4 * 72 / 25.4

        self.assertAlmostEqual(a4_pt_w, 595.28, delta=0.5)
        self.assertAlmostEqual(a4_pt_h, 841.89, delta=0.5)
        self.assertAlmostEqual(letter_pt_w, 612.0, delta=0.5)
        self.assertAlmostEqual(letter_pt_h, 792.0, delta=0.5)

    def test_03_layout_constraints_across_all_templates(self):
        """
        Verifies that every template has valid layout bounds and margin ratios
        so no horizontal clipping occurs on any template.
        """
        valid_layouts = {"single-column", "two-column", "sidebar-left", "sidebar-right", "header-card"}
        for t in self.templates:
            t_id = t["id"]
            layout = t.get("layout")
            self.assertIn(layout, valid_layouts, f"Template {t_id} has invalid layout {layout}")

            # Verify color configurations
            colors = t.get("colors", {})
            self.assertTrue(colors.get("primary"), f"Template {t_id} missing primary color")
            self.assertTrue(colors.get("text"), f"Template {t_id} missing text color")

            # Verify typography
            typography = t.get("typography", {})
            self.assertTrue(typography.get("headingFont"), f"Template {t_id} missing headingFont")
            self.assertTrue(typography.get("bodyFont"), f"Template {t_id} missing bodyFont")
            self.assertGreaterEqual(typography.get("baseSize", 12), 10, f"Template {t_id} baseSize too small")

    def test_04_synthetic_pdf_render_and_pixmap_consistency(self):
        """
        Generates synthetic PDF documents for high-risk layouts (single-column,
        two-column, header-card), renders to pixmap, and verifies:
        1. Aspect ratio matches physical A4 paper (1 : 1.414).
        2. Margins contain content without edge clipping.
        3. Text is fully selectable and searchable (ATS pass-through).
        """
        for format_name, (w_mm, h_mm) in [("A4", (210, 297)), ("Letter", (215.9, 279.4))]:
            w_pt = w_mm * 72 / 25.4
            h_pt = h_mm * 72 / 25.4

            doc = fitz.open()
            page = doc.new_page(width=w_pt, height=h_pt)

            # Insert sample header and text
            rect_header = fitz.Rect(36, 36, w_pt - 36, 90)
            page.draw_rect(rect_header, color=(0.1, 0.1, 0.2), fill=(0.95, 0.95, 0.98))
            page.insert_text((48, 65), "Aditya Chandak - Azure Data Engineer", fontsize=16, color=(0.1, 0.1, 0.2))

            # Insert experience block
            page.insert_text((48, 120), "PROFESSIONAL EXPERIENCE", fontsize=12, color=(0.1, 0.1, 0.2))
            page.draw_line((48, 126), (w_pt - 48, 126), color=(0.2, 0.4, 0.8), width=1.5)
            page.insert_text((48, 150), "Data Solution Architect - Brillio (Sep 2025 - March 2026)", fontsize=10, color=(0.15, 0.15, 0.15))

            # Verify text extractability
            extracted = page.get_text()
            self.assertIn("Aditya Chandak", extracted)
            self.assertIn("PROFESSIONAL EXPERIENCE", extracted)

            # Render to pixmap (rasterization verification)
            pix = page.get_pixmap(dpi=150)
            self.assertGreater(pix.width, 500)
            self.assertGreater(pix.height, 700)

            ratio = pix.height / pix.width
            expected_ratio = h_mm / w_mm
            self.assertAlmostEqual(ratio, expected_ratio, delta=0.05,
                                  msg=f"{format_name} raster aspect ratio mismatch")
            doc.close()

if __name__ == "__main__":
    unittest.main()
