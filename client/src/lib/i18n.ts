// ============================================================
// Ghist i18n — 20 locale translations
// ============================================================

export const LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur",
  "id", "de", "ja", "vi", "te", "mr", "tr", "ta", "fa", "ko",
] as const;

export type Locale = typeof LOCALES[number];

export const RTL_LOCALES: Locale[] = ["ar", "ur", "fa"];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export interface Translations {
  nav: {
    home: string;
    privacy: string;
    terms: string;
    about: string;
    faq: string;
    blog: string;
    contact: string;
  };
  home: {
    tagline: string;
    description: string;
    cta: string;
  };
  privacy: {
    title: string;
    sections: {
      what_we_collect: string;
      how_we_use: string;
      data_retention: string;
      cookies: string;
      contact: string;
    };
  };
  terms: {
    title: string;
    sections: {
      acceptable_use: string;
      prohibited: string;
      liability: string;
      changes: string;
      governing_law: string;
    };
  };
  about: {
    title: string;
    description: string;
    mission: string;
    values: string;
  };
  faq: {
    title: string;
    questions: Array<{ q: string; a: string }>;
  };
  blog: {
    title: string;
    read_more: string;
    all_posts: string;
    by_category: string;
  };
  contact: {
    title: string;
    name_label: string;
    email_label: string;
    subject_label: string;
    message_label: string;
    submit: string;
    success: string;
    error: string;
  };
  footer: {
    tagline: string;
    legal: string;
  };
  meta: {
    home_title: string;
    home_desc: string;
  };
}

