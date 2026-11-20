/* Shared interface translations. Editorial content remains in its source language. */
(() => {
  'use strict';
  const languages = ['en', 'kn', 'hi', 'ta', 'te'];
  const rows = [
    ['Home','ಮುಖಪುಟ','होम','முகப்பு','హోమ్'],
    ['About PNP','PNP ಬಗ್ಗೆ','PNP के बारे में','PNP பற்றி','PNP గురించి'],
    ['Leadership','ನಾಯಕತ್ವ','नेतृत्व','தலைமை','నాయకత్వం'],
    ['Manifesto & Policy','ಪ್ರಣಾಳಿಕೆ ಮತ್ತು ನೀತಿ','घोषणापत्र और नीति','தேர்தல் அறிக்கை மற்றும் கொள்கை','మేనిఫెస్టో మరియు విధానం'],
    ['More','ಇನ್ನಷ್ಟು','अधिक','மேலும்','మరిన్ని'],
    ['Newsroom','ಸುದ್ದಿಕೋಣೆ','समाचार कक्ष','செய்தியறை','వార్తా కేంద్రం'],
    ['Events','ಕಾರ್ಯಕ್ರಮಗಳು','कार्यक्रम','நிகழ்வுகள்','కార్యక్రమాలు'],
    ['Get Involved','ಭಾಗವಹಿಸಿ','जुड़ें','பங்கேற்கவும்','పాల్గొనండి'],
    ['Transparency','ಪಾರದರ್ಶಕತೆ','पारदर्शिता','வெளிப்படைத்தன்மை','పారదర్శకత'],
    ['Contact Us','ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ','संपर्क करें','தொடர்பு கொள்ளவும்','మమ్మల్ని సంప్రదించండి'],
    ['Contact us','ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ','संपर्क करें','தொடர்பு கொள்ளவும்','మమ్మల్ని సంప్రదించండి'],
    ['Grievance & Help','ದೂರು ಮತ್ತು ಸಹಾಯ','शिकायत और सहायता','குறைதீர் மற்றும் உதவி','ఫిర్యాదు మరియు సహాయం'],
    ['Join PNP','PNP ಸೇರಿ','PNP से जुड़ें','PNP இல் சேரவும்','PNPలో చేరండి'],
    ['Volunteer','ಸ್ವಯಂಸೇವಕರಾಗಿ','स्वयंसेवक','தன்னார்வலர்','స్వచ్ఛంద సేవకులు'],
    ['Youth & Campus','ಯುವಜನ ಮತ್ತು ಕ್ಯಾಂಪಸ್','युवा और परिसर','இளைஞர் மற்றும் வளாகம்','యువత మరియు క్యాంపస్'],
    ['Join Now','ಈಗಲೇ ಸೇರಿ','अभी जुड़ें','இப்போதே சேரவும்','ఇప్పుడే చేరండి'],
    ['Donate','ದೇಣಿಗೆ ನೀಡಿ','दान करें','நன்கொடை வழங்கவும்','విరాళం ఇవ్వండి'],
    ['Donate Online','ಆನ್‌ಲೈನ್ ದೇಣಿಗೆ','ऑनलाइन दान करें','இணைய நன்கொடை','ఆన్‌లైన్ విరాళం'],
    ['Call Hotline','ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ','हेल्पलाइन पर कॉल करें','உதவி எண்ணை அழைக்கவும்','హెల్ప్‌లైన్‌కు కాల్ చేయండి'],
    ['Login / Sign Up','ಲಾಗಿನ್ / ನೋಂದಣಿ','लॉगिन / पंजीकरण','உள்நுழைவு / பதிவு','లాగిన్ / నమోదు'],
    ['Official Website','ಅಧಿಕೃತ ಜಾಲತಾಣ','आधिकारिक वेबसाइट','அதிகாரப்பூர்வ இணையதளம்','అధికారిక వెబ్‌సైట్'],
    ['Praja Nishchaya Party','ಪ್ರಜಾ ನಿಶ್ಚಯ ಪಾರ್ಟಿ','प्रजा निश्चय पार्टी','பிரஜா நிச்சயா கட்சி','ప్రజా నిశ్చయ పార్టీ'],
    ['Party Hotline:','ಪಕ್ಷದ ಸಹಾಯವಾಣಿ:','पार्टी हेल्पलाइन:','கட்சி உதவி எண்:','పార్టీ హెల్ప్‌లైన్:'],
    ['To be confirmed','ದೃಢೀಕರಣ ಬಾಕಿ','पुष्टि बाकी','உறுதி செய்யப்படவில்லை','నిర్ధారణ కావాలి'],
    ['Official Verification Pending','ಅಧಿಕೃತ ಪರಿಶೀಲನೆ ಬಾಕಿ','आधिकारिक सत्यापन लंबित','அதிகாரப்பூர்வ சரிபார்ப்பு நிலுவையில்','అధికారిక ధృవీకరణ పెండింగ్‌లో ఉంది'],
    ['Search','ಹುಡುಕಿ','खोजें','தேடுக','వెతకండి'],
    ['Explore','ಅನ್ವೇಷಿಸಿ','देखें','ஆராயவும்','అన్వేషించండి'],
    ['Learn More','ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ','और जानें','மேலும் அறிக','మరింత తెలుసుకోండి'],
    ['Read More','ಇನ್ನಷ್ಟು ಓದಿ','और पढ़ें','மேலும் படிக்க','మరింత చదవండి'],
    ['View Details','ವಿವರಗಳನ್ನು ನೋಡಿ','विवरण देखें','விவரங்களைக் காண்க','వివరాలు చూడండి'],
    ['View Profile','ವಿವರ ನೋಡಿ','प्रोफ़ाइल देखें','சுயவிவரத்தைக் காண்க','ప్రొఫైల్ చూడండి'],
    ['Reset Filters','ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ','फ़िल्टर रीसेट करें','வடிகட்டிகளை மீட்டமை','ఫిల్టర్‌లను రీసెట్ చేయండి'],
    ['Latest News','ಇತ್ತೀಚಿನ ಸುದ್ದಿ','ताज़ा समाचार','சமீபத்திய செய்திகள்','తాజా వార్తలు'],
    ['Latest update','ಇತ್ತೀಚಿನ ಮಾಹಿತಿ','नवीनतम अपडेट','சமீபத்திய தகவல்','తాజా సమాచారం'],
    ['View updates','ಮಾಹಿತಿ ನೋಡಿ','अपडेट देखें','தகவல்களைக் காண்க','సమాచారం చూడండి'],
    ['Our Vision','ನಮ್ಮ ದೃಷ್ಟಿಕೋನ','हमारा दृष्टिकोण','எங்கள் தொலைநோக்கு','మా దార్శనికత'],
    ['Party History','ಪಕ್ಷದ ಇತಿಹಾಸ','पार्टी का इतिहास','கட்சியின் வரலாறு','పార్టీ చరిత్ర'],
    ['Privacy Policy','ಗೌಪ್ಯತಾ ನೀತಿ','गोपनीयता नीति','தனியுரிமைக் கொள்கை','గోప్యతా విధానం'],
    ['Terms & Conditions','ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು','नियम और शर्तें','விதிமுறைகள் மற்றும் நிபந்தனைகள்','నిబంధనలు మరియు షరతులు'],
    ['Districts','ಜಿಲ್ಲೆಗಳು','ज़िले','மாவட்டங்கள்','జిల్లాలు'],
    ['Select District','ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ','ज़िला चुनें','மாவட்டத்தைத் தேர்ந்தெடுக்கவும்','జిల్లాను ఎంచుకోండి'],
    ['Explore District','ಜಿಲ್ಲೆ ಅನ್ವೇಷಿಸಿ','ज़िला देखें','மாவட்டத்தை ஆராயவும்','జిల్లాను అన్వేషించండి'],
    ['Upcoming Events','ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳು','आगामी कार्यक्रम','வரவிருக்கும் நிகழ்வுகள்','రాబోయే కార్యక్రమాలు'],
    ['Media Kit','ಮಾಧ್ಯಮ ಕಿಟ್','मीडिया किट','ஊடகத் தொகுப்பு','మీడియా కిట్'],
    ['Corrections Log','ತಿದ್ದುಪಡಿಗಳ ದಾಖಲೆ','सुधार विवरण','திருத்தப் பதிவு','సవరణల నమోదు'],
    ['Suggest a Policy','ನೀತಿಯನ್ನು ಸೂಚಿಸಿ','नीति सुझाएँ','கொள்கையைப் பரிந்துரைக்கவும்','విధానాన్ని సూచించండి'],
    ['Submit Suggestion','ಸಲಹೆ ಸಲ್ಲಿಸಿ','सुझाव भेजें','பரிந்துரையைச் சமர்ப்பிக்கவும்','సూచనను సమర్పించండి'],
    ['Full Name','ಪೂರ್ಣ ಹೆಸರು','पूरा नाम','முழுப் பெயர்','పూర్తి పేరు'],
    ['Email Address','ಇಮೇಲ್ ವಿಳಾಸ','ईमेल पता','மின்னஞ்சல் முகவரி','ఇమెయిల్ చిరునామా'],
    ['Mobile Number','ಮೊಬೈಲ್ ಸಂಖ್ಯೆ','मोबाइल नंबर','கைபேசி எண்','మొబైల్ నంబర్'],
    ['District','ಜಿಲ್ಲೆ','ज़िला','மாவட்டம்','జిల్లా'],
    ['Policy Area','ನೀತಿ ಕ್ಷೇತ್ರ','नीति क्षेत्र','கொள்கைப் பகுதி','విధాన రంగం'],
    ['Your Suggestion','ನಿಮ್ಮ ಸಲಹೆ','आपका सुझाव','உங்கள் பரிந்துரை','మీ సూచన'],
    ['Download PDF','PDF ಡೌನ್‌ಲೋಡ್','PDF डाउनलोड करें','PDF பதிவிறக்கம்','PDF డౌన్‌లోడ్'],
    ['Close','ಮುಚ್ಚಿ','बंद करें','மூடுக','మూసివేయండి']
  ];
  const dictionary = new Map(rows.map(row => [row[0].toLowerCase(), row]));
  const originals = new WeakMap();
  const attributes = new WeakMap();
  let language = 'en';
  try { const saved = localStorage.getItem('pnp-language'); if (languages.includes(saved)) language = saved; } catch {}
  const excluded = 'script,style,noscript,svg,canvas,code,pre,[translate="no"],.language-control';
  function translate(value) {
    const match = value.match(/^(\s*)(.*?)(\s*[→↗›*]?\s*)$/s);
    if (!match) return value;
    const row = dictionary.get(match[2].trim().toLowerCase());
    return row ? match[1] + row[languages.indexOf(language)] + match[3] : value;
  }
  function render() {
    observer.disconnect();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest(excluded)) continue;
      const previous = originals.get(node);
      const source = previous && node.nodeValue === previous.output ? previous.source : node.nodeValue;
      const output = translate(source);
      if (output !== node.nodeValue) node.nodeValue = output;
      originals.set(node, { source, output });
      if (output !== source) node.parentElement.lang = language;
      else if (previous && previous.source !== previous.output) node.parentElement.removeAttribute('lang');
    }
    document.querySelectorAll('[placeholder],[aria-label]').forEach(element => {
      if (element.closest(excluded)) return;
      const record = attributes.get(element) || {};
      for (const attr of ['placeholder','aria-label']) {
        if (!element.hasAttribute(attr)) continue;
        const current = element.getAttribute(attr);
        const old = record[attr];
        const source = old && current === old.output ? old.source : current;
        const output = translate(source);
        if (current !== output) element.setAttribute(attr, output);
        record[attr] = { source, output };
      }
      attributes.set(element, record);
    });
    // Body copy remains English until translated editorial versions are supplied.
    document.documentElement.lang = 'en';
    document.documentElement.dataset.interfaceLanguage = language;
    const select = document.getElementById('languageSelect');
    if (select) select.value = language;
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
  }
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; render(); });
  });
  function init() {
    document.getElementById('languageSelect')?.addEventListener('change', event => {
      if (!languages.includes(event.target.value)) return;
      language = event.target.value;
      try { localStorage.setItem('pnp-language', language); } catch {}
      render();
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
