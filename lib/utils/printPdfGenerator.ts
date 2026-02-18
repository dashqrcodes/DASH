import { PDFDocument, rgb, RGB } from "pdf-lib";

const DPI = 72;
const IN = (v: number) => v * DPI;
const CARD_WIDTH_IN = 4;
const CARD_HEIGHT_IN = 6;
const POSTER_WIDTH_IN = 20;
const POSTER_HEIGHT_IN = 30;

/** Print bleed: 0.125" on all sides */
const BLEED_PT = IN(0.125);
/** Safe margin: 0.25" inside trim edges */
const SAFE_PT = IN(0.25);
/** Card QR: 0.75" x 0.75" (54 pt) - transparent PNG on sky */
const CARD_QR_PT = IN(0.75);
/** Poster QR container: 1.25" x 1.25" (90 pt) */
const POSTER_QR_CONTAINER_PT = IN(1.25);
/** Poster QR matrix: 1" x 1" (72 pt) centered in container */
const POSTER_QR_INNER_PT = IN(1);

const PURPLE_900: RGB = rgb(0.22, 0.11, 0.35);

const PASSAGES = [
  {
    text:
      "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
    credit: "-Psalm 23 (KJV)",
  },
  {
    text:
      "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.",
    credit: "-Matthew 11:28-29",
  },
  {
    text:
      "Blessed are those who mourn, for they shall be comforted. The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    credit: "-Matthew 5:4; Psalm 34:18",
  },
  {
    text:
      "Death is not extinguishing the light; it is only putting out the lamp because dawn has come.",
    credit: "-Rabindranath Tagore",
  },
  {
    text:
      "What we have once enjoyed we can never lose. All that we love deeply becomes a part of us.",
    credit: "-Helen Keller",
  },
  {
    text:
      "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    credit: '"-John 3:16"',
  },
];

function formatShortMonth(value: string): string {
  if (!value) return value;
  return value.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,
    (match) => {
      const normalized = match.toLowerCase();
      if (normalized === "june" || normalized === "july") return match;
      return match.slice(0, 3);
    }
  );
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface PrintPdfOptions {
  photoBuf?: Buffer;
  photoContentType?: string;
  qrBuf: Buffer;
  fullName?: string;
  birthDate?: string;
  deathDate?: string;
  counselorName?: string;
  counselorPhone?: string;
  passageIndex?: number;
  skyBackgroundBuf?: Buffer;
}

