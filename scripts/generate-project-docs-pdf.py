from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, ListFlowable, ListItem, PageBreak, Paragraph, Preformatted, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
MD_PATH = DOCS_DIR / "Awseal-Documentacao.md"
PDF_PATH = DOCS_DIR / "Awseal-Documentacao.pdf"
LOGO_CANDIDATES = [
    Path(r"C:\Users\leona\Downloads\awseal logo sem legebda.jpeg"),
    ROOT / "public" / "assets" / "logo.png",
]

BLUE = colors.HexColor("#1c64f2")
SLATE = colors.HexColor("#0f172a")
MUTED = colors.HexColor("#475569")
BORDER = colors.HexColor("#dbeafe")
BG = colors.HexColor("#f8fbff")

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=32,
        textColor=SLATE,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=SLATE,
        spaceBefore=10,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="SubTitle",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=SLATE,
        spaceBefore=8,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyTextAwseal",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=SLATE,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletAwseal",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=SLATE,
        leftIndent=4,
    )
)
styles.add(
    ParagraphStyle(
        name="CodeAwseal",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=9,
        leading=12,
        textColor=SLATE,
        backColor=BG,
        borderColor=BORDER,
        borderWidth=0.8,
        borderPadding=8,
        borderRadius=6,
        spaceBefore=4,
        spaceAfter=8,
    )
)


def pick_logo():
    for candidate in LOGO_CANDIDATES:
        if candidate.exists() and candidate.stat().st_size > 0:
            return candidate
    return None


def inline_code(text: str) -> str:
    escaped = escape(text)
    return re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", escaped)


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BLUE)
    canvas.setLineWidth(0.6)
    canvas.line(doc.leftMargin, 13 * mm, A4[0] - doc.rightMargin, 13 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 8 * mm, "Awseal | Documentacao do Projeto")
    canvas.drawRightString(A4[0] - doc.rightMargin, 8 * mm, f"Pagina {canvas.getPageNumber()}")
    canvas.restoreState()


raw = MD_PATH.read_text(encoding="utf-8")
lines = raw.splitlines()

story = []
logo = pick_logo()
title = "Awseal"
subtitle = "Documentacao do Projeto"
index = 0

if lines and lines[0].startswith("# "):
    title = lines[0][2:].strip()
    index = 1
if index < len(lines) and lines[index].strip():
    subtitle = lines[index].strip()
    index += 1

story.append(Spacer(1, 18 * mm))
if logo is not None:
    img = Image(str(logo))
    img._restrictSize(48 * mm, 48 * mm)
    img.hAlign = "CENTER"
    story.append(img)
    story.append(Spacer(1, 10 * mm))

story.append(Paragraph(escape(title), styles["DocTitle"]))
story.append(Paragraph(escape(subtitle), styles["DocSubtitle"]))
story.append(Spacer(1, 6 * mm))
story.append(
    Paragraph(
        "Versao em PDF focada no uso do Gemini como IA principal do projeto.",
        styles["DocSubtitle"],
    )
)
story.append(PageBreak())

paragraph_buffer = []
bullet_buffer = []
code_buffer = []
in_code = False


def flush_paragraph():
    global paragraph_buffer
    if paragraph_buffer:
        text = " ".join(part.strip() for part in paragraph_buffer if part.strip())
        story.append(Paragraph(inline_code(text), styles["BodyTextAwseal"]))
        paragraph_buffer = []


def flush_bullets():
    global bullet_buffer
    if bullet_buffer:
        items = [
            ListItem(Paragraph(inline_code(item), styles["BulletAwseal"]))
            for item in bullet_buffer
        ]
        story.append(ListFlowable(items, bulletType="bullet", leftIndent=14))
        story.append(Spacer(1, 2 * mm))
        bullet_buffer = []


def flush_code():
    global code_buffer
    if code_buffer:
        story.append(Preformatted("\n".join(code_buffer), styles["CodeAwseal"]))
        code_buffer = []


for line in lines[index:]:
    stripped = line.rstrip()

    if stripped.startswith("```"):
        flush_paragraph()
        flush_bullets()
        if in_code:
            flush_code()
            in_code = False
        else:
            in_code = True
        continue

    if in_code:
        code_buffer.append(stripped)
        continue

    if not stripped.strip():
        flush_paragraph()
        flush_bullets()
        continue

    if stripped.startswith("## "):
        flush_paragraph()
        flush_bullets()
        story.append(Paragraph(escape(stripped[3:].strip()), styles["SectionTitle"]))
        continue

    if stripped.startswith("### "):
        flush_paragraph()
        flush_bullets()
        story.append(Paragraph(escape(stripped[4:].strip()), styles["SubTitle"]))
        continue

    if re.match(r"^\d+\.\s+", stripped):
        flush_paragraph()
        flush_bullets()
        story.append(Paragraph(inline_code(stripped), styles["BodyTextAwseal"]))
        continue

    if stripped.startswith("- "):
        flush_paragraph()
        bullet_buffer.append(stripped[2:].strip())
        continue

    paragraph_buffer.append(stripped)

flush_paragraph()
flush_bullets()
flush_code()

doc = SimpleDocTemplate(
    str(PDF_PATH),
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=18 * mm,
    bottomMargin=18 * mm,
    title="Awseal - Documentacao do Projeto",
    author="OpenAI Codex",
)

doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
print(PDF_PATH)
