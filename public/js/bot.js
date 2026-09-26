/*
 * ============================================
 * چت‌بات هوشمند کافه معدن (Cafe Madan)
 * نسخه: 2.2.0 (Smart Routing Edition)
 * ============================================
 */

(function () {

    'use strict';

    /* ============================================
       CONFIGURATION
       ============================================ */

    const BOT_CONFIG = {
        typingMinDelay: 600,
        typingMaxDelay: 1100,
        threshold: 3.0,
        maxSuggestions: 4,

        // Smart routing
        exactPhraseBonus: 6.0,
        strongKeywordBonus: 3.5,
        phraseBonus: 4.0,
        twoWordBonus: 2.5,
        oneWordBonus: 1.0,
        synonymBonus: 2.0,
        platformBonus: 5.0,
        contextBonus: 1.5,
        questionPenalty: 0.0,
        ambiguityMargin: 1.0
    };

    /* ============================================
       KNOWLEDGE BASE
       ============================================ */

    const botData = {
        
        welcomeMessage:
            "درود بر شما 👋\n" +
            "من راهنمای دیجیتال **کافه معدن** هستم.\n" +
            "خوشحالم که در کنار شما هستم. چطور می‌توانم در آشنایی با خدمات تخصصی این مجموعه به شما کمک کنم؟",

        initialSuggestions: [
            "کافه معدن دقیقاً چه فعالیتی دارد؟",
            "پلتفرم‌های چهارگانه کافه معدن کدام‌اند؟",
            "خدمات حقوقی معدن داد چیست؟",
            "دوره‌های معدن آکادمی چه ویژگی خاصی دارند؟"
        ],

        intents: [

            {
                id: 'about_cafe',

                keywords: [
                    'کافه معدن',
                    'کافه‌معدن',
                    'درباره کافه معدن',
                    'کافه معدن چیست',
                    'فعالیت کافه معدن',
                    'شروع کافه معدن',
                    'ایران کان ماین',
                    'ایران‌کان‌ماین',
                    'تاریخچه'
                ],

                synonyms: [
                    'مجموعه کافه معدن',
                    'معرفی کافه معدن'
                ],

                answer:
                    "کافه معدن یک **اکوسیستم تخصصی و جامع** در حوزه معدن و صنایع معدنی است.\n\n" +
                    "فعالیت رسمی این مجموعه از سال **۱۳۹۸** و با حضور پررنگ در نمایشگاه بین‌المللی ایران‌کان‌ماین آغاز شد. " +
                    "اما ریشهٔ شکل‌گیری این ایده به سال‌های حدود **۱۳۶۷** بازمی‌گردد؛ زمانی که بنیان‌گذار آن، مهندس حسن کلانکی، " +
                    "مسیر حرفه‌ای خود را در رشته مهندسی معدن دانشکده فنی دانشگاه تهران آغاز نمود.\n\n" +
                    "امروزه کافه معدن از طریق چهار پلتفرم تخصصی، نیازهای مختلف فعالان این صنعت را پوشش می‌دهد.",

                suggestions: [
                    "پلتفرم‌های کافه معدن کدام‌اند؟",
                    "بنیان‌گذار کافه معدن کیست؟",
                    "مدیرعامل مجموعه چه کسی است؟"
                ]
            },

            {
                id: 'platforms',

                keywords: [
                    'پلتفرم',
                    'پلتفرم‌ها',
                    'زیرمجموعه',
                    'بخش‌های',
                    'خدمات کافه معدن',
                    'چهار بخش',
                    'مجموعه خدمات'
                ],

                synonyms: [
                    'پلتفرم‌های کافه معدن',
                    'زیرمجموعه‌ها'
                ],

                answer:
                    "کافه معدن برای پوشش تمام نیازهای زنجیره ارزش معدن، چهار بازوی تخصصی ایجاد کرده است:\n\n" +
                    "🔹 **معدن داد**: مرجع تخصصی خدمات حقوقی، قراردادها و امنیت معادن.\n" +
                    "🔹 **معدن مشاور**: همراه شما در اکتشاف، استخراج و مدیریت سرمایه‌گذاری.\n" +
                    "🔹 **معدن آکادمی**: مرکز آموزش‌های مهارت‌محور با اعطای مدرک رسمی دانشگاه تهران.\n" +
                    "🔹 **معدن ادز**: بازوی خلاقانه تولید محتوا و تبلیغات صنعتی.\n\n" +
                    "کدام یک از این حوزه‌ها برای شما جذاب‌تر است؟",

                suggestions: [
                    "معدن داد چه خدماتی دارد؟",
                    "معدن مشاور چگونه کمک می‌کند؟",
                    "معدن آکادمی چه دوره‌هایی دارد؟",
                    "معدن ادز چه کاری انجام می‌دهد؟"
                ]
            },

            {
                id: 'madan_dad',

                keywords: [
                    'معدن داد',
                    'امور حقوقی',
                    'حقوق',
                    'قرارداد معدن',
                    'قرارداد معدنی',
                    'قرارداد',
                    'قراردادهای عمومی',
                    'قراردادهای تخصصی',
                    'قراردادهای کاری',
                    'قراردادهای بیمه',
                    'لیزینگ ماشین‌آلات',
                    'جذب سرمایه‌گذار',
                    'مشارکت معدنی',
                    'امنیت معادن',
                    'امنیت معدن',
                    'دوربین مداربسته',
                    'نگهبان',
                    'مجوز معدن',
                    'اخذ مجوز',
                    'مجوز',
                    'داوری معدن',
                    'داوری',
                    'وکیل معدن',
                    'وکیل',
                    'وکیل متخصص',
                    'همراهی وکیل'
                ],

                synonyms: [
                    'معدن داد',
                    'پلتفرم حقوقی',
                    'خدمات حقوقی'
                ],

                answer:
                    "**معدن داد**، بازوی حقوقی و پشتیبانی قراردادی کافه معدن است. هدف ما صیانت از حقوق فعالان صنعت معدن است.\n\n" +
                    "خدمات کلیدی ما شامل:\n" +
                    "🔸 تدوین و بررسی انواع قراردادها (عمومی، تخصصی، کاری، بیمه و لیزینگ ماشین‌آلات)\n" +
                    "🔸 مشاوره در قراردادهای جذب سرمایه‌گذار و مشارکت معدنی\n" +
                    "🔸 خدمات جامع امنیت معادن (ارزیابی ریسک، مشاوره تخصصی، دوربین مداربسته و نگهبانی)\n" +
                    "🔸 اخذ مجوزهای قانونی کسب‌وکارهای معدنی\n" +
                    "🔸 ارائه خدمات داوری و همراهی وکیل متخصص در جلسات حساس عقد قرارداد.",

                suggestions: [
                    "فرآیند اخذ مجوز معدن چگونه است؟",
                    "خدمات امنیت معادن دقیقاً شامل چه مواردی است؟",
                    "آیا خدمات داوری تخصصی دارید؟"
                ]
            },

            {
                id: 'madan_moshaver',

                keywords: [
                    'معدن مشاور',
                    'مشاوره معدن',
                    'مشاوره معدنی',
                    'مشاور',
                    'اکتشاف',
                    'گواهی کشف',
                    'استخراج',
                    'استحصال',
                    'فروش ماده معدنی',
                    'سرمایه گذاری معدن',
                    'سرمایه‌گذاری معدن',
                    'سرمایه گذاری صنایع معدنی',
                    'مشاوره سرمایه',
                    'مدیریت سرمایه معدن',
                    'حفظ سرمایه',
                    'مشاوره تخصصی معدن'
                ],

                synonyms: [
                    'معدن مشاور',
                    'مشاوره تخصصی',
                    'پلتفرم مشاوره'
                ],

                answer:
                    "**معدن مشاور**، قطب مشاوره تخصصی کافه معدن است که از لحظهٔ ایده تا فروش نهایی در کنار شماست.\n\n" +
                    "حوزه‌های فعالیت ما:\n" +
                    "🔸 مشاوره فنی و اقتصادی از مرحله اکتشاف تا اخذ گواهی کشف\n" +
                    "🔸 بهینه‌سازی فرآیندهای استخراج و استحصال\n" +
                    "🔸 تدوین استراتژی فروش مواد معدنی\n" +
                    "🔸 مشاوره سرمایه‌گذاری در معادن و صنایع معدنی با رویکرد **حفظ و رشد سرمایه**\n\n" +
                    "ما به شما کمک می‌کنیم تا در مسیر پرچالش معدن‌داری، تصمیمات درست و سودآور بگیرید.",

                suggestions: [
                    "برای شروع اکتشاف از کجا باید آغاز کنم؟",
                    "چگونه می‌توانم سرمایه‌گذار معتبر جذب کنم؟",
                    "مشاوره فروش ماده معدنی چگونه انجام می‌شود؟"
                ]
            },

            {
                id: 'madan_academy',

                keywords: [
                    'معدن آکادمی',
                    'آموزش معدن',
                    'درس',
                    'آموزش',
                    'دوره معدن',
                    'دوره‌های معدن',
                    'دوره',
                    'بازاریابی معدن',
                    'بازاریابی و فروش',
                    'آداب مذاکره',
                    'مذاکره',
                    'تربیت مدیر فروش',
                    'مدیر فروش',
                    'مهارت نرم',
                    'مهارت‌های نرم',
                    'آموزش مهارت',
                    'مدرک دانشگاه تهران',
                    'مدرک',
                    'دانشکده اقتصاد',
                    'دانشگاه',
                    'مرکز آموزش',
                    'دوره آموزشی معدن',
                    'کلاس'
                ],

                synonyms: [
                    'معدن آکادمی',
                    'آموزش تخصصی',
                    'مرکز آموزش'
                ],

                answer:
                    "**معدن آکادمی** با یک تمایز بزرگ فعالیت می‌کند: **اعطای مدرک رسمی از دانشگاه تهران**.\n\n" +
                    "این مرکز در فضای مرکز آموزش‌های کاربردی دانشکده اقتصاد دانشگاه تهران، دوره‌هایی را برگزار می‌کند که شکاف میان «دانش فنی معدن» و «مهارت‌های نرم مدیریتی» را پر می‌کند.\n\n" +
                    "برخی از دوره‌های شاخص:\n" +
                    "🔸 بازاریابی و فروش تخصصی در معادن\n" +
                    "🔸 آداب و فنون مذاکره در صنعت معدن\n" +
                    "🔸 تربیت مدیر فروش حرفه‌ای\n" +
                    "🔸 مهارت‌های نرم کاربردی ویژه مهندسین معدن",

                suggestions: [
                    "آیا پایان دوره مدرک دانشگاه تهران داده می‌شود؟",
                    "محل برگزاری دوره‌ها کجاست؟",
                    "نحوه ثبت‌نام در دوره‌ها چگونه است؟"
                ]
            },

            {
                id: 'madan_ads',

                keywords: [
                    'معدن ادز',
                    'تبلیغات معدن',
                    'تبلیغات معدنی',
                    'تبلیغات',
                    'فیلم تبلیغاتی',
                    'فیلم',
                    'عکاسی صنعتی',
                    'عکاسی',
                    'تولید محتوا معدن',
                    'تولید محتوای معدن',
                    'محتوا',
                    'شبکه اجتماعی معدن',
                    'تبلیغات صنعتی',
                    'محتوای سایت معدن',
                    'سایت',
                    'خدمات تبلیغاتی معدن',
                    'فیلم‌های تبلیغاتی',
                    'عکاسی صنعتی معدن',
                    'تولید محتوا'
                ],

                synonyms: [
                    'معدن ادز',
                    'تبلیغات',
                    'تولید محتوا'
                ],

                answer:
                    "**معدن ادز**، بازوی خلاقیت و دیده‌شدنِ برندهای معدنی است. ما زبانِ تخصصی صنعت شما را به محتوای بصری جذاب تبدیل می‌کنیم.\n\n" +
                    "خدمات ما شامل:\n" +
                    "🔸 تولید فیلم‌های تبلیغاتی و مستندهای صنعتی از معادن و خطوط تولید\n" +
                    "🔸 عکاسی حرفه‌ای صنعتی (ماشین‌آلات، محیط معدن و پرسنل)\n" +
                    "🔸 مدیریت و تولید محتوای اختصاصی شبکه‌های اجتماعی\n" +
                    "🔸 طراحی محتوای وب‌سایت و کاتالوگ‌های تخصصی\n\n" +
                    "هدف ما ارتقای پرستیژ و شناخت برند شما در بازار هدف است.",

                suggestions: [
                    "آیا نمونه‌کارهای تولید محتوا دارید؟",
                    "هزینه عکاسی صنعتی از معدن چگونه محاسبه می‌شود؟",
                    "خدمات شبکه‌های اجتماعی شامل چه پلتفرم‌هایی است؟"
                ]
            },

            {
                id: 'founder',

                keywords: [
                    'بنیان گذار',
                    'بنیان‌گذار',
                    'موسس',
                    'مؤسس',
                    'تاسیس',
                    'تأسیس',
                    'حسن کلانکی',
                    'مهندس کلانکی',
                    'مهندس حسن کلانکی',
                    'چه کسی کافه معدن را تاسیس کرده',
                    'چه کسی کافه معدن را تأسیس کرده',
                    'بنیانگذار کافه معدن',
                    'سابقه کلانکی',
                    'رزومه کلانکی',
                    'کلانکی کیست'
                ],

                synonyms: [
                    'بنیان‌گذار',
                    'موسس',
                    'حسن کلانکی'
                ],

                answer:
                    "بنیان‌گذار کافه معدن، **مهندس حسن کلانکی** هستند.\n\n" +
                    "افتخارات و سوابق کلیدی ایشان:\n" +
                    "🔹 فارغ‌التحصیل مهندسی معدن از دانشکده فنی دانشگاه تهران (۱۳۶۷)\n" +
                    "🔹 بیش از ۳۵ سال سابقه درخشان در اکتشاف، استخراج و فرآوری معادن\n" +
                    "🔹 تجربه عملیاتی گسترده در معادن سنگ تزئینی، گوهرسنگ‌ها و معادن فلزی (آهن و مس)\n" +
                    "🔹 مشاور تخصصی راه‌اندازی معادن و بازرگانی داخلی و خارجی مواد معدنی\n" +
                    "🔹 دارنده مدرک تخصصی گوهرشناسی الماس و سنگ‌های رنگی",

                suggestions: [
                    "مدیرعامل فعلی کافه معدن کیست؟",
                    "کافه معدن از چه سالی فعالیت رسمی دارد؟",
                    "پلتفرم‌های زیرمجموعه کدام‌اند؟"
                ]
            },

            {
                id: 'management',

                keywords: [
                    'مدیرعامل',
                    'مدیر عامل',
                    'هیئت مدیره',
                    'هیات مدیره',
                    'مدیریت کافه معدن',
                    'مدیر ارشد',
                    'مدیر ارشد هیئت مدیره',
                    'خانم کلانکی',
                    'مهندس خانم کلانکی',
                    'مدیر کافه معدن',
                    'ریاست کافه معدن'
                ],

                synonyms: [
                    'مدیرعامل',
                    'مدیریت',
                    'هیئت مدیره'
                ],

                answer:
                    "مدیریت اجرایی و راهبردی کافه معدن بر عهده **خانم مهندس کلانکی** است.\n\n" +
                    "ایشان به عنوان **مدیرعامل و مدیر ارشد هیئت‌مدیره**، سکان هدایت مجموعه را در دست دارند و دارای مدرک **فوق‌لیسانس از دانشگاه تهران** می‌باشند.",

                suggestions: [
                    "بنیان‌گذار کافه معدن کیست؟",
                    "کافه معدن چیست؟",
                    "چگونه می‌توانم با مجموعه ارتباط بگیرم؟"
                ]
            },

            {
                id: 'contact',

                keywords: [
                    'ارتباط',
                    'تماس',
                    'شماره تماس',
                    'تلفن',
                    'آدرس',
                    'ایمیل',
                    'پشتیبانی',
                    'راهنمایی',
                    'کمک',
                    'چطور ارتباط بگیرم',
                    'نحوه ارتباط',
                    'ثبت نام',
                    'عضویت',
                    'سفارش',
                    'درخواست'
                ],

                synonyms: [
                    'ارتباط',
                    'تماس',
                    'پشتیبانی'
                ],

                answer:
                    "برای ارتباط مستقیم، دریافت مشاوره یا ثبت درخواست، بهترین راه مراجعه به **وب‌سایت رسمی کافه معدن** و استفاده از فرم‌های تماس یا اطلاعات درج‌شده در آنجا است.\n\n" +
                    "با این حال، من اینجا هستم تا همین حالا به سؤالات شما درباره خدمات، پلتفرم‌ها و فرآیندهای کافه معدن پاسخ دهم. چه کمکی از دست من برمی‌آید؟",

                suggestions: [
                    "کافه معدن چیست؟",
                    "پلتفرم‌های کافه معدن کدام‌اند؟",
                    "معدن داد چه خدماتی دارد؟"
                ]
            }
        ],

        unknownResponse:
            "متأسفانه در حال حاضر پاسخ دقیقی برای این سؤال خاص در پایگاه دانش من ثبت نشده است.\n\n" +
            "اما می‌توانم درباره **خدمات و پلتفرم‌های تخصصی کافه معدن** شما را راهنمایی کنم. " +
            "لطفاً یکی از موارد زیر را انتخاب کنید یا سؤالتان را با کلمات دیگری (مثل: حقوق، مشاوره، آموزش، تبلیغات) مطرح نمایید:",

        unknownSuggestions: [
            "کافه معدن دقیقاً چه فعالیتی دارد؟",
            "پلتفرم‌های چهارگانه کافه معدن کدام‌اند؟",
            "خدمات حقوقی معدن داد چیست؟",
            "دوره‌های معدن آکادمی چه ویژگی خاصی دارند؟"
        ]
    };

    /* ============================================
       DOM ELEMENTS
       ============================================ */

    const elements = {
        launcher: null,
        window: null,
        closeBtn: null,
        messages: null,
        suggestions: null,
        input: null,
        sendBtn: null
    };

    function cacheElements() {

        elements.launcher =
            document.getElementById('botLauncher');

        elements.window =
            document.getElementById('botWindow');

        elements.closeBtn =
            document.getElementById('botClose');

        elements.messages =
            document.getElementById('botMessages');

        elements.suggestions =
            document.getElementById('botSuggestions');

        elements.input =
            document.getElementById('botInput');

        elements.sendBtn =
            document.getElementById('botSend');

        return Object.values(elements).every(Boolean);
    }

    /* ============================================
       STATE
       ============================================ */

    let state = {
        isOpen: false,
        isFirstOpen: true,
        messages: []
    };

    /* ============================================
       TEXT NORMALIZATION
       ============================================ */

    function normalizeText(text) {

        if (!text) return '';

        let normalized =
            String(text)
                .trim()
                .toLowerCase();

        // Arabic -> Persian
        normalized =
            normalized
                .replace(/ي/g, 'ی')
                .replace(/ى/g, 'ی')
                .replace(/ك/g, 'ک')
                .replace(/ة/g, 'ه')
                .replace(/ۀ/g, 'ه')
                .replace(/ؤ/g, 'و')
                .replace(/[إأآ]/g, 'ا');

        // نیم‌فاصله و کاراکترهای خاص
        normalized =
            normalized
                .replace(
                    /[\u200c\u200d\u200e\u200f]/g,
                    ' '
                )
                .replace(/\u00a0/g, ' ');

        // اعداد انگلیسی -> فارسی
        normalized =
            normalized.replace(
                /[0-9]/g,
                function (d) {
                    return '۰۱۲۳۴۵۶۷۸۹'
                        .charAt(Number(d));
                }
            );

        // حذف نشانه‌های نگارشی
        normalized =
            normalized.replace(
                /[.،,;:!?؟!؛\-–—ـ()[\]{}«»"'`~@#$%^&*+=/\\|<>]/g,
                ' '
            );

        // شکل‌های رایج محاوره‌ای
        const replacements = [

            [/\bمی\s+/g, 'می'],

            [/\bمیشه\b/g, 'می شود'],

            [/\bچجوری\b/g, 'چطور'],

            [/\bچطوری\b/g, 'چطور'],

            [/\bچگونه\b/g, 'چطور'],

            [/\bکیه\b/g, 'کیست'],

            [/\bکجاست\b/g, 'کجا است'],

            [/\bدارین\b/g, 'دارید'],

            [/\bمیخوام\b/g, 'می خواهم'],

            [/\bمیخام\b/g, 'می خواهم'],

            [/\bمیخواد\b/g, 'می خواهد'],

            [/\bنمیدونم\b/g, 'نمی دانم'],

            [/\bمیتونم\b/g, 'می توانم'],

            [/\bمیتونه\b/g, 'می تواند'],

            [/\bمیتونید\b/g, 'می توانید'],

            [/\bهستش\b/g, 'است'],

            [/\bهستن\b/g, 'هستند']
        ];

        replacements.forEach(function (item) {

            normalized =
                normalized.replace(
                    item[0],
                    item[1]
                );

        });

        normalized =
            normalized
                .replace(/\s+/g, ' ')
                .trim();

        return normalized;
    }

    function meaningfulTokens(text) {

        const stopWords = new Set([

            'من',
            'ما',
            'به',
            'از',
            'در',
            'با',
            'برای',
            'را',
            'که',
            'و',
            'یا',
            'این',
            'آن',
            'یک',
            'چه',
            'چطور',
            'چگونه',
            'آیا',
            'اگر',
            'می',
            'شود',
            'است',
            'هست',
            'هستند',
            'دارم',
            'دارید',
            'دارد',
            'میخواهم',
            'می خواهم',
            'میتوانم',
            'می توانم'
        ]);

        return String(text)
            .split(' ')
            .map(function (token) {
                return token.trim();
            })
            .filter(function (token) {
                return (
                    token.length > 1 &&
                    !stopWords.has(token)
                );
            });
    }

    /* ============================================
       SMART ROUTING
       ============================================ */

    const strongTriggers = {

        about_cafe: [
            'کافه معدن',
            'درباره کافه معدن',
            'ایران کان ماین',
            'تاریخچه',
            'فعالیت'
        ],

        platforms: [
            'پلتفرم',
            'پلتفرم ها',
            'زیرمجموعه',
            'چهار بخش',
            'مجموعه خدمات'
        ],

        madan_dad: [
            'حقوق',
            'قرارداد',
            'وکیل',
            'داوری',
            'مجوز',
            'امنیت'
        ],

        madan_moshaver: [
            'مشاور',
            'مشاوره',
            'اکتشاف',
            'استخراج',
            'استحصال',
            'سرمایه',
            'سرمایه گذاری'
        ],

        madan_academy: [
            'درس',
            'آموزش',
            'دوره',
            'مدرک',
            'دانشگاه',
            'کلاس',
            'مهارت',
            'مذاکره'
        ],

        madan_ads: [
            'تبلیغات',
            'فیلم',
            'عکاسی',
            'محتوا',
            'سایت',
            'ادز'
        ],

        founder: [
            'بنیان گذار',
            'موسس',
            'تاسیس',
            'حسن کلانکی',
            'مهندس حسن کلانکی',
            'رزومه کلانکی'
        ],

        management: [
            'مدیرعامل',
            'مدیر عامل',
            'هیئت مدیره',
            'مدیریت',
            'مدیر ارشد',
            'خانم کلانکی'
        ],

        contact: [
            'ارتباط',
            'تماس',
            'شماره تماس',
            'تلفن',
            'آدرس',
            'ایمیل',
            'پشتیبانی',
            'ثبت نام',
            'عضویت',
            'سفارش'
        ]
    };

    const negativeSignals = {

        madan_dad: [
            'دوره',
            'آموزش',
            'عکاسی',
            'تبلیغات'
        ],

        madan_moshaver: [
            'دوره',
            'عکاسی',
            'تبلیغات'
        ],

        madan_academy: [
            'قرارداد',
            'وکیل',
            'داوری',
            'عکاسی'
        ],

        madan_ads: [
            'وکیل',
            'قرارداد',
            'داوری',
            'دوره'
        ]
    };

    function calculateIntentScore(
        userText,
        intent
    ) {

        const normalized =
            normalizeText(userText);

        const userTokens =
            meaningfulTokens(normalized);

        let score = 0;

        /* Exact / phrase matching */

        intent.keywords.forEach(
            function (keyword) {

                const phrase =
                    normalizeText(keyword);

                if (!phrase) return;

                if (normalized === phrase) {

                    score += 7;

                    return;
                }

                if (
                    normalized.includes(phrase)
                ) {

                    const wordCount =
                        phrase.split(' ').length;

                    if (wordCount >= 4) {

                        score += 6;

                    } else if (
                        wordCount === 3
                    ) {

                        score += 4.8;

                    } else if (
                        wordCount === 2
                    ) {

                        score += 3.2;

                    } else {

                        score += 1.4;
                    }
                }
            }
        );

        /* Synonyms */

        (
            intent.synonyms || []
        ).forEach(
            function (synonym) {

                const phrase =
                    normalizeText(synonym);

                if (!phrase) return;

                if (normalized === phrase) {

                    score += 4.5;

                } else if (
                    normalized.includes(phrase)
                ) {

                    score += 2.4;
                }
            }
        );

        /* Strong domain keywords */

        (
            strongTriggers[intent.id] || []
        ).forEach(
            function (trigger) {

                if (
                    normalized.includes(
                        normalizeText(trigger)
                    )
                ) {

                    score += 2.2;
                }
            }
        );

        /* Explicit platform */

        const platformName = {

            madan_dad:
                'معدن داد',

            madan_moshaver:
                'معدن مشاور',

            madan_academy:
                'معدن آکادمی',

            madan_ads:
                'معدن ادز'

        }[intent.id];

        if (
            platformName &&
            normalized.includes(
                normalizeText(platformName)
            )
        ) {

            score += 6;
        }

        /* Token overlap */

        const intentTokens =
            new Set();

        [
            ...(intent.keywords || []),
            ...(intent.synonyms || []),
            ...(strongTriggers[intent.id] || [])
        ].forEach(
            function (item) {

                meaningfulTokens(item)
                    .forEach(
                        function (token) {

                            intentTokens.add(
                                token
                            );

                        }
                    );
            }
        );

        let hits = 0;

        userTokens.forEach(
            function (token) {

                if (
                    intentTokens.has(token)
                ) {

                    hits++;
                }
            }
        );

        if (hits > 0) {

            const ratio =
                hits /
                Math.max(
                    1,
                    Math.min(
                        userTokens.length,
                        6
                    )
                );

            score += Math.min(
                3.5,
                hits * 0.75 +
                ratio * 1.8
            );
        }

        /* Question context */

        const questionSignals = [

            'هزینه',
            'قیمت',
            'شرایط',
            'نحوه',
            'فرایند',
            'فرآیند',
            'خدمات',
            'ویژگی',
            'ثبت نام',
            'ثبت‌نام',
            'چطور',
            'چگونه',
            'آیا'
        ];

        if (
            questionSignals.some(
                function (signal) {

                    return normalized.includes(
                        normalizeText(signal)
                    );

                }
            ) &&
            hits > 0
        ) {

            score += 1.0;
        }

        /* Negative signals */

        (
            negativeSignals[intent.id] || []
        ).forEach(
            function (signal) {

                if (
                    normalized.includes(
                        normalizeText(signal)
                    )
                ) {

                    score -= 0.9;
                }
            }
        );

        return Math.max(0, score);
    }

    /* ============================================
       CONTEXT MEMORY
       ============================================ */

    function getLastBotIntent() {

        if (
            !state.messages ||
            state.messages.length === 0
        ) {
            return null;
        }

        for (
            let i = state.messages.length - 1;
            i >= 0;
            i--
        ) {

            const message =
                state.messages[i];

            if (
                message.type === 'bot' &&
                message.intentId
            ) {

                return botData.intents.find(
                    function (intent) {
                        return (
                            intent.id ===
                            message.intentId
                        );
                    }
                ) || null;
            }
        }

        return null;
    }

    function resolveContext(userText) {

        const normalized =
            normalizeText(userText);

        const contextWords = [

            'بیشتر',
            'توضیح',
            'همین',
            'اون',
            'آن',
            'این',
            'مورد',
            'موضوع',
            'هزینه',
            'قیمت',
            'شرایط',
            'نحوه',
            'ثبت نام',
            'ثبت‌نام',
            'ادامه',
            'جزئیات'
        ];

        const hasContext =
            contextWords.some(
                function (word) {

                    return normalized.includes(
                        normalizeText(word)
                    );

                }
            );

        if (!hasContext) {

            return userText;
        }

        const lastIntent =
            getLastBotIntent();

        if (!lastIntent) {

            return userText;
        }

        return (
            userText +
            ' ' +
            lastIntent.id.replace(
                /_/g,
                ' '
            )
        );
    }

    /* ============================================
       INTENT DETECTION
       ============================================ */

    function detectIntent(userText) {

        const contextualText =
            resolveContext(userText);

        const results =
            botData.intents
                .map(
                    function (intent) {

                        return {

                            intent: intent,

                            score:
                                calculateIntentScore(
                                    contextualText,
                                    intent
                                )
                        };
                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            b.score -
                            a.score
                        );
                    }
                );

        const best =
            results[0];

        const second =
            results[1];

        if (
            !best ||
            best.score <
                BOT_CONFIG.threshold
        ) {

            return null;
        }

        /* Explicit platform wins */

        const explicitPlatform =
            botData.intents.find(
                function (intent) {

                    return [
                        'معدن داد',
                        'معدن مشاور',
                        'معدن آکادمی',
                        'معدن ادز'
                    ].some(
                        function (name) {

                            return normalizeText(
                                userText
                            ).includes(
                                normalizeText(
                                    name
                                )
                            );
                        }
                    ) &&
                    (
                        intent.id ===
                            'madan_dad' ||
                        intent.id ===
                            'madan_moshaver' ||
                        intent.id ===
                            'madan_academy' ||
                        intent.id ===
                            'madan_ads'
                    );
                }
            );

        if (explicitPlatform) {

            return explicitPlatform;
        }

        /* Ambiguity protection */

        if (
            second &&
            second.score >=
                BOT_CONFIG.threshold &&
            best.score -
                second.score <
                BOT_CONFIG.ambiguityMargin
        ) {

            return {
                ambiguous: true,

                candidates: [
                    best.intent,
                    second.intent
                ],

                score: best.score
            };
        }

        return best.intent;
    }

        /* ============================================
       TEXT FORMATTER
       ============================================ */

    function formatBotText(text) {

        if (!text) {
            return '';
        }

        let formatted = String(text);

        // تبدیل Markdown Bold به HTML
        formatted =
            formatted.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>'
            );

        // تبدیل خط جدید به BR
        formatted =
            formatted.replace(
                /\n/g,
                '<br>'
            );

        return formatted;
    }

    /* ============================================
       TIME HELPER
       ============================================ */

    function getCurrentTime() {

        const now = new Date();

        let hours =
            now.getHours();

        let minutes =
            now.getMinutes();

        minutes =
            minutes < 10
                ? '0' + minutes
                : minutes;

        return (
            hours +
            ':' +
            minutes
        );
    }

    /* ============================================
       RENDER USER MESSAGE
       ============================================ */

    function addUserMessage(text) {

        const messageEl =
            document.createElement('div');

        messageEl.className =
            'bot-message bot-message--user';

        const bubble =
            document.createElement('div');

        bubble.className =
            'bot-message__bubble';

        // Secure: prevents XSS
        bubble.textContent =
            text;

        const time =
            document.createElement('span');

        time.className =
            'bot-message__time';

        time.textContent =
            getCurrentTime();

        messageEl.appendChild(
            bubble
        );

        messageEl.appendChild(
            time
        );

        elements.messages.appendChild(
            messageEl
        );

        scrollToBottom();

        state.messages.push({

            type: 'user',

            text: text,

            time:
                getCurrentTime()

        });

        saveState();
    }

    /* ============================================
       RENDER BOT MESSAGE
       ============================================ */

    function addBotMessage(
        text,
        suggestions,
        intentId
    ) {

        const messageEl =
            document.createElement('div');

        messageEl.className =
            'bot-message bot-message--bot';

        const bubble =
            document.createElement('div');

        bubble.className =
            'bot-message__bubble';

        bubble.innerHTML =
            formatBotText(text);

        const time =
            document.createElement('span');

        time.className =
            'bot-message__time';

        time.textContent =
            getCurrentTime();

        messageEl.appendChild(
            bubble
        );

        messageEl.appendChild(
            time
        );

        elements.messages.appendChild(
            messageEl
        );

        scrollToBottom();

        state.messages.push({

            type: 'bot',

            text: text,

            time:
                getCurrentTime(),

            intentId:
                intentId || null

        });

        saveState();

        if (
            suggestions &&
            suggestions.length > 0
        ) {

            renderSuggestions(
                suggestions
            );

        } else {

            renderSuggestions([]);
        }
    }

    /* ============================================
       SUGGESTIONS
       ============================================ */

    function renderSuggestions(
        suggestions
    ) {

        elements.suggestions.innerHTML =
            '';

        if (
            !suggestions ||
            suggestions.length === 0
        ) {

            return;
        }

        const limitedSuggestions =
            suggestions.slice(
                0,
                BOT_CONFIG.maxSuggestions
            );

        limitedSuggestions.forEach(
            function (suggestion) {

                const btn =
                    document.createElement(
                        'button'
                    );

                btn.className =
                    'bot-suggestion-btn';

                btn.textContent =
                    suggestion;

                btn.setAttribute(
                    'aria-label',
                    'پرسش: ' +
                    suggestion
                );

                btn.addEventListener(
                    'click',
                    function () {

                        handleUserInput(
                            suggestion
                        );
                    }
                );

                elements.suggestions.appendChild(
                    btn
                );
            }
        );
    }

    /* ============================================
       TYPING INDICATOR
       ============================================ */

    function showTyping() {

        hideTyping();

        const typingEl =
            document.createElement('div');

        typingEl.className =
            'bot-typing';

        typingEl.id =
            'botTypingIndicator';

        typingEl.innerHTML =
            '<span class="bot-typing__dot"></span>' +
            '<span class="bot-typing__dot"></span>' +
            '<span class="bot-typing__dot"></span>';

        elements.messages.appendChild(
            typingEl
        );

        scrollToBottom();
    }

    function hideTyping() {

        const typingEl =
            document.getElementById(
                'botTypingIndicator'
            );

        if (typingEl) {

            typingEl.remove();
        }
    }

    /* ============================================
       SCROLL
       ============================================ */

    function scrollToBottom() {

        if (!elements.messages) {
            return;
        }

        requestAnimationFrame(
            function () {

                elements.messages.scrollTop =
                    elements.messages.scrollHeight;
            }
        );
    }

    /* ============================================
       LOCAL STORAGE
       ============================================ */

    const STORAGE_KEY =
        'cafeMadanBotState';

    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    isFirstOpen:
                        state.isFirstOpen,

                    messages:
                        state.messages
                })
            );

        } catch (error) {

            console.warn(
                'Cafe Madan Bot: ' +
                'ذخیره وضعیت امکان‌پذیر نیست.',
                error
            );
        }
    }

    function loadState() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!saved) {
                return;
            }

            const parsed =
                JSON.parse(saved);

            if (
                parsed &&
                typeof parsed === 'object'
            ) {

                if (
                    typeof parsed.isFirstOpen ===
                    'boolean'
                ) {

                    state.isFirstOpen =
                        parsed.isFirstOpen;
                }

                if (
                    Array.isArray(
                        parsed.messages
                    )
                ) {

                    state.messages =
                        parsed.messages;
                }
            }

        } catch (error) {

            console.warn(
                'Cafe Madan Bot: ' +
                'خواندن وضعیت ذخیره‌شده ناموفق بود.',
                error
            );
        }
    }

    /* ============================================
       RESTORE CONVERSATION
       ============================================ */

    function restoreConversation() {

        if (
            !state.messages ||
            state.messages.length === 0
        ) {

            return;
        }

        elements.messages.innerHTML =
            '';

        state.messages.forEach(
            function (message) {

                if (
                    !message ||
                    !message.text
                ) {

                    return;
                }

                const messageEl =
                    document.createElement(
                        'div'
                    );

                messageEl.className =
                    message.type === 'user'
                        ? 'bot-message bot-message--user'
                        : 'bot-message bot-message--bot';

                const bubble =
                    document.createElement(
                        'div'
                    );

                bubble.className =
                    'bot-message__bubble';

                if (
                    message.type === 'user'
                ) {

                    bubble.textContent =
                        message.text;

                } else {

                    bubble.innerHTML =
                        formatBotText(
                            message.text
                        );
                }

                const time =
                    document.createElement(
                        'span'
                    );

                time.className =
                    'bot-message__time';

                time.textContent =
                    message.time ||
                    '';

                messageEl.appendChild(
                    bubble
                );

                messageEl.appendChild(
                    time
                );

                elements.messages.appendChild(
                    messageEl
                );
            }
        );

        scrollToBottom();
    }

    /* ============================================
       CLEAR CONVERSATION
       ============================================ */

    function clearConversation() {

        state.messages = [];

        state.isFirstOpen =
            true;

        saveState();

        if (
            elements.messages
        ) {

            elements.messages.innerHTML =
                '';
        }

        if (
            elements.suggestions
        ) {

            elements.suggestions.innerHTML =
                '';
        }
    }

    /* ============================================
       SMART RESPONSE
       ============================================ */

    function generateResponse(
        userText
    ) {

        const result =
            detectIntent(
                userText
            );

        if (!result) {

            return {

                answer:
                    botData.unknownResponse,

                suggestions:
                    botData.unknownSuggestions,

                intentId:
                    null
            };
        }

        // اگر سؤال بین دو حوزه ابهام داشته باشد
        if (
            result.ambiguous &&
            result.candidates
        ) {

            const candidateNames =
                result.candidates
                    .map(
                        function (intent) {

                            return (
                                intent.synonyms &&
                                intent.synonyms[0]
                            ) ||
                            intent.id;
                        }
                    );

            return {

                answer:
                    "برای اینکه پاسخ دقیق‌تری بدهم، منظورتان کدام حوزه است؟\n\n" +
                    "🔹 **" +
                    candidateNames[0] +
                    "**\n" +
                    "🔹 **" +
                    candidateNames[1] +
                    "**",

                suggestions:
                    candidateNames,

                intentId:
                    null
            };
        }

        return {

            answer:
                result.answer,

            suggestions:
                result.suggestions || [],

            intentId:
                result.id
        };
    }

    /* ============================================
       SEND MESSAGE LOGIC
       ============================================ */

    function handleUserInput(
        text
    ) {

        if (
            !text ||
            text.trim() === ''
        ) {

            return;
        }

        const userText =
            text.trim();

        // پاک‌سازی پیشنهادات قبلی
        renderSuggestions([]);

        // افزودن پیام کاربر
        addUserMessage(
            userText
        );

        // پاک‌سازی input
        elements.input.value =
            '';

        // نمایش typing
        showTyping();

        // تأخیر طبیعی
        const delay =
            BOT_CONFIG.typingMinDelay +
            Math.random() *
            (
                BOT_CONFIG.typingMaxDelay -
                BOT_CONFIG.typingMinDelay
            );

        setTimeout(
            function () {

                hideTyping();

                const response =
                    generateResponse(
                        userText
                    );

                addBotMessage(
                    response.answer,
                    response.suggestions,
                    response.intentId
                );

            },
            delay
        );
    }

    function sendMessage() {

        const text =
            elements.input.value.trim();

        if (text === '') {

            return;
        }

        handleUserInput(
            text
        );
    }

    /* ============================================
       OPEN BOT
       ============================================ */

    function openBot() {

        if (
            !elements.window ||
            !elements.launcher
        ) {

            return;
        }

        state.isOpen =
            true;

        elements.window.classList.add(
            'bot-window--open'
        );

        elements.window.setAttribute(
            'aria-hidden',
            'false'
        );

        elements.launcher.style.display =
            'none';

        if (
            state.isFirstOpen
        ) {

            state.isFirstOpen =
                false;

            addBotMessage(
                botData.welcomeMessage,
                botData.initialSuggestions,
                'about_cafe'
            );

            saveState();

        } else if (
            elements.messages.children.length === 0
        ) {

            restoreConversation();
        }

        setTimeout(
            function () {

                if (
                    elements.input
                ) {

                    elements.input.focus();
                }

            },
            350
        );
    }

    /* ============================================
       CLOSE BOT
       ============================================ */

    function closeBot() {

        if (
            !elements.window ||
            !elements.launcher
        ) {

            return;
        }

        state.isOpen =
            false;

        elements.window.classList.remove(
            'bot-window--open'
        );

        elements.window.setAttribute(
            'aria-hidden',
            'true'
        );

        elements.launcher.style.display =
            'flex';

        saveState();
    }

    /* ============================================
       ESCAPE KEY
       ============================================ */

    function handleEscape(
        event
    ) {

        if (
            event.key === 'Escape' &&
            state.isOpen
        ) {

            closeBot();
        }
    }
        /* ============================================
       EVENT LISTENERS
       ============================================ */

    function initEvents() {

        if (
            !elements.launcher ||
            !elements.closeBtn ||
            !elements.sendBtn ||
            !elements.input
        ) {

            console.error(
                'Cafe Madan Bot: ' +
                'برخی عناصر HTML پیدا نشدند.'
            );

            return;
        }

        // Launcher
        elements.launcher.addEventListener(
            'click',
            openBot
        );

        // Close button
        elements.closeBtn.addEventListener(
            'click',
            closeBot
        );

        // Send button
        elements.sendBtn.addEventListener(
            'click',
            sendMessage
        );

        // Enter key
        elements.input.addEventListener(
            'keydown',
            function (e) {

                if (
                    e.key === 'Enter'
                ) {

                    e.preventDefault();

                    sendMessage();
                }
            }
        );

        // Escape
        document.addEventListener(
            'keydown',
            handleEscape
        );
    }

    /* ============================================
       OPTIONAL PUBLIC API
       ============================================ */

    window.CafeMadanBot = {

        open: openBot,

        close: closeBot,

        clear: clearConversation,

        send: handleUserInput,

        reset: clearConversation,

        getState: function () {

            return {
                isOpen:
                    state.isOpen,

                isFirstOpen:
                    state.isFirstOpen,

                messages:
                    state.messages
            };
        }
    };

    /* ============================================
       INITIALIZATION
       ============================================ */

    function init() {

        if (
            !cacheElements()
        ) {

            console.error(
                'Cafe Madan Bot: عناصر HTML چت‌بات پیدا نشدند. ' +
                'اسکریپت را با defer اجرا کنید یا آن را بعد از HTML قرار دهید.'
            );

            return;
        }

        loadState();

        initEvents();

        /*
         * اگر مکالمه قبلی وجود داشته باشد،
         * آن را فقط زمانی restore می‌کنیم که
         * پنجره باز شود؛ بنابراین هنگام لود صفحه
         * چیزی به UI تحمیل نمی‌شود.
         */

        console.log(
            'Cafe Madan Bot: Smart engine initialized successfully.'
        );
    }

    /* ============================================
       DOM READY
       ============================================ */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();