# Graphic Design Fields for AI Jobs

## Design Job Types Added

Added to `ai_jobs.job_type` CHECK constraint:
- `pdf_generate` - Generate print-ready PDF from design
- `design_render` - Render design preview
- `qr_code_generate` - Generate QR code with DASH logo
- `image_process` - Resize, crop, enhance images
- `template_apply` - Apply template to design

## Explicit Columns Added

**Design-Specific:**
- `design_type` (card_front, card_back, poster, both)
- `product_dimensions` ('4x6', '20x30', etc.)
- `revision_number` (integer, default 1)
- `approval_status` (pending, approved, rejected, needs_revision)
- `preview_url` (design preview image URL)
- `print_ready_url` (print-ready PDF URL)

## JSONB Metadata Structure

**For `metadata` column:**
```json
{
  "design_data": {
    "front": {
      "name": "Mom",
      "sunrise": "June 28, 1965",
      "sunset": "Oct 11, 2025",
      "photo": "...",
      "textColor": "#512DA8",
      "fontIndex": 0,
      "font": "Playfair Display",
      "backgroundIndex": 0,
      "background": "/sky background front.jpg"
    },
    "back": {
      "skyPhoto": "...",
      "skyBackgroundIndex": 0,
      "psalm23Text": "...",
      "qrCodeUrl": "...",
      "textColor": "#512DA8"
    },
    "language": "en"
  },
  "template_id": "classic_sky",
  "print_settings": {
    "bleed": "0.125in",
    "color_mode": "CMYK",
    "resolution": "300dpi"
  },
  "qr_settings": {
    "logo_url": "...",
    "error_correction": "M",
    "size": "60x60px"
  }
}
```

## JSONB Result Data Structure

**For `result_data` column:**
```json
{
  "pdf_url": "...",
  "preview_url": "...",
  "qr_code_url": "...",
  "file_size_bytes": 2456789,
  "dimensions": {
    "width": 1200,
    "height": 1800
  },
  "color_profile": "CMYK",
  "rendering_time_ms": 1234
}
```

## Workflow Integration

1. **User designs card** → Creates `ai_job` with `job_type='design_render'`
2. **User approves** → Updates `approval_status='approved'`
3. **Generate PDF** → Creates `ai_job` with `job_type='pdf_generate'`
4. **Send to print shop** → Updates `orders.status='sent'`

## SQL Provided

See `backend/ALTER_AI_JOBS_DESIGN.sql` for the exact ALTER TABLE statements.

