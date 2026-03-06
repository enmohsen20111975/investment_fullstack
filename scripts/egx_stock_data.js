// Comprehensive EGX Stock Data with Index Membership
// EGX30: Top 30 companies by liquidity and market cap
// EGX70: Mid-cap companies (ranks 31-100)
// EGX100: Combined EGX30 + EGX70

const COMPREHENSIVE_EGX_STOCKS = [
    // EGX30 Members - Top tier stocks
    { ticker: 'COMI', name: 'Commercial International Bank', name_ar: 'البنك التجاري الدولي', sector: 'Financials', egx30: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'ETEL', name: 'Telecom Egypt', name_ar: 'الاتصالات المصرية', sector: 'Telecommunications', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'SWDY', name: 'Elsewedy Electric', name_ar: 'السويدي إليكتريك', sector: 'Industrials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'HRHO', name: 'Housing and Development Bank', name_ar: 'بنك الإسكان والتعمير', sector: 'Financials', egx30: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'EKHO', name: 'Eastern Company', name_ar: 'الشركة الشرقية - إيسترن كومباني', sector: 'Consumer Goods', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'TMGH', name: 'Talaat Moustafa Group', name_ar: 'مجموعة طلعت مصطفى القابضة', sector: 'Real Estate', egx30: true, egx100: true, is_halal: null, compliance_status: 'unknown' },
    { ticker: 'PHDC', name: 'Palm Hills Developments', name_ar: 'بالم هيلز للتعمير', sector: 'Real Estate', egx30: true, egx100: true, is_halal: null, compliance_status: 'unknown' },
    { ticker: 'GTHE', name: 'GB Auto', name_ar: 'جي بي أوتو', sector: 'Consumer Goods', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ESRS', name: 'Ezz Steel', name_ar: 'عز الدخيلة للصلب - الإسكندرية', sector: 'Basic Materials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ORHD', name: 'Orascom Development Egypt', name_ar: 'أوراسكوم للتنمية مصر', sector: 'Real Estate', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'CIEB', name: 'Credit Agricole Egypt', name_ar: 'كريدي أجريكول مصر', sector: 'Financials', egx30: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'AMER', name: 'Amer Group', name_ar: 'مجموعة عامر القابضة', sector: 'Consumer Services', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'HELI', name: 'Heliopolis Housing', name_ar: 'مصر الجديدة للإسكان والتعمير', sector: 'Real Estate', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'OCDI', name: 'Orascom Construction', name_ar: 'أوراسكوم للإنشاء والصناعة', sector: 'Industrials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'JUFO', name: 'Juhayna Food Industries', name_ar: 'جهينة للصناعات الغذائية', sector: 'Food & Beverage', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ABUK', name: 'Abu Qir Fertilizers', name_ar: 'أبوقير للأسمدة والصناعات الكيماوية', sector: 'Basic Materials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'SKPC', name: 'Sidi Kerir Petrochemicals', name_ar: 'سيدي كرير للبتروكيماويات', sector: 'Energy', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'MNHD', name: 'Madinet Nasr Housing', name_ar: 'مدينة نصر للإسكان والتعمير', sector: 'Real Estate', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ESGH', name: 'Ezz Steel Rebars', name_ar: 'العز للصلب - حديد عز', sector: 'Basic Materials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ALCN', name: 'Alexandria Container', name_ar: 'الإسكندرية لتداول الحاويات والبضائع', sector: 'Industrials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'EFIH', name: 'EFG Hermes Holding', name_ar: 'هيرميس القابضة للخدمات المالية', sector: 'Financials', egx30: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'BTFH', name: 'B.TECH', name_ar: 'بي تك للتكنولوجيا والتجارة', sector: 'Technology', egx30: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'MFPC', name: 'Misr Fertilizers Production', name_ar: 'مصر لإنتاج الأسمدة - موبكو', sector: 'Basic Materials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'FWRY', name: 'Fawry', name_ar: 'فوري لتكنولوجيا البنوك والمدفوعات الإلكترونية', sector: 'Technology', egx30: true, egx100: true, is_halal: false, compliance_status: 'controversial' },
    { ticker: 'EGTS', name: 'Egyptian Gulf Bank', name_ar: 'المصرف المتحد', sector: 'Financials', egx30: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'CAPE', name: 'Cape', name_ar: 'رواد السياحة - كيب', sector: 'Consumer Services', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'DMNH', name: 'Damanhour National Mills', name_ar: 'المطاحن الأهلية بدمنهور', sector: 'Food & Beverage', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ORTE', name: 'Oriental Weavers', name_ar: 'الشرقية للدخان', sector: 'Consumer Goods', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'CLHO', name: 'Cleopatra Hospital', name_ar: 'مستشفى كليوباترا', sector: 'Healthcare', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'PIOH', name: 'Pioneers Holding', name_ar: 'بايونيرز القابضة للاستثمارات المالية والاقتصادية', sector: 'Financials', egx30: true, egx100: true, is_halal: true, compliance_status: 'halal' },

    // EGX70 Members (ranks 31-100) - Mid-cap stocks
    { ticker: 'APRI', name: 'Alexandria Mineral Oils', name_ar: 'الإسكندرية لزيوت المعدنية - أموك', sector: 'Energy', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'EMFD', name: 'Egyptian Financial Group', name_ar: 'المجموعة المالية هيرميس القابضة', sector: 'Financials', egx70: true, egx100: true, is_halal: null, compliance_status: 'unknown' },
    { ticker: 'UASG', name: 'United Arab Shipping', name_ar: 'الملاحة العربية المتحدة', sector: 'Industrials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'DCRC', name: 'Delta Construction & Rebuilding', name_ar: 'دلتا للإنشاء والتعمير', sector: 'Real Estate', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'PHAR', name: 'Alex Pharmaceuticals', name_ar: 'الإسكندرية للأدوية والصناعات الكيماوية', sector: 'Healthcare', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'TEXT', name: 'Misr Spinning & Weaving', name_ar: 'مصر للغزل والنسيج بالمحلة', sector: 'Consumer Goods', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'SUGR', name: 'Delta Sugar', name_ar: 'دلتا للسكر', sector: 'Food & Beverage', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'IRON', name: 'Egyptian Iron & Steel', name_ar: 'الحديد والصلب المصرية', sector: 'Basic Materials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'CERA', name: 'Egyptian Ceramics', name_ar: 'القاهرة للزجاج', sector: 'Basic Materials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'MILS', name: 'Upper Egypt Mills', name_ar: 'المطاحن العليا', sector: 'Food & Beverage', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'OCIC', name: 'Orascom Construction Industries', name_ar: 'أوراسكوم للصناعات والإنشاءات', sector: 'Basic Materials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'TELE', name: 'Egyptalum', name_ar: 'الألومنيوم العربية', sector: 'Basic Materials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'RAYA', name: 'Raya Contact Center', name_ar: 'راية لمراكز الخدمات العملاء', sector: 'Technology', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'ELKA', name: 'Egyptians Towers', name_ar: 'مصر للأبراج', sector: 'Real Estate', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'PETR', name: 'Delta International Bank', name_ar: 'بنك الدلتا الدولي', sector: 'Financials', egx70: true, egx100: true, is_halal: false, compliance_status: 'haram' },
    { ticker: 'NSGB', name: 'Naeem Holding', name_ar: 'نعيم القابضة للاستثمارات المالية', sector: 'Financials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'KAHA', name: 'Cairo Poultry', name_ar: 'القاهرة للدواجن', sector: 'Food & Beverage', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'SPMD', name: 'South Valley Cement', name_ar: 'أسمنت جنوب الوادي', sector: 'Basic Materials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'CALT', name: 'Cairo Oils & Soap', name_ar: 'القاهرة للزيوت والصابون', sector: 'Consumer Goods', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },
    { ticker: 'PACL', name: 'Paints & Chemicals Industries', name_ar: 'الصناعات الكيماوية المصرية - كيما', sector: 'Basic Materials', egx70: true, egx100: true, is_halal: true, compliance_status: 'halal' },

    // Additional active EGX stocks (not in main indices but actively traded)
    { ticker: 'ARAB', name: 'Arab Cotton Ginning', name_ar: 'محلج القطن العربي', sector: 'Consumer Goods', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'EAST', name: 'Eastern Tobacco', name_ar: 'الشرقية للدخان', sector: 'Consumer Goods', egx30: false, egx70: false, egx100: false, is_halal: false, compliance_status: 'controversial' },
    { ticker: 'MENA', name: 'MENA Tourism & Hotels', name_ar: 'مينا للسياحة والفنادق', sector: 'Consumer Services', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'BLDG', name: 'Building Materials', name_ar: 'مواد البناء', sector: 'Basic Materials', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'PHYG', name: 'Pharos Holding', name_ar: 'فاروس القابضة للاستثمارات المالية', sector: 'Financials', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'PORT', name: 'Cairo Investment & Development', name_ar: 'القاهرة للاستثمار والتنمية العقارية', sector: 'Real Estate', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'MTEZ', name: 'Suez Fertilizers Company', name_ar: 'السويس للأسمدة', sector: 'Basic Materials', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'DSCW', name: 'Damietta Container Handling', name_ar: 'دمياط لتداول الحاويات', sector: 'Industrials', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'GMCC', name: 'GMC', name_ar: 'جنوب الوادي للسياحة', sector: 'Consumer Services', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' },
    { ticker: 'MASR', name: 'Masr for Central Clearing', name_ar: 'شركة مصر للمقاصة', sector: 'Financials', egx30: false, egx70: false, egx100: false, is_halal: true, compliance_status: 'halal' }
];

module.exports = { COMPREHENSIVE_EGX_STOCKS };
