export type Block =
  | { type: "p"; text: string } // **bold** is supported inside text
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export type InfoSection = { title: string; blocks: Block[] };

export type AllergenInfo = {
  title: string;
  sections: InfoSection[];
  sourceUrl?: string;
};

const SOURCE = "https://www.astmaoallergiforbundet.se";

const EMERGENCY: Block = {
  type: "p",
  text: "**Vid allvarlig reaktion** (andningssvårigheter, svullnad i hals eller ansikte, yrsel eller svimning) ska du använda adrenalinpenna om du har en och ringa **112**.",
};

export const ALLERGEN_INFO: Record<string, AllergenInfo> = {
  "en:onion": {
    title: "Lök",
    sections: [
      {
        title: "Om lök",
        blocks: [
          {
            type: "p",
            text: "Lök är en samlingsnamn på växter i lökslätet (Allium) som används som livsmedel och krydda över hela världen.",
          },
          { type: "heading", text: "Vanliga sorter" },
          {
            type: "list",
            items: [
              "Gul lök (kepalök): Den vanligaste basvaran som blir söt och mjuk när den steks eller koks.",
              "Röd lök: Mildare i smaken och passar bra rå eller inlagd.",
              "Vitlök: Ger stark smak och används i matlagning världen över.",
              "Purjolök och gräslök: Mildare gröna löksorter som används som smaksättare.",
            ],
          },
          { type: "heading", text: "Hälsa och näring" },
          {
            type: "p",
            text: "Lök är rik på vitamin C, B-vitaminer, antioxidanter (som quercetin) och fiber.",
          },
        ],
      },
      {
        title: "Lökallergi",
        blocks: [
          {
            type: "p",
            text: "Lökallergi är en ovanlig födoämnesallergi där immunförsvaret reagerar mot proteiner i lök eller vitlök.",
          },
          {
            type: "p",
            text: "När en person med lökallergi äter lök reagerar immunförsvaret med IgE-antikroppar. Det kan liknas vid andra matallergier, men det är viktigt att skilja på en verklig immunreaktion och vanlig magkänslighet.",
          },
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Lökallergi kan uppkomma som en korsallergi mot **gråbopollen**.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },
  "en:gluten": {
    title: "Gluten",
    sections: [
      {
        title: "Om gluten",
        blocks: [
          {
            type: "p",
            text: "Gluten är ett samlingsnamn för proteiner i vissa spannmål. Det ger deg elasticitet och gör bröd luftigt.",
          },
          { type: "heading", text: "Spannmål som innehåller gluten" },
          {
            type: "list",
            items: [
              "Vete, inklusive dinkel, durum, kamut och bulgur",
              "Råg",
              "Korn (korn används bland annat i malt och öl)",
              "Havre kan innehålla gluten genom smitta från andra sädesslag, om det inte är märkt glutenfritt",
            ],
          },
        ],
      },
      {
        title: "Reaktioner mot gluten",
        blocks: [
          {
            type: "p",
            text: "Det finns tre olika tillstånd som ofta förväxlas: **celiaki**, **vetallergi** och **glutenkänslighet**.",
          },
          {
            type: "list",
            items: [
              "**Celiaki** är en autoimmun sjukdom där gluten skadar tunntarmens slemhinna. Den är livslång och kräver strikt glutenfri kost.",
              "**Vetallergi** är en allergi mot proteiner i vete. Symtomen kan komma snabbt och vara allt från nässelutslag till allvarliga reaktioner.",
              "**Glutenkänslighet** ger magbesvär utan att man har celiaki eller vetallergi. Orsaken är inte helt klarlagd.",
            ],
          },
          {
            type: "p",
            text: "Vid celiaki räcker mycket små mängder för att orsaka skada, även om man inte märker några symtom.",
          },
        ],
      },
      {
        title: "Korsreaktioner",
        blocks: [
          {
            type: "p",
            text: "Den som har celiaki reagerar på gluten från både vete, råg och korn. Vid vetallergi kan man även reagera på andra sädesslag, men det varierar mellan personer. Gräspollen kan ge korsreaktion mot vete hos vissa.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:crustaceans": {
    title: "Kräftdjur",
    sections: [
      {
        title: "Om kräftdjur",
        blocks: [
          {
            type: "p",
            text: "Kräftdjur är vattenlevande djur med skal, till exempel räkor, krabba, hummer och kräftor. De äts över hela världen och finns ofta som ingrediens i buljong, såser och färdigrätter.",
          },
          { type: "heading", text: "Vanliga kräftdjur" },
          {
            type: "list",
            items: [
              "Räkor och scampi",
              "Krabba och krabbfisk (surimi kan innehålla krabbextrakt)",
              "Hummer och havskräfta",
              "Flodkräfta och krill",
            ],
          },
        ],
      },
      {
        title: "Allergi mot kräftdjur",
        blocks: [
          {
            type: "p",
            text: "Allergin är vanlig hos vuxna och kan vara livslång. Immunförsvaret reagerar oftast mot proteinet **tropomyosin** i muskelvävnaden.",
          },
          {
            type: "p",
            text: "Symtom kan vara klåda i munnen, nässelutslag, svullnad, magont och kräkningar. Reaktionerna kan bli allvarliga och även ske av mycket små mängder, till exempel ånga från tillagning.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Tropomyosin finns även i blötdjur, till exempel musslor och bläckfisk, så korsreaktioner mellan kräftdjur och **blötdjur** är vanliga. Det finns också likheter med **dammkvalster** och **kackerlackor**, vilket kan ge korsreaktion hos vissa.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:eggs": {
    title: "Ägg",
    sections: [
      {
        title: "Om ägg",
        blocks: [
          {
            type: "p",
            text: "Ägg är en vanlig ingrediens i bakverk, såser, pasta, glass och många färdigrätter. Hönsägg är vanligast, men allergin gäller även ägg från andra fåglar.",
          },
          { type: "heading", text: "Äggprodukter att se upp med" },
          {
            type: "list",
            items: [
              "Majonnäs, bearnaise och hollandaise",
              "Bakverk, kakor och pannkakor",
              "Pasta och nudlar",
              "Marsipan, marängr och vissa glasstyper",
              "Lysozym (E1105) och albumin, som kan utvinnas ur ägg",
            ],
          },
        ],
      },
      {
        title: "Äggallergi",
        blocks: [
          {
            type: "p",
            text: "Äggallergi är en av de vanligaste matallergierna hos små barn. Många växer ifrån den under skolåldern, men den kan också bestå.",
          },
          {
            type: "p",
            text: "Allergin kan riktas mot proteiner i äggvitan, äggulan eller båda. Symtom är bland annat eksem, nässelutslag, magbesvär och i vissa fall andningsbesvär.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Den som är allergisk mot hönsägg kan även reagera på ägg från **and, gås och kalkon**. I sällsynta fall finns en koppling mellan äggallergi och allergi mot fjäderfäkött eller fjädrar, så kallat **ägg-fågel-syndrom**.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:fish": {
    title: "Fisk",
    sections: [
      {
        title: "Om fisk",
        blocks: [
          {
            type: "p",
            text: "Fisk är en viktig källa till protein, D-vitamin, jod och omega-3. Allergi gäller både färsk fisk och fisk som ingrediens i andra produkter.",
          },
          { type: "heading", text: "Där fisk kan gömma sig" },
          {
            type: "list",
            items: [
              "Worcestersås och caesardressing (innehåller ansjovis)",
              "Fiskbuljong och fiskfond",
              "Surimi och fiskbullar",
              "Kaviar och rom",
              "Gelatin och omega-3-tillskott från fisk",
            ],
          },
        ],
      },
      {
        title: "Fiskallergi",
        blocks: [
          {
            type: "p",
            text: "Fiskallergi är ofta livslång. Den vanligaste orsaken är proteinet **parvalbumin**, som finns i fiskens muskler.",
          },
          {
            type: "p",
            text: "Symtom kan vara klåda och svullnad i munnen, nässelutslag, magbesvär och andningsproblem. Även ånga vid tillagning kan utlösa reaktion hos känsliga personer.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Parvalbumin liknar varandra mellan olika fiskarter, så många som är allergiska mot en art reagerar även på andra. Vissa tål dock vissa arter. Fiskallergi är **inte** samma sak som skaldjursallergi och innebär normalt ingen korsreaktion mot kräftdjur eller blötdjur.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:peanuts": {
    title: "Jordnötter",
    sections: [
      {
        title: "Om jordnötter",
        blocks: [
          {
            type: "p",
            text: "Jordnötter är botaniskt sett baljväxter och inte nötter. De växer under jord och används i bland annat snacks, godis, bakverk, såser och asiatisk mat.",
          },
          { type: "heading", text: "Vanliga produkter" },
          {
            type: "list",
            items: [
              "Jordnötssmör och jordnötsolja",
              "Choklad, godis och müsli",
              "Sataysås och wokrätter",
              "Bakverk och glass",
            ],
          },
        ],
      },
      {
        title: "Jordnötsallergi",
        blocks: [
          {
            type: "p",
            text: "Jordnötsallergi är en av de vanligaste orsakerna till allvarliga matallergiska reaktioner. Den är oftast livslång, även om en mindre andel barn växer ifrån den.",
          },
          {
            type: "p",
            text: "Mycket små mängder kan räcka för en reaktion. Symtom kan vara nässelutslag, svullnad, kräkningar, andningsbesvär och blodtrycksfall.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Jordnöt är nära släkt med **lupin**, och många som är allergiska mot jordnötter reagerar även på lupin. Vissa har dessutom allergi mot **trädnötter**, men det är en separat allergi som kan förekomma samtidigt. Korsreaktion mot **soja** och andra baljväxter förekommer ibland men är oftast mild.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:soybeans": {
    title: "Sojabönor",
    sections: [
      {
        title: "Om soja",
        blocks: [
          {
            type: "p",
            text: "Soja är en baljväxt som används i många livsmedel, både som huvudingrediens och som tillsats. Den är vanlig i vegetariska produkter.",
          },
          { type: "heading", text: "Sojaprodukter" },
          {
            type: "list",
            items: [
              "Sojasås, tofu, tempeh och miso",
              "Sojadryck, sojayoghurt och sojagrädde",
              "Sojalecitin (E322), som finns i choklad och bakverk",
              "Vegetabiliskt protein i färdigmat och korv",
            ],
          },
        ],
      },
      {
        title: "Sojaallergi",
        blocks: [
          {
            type: "p",
            text: "Sojaallergi är vanligast hos små barn och växer ofta bort under uppväxten. Symtom kan vara eksem, nässelutslag, magbesvär och ibland andningsbesvär.",
          },
          {
            type: "p",
            text: "Raffinerad sojaolja och sojalecitin innehåller ofta mycket lite protein och tolereras av många, men det varierar. Fråga din läkare vad som gäller för dig.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Soja är släkt med jordnöt, lupin och andra baljväxter, men korsreaktioner är inte vanliga. Den som är **björkpollenallergisk** kan få lätta besvär i munnen av rå, mindre bearbetad soja.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:milk": {
    title: "Mjölk",
    sections: [
      {
        title: "Om mjölk",
        blocks: [
          {
            type: "p",
            text: "Mjölk och mjölkprodukter är vanliga i kosten och finns som ingrediens i många livsmedel som man inte alltid tänker på.",
          },
          { type: "heading", text: "Mjölkprodukter" },
          {
            type: "list",
            items: [
              "Mjölk, grädde, smör, ost, yoghurt och fil",
              "Mjölkpulver och vassle",
              "Kasein och kaseinat, som finns i bland annat korv och vegetariska ostar",
              "Choklad, glass, bakverk och såser",
            ],
          },
        ],
      },
      {
        title: "Mjölkallergi",
        blocks: [
          {
            type: "p",
            text: "Mjölkproteinallergi är en av de vanligaste matallergierna hos barn och växer ofta bort. Immunförsvaret reagerar på proteinerna i mjölken, till exempel kasein och vassleprotein.",
          },
          {
            type: "p",
            text: "Det är **inte** samma sak som **laktosintolerans**. Laktosintolerans innebär att kroppen har svårt att bryta ner mjölksocker, vilket ger magbesvär men ingen allergisk reaktion.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Den som är allergisk mot komjölk reagerar ofta även på mjölk från **get och får**, eftersom proteinerna liknar varandra. Mjölk från **sto och kamel** tolereras av en del men inte alla. En del barn reagerar även på **nötkött**.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:nuts": {
    title: "Nötter",
    sections: [
      {
        title: "Om nötter",
        blocks: [
          {
            type: "p",
            text: "Med nötter menas här trädnötter, alltså nötter som växer på träd. De används i bakverk, godis, müsli, pesto och som snacks.",
          },
          { type: "heading", text: "Trädnötter som räknas som allergen" },
          {
            type: "list",
            items: [
              "Mandel, hasselnöt och valnöt",
              "Cashewnöt, pekannöt och paranöt",
              "Pistage och macadamianöt",
              "Queenslandnöt",
            ],
          },
          {
            type: "p",
            text: "Jordnötter är en separat allergen och räknas inte hit.",
          },
        ],
      },
      {
        title: "Nötallergi",
        blocks: [
          {
            type: "p",
            text: "Nötallergi är vanligt och ofta livslångt. Man kan vara allergisk mot en eller flera sorters nötter. Symtom varierar från klåda i munnen och nässelutslag till allvarliga reaktioner.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Vissa nötter är nära släkt, till exempel **cashew och pistage** samt **valnöt och pekannöt**, och ger ofta korsreaktion. Många som är **björkpollenallergiska** får lätta besvär i munnen av **hasselnöt**. Det är oftast mildare än en äkta nötallergi, men det kan vara svårt att skilja på dem utan utredning.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:celery": {
    title: "Selleri",
    sections: [
      {
        title: "Om selleri",
        blocks: [
          {
            type: "p",
            text: "Selleri används både som grönsak och krydda. Man kan äta stjälken, bladen och roten (rotselleri) samt fröna.",
          },
          { type: "heading", text: "Där selleri finns" },
          {
            type: "list",
            items: [
              "Salladsblandningar och råkost",
              "Buljong, soppor och kryddblandningar",
              "Sellerisalt och sellerifrön",
              "Såser, korv och färdigrätter",
            ],
          },
        ],
      },
      {
        title: "Sellerallergi",
        blocks: [
          {
            type: "p",
            text: "Sellerallergi är relativt vanlig i Europa. Allergenerna tål ofta tillagning, så även kokt selleri och kryddblandningar kan ge reaktion.",
          },
          {
            type: "p",
            text: "Symtom kan vara klåda i munnen, nässelutslag och svullnad, men även allvarliga reaktioner förekommer.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Selleriallergi kan hänga ihop med allergi mot **björkpollen** och **gråbopollen**, ibland kallat **björk-gråbo-selleri-kryddsyndrom**. Då kan man även reagera på **morot, persilja, dill, fänkål, koriander** och andra kryddor i samma växtfamilj.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:mustard": {
    title: "Senap",
    sections: [
      {
        title: "Om senap",
        blocks: [
          {
            type: "p",
            text: "Senap görs av fröna från senapsväxter och används som krydda, i såser och som ingrediens i många livsmedel.",
          },
          { type: "heading", text: "Där senap finns" },
          {
            type: "list",
            items: [
              "Färdig senap, dressingar och vinägrettar",
              "Majonnäs, ketchup och grillsåser",
              "Kryddblandningar och marinader",
              "Korv, inlagda grönsaker och färdigrätter",
            ],
          },
        ],
      },
      {
        title: "Senapsallergi",
        blocks: [
          {
            type: "p",
            text: "Senapsallergi är ovanligare i Norden än i till exempel Frankrike, men kan ge kraftiga reaktioner även av små mängder. Allergenerna tål värme.",
          },
          {
            type: "p",
            text: "Symtom kan vara klåda och svullnad i munnen, nässelutslag, magbesvär och andningsbesvär.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Senap tillhör korsblommiga växter. Korsreaktion kan förekomma mot **raps** och andra släktingar som **kål, broccoli och rättika**, men det är inte vanligt. Det kan även finnas koppling till **pollenallergi**.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:sesame-seeds": {
    title: "Sesamfrön",
    sections: [
      {
        title: "Om sesam",
        blocks: [
          {
            type: "p",
            text: "Sesamfrön används i bröd, bakverk och i många kök runt om i världen. Fröna kan användas hela, malda eller som olja och pasta.",
          },
          { type: "heading", text: "Där sesam finns" },
          {
            type: "list",
            items: [
              "Bröd, hamburgerbröd och knäckebröd",
              "Tahini, hummus och halva",
              "Sesamolja och asiatiska såser",
              "Müsli, snacks och kryddblandningar som dukkah och zaatar",
            ],
          },
        ],
      },
      {
        title: "Sesamallergi",
        blocks: [
          {
            type: "p",
            text: "Sesamallergi blir allt vanligare och kan ge allvarliga reaktioner redan av små mängder. Den är ofta långvarig.",
          },
          {
            type: "p",
            text: "Symtom kan vara nässelutslag, svullnad, kräkningar och andningsbesvär.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Många med sesamallergi har även allergi mot **nötter** och **jordnötter**, ibland som separata allergier. Korsreaktion mot **vallmofrön** och andra frön har beskrivits men är ovanligare.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:sulphur-dioxide-and-sulphites": {
    title: "Sulfiter",
    sections: [
      {
        title: "Om sulfiter",
        blocks: [
          {
            type: "p",
            text: "Sulfiter är konserveringsmedel som hindrar att livsmedel mörknar och förstörs. De används även i vin och torkad frukt. På förpackningar kan de stå som svaveldioxid eller E220–E228.",
          },
          { type: "heading", text: "Där sulfiter finns" },
          {
            type: "list",
            items: [
              "Vin, cider och öl",
              "Torkad frukt, till exempel aprikoser och russin",
              "Färdiga potatisprodukter",
              "Saft, sylt och inlagda grönsaker",
            ],
          },
        ],
      },
      {
        title: "Känslighet för sulfiter",
        blocks: [
          {
            type: "p",
            text: "Reaktioner mot sulfiter är oftast en **överkänslighet** och inte en klassisk allergi. De är vanligast hos personer med **astma**, där sulfiter kan utlösa andningsbesvär.",
          },
          {
            type: "p",
            text: "Symtom kan vara hosta, väsande andning, nästäppa, nässelutslag och magbesvär. Allvarliga reaktioner förekommer, framför allt hos personer med svår astma.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsreaktioner",
        blocks: [
          {
            type: "p",
            text: "Det finns inga kända korsallergier eftersom det inte rör sig om ett protein. Känsligheten gäller alla föreningar som frigör svaveldioxid, och gränsen för vad som ger besvär varierar mycket mellan personer. I EU ska sulfiter anges på förpackningen när halten överstiger 10 mg/kg eller 10 mg/liter.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:lupin": {
    title: "Lupin",
    sections: [
      {
        title: "Om lupin",
        blocks: [
          {
            type: "p",
            text: "Lupin är en baljväxt vars frön används som mjöl, protein och i vegetariska livsmedel. Det är vanligare i södra Europa men blir allt vanligare i Norden.",
          },
          { type: "heading", text: "Där lupin finns" },
          {
            type: "list",
            items: [
              "Glutenfria och proteinrika bakverk och bröd",
              "Pasta och pizzabottnar",
              "Vegetariska produkter som korv och färs",
              "Lupinbönor som tilltugg",
            ],
          },
        ],
      },
      {
        title: "Lupinallergi",
        blocks: [
          {
            type: "p",
            text: "Lupinallergi kan ge allt från lindriga symtom i munnen till nässelutslag, magbesvär och allvarliga reaktioner med andningsbesvär.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Lupin är nära släkt med **jordnötter**, och många som är allergiska mot jordnötter reagerar även på lupin. Ibland uppstår lupinallergi först efter att man har blivit sensibiliserad via jordnötter. Det kan också finnas korsreaktion mot andra **baljväxter** som soja, ärtor och linser, men det är mindre vanligt.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },

  "en:molluscs": {
    title: "Blötdjur",
    sections: [
      {
        title: "Om blötdjur",
        blocks: [
          {
            type: "p",
            text: "Blötdjur är en grupp mjuka havsdjur, ofta med skal. Många äts som delikatesser och ingår i fiskbuljonger och färdiga rätter.",
          },
          { type: "heading", text: "Vanliga blötdjur" },
          {
            type: "list",
            items: [
              "Musslor, ostron och pilgrimsmusslor",
              "Bläckfisk, tioarmad bläckfisk (sjökatt) och calamari",
              "Snäckor och sniglar, till exempel vinbergssnäcka",
              "Ostronsås och skaldjursbuljong",
            ],
          },
        ],
      },
      {
        title: "Allergi mot blötdjur",
        blocks: [
          {
            type: "p",
            text: "Allergin är ofta livslång. Precis som vid kräftdjur är proteinet **tropomyosin** en vanlig orsak, men det finns även andra allergen som är specifika för blötdjur.",
          },
          {
            type: "p",
            text: "Symtom kan vara klåda, nässelutslag, svullnad, magbesvär och andningsproblem. Ånga vid tillagning kan räcka för att utlösa en reaktion.",
          },
          EMERGENCY,
        ],
      },
      {
        title: "Korsallergier",
        blocks: [
          {
            type: "p",
            text: "Korsreaktion mot **kräftdjur** är vanligt eftersom tropomyosin liknar varandra. Det kan även finnas korsreaktion mot **dammkvalster**. Många som är allergiska mot blötdjur kan äta fisk, eftersom fisk har andra allergen, men det bör utredas individuellt.",
          },
        ],
      },
    ],
    sourceUrl: SOURCE,
  },
};