export async function generateCardFrontPdf(opts: PrintPdfOptions): Promise<Buffer> {
  const {
    photoBuf = Buffer.alloc(0),
    photoContentType = "image/jpeg",
    fullName = "",
    birthDate = "",
    deathDate = "",
  } = opts;

  const trimW = IN(CARD_WIDTH_IN);
  const trimH = IN(CARD_HEIGHT_IN);
  const docW = trimW + BLEED_PT * 2;
  const docH = trimH + BLEED_PT * 2;
  const safeLeft = BLEED_PT + SAFE_PT;
  const safeBottom = BLEED_PT + SAFE_PT;
  const safeW = trimW - SAFE_PT * 2;
  const safeH = trimH - SAFE_PT * 2;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([docW, docH]);
  const helvetica = await pdfDoc.embedFont("Helvetica");
  const helveticaBold = await pdfDoc.embedFont("Helvetica-Bold");

  // Full-bleed image extends to document edges
  if (photoBuf.length > 0) {
    const photoImage =
      photoContentType.includes("jpeg") || photoContentType.includes("jpg")
        ? await pdfDoc.embedJpg(photoBuf)
        : await pdfDoc.embedPng(photoBuf);
    page.drawImage(photoImage, { x: 0, y: 0, width: docW, height: docH });
  } else {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: docW,
      height: docH,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  // Gradient overlay (full bleed)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: docW,
    height: docH,
    color: rgb(0, 0, 0),
    opacity: 0.35,
  });

  // Bottom content inside safe area (matches card-front layout)
  const bottomPad = IN(0.45);
  const inLovingMemory = "In Loving Memory";
  const inLovingW = helveticaBold.widthOfTextAtSize(inLovingMemory, 11);
  page.drawText(inLovingMemory, {
    x: safeLeft + (safeW - inLovingW) / 2,
    y: safeBottom + bottomPad + IN(2.2),
    size: 11,
    font: helveticaBold,
    color: rgb(0.95, 0.95, 0.95),
  });

  const nameW = helveticaBold.widthOfTextAtSize(fullName || "—", 14);
  page.drawText(fullName || "—", {
    x: safeLeft + (safeW - nameW) / 2,
    y: safeBottom + bottomPad + IN(1.5),
    size: 14,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  const datesStr = `${birthDate || "—"} – ${deathDate || "—"}`;
  const datesW = helvetica.widthOfTextAtSize(datesStr, 8);
  page.drawText(datesStr, {
    x: safeLeft + (safeW - datesW) / 2,
    y: safeBottom + bottomPad + IN(0.5),
    size: 8,
    font: helvetica,
    color: rgb(0.9, 0.9, 0.9),
  });

  return Buffer.from(await pdfDoc.save());
}

export async function generateCardBackPdf(opts: PrintPdfOptions): Promise<Buffer> {
  const {
    qrBuf,
    fullName = "",
    birthDate = "",
    deathDate = "",
    counselorName = "Groman Mortuary",
    counselorPhone = "323-476-8005",
    passageIndex = 0,
    skyBackgroundBuf,
  } = opts;

  const trimW = IN(CARD_WIDTH_IN);
  const trimH = IN(CARD_HEIGHT_IN);
  const docW = trimW + BLEED_PT * 2;
  const docH = trimH + BLEED_PT * 2;
  const safeLeft = BLEED_PT + SAFE_PT;
  const safeBottom = BLEED_PT + SAFE_PT;
  const safeW = trimW - SAFE_PT * 2;
  const safeH = trimH - SAFE_PT * 2;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([docW, docH]);
  const helvetica = await pdfDoc.embedFont("Helvetica");
  const helveticaBold = await pdfDoc.embedFont("Helvetica-Bold");

  // Sky background (full bleed to document edges)
  if (skyBackgroundBuf) {
    const skyContentType = "image/jpeg";
    const skyImage =
      skyContentType.includes("jpeg") || skyContentType.includes("jpg")
        ? await pdfDoc.embedJpg(skyBackgroundBuf)
        : await pdfDoc.embedPng(skyBackgroundBuf);
    page.drawImage(skyImage, { x: 0, y: 0, width: docW, height: docH });
  } else {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: docW,
      height: docH,
      color: rgb(0.4, 0.6, 0.9),
    });
  }

  // Gradient overlay (full bleed)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: docW,
    height: docH,
    color: rgb(1, 1, 1),
    opacity: 0.55,
  });

  const pad = IN(0.1);
  const contentWidth = safeW - pad * 2;

  // "Forever in Our Hearts" (inside safe area)
  page.drawText("Forever in Our Hearts", {
    x: safeLeft + pad,
    y: safeBottom + safeH - pad - IN(0.25),
    size: 10,
    font: helveticaBold,
    color: PURPLE_900,
  });

  // Passage text (center area, inside safe)
  const passage = PASSAGES[Math.min(passageIndex, PASSAGES.length - 1)];
  const passageLines = wrapText(passage.text, helvetica, 7, contentWidth);
  const lineHeight = 9;
  const passageStartY = safeBottom + safeH - pad - IN(0.6);
  passageLines.forEach((line, i) => {
    const textWidth = helvetica.widthOfTextAtSize(line, 7);
    const cx = safeLeft + (safeW - textWidth) / 2;
    page.drawText(line, {
      x: cx,
      y: passageStartY - i * lineHeight,
      size: 7,
      font: helvetica,
      color: PURPLE_900,
    });
  });

  const lastLineY = passageStartY - passageLines.length * lineHeight;
  const creditWidth = helvetica.widthOfTextAtSize(passage.credit, 6);
  page.drawText(passage.credit, {
    x: safeLeft + safeW - pad - creditWidth,
    y: lastLineY - 8,
    size: 6,
    font: helveticaBold,
    color: PURPLE_900,
  });

  // Bottom section: Sunrise | QR | Sunset (card QR 0.75", transparent PNG)
  const qrSize = CARD_QR_PT;
  const bottomY = safeBottom + pad + IN(0.3);
  const colWidth = (safeW - qrSize - IN(0.15)) / 2;

  const displayBirth = formatShortMonth(birthDate);
  const displayDeath = formatShortMonth(deathDate);

  // Sunrise (left)
  const sunriseW = helveticaBold.widthOfTextAtSize(displayBirth, 7);
  page.drawText(displayBirth, {
    x: safeLeft + (colWidth - sunriseW) / 2,
    y: bottomY + IN(0.35),
    size: 7,
    font: helveticaBold,
    color: PURPLE_900,
  });
  const sunriseLabelW = helvetica.widthOfTextAtSize("SUNRISE", 6);
  page.drawText("SUNRISE", {
    x: safeLeft + (colWidth - sunriseLabelW) / 2,
    y: bottomY + IN(0.15),
    size: 6,
    font: helvetica,
    color: PURPLE_900,
  });

  // QR (center, 0.75" dark purple on transparent - no container)
  const qrX = safeLeft + colWidth + IN(0.075);
  const qrY = bottomY;
  const qrImage = await pdfDoc.embedPng(qrBuf);
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  // Sunset (right)
  const sunsetW = helveticaBold.widthOfTextAtSize(displayDeath, 7);
  const rightColStart = safeLeft + colWidth + qrSize + IN(0.15);
  page.drawText(displayDeath, {
    x: rightColStart + (colWidth - sunsetW) / 2,
    y: bottomY + IN(0.35),
    size: 7,
    font: helveticaBold,
    color: PURPLE_900,
  });
  const sunsetLabelW = helvetica.widthOfTextAtSize("SUNSET", 6);
  page.drawText("SUNSET", {
    x: rightColStart + (colWidth - sunsetLabelW) / 2,
    y: bottomY + IN(0.15),
    size: 6,
    font: helvetica,
    color: PURPLE_900,
  });

  // Honoring + counselor (inside safe)
  const honoringY = bottomY - IN(0.2);
  const honoring = "Honoring your loved one with dignity and respect.";
  const honoringW = helvetica.widthOfTextAtSize(honoring, 6);
  page.drawText(honoring, {
    x: safeLeft + (safeW - honoringW) / 2,
    y: honoringY,
    size: 6,
    font: helvetica,
    color: rgb(0.25, 0.15, 0.35),
  });
  const counselor = `${counselorName} • ${counselorPhone}`;
  const counselorW = helveticaBold.widthOfTextAtSize(counselor, 6);
  page.drawText(counselor, {
    x: safeLeft + (safeW - counselorW) / 2,
    y: honoringY - 7,
    size: 6,
    font: helveticaBold,
    color: rgb(0.25, 0.15, 0.35),
  });

  return Buffer.from(await pdfDoc.save());
}