const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: "Home",
      privacy: "Privacy",
      terms: "Terms",
      about: "About",
      faq: "FAQ",
      blog: "Blog",
      contact: "Contact",
    },
    home: {
      tagline: "Instant disposable email. No sign-up. No tracking.",
      description: "Get a free temporary email address in seconds. Perfect for free trials, OTPs, and avoiding spam. Auto-deleted after 24 hours.",
      cta: "Generate Email",
    },
    privacy: {
      title: "Privacy Policy — Ghist",
      sections: {
        what_we_collect: "What we collect",
        how_we_use: "How we use it",
        data_retention: "Data retention",
        cookies: "Cookies",
        contact: "Contact",
      },
    },
    terms: {
      title: "Terms of Service — Ghist",
      sections: {
        acceptable_use: "Acceptable use",
        prohibited: "Prohibited activities",
        liability: "Limitation of liability",
        changes: "Changes to terms",
        governing_law: "Governing law",
      },
    },
    about: {
      title: "About Ghist",
      description: "Ghist is a free disposable email service built for privacy-conscious users who want to protect their real inbox from spam and tracking.",
      mission: "Our mission is to make privacy simple and accessible — a temporary email in seconds, no account needed, nothing stored.",
      values: "We believe in minimal data collection, full transparency, and ephemeral-by-design architecture.",
    },
    faq: {
      title: "Frequently Asked Questions",
      questions: [
        { q: "What is Ghist?", a: "Ghist is a free disposable temporary email service. It generates an anonymous email address instantly — no account or sign-up required. All emails are permanently deleted after 24 hours." },
        { q: "How long does a Ghist email address last?", a: "Every Ghist email address and all its messages are automatically and permanently deleted after 24 hours. There is no way to recover them after deletion." },
        { q: "Is Ghist completely free?", a: "Yes. Ghist is 100% free with no premium tiers, no sign-up, and no credit card required." },
        { q: "Do I need to create an account?", a: "No. Ghist generates a temporary email address the moment you open the site. No account, no password, no personal information required." },
        { q: "Is Ghist safe for verification codes and OTPs?", a: "Yes. Ghist uses TLS 1.3 encryption and sessions are isolated — your temporary address is never linked to your real identity. It is ideal for receiving one-time passwords and verification links." },
        { q: "What is Ghist useful for?", a: "Ghist is useful for signing up for free trials without receiving spam, downloading gated content, receiving verification codes, claiming promo codes, and any situation where you need a temporary email address without exposing your real inbox." },
        { q: "Does Ghist store or sell my data?", a: "No. Ghist does not require any personal information, does not track users, and permanently deletes all emails after 24 hours. There is nothing to store or sell." },
        { q: "What happens to my emails after 24 hours?", a: "All emails and the temporary email address itself are permanently and irrecoverably deleted after 24 hours. This is by design — Ghist is ephemeral by architecture." },
        { q: "Can I send emails from a Ghist address?", a: "No. Ghist is a receive-only service. You can only receive emails, not send them. This prevents misuse for spam or phishing." },
        { q: "Can I choose my own email address?", a: "Currently, Ghist generates a random address automatically. Custom addresses are not supported — this is intentional to keep the service anonymous and fast." },
      ],
    },
    blog: {
      title: "Ghist Blog",
      read_more: "Read more",
      all_posts: "All posts",
      by_category: "By category",
    },
    contact: {
      title: "Contact Us",
      name_label: "Your name",
      email_label: "Your email",
      subject_label: "Subject",
      message_label: "Message",
      submit: "Send message",
      success: "Your message was sent successfully. We'll get back to you soon.",
      error: "Something went wrong. Please try again later.",
    },
    footer: {
      tagline: "Communication without the digital footprint. Ephemeral by design.",
      legal: "All data auto-deleted after 24 hours. No signup, no tracking.",
    },
    meta: {
      home_title: "Free Temporary Email Address | Ghist — Instant & Anonymous",
      home_desc: "Get a free disposable email address in seconds — no sign-up, no tracking. Perfect for free trials, OTPs, and avoiding spam. Permanently deleted after 24 hours.",
    },
  },

  zh: {
    nav: {
      home: "首页",
      privacy: "隐私政策",
      terms: "服务条款",
      about: "关于我们",
      faq: "常见问题",
      blog: "博客",
      contact: "联系我们",
    },
    home: {
      tagline: "即时一次性邮箱。无需注册。无追踪。",
      description: "几秒钟内获得免费临时邮箱地址。完美适用于免费试用、验证码接收和避免垃圾邮件。24小时后自动删除。",
      cta: "生成邮箱",
    },
    privacy: {
      title: "隐私政策 — Ghist",
      sections: {
        what_we_collect: "我们收集的信息",
        how_we_use: "我们如何使用",
        data_retention: "数据保留",
        cookies: "Cookie",
        contact: "联系方式",
      },
    },
    terms: {
      title: "服务条款 — Ghist",
      sections: {
        acceptable_use: "可接受的使用",
        prohibited: "禁止活动",
        liability: "责任限制",
        changes: "条款变更",
        governing_law: "适用法律",
      },
    },
    about: {
      title: "关于 Ghist",
      description: "Ghist 是一项免费的一次性邮箱服务，专为重视隐私的用户设计，帮助他们保护真实收件箱免受垃圾邮件和追踪。",
      mission: "我们的使命是让隐私保护变得简单易用——几秒钟内生成临时邮箱，无需账户，不存储任何数据。",
      values: "我们相信最少化数据收集、完全透明，以及从架构上实现短暂性设计。",
    },
    faq: {
      title: "常见问题解答",
      questions: [
        { q: "Ghist 是什么？", a: "Ghist 是一项免费的一次性临时邮箱服务。它可以即时生成匿名邮箱地址——无需账户或注册。所有邮件在24小时后永久删除。" },
        { q: "Ghist 邮箱地址能用多久？", a: "每个 Ghist 邮箱地址及其所有邮件在24小时后自动永久删除。删除后无法恢复。" },
        { q: "Ghist 完全免费吗？", a: "是的。Ghist 100% 免费，没有高级套餐，无需注册，也不需要信用卡。" },
        { q: "我需要创建账户吗？", a: "不需要。打开网站时，Ghist 会立即生成临时邮箱地址。无需账户、密码或个人信息。" },
        { q: "Ghist 适合接收验证码和一次性密码吗？", a: "是的。Ghist 使用 TLS 1.3 加密，会话相互隔离——您的临时地址永远不会与真实身份关联。非常适合接收一次性密码和验证链接。" },
        { q: "Ghist 有什么用处？", a: "Ghist 适用于注册免费试用而不收到垃圾邮件、下载付费内容、接收验证码、领取促销码，以及任何需要临时邮箱而不暴露真实收件箱的场景。" },
        { q: "Ghist 会存储或出售我的数据吗？", a: "不会。Ghist 不需要任何个人信息，不追踪用户，并在24小时后永久删除所有邮件。没有什么可存储或出售的。" },
        { q: "24小时后我的邮件会怎样？", a: "所有邮件和临时邮箱地址本身在24小时后永久且不可逆地删除。这是设计使然——Ghist 从架构上实现短暂性。" },
        { q: "我可以从 Ghist 地址发送邮件吗？", a: "不可以。Ghist 是仅接收服务。您只能接收邮件，不能发送。这可以防止被用于垃圾邮件或网络钓鱼。" },
        { q: "我可以选择自己的邮箱地址吗？", a: "目前，Ghist 会自动生成随机地址。不支持自定义地址——这是故意设计的，以保持服务的匿名性和速度。" },
      ],
    },
    blog: {
      title: "Ghist 博客",
      read_more: "阅读更多",
      all_posts: "所有文章",
      by_category: "按类别",
    },
    contact: {
      title: "联系我们",
      name_label: "您的姓名",
      email_label: "您的邮箱",
      subject_label: "主题",
      message_label: "消息",
      submit: "发送消息",
      success: "您的消息已成功发送。我们将尽快回复您。",
      error: "出现了问题，请稍后再试。",
    },
    footer: {
      tagline: "无数字足迹的通信。短暂性设计。",
      legal: "所有数据24小时后自动删除。无注册，无追踪。",
    },
    meta: {
      home_title: "免费临时邮箱地址 | Ghist — 即时匿名",
      home_desc: "几秒钟内获得免费一次性邮箱地址——无需注册，无追踪。完美适用于免费试用、验证码和避免垃圾邮件。24小时后永久删除。",
    },
  },

  hi: {
    nav: {
      home: "होम",
      privacy: "गोपनीयता",
      terms: "नियम",
      about: "हमारे बारे में",
      faq: "सामान्य प्रश्न",
      blog: "ब्लॉग",
      contact: "संपर्क",
    },
    home: {
      tagline: "तत्काल डिस्पोजेबल ईमेल। कोई साइन-अप नहीं। कोई ट्रैकिंग नहीं।",
      description: "सेकंडों में मुफ्त अस्थायी ईमेल पता पाएं। मुफ्त ट्रायल, OTP और स्पैम से बचने के लिए बिल्कुल सही। 24 घंटे बाद स्वतः हटा दिया जाता है।",
      cta: "ईमेल बनाएं",
    },
    privacy: {
      title: "गोपनीयता नीति — Ghist",
      sections: {
        what_we_collect: "हम क्या एकत्र करते हैं",
        how_we_use: "हम इसका उपयोग कैसे करते हैं",
        data_retention: "डेटा प्रतिधारण",
        cookies: "कुकीज़",
        contact: "संपर्क",
      },
    },
    terms: {
      title: "सेवा की शर्तें — Ghist",
      sections: {
        acceptable_use: "स्वीकार्य उपयोग",
        prohibited: "निषिद्ध गतिविधियां",
        liability: "दायित्व की सीमा",
        changes: "शर्तों में बदलाव",
        governing_law: "शासी कानून",
      },
    },
    about: {
      title: "Ghist के बारे में",
      description: "Ghist एक मुफ्त डिस्पोजेबल ईमेल सेवा है जो गोपनीयता-सचेत उपयोगकर्ताओं के लिए बनाई गई है जो अपने वास्तविक इनबॉक्स को स्पैम और ट्रैकिंग से बचाना चाहते हैं।",
      mission: "हमारा मिशन गोपनीयता को सरल और सुलभ बनाना है — सेकंडों में अस्थायी ईमेल, बिना खाते के, कुछ भी संग्रहीत नहीं।",
      values: "हम न्यूनतम डेटा संग्रह, पूर्ण पारदर्शिता, और एफेमेरल-बाय-डिज़ाइन आर्किटेक्चर में विश्वास करते हैं।",
    },
    faq: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      questions: [
        { q: "Ghist क्या है?", a: "Ghist एक मुफ्त डिस्पोजेबल अस्थायी ईमेल सेवा है। यह तुरंत एक गुमनाम ईमेल पता बनाता है — बिना किसी खाते या साइन-अप के। सभी ईमेल 24 घंटे बाद स्थायी रूप से हटा दिए जाते हैं।" },
        { q: "Ghist ईमेल पता कितने समय तक चलता है?", a: "हर Ghist ईमेल पता और उसके सभी संदेश 24 घंटे बाद स्वचालित रूप से स्थायी रूप से हटा दिए जाते हैं। हटाने के बाद इन्हें पुनर्प्राप्त नहीं किया जा सकता।" },
        { q: "क्या Ghist पूरी तरह मुफ्त है?", a: "हां। Ghist 100% मुफ्त है बिना किसी प्रीमियम टियर के, बिना साइन-अप के, और बिना क्रेडिट कार्ड के।" },
        { q: "क्या मुझे खाता बनाने की ज़रूरत है?", a: "नहीं। Ghist साइट खोलते ही अस्थायी ईमेल पता बना देता है। कोई खाता, पासवर्ड या व्यक्तिगत जानकारी नहीं चाहिए।" },
        { q: "क्या Ghist OTP के लिए सुरक्षित है?", a: "हां। Ghist TLS 1.3 एन्क्रिप्शन का उपयोग करता है और सत्र अलग होते हैं — आपका अस्थायी पता कभी भी आपकी वास्तविक पहचान से जुड़ा नहीं होता।" },
        { q: "Ghist किस लिए उपयोगी है?", a: "Ghist मुफ्त ट्रायल साइनअप, गेटेड कंटेंट डाउनलोड, सत्यापन कोड प्राप्त करने और किसी भी स्थिति में उपयोगी है जहाँ आपको अपना वास्तविक इनबॉक्स उजागर किए बिना अस्थायी ईमेल की आवश्यकता होती है।" },
        { q: "क्या Ghist मेरा डेटा संग्रहीत या बेचता है?", a: "नहीं। Ghist को किसी व्यक्तिगत जानकारी की आवश्यकता नहीं है, उपयोगकर्ताओं को ट्रैक नहीं करता, और 24 घंटे बाद सभी ईमेल स्थायी रूप से हटा देता है।" },
        { q: "24 घंटे बाद मेरे ईमेल का क्या होता है?", a: "सभी ईमेल और अस्थायी ईमेल पता 24 घंटे बाद स्थायी रूप से और अपरिवर्तनीय रूप से हटा दिए जाते हैं। यह डिज़ाइन द्वारा है।" },
        { q: "क्या मैं Ghist पते से ईमेल भेज सकता हूं?", a: "नहीं। Ghist केवल प्राप्त करने वाली सेवा है। आप केवल ईमेल प्राप्त कर सकते हैं, भेज नहीं सकते।" },
        { q: "क्या मैं अपना ईमेल पता चुन सकता हूं?", a: "वर्तमान में, Ghist स्वचालित रूप से एक यादृच्छिक पता बनाता है। कस्टम पते समर्थित नहीं हैं।" },
      ],
    },
    blog: {
      title: "Ghist ब्लॉग",
      read_more: "और पढ़ें",
      all_posts: "सभी पोस्ट",
      by_category: "श्रेणी के अनुसार",
    },
    contact: {
      title: "हमसे संपर्क करें",
      name_label: "आपका नाम",
      email_label: "आपका ईमेल",
      subject_label: "विषय",
      message_label: "संदेश",
      submit: "संदेश भेजें",
      success: "आपका संदेश सफलतापूर्वक भेजा गया। हम जल्द ही आपसे संपर्क करेंगे।",
      error: "कुछ गलत हो गया। कृपया बाद में पुनः प्रयास करें।",
    },
    footer: {
      tagline: "डिजिटल निशान के बिना संचार। एफेमेरल डिज़ाइन।",
      legal: "सभी डेटा 24 घंटे बाद स्वतः हटा दिया जाता है। कोई साइनअप नहीं, कोई ट्रैकिंग नहीं।",
    },
    meta: {
      home_title: "मुफ्त अस्थायी ईमेल पता | Ghist — तत्काल और गुमनाम",
      home_desc: "सेकंडों में मुफ्त डिस्पोजेबल ईमेल पता पाएं — बिना साइन-अप के, बिना ट्रैकिंग के। मुफ्त ट्रायल, OTP और स्पैम से बचने के लिए बिल्कुल सही। 24 घंटे बाद स्थायी रूप से हटा दिया जाता है।",
    },
  },

  es: {
    nav: {
      home: "Inicio",
      privacy: "Privacidad",
      terms: "Términos",
      about: "Acerca de",
      faq: "Preguntas frecuentes",
      blog: "Blog",
      contact: "Contacto",
    },
    home: {
      tagline: "Correo desechable instantáneo. Sin registro. Sin rastreo.",
      description: "Obtén una dirección de correo temporal gratuita en segundos. Perfecta para pruebas gratuitas, OTPs y evitar spam. Se elimina automáticamente después de 24 horas.",
      cta: "Generar correo",
    },
    privacy: {
      title: "Política de privacidad — Ghist",
      sections: {
        what_we_collect: "Qué recopilamos",
        how_we_use: "Cómo lo usamos",
        data_retention: "Retención de datos",
        cookies: "Cookies",
        contact: "Contacto",
      },
    },
    terms: {
      title: "Términos de servicio — Ghist",
      sections: {
        acceptable_use: "Uso aceptable",
        prohibited: "Actividades prohibidas",
        liability: "Limitación de responsabilidad",
        changes: "Cambios en los términos",
        governing_law: "Ley aplicable",
      },
    },
    about: {
      title: "Acerca de Ghist",
      description: "Ghist es un servicio de correo desechable gratuito diseñado para usuarios conscientes de su privacidad que quieren proteger su bandeja de entrada real del spam y el rastreo.",
      mission: "Nuestra misión es hacer la privacidad simple y accesible — un correo temporal en segundos, sin cuenta necesaria, sin almacenamiento de datos.",
      values: "Creemos en la recolección mínima de datos, la transparencia total y la arquitectura efímera por diseño.",
    },
    faq: {
      title: "Preguntas frecuentes",
      questions: [
        { q: "¿Qué es Ghist?", a: "Ghist es un servicio de correo temporal desechable gratuito. Genera una dirección de correo anónima instantáneamente — sin cuenta ni registro requerido. Todos los correos se eliminan permanentemente después de 24 horas." },
        { q: "¿Cuánto dura una dirección de correo de Ghist?", a: "Cada dirección de correo de Ghist y todos sus mensajes se eliminan automática y permanentemente después de 24 horas. No es posible recuperarlos tras la eliminación." },
        { q: "¿Es Ghist completamente gratuito?", a: "Sí. Ghist es 100% gratuito sin niveles premium, sin registro y sin tarjeta de crédito requerida." },
        { q: "¿Necesito crear una cuenta?", a: "No. Ghist genera una dirección de correo temporal en el momento en que abres el sitio. No se requiere cuenta, contraseña ni información personal." },
        { q: "¿Es seguro Ghist para códigos de verificación y OTPs?", a: "Sí. Ghist usa cifrado TLS 1.3 y las sesiones están aisladas — tu dirección temporal nunca se vincula a tu identidad real." },
        { q: "¿Para qué sirve Ghist?", a: "Ghist es útil para registrarse en pruebas gratuitas sin recibir spam, descargar contenido restringido, recibir códigos de verificación y cualquier situación donde necesites un correo temporal." },
        { q: "¿Ghist almacena o vende mis datos?", a: "No. Ghist no requiere información personal, no rastrea a los usuarios y elimina permanentemente todos los correos después de 24 horas." },
        { q: "¿Qué pasa con mis correos después de 24 horas?", a: "Todos los correos y la dirección temporal se eliminan permanente e irrecuperablemente después de 24 horas. Esto es por diseño — Ghist es efímero por arquitectura." },
        { q: "¿Puedo enviar correos desde una dirección Ghist?", a: "No. Ghist es un servicio solo de recepción. Solo puedes recibir correos, no enviarlos." },
        { q: "¿Puedo elegir mi propia dirección de correo?", a: "Actualmente, Ghist genera una dirección aleatoria automáticamente. Las direcciones personalizadas no son compatibles por diseño." },
      ],
    },
    blog: {
      title: "Blog de Ghist",
      read_more: "Leer más",
      all_posts: "Todas las publicaciones",
      by_category: "Por categoría",
    },
    contact: {
      title: "Contáctanos",
      name_label: "Tu nombre",
      email_label: "Tu correo electrónico",
      subject_label: "Asunto",
      message_label: "Mensaje",
      submit: "Enviar mensaje",
      success: "Tu mensaje fue enviado exitosamente. Te responderemos pronto.",
      error: "Algo salió mal. Por favor, inténtalo de nuevo más tarde.",
    },
    footer: {
      tagline: "Comunicación sin huella digital. Efímero por diseño.",
      legal: "Todos los datos se eliminan automáticamente después de 24 horas. Sin registro, sin rastreo.",
    },
    meta: {
      home_title: "Dirección de correo temporal gratuita | Ghist — Instantáneo y anónimo",
      home_desc: "Obtén una dirección de correo desechable gratuita en segundos — sin registro, sin rastreo. Perfecta para pruebas gratuitas, OTPs y evitar spam. Eliminada permanentemente después de 24 horas.",
    },
  },

  ar: {
    nav: {
      home: "الرئيسية",
      privacy: "الخصوصية",
      terms: "الشروط",
      about: "حول",
      faq: "الأسئلة الشائعة",
      blog: "المدونة",
      contact: "تواصل معنا",
    },
    home: {
      tagline: "بريد إلكتروني مؤقت فوري. بدون تسجيل. بدون تتبع.",
      description: "احصل على عنوان بريد إلكتروني مؤقت مجاني في ثوانٍ. مثالي للتجارب المجانية ورموز OTP وتجنب الرسائل العشوائية. يُحذف تلقائياً بعد 24 ساعة.",
      cta: "إنشاء بريد إلكتروني",
    },
    privacy: {
      title: "سياسة الخصوصية — Ghist",
      sections: {
        what_we_collect: "ما نجمعه",
        how_we_use: "كيف نستخدمه",
        data_retention: "الاحتفاظ بالبيانات",
        cookies: "ملفات تعريف الارتباط",
        contact: "التواصل",
      },
    },
    terms: {
      title: "شروط الخدمة — Ghist",
      sections: {
        acceptable_use: "الاستخدام المقبول",
        prohibited: "الأنشطة المحظورة",
        liability: "تحديد المسؤولية",
        changes: "التغييرات في الشروط",
        governing_law: "القانون الحاكم",
      },
    },
    about: {
      title: "حول Ghist",
      description: "Ghist خدمة بريد إلكتروني مؤقت مجانية مصممة للمستخدمين المهتمين بالخصوصية الذين يريدون حماية صندوق بريدهم الحقيقي من الرسائل العشوائية والتتبع.",
      mission: "مهمتنا هي جعل الخصوصية بسيطة وفي متناول الجميع — بريد إلكتروني مؤقت في ثوانٍ، بدون حساب، لا شيء مُخزَّن.",
      values: "نؤمن بالحد الأدنى من جمع البيانات، والشفافية الكاملة، والبنية التحتية المؤقتة بالتصميم.",
    },
    faq: {
      title: "الأسئلة الشائعة",
      questions: [
        { q: "ما هو Ghist؟", a: "Ghist خدمة بريد إلكتروني مؤقت مجانية. تنشئ عنوان بريد إلكتروني مجهول فوراً — دون الحاجة لحساب أو تسجيل. تُحذف جميع رسائل البريد الإلكتروني نهائياً بعد 24 ساعة." },
        { q: "كم يدوم عنوان Ghist؟", a: "يُحذف كل عنوان Ghist وجميع رسائله تلقائياً ونهائياً بعد 24 ساعة. لا يمكن استعادتها بعد الحذف." },
        { q: "هل Ghist مجاني تماماً؟", a: "نعم. Ghist مجاني 100% بدون مستويات مميزة، بدون تسجيل، وبدون بطاقة ائتمانية." },
        { q: "هل أحتاج لإنشاء حساب؟", a: "لا. يُنشئ Ghist عنوان بريد مؤقت فور فتح الموقع. لا حساب، ولا كلمة مرور، ولا معلومات شخصية مطلوبة." },
        { q: "هل Ghist آمن لرموز OTP؟", a: "نعم. يستخدم Ghist تشفير TLS 1.3 والجلسات معزولة — عنوانك المؤقت لا يرتبط أبداً بهويتك الحقيقية." },
        { q: "ما فائدة Ghist؟", a: "Ghist مفيد للتسجيل في التجارب المجانية دون استقبال رسائل عشوائية، وتنزيل المحتوى المقيد، واستقبال رموز التحقق، وأي موقف تحتاج فيه لبريد مؤقت." },
        { q: "هل Ghist يخزن أو يبيع بياناتي؟", a: "لا. لا يطلب Ghist أي معلومات شخصية، ولا يتتبع المستخدمين، ويحذف جميع رسائل البريد نهائياً بعد 24 ساعة." },
        { q: "ماذا يحدث لرسائلي بعد 24 ساعة؟", a: "تُحذف جميع الرسائل والعنوان المؤقت نهائياً وبشكل لا رجعة فيه بعد 24 ساعة. هذا بالتصميم — Ghist مؤقت بالبنية التحتية." },
        { q: "هل يمكنني إرسال رسائل من عنوان Ghist؟", a: "لا. Ghist خدمة استقبال فقط. يمكنك فقط استقبال الرسائل، وليس إرسالها." },
        { q: "هل يمكنني اختيار عنوان بريدي؟", a: "حالياً، يُنشئ Ghist عنواناً عشوائياً تلقائياً. العناوين المخصصة غير مدعومة عمداً." },
      ],
    },
    blog: {
      title: "مدونة Ghist",
      read_more: "اقرأ المزيد",
      all_posts: "جميع المقالات",
      by_category: "حسب الفئة",
    },
    contact: {
      title: "تواصل معنا",
      name_label: "اسمك",
      email_label: "بريدك الإلكتروني",
      subject_label: "الموضوع",
      message_label: "الرسالة",
      submit: "إرسال الرسالة",
      success: "تم إرسال رسالتك بنجاح. سنرد عليك قريباً.",
      error: "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.",
    },
    footer: {
      tagline: "تواصل بدون بصمة رقمية. مؤقت بالتصميم.",
      legal: "تُحذف جميع البيانات تلقائياً بعد 24 ساعة. بدون تسجيل، بدون تتبع.",
    },
    meta: {
      home_title: "عنوان بريد إلكتروني مؤقت مجاني | Ghist — فوري ومجهول",
      home_desc: "احصل على عنوان بريد إلكتروني مؤقت مجاني في ثوانٍ — بدون تسجيل، بدون تتبع. مثالي للتجارب المجانية ورموز OTP. يُحذف نهائياً بعد 24 ساعة.",
    },
  },

  fr: {
    nav: {
      home: "Accueil",
      privacy: "Confidentialité",
      terms: "Conditions",
      about: "À propos",
      faq: "FAQ",
      blog: "Blog",
      contact: "Contact",
    },
    home: {
      tagline: "E-mail jetable instantané. Sans inscription. Sans traçage.",
      description: "Obtenez une adresse e-mail temporaire gratuite en quelques secondes. Parfaite pour les essais gratuits, les OTP et éviter le spam. Supprimée automatiquement après 24 heures.",
      cta: "Générer un e-mail",
    },
    privacy: {
      title: "Politique de confidentialité — Ghist",
      sections: {
        what_we_collect: "Ce que nous collectons",
        how_we_use: "Comment nous l'utilisons",
        data_retention: "Rétention des données",
        cookies: "Cookies",
        contact: "Contact",
      },
    },
    terms: {
      title: "Conditions d'utilisation — Ghist",
      sections: {
        acceptable_use: "Utilisation acceptable",
        prohibited: "Activités interdites",
        liability: "Limitation de responsabilité",
        changes: "Modifications des conditions",
        governing_law: "Droit applicable",
      },
    },
    about: {
      title: "À propos de Ghist",
      description: "Ghist est un service d'e-mail jetable gratuit conçu pour les utilisateurs soucieux de leur vie privée qui souhaitent protéger leur véritable boîte de réception contre le spam et le traçage.",
      mission: "Notre mission est de rendre la confidentialité simple et accessible — un e-mail temporaire en quelques secondes, sans compte requis, rien de stocké.",
      values: "Nous croyons en la collecte minimale de données, la transparence totale et l'architecture éphémère par conception.",
    },
    faq: {
      title: "Questions fréquentes",
      questions: [
        { q: "Qu'est-ce que Ghist ?", a: "Ghist est un service d'e-mail temporaire jetable gratuit. Il génère une adresse e-mail anonyme instantanément — sans compte ni inscription requis. Tous les e-mails sont définitivement supprimés après 24 heures." },
        { q: "Combien de temps dure une adresse Ghist ?", a: "Chaque adresse Ghist et tous ses messages sont automatiquement et définitivement supprimés après 24 heures. Ils ne peuvent pas être récupérés après la suppression." },
        { q: "Ghist est-il entièrement gratuit ?", a: "Oui. Ghist est gratuit à 100 % sans niveaux premium, sans inscription et sans carte de crédit requise." },
        { q: "Dois-je créer un compte ?", a: "Non. Ghist génère une adresse e-mail temporaire dès que vous ouvrez le site. Aucun compte, mot de passe ou information personnelle n'est requis." },
        { q: "Ghist est-il sûr pour les codes de vérification et OTP ?", a: "Oui. Ghist utilise le chiffrement TLS 1.3 et les sessions sont isolées — votre adresse temporaire n'est jamais liée à votre identité réelle." },
        { q: "À quoi sert Ghist ?", a: "Ghist est utile pour s'inscrire à des essais gratuits sans recevoir de spam, télécharger du contenu restreint, recevoir des codes de vérification et toute situation nécessitant un e-mail temporaire." },
        { q: "Ghist stocke-t-il ou vend-il mes données ?", a: "Non. Ghist ne nécessite aucune information personnelle, ne suit pas les utilisateurs et supprime définitivement tous les e-mails après 24 heures." },
        { q: "Que se passe-t-il avec mes e-mails après 24 heures ?", a: "Tous les e-mails et l'adresse temporaire elle-même sont définitivement et irrécupérablement supprimés après 24 heures. C'est par conception — Ghist est éphémère par architecture." },
        { q: "Puis-je envoyer des e-mails depuis une adresse Ghist ?", a: "Non. Ghist est un service de réception uniquement. Vous pouvez seulement recevoir des e-mails, pas en envoyer." },
        { q: "Puis-je choisir ma propre adresse e-mail ?", a: "Actuellement, Ghist génère automatiquement une adresse aléatoire. Les adresses personnalisées ne sont pas prises en charge par conception." },
      ],
    },
    blog: {
      title: "Blog Ghist",
      read_more: "Lire la suite",
      all_posts: "Tous les articles",
      by_category: "Par catégorie",
    },
    contact: {
      title: "Contactez-nous",
      name_label: "Votre nom",
      email_label: "Votre e-mail",
      subject_label: "Sujet",
      message_label: "Message",
      submit: "Envoyer le message",
      success: "Votre message a été envoyé avec succès. Nous vous répondrons bientôt.",
      error: "Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
    },
    footer: {
      tagline: "Communication sans empreinte numérique. Éphémère par conception.",
      legal: "Toutes les données sont supprimées automatiquement après 24 heures. Sans inscription, sans traçage.",
    },
    meta: {
      home_title: "Adresse e-mail temporaire gratuite | Ghist — Instantanée et anonyme",
      home_desc: "Obtenez une adresse e-mail jetable gratuite en quelques secondes — sans inscription, sans traçage. Parfaite pour les essais gratuits, les OTP et éviter le spam. Définitivement supprimée après 24 heures.",
    },
  },

  bn: {
    nav: {
      home: "হোম",
      privacy: "গোপনীয়তা",
      terms: "শর্তাবলী",
      about: "আমাদের সম্পর্কে",
      faq: "সচরাচর জিজ্ঞাস্য",
      blog: "ব্লগ",
      contact: "যোগাযোগ",
    },
    home: {
      tagline: "তাৎক্ষণিক ডিসপোজেবল ইমেইল। কোনো সাইন-আপ নেই। কোনো ট্র্যাকিং নেই।",
      description: "সেকেন্ডের মধ্যে বিনামূল্যে অস্থায়ী ইমেইল ঠিকানা পান। বিনামূল্যে ট্রায়াল, OTP এবং স্প্যাম এড়ানোর জন্য নিখুঁত। ২৪ ঘণ্টা পরে স্বয়ংক্রিয়ভাবে মুছে যায়।",
      cta: "ইমেইল তৈরি করুন",
    },
    privacy: {
      title: "গোপনীয়তা নীতি — Ghist",
      sections: {
        what_we_collect: "আমরা কী সংগ্রহ করি",
        how_we_use: "আমরা কীভাবে ব্যবহার করি",
        data_retention: "ডেটা সংরক্ষণ",
        cookies: "কুকিজ",
        contact: "যোগাযোগ",
      },
    },
    terms: {
      title: "সেবার শর্তাবলী — Ghist",
      sections: {
        acceptable_use: "গ্রহণযোগ্য ব্যবহার",
        prohibited: "নিষিদ্ধ কার্যক্রম",
        liability: "দায়বদ্ধতার সীমা",
        changes: "শর্তাবলীতে পরিবর্তন",
        governing_law: "প্রযোজ্য আইন",
      },
    },
    about: {
      title: "Ghist সম্পর্কে",
      description: "Ghist একটি বিনামূল্যে ডিসপোজেবল ইমেইল সেবা যা গোপনীয়তা-সচেতন ব্যবহারকারীদের জন্য তৈরি করা হয়েছে যারা স্প্যাম এবং ট্র্যাকিং থেকে তাদের আসল ইনবক্স রক্ষা করতে চান।",
      mission: "আমাদের লক্ষ্য হলো গোপনীয়তাকে সহজ এবং সুলভ করা — সেকেন্ডের মধ্যে অস্থায়ী ইমেইল, কোনো অ্যাকাউন্ট ছাড়া, কিছুই সংরক্ষিত নয়।",
      values: "আমরা ন্যূনতম ডেটা সংগ্রহ, সম্পূর্ণ স্বচ্ছতা এবং ডিজাইন দ্বারা ক্ষণস্থায়ী আর্কিটেকচারে বিশ্বাস করি।",
    },
    faq: {
      title: "সচরাচর জিজ্ঞাস্য প্রশ্ন",
      questions: [
        { q: "Ghist কী?", a: "Ghist একটি বিনামূল্যে ডিসপোজেবল অস্থায়ী ইমেইল সেবা। এটি তাৎক্ষণিকভাবে একটি বেনামী ইমেইল ঠিকানা তৈরি করে — কোনো অ্যাকাউন্ট বা সাইন-আপ ছাড়াই। সমস্ত ইমেইল ২৪ ঘণ্টা পরে স্থায়ীভাবে মুছে যায়।" },
        { q: "Ghist ইমেইল ঠিকানা কতক্ষণ থাকে?", a: "প্রতিটি Ghist ইমেইল ঠিকানা এবং এর সমস্ত বার্তা ২৪ ঘণ্টা পরে স্বয়ংক্রিয়ভাবে স্থায়ীভাবে মুছে যায়। মোছার পরে পুনরুদ্ধার করা সম্ভব নয়।" },
        { q: "Ghist কি সম্পূর্ণ বিনামূল্যে?", a: "হ্যাঁ। Ghist ১০০% বিনামূল্যে কোনো প্রিমিয়াম স্তর, সাইন-আপ বা ক্রেডিট কার্ড ছাড়াই।" },
        { q: "আমাকে কি অ্যাকাউন্ট তৈরি করতে হবে?", a: "না। সাইট খোলার মুহূর্তেই Ghist একটি অস্থায়ী ইমেইল ঠিকানা তৈরি করে। কোনো অ্যাকাউন্ট, পাসওয়ার্ড বা ব্যক্তিগত তথ্যের প্রয়োজন নেই।" },
        { q: "OTP-র জন্য Ghist কি নিরাপদ?", a: "হ্যাঁ। Ghist TLS 1.3 এনক্রিপশন ব্যবহার করে এবং সেশনগুলি আলাদা — আপনার অস্থায়ী ঠিকানা কখনো আপনার আসল পরিচয়ের সাথে যুক্ত হয় না।" },
        { q: "Ghist কীসের জন্য উপকারী?", a: "Ghist স্প্যাম ছাড়া বিনামূল্যে ট্রায়ালে সাইন আপ করতে, গেটেড কন্টেন্ট ডাউনলোড করতে, যাচাইকরণ কোড পেতে এবং যেকোনো পরিস্থিতিতে উপকারী যেখানে অস্থায়ী ইমেইল প্রয়োজন।" },
        { q: "Ghist কি আমার ডেটা সংরক্ষণ বা বিক্রি করে?", a: "না। Ghist কোনো ব্যক্তিগত তথ্যের প্রয়োজন করে না, ব্যবহারকারীদের ট্র্যাক করে না এবং ২৪ ঘণ্টা পরে সমস্ত ইমেইল স্থায়ীভাবে মুছে দেয়।" },
        { q: "২৪ ঘণ্টা পরে আমার ইমেইলের কী হয়?", a: "সমস্ত ইমেইল এবং অস্থায়ী ইমেইল ঠিকানা ২৪ ঘণ্টা পরে স্থায়ী এবং অপরিবর্তনীয়ভাবে মুছে যায়। এটি ডিজাইন দ্বারা — Ghist আর্কিটেকচার দ্বারা ক্ষণস্থায়ী।" },
        { q: "আমি কি Ghist ঠিকানা থেকে ইমেইল পাঠাতে পারি?", a: "না। Ghist শুধুমাত্র গ্রহণের সেবা। আপনি শুধুমাত্র ইমেইল গ্রহণ করতে পারেন, পাঠাতে পারেন না।" },
        { q: "আমি কি নিজের ইমেইল ঠিকানা বেছে নিতে পারি?", a: "বর্তমানে, Ghist স্বয়ংক্রিয়ভাবে একটি এলোমেলো ঠিকানা তৈরি করে। কাস্টম ঠিকানা সমর্থিত নয়।" },
      ],
    },
    blog: {
      title: "Ghist ব্লগ",
      read_more: "আরো পড়ুন",
      all_posts: "সব পোস্ট",
      by_category: "বিভাগ অনুযায়ী",
    },
    contact: {
      title: "আমাদের সাথে যোগাযোগ করুন",
      name_label: "আপনার নাম",
      email_label: "আপনার ইমেইল",
      subject_label: "বিষয়",
      message_label: "বার্তা",
      submit: "বার্তা পাঠান",
      success: "আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
      error: "কিছু ভুল হয়েছে। পরে আবার চেষ্টা করুন।",
    },
    footer: {
      tagline: "ডিজিটাল পদচিহ্ন ছাড়া যোগাযোগ। ডিজাইন দ্বারা ক্ষণস্থায়ী।",
      legal: "সমস্ত ডেটা ২৪ ঘণ্টা পরে স্বয়ংক্রিয়ভাবে মুছে যায়। কোনো সাইনআপ নেই, কোনো ট্র্যাকিং নেই।",
    },
    meta: {
      home_title: "বিনামূল্যে অস্থায়ী ইমেইল ঠিকানা | Ghist — তাৎক্ষণিক এবং বেনামী",
      home_desc: "সেকেন্ডের মধ্যে বিনামূল্যে ডিসপোজেবল ইমেইল ঠিকানা পান — কোনো সাইন-আপ নেই, কোনো ট্র্যাকিং নেই। বিনামূল্যে ট্রায়াল, OTP এবং স্প্যাম এড়ানোর জন্য নিখুঁত। ২৪ ঘণ্টা পরে স্থায়ীভাবে মুছে যায়।",
    },
  },

  pt: {
    nav: {
      home: "Início",
      privacy: "Privacidade",
      terms: "Termos",
      about: "Sobre",
      faq: "Perguntas frequentes",
      blog: "Blog",
      contact: "Contato",
    },
    home: {
      tagline: "E-mail descartável instantâneo. Sem cadastro. Sem rastreamento.",
      description: "Obtenha um endereço de e-mail temporário gratuito em segundos. Perfeito para testes gratuitos, OTPs e para evitar spam. Excluído automaticamente após 24 horas.",
      cta: "Gerar e-mail",
    },
    privacy: {
      title: "Política de Privacidade — Ghist",
      sections: {
        what_we_collect: "O que coletamos",
        how_we_use: "Como utilizamos",
        data_retention: "Retenção de dados",
        cookies: "Cookies",
        contact: "Contato",
      },
    },
    terms: {
      title: "Termos de Serviço — Ghist",
      sections: {
        acceptable_use: "Uso aceitável",
        prohibited: "Atividades proibidas",
        liability: "Limitação de responsabilidade",
        changes: "Alterações nos termos",
        governing_law: "Lei aplicável",
      },
    },
    about: {
      title: "Sobre o Ghist",
      description: "Ghist é um serviço de e-mail descartável gratuito desenvolvido para usuários preocupados com privacidade que desejam proteger sua caixa de entrada real de spam e rastreamento.",
      mission: "Nossa missão é tornar a privacidade simples e acessível — um e-mail temporário em segundos, sem conta necessária, nada armazenado.",
      values: "Acreditamos na coleta mínima de dados, total transparência e arquitetura efêmera por design.",
    },
    faq: {
      title: "Perguntas Frequentes",
      questions: [
        { q: "O que é o Ghist?", a: "O Ghist é um serviço de e-mail temporário descartável gratuito. Ele gera um endereço de e-mail anônimo instantaneamente — sem conta ou cadastro necessário. Todos os e-mails são permanentemente excluídos após 24 horas." },
        { q: "Quanto tempo dura um endereço Ghist?", a: "Cada endereço Ghist e todas as suas mensagens são automática e permanentemente excluídos após 24 horas. Não é possível recuperá-los após a exclusão." },
        { q: "O Ghist é completamente gratuito?", a: "Sim. O Ghist é 100% gratuito sem níveis premium, sem cadastro e sem cartão de crédito necessário." },
        { q: "Preciso criar uma conta?", a: "Não. O Ghist gera um endereço de e-mail temporário no momento em que você abre o site. Não é necessário conta, senha ou informações pessoais." },
        { q: "O Ghist é seguro para OTPs?", a: "Sim. O Ghist usa criptografia TLS 1.3 e as sessões são isoladas — seu endereço temporário nunca é vinculado à sua identidade real." },
        { q: "Para que serve o Ghist?", a: "O Ghist é útil para se inscrever em testes gratuitos sem receber spam, baixar conteúdo restrito, receber códigos de verificação e qualquer situação em que você precise de um e-mail temporário." },
        { q: "O Ghist armazena ou vende meus dados?", a: "Não. O Ghist não requer informações pessoais, não rastreia usuários e exclui permanentemente todos os e-mails após 24 horas." },
        { q: "O que acontece com meus e-mails após 24 horas?", a: "Todos os e-mails e o endereço temporário em si são permanente e irrecuperavelmente excluídos após 24 horas. Isso é por design — o Ghist é efêmero por arquitetura." },
        { q: "Posso enviar e-mails de um endereço Ghist?", a: "Não. O Ghist é um serviço apenas de recebimento. Você só pode receber e-mails, não enviar." },
        { q: "Posso escolher meu próprio endereço de e-mail?", a: "Atualmente, o Ghist gera automaticamente um endereço aleatório. Endereços personalizados não são suportados por design." },
      ],
    },
    blog: {
      title: "Blog do Ghist",
      read_more: "Leia mais",
      all_posts: "Todas as publicações",
      by_category: "Por categoria",
    },
    contact: {
      title: "Entre em contato",
      name_label: "Seu nome",
      email_label: "Seu e-mail",
      subject_label: "Assunto",
      message_label: "Mensagem",
      submit: "Enviar mensagem",
      success: "Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.",
      error: "Algo deu errado. Por favor, tente novamente mais tarde.",
    },
    footer: {
      tagline: "Comunicação sem rastro digital. Efêmero por design.",
      legal: "Todos os dados são excluídos automaticamente após 24 horas. Sem cadastro, sem rastreamento.",
    },
    meta: {
      home_title: "Endereço de e-mail temporário gratuito | Ghist — Instantâneo e anônimo",
      home_desc: "Obtenha um endereço de e-mail descartável gratuito em segundos — sem cadastro, sem rastreamento. Perfeito para testes gratuitos, OTPs e evitar spam. Permanentemente excluído após 24 horas.",
    },
  },

  ru: {
    nav: {
      home: "Главная",
      privacy: "Конфиденциальность",
      terms: "Условия",
      about: "О нас",
      faq: "Частые вопросы",
      blog: "Блог",
      contact: "Контакт",
    },
    home: {
      tagline: "Мгновенная одноразовая почта. Без регистрации. Без слежки.",
      description: "Получите бесплатный временный адрес электронной почты за секунды. Идеально для бесплатных пробных периодов, OTP и защиты от спама. Автоматически удаляется через 24 часа.",
      cta: "Создать почту",
    },
    privacy: {
      title: "Политика конфиденциальности — Ghist",
      sections: {
        what_we_collect: "Что мы собираем",
        how_we_use: "Как мы используем",
        data_retention: "Хранение данных",
        cookies: "Файлы cookie",
        contact: "Контакт",
      },
    },
    terms: {
      title: "Условия использования — Ghist",
      sections: {
        acceptable_use: "Допустимое использование",
        prohibited: "Запрещённые действия",
        liability: "Ограничение ответственности",
        changes: "Изменения условий",
        governing_law: "Применимое право",
      },
    },
    about: {
      title: "О Ghist",
      description: "Ghist — это бесплатный сервис одноразовой электронной почты, созданный для пользователей, заботящихся о конфиденциальности, которые хотят защитить свой настоящий почтовый ящик от спама и слежки.",
      mission: "Наша миссия — сделать конфиденциальность простой и доступной: временная почта за секунды, без аккаунта, ничего не хранится.",
      values: "Мы верим в минимальный сбор данных, полную прозрачность и архитектуру, эфемерную по своей природе.",
    },
    faq: {
      title: "Часто задаваемые вопросы",
      questions: [
        { q: "Что такое Ghist?", a: "Ghist — бесплатный сервис временной одноразовой электронной почты. Он мгновенно генерирует анонимный адрес — без аккаунта и регистрации. Все письма навсегда удаляются через 24 часа." },
        { q: "Как долго действует адрес Ghist?", a: "Каждый адрес Ghist и все его сообщения автоматически и навсегда удаляются через 24 часа. После удаления восстановление невозможно." },
        { q: "Ghist полностью бесплатный?", a: "Да. Ghist на 100% бесплатен: нет премиум-уровней, регистрации и кредитной карты." },
        { q: "Нужно ли создавать аккаунт?", a: "Нет. Ghist генерирует временный адрес в момент открытия сайта. Не требуется ни аккаунт, ни пароль, ни личные данные." },
        { q: "Безопасен ли Ghist для OTP?", a: "Да. Ghist использует шифрование TLS 1.3, сессии изолированы — ваш временный адрес никогда не связывается с вашей реальной личностью." },
        { q: "Для чего полезен Ghist?", a: "Ghist полезен для регистрации в бесплатных пробных периодах без спама, скачивания закрытого контента, получения кодов подтверждения и в любых ситуациях, где нужен временный адрес." },
        { q: "Ghist хранит или продаёт мои данные?", a: "Нет. Ghist не требует личных данных, не отслеживает пользователей и навсегда удаляет все письма через 24 часа." },
        { q: "Что происходит с письмами через 24 часа?", a: "Все письма и временный адрес необратимо и навсегда удаляются через 24 часа. Это заложено в архитектуре — Ghist эфемерен по дизайну." },
        { q: "Могу ли я отправлять письма с адреса Ghist?", a: "Нет. Ghist — только сервис получения. Вы можете только получать письма, но не отправлять." },
        { q: "Могу ли я выбрать свой адрес?", a: "В настоящее время Ghist автоматически генерирует случайный адрес. Пользовательские адреса не поддерживаются намеренно." },
      ],
    },
    blog: {
      title: "Блог Ghist",
      read_more: "Читать далее",
      all_posts: "Все статьи",
      by_category: "По категории",
    },
    contact: {
      title: "Связаться с нами",
      name_label: "Ваше имя",
      email_label: "Ваш e-mail",
      subject_label: "Тема",
      message_label: "Сообщение",
      submit: "Отправить сообщение",
      success: "Ваше сообщение успешно отправлено. Мы ответим вам в ближайшее время.",
      error: "Что-то пошло не так. Пожалуйста, попробуйте позже.",
    },
    footer: {
      tagline: "Общение без цифрового следа. Эфемерно по дизайну.",
      legal: "Все данные автоматически удаляются через 24 часа. Без регистрации, без слежки.",
    },
    meta: {
      home_title: "Бесплатный временный адрес электронной почты | Ghist — Мгновенно и анонимно",
      home_desc: "Получите бесплатный одноразовый адрес электронной почты за секунды — без регистрации, без слежки. Идеально для бесплатных пробных периодов, OTP и защиты от спама. Навсегда удаляется через 24 часа.",
    },
  },

  ur: {
    nav: {
      home: "ہوم",
      privacy: "رازداری",
      terms: "شرائط",
      about: "ہمارے بارے میں",
      faq: "عام سوالات",
      blog: "بلاگ",
      contact: "رابطہ",
    },
    home: {
      tagline: "فوری ڈسپوزایبل ای میل۔ کوئی سائن اپ نہیں۔ کوئی ٹریکنگ نہیں۔",
      description: "سیکنڈوں میں مفت عارضی ای میل ایڈریس حاصل کریں۔ مفت ٹرائل، OTP اور اسپام سے بچنے کے لیے بہترین۔ 24 گھنٹے بعد خود بخود حذف ہو جاتا ہے۔",
      cta: "ای میل بنائیں",
    },
    privacy: {
      title: "رازداری کی پالیسی — Ghist",
      sections: {
        what_we_collect: "ہم کیا جمع کرتے ہیں",
        how_we_use: "ہم اسے کیسے استعمال کرتے ہیں",
        data_retention: "ڈیٹا برقراری",
        cookies: "کوکیز",
        contact: "رابطہ",
      },
    },
    terms: {
      title: "سروس کی شرائط — Ghist",
      sections: {
        acceptable_use: "قابل قبول استعمال",
        prohibited: "ممنوع سرگرمیاں",
        liability: "ذمہ داری کی حد",
        changes: "شرائط میں تبدیلیاں",
        governing_law: "حاکم قانون",
      },
    },
    about: {
      title: "Ghist کے بارے میں",
      description: "Ghist ایک مفت ڈسپوزایبل ای میل سروس ہے جو رازداری سے آگاہ صارفین کے لیے بنائی گئی ہے جو اپنے اصلی ان باکس کو اسپام اور ٹریکنگ سے بچانا چاہتے ہیں۔",
      mission: "ہمارا مشن رازداری کو آسان اور قابل رسائی بنانا ہے — سیکنڈوں میں عارضی ای میل، کوئی اکاؤنٹ نہیں، کچھ محفوظ نہیں۔",
      values: "ہم کم سے کم ڈیٹا اکٹھا کرنے، مکمل شفافیت، اور ڈیزائن کے ذریعے عارضی فن تعمیر میں یقین رکھتے ہیں۔",
    },
    faq: {
      title: "عام سوالات",
      questions: [
        { q: "Ghist کیا ہے؟", a: "Ghist ایک مفت ڈسپوزایبل عارضی ای میل سروس ہے۔ یہ فوری طور پر ایک گمنام ای میل ایڈریس بناتا ہے — کوئی اکاؤنٹ یا سائن اپ ضروری نہیں۔ تمام ای میلز 24 گھنٹے بعد مستقل طور پر حذف ہو جاتے ہیں۔" },
        { q: "Ghist ای میل ایڈریس کتنے عرصے تک رہتا ہے؟", a: "ہر Ghist ای میل ایڈریس اور اس کے تمام پیغامات 24 گھنٹے بعد خود بخود مستقل طور پر حذف ہو جاتے ہیں۔ حذف ہونے کے بعد انہیں بازیافت نہیں کیا جا سکتا۔" },
        { q: "کیا Ghist بالکل مفت ہے؟", a: "ہاں۔ Ghist 100٪ مفت ہے بغیر کسی پریمیم ٹیئر، سائن اپ، یا کریڈٹ کارڈ کے۔" },
        { q: "کیا مجھے اکاؤنٹ بنانا ہوگا؟", a: "نہیں۔ Ghist سائٹ کھولتے ہی عارضی ای میل ایڈریس بناتا ہے۔ کوئی اکاؤنٹ، پاس ورڈ، یا ذاتی معلومات درکار نہیں۔" },
        { q: "کیا Ghist OTP کے لیے محفوظ ہے؟", a: "ہاں۔ Ghist TLS 1.3 انکرپشن استعمال کرتا ہے اور سیشنز الگ ہوتے ہیں — آپ کا عارضی ایڈریس کبھی بھی آپ کی اصلی شناخت سے منسلک نہیں ہوتا۔" },
        { q: "Ghist کس کام آتا ہے؟", a: "Ghist اسپام کے بغیر مفت ٹرائل سائن اپ، گیٹڈ مواد ڈاؤن لوڈ، تصدیقی کوڈ وصول کرنے اور کسی بھی صورتحال میں مفید ہے جہاں عارضی ای میل کی ضرورت ہو۔" },
        { q: "کیا Ghist میرا ڈیٹا ذخیرہ یا فروخت کرتا ہے؟", a: "نہیں۔ Ghist کو کسی ذاتی معلومات کی ضرورت نہیں، صارفین کو ٹریک نہیں کرتا، اور 24 گھنٹے بعد تمام ای میلز مستقل طور پر حذف کر دیتا ہے۔" },
        { q: "24 گھنٹے بعد میرے ای میلز کا کیا ہوتا ہے؟", a: "تمام ای میلز اور عارضی ای میل ایڈریس 24 گھنٹے بعد مستقل اور ناقابل واپسی طور پر حذف ہو جاتے ہیں۔ یہ ڈیزائن کے مطابق ہے۔" },
        { q: "کیا میں Ghist ایڈریس سے ای میل بھیج سکتا ہوں؟", a: "نہیں۔ Ghist صرف وصول کرنے کی سروس ہے۔ آپ صرف ای میل وصول کر سکتے ہیں، بھیج نہیں سکتے۔" },
        { q: "کیا میں اپنا ای میل ایڈریس منتخب کر سکتا ہوں؟", a: "فی الحال، Ghist خود بخود ایک بے ترتیب ایڈریس بناتا ہے۔ حسب ضرورت ایڈریس معاون نہیں ہیں۔" },
      ],
    },
    blog: {
      title: "Ghist بلاگ",
      read_more: "مزید پڑھیں",
      all_posts: "تمام پوسٹس",
      by_category: "زمرے کے مطابق",
    },
    contact: {
      title: "ہم سے رابطہ کریں",
      name_label: "آپ کا نام",
      email_label: "آپ کا ای میل",
      subject_label: "موضوع",
      message_label: "پیغام",
      submit: "پیغام بھیجیں",
      success: "آپ کا پیغام کامیابی سے بھیج دیا گیا۔ ہم جلد ہی آپ سے رابطہ کریں گے۔",
      error: "کچھ غلط ہو گیا۔ بعد میں دوبارہ کوشش کریں۔",
    },
    footer: {
      tagline: "ڈیجیٹل نشان کے بغیر مواصلت۔ ڈیزائن کے مطابق عارضی۔",
      legal: "تمام ڈیٹا 24 گھنٹے بعد خود بخود حذف ہو جاتا ہے۔ کوئی سائن اپ نہیں، کوئی ٹریکنگ نہیں۔",
    },
    meta: {
      home_title: "مفت عارضی ای میل ایڈریس | Ghist — فوری اور گمنام",
      home_desc: "سیکنڈوں میں مفت ڈسپوزایبل ای میل ایڈریس حاصل کریں — کوئی سائن اپ نہیں، کوئی ٹریکنگ نہیں۔ مفت ٹرائل، OTP اور اسپام سے بچنے کے لیے بہترین۔ 24 گھنٹے بعد مستقل طور پر حذف۔",
    },
  },

  id: {
    nav: {
      home: "Beranda",
      privacy: "Privasi",
      terms: "Ketentuan",
      about: "Tentang",
      faq: "FAQ",
      blog: "Blog",
      contact: "Kontak",
    },
    home: {
      tagline: "Email sekali pakai instan. Tanpa daftar. Tanpa pelacakan.",
      description: "Dapatkan alamat email sementara gratis dalam hitungan detik. Sempurna untuk uji coba gratis, OTP, dan menghindari spam. Dihapus otomatis setelah 24 jam.",
      cta: "Buat Email",
    },
    privacy: {
      title: "Kebijakan Privasi — Ghist",
      sections: {
        what_we_collect: "Apa yang kami kumpulkan",
        how_we_use: "Bagaimana kami menggunakannya",
        data_retention: "Retensi data",
        cookies: "Cookie",
        contact: "Kontak",
      },
    },
    terms: {
      title: "Ketentuan Layanan — Ghist",
      sections: {
        acceptable_use: "Penggunaan yang dapat diterima",
        prohibited: "Aktivitas yang dilarang",
        liability: "Batasan tanggung jawab",
        changes: "Perubahan ketentuan",
        governing_law: "Hukum yang berlaku",
      },
    },
    about: {
      title: "Tentang Ghist",
      description: "Ghist adalah layanan email sekali pakai gratis yang dirancang untuk pengguna yang peduli privasi dan ingin melindungi kotak masuk nyata mereka dari spam dan pelacakan.",
      mission: "Misi kami adalah membuat privasi menjadi sederhana dan mudah diakses — email sementara dalam hitungan detik, tanpa akun, tidak ada yang disimpan.",
      values: "Kami percaya pada pengumpulan data minimal, transparansi penuh, dan arsitektur yang sementara secara desain.",
    },
    faq: {
      title: "Pertanyaan yang Sering Diajukan",
      questions: [
        { q: "Apa itu Ghist?", a: "Ghist adalah layanan email sementara sekali pakai gratis. Ini menghasilkan alamat email anonim secara instan — tanpa akun atau pendaftaran yang diperlukan. Semua email dihapus secara permanen setelah 24 jam." },
        { q: "Berapa lama alamat Ghist bertahan?", a: "Setiap alamat Ghist dan semua pesannya dihapus secara otomatis dan permanen setelah 24 jam. Tidak dapat dipulihkan setelah penghapusan." },
        { q: "Apakah Ghist sepenuhnya gratis?", a: "Ya. Ghist 100% gratis tanpa tingkatan premium, tanpa pendaftaran, dan tanpa kartu kredit yang diperlukan." },
        { q: "Apakah saya perlu membuat akun?", a: "Tidak. Ghist menghasilkan alamat email sementara saat Anda membuka situs. Tidak diperlukan akun, kata sandi, atau informasi pribadi." },
        { q: "Apakah Ghist aman untuk OTP?", a: "Ya. Ghist menggunakan enkripsi TLS 1.3 dan sesi diisolasi — alamat sementara Anda tidak pernah dikaitkan dengan identitas asli Anda." },
        { q: "Untuk apa Ghist berguna?", a: "Ghist berguna untuk mendaftar uji coba gratis tanpa menerima spam, mengunduh konten berbayar, menerima kode verifikasi, dan situasi apa pun di mana Anda membutuhkan email sementara." },
        { q: "Apakah Ghist menyimpan atau menjual data saya?", a: "Tidak. Ghist tidak memerlukan informasi pribadi, tidak melacak pengguna, dan menghapus semua email secara permanen setelah 24 jam." },
        { q: "Apa yang terjadi dengan email saya setelah 24 jam?", a: "Semua email dan alamat sementara itu sendiri dihapus secara permanen dan tidak dapat dipulihkan setelah 24 jam. Ini memang disengaja — Ghist bersifat sementara secara arsitektur." },
        { q: "Bisakah saya mengirim email dari alamat Ghist?", a: "Tidak. Ghist adalah layanan terima saja. Anda hanya bisa menerima email, tidak mengirim." },
        { q: "Bisakah saya memilih alamat email saya sendiri?", a: "Saat ini, Ghist secara otomatis menghasilkan alamat acak. Alamat kustom tidak didukung secara sengaja." },
      ],
    },
    blog: {
      title: "Blog Ghist",
      read_more: "Baca selengkapnya",
      all_posts: "Semua postingan",
      by_category: "Berdasarkan kategori",
    },
    contact: {
      title: "Hubungi Kami",
      name_label: "Nama Anda",
      email_label: "Email Anda",
      subject_label: "Subjek",
      message_label: "Pesan",
      submit: "Kirim pesan",
      success: "Pesan Anda berhasil dikirim. Kami akan menghubungi Anda segera.",
      error: "Ada yang salah. Silakan coba lagi nanti.",
    },
    footer: {
      tagline: "Komunikasi tanpa jejak digital. Sementara secara desain.",
      legal: "Semua data dihapus otomatis setelah 24 jam. Tanpa daftar, tanpa pelacakan.",
    },
    meta: {
      home_title: "Alamat Email Sementara Gratis | Ghist — Instan & Anonim",
      home_desc: "Dapatkan alamat email sekali pakai gratis dalam hitungan detik — tanpa daftar, tanpa pelacakan. Sempurna untuk uji coba gratis, OTP, dan menghindari spam. Dihapus permanen setelah 24 jam.",
    },
  },

  de: {
    nav: {
      home: "Startseite",
      privacy: "Datenschutz",
      terms: "Nutzungsbedingungen",
      about: "Über uns",
      faq: "Häufige Fragen",
      blog: "Blog",
      contact: "Kontakt",
    },
    home: {
      tagline: "Sofortige Wegwerf-E-Mail. Keine Anmeldung. Kein Tracking.",
      description: "Erhalten Sie in Sekunden eine kostenlose temporäre E-Mail-Adresse. Ideal für kostenlose Testversionen, OTPs und Schutz vor Spam. Nach 24 Stunden automatisch gelöscht.",
      cta: "E-Mail generieren",
    },
    privacy: {
      title: "Datenschutzrichtlinie — Ghist",
      sections: {
        what_we_collect: "Was wir sammeln",
        how_we_use: "Wie wir es verwenden",
        data_retention: "Datenspeicherung",
        cookies: "Cookies",
        contact: "Kontakt",
      },
    },
    terms: {
      title: "Nutzungsbedingungen — Ghist",
      sections: {
        acceptable_use: "Akzeptable Nutzung",
        prohibited: "Verbotene Aktivitäten",
        liability: "Haftungsbeschränkung",
        changes: "Änderungen der Bedingungen",
        governing_law: "Anwendbares Recht",
      },
    },
    about: {
      title: "Über Ghist",
      description: "Ghist ist ein kostenloser Wegwerf-E-Mail-Dienst für datenschutzbewusste Nutzer, die ihren echten Posteingang vor Spam und Tracking schützen möchten.",
      mission: "Unsere Mission ist es, Datenschutz einfach und zugänglich zu machen — eine temporäre E-Mail in Sekunden, kein Konto erforderlich, nichts gespeichert.",
      values: "Wir glauben an minimale Datenerhebung, vollständige Transparenz und eine ephemere Architektur by Design.",
    },
    faq: {
      title: "Häufig gestellte Fragen",
      questions: [
        { q: "Was ist Ghist?", a: "Ghist ist ein kostenloser Wegwerf-E-Mail-Dienst. Er generiert sofort eine anonyme E-Mail-Adresse — ohne Konto oder Anmeldung. Alle E-Mails werden nach 24 Stunden dauerhaft gelöscht." },
        { q: "Wie lange hält eine Ghist-Adresse?", a: "Jede Ghist-Adresse und alle ihre Nachrichten werden nach 24 Stunden automatisch und dauerhaft gelöscht. Eine Wiederherstellung ist danach nicht möglich." },
        { q: "Ist Ghist vollständig kostenlos?", a: "Ja. Ghist ist zu 100 % kostenlos ohne Premium-Stufen, ohne Anmeldung und ohne Kreditkarte." },
        { q: "Muss ich ein Konto erstellen?", a: "Nein. Ghist generiert beim Öffnen der Website sofort eine temporäre E-Mail-Adresse. Kein Konto, kein Passwort, keine persönlichen Daten erforderlich." },
        { q: "Ist Ghist sicher für OTPs?", a: "Ja. Ghist verwendet TLS 1.3-Verschlüsselung, Sessions sind isoliert — Ihre temporäre Adresse ist nie mit Ihrer echten Identität verknüpft." },
        { q: "Wofür ist Ghist nützlich?", a: "Ghist eignet sich für die Anmeldung zu kostenlosen Testversionen ohne Spam, zum Herunterladen gesperrter Inhalte, zum Empfang von Verifizierungscodes und überall dort, wo Sie eine temporäre E-Mail benötigen." },
        { q: "Speichert oder verkauft Ghist meine Daten?", a: "Nein. Ghist benötigt keine persönlichen Daten, verfolgt keine Nutzer und löscht alle E-Mails nach 24 Stunden dauerhaft." },
        { q: "Was passiert mit meinen E-Mails nach 24 Stunden?", a: "Alle E-Mails und die temporäre Adresse selbst werden nach 24 Stunden dauerhaft und unwiederbringlich gelöscht. Das ist bewusst so gestaltet — Ghist ist ephemer by Architecture." },
        { q: "Kann ich E-Mails von einer Ghist-Adresse senden?", a: "Nein. Ghist ist ein reiner Empfangsdienst. Sie können nur E-Mails empfangen, nicht senden." },
        { q: "Kann ich meine eigene E-Mail-Adresse wählen?", a: "Derzeit generiert Ghist automatisch eine zufällige Adresse. Benutzerdefinierte Adressen werden absichtlich nicht unterstützt." },
      ],
    },
    blog: {
      title: "Ghist Blog",
      read_more: "Mehr lesen",
      all_posts: "Alle Beiträge",
      by_category: "Nach Kategorie",
    },
    contact: {
      title: "Kontakt",
      name_label: "Ihr Name",
      email_label: "Ihre E-Mail",
      subject_label: "Betreff",
      message_label: "Nachricht",
      submit: "Nachricht senden",
      success: "Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns bald bei Ihnen.",
      error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.",
    },
    footer: {
      tagline: "Kommunikation ohne digitalen Fußabdruck. Ephemer by Design.",
      legal: "Alle Daten werden nach 24 Stunden automatisch gelöscht. Ohne Anmeldung, ohne Tracking.",
    },
    meta: {
      home_title: "Kostenlose temporäre E-Mail-Adresse | Ghist — Sofort & Anonym",
      home_desc: "Erhalten Sie in Sekunden eine kostenlose Wegwerf-E-Mail-Adresse — ohne Anmeldung, ohne Tracking. Ideal für kostenlose Testversionen, OTPs und Schutz vor Spam. Nach 24 Stunden dauerhaft gelöscht.",
    },
  },

  ja: {
    nav: {
      home: "ホーム",
      privacy: "プライバシー",
      terms: "利用規約",
      about: "について",
      faq: "よくある質問",
      blog: "ブログ",
      contact: "お問い合わせ",
    },
    home: {
      tagline: "即時使い捨てメール。登録不要。追跡なし。",
      description: "数秒で無料の一時メールアドレスを取得。無料トライアル、OTP、スパム回避に最適。24時間後に自動削除。",
      cta: "メール作成",
    },
    privacy: {
      title: "プライバシーポリシー — Ghist",
      sections: {
        what_we_collect: "収集する情報",
        how_we_use: "使用方法",
        data_retention: "データ保持",
        cookies: "Cookie",
        contact: "お問い合わせ",
      },
    },
    terms: {
      title: "利用規約 — Ghist",
      sections: {
        acceptable_use: "許容される使用",
        prohibited: "禁止事項",
        liability: "免責事項",
        changes: "規約の変更",
        governing_law: "準拠法",
      },
    },
    about: {
      title: "Ghistについて",
      description: "Ghistは、プライバシーを重視するユーザーがスパムや追跡から本当の受信トレイを守るために構築された無料の使い捨てメールサービスです。",
      mission: "私たちのミッションは、プライバシーをシンプルでアクセスしやすいものにすることです — 数秒で一時メール、アカウント不要、何も保存しません。",
      values: "最小限のデータ収集、完全な透明性、そして設計による一時的なアーキテクチャを信じています。",
    },
    faq: {
      title: "よくある質問",
      questions: [
        { q: "Ghistとは何ですか？", a: "Ghistは無料の使い捨て一時メールサービスです。アカウントや登録なしで即座に匿名メールアドレスを生成します。すべてのメールは24時間後に永久に削除されます。" },
        { q: "Ghistのアドレスはどれくらい持続しますか？", a: "すべてのGhistアドレスとそのメッセージは24時間後に自動的かつ永久に削除されます。削除後に回復することはできません。" },
        { q: "Ghistは完全に無料ですか？", a: "はい。Ghistは100%無料で、プレミアム層なし、登録なし、クレジットカード不要です。" },
        { q: "アカウントを作成する必要がありますか？", a: "いいえ。サイトを開いた瞬間にGhistが一時メールアドレスを生成します。アカウント、パスワード、個人情報は必要ありません。" },
        { q: "GhistはOTPに安全ですか？", a: "はい。GhistはTLS 1.3暗号化を使用し、セッションは分離されています — あなたの一時アドレスは実際の身元に関連付けられることはありません。" },
        { q: "Ghistは何の役に立ちますか？", a: "Ghistは、スパムを受け取らずに無料トライアルに登録したり、ゲートコンテンツをダウンロードしたり、確認コードを受け取ったりする際に役立ちます。" },
        { q: "Ghistは私のデータを保存または販売しますか？", a: "いいえ。Ghistは個人情報を必要とせず、ユーザーを追跡せず、24時間後にすべてのメールを永久に削除します。" },
        { q: "24時間後にメールはどうなりますか？", a: "すべてのメールと一時アドレス自体が24時間後に永久かつ回復不可能に削除されます。これは設計によるものです。" },
        { q: "Ghistアドレスからメールを送信できますか？", a: "いいえ。Ghistは受信専用サービスです。メールを受け取ることはできますが、送信することはできません。" },
        { q: "自分のメールアドレスを選択できますか？", a: "現在、Ghistは自動的にランダムなアドレスを生成します。カスタムアドレスは意図的にサポートされていません。" },
      ],
    },
    blog: {
      title: "Ghistブログ",
      read_more: "続きを読む",
      all_posts: "すべての投稿",
      by_category: "カテゴリ別",
    },
    contact: {
      title: "お問い合わせ",
      name_label: "お名前",
      email_label: "メールアドレス",
      subject_label: "件名",
      message_label: "メッセージ",
      submit: "送信",
      success: "メッセージが正常に送信されました。まもなくご連絡いたします。",
      error: "問題が発生しました。後でもう一度お試しください。",
    },
    footer: {
      tagline: "デジタルフットプリントのないコミュニケーション。設計による一時性。",
      legal: "すべてのデータは24時間後に自動削除されます。登録なし、追跡なし。",
    },
    meta: {
      home_title: "無料一時メールアドレス | Ghist — 即時・匿名",
      home_desc: "数秒で無料の使い捨てメールアドレスを取得 — 登録なし、追跡なし。無料トライアル、OTP、スパム回避に最適。24時間後に永久削除。",
    },
  },

  vi: {
    nav: {
      home: "Trang chủ",
      privacy: "Quyền riêng tư",
      terms: "Điều khoản",
      about: "Về chúng tôi",
      faq: "Câu hỏi thường gặp",
      blog: "Blog",
      contact: "Liên hệ",
    },
    home: {
      tagline: "Email dùng một lần tức thì. Không đăng ký. Không theo dõi.",
      description: "Nhận địa chỉ email tạm thời miễn phí trong vài giây. Hoàn hảo cho dùng thử miễn phí, OTP và tránh thư rác. Tự động xóa sau 24 giờ.",
      cta: "Tạo email",
    },
    privacy: {
      title: "Chính sách bảo mật — Ghist",
      sections: {
        what_we_collect: "Chúng tôi thu thập gì",
        how_we_use: "Cách chúng tôi sử dụng",
        data_retention: "Lưu trữ dữ liệu",
        cookies: "Cookie",
        contact: "Liên hệ",
      },
    },
    terms: {
      title: "Điều khoản dịch vụ — Ghist",
      sections: {
        acceptable_use: "Sử dụng chấp nhận được",
        prohibited: "Hoạt động bị cấm",
        liability: "Giới hạn trách nhiệm",
        changes: "Thay đổi điều khoản",
        governing_law: "Luật áp dụng",
      },
    },
    about: {
      title: "Về Ghist",
      description: "Ghist là dịch vụ email dùng một lần miễn phí được xây dựng cho những người dùng quan tâm đến quyền riêng tư muốn bảo vệ hộp thư thật của họ khỏi thư rác và theo dõi.",
      mission: "Sứ mệnh của chúng tôi là làm cho quyền riêng tư trở nên đơn giản và dễ tiếp cận — email tạm thời trong vài giây, không cần tài khoản, không lưu trữ gì.",
      values: "Chúng tôi tin vào thu thập dữ liệu tối thiểu, minh bạch hoàn toàn và kiến trúc tạm thời theo thiết kế.",
    },
    faq: {
      title: "Câu hỏi thường gặp",
      questions: [
        { q: "Ghist là gì?", a: "Ghist là dịch vụ email tạm thời dùng một lần miễn phí. Nó tạo địa chỉ email ẩn danh ngay lập tức — không cần tài khoản hoặc đăng ký. Tất cả email bị xóa vĩnh viễn sau 24 giờ." },
        { q: "Địa chỉ Ghist tồn tại bao lâu?", a: "Mỗi địa chỉ Ghist và tất cả tin nhắn của nó bị xóa tự động và vĩnh viễn sau 24 giờ. Không thể khôi phục sau khi xóa." },
        { q: "Ghist có hoàn toàn miễn phí không?", a: "Có. Ghist miễn phí 100% không có cấp độ cao cấp, không đăng ký và không cần thẻ tín dụng." },
        { q: "Tôi có cần tạo tài khoản không?", a: "Không. Ghist tạo địa chỉ email tạm thời ngay khi bạn mở trang web. Không cần tài khoản, mật khẩu hoặc thông tin cá nhân." },
        { q: "Ghist có an toàn cho OTP không?", a: "Có. Ghist sử dụng mã hóa TLS 1.3 và các phiên được cách ly — địa chỉ tạm thời của bạn không bao giờ được liên kết với danh tính thật của bạn." },
        { q: "Ghist hữu ích cho việc gì?", a: "Ghist hữu ích để đăng ký dùng thử miễn phí mà không nhận spam, tải xuống nội dung bị giới hạn, nhận mã xác minh và bất kỳ tình huống nào cần email tạm thời." },
        { q: "Ghist có lưu trữ hoặc bán dữ liệu của tôi không?", a: "Không. Ghist không yêu cầu thông tin cá nhân, không theo dõi người dùng và xóa vĩnh viễn tất cả email sau 24 giờ." },
        { q: "Điều gì xảy ra với email của tôi sau 24 giờ?", a: "Tất cả email và địa chỉ tạm thời bị xóa vĩnh viễn và không thể khôi phục sau 24 giờ. Đây là theo thiết kế — Ghist là tạm thời theo kiến trúc." },
        { q: "Tôi có thể gửi email từ địa chỉ Ghist không?", a: "Không. Ghist chỉ là dịch vụ nhận. Bạn chỉ có thể nhận email, không gửi." },
        { q: "Tôi có thể chọn địa chỉ email của mình không?", a: "Hiện tại, Ghist tự động tạo địa chỉ ngẫu nhiên. Địa chỉ tùy chỉnh không được hỗ trợ theo thiết kế." },
      ],
    },
    blog: {
      title: "Blog Ghist",
      read_more: "Đọc thêm",
      all_posts: "Tất cả bài viết",
      by_category: "Theo danh mục",
    },
    contact: {
      title: "Liên hệ chúng tôi",
      name_label: "Tên của bạn",
      email_label: "Email của bạn",
      subject_label: "Chủ đề",
      message_label: "Tin nhắn",
      submit: "Gửi tin nhắn",
      success: "Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm.",
      error: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
    },
    footer: {
      tagline: "Giao tiếp không để lại dấu vết kỹ thuật số. Tạm thời theo thiết kế.",
      legal: "Tất cả dữ liệu tự động xóa sau 24 giờ. Không đăng ký, không theo dõi.",
    },
    meta: {
      home_title: "Địa chỉ Email Tạm Thời Miễn Phí | Ghist — Tức Thì & Ẩn Danh",
      home_desc: "Nhận địa chỉ email dùng một lần miễn phí trong vài giây — không đăng ký, không theo dõi. Hoàn hảo cho dùng thử miễn phí, OTP và tránh thư rác. Xóa vĩnh viễn sau 24 giờ.",
    },
  },

  te: {
    nav: {
      home: "హోమ్",
      privacy: "గోప్యత",
      terms: "నిబంధనలు",
      about: "మా గురించి",
      faq: "తరచుగా అడిగే ప్రశ్నలు",
      blog: "బ్లాగ్",
      contact: "సంప్రదించండి",
    },
    home: {
      tagline: "తక్షణ డిస్పోజబుల్ ఇమెయిల్. సైన్-అప్ లేదు. ట్రాకింగ్ లేదు.",
      description: "సెకన్లలో ఉచిత తాత్కాలిక ఇమెయిల్ చిరునామా పొందండి. ఉచిత ట్రయల్స్, OTPలు మరియు స్పామ్ నివారణకు సరైనది. 24 గంటల తర్వాత స్వయంచాలకంగా తొలగించబడుతుంది.",
      cta: "ఇమెయిల్ సృష్టించండి",
    },
    privacy: {
      title: "గోప్యతా విధానం — Ghist",
      sections: {
        what_we_collect: "మేము ఏమి సేకరిస్తాం",
        how_we_use: "మేము దాన్ని ఎలా ఉపయోగిస్తాం",
        data_retention: "డేటా నిలుపుదల",
        cookies: "కుకీలు",
        contact: "సంప్రదించండి",
      },
    },
    terms: {
      title: "సేవా నిబంధనలు — Ghist",
      sections: {
        acceptable_use: "ఆమోదయోగ్యమైన వినియోగం",
        prohibited: "నిషిద్ధ కార్యకలాపాలు",
        liability: "బాధ్యత పరిమితి",
        changes: "నిబంధనలలో మార్పులు",
        governing_law: "పాలక చట్టం",
      },
    },
    about: {
      title: "Ghist గురించి",
      description: "Ghist అనేది గోప్యత-స్పృహ ఉన్న వినియోగదారుల కోసం నిర్మించిన ఉచిత డిస్పోజబుల్ ఇమెయిల్ సేవ, వారు తమ నిజమైన ఇన్‌బాక్స్‌ని స్పామ్ మరియు ట్రాకింగ్ నుండి రక్షించుకోవాలనుకుంటారు.",
      mission: "మా లక్ష్యం గోప్యతను సరళంగా మరియు అందుబాటులో ఉంచడం — సెకన్లలో తాత్కాలిక ఇమెయిల్, ఖాతా అవసరం లేదు, ఏమీ నిల్వ చేయబడదు.",
      values: "మేము కనిష్ట డేటా సేకరణ, పూర్తి పారదర్శకత మరియు డిజైన్ ద్వారా అస్థాయి ఆర్కిటెక్చర్‌లో విశ్వసిస్తాం.",
    },
    faq: {
      title: "తరచుగా అడిగే ప్రశ్నలు",
      questions: [
        { q: "Ghist అంటే ఏమిటి?", a: "Ghist అనేది ఉచిత డిస్పోజబుల్ తాత్కాలిక ఇమెయిల్ సేవ. ఇది తక్షణమే అనామక ఇమెయిల్ చిరునామాను రూపొందిస్తుంది — ఖాతా లేదా సైన్-అప్ అవసరం లేదు. అన్ని ఇమెయిళ్లు 24 గంటల తర్వాత శాశ్వతంగా తొలగించబడతాయి." },
        { q: "Ghist చిరునామా ఎంత కాలం ఉంటుంది?", a: "ప్రతి Ghist చిరునామా మరియు దాని అన్ని సందేశాలు 24 గంటల తర్వాత స్వయంచాలకంగా శాశ్వతంగా తొలగించబడతాయి. తొలగించిన తర్వాత పునరుద్ధరించడం సాధ్యం కాదు." },
        { q: "Ghist పూర్తిగా ఉచితమా?", a: "అవును. Ghist 100% ఉచితం, ప్రీమియం స్థాయిలు లేవు, సైన్-అప్ లేదు, క్రెడిట్ కార్డు అవసరం లేదు." },
        { q: "నాకు ఖాతా సృష్టించాల్సిన అవసరం ఉందా?", a: "లేదు. మీరు సైట్ తెరవగానే Ghist తాత్కాలిక ఇమెయిల్ చిరునామాను రూపొందిస్తుంది. ఖాతా, పాస్‌వర్డ్ లేదా వ్యక్తిగత సమాచారం అవసరం లేదు." },
        { q: "OTPల కోసం Ghist సురక్షితమా?", a: "అవును. Ghist TLS 1.3 ఎన్‌క్రిప్షన్ ఉపయోగిస్తుంది మరియు సెషన్లు వేర్పడి ఉంటాయి — మీ తాత్కాలిక చిరునామా మీ నిజమైన గుర్తింపుతో ఎప్పుడూ అనుసంధానించబడదు." },
        { q: "Ghist దేనికి ఉపయోగకరంగా ఉంటుంది?", a: "Ghist స్పామ్ లేకుండా ఉచిత ట్రయల్‌లకు సైన్ అప్ చేయడానికి, గేటెడ్ కంటెంట్ డౌన్‌లోడ్ చేయడానికి, ధృవీకరణ కోడ్‌లు స్వీకరించడానికి ఉపయోగకరంగా ఉంటుంది." },
        { q: "Ghist నా డేటాను నిల్వ చేస్తుందా లేదా విక్రయిస్తుందా?", a: "లేదు. Ghist వ్యక్తిగత సమాచారం అవసరం లేదు, వినియోగదారులను ట్రాక్ చేయదు మరియు 24 గంటల తర్వాత అన్ని ఇమెయిళ్లను శాశ్వతంగా తొలగిస్తుంది." },
        { q: "24 గంటల తర్వాత నా ఇమెయిళ్లకు ఏమి జరుగుతుంది?", a: "అన్ని ఇమెయిళ్లు మరియు తాత్కాలిక ఇమెయిల్ చిరునామా 24 గంటల తర్వాత శాశ్వతంగా తొలగించబడతాయి. ఇది డిజైన్ ద్వారా — Ghist ఆర్కిటెక్చర్ ద్వారా అస్థాయిగా ఉంటుంది." },
        { q: "Ghist చిరునామా నుండి ఇమెయిళ్లు పంపగలనా?", a: "లేదు. Ghist అనేది స్వీకరించే-మాత్రమే సేవ. మీరు ఇమెయిళ్లు మాత్రమే స్వీకరించగలరు, పంపలేరు." },
        { q: "నా సొంత ఇమెయిల్ చిరునామా ఎంచుకోవచ్చా?", a: "ప్రస్తుతం, Ghist స్వయంచాలకంగా యాదృచ్ఛిక చిరునామాను రూపొందిస్తుంది. కస్టమ్ చిరునామాలు మద్దతు లేవు." },
      ],
    },
    blog: {
      title: "Ghist బ్లాగ్",
      read_more: "మరింత చదవండి",
      all_posts: "అన్ని పోస్ట్‌లు",
      by_category: "వర్గం ద్వారా",
    },
    contact: {
      title: "మాతో సంప్రదించండి",
      name_label: "మీ పేరు",
      email_label: "మీ ఇమెయిల్",
      subject_label: "విషయం",
      message_label: "సందేశం",
      submit: "సందేశం పంపండి",
      success: "మీ సందేశం విజయవంతంగా పంపబడింది. మేము త్వరలో మీతో సంప్రదిస్తాం.",
      error: "ఏదో తప్పు జరిగింది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
    },
    footer: {
      tagline: "డిజిటల్ ముద్ర లేకుండా కమ్యూనికేషన్. డిజైన్ ద్వారా అస్థాయి.",
      legal: "అన్ని డేటా 24 గంటల తర్వాత స్వయంచాలకంగా తొలగించబడుతుంది. సైన్అప్ లేదు, ట్రాకింగ్ లేదు.",
    },
    meta: {
      home_title: "ఉచిత తాత్కాలిక ఇమెయిల్ చిరునామా | Ghist — తక్షణ & అనామక",
      home_desc: "సెకన్లలో ఉచిత డిస్పోజబుల్ ఇమెయిల్ చిరునామా పొందండి — సైన్-అప్ లేదు, ట్రాకింగ్ లేదు. ఉచిత ట్రయల్స్, OTPలు మరియు స్పామ్ నివారణకు సరైనది. 24 గంటల తర్వాత శాశ్వతంగా తొలగించబడుతుంది.",
    },
  },

  mr: {
    nav: {
      home: "मुख्यपृष्ठ",
      privacy: "गोपनीयता",
      terms: "अटी",
      about: "आमच्याबद्दल",
      faq: "वारंवार विचारले जाणारे प्रश्न",
      blog: "ब्लॉग",
      contact: "संपर्क",
    },
    home: {
      tagline: "त्वरित डिस्पोजेबल ईमेल. साइन-अप नाही. ट्रॅकिंग नाही.",
      description: "सेकंदात मोफत तात्पुरती ईमेल पत्ता मिळवा. मोफत चाचण्या, OTP आणि स्पॅम टाळण्यासाठी उत्तम. 24 तासांनंतर आपोआप हटवले जाते.",
      cta: "ईमेल तयार करा",
    },
    privacy: {
      title: "गोपनीयता धोरण — Ghist",
      sections: {
        what_we_collect: "आम्ही काय गोळा करतो",
        how_we_use: "आम्ही ते कसे वापरतो",
        data_retention: "डेटा ठेवणे",
        cookies: "कुकीज",
        contact: "संपर्क",
      },
    },
    terms: {
      title: "सेवेच्या अटी — Ghist",
      sections: {
        acceptable_use: "स्वीकार्य वापर",
        prohibited: "निषिद्ध क्रियाकलाप",
        liability: "दायित्व मर्यादा",
        changes: "अटींमध्ये बदल",
        governing_law: "शासन कायदा",
      },
    },
    about: {
      title: "Ghist बद्दल",
      description: "Ghist ही एक मोफत डिस्पोजेबल ईमेल सेवा आहे जी गोपनीयता-सजग वापरकर्त्यांसाठी बांधली गेली आहे जे त्यांचा खरा इनबॉक्स स्पॅम आणि ट्रॅकिंगपासून संरक्षित करू इच्छितात.",
      mission: "आमचे ध्येय गोपनीयता सोपी आणि सुलभ बनवणे आहे — सेकंदात तात्पुरती ईमेल, खाते आवश्यक नाही, काहीही साठवले जात नाही.",
      values: "आम्ही किमान डेटा संकलन, संपूर्ण पारदर्शकता आणि डिझाइनद्वारे क्षणभंगुर आर्किटेक्चरवर विश्वास ठेवतो.",
    },
    faq: {
      title: "वारंवार विचारले जाणारे प्रश्न",
      questions: [
        { q: "Ghist काय आहे?", a: "Ghist ही एक मोफत डिस्पोजेबल तात्पुरती ईमेल सेवा आहे. ती त्वरित एक अनामिक ईमेल पत्ता तयार करते — कोणतेही खाते किंवा साइन-अप आवश्यक नाही. सर्व ईमेल 24 तासांनंतर कायमचे हटवले जातात." },
        { q: "Ghist ईमेल पत्ता किती काळ टिकतो?", a: "प्रत्येक Ghist ईमेल पत्ता आणि त्याचे सर्व संदेश 24 तासांनंतर आपोआप कायमचे हटवले जातात. हटवल्यानंतर ते पुनर्प्राप्त करणे शक्य नाही." },
        { q: "Ghist पूर्णपणे मोफत आहे का?", a: "होय. Ghist 100% मोफत आहे कोणत्याही प्रीमियम स्तरांशिवाय, साइन-अपशिवाय आणि क्रेडिट कार्डशिवाय." },
        { q: "मला खाते तयार करणे आवश्यक आहे का?", a: "नाही. Ghist साइट उघडल्यावर त्वरित तात्पुरती ईमेल पत्ता तयार करते. कोणतेही खाते, पासवर्ड किंवा वैयक्तिक माहिती आवश्यक नाही." },
        { q: "OTP साठी Ghist सुरक्षित आहे का?", a: "होय. Ghist TLS 1.3 एनक्रिप्शन वापरते आणि सत्रे वेगळी असतात — तुमचा तात्पुरता पत्ता कधीही तुमच्या खऱ्या ओळखीशी जोडला जात नाही." },
        { q: "Ghist कशासाठी उपयुक्त आहे?", a: "Ghist स्पॅम न मिळवता मोफत चाचण्यांसाठी साइन अप करण्यासाठी, गेटेड सामग्री डाउनलोड करण्यासाठी, पडताळणी कोड प्राप्त करण्यासाठी उपयुक्त आहे." },
        { q: "Ghist माझा डेटा साठवतो किंवा विकतो का?", a: "नाही. Ghist ला कोणत्याही वैयक्तिक माहितीची आवश्यकता नाही, वापरकर्त्यांना ट्रॅक करत नाही आणि 24 तासांनंतर सर्व ईमेल कायमचे हटवते." },
        { q: "24 तासांनंतर माझ्या ईमेलचे काय होते?", a: "सर्व ईमेल आणि तात्पुरता ईमेल पत्ता 24 तासांनंतर कायमचे आणि अपरिवर्तनीयपणे हटवले जातात. हे डिझाइनद्वारे आहे." },
        { q: "मी Ghist पत्त्यावरून ईमेल पाठवू शकतो का?", a: "नाही. Ghist ही फक्त प्राप्त करण्याची सेवा आहे. तुम्ही फक्त ईमेल प्राप्त करू शकता, पाठवू शकत नाही." },
        { q: "मी माझा स्वतःचा ईमेल पत्ता निवडू शकतो का?", a: "सध्या, Ghist आपोआप एक यादृच्छिक पत्ता तयार करते. सानुकूल पत्ते समर्थित नाहीत." },
      ],
    },
    blog: {
      title: "Ghist ब्लॉग",
      read_more: "अधिक वाचा",
      all_posts: "सर्व पोस्ट",
      by_category: "श्रेणीनुसार",
    },
    contact: {
      title: "आमच्याशी संपर्क करा",
      name_label: "तुमचे नाव",
      email_label: "तुमचा ईमेल",
      subject_label: "विषय",
      message_label: "संदेश",
      submit: "संदेश पाठवा",
      success: "तुमचा संदेश यशस्वीरित्या पाठवला गेला. आम्ही लवकरच तुमच्याशी संपर्क करू.",
      error: "काहीतरी चूक झाली. कृपया नंतर पुन्हा प्रयत्न करा.",
    },
    footer: {
      tagline: "डिजिटल ठसा न ठेवता संवाद. डिझाइनद्वारे क्षणभंगुर.",
      legal: "सर्व डेटा 24 तासांनंतर आपोआप हटवला जातो. साइनअप नाही, ट्रॅकिंग नाही.",
    },
    meta: {
      home_title: "मोफत तात्पुरती ईमेल पत्ता | Ghist — त्वरित आणि अनामिक",
      home_desc: "सेकंदात मोफत डिस्पोजेबल ईमेल पत्ता मिळवा — साइन-अप नाही, ट्रॅकिंग नाही. मोफत चाचण्या, OTP आणि स्पॅम टाळण्यासाठी उत्तम. 24 तासांनंतर कायमचे हटवले जाते.",
    },
  },

  tr: {
    nav: {
      home: "Ana Sayfa",
      privacy: "Gizlilik",
      terms: "Şartlar",
      about: "Hakkımızda",
      faq: "Sık Sorulan Sorular",
      blog: "Blog",
      contact: "İletişim",
    },
    home: {
      tagline: "Anında tek kullanımlık e-posta. Kayıt yok. Takip yok.",
      description: "Saniyeler içinde ücretsiz geçici e-posta adresi alın. Ücretsiz denemeler, OTP'ler ve spam'den kaçınmak için mükemmel. 24 saat sonra otomatik olarak silinir.",
      cta: "E-posta Oluştur",
    },
    privacy: {
      title: "Gizlilik Politikası — Ghist",
      sections: {
        what_we_collect: "Ne topluyoruz",
        how_we_use: "Nasıl kullanıyoruz",
        data_retention: "Veri saklama",
        cookies: "Çerezler",
        contact: "İletişim",
      },
    },
    terms: {
      title: "Hizmet Şartları — Ghist",
      sections: {
        acceptable_use: "Kabul edilebilir kullanım",
        prohibited: "Yasaklı faaliyetler",
        liability: "Sorumluluk sınırlaması",
        changes: "Şartlarda değişiklikler",
        governing_law: "Geçerli hukuk",
      },
    },
    about: {
      title: "Ghist Hakkında",
      description: "Ghist, gerçek gelen kutularını spam'den ve takipten korumak isteyen gizlilik bilincine sahip kullanıcılar için oluşturulmuş ücretsiz bir tek kullanımlık e-posta hizmetidir.",
      mission: "Misyonumuz gizliliği basit ve erişilebilir kılmaktır — saniyeler içinde geçici e-posta, hesap gerekmez, hiçbir şey saklanmaz.",
      values: "Minimum veri toplamaya, tam şeffaflığa ve tasarım gereği geçici mimariye inanıyoruz.",
    },
    faq: {
      title: "Sık Sorulan Sorular",
      questions: [
        { q: "Ghist nedir?", a: "Ghist, ücretsiz bir tek kullanımlık geçici e-posta hizmetidir. Hesap veya kayıt gerektirmeden anında anonim bir e-posta adresi oluşturur. Tüm e-postalar 24 saat sonra kalıcı olarak silinir." },
        { q: "Ghist adresi ne kadar sürer?", a: "Her Ghist adresi ve tüm mesajları 24 saat sonra otomatik ve kalıcı olarak silinir. Silindikten sonra kurtarılamaz." },
        { q: "Ghist tamamen ücretsiz mi?", a: "Evet. Ghist %100 ücretsizdir; premium katman, kayıt veya kredi kartı gerekmez." },
        { q: "Hesap oluşturmam gerekiyor mu?", a: "Hayır. Ghist, siteyi açtığınız anda geçici bir e-posta adresi oluşturur. Hesap, şifre veya kişisel bilgi gerekmez." },
        { q: "Ghist OTP'ler için güvenli mi?", a: "Evet. Ghist TLS 1.3 şifrelemesi kullanır ve oturumlar izole edilmiştir — geçici adresiniz asla gerçek kimliğinizle ilişkilendirilmez." },
        { q: "Ghist ne işe yarar?", a: "Ghist, spam almadan ücretsiz deneme kaydı, kısıtlı içerik indirme, doğrulama kodu alma ve geçici e-posta gereken her durumda kullanışlıdır." },
        { q: "Ghist verilerimi saklıyor veya satıyor mu?", a: "Hayır. Ghist kişisel bilgi gerektirmez, kullanıcıları takip etmez ve 24 saat sonra tüm e-postaları kalıcı olarak siler." },
        { q: "24 saat sonra e-postalarıma ne olur?", a: "Tüm e-postalar ve geçici adres 24 saat sonra kalıcı ve geri dönülemez şekilde silinir. Bu tasarım gereğidir — Ghist mimari olarak geçicidir." },
        { q: "Ghist adresinden e-posta gönderebilir miyim?", a: "Hayır. Ghist yalnızca alıcı bir hizmettir. Yalnızca e-posta alabilirsiniz, gönderemezsiniz." },
        { q: "Kendi e-posta adresimi seçebilir miyim?", a: "Şu anda Ghist otomatik olarak rastgele bir adres oluşturur. Özel adresler kasıtlı olarak desteklenmemektedir." },
      ],
    },
    blog: {
      title: "Ghist Blog",
      read_more: "Devamını oku",
      all_posts: "Tüm yazılar",
      by_category: "Kategoriye göre",
    },
    contact: {
      title: "Bize Ulaşın",
      name_label: "Adınız",
      email_label: "E-posta adresiniz",
      subject_label: "Konu",
      message_label: "Mesaj",
      submit: "Mesaj gönder",
      success: "Mesajınız başarıyla gönderildi. Yakında size geri döneceğiz.",
      error: "Bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin.",
    },
    footer: {
      tagline: "Dijital iz bırakmadan iletişim. Tasarım gereği geçici.",
      legal: "Tüm veriler 24 saat sonra otomatik olarak silinir. Kayıt yok, takip yok.",
    },
    meta: {
      home_title: "Ücretsiz Geçici E-posta Adresi | Ghist — Anında & Anonim",
      home_desc: "Saniyeler içinde ücretsiz tek kullanımlık e-posta adresi alın — kayıt yok, takip yok. Ücretsiz denemeler, OTP'ler ve spam'den kaçınmak için mükemmel. 24 saat sonra kalıcı olarak silinir.",
    },
  },

  ta: {
    nav: {
      home: "முகப்பு",
      privacy: "தனியுரிமை",
      terms: "விதிமுறைகள்",
      about: "எங்களைப் பற்றி",
      faq: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      blog: "வலைப்பதிவு",
      contact: "தொடர்பு கொள்ளுங்கள்",
    },
    home: {
      tagline: "உடனடி ஒருமுறை பயன்படுத்தும் மின்னஞ்சல். பதிவு இல்லை. கண்காணிப்பு இல்லை.",
      description: "சில நொடிகளில் இலவச தற்காலிக மின்னஞ்சல் முகவரி பெறுங்கள். இலவச சோதனைகள், OTPகள் மற்றும் ஸ்பாம் தவிர்க்க சரியானது. 24 மணி நேரத்திற்கு பிறகு தானாக நீக்கப்படும்.",
      cta: "மின்னஞ்சல் உருவாக்கு",
    },
    privacy: {
      title: "தனியுரிமை கொள்கை — Ghist",
      sections: {
        what_we_collect: "நாம் சேகரிப்பது என்ன",
        how_we_use: "நாம் எவ்வாறு பயன்படுத்துகிறோம்",
        data_retention: "தரவு தக்கவைப்பு",
        cookies: "குக்கீகள்",
        contact: "தொடர்பு",
      },
    },
    terms: {
      title: "சேவை விதிமுறைகள் — Ghist",
      sections: {
        acceptable_use: "ஏற்றுக்கொள்ளக்கூடிய பயன்பாடு",
        prohibited: "தடைசெய்யப்பட்ட செயல்கள்",
        liability: "பொறுப்பு வரம்பு",
        changes: "விதிமுறைகளில் மாற்றங்கள்",
        governing_law: "ஆளும் சட்டம்",
      },
    },
    about: {
      title: "Ghist பற்றி",
      description: "Ghist என்பது தனியுரிமை-விழிப்புணர்வுள்ள பயனர்களுக்காக உருவாக்கப்பட்ட இலவச ஒருமுறை பயன்படுத்தும் மின்னஞ்சல் சேவையாகும், அவர்கள் தங்கள் உண்மையான இன்பாக்ஸை ஸ்பாம் மற்றும் கண்காணிப்பிலிருந்து பாதுகாக்க விரும்புகிறார்கள்.",
      mission: "எங்கள் குறிக்கோள் தனியுரிமையை எளிமையாகவும் அணுகக்கூடியதாகவும் மாற்றுவதாகும் — சில நொடிகளில் தற்காலிக மின்னஞ்சல், கணக்கு தேவையில்லை, எதுவும் சேமிக்கப்படவில்லை.",
      values: "நாங்கள் குறைந்தபட்ச தரவு சேகரிப்பு, முழு வெளிப்படைத்தன்மை மற்றும் வடிவமைப்பு மூலம் நிலையற்ற கட்டமைப்பை நம்புகிறோம்.",
    },
    faq: {
      title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      questions: [
        { q: "Ghist என்றால் என்ன?", a: "Ghist என்பது இலவச ஒருமுறை பயன்படுத்தும் தற்காலிக மின்னஞ்சல் சேவையாகும். இது உடனடியாக ஒரு அநாமதேய மின்னஞ்சல் முகவரியை உருவாக்குகிறது — கணக்கு அல்லது பதிவு தேவையில்லை. அனைத்து மின்னஞ்சல்களும் 24 மணி நேரத்திற்கு பிறகு நிரந்தரமாக நீக்கப்படும்." },
        { q: "Ghist முகவரி எவ்வளவு காலம் நீடிக்கும்?", a: "ஒவ்வொரு Ghist முகவரியும் அதன் அனைத்து செய்திகளும் 24 மணி நேரத்திற்கு பிறகு தானாக நிரந்தரமாக நீக்கப்படும். நீக்கிய பிறகு மீட்டெடுக்க முடியாது." },
        { q: "Ghist முற்றிலும் இலவசமா?", a: "ஆம். Ghist 100% இலவசம் — பிரீமியம் நிலைகள் இல்லை, பதிவு இல்லை, கிரெடிட் கார்டு தேவையில்லை." },
        { q: "நான் கணக்கு உருவாக்க வேண்டுமா?", a: "இல்லை. தளத்தை திறந்தவுடன் Ghist தற்காலிக மின்னஞ்சல் முகவரியை உருவாக்குகிறது. கணக்கு, கடவுச்சொல் அல்லது தனிப்பட்ட தகவல் தேவையில்லை." },
        { q: "OTPகளுக்கு Ghist பாதுகாப்பானதா?", a: "ஆம். Ghist TLS 1.3 குறியாக்கம் பயன்படுத்துகிறது மற்றும் அமர்வுகள் தனிமைப்படுத்தப்பட்டிருக்கின்றன — உங்கள் தற்காலிக முகவரி உங்கள் உண்மையான அடையாளத்துடன் ஒருபோதும் இணைக்கப்படாது." },
        { q: "Ghist எதற்கு பயனுள்ளது?", a: "Ghist ஸ்பாம் பெறாமல் இலவச சோதனைகளுக்கு பதிவு செய்ய, கட்டுப்படுத்தப்பட்ட உள்ளடக்கத்தை பதிவிறக்க, சரிபார்ப்பு குறியீடுகளை பெற மற்றும் தற்காலிக மின்னஞ்சல் தேவைப்படும் எந்த சூழ்நிலையிலும் பயனுள்ளது." },
        { q: "Ghist என் தரவை சேமிக்கிறதா அல்லது விற்கிறதா?", a: "இல்லை. Ghist எந்த தனிப்பட்ட தகவலையும் தேவைப்படாது, பயனர்களை கண்காணிக்காது மற்றும் 24 மணி நேரத்திற்கு பிறகு அனைத்து மின்னஞ்சல்களையும் நிரந்தரமாக நீக்குகிறது." },
        { q: "24 மணி நேரத்திற்கு பிறகு என் மின்னஞ்சல்களுக்கு என்ன ஆகும்?", a: "அனைத்து மின்னஞ்சல்களும் தற்காலிக மின்னஞ்சல் முகவரியும் 24 மணி நேரத்திற்கு பிறகு நிரந்தரமாக மீட்டெடுக்க முடியாத வகையில் நீக்கப்படும்." },
        { q: "Ghist முகவரியிலிருந்து மின்னஞ்சல்கள் அனுப்பலாமா?", a: "இல்லை. Ghist ஒரு பெறுவதற்கான மட்டுமே சேவையாகும். நீங்கள் மட்டுமே மின்னஞ்சல்களை பெற முடியும், அனுப்ப முடியாது." },
        { q: "என் சொந்த மின்னஞ்சல் முகவரியை தேர்வு செய்யலாமா?", a: "தற்போது, Ghist தானாக ஒரு சீரற்ற முகவரியை உருவாக்குகிறது. தனிப்பயன் முகவரிகள் ஆதரிக்கப்படவில்லை." },
      ],
    },
    blog: {
      title: "Ghist வலைப்பதிவு",
      read_more: "மேலும் படிக்க",
      all_posts: "அனைத்து பதிவுகளும்",
      by_category: "வகைப்படி",
    },
    contact: {
      title: "எங்களை தொடர்பு கொள்ளுங்கள்",
      name_label: "உங்கள் பெயர்",
      email_label: "உங்கள் மின்னஞ்சல்",
      subject_label: "விஷயம்",
      message_label: "செய்தி",
      submit: "செய்தி அனுப்பு",
      success: "உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது. நாங்கள் விரைவில் உங்களை தொடர்பு கொள்வோம்.",
      error: "ஏதோ தவறு நடந்தது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.",
    },
    footer: {
      tagline: "டிஜிட்டல் தடம் இல்லாமல் தொடர்பு. வடிவமைப்பு மூலம் நிலையற்றது.",
      legal: "அனைத்து தரவும் 24 மணி நேரத்திற்கு பிறகு தானாக நீக்கப்படும். பதிவு இல்லை, கண்காணிப்பு இல்லை.",
    },
    meta: {
      home_title: "இலவச தற்காலிக மின்னஞ்சல் முகவரி | Ghist — உடனடி & அநாமதேய",
      home_desc: "சில நொடிகளில் இலவச ஒருமுறை பயன்படுத்தும் மின்னஞ்சல் முகவரி பெறுங்கள் — பதிவு இல்லை, கண்காணிப்பு இல்லை. 24 மணி நேரத்திற்கு பிறகு நிரந்தரமாக நீக்கப்படும்.",
    },
  },

  fa: {
    nav: {
      home: "خانه",
      privacy: "حریم خصوصی",
      terms: "شرایط",
      about: "درباره ما",
      faq: "سوالات متداول",
      blog: "وبلاگ",
      contact: "تماس با ما",
    },
    home: {
      tagline: "ایمیل یکبار مصرف فوری. بدون ثبت‌نام. بدون ردیابی.",
      description: "در چند ثانیه یک آدرس ایمیل موقت رایگان دریافت کنید. عالی برای آزمایش‌های رایگان، OTP و جلوگیری از هرزنامه. پس از ۲۴ ساعت به‌طور خودکار حذف می‌شود.",
      cta: "ایجاد ایمیل",
    },
    privacy: {
      title: "سیاست حریم خصوصی — Ghist",
      sections: {
        what_we_collect: "چه چیزی جمع‌آوری می‌کنیم",
        how_we_use: "چگونه استفاده می‌کنیم",
        data_retention: "نگهداری داده",
        cookies: "کوکی‌ها",
        contact: "تماس",
      },
    },
    terms: {
      title: "شرایط خدمات — Ghist",
      sections: {
        acceptable_use: "استفاده قابل قبول",
        prohibited: "فعالیت‌های ممنوع",
        liability: "محدودیت مسئولیت",
        changes: "تغییرات در شرایط",
        governing_law: "قانون حاکم",
      },
    },
    about: {
      title: "درباره Ghist",
      description: "Ghist یک سرویس ایمیل یکبار مصرف رایگان است که برای کاربران آگاه از حریم خصوصی ساخته شده است که می‌خواهند صندوق ورودی واقعی خود را از هرزنامه و ردیابی محافظت کنند.",
      mission: "مأموریت ما ساده و در دسترس کردن حریم خصوصی است — ایمیل موقت در چند ثانیه، بدون نیاز به حساب، هیچ‌چیز ذخیره نمی‌شود.",
      values: "ما به جمع‌آوری حداقل داده، شفافیت کامل و معماری گذرا به‌عنوان اصل طراحی اعتقاد داریم.",
    },
    faq: {
      title: "سوالات متداول",
      questions: [
        { q: "Ghist چیست؟", a: "Ghist یک سرویس ایمیل موقت یکبار مصرف رایگان است. بدون نیاز به حساب یا ثبت‌نام، فوراً یک آدرس ایمیل ناشناس ایجاد می‌کند. همه ایمیل‌ها پس از ۲۴ ساعت به‌طور دائمی حذف می‌شوند." },
        { q: "آدرس Ghist چه مدت دوام می‌آورد؟", a: "هر آدرس Ghist و همه پیام‌هایش پس از ۲۴ ساعت به‌طور خودکار و دائمی حذف می‌شوند. پس از حذف قابل بازیابی نیستند." },
        { q: "آیا Ghist کاملاً رایگان است؟", a: "بله. Ghist ۱۰۰٪ رایگان است، بدون سطوح پریمیوم، بدون ثبت‌نام و بدون کارت اعتباری." },
        { q: "آیا باید حساب ایجاد کنم؟", a: "خیر. Ghist در لحظه باز کردن سایت یک آدرس ایمیل موقت ایجاد می‌کند. حساب، رمز عبور یا اطلاعات شخصی لازم نیست." },
        { q: "آیا Ghist برای OTP امن است؟", a: "بله. Ghist از رمزنگاری TLS 1.3 استفاده می‌کند و جلسات ایزوله هستند — آدرس موقت شما هرگز به هویت واقعی شما مرتبط نمی‌شود." },
        { q: "Ghist برای چه چیزی مفید است؟", a: "Ghist برای ثبت‌نام در آزمایش‌های رایگان بدون دریافت هرزنامه، دانلود محتوای دسترسی‌محدود، دریافت کدهای تأیید و هر موقعیتی که به ایمیل موقت نیاز دارید مفید است." },
        { q: "آیا Ghist داده‌های من را ذخیره یا می‌فروشد؟", a: "خیر. Ghist به هیچ اطلاعات شخصی نیاز ندارد، کاربران را ردیابی نمی‌کند و پس از ۲۴ ساعت همه ایمیل‌ها را به‌طور دائمی حذف می‌کند." },
        { q: "پس از ۲۴ ساعت چه اتفاقی برای ایمیل‌هایم می‌افتد؟", a: "همه ایمیل‌ها و آدرس موقت پس از ۲۴ ساعت به‌طور دائمی و غیرقابل بازگشت حذف می‌شوند. این طراحی است — Ghist به لحاظ معماری گذراست." },
        { q: "آیا می‌توانم از آدرس Ghist ایمیل ارسال کنم؟", a: "خیر. Ghist تنها یک سرویس دریافت است. فقط می‌توانید ایمیل دریافت کنید، ارسال نه." },
        { q: "آیا می‌توانم آدرس ایمیل خودم را انتخاب کنم؟", a: "در حال حاضر، Ghist به‌طور خودکار یک آدرس تصادفی ایجاد می‌کند. آدرس‌های سفارشی عمداً پشتیبانی نمی‌شوند." },
      ],
    },
    blog: {
      title: "وبلاگ Ghist",
      read_more: "بیشتر بخوانید",
      all_posts: "همه مقاله‌ها",
      by_category: "بر اساس دسته‌بندی",
    },
    contact: {
      title: "تماس با ما",
      name_label: "نام شما",
      email_label: "ایمیل شما",
      subject_label: "موضوع",
      message_label: "پیام",
      submit: "ارسال پیام",
      success: "پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.",
      error: "مشکلی پیش آمد. لطفاً بعداً دوباره امتحان کنید.",
    },
    footer: {
      tagline: "ارتباط بدون ردپای دیجیتال. گذرا به‌عنوان اصل طراحی.",
      legal: "همه داده‌ها پس از ۲۴ ساعت به‌طور خودکار حذف می‌شوند. بدون ثبت‌نام، بدون ردیابی.",
    },
    meta: {
      home_title: "آدرس ایمیل موقت رایگان | Ghist — فوری و ناشناس",
      home_desc: "در چند ثانیه یک آدرس ایمیل یکبار مصرف رایگان دریافت کنید — بدون ثبت‌نام، بدون ردیابی. پس از ۲۴ ساعت به‌طور دائمی حذف می‌شود.",
    },
  },

  ko: {
    nav: {
      home: "홈",
      privacy: "개인정보",
      terms: "이용약관",
      about: "소개",
      faq: "자주 묻는 질문",
      blog: "블로그",
      contact: "문의",
    },
    home: {
      tagline: "즉시 사용 가능한 일회용 이메일. 가입 불필요. 추적 없음.",
      description: "몇 초 만에 무료 임시 이메일 주소를 받으세요. 무료 체험, OTP, 스팸 방지에 최적. 24시간 후 자동 삭제.",
      cta: "이메일 생성",
    },
    privacy: {
      title: "개인정보 처리방침 — Ghist",
      sections: {
        what_we_collect: "수집하는 정보",
        how_we_use: "사용 방법",
        data_retention: "데이터 보관",
        cookies: "쿠키",
        contact: "문의",
      },
    },
    terms: {
      title: "이용약관 — Ghist",
      sections: {
        acceptable_use: "허용되는 사용",
        prohibited: "금지 활동",
        liability: "책임 제한",
        changes: "약관 변경",
        governing_law: "준거법",
      },
    },
    about: {
      title: "Ghist 소개",
      description: "Ghist는 스팸과 추적으로부터 실제 받은편지함을 보호하고자 하는 개인정보 보호에 관심 있는 사용자를 위해 만들어진 무료 일회용 이메일 서비스입니다.",
      mission: "우리의 사명은 개인정보 보호를 간단하고 누구나 이용할 수 있게 만드는 것입니다 — 몇 초 만에 임시 이메일, 계정 불필요, 아무것도 저장하지 않습니다.",
      values: "우리는 최소한의 데이터 수집, 완전한 투명성, 그리고 설계에 의한 일시적 아키텍처를 믿습니다.",
    },
    faq: {
      title: "자주 묻는 질문",
      questions: [
        { q: "Ghist란 무엇인가요?", a: "Ghist는 무료 일회용 임시 이메일 서비스입니다. 계정이나 가입 없이 즉시 익명 이메일 주소를 생성합니다. 모든 이메일은 24시간 후 영구 삭제됩니다." },
        { q: "Ghist 주소는 얼마나 오래 유지되나요?", a: "모든 Ghist 주소와 메시지는 24시간 후 자동으로 영구 삭제됩니다. 삭제 후에는 복구가 불가능합니다." },
        { q: "Ghist는 완전히 무료인가요?", a: "네. Ghist는 100% 무료이며 프리미엄 등급, 가입, 신용카드가 필요하지 않습니다." },
        { q: "계정을 만들어야 하나요?", a: "아니요. 사이트를 여는 순간 Ghist가 임시 이메일 주소를 생성합니다. 계정, 비밀번호, 개인정보가 필요하지 않습니다." },
        { q: "Ghist는 OTP에 안전한가요?", a: "네. Ghist는 TLS 1.3 암호화를 사용하며 세션이 격리되어 있습니다 — 임시 주소는 실제 신원과 연결되지 않습니다." },
        { q: "Ghist는 무엇에 유용한가요?", a: "Ghist는 스팸 없이 무료 체험 가입, 제한된 콘텐츠 다운로드, 인증 코드 수신, 임시 이메일이 필요한 모든 상황에 유용합니다." },
        { q: "Ghist가 내 데이터를 저장하거나 판매하나요?", a: "아니요. Ghist는 개인정보를 요구하지 않고, 사용자를 추적하지 않으며, 24시간 후 모든 이메일을 영구 삭제합니다." },
        { q: "24시간 후 이메일은 어떻게 되나요?", a: "모든 이메일과 임시 주소 자체가 24시간 후 영구적으로 복구 불가능하게 삭제됩니다. 이는 설계에 의한 것입니다." },
        { q: "Ghist 주소에서 이메일을 보낼 수 있나요?", a: "아니요. Ghist는 수신 전용 서비스입니다. 이메일을 받을 수만 있고 보낼 수는 없습니다." },
        { q: "내 이메일 주소를 선택할 수 있나요?", a: "현재 Ghist는 자동으로 랜덤 주소를 생성합니다. 맞춤 주소는 의도적으로 지원하지 않습니다." },
      ],
    },
    blog: {
      title: "Ghist 블로그",
      read_more: "더 읽기",
      all_posts: "모든 게시물",
      by_category: "카테고리별",
    },
    contact: {
      title: "문의하기",
      name_label: "이름",
      email_label: "이메일",
      subject_label: "제목",
      message_label: "메시지",
      submit: "메시지 보내기",
      success: "메시지가 성공적으로 전송되었습니다. 곧 답변 드리겠습니다.",
      error: "문제가 발생했습니다. 나중에 다시 시도해 주세요.",
    },
    footer: {
      tagline: "디지털 발자국 없는 소통. 설계에 의한 일시성.",
      legal: "모든 데이터는 24시간 후 자동 삭제됩니다. 가입 불필요, 추적 없음.",
    },
    meta: {
      home_title: "무료 임시 이메일 주소 | Ghist — 즉시 & 익명",
      home_desc: "몇 초 만에 무료 일회용 이메일 주소를 받으세요 — 가입 불필요, 추적 없음. 무료 체험, OTP, 스팸 방지에 최적. 24시간 후 영구 삭제.",
    },
  },
};

