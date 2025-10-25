# Company Settings - Quick Start Guide

## 🚀 Accessing Company Settings

### URL

```
http://localhost:3000/admin/settings/company
```

Or in production:

```
https://yourdomain.com/admin/settings/company
```

### Prerequisites

- Must be logged in as **SUPER_ADMIN** to modify settings
- ADMIN role can view settings but cannot save changes

## 📋 Settings Overview

### 1. Company Information Section

Configure basic business details:

- Company Name
- Full Address (Street, City, State, ZIP, Country)

### 2. Contact Information Section

Set up communication channels:

- Phone Number (with country code)
- Email Address
- Website URL

### 3. Tax Information Section

Manage tax compliance:

- **GSTIN**: 15-character GST number (required)
- **PAN**: 10-character PAN number (optional)
- **GST Rate**: Decimal format (e.g., 0.18 for 18%)

### 4. Invoice Settings Section

Customize invoice generation:

- **Invoice Prefix**: Appears in invoice numbers (e.g., "INV")
- **Invoice Terms**: Payment terms displayed on invoices
- **Invoice Notes**: Additional notes (optional)
- **Company Logo**: URL to logo image (optional)

### 5. Bank Details Section

Add payment instructions (all optional):

- Bank Name
- Branch Name
- Account Number
- IFSC Code

## 💡 Usage Tips

### Default Values

On first access, the system auto-creates default settings for Numa Jewelry. Simply update the values to match your business.

### GST Rate Format

⚠️ **Important**: Enter GST rate as a decimal!

- For 18% GST → Enter `0.18`
- For 12% GST → Enter `0.12`
- For 5% GST → Enter `0.05`

### GSTIN Format

Must be exactly 15 characters:

```
Example: 27ABCDE1234F1Z5
Format: [State Code][PAN][Entity Code][Check Digit]
```

### Invoice Numbering

The system generates invoice numbers using this format:

```
{Invoice Prefix}-{Year}-{Sequential Number}
Example: INV-2024-000123
```

## ✅ Validation Rules

### Required Fields

These fields must be filled:

- Company Name
- Address, City, State, ZIP, Country
- Phone, Email, Website
- GSTIN
- GST Rate
- Invoice Prefix
- Invoice Terms

### Optional Fields

Can be left blank:

- PAN
- Invoice Notes
- Company Logo
- All Bank Details

### Field Constraints

- **Email**: Must be valid email format
- **GSTIN**: Exactly 15 characters
- **PAN**: Exactly 10 characters (if provided)
- **GST Rate**: Between 0 and 1
- **Logo**: Must be valid URL (if provided)

## 🎯 Common Tasks

### Task 1: Update Company Address

1. Navigate to Company Information section
2. Update Address, City, State, ZIP fields
3. Click "Save Changes"
4. See success notification
5. New invoices will show updated address

### Task 2: Change GST Rate

1. Go to Tax Information section
2. Update "GST Rate" field (decimal format)
3. Click "Save Changes"
4. All future invoices will use new rate

### Task 3: Customize Invoice Prefix

1. Find Invoice Settings section
2. Change "Invoice Prefix" (e.g., "NUMA" or "INV")
3. Save changes
4. Next invoice will be: `NUMA-2024-000124`

### Task 4: Add Bank Details

1. Scroll to Bank Details section
2. Fill in bank information
3. Save changes
4. Bank details will appear on future invoices

## 🔒 Security Notes

### Access Control

- **Super Admin**: Full read/write access ✅
- **Admin**: Read-only access (view but not modify) 👁️
- **Regular Users**: No access ❌

### Permissions Error

If you see "Forbidden - Super Admin access required":

- You're logged in as ADMIN (not SUPER_ADMIN)
- Contact a Super Admin to make changes
- Or ask developer to promote your role

## 🐛 Troubleshooting

### "Failed to load settings"

**Cause**: Database connection issue or settings not initialized
**Solution**: Refresh page. If persists, check server logs.

### "Validation failed" on save

**Cause**: Invalid data in required fields
**Solution**: Check error message details. Common issues:

- GSTIN not exactly 15 characters
- Email format invalid
- GST Rate not between 0-1
- Required fields empty

### Changes not appearing on invoices

**Cause**: Using old invoice data (frozen invoices preserve original data)
**Solution**:

- Generate a NEW invoice for a new order
- Existing invoices retain original settings (by design)
- To update old invoice, regenerate it

### Can't save changes

**Cause 1**: Not logged in as SUPER_ADMIN
**Solution**: Check your role in profile or ask admin

**Cause 2**: Network error
**Solution**: Check internet connection, retry

**Cause 3**: Server error
**Solution**: Check browser console, contact developer

## 📞 Support

### For Questions

- Check this guide first
- Review `INVOICE_SYSTEM_ENHANCEMENTS.md` for technical details
- Contact development team

### For Bugs

- Note exact error message
- Take screenshot
- Report to developer with steps to reproduce

## 🎨 UI Navigation

### Page Layout

```
┌─────────────────────────────────────────┐
│  Company Settings          [Save Button] │
│  Manage company information...           │
├─────────────────────────────────────────┤
│  🏢 Company Information                  │
│  [Name] [Country]                        │
│  [Address]                               │
│  [City] [State] [ZIP]                    │
├─────────────────────────────────────────┤
│  📞 Contact Information                  │
│  [Phone] [Email]                         │
│  [Website]                               │
├─────────────────────────────────────────┤
│  🧾 Tax Information                      │
│  [GSTIN] [PAN]                          │
│  [GST Rate]                             │
├─────────────────────────────────────────┤
│  📄 Invoice Settings                     │
│  [Prefix]                               │
│  [Terms]                                │
│  [Notes]                                │
│  [Logo URL]                             │
├─────────────────────────────────────────┤
│  🏦 Bank Details                         │
│  [Bank Name] [Branch]                    │
│  [Account Number] [IFSC]                 │
├─────────────────────────────────────────┤
│               [Save All Changes Button]  │
└─────────────────────────────────────────┘
```

### Visual Indicators

- **Gray spinner**: Loading settings
- **Blue button**: Ready to save
- **Blue spinner button**: Saving in progress
- **Green toast**: Success notification
- **Red toast**: Error notification

## ✨ Pro Tips

1. **Save Frequently**: Click save after each section to avoid losing changes
2. **Test Changes**: Generate a test invoice after updating settings
3. **Backup Info**: Keep a record of GSTIN, PAN, bank details separately
4. **Logo Format**: Use PNG or SVG for best invoice appearance
5. **Consistent Branding**: Keep company name format consistent across all fields

---

**Last Updated**: January 2025
**Version**: 1.0
**Access Level**: Super Admin Required
