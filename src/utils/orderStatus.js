// ═══════════════════════════════════════════════════════════════
// مصدر الحقيقة الواحد لحالات الطلب — يُستورَد في لوحة العميل/الإدارة/البريد
// لتفادي تضارب الأسماء (مثلاً shipped مقابل shipping).
// emailable: هل تُرسَل رسالة للعميل عند الوصول لهذه الحالة؟
//   (cancelled تُعالَج برسالة إلغاء منفصلة، فلا تُعَدّ هنا emailable)
// ═══════════════════════════════════════════════════════════════
export const ORDER_STATUS = {
  awaiting_payment: { label_ar: 'بانتظار الدفع',  label_en: 'Awaiting Payment', bg: '#FFF7ED', color: '#EA580C', emailable: false },
  pending_payment:  { label_ar: 'إيصال مرفوع',    label_en: 'Receipt Uploaded', bg: '#FEF3C7', color: '#D97706', emailable: false },
  pending:          { label_ar: 'قيد المراجعة',   label_en: 'Pending',          bg: '#EFF6FF', color: '#2563EB', emailable: false },
  confirmed:        { label_ar: 'مؤكّد',           label_en: 'Confirmed',        bg: '#F0FDF4', color: '#16A34A', emailable: true  },
  processing:       { label_ar: 'جارٍ التجهيز',    label_en: 'Processing',       bg: '#FEF3C7', color: '#D97706', emailable: true  },
  shipped:          { label_ar: 'قيد الشّحن',       label_en: 'Shipped',          bg: '#F5F3FF', color: '#7C3AED', emailable: true  },
  delivered:        { label_ar: 'تمَّ التسليم',     label_en: 'Delivered',        bg: '#ECFDF5', color: '#059669', emailable: true  },
  cancelled:        { label_ar: 'ملغي',            label_en: 'Cancelled',        bg: '#FEF2F2', color: '#DC2626', emailable: false },
}

// قيمة افتراضيّة آمنة لأيّ حالة غير معروفة
export const FALLBACK_STATUS = { label_ar: 'قيد المعالجة', label_en: 'Processing', bg: '#F5E6D3', color: '#9C6B4E', emailable: false }

export function getStatus(status) {
  return ORDER_STATUS[status] || FALLBACK_STATUS
}

// هل تستحقّ هذه الحالة إرسال بريد تلقائيّ للعميل؟ (يُستثنى confirmed/cancelled لأنّهما يُعالَجان بمسار خاصّ)
export function isEmailable(status) {
  return ORDER_STATUS[status]?.emailable === true
}