export async function generatePosterPdf(opts: PrintPdfOptions): Promise<Buffer> {
  const {
    photoBuf = Buffer.alloc(0),
    photoContentType = "image/jpeg",
    qrBuf,
    fullName = "",
    birthDate = "",
    deathDate = "",
  } = opts;

  const trimW = IN(POSTER_WIDTH_IN);
  const trimH = IN(POSTER_HEIGHT_IN);
  const docW = trimW + BLEED_PT * 2;
  const docH = trimH + BLEED_PT * 2;
  const safeLeft = BLEED_PT + SAFE_PT;
  const safeBottom = BLEED_PT + SAFE_PT;
  const safeW = trimW - SAFE_PT * 2;
  const safeH = trimH - SAFE_PT * 2;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([docW, docH]);
  const helvetica = await pdfDoc.embedFont("Helvetica");
  const helveticaBold = await pdfDoc.embedFont("Helvetica-Bold");

  const photoImage =
    photoContentType.includes("jpeg") || photoContentType.includes("jpg")
      ? await pdfDoc.embedJpg(photoBuf)
      : await pdfDoc.embedPng(photoBuf);

  // Full-bleed photo to document edges
  page.drawImage(photoImage, {
    x: 0,
    y: 0,
    width: docW,
    height: docH,
  });

  // Gradient overlay (full bleed)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: docW,
    height: docH,
    color: rgb(0, 0, 0),
    opacity: 0.35,
  });

  // Bottom content inside safe area (poster: 1.25" white container, 1" QR)
  const bottomPad = IN(1.75);
  const qrContainerSize = POSTER_QR_CONTAINER_PT;
  const qrInnerSize = POSTER_QR_INNER_PT;
  const qrPad = (qrContainerSize - qrInnerSize) / 2;
  const qrX = safeLeft + (safeW - qrContainerSize) / 2;
  const qrY = safeBottom + bottomPad;

  page.drawRectangle({
    x: qrX,
    y: qrY,
    width: qrContainerSize,
    height: qrContainerSize,
    color: rgb(1, 1, 1),
  });

  const qrImage = await pdfDoc.embedPng(qrBuf);
  page.drawImage(qrImage, {
    x: qrX + qrPad,
    y: qrY + qrPad,
    width: qrInnerSize,
    height: qrInnerSize,
  });

  const rowY = qrY + qrContainerSize + IN(0.2);
  const labelSize = 5;
  const dateSize = 6;
  const colWidth = safeW / 3;

  // Name above the row (inside safe area)
  const nameSize = 14;
  const nameY = rowY + IN(0.5);
  const nameWidth = helveticaBold.widthOfTextAtSize(fullName || "—", nameSize);
  page.drawText(fullName || "—", {
    x: safeLeft + (safeW - nameWidth) / 2,
    y: nameY,
    size: nameSize,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  const sunriseW = helveticaBold.widthOfTextAtSize(birthDate || "—", dateSize);
  page.drawText(birthDate || "—", {
    x: safeLeft + colWidth / 2 - sunriseW / 2,
    y: rowY,
    size: dateSize,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  const sunriseLabelW = helvetica.widthOfTextAtSize("SUNRISE", labelSize);
  page.drawText("SUNRISE", {
    x: safeLeft + colWidth / 2 - sunriseLabelW / 2,
    y: rowY - 6,
    size: labelSize,
    font: helvetica,
    color: rgb(0.9, 0.9, 0.9),
  });

  const sunsetW = helveticaBold.widthOfTextAtSize(deathDate || "—", dateSize);
  page.drawText(deathDate || "—", {
    x: safeLeft + colWidth * 2.5 - sunsetW / 2,
    y: rowY,
    size: dateSize,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  const sunsetLabelW = helvetica.widthOfTextAtSize("SUNSET", labelSize);
  page.drawText("SUNSET", {
    x: safeLeft + colWidth * 2.5 - sunsetLabelW / 2,
    y: rowY - 6,
    size: labelSize,
    font: helvetica,
    color: rgb(0.9, 0.9, 0.9),
  });

  return Buffer.from(await pdfDoc.save());
}
