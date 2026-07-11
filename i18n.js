// i18n.js — merged translations loader (safe for multiple loads)
// Paste entire file as project/i18n.js and hard-refresh the page.

(function () {
  // Ensure a single global translations container
  window.TRANSLATIONS = window.TRANSLATIONS || {};

  // New translations to merge (ka + en) — sanitized to avoid truncated tokens.
  const NEW = {
    ka: {
      "meta.title": "PulseClient - პრემიუმ Minecraft საბრძოლო და სტელს უპირატესობა",
      "nav.features": "მახასიათებლები",
      "nav.pricing": "ფასები",
      "nav.faq": "კითხვები",
      "nav.login": "შესვლა",
      "nav.user": "მომხმარებელი",
      "hero.badge": "V1.03 ახალი ვერსია",
      "hero.title": "დომინირება Minecraft <br><span class=\"highlight\">საბრძოლო & მოძრაობა</span>",
      "hero.desc": "მოიპოვეთ უპირატესობა თამაშში კონფიგურირებადი Combat მოდიფიკაციებით, პერსონალური ვიზუალით და მოწინავე ბაიპასებით.",
      "hero.buy": "შეიძინე PulseClient",
      "hero.explore": "გაეცანი ფუნქციებს",
      "hero.protection": "PulseClient დაცვა",
      "hero.status": "სრულად დაცული და ამოუცნობი",
      "setup.title": "სწრაფი ინსტალაცია",
      "setup.subtitle": "გადმოწერე, ჩააგდე mods საქაღალდეში და ითამაშე.",
      "setup.stepsTitle": "3 ნაბიჯი",
      "setup.stepsSub": "გადმოწერა, ჩაგდება, თამაში",
      "setup.footer": "თავსებადია Fabric <strong>1.21.11</strong>-თან out of the box.",
      "setup.discordTip": "Discord-ით გასაღები",
      "setup.windowsTip": "mods საქაღალდეში ჩაგდება",
      "setup.mcTip": "Minecraft-ში თამაში",
      "features.title": "რატომ უნდა აირჩიოთ PulseClient?",
      "features.subtitle": "შექმნილია ნულიდან მაქსიმალური საბრძოლო ეფექტურობისთვის, სუფთა ვიზუალით და სტაბილური bypass-ებით.",
      "features.f1.title": "Combat მოდифიკაციები",
      "features.f1.desc": "სრულად კონფიგურირებადი AutoClicker, Reach, Velocity/Knockback შემცირება და AimAssist, მაღალი ხარისხით.",
      "features.f2.title": "ვიზუალური ფუნქციები",
      "features.f2.desc": "სუფთა Player Chams, Chest ESP, დეტალური HUD ოვერლეი და Tracers, რომლებიც არ ჩანან ჩანაწერებში.",
      "features.f3.title": "გაფართოებული შემოვლები",
      "features.f3.desc": "ფარული პაკეტების მანიპულაცია Matrix, GrimAC, Vulcan და სხვა თანამედროვე ანტის სისტემებისათვის.",
      "features.f4.title": "Discord ინტეგრაცია",
      "features.f4.desc": "გააქტიურეთ გასაღები, ნახეთ დეტალები და მართეთ როლები მარტივად ჩვენი Discord ბოტით.",
      "pricing.title": "მარტივი და გამჭვირვალე ფასები",
      "pricing.subtitle": "აირჩიეთ ტარიფი, რომელიც საუკეთესოდ შეესაბამება თქვენს სათამაშო განრიგს.",
      "pricing.weekly": "ყოველკვირიული ტარიფი",
      "pricing.monthly": "ყოველთვიური ტარიფი",
      "pricing.lifetime": "სამუდამო ტარიფი",
      "pricing.popular": "რეკომენდებული",
      "pricing.per7": "/ 7 დღე",
      "pricing.per30": "/ 30 დღე",
      "pricing.once": "/ ერთჯერადი",
      "pricing.trial": "ერთჯერადი საცდელი პერიოდი",
      "pricing.trialBadge": "FREE",
      "pricing.free": "უფასო",
      "pricing.per3": "/ 3 დღე",
      "pricing.trialDesc": "გამოსცადეთ კლიენტი სრულად, არანაირი გადახდის გარეშე, სანამ ტარიფს აირჩევთ.",
      "pricing.trialPerk": "გადახდის გარეშე, დაუყოვნებლივ",
      "pricing.tryFree": "სცადე უფასოდ",
      "pricing.weeklyDesc": "იდეალური კლიენტის გასატესტად და ყოველკვირეული გამოყენებისთვის.",
      "pricing.monthlyDesc": "სტანდარტული არჩევანი აქტიური მოთამაშეებისთვის.",
      "pricing.lifetimeDesc": "გადაიხადე ერთხელ, ითამაშე სამუდამოდ. მიიღე პრიორიტეტული წვდომა განახლებებზე.",
      "pricing.perk1": "კლიენტის სრული წვდომა",
      "pricing.perk2": "ყველა Anti-Cheat შემოვლა",
      "pricing.perk3": "Discord როლი და მხარდა რობა",
      "pricing.perk4": "მუდმივი ფუნქციების განახლება",
      "pricing.perk5": "კლიენტის მუდმივი წვდომა",
      "pricing.perk6": "პრიორიტეტული Discord მხარდაჭერა",
      "pricing.perk7": "ექსკლუზიური ბეტა ვერსიები",
      "pricing.perk8": "სამუდამო წვდომა განახლებებზე",
      "pricing.buy": "ყიდვა",
      "pricing.buyLifetime": "სამუდამოს შეძენა",
      "purchaseModal.title": "შეძენისთვის მოგვმართეთ Discord-ზე",
      "purchaseModal.desc": "ამ ტარიფის შესაძენად, გადადით ჩვენს Discord სერვერზე და გახსენით ticket მხარდაჭერისთვის.",
      "purchaseModal.step1": "დააჭირეთ ღილაკს და შეერთდით ჩვენს Discord სერვერზე",
      "purchaseModal.step2": "გახსენით <strong>ticket</strong> არხში \"Buy / Purchase\" კატეგორიაში",
      "purchaseModal.step3": "დაელოდეთ მხარდაჭერის გუნდს და მიჰყევით მითითებებს",
      "purchaseModal.cta": "Discord სერვერზე გადასვლა",
      "dash.devices": "მოწყობილობები",
      "dash.deviceSlot": "+ მოწყობილობის სლოტი",
      "dash.downloads": "ჩამოტვირთვები",
      "dash.licenses": "ლიცენზიები & გასაღები",
      "dash.faq": "კითხვები",
      "dash.admin": "ადმინ პანელი",
      "dash.discordUser": "Discord მომხმარებელი",
      "dash.licensesLabel": "ლიცენზიები:",
      "dash.logout": "გამოსვლა",
      "dash.updateTitle": "🎉 ხელმისაწვდომია ახალი განახლება!",
      "dash.updateDefault": "PulseClient-ის ახალი ვერსია გამოვიდა. გადმოიწერეთ ბოლო ვერსია.",
      "dash.updateBtn": "განახლება",
      "dash.latestVersion": "PulseClient - ბოლო ვერსია",
      "dash.pvpVersion": "Pulse PvP Client (PvP-სთვის)",
      "dash.basefindVersion": "Pulse Base Find (Base-ების საპოვნელად)",
      "dash.versionLabel": "ბოლო ვერსია",
      "dash.versionLabelHtml": "ბოლო ვერსია <span class=\"badge-jar\">.jar</span>",
      "dash.updatedToday": "ბოლოს განახლდა: დღეს",
      "dash.download": "ჩამოტვირთვა",
      "dash.opsecTitle": "Opsec Mod",
      "dash.opsecDesc": "ამ მოდის ინსტალაცია მნიშვნელოვან უსაფრთხოებრივ ფუნქციას უზრუნველყოფს (OpSec).",
      "dash.quickStart": "სწრაფი დაწყება (Quick Start)",
      "dash.step1.title": "ჩამოტვირთვა",
      "dash.step1.desc": "გადმოწერეთ ბოლო .jar ფაილი ზემოდან.",
      "dash.step2.title": "ინსტალაცია",
      "dash.step2.desc": "ჩააგდეთ ფაილი თქვენს 1.21.11 mods საქაღალდეში.",
      "dash.step3.title": "თამაში",
      "dash.step3.desc": "ჩართეთ თამაში და დააჭირეთ Shift (Shift) ღილაკს მენიუსთვის.",
      "dash.launchers": "თავსებადი ლაუნჩერები (Compatible Launchers)",
      "dash.compatible": "თავსებადი",
      "dash.launchersNote": "სხვა Fabric-თან თავსებადი ლაუნჩერებიც შეიძლება მუშაობდეს.",
      "dash.myLicenses": "თქვენი აქტიური ლიცენზიები",
      "dash.refresh": "განახლება",
      "dash.licensesLoading": "ლიცენზიები იტვირთება...",
      "dash.noLicenses": "თქვენს Discord ანგარიშზე ჯერ არცერთი ლიცენზია არ არის მიბმული.",
      "dash.noLicensesSub": "შეიძინეთ გასაღები ან დააკავშირეთ არსებული ქვემოთ!",
      "dash.bindTitle": "არსებული ლიცენზიის გასაღების დაკავშირება",
      "dash.bindDesc": "თუ გაქვთ Discord ბოტიდან გენერირებული გასაღები, რომელიც ჯერ არ არის დაკავშირებული, შეიყვანეთ იგი ქვემოთ.",
      "dash.bindBtn": "დაკავშირება",
      "dash.faqTitle": "ხშირად დასმული კითხვები (FAQ)",
      "faq.title": "ხშირად დასმული კითხვები",
      "faq.q1": "როგორ მივიღო ჩემი ლიცენზიის გასაღები?",
      "faq.a1": "ტარიფის შეძენის შემდეგ, შეგიძლიათ გასაღები გენერირება Discord ბოტით ან დაუკავშიროთ აქ.",
      "faq.q2": "სად უნდა ჩავწერო გასაღები სათამაშოდ?",
      "faq.a2": "Minecraft-ის დაწყებისას გამოჩნდება ფანჯარა გასაღების ჩასაწერად. ჩაწერეთ და დააჭირეთ Activate.",
      "faq.q3": "შემიძლია ჩემი გასაღები რამდენიმე კომპიუტერზე გამოვიყენო?",
      "faq.a3": "გასაღები ებმება პირველ კომპიუტერს HWID-ზე; ცვლილებისთვის მიმართეთ მხარდაჭერას.",
      "admin.genTitle": "ლიცენზიის გასაღების გენერირება",
      "admin.buyerLabel": "მყიდველის Discord User",
      "admin.selectUser": "აირჩიეთ მომხმარებელი...",
      "admin.product": "პროდუქტი",
      "admin.duration": "ხანგრძლივობა",
      "admin.d1": "1 დღე",
      "admin.d3": "3 დღე",
      "admin.d7": "7 დღე",
      "admin.d30": "30 დღე",
      "admin.d90": "90 დღე",
      "admin.lifetime": "სამუდამო (Lifetime)",
      "admin.custom": "ხელით (დღეები)",
      "admin.customPh": "მაგ: 14 დღე",
      "admin.createBtn": "გასაღების შექმნა",
      "admin.createdKey": "შექმნილი გასაღები:",
      "admin.copy": "კოპირება",
      "admin.manageTitle": "ყველა ლიცენზიის მართვა",
      "admin.searchPh": "ძებნა (key, buyer, admin...)",
      "admin.filterAll": "ყველა სტატუსი",
      "admin.filterActive": "აქტიური",
      "admin.filterRevoked": "გაუქმებული",
      "admin.filterExpired": "ვადაგასული",
      "admin.loading": "მონაცემები იტვირთება...",
      "admin.colProduct": "პროდუქტი",
      "admin.colOwner": "მფლობელი",
      "admin.colCreator": "შემქმნელი",
      "admin.colKey": "ლიცენზიის გასაღები",
      "admin.colStatus": "სტატუსი",
      "admin.colExpiry": "მოქმედების ვადა",
      "admin.colActions": "ქმედებები",
      "admin.totalFound": "სულ ნაპოვნია:",
      "admin.modalTitle": "ლიცენზიის დეტალური ინფორმაცია",
      "admin.modalKey": "ლიცენზიის გასაღები",
      "admin.modalOwner": "მფლობელი",
      "admin.modalCreator": "შემქმნელი (ადმინი)",
      "admin.modalStatus": "სტატუსი",
      "admin.modalCreated": "შექმნის თარიღი",
      "admin.modalExpires": "ვადამდე დარჩა",
      "admin.modalHwid": "HWID (მოწყობილობის კოდი)",
      "admin.modalNote": "შენიშვნა",
      "admin.userModalTitle": "აირჩიეთ მომხმარებელი",
      "admin.userSearchPh": "მოძებნე სახელით ან Discord ID-ით...",
      "footer.text": "© 2026 PulseClient. ყველა უფლება დაცულია. არ არის აფილირებული Mojang AB-თან.",
      "discord.aria": "PulseClient Discord სერვერი",
      "status.active": "აქტიური",
      "status.revoked": "გაუქმებული",
      "status.expired": "ვადაგასული",
      "status.lifetime": "სამუდამო",
      "status.expiredShort": "ვადა გასულია",
      "status.notActivated": "გააქტიურებული არ არის",
      "status.daysLeft": "{n} დღე დარჩა",
      "status.days": "{n} დღე",
      "lic.keyLabel": "ლიცენზიის გასაღები",
      "lic.expiryLabel": "ვადა",
      "creator.dashboard": "მომხმარებელი (Dashboard)",
      "msg.loginFail": "შესვლა ვერ მოხერხდა: ",
      "msg.licLoadFail": "ლიცენზიების ჩატვირთვის შეცდომა: ",
      "msg.keyNotFound": "ლიცენზიის გასაღები ვერ მოიძებნა. გადამოწმეთ და სცადეთ თავიდან.",
      "msg.keyTaken": "ეს გასაღები უკვე სხვა Discord მომხმარებელზეა მიბმული.",
      "msg.bindSuccess": "ლიცენზიის გასაღები წარმატებით დაუკავშირდა თქვენს Discord ანგარიშს!",
      "msg.bindFail": "გასაღების დაკავშირება ვერ მოხერხდა: ",
      "msg.bindLoading": "მიმდინარეობს დაკავშირება...",
      "msg.dataLoadFail": "მონაცემების ჩატვირთვა ვერ მოხერხდა: ",
      "msg.noLicenses": "ლიცენზიები არ მოიძებნა",
      "msg.invalidDays": "შეიყვანეთ ვალიდური დღეების რაოდენობა (1 და მეტი).",
      "msg.creating": "მიმდინარეობს შექმნა...",
      "msg.keyCreated": "ლიცენზიის გასაღები წარმატებით შეიქმნა!",
      "msg.keyCreateFail": "გასაღების შექმნა ვერ მოხერხდა: ",
      "msg.copied": "კოპირებულია!",
      "msg.revokeConfirm": "ნამდვილად გსურთ გასაღების გაუქმება?\n",
      "msg.revokeSuccess": "ლიცენზია გაუქმდა წარმატებით",
      "msg.revokeFail": "გაუქმება ვერ მოხერხდა: ",
      "msg.hwidConfirm": "ნამდვილად გსურთ მოწყობილობის (HWID) განულება?\n",
      "msg.hwidSuccess": "მოწყობილობა (HWID) განულდა წარმატებით",
      "msg.hwidFail": "განულება ვერ მოხერხდა: ",
      "msg.noUsers": "მომხმარებლები ვერ მოიძებნა",
      "msg.updateAvailable": "გამოვიდა ახალი ვერსია ({date}). გთხოვთ გადმოწეროთ განახლებული ფაილი!",
      "msg.lastUpdated": "ბოლოს განახლდა: ",
      "admin.actionInfo": "ინფო",
      "admin.actionHwid": "HWID განულება",
      "admin.actionRevoke": "გაუქმება",
      "dash.trialTitle": "უფასო 3-დღიანი საცდელი პერიოდი",
      "dash.trialDesc": "თუ ხართ ახალი მომხმარებელი და ჯერ არ გაქვთ არცერთი გასაღები, შეგიძლიათ მიიღოთ 3-დღიანი საცდელი გასაღები.",
      "dash.trialBtn": "უფასო გასაღების აღება",
      "msg.trialSuccess": "საცდელი გასაღები წარმატებით გენერირდა და დაემატა თქვენს ანგარიშს!",
      "msg.referredSuccessNotice": "გილოცავთ! დარეგისტრირდით მოწვევის წყალობით; საცდელი განაკვეთი დაამატეს ორივეს.",
      "msg.trialAlreadyClaimed": "თქვენ უკვე გაქვთ აქტიური ან ძველი ლიცენზია, ან საცდელი უკვე აღებულია.",
      "msg.trialAccountTooNew": "თქვენი Discord ანგარიში ძალიან ახალია. საცდელი გასაღების ასაღებად ანგარიში უნდა იყოს მინიმუმ 30 დღე.",
      "confirm.title": "დადასტურება",
      "confirm.yes": "დიახ",
      "confirm.no": "არა",
      "dash.referral": "რეფერალები",
      "dash.referralTitle": "მოიწვიე მეგობარი",
      "dash.referralDesc": "გაუზიარე რეფერალური ლინკი მეგობარს. როგორც კი ის გაივლის რეგისტრაციას, ორივე მიიღებს საცდელი ბონუსს.",
      "dash.referralCopyBtn": "ლინკის კოპირება",
      "dash.promocodes": "პრომო კოდები",
      "promo.title": "პრომო კოდის გააქტიურება",
      "promo.desc": "შეიყვანეთ მედია კრეატორის ან სარეკლამო პრომო კოდი უფასო დღეების მისაღებად.",
      "promo.codePh": "მაგ: PULSE2026",
      "promo.redeemBtn": "გააქტიურება",
      "admin.promoTitle": "პრომო კოდების შექმნა",
      "admin.promoList": "პრომო კოდების მართვა",
      "admin.colPromoCode": "პრომო კოდი",
      "admin.colPromoDays": "დღეები",
      "admin.colPromoUses": "გამოყენება (ლიმიტი)",
      "admin.colPromoCreator": "შემქმნელი",
      "admin.colPromoActions": "ქმედებები",
      "admin.promoCodePh": "მაგ: PULSE100",
      "admin.promoDaysPh": "დღეების რაოდენობა",
      "admin.promoUsesPh": "ლიმიტი (ცარიელი = ულიმიტო)",
      "admin.promoCreateBtn": "კოდის შექმნა",
      "admin.promoRedemptionsTitle": "პრომო კოდების გამოყენების ჟურნალი",
      "admin.colPromoUser": "მომხმარებელი",
      "admin.colPromoDate": "თარიღი",
      "msg.promoRedeemed": "პრომო კოდი წარმატებით გააქტიურდა! დაგემატათ {n} დღე.",
      "msg.promoAlreadyUsed": "თქვენ უკვე გამოიყენეთ ეს პრომო კოდი.",
      "msg.promoExpired": "ეს პრომო კოდი არააქტიურია ან ამოეწურა გამოყენების ლიმიტი.",
      "msg.promoNotFound": "პრომო კოდი ვერ მოიძებნა.",
      "msg.promoCreated": "პრომო კოდი წარმატებით შეიქმნა!",
      "msg.promoRedeemFail": "პრომო კოდის გააქტიურება ვერ მოხერხდა: ",
      "dash.resetHwidBtn": "HWID განულება",
      "lic.hwidLabel": "მოწყობილობა (HWID)",
      "msg.hwidResetConfirm": "ნამდვილად გსურთ მოწყობილობის (HWID) განულება ამ ლიცენზიისთვის?",
      "admin.telemetryTitle": "აქტიური სესიები (Active Telemetry)",
      "telemetry.mcUser": "Minecraft იუზერი",
      "telemetry.key": "გასაღები",
      "telemetry.ip": "IP მისამართი",
      "telemetry.os": "OS",
      "telemetry.country": "ქვეყანა",
      "telemetry.started": "ჩაირთო",
      "telemetry.duration": "ხანგრძლივობა",
      "telemetry.ended": "დასრულდა",
      "admin.totalOnlineHtml": "სულ ონლაინშია: <span id=\"admin-sessions-count\">0</span>",
      "admin.totalFoundHtml": "სულ ნაპოვნია: <span id=\"admin-total-count\">0</span>",
      "admin.logTitle": "მოქმედებების ჟურნალი (Activity Log)",
      "admin.logSearchPh": "მოძებნე მოქმედება, მომხმარებელი...",
      "log.date": "თარიღი",
      "log.user": "მომხმარებელი / ადმინი",
      "log.action": "მოქმედება",
      "log.details": "დეტალები"
    },
    en: {
      "meta.title": "PulseClient - Premium Minecraft Combat & Stealth Advantage",
      "nav.features": "Features",
      "nav.pricing": "Pricing",
      "nav.faq": "FAQ",
      "nav.login": "Login",
      "nav.user": "User",
      "hero.badge": "V1.03 New Version",
      "hero.title": "Dominate Minecraft <br><span class=\"highlight\">Combat & Movement</span>",
      "hero.desc": "Gain the edge with fully configurable combat mods, premium visual ESP, and powerful anti-cheat bypasses. Built for high-level players.",
      "hero.buy": "Get PulseClient",
      "hero.explore": "Explore Features",
      "hero.protection": "PulseClient Protection",
      "hero.status": "Fully protected and undetected",
      "setup.title": "Quick Setup",
      "setup.subtitle": "Download, drop into your mods folder, and play.",
      "setup.stepsTitle": "3 Steps",
      "setup.stepsSub": "Download, drop, play",
      "setup.footer": "Works with Fabric <strong>1.21.11</strong> out of the box.",
      "setup.discordTip": "Get key via Discord",
      "setup.windowsTip": "Drop into mods folder",
      "setup.mcTip": "Play in Minecraft",
      "features.title": "Why Choose PulseClient?",
      "features.subtitle": "Built from scratch for maximum combat efficiency, clean visuals, and stable bypasses.",
      "features.f1.title": "Combat Mods",
      "features.f1.desc": "Fully configurable AutoClicker, Reach, Velocity/Knockback reduction, and AimAssist that looks completely legit.",
      "features.f2.title": "Visual Features",
      "features.f2.desc": "Clean Player Chams, Chest ESP, detailed HUD overlay, and Tracers that won't show in screen recorders.",
      "features.f3.title": "Advanced Bypasses",
      "features.f3.desc": "Silent packet manipulation to bypass Matrix, GrimAC, Vulcan, and other modern anti-cheats.",
      "features.f4.title": "Discord Integration",
      "features.f4.desc": "Activate keys, view details, and manage roles easily through our automated Discord bot.",
      "pricing.title": "Simple & Transparent Pricing",
      "pricing.subtitle": "Choose the plan that best fits your play schedule.",
      "pricing.weekly": "Weekly Plan",
      "pricing.monthly": "Monthly Plan",
      "pricing.lifetime": "Lifetime Plan",
      "pricing.popular": "Recommended",
      "pricing.per7": "/ 7 days",
      "pricing.per30": "/ 30 days",
      "pricing.once": "/ one-time",
      "pricing.trial": "One-Time Free Trial",
      "pricing.trialBadge": "FREE",
      "pricing.free": "Free",
      "pricing.per3": "/ 3 days",
      "pricing.trialDesc": "Try the full client with no payment required before you pick a plan.",
      "pricing.trialPerk": "No payment, instant access",
      "pricing.tryFree": "Try for Free",
      "pricing.weeklyDesc": "Ideal for testing the client and weekly tournaments.",
      "pricing.monthlyDesc": "Standard choice for active and competitive Minecraft players.",
      "pricing.lifetimeDesc": "Pay once, play forever. Get priority access to all future updates.",
      "pricing.perk1": "Full client access",
      "pricing.perk2": "All anti-cheat bypasses",
      "pricing.perk3": "Discord role & support",
      "pricing.perk4": "Continuous feature updates",
      "pricing.perk5": "Permanent client access",
      "pricing.perk6": "Priority Discord support",
      "pricing.perk7": "Exclusive beta versions",
      "pricing.perk8": "Lifetime access to updates",
      "pricing.buy": "Buy",
      "pricing.buyLifetime": "Buy Lifetime",
      "purchaseModal.title": "Message Us on Discord to Purchase",
      "purchaseModal.desc": "To buy this plan, join our Discord server and open a ticket in the support section. Our team will help you with payment and key generation within minutes.",
      "purchaseModal.step1": "Click the button below to join our Discord server",
      "purchaseModal.step2": "Open a <strong>ticket</strong> in the \"Buy / Purchase\" category",
      "purchaseModal.step3": "Wait for the support team and follow their instructions",
      "purchaseModal.cta": "Go to Discord Server",
      "dash.devices": "Devices",
      "dash.deviceSlot": "+ Device slot",
      "dash.downloads": "Downloads",
      "dash.licenses": "Licenses & Keys",
      "dash.faq": "FAQ",
      "dash.admin": "Admin Panel",
      "dash.discordUser": "Discord User",
      "dash.licensesLabel": "Licenses:",
      "dash.logout": "Logout",
      "dash.updateTitle": "🎉 New update available!",
      "dash.updateDefault": "A new PulseClient version is out. Download the latest build.",
      "dash.updateBtn": "Update",
      "dash.latestVersion": "PulseClient - Latest Version",
      "dash.pvpVersion": "Pulse PvP Client (for PvP)",
      "dash.basefindVersion": "Pulse Base Find (for Base Finding)",
      "dash.versionLabel": "Latest version",
      "dash.versionLabelHtml": "Latest version <span class=\"badge-jar\">.jar</span>",
      "dash.updatedToday": "Last updated: today",
      "dash.download": "Download",
      "dash.opsecTitle": "Opsec Mod",
      "dash.opsecDesc": "Installing this mod is absolutely critical for security (OpSec).",
      "dash.quickStart": "Quick Start",
      "dash.step1.title": "Download",
      "dash.step1.desc": "Download the latest .jar file above.",
      "dash.step2.title": "Install",
      "dash.step2.desc": "Drop the file into your 1.21.11 mods folder.",
      "dash.step3.title": "Play",
      "dash.step3.desc": "Launch the game and press Shift (Shift) to open the menu.",
      "dash.launchers": "Compatible Launchers",
      "dash.compatible": "Compatible",
      "dash.launchersNote": "Other Fabric-compatible launchers may work too.",
      "dash.myLicenses": "Your Active Licenses",
      "dash.refresh": "Refresh",
      "dash.licensesLoading": "Loading licenses...",
      "dash.noLicenses": "No licenses are linked to your Discord account yet.",
      "dash.noLicensesSub": "Purchase a key or link an existing one below!",
      "dash.bindTitle": "Link an Existing License Key",
      "dash.bindDesc": "If you have a key from our Discord bot that isn't linked to the site yet, enter it below to attach it to your Discord profile.",
      "dash.bindBtn": "Link Key",
      "dash.faqTitle": "Frequently Asked Questions (FAQ)",
      "faq.title": "Frequently Asked Questions",
      "faq.q1": "How do I get my license key?",
      "faq.a1": "After purchasing a plan, you can generate a key on our Discord server via bot commands, or link it here on the dashboard.",
      "faq.q2": "Where do I enter the key to play?",
      "faq.a2": "When you launch Minecraft with the mod, a special dark window will ask for your key. Enter it there and click Activate!",
      "faq.q3": "Can I use my key on multiple computers?",
      "faq.a3": "To prevent key sharing, each key binds to the first computer's HWID it activates on. You can reset HWID by contacting support on our Discord server.",
      "admin.genTitle": "Generate License Key",
      "admin.buyerLabel": "Buyer's Discord User",
      "admin.selectUser": "Select user...",
      "admin.product": "Product",
      "admin.duration": "Duration",
      "admin.d1": "1 day",
      "admin.d3": "3 days",
      "admin.d7": "7 days",
      "admin.d30": "30 days",
      "admin.d90": "90 days",
      "admin.lifetime": "Lifetime",
      "admin.custom": "Custom (days)",
      "admin.customPh": "e.g. 14 days",
      "admin.createBtn": "Create Key",
      "admin.createdKey": "Generated key:",
      "admin.copy": "Copy",
      "admin.manageTitle": "Manage All Licenses",
      "admin.searchPh": "Search (key, buyer, admin...)",
      "admin.filterAll": "All statuses",
      "admin.filterActive": "Active",
      "admin.filterRevoked": "Revoked",
      "admin.filterExpired": "Expired",
      "admin.loading": "Loading data...",
      "admin.colProduct": "Product",
      "admin.colOwner": "Owner",
      "admin.colCreator": "Creator",
      "admin.colKey": "License Key",
      "admin.colStatus": "Status",
      "admin.colExpiry": "Expiry",
      "admin.colActions": "Actions",
      "admin.totalFound": "Total found:",
      "admin.modalTitle": "License Details",
      "admin.modalKey": "License Key",
      "admin.modalOwner": "Owner",
      "admin.modalCreator": "Creator (Admin)",
      "admin.modalStatus": "Status",
      "admin.modalCreated": "Created",
      "admin.modalExpires": "Time Left",
      "admin.modalHwid": "HWID (Device ID)",
      "admin.modalNote": "Note",
      "admin.userModalTitle": "Select User",
      "admin.userSearchPh": "Search by name or Discord ID...",
      "dash.promocodes": "Promo Codes",
      "promo.title": "Redeem Promo Code",
      "promo.desc": "Enter a media creator or promotional code to get free days of client license.",
      "promo.codePh": "e.g. PULSE2026",
      "promo.redeemBtn": "Redeem Code",
      "admin.promoTitle": "Create Promo Code",
      "admin.promoList": "Manage Promo Codes",
      "admin.colPromoCode": "Promo Code",
      "admin.colPromoDays": "Days",
      "admin.colPromoUses": "Uses (Limit)",
      "admin.colPromoCreator": "Creator",
      "admin.colPromoActions": "Actions",
      "admin.promoCodePh": "e.g. PULSE100",
      "admin.promoDaysPh": "Number of days",
      "admin.promoUsesPh": "Limit (blank = unlimited)",
      "admin.promoCreateBtn": "Create Code",
      "admin.promoRedemptionsTitle": "Promo Code Redemptions Log",
      "admin.colPromoUser": "User",
      "admin.colPromoDate": "Date",
      "msg.promoRedeemed": "Promo code redeemed successfully! Added {n} days.",
      "msg.promoAlreadyUsed": "You have already redeemed this promo code.",
      "msg.promoExpired": "This promo code is inactive or has reached its usage limit.",
      "msg.promoNotFound": "Promo code not found.",
      "msg.promoCreated": "Promo code created successfully!",
      "msg.promoRedeemFail": "Failed to redeem promo code: ",
      "footer.text": "© 2026 PulseClient. All rights reserved.",
      "dash.resetHwidBtn": "Reset HWID",
      "lic.hwidLabel": "Device (HWID)",
      "msg.hwidResetConfirm": "Are you sure you want to reset the device (HWID) for this license?",
      "admin.telemetryTitle": "Active Telemetry",
      "telemetry.mcUser": "Minecraft User",
      "telemetry.key": "Key",
      "telemetry.ip": "IP Address",
      "telemetry.os": "OS",
      "telemetry.country": "Country",
      "telemetry.started": "Started",
      "telemetry.duration": "Duration",
      "telemetry.ended": "Ended",
      "admin.totalOnlineHtml": "Total Online: <span id=\"admin-sessions-count\">0</span>",
      "admin.totalFoundHtml": "Total Found: <span id=\"admin-total-count\">0</span>",
      "admin.logTitle": "Activity Log",
      "admin.logSearchPh": "Search action, user...",
      "log.date": "Date",
      "log.user": "User / Admin",
      "log.action": "Action",
      "log.details": "Details"
    }
  };

  // Merge NEW into window.TRANSLATIONS (do not overwrite existing keys)
  Object.keys(NEW).forEach(lang => {
    window.TRANSLATIONS[lang] = window.TRANSLATIONS[lang] || {};
    Object.keys(NEW[lang]).forEach(k => {
      if (typeof window.TRANSLATIONS[lang][k] === 'undefined') {
        window.TRANSLATIONS[lang][k] = NEW[lang][k];
      }
    });
  });

  // Local alias
  const TRANSLATIONS = window.TRANSLATIONS;

  const SELECTOR_BINDINGS = [
    ["#features .section-header h2", "features.title"],
    ["#features .section-header p", "features.subtitle"],
    ["#features .feature-card:nth-child(1) h3", "features.f1.title"],
    ["#features .feature-card:nth-child(1) p", "features.f1.desc"],
    ["#features .feature-card:nth-child(2) h3", "features.f2.title"],
    ["#features .feature-card:nth-child(2) p", "features.f2.desc"],
    ["#features .feature-card:nth-child(3) h3", "features.f3.title"],
    ["#features .feature-card:nth-child(3) p", "features.f3.desc"],
    ["#features .feature-card:nth-child(4) h3", "features.f4.title"],
    ["#features .feature-card:nth-child(4) p", "features.f4.desc"],
    ["#pricing .section-header h2", "pricing.title"],
    ["#pricing .section-header p", "pricing.subtitle"],
    ["#pricing .pricing-card:nth-child(2) h3", "pricing.weekly"],
    ["#pricing .pricing-card:nth-child(2) .desc", "pricing.weeklyDesc"],
    ["#pricing .pricing-card:nth-child(2) .price span", "pricing.per7"],
    ["#pricing .pricing-card:nth-child(3) .popular-badge", "pricing.popular"],
    ["#pricing .pricing-card:nth-child(3) h3", "pricing.lifetime"],
    ["#pricing .pricing-card:nth-child(3) .desc", "pricing.lifetimeDesc"],
    ["#pricing .pricing-card:nth-child(3) .price span", "pricing.once"],
    ["#pricing .pricing-card:nth-child(4) h3", "pricing.monthly"],
    ["#pricing .pricing-card:nth-child(4) .desc", "pricing.monthlyDesc"],
    ["#pricing .pricing-card:nth-child(4) .price span", "pricing.per30"],
    [".device-title", "dash.devices"],
    [".btn-device-slot", "dash.deviceSlot"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(1)", "dash.downloads", "text"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(2)", "dash.licenses", "text"],
    ["#dashboard-page .sidebar-menu .menu-item:nth-child(3)", "dash.referral", "text"],
    ["#admin-menu-item", "dash.admin", "menuText"],
    [".role-text", "dash.licensesLabel", "prefix"],
    ["#dash-logout-btn", "dash.logout", "text"],
    ["#update-notification .update-text strong", "dash.updateTitle"],
    ["#update-download-btn", "dash.updateBtn", "text"],

    [".quick-start-section .section-title", "dash.quickStart"],
    [".quick-start-grid .step-card:nth-child(1) h4", "dash.step1.title"],
    [".quick-start-grid .step-card:nth-child(1) p", "dash.step1.desc"],
    [".quick-start-grid .step-card:nth-child(2) h4", "dash.step2.title"],
    [".quick-start-grid .step-card:nth-child(2) p", "dash.step2.desc"],
    [".quick-start-grid .step-card:nth-child(3) h4", "dash.step3.title"],
    [".quick-start-grid .step-card:nth-child(3) p", "dash.step3.desc"],
    [".launchers-section .section-title", "dash.launchers"],
    [".launcher-card .launcher-meta span", "dash.compatible"],
    [".launcher-footer-note", "dash.launchersNote"],
    [".licenses-card .panel-header h3", "dash.myLicenses"],
    ["#refresh-licenses-btn", "dash.refresh", "textLast"],
    ["#licenses-loading", "dash.licensesLoading", "textLast"],
    ["#no-licenses-view p:first-child", "dash.noLicenses"],
    ["#no-licenses-view p.sub", "dash.noLicensesSub"],
    [".bind-card h3", "dash.bindTitle"],
    [".bind-card .desc", "dash.bindDesc"],
    ["#bind-submit-btn", "dash.bindBtn"],
    ["#tab-content-faq .section-title", "dash.faqTitle"],
    ["#faq .section-header h2", "faq.title"],
    [".admin-create-card > h3", "admin.genTitle"],
    ["label[for='admin-product-select']", "admin.product"],
    ["label[for='admin-duration-select']", "admin.duration"],
    ["#admin-create-btn", "admin.createBtn", "textLast"],
    ["#admin-key-result > div > span:first-child", "admin.createdKey"],
    ["#admin-copy-key-btn", "admin.copy"],
    [".admin-licenses-card .admin-header h3", "admin.manageTitle"],
    ["#admin-licenses-loading", "admin.loading", "textLast"],
    [".admin-count", "admin.totalFound", "prefix"],
    ["#license-info-modal h3", "admin.modalTitle"],
    ["#user-selection-modal h3", "admin.userModalTitle"],
    [".footer p", "footer.text"]
  ];

  const FAQ_BINDINGS = [
    ["faq.q1", "faq.a1"],
    ["faq.q2", "faq.a2"],
    ["faq.q3", "faq.a3"]
  ];

  const PRICING_PERKS = [
    ["#pricing .pricing-card:nth-child(2) li", ["pricing.perk1", "pricing.perk2", "pricing.perk3", "pricing.perk4"]],
    ["#pricing .pricing-card:nth-child(3) li", ["pricing.perk5", "pricing.perk1", "pricing.perk2", "pricing.perk6", "pricing.perk7", "pricing.perk8"]],
    ["#pricing .pricing-card:nth-child(4) li", ["pricing.perk1", "pricing.perk2", "pricing.perk3", "pricing.perk4"]]
  ];

  const PRICING_BTNS = [
    ["#pricing .pricing-card:nth-child(2) .buy-btn", "pricing.buy"],
    ["#pricing .pricing-card:nth-child(3) .buy-btn", "pricing.buyLifetime"],
    ["#pricing .pricing-card:nth-child(4) .buy-btn", "pricing.buy"]
  ];



  const MODAL_LABELS = [
    ["admin.modalKey", "modal-key"],
    ["admin.modalOwner", "modal-buyer"],
    ["admin.modalCreator", "modal-creator"],
    ["admin.modalStatus", "modal-status"],
    ["admin.modalCreated", "modal-created"],
    ["admin.modalExpires", "modal-expires"],
    ["admin.modalHwid", "modal-hwid"],
    ["admin.modalNote", "modal-note"]
  ];

  // Language state
  let currentLang = window.currentLang || localStorage.getItem("pulse_lang") || "ka";
  window.currentLang = currentLang;

  // Helper: single-time missing keys set
  if (!window.__missingI18nKeys) window.__missingI18nKeys = new Set();

  // t() function (fallback: currentLang -> ka -> en -> key)
  function t(key, vars = {}) {
    const str =
      (TRANSLATIONS && TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ??
      (TRANSLATIONS && TRANSLATIONS['ka'] && TRANSLATIONS['ka'][key]) ??
      (TRANSLATIONS && TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) ??
      key;
    const replaced = Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), v), String(str));
    if (replaced === key) {
      if (!window.__missingI18nKeys.has(key)) {
        console.warn(`Missing translation for key: "${key}" (lang: ${currentLang})`);
        window.__missingI18nKeys.add(key);
      }
    }
    return replaced;
  }

  // Minimal setElementText/apply functions copied for compatibility
  function setElementText(el, key, mode = "text") {
    if (!el) return;
    const val = t(key);
    try {
      if (mode === "html") el.innerHTML = val;
      else if (mode === "prefix") {
        const keep = el.querySelector("span");
        el.textContent = val + " ";
        if (keep) el.appendChild(keep);
      } else if (mode === "textLast") {
        const svg = el.querySelector("svg, .spinner");
        el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        el.append(document.createTextNode(svg ? " " + val : val));
      } else if (mode === "menuText") {
        const badge = el.querySelector(".admin-badge");
        el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        const textNode = document.createTextNode(val);
        if (badge) el.insertBefore(textNode, badge); else el.appendChild(textNode);
      } else if (mode === "text") {
        const badge = el.querySelector(".admin-badge");
        const svg = el.querySelector("svg");
        el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        const textNode = document.createTextNode(val);
        if (badge) el.insertBefore(textNode, badge);
        else if (svg) el.insertBefore(textNode, svg.nextSibling);
        else el.textContent = val;
      } else el.textContent = val;
    } catch (e) {
      try { el.textContent = val; } catch (ee) {}
    }
  }

  function applyFaqItems() {
    document.querySelectorAll(".faq-list").forEach((list) => {
      list.querySelectorAll(".faq-item").forEach((item, index) => {
        const keys = FAQ_BINDINGS[index];
        if (!keys) return;
        const h4 = item.querySelector("h4");
        const p = item.querySelector("p");
        if (h4) {
          const icon = h4.querySelector(".faq-toggle-icon");
          h4.textContent = t(keys[0]) + " ";
          if (icon) h4.appendChild(icon);
        }
        if (p) p.textContent = t(keys[1]);
      });
    });
  }

  function applyPricingPerks() {
    PRICING_PERKS.forEach(([selector, keys]) => {
      document.querySelectorAll(selector).forEach((li, i) => {
        const key = keys[i];
        if (!key) return;
        const svg = li.querySelector("svg");
        li.textContent = "";
        if (svg) li.appendChild(svg);
        li.append(" " + t(key));
      });
    });
  }

  function applyAdminStatic() {
    const buyerLabel = document.querySelector(".admin-form label:not([for])");
    if (buyerLabel) buyerLabel.textContent = t("admin.buyerLabel");
    const triggerSpan = document.querySelector("#admin-user-select-trigger > span");
    const buyerInput = document.getElementById("admin-buyer-input");
    if (triggerSpan && !buyerInput?.value) triggerSpan.textContent = t("admin.selectUser");
    document.querySelectorAll("#admin-duration-select option").forEach((opt) => {
      const durationMap = { "1":"admin.d1","3":"admin.d3","7":"admin.d7","30":"admin.d30","90":"admin.d90","lifetime":"admin.lifetime","custom":"admin.custom" };
      const k = durationMap[opt.value];
      if (k) opt.textContent = t(k);
    });
    document.querySelectorAll("#admin-filter-select option").forEach((opt) => {
      const filterMap = { all: "admin.filterAll", active: "admin.filterActive", revoked: "admin.filterRevoked", expired: "admin.filterExpired" };
      const k = filterMap[opt.value];
      if (k) opt.textContent = t(k);
    });
    const adminSearch = document.getElementById("admin-search-input");
    const adminDurationCustomEl = document.getElementById("admin-duration-custom");
    if (adminDurationCustomEl) adminDurationCustomEl.placeholder = t("admin.customPh");
    if (adminSearch) adminSearch.placeholder = t("admin.searchPh");
    const userSearch = document.getElementById("admin-modal-user-search");
    if (userSearch) userSearch.placeholder = t("admin.userSearchPh");
    MODAL_LABELS.forEach(([key, valueId]) => {
      const valEl = document.getElementById(valueId);
      const label = valEl?.closest(".modal-info-item")?.querySelector(".info-label");
      if (label) label.textContent = t(key);
    });
    const discordFloat = document.querySelector(".discord-float");
    if (discordFloat) discordFloat.setAttribute("aria-label", t("discord.aria"));
  }

  // applyLanguage/getLocale/initLanguage/toggleLanguage implementations
  function getLocale() { return currentLang === "en" ? "en-US" : "ka-GE"; }

  function applyLanguage(lang) {
    currentLang = (lang === "en") ? "en" : "ka";
    try { localStorage.setItem("pulse_lang", currentLang); window.currentLang = currentLang; document.documentElement.lang = currentLang; } catch (e) {}
    try {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const k = el.getAttribute("data-i18n");
        if (k) el.textContent = t(k);
      });
      document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const k = el.getAttribute("data-i18n-html");
        if (k) el.innerHTML = t(k);
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const k = el.getAttribute("data-i18n-placeholder");
        if (k) el.placeholder = t(k);
      });
      document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const k = el.getAttribute("data-i18n-title");
        if (k) el.title = t(k);
      });
      document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const k = el.getAttribute("data-i18n-aria");
        if (k) el.setAttribute("aria-label", t(k));
      });
      SELECTOR_BINDINGS.forEach(([selector, key, mode]) => {
        document.querySelectorAll(selector).forEach((el) => setElementText(el, key, mode || "text"));
      });
      applyFaqItems();
      applyPricingPerks();
      applyAdminStatic();
    } catch (err) {
      console.error("Language apply error:", err);
    }
    try { document.title = t("meta.title"); } catch (e) {}
    updateLangSwitcherUI();
    if (typeof window.onLanguageChanged === "function") {
      try { window.onLanguageChanged(); } catch (e) {}
    }
  }

  function toggleLanguage() { applyLanguage(currentLang === "ka" ? "en" : "ka"); }

  function updateLangSwitcherUI() {
    document.querySelectorAll(".lang-switcher .lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  function initLanguage() {
    const switcher = document.getElementById("lang-switcher");
    if (switcher) {
      switcher.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
      });
    }
    applyLanguage(currentLang);
  }

  // Expose APIs
  window.t = t;
  window.getLocale = getLocale;
  window.applyLanguage = applyLanguage;
  window.toggleLanguage = toggleLanguage;
  window.initLanguage = initLanguage;

  // Mark loaded
  window.__i18n_safe_loaded = true;
})();
