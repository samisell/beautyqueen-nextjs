---
Task ID: 4
Agent: frontend-agent
Task: Enhance ContactPage form with phone, category, honeypot, validation

Work Log:
- Added phone number field (optional) with Phone icon, positioned between email and category
- Added category dropdown Select with 8 options: General Inquiry, Feedback, Complaint, Partnership, Payment Issues, Contestant Support, Technical Support, Other
- Added honeypot spam protection: hidden field positioned off-screen with aria-hidden, tabIndex=-1, autocomplete=off; bots that fill it trigger silent "success"
- Added comprehensive client-side validation:
  - Name: required, min 2 chars
  - Email: required, regex format validation
  - Phone: optional, if provided must be 7-15 digits (strips spaces, dashes, plus, parens)
  - Category: required selection
  - Message: required, min 10 chars with live character counter
- Implemented touched state tracking - errors only show after field is blurred
- Inline error messages with AlertCircle icon next to each field
- Error styling on inputs (destructive border + ring)
- Honeypot field excluded from API payload before sending
- All fields (name, email, phone, category, subject, message) sent to POST /api/contact
- Preserved all existing sections: hero, trust indicators, contact info cards, FAQ preview, CTA
- Used shadcn/ui Select, Input, Label, Textarea, Button, Card components
- Zero ESLint errors

Stage Summary:
- Contact form now fully functional with phone number, category dropdown, honeypot spam protection
- All fields validated client-side with inline error messages
- Honeypot silently traps bots without alerting them
- Character counter on message field for minimum length feedback
- Clean, accessible form with proper aria-invalid attributes
