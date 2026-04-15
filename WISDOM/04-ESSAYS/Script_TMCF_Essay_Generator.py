from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

W, H = letter

NAVY   = colors.HexColor("#111111")
GOLD   = colors.HexColor("#C8972B")
WHITE  = colors.white
LIGHT  = colors.HexColor("#F5F7FA")
MUTED  = colors.HexColor("#5A6A7E")

essay_text = (
    "Nobody handed me a roadmap to coding. I opened a laptop and figured it out. "
    "That changed my life. I could not keep it to myself. I grew up watching "
    "people in my community grind with no recognition. Talented, hardworking people "
    "who just did not have the right tools. I started teaching kids who had never written "
    "a line of code and watched something click behind their eyes. That click is what I am after. "
    "Not just in the classroom but in every group project and every engineering problem ahead. "
    "Figuring it out is always possible. That is my value."
)

def draw(path):
    c = canvas.Canvas(path, pagesize=letter)

    # Navy header bar
    c.setFillColor(NAVY)
    c.rect(0, H - 1.15*inch, W, 1.15*inch, fill=1, stroke=0)

    # Gold accent line under header
    c.setFillColor(GOLD)
    c.rect(0, H - 1.18*inch, W, 0.035*inch, fill=1, stroke=0)

    # TMCF label (top left)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(0.5*inch, H - 0.42*inch, "THURGOOD MARSHALL COLLEGE FUND")

    # Scholarship label
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 8)
    c.drawString(0.5*inch, H - 0.60*inch, "Scholarship Essay Submission")

    # Applicant name (right side of header)
    c.setFillColor(colors.HexColor("#A8C0E0"))
    c.setFont("Helvetica", 8)
    name_text = "Wisdom Johnson  ·  Pine Forest High School"
    c.drawRightString(W - 0.5*inch, H - 0.51*inch, name_text)

    # Light background for body area
    c.setFillColor(LIGHT)
    c.rect(0, 0.75*inch, W, H - 1.25*inch - 0.75*inch, fill=1, stroke=0)

    # Card background
    card_x = 0.55*inch
    card_y = 1.3*inch
    card_w = W - 1.1*inch
    card_h = H - 2.5*inch
    c.setFillColor(WHITE)
    c.roundRect(card_x, card_y, card_w, card_h, 6, fill=1, stroke=0)

    # Subtle card border
    c.setStrokeColor(colors.HexColor("#D8E0EA"))
    c.setLineWidth(0.5)
    c.roundRect(card_x, card_y, card_w, card_h, 6, fill=0, stroke=1)

    # Gold left accent bar inside card
    c.setFillColor(GOLD)
    c.rect(card_x, card_y, 0.04*inch, card_h, fill=1, stroke=0)

    # Prompt label
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(card_x + 0.2*inch, card_y + card_h - 0.38*inch, "ESSAY PROMPT")

    # Prompt question
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Oblique", 8.5)
    prompt = "What values are most important to you for making a positive difference in your community and future career?"
    prompt2 = "How will you show those values in school and when working with others?"

    # Draw prompt lines
    prompt_y = card_y + card_h - 0.58*inch
    c.drawString(card_x + 0.2*inch, prompt_y, prompt)
    c.drawString(card_x + 0.2*inch, prompt_y - 0.15*inch, prompt2)

    # Divider
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(0.5)
    div_y = card_y + card_h - 0.82*inch
    c.line(card_x + 0.2*inch, div_y, card_x + card_w - 0.2*inch, div_y)

    # "Response" label
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(card_x + 0.2*inch, div_y - 0.22*inch, "RESPONSE")

    style = ParagraphStyle(
        "essay",
        fontName="Helvetica",
        fontSize=13,
        leading=22,
        textColor=colors.HexColor("#1A2A3A"),
        alignment=TA_JUSTIFY,
    )

    p = Paragraph(essay_text, style)
    text_x = card_x + 0.22*inch
    text_y_top = div_y - 0.42*inch
    avail_w = card_w - 0.44*inch
    avail_h = text_y_top - card_y - 0.3*inch

    p.wrapOn(c, avail_w, avail_h)
    p.drawOn(c, text_x, text_y_top - p.height)

    # Word count badge
    wc = len(essay_text.split())
    badge_x = card_x + card_w - 1.1*inch
    badge_y = card_y + 0.15*inch
    c.setFillColor(colors.HexColor("#EEF2F7"))
    c.roundRect(badge_x, badge_y, 0.95*inch, 0.28*inch, 4, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(badge_x + 0.475*inch, badge_y + 0.08*inch, f"{wc} words")

    # Footer bar
    c.setFillColor(NAVY)
    c.rect(0, 0, W, 0.72*inch, fill=1, stroke=0)

    c.setFillColor(GOLD)
    c.rect(0, 0.72*inch, W, 0.035*inch, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#A8C0E0"))
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(W/2, 0.28*inch, "Thurgood Marshall College Fund  ·  scholarships.tmcf.org")

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(0.5*inch, 0.28*inch, "Wisdom Johnson")

    c.save()
    print(f"Saved to {path} | Word count: {wc}")

draw("C:/Users/wisem/Downloads/School Stuff/WisdomJohnson_TMCF_Essay.pdf")
