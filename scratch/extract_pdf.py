import pypdf

reader = pypdf.PdfReader('scratch/test_exact_invoice_card.pdf')
for i, page in enumerate(reader.pages):
    print(f"--- Page {i+1} ---")
    print(page.extract_text())
