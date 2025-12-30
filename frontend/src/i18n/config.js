// frontend/src/i18n/config.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: "Dashboard",
        myEvents: "My Events",
        logout: "Logout",
        profile: "Profile"
      },
      
      // Authentication
      auth: {
        login: "Login",
        signup: "Sign Up",
        email: "Email Address",
        password: "Password",
        fullName: "Full Name",
        createAccount: "Create Account",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        loggingIn: "Logging in...",
        creatingAccount: "Creating account...",
        forgotPassword: "Forgot Password?",
        rememberMe: "Remember me"
      },
      
      // Events
      events: {
        title: "My Events",
        createEvent: "Create Event",
        createNewEvent: "Create New Event",
        editEvent: "Edit Event",
        deleteEvent: "Delete Event",
        eventTitle: "Event Title",
        eventDate: "Event Date",
        location: "Location",
        description: "Description",
        noEvents: "No events yet",
        createFirstEvent: "Create your first event to get started",
        confirmDelete: "Are you sure you want to delete",
        deleteWarning: "This will permanently delete the event and all associated data (registrations, forms, emails). This action cannot be undone.",
        deleting: "Deleting...",
        cancel: "Cancel",
        save: "Save",
        update: "Update",
        capacity: "Maximum Capacity",
        unlimited: "Unlimited",
        registrationDeadline: "Registration Deadline",
        status: "Status",
        draft: "Draft",
        published: "Published",
        cancelled: "Cancelled",
        completed: "Completed",
        saveAsTemplate: "Save as Template",
        useTemplate: "Use Template"
      },
      
      // Stakeholder Groups
      stakeholder: {
        title: "Stakeholder Groups",
        createForm: "Create Form",
        editForm: "Edit Form",
        groupName: "Group Name",
        formFields: "Form Fields",
        fieldName: "Field Name",
        fieldType: "Field Type",
        required: "Required",
        addField: "Add Field",
        publicLink: "Public Registration Link",
        copy: "Copy",
        copied: "Copied!",
        noGroups: "No Stakeholder Groups Yet",
        createFirstForm: "Create forms for different types of participants"
      },
      
      // Registrations
      registrations: {
        title: "Registrations",
        selectType: "Select Registration Type",
        completeRegistration: "Complete Registration",
        success: "Registration Successful!",
        registeredAs: "Registered as",
        yourQRCode: "Your QR Code",
        saveQRCode: "Save this QR code for check-in",
        registerAnother: "Register Another",
        submitting: "Submitting...",
        noRegistrations: "No registrations yet",
        allGroups: "All Groups",
        name: "Name",
        email: "Email",
        group: "Group",
        status: "Status",
        date: "Date",
        checkedIn: "Checked In",
        pending: "Pending",
        filter: "Filter by Group"
      },
      
      // Check-in Scanner
      scanner: {
        title: "Check-in Scanner",
        scanQR: "Scan QR Code",
        closeCamera: "Close Camera",
        refresh: "Refresh",
        positionQR: "Position QR code in camera view",
        holdQR: "Hold participant's QR code in front of camera",
        checkInSuccess: "Check-in successful!",
        checkInRemoved: "Check-in removed!",
        checkInFailed: "Check-in failed. Please try again.",
        invalidQR: "Invalid QR code. Registration not found.",
        invalidFormat: "Invalid QR code format.",
        differentEvent: "This QR code is for a different event.",
        tryRefresh: "Registration not found. Try refreshing the list.",
        totalRegistrations: "Total Registrations",
        checkedIn: "Checked In",
        pendingCheckIn: "Pending Check-in",
        searchParticipant: "Search participant by name or email...",
        found: "Found",
        participants: "participant(s)",
        participantList: "Participant List",
        noParticipants: "No participants found matching your search",
        checkIn: "Check In",
        undoCheckIn: "Undo Check-in",
        registered: "Registered",
        time: "Time",
        quickTips: "Quick Tips",
        tipScan: "Click \"Scan QR Code\" to open camera and scan participant QR codes automatically",
        tipRefresh: "Click \"Refresh\" if you just registered someone and they're not showing up",
        tipSearch: "Use the search bar to quickly find participants by name or email",
        tipManual: "Click \"Check In\" button for manual check-in without scanning",
        cancelScanning: "Cancel Scanning",
        loaded: "Loaded",
        registrations: "registrations"
      },
      
      // Email
      email: {
        title: "Send Email Announcement",
        selectGroups: "Select Stakeholder Groups",
        subject: "Email Subject",
        message: "Message",
        send: "Send Email",
        sending: "Sending...",
        sentSuccess: "Email sent successfully to",
        recipients: "recipient(s)",
        noGroups: "No stakeholder groups available. Create forms first.",
        fields: "fields",
        allFields: "All fields are required",
        selectAtLeast: "Please select at least one stakeholder group",
        messageWillBeSent: "This message will be sent to all registrants in the selected groups"
      },
      
      // Analytics
      analytics: {
        title: "Analytics Dashboard",
        summary: "Summary",
        trends: "Trends",
        demographics: "Demographics",
        totalRegistrations: "Total Registrations",
        checkedIn: "Checked In",
        pendingCheckIn: "Pending Check-in",
        checkInRate: "check-in rate",
        stakeholderGroups: "Stakeholder Groups",
        registrationsByGroup: "Registrations by Group",
        registrationTrend: "Registration Trend (Last 7 Days)",
        noData: "No registration data available yet",
        export: "Export Report",
        exportPDF: "Export as PDF",
        exportExcel: "Export as Excel",
        registrationsByDay: "Registrations by Day",
        peakRegistrationTime: "Peak Registration Time",
        averageCheckInTime: "Average Check-in Time"
      },
      
      // Team Management
      team: {
        title: "Team Management",
        addMember: "Add Team Member",
        members: "Team Members",
        role: "Role",
        permissions: "Permissions",
        owner: "Owner",
        editor: "Editor",
        viewer: "Viewer",
        canEdit: "Can Edit",
        canView: "Can View Only",
        canManage: "Can Manage Everything",
        inviteEmail: "Invite by Email",
        invite: "Send Invite",
        pending: "Pending",
        active: "Active",
        remove: "Remove",
        noMembers: "No team members yet",
        inviteFirst: "Invite team members to collaborate on this event"
      },
      
      // Templates
      templates: {
        title: "Event Templates",
        myTemplates: "My Templates",
        useTemplate: "Use Template",
        saveAsTemplate: "Save as Template",
        templateName: "Template Name",
        save: "Save Template",
        delete: "Delete Template",
        noTemplates: "No templates yet",
        createFirst: "Save your first event as a template for quick reuse",
        applyTemplate: "Apply Template",
        confirmApply: "This will replace current event settings. Continue?",
        savedSuccess: "Template saved successfully",
        appliedSuccess: "Template applied successfully"
      },
      
      // Common
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        confirm: "Confirm",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        save: "Save",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        search: "Search",
        filter: "Filter",
        export: "Export",
        import: "Import",
        download: "Download",
        upload: "Upload",
        required: "Required",
        optional: "Optional",
        yes: "Yes",
        no: "No",
        all: "All",
        none: "None",
        select: "Select",
        actions: "Actions",
        details: "Details",
        settings: "Settings",
        language: "Language"
      }
    }
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        dashboard: "لوحة التحكم",
        myEvents: "فعالياتي",
        logout: "تسجيل الخروج",
        profile: "الملف الشخصي"
      },
      
      // Authentication
      auth: {
        login: "تسجيل الدخول",
        signup: "إنشاء حساب",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        fullName: "الاسم الكامل",
        createAccount: "إنشاء حساب",
        alreadyHaveAccount: "هل لديك حساب بالفعل؟",
        dontHaveAccount: "ليس لديك حساب؟",
        loggingIn: "جاري تسجيل الدخول...",
        creatingAccount: "جاري إنشاء الحساب...",
        forgotPassword: "نسيت كلمة المرور؟",
        rememberMe: "تذكرني"
      },
      
      // Events
      events: {
        title: "فعالياتي",
        createEvent: "إنشاء فعالية",
        createNewEvent: "إنشاء فعالية جديدة",
        editEvent: "تعديل الفعالية",
        deleteEvent: "حذف الفعالية",
        eventTitle: "عنوان الفعالية",
        eventDate: "تاريخ الفعالية",
        location: "الموقع",
        description: "الوصف",
        noEvents: "لا توجد فعاليات بعد",
        createFirstEvent: "أنشئ أول فعالية للبدء",
        confirmDelete: "هل أنت متأكد من حذف",
        deleteWarning: "سيتم حذف الفعالية وجميع البيانات المرتبطة بها (التسجيلات، النماذج، الرسائل) بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
        deleting: "جاري الحذف...",
        cancel: "إلغاء",
        save: "حفظ",
        update: "تحديث",
        capacity: "الحد الأقصى للمشاركين",
        unlimited: "غير محدود",
        registrationDeadline: "الموعد النهائي للتسجيل",
        status: "الحالة",
        draft: "مسودة",
        published: "منشور",
        cancelled: "ملغي",
        completed: "مكتمل",
        saveAsTemplate: "حفظ كقالب",
        useTemplate: "استخدام قالب"
      },
      
      // Stakeholder Groups
      stakeholder: {
        title: "مجموعات أصحاب المصلحة",
        createForm: "إنشاء نموذج",
        editForm: "تعديل النموذج",
        groupName: "اسم المجموعة",
        formFields: "حقول النموذج",
        fieldName: "اسم الحقل",
        fieldType: "نوع الحقل",
        required: "مطلوب",
        addField: "إضافة حقل",
        publicLink: "رابط التسجيل العام",
        copy: "نسخ",
        copied: "تم النسخ!",
        noGroups: "لا توجد مجموعات بعد",
        createFirstForm: "أنشئ نماذج لأنواع مختلفة من المشاركين"
      },
      
      // Registrations
      registrations: {
        title: "التسجيلات",
        selectType: "اختر نوع التسجيل",
        completeRegistration: "إكمال التسجيل",
        success: "تم التسجيل بنجاح!",
        registeredAs: "مسجل كـ",
        yourQRCode: "رمز الاستجابة السريعة الخاص بك",
        saveQRCode: "احفظ هذا الرمز لتسجيل الحضور",
        registerAnother: "تسجيل آخر",
        submitting: "جاري الإرسال...",
        noRegistrations: "لا توجد تسجيلات بعد",
        allGroups: "جميع المجموعات",
        name: "الاسم",
        email: "البريد الإلكتروني",
        group: "المجموعة",
        status: "الحالة",
        date: "التاريخ",
        checkedIn: "تم تسجيل الحضور",
        pending: "قيد الانتظار",
        filter: "تصفية حسب المجموعة"
      },
      
      // Check-in Scanner
      scanner: {
        title: "ماسح تسجيل الحضور",
        scanQR: "مسح رمز الاستجابة السريعة",
        closeCamera: "إغلاق الكاميرا",
        refresh: "تحديث",
        positionQR: "ضع رمز الاستجابة السريعة أمام الكاميرا",
        holdQR: "امسك رمز الاستجابة السريعة للمشارك أمام الكاميرا",
        checkInSuccess: "تم تسجيل الحضور بنجاح!",
        checkInRemoved: "تم إلغاء تسجيل الحضور!",
        checkInFailed: "فشل تسجيل الحضور. حاول مرة أخرى.",
        invalidQR: "رمز استجابة سريعة غير صالح. التسجيل غير موجود.",
        invalidFormat: "تنسيق رمز الاستجابة السريعة غير صالح.",
        differentEvent: "هذا الرمز لفعالية أخرى.",
        tryRefresh: "التسجيل غير موجود. جرب التحديث.",
        totalRegistrations: "إجمالي التسجيلات",
        checkedIn: "تم تسجيل حضورهم",
        pendingCheckIn: "في انتظار التسجيل",
        searchParticipant: "البحث عن مشارك بالاسم أو البريد الإلكتروني...",
        found: "تم العثور على",
        participants: "مشارك",
        participantList: "قائمة المشاركين",
        noParticipants: "لم يتم العثور على مشاركين مطابقين للبحث",
        checkIn: "تسجيل الحضور",
        undoCheckIn: "إلغاء تسجيل الحضور",
        registered: "مسجل",
        time: "الوقت",
        quickTips: "نصائح سريعة",
        tipScan: "انقر على \"مسح رمز الاستجابة السريعة\" لفتح الكاميرا ومسح رموز المشاركين تلقائياً",
        tipRefresh: "انقر على \"تحديث\" إذا قمت بتسجيل شخص ولا يظهر",
        tipSearch: "استخدم شريط البحث للعثور بسرعة على المشاركين بالاسم أو البريد الإلكتروني",
        tipManual: "انقر على زر \"تسجيل الحضور\" للتسجيل اليدوي بدون مسح",
        cancelScanning: "إلغاء المسح",
        loaded: "تم تحميل",
        registrations: "تسجيل"
      },
      
      // Email
      email: {
        title: "إرسال إعلان بالبريد الإلكتروني",
        selectGroups: "اختر مجموعات أصحاب المصلحة",
        subject: "موضوع البريد الإلكتروني",
        message: "الرسالة",
        send: "إرسال البريد",
        sending: "جاري الإرسال...",
        sentSuccess: "تم إرسال البريد الإلكتروني بنجاح إلى",
        recipients: "مستلم",
        noGroups: "لا توجد مجموعات متاحة. أنشئ نماذج أولاً.",
        fields: "حقول",
        allFields: "جميع الحقول مطلوبة",
        selectAtLeast: "يرجى اختيار مجموعة واحدة على الأقل",
        messageWillBeSent: "سيتم إرسال هذه الرسالة إلى جميع المسجلين في المجموعات المحددة"
      },
      
      // Analytics
      analytics: {
        title: "لوحة التحليلات",
        summary: "ملخص",
        trends: "الاتجاهات",
        demographics: "التركيبة السكانية",
        totalRegistrations: "إجمالي التسجيلات",
        checkedIn: "تم تسجيل حضورهم",
        pendingCheckIn: "في انتظار التسجيل",
        checkInRate: "معدل تسجيل الحضور",
        stakeholderGroups: "مجموعات أصحاب المصلحة",
        registrationsByGroup: "التسجيلات حسب المجموعة",
        registrationTrend: "اتجاه التسجيل (آخر 7 أيام)",
        noData: "لا توجد بيانات تسجيل متاحة بعد",
        export: "تصدير التقرير",
        exportPDF: "تصدير كـ PDF",
        exportExcel: "تصدير كـ Excel",
        registrationsByDay: "التسجيلات حسب اليوم",
        peakRegistrationTime: "وقت ذروة التسجيل",
        averageCheckInTime: "متوسط وقت تسجيل الحضور"
      },
      
      // Team Management
      team: {
        title: "إدارة الفريق",
        addMember: "إضافة عضو فريق",
        members: "أعضاء الفريق",
        role: "الدور",
        permissions: "الصلاحيات",
        owner: "مالك",
        editor: "محرر",
        viewer: "مشاهد",
        canEdit: "يمكنه التعديل",
        canView: "يمكنه المشاهدة فقط",
        canManage: "يمكنه إدارة كل شيء",
        inviteEmail: "دعوة عبر البريد الإلكتروني",
        invite: "إرسال دعوة",
        pending: "قيد الانتظار",
        active: "نشط",
        remove: "إزالة",
        noMembers: "لا يوجد أعضاء فريق بعد",
        inviteFirst: "قم بدعوة أعضاء الفريق للتعاون في هذه الفعالية"
      },
      
      // Templates
      templates: {
        title: "قوالب الفعاليات",
        myTemplates: "قوالبي",
        useTemplate: "استخدام قالب",
        saveAsTemplate: "حفظ كقالب",
        templateName: "اسم القالب",
        save: "حفظ القالب",
        delete: "حذف القالب",
        noTemplates: "لا توجد قوالب بعد",
        createFirst: "احفظ أول فعالية كقالب لإعادة استخدامها بسرعة",
        applyTemplate: "تطبيق القالب",
        confirmApply: "سيتم استبدال إعدادات الفعالية الحالية. هل تريد المتابعة؟",
        savedSuccess: "تم حفظ القالب بنجاح",
        appliedSuccess: "تم تطبيق القالب بنجاح"
      },
      
      // Common
      common: {
        loading: "جاري التحميل...",
        error: "خطأ",
        success: "نجاح",
        confirm: "تأكيد",
        cancel: "إلغاء",
        delete: "حذف",
        edit: "تعديل",
        save: "حفظ",
        close: "إغلاق",
        back: "رجوع",
        next: "التالي",
        previous: "السابق",
        search: "بحث",
        filter: "تصفية",
        export: "تصدير",
        import: "استيراد",
        download: "تحميل",
        upload: "رفع",
        required: "مطلوب",
        optional: "اختياري",
        yes: "نعم",
        no: "لا",
        all: "الكل",
        none: "لا شيء",
        select: "اختر",
        actions: "الإجراءات",
        details: "التفاصيل",
        settings: "الإعدادات",
        language: "اللغة"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;