// ============================================================
// Translation helper
// ============================================================

type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never;

export function t(locale: Locale, key: string): string {
  const parts = key.split(".");
  let value: any = translations[locale] ?? translations.en;
  for (const part of parts) {
    if (value === undefined || value === null) break;
    value = value[part];
  }
  if (typeof value === "string") return value;
  // Fallback to English
  let fallback: any = translations.en;
  for (const part of parts) {
    if (fallback === undefined || fallback === null) break;
    fallback = fallback[part];
  }
  return typeof fallback === "string" ? fallback : key;
}

export function getQuestions(locale: Locale) {
  return translations[locale]?.faq?.questions ?? translations.en.faq.questions;
}

// ============================================================
// Locale detection hook
// ============================================================

export function useLocale(): Locale {
  // Check server-injected locale first
  const injected = (typeof window !== "undefined" && (window as any).__GHIST_LOCALE__) as string | undefined;
  if (injected && LOCALES.includes(injected as Locale)) return injected as Locale;
  // Check hash route prefix like /#/zh/faq
  if (typeof window !== "undefined") {
    const hash = window.location.hash.replace(/^#\/?/, "");
    const first = hash.split("/")[0];
    if (LOCALES.includes(first as Locale)) return first as Locale;
  }
  return "en";
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations.en;
}

export default translations;
