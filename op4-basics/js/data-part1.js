/**
 * OP4 basics – Obecné principy počítačových sítí
 * Část 1: Témata 01–09 a Slovníček pojmů (část 1: 802.1Q + A–M)
 */
(function (global) {
  'use strict';

  global.__OP4_DATA_PART1__ = {
    topics: [
      // =========================================================================
      // TÉMA 1: Přepojování paketů vs. přepojování okruhů
      // =========================================================================
      {
        id: "switching",
        number: 1,
        moduleId: "basics-topologies",
        mandatory: false,
        title: "Přepojování paketů vs. přepojování okruhů",
        shortTitle: "Přepojování sítí",
        subtitle: "Jak data putují sítí: vyhrazená telefonní linka versus chytré dělení na pakety.",
        cardSummary: "Vyhrazená linka (okruhy) vs. sdílená síť malých bloků dat s objížďkou při poruše (pakety).",
        difficulty: "Základy",
        accentColor: "#38bdf8",
        tags: ["Počítačová síť", "Circuit Switching", "Packet Switching", "Paket", "Redundance", "Latence"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/switching.mp4",
          poster: "media/posters/switching.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Přepojování okruhů (0:00)", time: 0 },
            { label: "2. Přepojování paketů (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Přepojování okruhů – „Přepojování okruhů vyhradí jedinou trasu, takže výpadek uzlu hovor přeruší.“\n0:07–0:13: Přepojování paketů – „Přepojování paketů rozdělí data na části, které při poruše najdou náhradní cestu.“"
        },
        animationType: "switching",
        labType: "switching-sim",
        takeaways: [
          "Počítačová síť propojuje minimálně 2 koncová zařízení za účelem přenosu dat a sdílení prostředků (tiskárny, servery, internet).",
          "Přepojování okruhů (Circuit Switching) vyhradí celou fyzickou cestu předem – je stabilní pro hlas, ale plýtvá kapacitou a při výpadku uzlu spojení okamžitě padá.",
          "Přepojování paketů (Packet Switching) rozseká zprávu na malé pakety s adresou cíle; linku sdílí více uživatelů a při výpadku uzlu najdou pakety objížďku.",
          "Moderní Internet funguje výhradně na principu přepojování paketů, kde každý paket nese v hlavičce zdrojovou a cílovou IP adresu."
        ],
        principle: {
          problem: "Jak dopravit data od jednoho počítače ke druhému přes desítky měst tak, aby síť nezkolabovala při přetížení ani při přetržení jediného kabelu?",
          explanation: [
            "Počítačová síť je systém vzájemně propojených koncových zařízení (počítače, telefony, servery) a síťových prvků (switche, routery), který umožňuje spolehlivou výměnu dat. Historicky první rozsáhlé komunikační sítě byly telefonní a fungovaly na principu přepojování okruhů (Circuit Switching). Než jste mohli mluvit, ústředny mezi vámi fyzicky či časově vyhradily nepřerušený komunikační kanál po celou dobu hovoru.",
            "Vyhrazený okruh má obrovskou nevýhodu při přenosu počítačových dat: když si prohlížíte webovou stránku a 30 sekund ji jen čtete, vyhrazená linka leží ladem, přesto ji nikdo jiný nesmí použít. Navíc stačí výpadek jediné ústředny na trase a celé spojení se bez náhrady přeruší.",
            "Proto vzniklo pro potřeby sítě ARPANET a dnešního Internetu přepojování paketů (Packet Switching). Odesílaný soubor nebo zpráva se rozdělí na malé bloky zvané pakety (typicky do 1500 bajtů). Každý paket dostane hlavičku se zdrojovou a cílovou adresou i pořadovým číslem a do sítě vyráží samostatně.",
            "Díky přepojování paketů mohou jedním optickým kabelem současně proudit pakety ze stahování hry, videohovoru i e-mailu různých uživatelů (statistické multiplexování). Pokud některý router na trase vypadne, sousední routery pošlou následující pakety náhradní cestou a příjemce je z pořadových čísel opět správně poskládá."
          ],
          steps: [
            {
              step: "1. Rozdělení dat (segmentace)",
              detail: "Odesílací stanice PC-A rozdělí velký soubor (např. fotografii o velikosti 3 MB) na tisíce malých částí, aby jeden dlouhý přenos nezablokoval síť ostatním."
            },
            {
              step: "2. Přidání hlaviček",
              detail: "Každý kus dat dostane hlavičku se zdrojovou IP adresou (PC-A), cílovou IP adresou (PC-B) a pořadovým číslem paketu."
            },
            {
              step: "3. Sdílený přenos přes uzly",
              detail: "Pakety vstupují na sdílenou linku postupně. Routery (R1, R2, R3) čtou cílovou adresu a okamžitě předávají paket nejvhodnějším směrem."
            },
            {
              step: "4. Dynamická objížďka při poruše",
              detail: "Pokud uzel R2 přestane odpovídat, směrovací protokoly přepočítají trasu a další pakety jsou přesměrovány přes záložní uzel R4."
            },
            {
              step: "5. Sestavení na straně příjemce",
              detail: "PC-B přijme všechny pakety, podle pořadových čísel je seřadí (i kdyby některý dorazil jinou cestou později) a složí původní fotografii."
            }
          ],
          analogy: "Přepojování okruhů je jako prezidentská kolona – policie uzavře celou dálnici z Prahy do Brna jen pro jedno auto, nikdo jiný tam nesmí a při zácpě se kolona zastaví. Přepojování paketů je jako běžná silniční doprava nákladních aut: na silnici jedou auta různých firem najednou, každé má na dveřích adresu cíle a při uzavírce na D1 je navigace svede přes objížďku.",
          comparisonTable: {
            headers: ["Parametr", "Přepojování okruhů (Circuit)", "Přepojování paketů (Packet)"],
            rows: [
              ["Vyhrazení cesty", "Ano, pevně před začátkem komunikace", "Ne, trasa se volí pro každý paket zvlášť"],
              ["Využití kapacity linky", "Nízké (při tichu linka zahálí)", "Vysoké (linku sdílí mnoho uživatelů)"],
              ["Chování při výpadku uzlu", "Spojení okamžitě spadne", "Pakety se automaticky přesměrují jinudy"],
              ["Garantované zpoždění", "Konstantní a předvídatelné", "Může kolísat (jitter) při zahlcení sítě"],
              ["Typické použití", "Klasická pevná telefonie (PSTN)", "Internet, LAN, Wi-Fi, VoIP, web"]
            ]
          },
          watchOut: "Začátečníci se často mylně domnívají, že všechny pakety jednoho spojení musí vždy letět naprosto stejnou fyzickou trasou a dorazit ve stejném pořadí. Ve skutečnosti může paket #2 předběhnout paket #1 po rychlejší objížďce – správné seřazení dat zajišťuje až transportní protokol TCP na cílovém počítači."
        },
        example: {
          scenarioTitle: "Sledování cesty paketů přes uzly Internetu (traceroute)",
          scenarioText: "Pomocí příkazu tracert (Windows) nebo traceroute (Linux/macOS) si můžeme v praxi vypsat všechny směrovače (uzly), přes které putují naše pakety k cílovému serveru. Každý řádek představuje jeden „skok“ (hop) v paketové síti.",
          codeBlocks: [
            {
              label: "Windows CMD / PowerShell – sledování trasy paketů",
              lang: "bash",
              code: "C:\\Users\\Admin> tracert 1.1.1.1\n\nVýpis trasy k 1.1.1.1 s nejvýše 30 směrováními:\n  1     1 ms     1 ms     1 ms  192.168.10.1       (Lokální brána / Router)\n  2     4 ms     5 ms     4 ms  10.200.0.1         (Uzel poskytovatele ISP)\n  3     9 ms     8 ms     9 ms  nix-cz-gw.isp.cz   (Český uzel NIX.CZ)\n  4    11 ms    10 ms    11 ms  one.one.one.one    [1.1.1.1]"
            },
            {
              label: "Linux / macOS – zjištění změny trasy při výpadku uzlu 2",
              lang: "bash",
              code: "$ traceroute -n 1.1.1.1\n 1  192.168.10.1  1.12 ms  1.05 ms  0.98 ms\n 2  10.200.4.254  6.40 ms  6.31 ms  6.29 ms  # Záložní linka ISP!\n 3  195.47.235.1  10.8 ms  10.7 ms  10.9 ms\n 4  1.1.1.1       11.4 ms  11.2 ms  11.3 ms"
            }
          ],
          practicalTip: "Pokud se u jednoho uzlu ve výpisu objeví tři hvězdičky (* * *), nemusí to hned znamenat výpadek trasy – některé firewally jen z bezpečnostních důvodů neodpovídají na testovací pakety, ale provoz dál směrují."
        },
        quiz: [
          {
            question: "Co se stane při přepojování paketů, pokud uprostřed stahování velkého souboru náhle vypadne jeden ze směrovačů na trase?",
            options: [
              "Celé spojení se trvale přeruší a přenos musí začít od nuly na nové lince",
              "Routery dynamicky přesměrují další pakety po záložní trase a spojení pokračuje",
              "Síťová karta přepne počítač do režimu telefonního okruhu",
              "Zbývající pakety se automaticky zmenší na polovinu a projdou poškozeným uzlem"
            ],
            correctIndex: 1,
            explanation: "Hlavní výhodou přepojování paketů je odolnost proti výpadkům (redundance): směrovače najdou náhradní cestu a pakety se cílovému počítači doručí jinudy."
          },
          {
            question: "Jaká je hlavní nevýhoda přepojování okruhů (Circuit Switching) při přenosu běžného webového provozu?",
            options: [
              "Vyhrazená linka plýtvá kapacitou v době, kdy uživatel nic nestahuje (ticho na lince)",
              "Pakety přicházejí v náhodném pořadí a nelze je složit",
              "Okruh nedokáže přenést lidský hlas v reálném čase",
              "Každý bajt musí být před odesláním ručně potvrzen uživatelem"
            ],
            correctIndex: 0,
            explanation: "U přepojování okruhů je celá kapacita kanálu rezervovaná pouze pro jedno spojení, takže v přestávkách mezi kliknutími nikdo jiný nemůže linku využít."
          },
          {
            question: "Který údaj MUSÍ nést hlavička každého paketu, aby jej směrovače dokázaly doručit cílovému počítači?",
            options: [
              "Název operačního systému příjemce",
              "Typ použitého monitoru a rozlišení",
              "Cílovou (a zdrojovou) síťovou adresu",
              "Heslo do Wi-Fi sítě odesílatele"
            ],
            correctIndex: 2,
            explanation: "Každý paket putuje sítí samostatně, proto musí v hlavičce obsahovat cílovou adresu (v Internetu IP adresu), podle které jej routery směrují."
          }
        ]
      },

      // =========================================================================
      // TÉMA 2: Geografické dělení sítí (PAN, LAN, MAN, WAN) a Topologie sítí
      // =========================================================================
      {
        id: "topologies-lan-wan",
        number: 2,
        moduleId: "basics-topologies",
        mandatory: true,
        title: "Geografické dělení sítí (PAN–WAN) a topologie",
        shortTitle: "PAN–WAN a topologie",
        subtitle: "Od osobního Bluetoothu po globální WAN a rozdíl mezi fyzickou a logickou topologií.",
        cardSummary: "Rozsah sítí od PAN po WAN a fyzické i logické uspořádání (Bus, Ring, Star, Mesh, SPOF).",
        difficulty: "Základy",
        accentColor: "#22d3ee",
        tags: ["PAN / LAN / MAN / WAN", "Fyzická topologie", "Logická topologie", "Hvězda (Star)", "Mesh", "SPOF"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/topologies-lan-wan.mp4",
          poster: "media/posters/topologies-lan-wan.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Geografické dělení LAN–WAN (0:00)", time: 0 },
            { label: "2. Topologie sítí (0:07)", time: 7.0 }
          ],
          transcript: "0:00–0:07: Geografické dělení (LAN–WAN) – „Sítě dělíme podle velikosti na lokální LAN, metropolitní MAN a celosvětovou WAN.“\n0:07–0:13: Topologie sítí – „Porucha sběrnice odpojí všechny, kdežto hvězda a Mesh udrží síť v chodu.“"
        },
        animationType: "topologies",
        labType: "topology-explorer",
        takeaways: [
          "Podle rozlohy dělíme sítě na PAN (osobní, do 10 m), LAN (místní – domácnost, kancelář, kampus), MAN (metropolitní – město) a WAN (rozlehlá – státy, Internet).",
          "Fyzická topologie popisuje reálné uložení kabelů a prvků; logická topologie popisuje, jakou cestou po síti skutečně proudí data.",
          "Dnešní LAN sítě používají téměř výhradně fyzickou hvězdu (Star) se switchem uprostřed – výpadek jednoho kabelu neovlivní ostatní stanice.",
          "Pro vysokou spolehlivost páteří se používá topologie Mesh (každý s každým), kde počet spojů pro n uzlů spočítáme jako n·(n−1)/2."
        ],
        principle: {
          problem: "Jak navrhnout rozvržení kabelů a spojů v budově, městě i mezi pobočkami tak, aby bylo cenově únosné, rychlé a odolné proti přerušení?",
          explanation: [
            "Sítě nejprve rozdělujeme podle geografického rozsahu a správy. Nejmenší je PAN (Personal Area Network) – osobní síť kolem jednoho člověka s dosahem jednotek metrů (bezdrátová sluchátka přes Bluetooth, chytré hodinky, USB). Následuje LAN (Local Area Network), místní síť v rámci domácnosti, kanceláře nebo firmy pod jednotnou správou s vysokou přenosovou rychlostí (1 Gb/s a více).",
            "Pokud propojíme více lokálních sítí v rámci města vysokorychlostní optickou infrastrukturou, hovoříme o MAN (Metropolitan Area Network). Největší kategorií je WAN (Wide Area Network) – rozlehlá síť spojující města, státy a kontinenty pomocí pronajatých linek operátorů a podmořských kabelů; největší WAN sítí světa je samotný Internet.",
            "Topologie sítě určuje její geometrické a funkční uspořádání. Zásadní je rozlišovat fyzickou topologii (kudy reálně vedou kabely ve zdech a lištách) a logickou topologii (jakým způsobem si uzly předávají signál a přístup k médiu). Například starší síť Token Ring byla fyzicky zapojena do hvězdy, ale logicky data obíhala v uzavřeném kruhu.",
            "Historická sběrnice (BUS) využívala jediný koaxiální kabel zakončený terminátory – byla levná, ale jediný přerušený konektor shodil celou síť. Dnešním standardem v budovách je hvězda (STAR) s centrálním switchem (jediným kritickým bodem selhání je pak samotný switch – tzv. Single Point of Failure). Kritické páteřní sítě proto využívají částečný nebo úplný MESH a v praxi se v budovách kombinuje hvězda do stromové či hybridní topologie."
          ],
          steps: [
            {
              step: "1. Sběrnice (Bus)",
              detail: "Všechna zařízení sdílí jeden hlavní kabel. Signál se šíří oběma směry a na koncích jej pohlcují odporové terminátory (50 Ω). Dnes se v LAN nepoužívá."
            },
            {
              step: "2. Kruh (Ring)",
              detail: "Uzly jsou zapojeny do uzavřené smyčky a data putují jedním směrem pomocí předávaného pověření (Token). Optické MAN sítě dodnes používají dvojitý samoopravný kruh."
            },
            {
              step: "3. Hvězda (Star)",
              detail: "Každý počítač má vlastní kabel do centrálního switche. Výpadek jedné přípojky neohrozí zbytek sítě, snadná je i diagnostika."
            },
            {
              step: "4. Plně/částečně propojená síť (Mesh)",
              detail: "Routery jsou propojeny křížovými záložními cestami. Full Mesh spojuje každý uzel s každým, Partial Mesh chrání jen klíčové směry."
            },
            {
              step: "5. Hybridní a stromová topologie",
              detail: "Podniková či kampusová síť má typicky jádrový switch (Core), na který jsou do hvězdy připojeny switche jednotlivých pater a oddělení (Access)."
            }
          ],
          analogy: "Topologie hvězdy je jako letecká doprava přes jeden centrální přestupní uzel (hub) – výpadek jedné regionální linky neovlivní ostatní spoje, ale výpadek centrálního letiště (SPOF) zastaví celou síť. Topologie Mesh je jako parta přátel, kde má každý telefonní číslo na každého přímo – i když jednomu vypadne linka, zpráva dorazí přes ostatní.",
          comparisonTable: {
            headers: ["Topologie", "Odolnost proti výpadku kabelu", "Náklady na kabeláž", "Hlavní nevýhoda / SPOF"],
            rows: [
              ["Sběrnice (Bus)", "Velmi nízká (spadne celá síť)", "Nejnižší", "Kolize a jediný přerušený kabel zastaví provoz"],
              ["Kruh (Ring)", "Nízká (u jednoduchého kruhu)", "Střední", "Přidání nového uzlu krátce přeruší smyčku"],
              ["Hvězda (Star)", "Vysoká (vypadne jen 1 stanice)", "Střední až vyšší", "Centrální switch je Single Point of Failure"],
              ["Plný Mesh", "Maximální (mnoho záložních cest)", "Extrémně vysoké", "Počet kabelů roste kvadraticky: n·(n−1)/2"]
            ]
          },
          watchOut: "Nezaměňujte bezdrátovou LAN (WLAN / Wi-Fi) za WAN! Písmeno W v WLAN znamená Wireless (bezdrátová lokální síť v budově), kdežto WAN znamená Wide Area Network (rozlehlá síť spojující například Prahu a Brno). Stejně tak si pamatujte, že u Ethernetu se switchem je fyzická topologie hvězda, ale logicky jde o vyhrazené spoje bod-bod (Point-to-Point) mezi stanicí a switchem."
        },
        example: {
          scenarioTitle: "Návrh topologie firemního kampusu a výpočet spojů pro Full Mesh",
          scenarioText: "Při návrhu propojení 4 firemních serveroven záložní optikou chceme znát přesný počet nutných spojů pro Full Mesh, abychom nepřekročili rozpočet. Pro koncová pracoviště ale nasadíme ekonomickou rozšířenou hvězdu (strom).",
          codeBlocks: [
            {
              label: "Výpočet počtu kabelů pro Full Mesh: vzorec n * (n - 1) / 2",
              lang: "text",
              code: "Počet uzlů n = 4 serverovny:\n  Spoje = 4 * (4 - 1) / 2 = 6 optických linek\n\nPočet uzlů n = 10 budov:\n  Spoje = 10 * (10 - 1) / 2 = 45 optických linek (drahé -> použijeme Partial Mesh!)\n\nPro porovnání Hvězda (Star) pro 24 PC v jednom patře:\n  Počet kabelů = 24 (každý kabel do 24portového switche)"
            },
            {
              label: "Typická hybridní (stromová) topologie budovy v ASCII schématu",
              lang: "text",
              code: "         [ Internet / ISP (WAN) ]\n                    |\n           [ Hraniční Router ]\n                    |\n         [ Jádrový Switch (Core) ]\n            /                 \\\n  [ Switch Patro 1 ]   [ Switch Patro 2 ]\n     /     |     \\         /     |     \\\n   PC1    PC2    PC3     PC4    PC5    PC6"
            }
          ],
          practicalTip: "Při návrhu strukturované kabeláže v budově vždy dodržujte maximální délku metalického UTP/STP kabelu 100 metrů (90 m pevný rozvod ve zdi + 10 m patch kabely). Pro delší spoje mezi patry či budovami použijte optické vlákno."
        },
        quiz: [
          {
            question: "Která kategorie sítě nejlépe popisuje propojení tří poboček jedné firmy v Praze, Brně a Ostravě přes pronajaté linky operátora?",
            options: [
              "PAN (Personal Area Network)",
              "WLAN (Wireless Local Area Network)",
              "WAN (Wide Area Network)",
              "CAN (Campus Area Network)"
            ],
            correctIndex: 2,
            explanation: "Propojení vzdálených měst a lokalit přes infrastrukturu poskytovatelů telekomunikací je klasická rozlehlá síť WAN."
          },
          {
            question: "Kolik přímých kabelových spojů potřebujete pro vytvoření plně propojené topologie (Full Mesh) mezi 6 routery?",
            options: [
              "6 spojů",
              "12 spojů",
              "30 spojů",
              "15 spojů"
            ],
            correctIndex: 3,
            explanation: "Podle vzorce n·(n−1)/2 pro n = 6 dostaneme 6 × 5 / 2 = 15 vzájemných spojů."
          },
          {
            question: "Jaký je rozdíl mezi fyzickou a logickou topologií sítě?",
            options: [
              "Fyzická topologie popisuje rozložení kabelů a prvků, logická způsob šíření dat po síti",
              "Fyzická topologie platí jen pro Wi-Fi, logická pouze pro optické kabely",
              "Fyzickou topologii nastavuje operační systém Windows, logickou výrobce kabelu",
              "Žádný rozdíl neexistuje, oba pojmy označují totéž"
            ],
            correctIndex: 0,
            explanation: "Fyzická topologie zachycuje skutečné vedení kabelů v prostoru, kdežto logická popisuje tok dat a přístup k médiu z pohledu protokolů."
          }
        ]
      },

      // =========================================================================
      // TÉMA 3: Architektura Klient–Server vs. P2P a služby Internetu
      // =========================================================================
      {
        id: "client-server-cloud",
        number: 3,
        moduleId: "basics-topologies",
        mandatory: false,
        title: "Architektura Klient–Server, P2P a Cloud",
        shortTitle: "Klient–Server & Cloud",
        subtitle: "Od historie DARPA a webhostingu až po moderní cloudové modely IaaS, PaaS a SaaS.",
        cardSummary: "Komunikace Klient–Server, rovnocenné P2P sítě, typy hostingu a cloudové modely IaaS/PaaS/SaaS.",
        difficulty: "Základy",
        accentColor: "#818cf8",
        tags: ["Klient–Server", "Peer-to-Peer", "ARPANET", "Webhosting / VPS", "IaaS / PaaS / SaaS", "Cloud"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/client-server-cloud.mp4",
          poster: "media/posters/client-server-cloud.jpg",
          startTime: 0,
          durationLabel: "0:17",
          chapters: [
            { label: "1. Model Klient–Server (0:00)", time: 0 },
            { label: "2. Peer-to-Peer / P2P (0:06)", time: 5.5 },
            { label: "3. Cloud: IaaS / PaaS / SaaS (0:11)", time: 11.0 }
          ],
          transcript: "0:00–0:06: Architektura Klient–Server – „V modelu klient server posílá klient požadavek a server vrací odpověď.“ Klienti (Prohlížeč, Laptop, Mobilní app) posílají požadavky REQ #1–#3 přes síťový switch na centrální server 24/7, který po zpracování vrací odpovědi 200 OK.\n0:06–0:11: Peer-to-Peer (P2P) – „V síti P2P jsou uzly rovnocenné a sdílejí data napřímo bez serveru.“ Uzly PEER 1–4 vystupují současně jako klient i server a sdílejí soubory po částech (CHUNK #1–#8) napřímo bez centrálního serveru.\n0:11–0:17: Cloud – „Moderní cloud má tři vrstvy: infrastrukturu, platformu a aplikace.“ Od vlastní kontroly po hotovou službu: IaaS (Infrastruktura – AWS EC2, VPS, Azure VM), PaaS (Platforma – Firebase, Heroku, Azure App) a SaaS (Software – Microsoft 365, Google Docs)."
        },
        animationType: "client-server",
        labType: "hosting-chooser",
        takeaways: [
          "Internet vznikl z vojensko-akademického projektu ARPANET agentury DARPA (1969) a od roku 1983 sjednotil komunikaci pomocí protokolu TCP/IP.",
          "V architektuře Klient–Server klient aktivně zahajuje požadavek (Request), zatímco vyhrazený server naslouchá 24/7 a odesílá odpověď (Response).",
          "V síti Peer-to-Peer (P2P) jsou uzly rovnocenné (každý je klient i server), což snižuje náklady na serverovnu, ale komplikuje centrální správu a bezpečnost.",
          "Cloud dělíme podle míry správy na IaaS (virtuální železo/VM), PaaS (prostředí pro aplikaci) a SaaS (hotová aplikace v prohlížeči)."
        ],
        principle: {
          problem: "Kdo má uchovávat data a poskytovat služby v síti – jeden výkonný centrální stroj, vzájemně si pomáhající uživatelé, nebo pronajatá cloudová infrastruktura?",
          explanation: [
            "Základy dnešního Internetu položila americká agentura DARPA v roce 1969 spuštěním sítě ARPANET, která propojila čtyři univerzitní počítače. V roce 1983 tato síť oficiálně přešla na rodinu protokolů TCP/IP a v roce 1989 navrhl Tim Berners-Lee v CERNu systém World Wide Web (HTML a HTTP), který dal Internetu dnešní webovou podobu.",
            "Většina internetových služeb (web, e-mail, firemní portály, online hry) pracuje v modelu Klient–Server. Server je výkonný počítač s veřejnou adresou a stálým provozem 24/7, který poskytuje služby na určitých portech. Klient (např. webový prohlížeč) vyšle požadavek a server mu pošle požadovaná data zpět. Oproti tomu v modelu Peer-to-Peer (P2P) neexistuje centrální autorita – jednotlivé počítače (peers) sdílejí soubory či výpočty napřímo mezi sebou (např. BitTorrent nebo lokální sdílení).",
            "Pokud chceme provozovat vlastní web nebo informační portál, vybíráme úroveň hostingu. Sdílený Webhosting je nejlevnější – na jednom serveru běží desítky cizích webů a vy dostanete jen složku přes FTP/SFTP a databázi, ale nemůžete měnit operační systém. VPS (Virtual Private Server) vám dá vlastní izolovaný virtuální stroj s administrátorským přístupem (root), ačkoliv se fyzický hardware stále dělí mezi více zákazníků. Dedikovaný server pak znamená celý fyzický stroj pronajatý výhradně pro jeden projekt.",
            "Moderní Cloud (AWS, Microsoft Azure, Google Cloud) posouvá virtualizaci do elastického měřítka, kde platíte podle skutečné spotřeby. Rozlišujeme tři hlavní vrstvy: IaaS (Infrastructure as a Service – pronajmete si virtuální servery, disky a sítě, OS si spravujete sami), PaaS (Platform as a Service – nahrajete jen svůj kód v Pythonu či Node.js a poskytovatel řeší OS i aktualizace) a SaaS (Software as a Service – hotová aplikace pro koncového uživatele, např. Google Workspace, Microsoft 365 nebo Discord)."
          ],
          steps: [
            {
              step: "1. Webhosting (Sdílený)",
              detail: "Ideální pro statické stránky nebo WordPress. Poskytovatel spravuje vše kromě vašich HTML/PHP souborů; nízká cena, ale nulová kontrola nad OS."
            },
            {
              step: "2. VPS (Virtual Private Server)",
              detail: "Hypervizor rozdělí fyzický server na samostatné virtuální stroje. Připojíte se přes SSH, instalujete vlastní balíčky a konfigurujete firewall."
            },
            {
              step: "3. Dedikovaný server",
              detail: "Pronájem celého fyzického serveru v datacentru bez sdílení CPU a RAM s ostatními nájemníky. Vhodné pro náročné databáze či herní cluster."
            },
            {
              step: "4. Cloud – IaaS / PaaS / SaaS",
              detail: "Škálovatelná infrastruktura na vyžádání: u IaaS spravujete OS (Azure VM, AWS EC2), u PaaS jen aplikaci (Firebase, Heroku) a u SaaS aplikaci jen používáte (M365)."
            }
          ],
          analogy: "Představte si bydlení a dopravu: Webhosting je pokoj v ubytovně (sdílená kuchyňka, levný, ale nesmíte bourat zdi). VPS je byt v paneláku (vlastní zámek, zařídíte si ho podle sebe, ale dům stojí na sdílených základech). Dedikovaný server je vlastní rodinný dům. A modely Cloudu jsou jako auto: IaaS = půjčení prázdné dodávky (řídíte a tankujete sami), PaaS = taxík (řeknete jen cíl), SaaS = městský autobus (nastoupíte a jedete).",
          comparisonTable: {
            headers: ["Model / Služba", "Co spravuje zákazník", "Co spravuje poskytovatel", "Typický příklad"],
            rows: [
              ["On-Premises (Vlastní)", "Úplně vše (hardware, kabely, OS, app)", "Nic (jen konektivitu ISP)", "Vlastní serverovna v budově firmy"],
              ["IaaS (Infrastruktura)", "OS, runtime, firewall, data, aplikace", "Fyzický HW, virtualizaci, napájení", "AWS EC2, Google Compute, VPS"],
              ["PaaS (Platforma)", "Pouze kód své aplikace a data", "HW, OS, aktualizace, běhové prostředí", "Heroku, Firebase Hosting, Azure App"],
              ["SaaS (Software)", "Pouze uživatelské účty a obsah", "Vše od hardwaru až po samotnou aplikaci", "Google Docs, Microsoft 365, GitHub"]
            ]
          },
          watchOut: "Pozor na časté zmatení pojmů: pojem „Server“ neznamená vždy jen velkou hučící skříň v racku! Server je především software (démon/služba, např. Nginx nebo OpenSSH), který naslouchá požadavkům klientů. Serverový program můžete klidně spustit i na obyčejném notebooku nebo Raspberry Pi."
        },
        example: {
          scenarioTitle: "Komunikace Klient–Server v praxi (HTTP dotaz a připojení k VPS)",
          scenarioText: "V prvním bloku vidíte reálnou komunikaci klienta (příkaz curl) s webovým serverem. Ve druhém bloku je typický postup správce, který si pronajal linuxový VPS (IaaS) a připojuje se k němu k instalaci služby.",
          codeBlocks: [
            {
              label: "HTTP Request & Response mezi klientem a serverem",
              lang: "http",
              code: "$ curl -I https://example.org\n\nHTTP/2 200 OK\nserver: nginx\ncontent-type: text/html; charset=UTF-8\ncache-control: max-age=3600\n# Klient poslal požadavek HEAD, server odpověděl stavovým kódem 200 OK."
            },
            {
              label: "Správa vlastního VPS přes SSH (model IaaS)",
              lang: "bash",
              code: "$ ssh admin@203.0.113.42\nadmin@vps-prod:~$ sudo apt update && sudo apt install nginx -y\nadmin@vps-prod:~$ systemctl status nginx\n● nginx.service - A high performance web server\n   Active: active (running)"
            }
          ],
          practicalTip: "Při výběru hostingu pro vlastní projekt nebo firemní web začínejte jednoduše: pro čisté HTML/JS stačí bezplatný PaaS/Static hosting (např. GitHub Pages), pro vlastní databázi a API v Pythonu či Node.js je nejlepší levný VPS s Linuxem."
        },
        quiz: [
          {
            question: "Vývojář vytváří webovou aplikaci a nechce se vůbec starat o aktualizace Linuxu ani nastavení serveru – chce jen nahrát zdrojový kód a nechat ho běžet. Který cloudový model zvolí?",
            options: [
              "PaaS (Platform as a Service)",
              "IaaS (Infrastructure as a Service)",
              "SaaS (Software as a Service)",
              "P2P (Peer-to-Peer)"
            ],
            correctIndex: 0,
            explanation: "PaaS poskytuje hotové běhové prostředí a automatickou správu operačního systému, takže vývojář nahrává pouze kód své aplikace a data."
          },
          {
            question: "Co nejlépe vystihuje architekturu Peer-to-Peer (P2P)?",
            options: [
              "Všechny uzly komunikují výhradně přes jeden centrální databázový server",
              "Jde o starší název pro cloudové služby typu Microsoft 365",
              "Síť funguje pouze na koaxiální sběrnici bez routerů",
              "Každý uzel v síti může vystupovat současně jako klient i jako server"
            ],
            correctIndex: 3,
            explanation: "V P2P sítích jsou účastníci rovnocenní – data od ostatních stahují (role klienta) a zároveň je dalším uzlům nabízejí (role serveru)."
          },
          {
            question: "Jaký hlavní rozdíl je mezi sdíleným webhostingem a VPS?",
            options: [
              "Webhosting nemá žádnou IP adresu, VPS má pouze MAC adresu",
              "Na VPS máte vlastní izolovaný operační systém s administrátorskými právy, kdežto na sdíleném webhostingu sdílíte OS i webový server s ostatními uživateli",
              "Webhosting je určen výhradně pro hry, VPS jen pro e-maily",
              "VPS nelze ovládat přes síť, musí se k němu chodit osobně do datacentra"
            ],
            correctIndex: 1,
            explanation: "VPS (Virtual Private Server) nabízí plnou administrátorskou kontrolu nad vlastním virtualizovaným operačním systémem, zatímco sdílený webhosting omezuje uživatele na prostor pro web a databázi."
          }
        ]
      },

      // =========================================================================
      // TÉMA 4: Referenční model ISO/OSI, TCP/IP a Enkapsulace
      // =========================================================================
      {
        id: "iso-osi",
        number: 4,
        moduleId: "models-transport",
        mandatory: false,
        title: "Referenční model ISO/OSI, TCP/IP a enkapsulace",
        shortTitle: "ISO/OSI & Enkapsulace",
        subtitle: "7 vrstev komunikace, názvy PDU, porovnání s TCP/IP a balení dat při cestě sítí.",
        cardSummary: "Sedm vrstev modelu ISO/OSI, čtyřvrstvý TCP/IP, datové jednotky PDU a princip enkapsulace.",
        difficulty: "Střední",
        accentColor: "#a855f7",
        tags: ["ISO/OSI", "TCP/IP", "Enkapsulace", "PDU", "Switch (L2)", "Router (L3)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/iso-osi-routing.mp4",
          poster: "media/posters/iso-osi-routing.jpg",
          startTime: 0,
          durationLabel: "0:10",
          chapters: [
            { label: "1. 7 vrstev ISO/OSI (0:00)", time: 0 },
            { label: "2. L3 routování – ukázka (0:04, viz téma 13)", time: 3.8 },
            { label: "3. Enkapsulace a dekapsulace (0:07)", time: 7.2 }
          ],
          transcript: "0:00–0:04: 7 vrstev ISO/OSI – Zobrazení vrstev 7 (Aplikační) až 1 (Fyzická) mezi PC-A a PC-B.\n0:04–0:07: Přechod L3 routování (podrobně v tématu 13) – Paket na 3. vrstvě prochází směrovačem podle IP adresy.\n0:07–0:10: Enkapsulace a dekapsulace – Vlevo u PC-A balení dat (H7–H2 do L2 rámce), vpravo u PC-B postupné rozbalování všech 7 vrstev."
        },
        animationType: "iso-osi",
        labType: "osi-inspector",
        takeaways: [
          "Model ISO/OSI dělí síťovou komunikaci do 7 nezávislých vrstev (1. Fyzická → 7. Aplikační), což umožňuje výrobcům vyvíjet hardware i software odděleně.",
          "Každá vrstva má vlastní datovou jednotku (PDU): Data (L7–L5) → Segment/Datagram (L4) → Paket (L3) → Rámec (L2) → Bity (L1).",
          "Síťové prvky podle vrstev: Kabel/Hub/Repeater = L1, Switch/Bridge = L2 (MAC), Router = L3 (IP), Firewall/Aplikace = až L7.",
          "Moderní Internet reálně používá 4vrstvý model TCP/IP (Síťové rozhraní, Internetová, Transportní, Aplikační), ale číslování vrstev se v praxi uvádí podle ISO/OSI."
        ],
        principle: {
          problem: "Jak zajistit, aby webový prohlížeč dokázal komunikovat přes síťovou kartu libovolného výrobce, kabel a router bez toho, aby musel znát jejich vnitřní konstrukci?",
          explanation: [
            "Řešením je vrstvový (modulární) přístup. Mezinárodní organizace ISO definovala teoretický referenční model OSI se 7 vrstvami: 7. Aplikační (HTTP, DNS, SSH), 6. Prezentační (šifrování TLS, kódování UTF-8, komprese), 5. Relační (udržování a ukončování relací), 4. Transportní (TCP/UDP, porty, spolehlivost), 3. Síťová (IP adresy, routování), 2. Linková (MAC adresy, Ethernet rámce, detekce chyb FCS) a 1. Fyzická (elektrické impulsy, světlo, Wi-Fi vlny, konektory RJ-45).",
            "V reálném Internetu zvítězil jednodušší 4vrstvý model TCP/IP: jeho vrstva Síťového rozhraní (Network Access) spojuje vrstvy L1+L2 z OSI, Internetová vrstva odpovídá L3, Transportní vrstva odpovídá L4 a Aplikační vrstva sdružuje horní vrstvy L5+L6+L7.",
            "Při odesílání dat z PC-A probíhá proces zvaný enkapsulace (zapouzdření). Aplikace vytvoří Data, Transportní vrstva (L4) je rozdělí a přidá TCP/UDP hlavičku s porty (vzniká Segment u TCP, resp. Datagram u UDP). Síťová vrstva (L3) přidá IP hlavičku se zdrojovou a cílovou IP (vzniká Paket). Linková vrstva (L2) přidá hlavičku s MAC adresami a kontrolní součet na konec (vzniká Rámec / Frame). Fyzická vrstva (L1) vše převede na proud jedniček a nul (Bity).",
            "Na přijímacím počítači PC-B probíhá opačný proces – dekapsulace (rozbalování) od 1. vrstvy směrem k 7. Každá vrstva zkontroluje svou hlavičku, odstraní ji a čistý obsah předá o patro výš. Důležité je vědět, kam patří síťová zařízení: Hub a kabel pracují na L1 (jen přenášejí signál), Switch na L2 (čte MAC z rámce), a Router na L3 (rozbalí rámec, přečte cílovou IP paketu, rozhodne o trase a zabalí paket do nového rámce)."
          ],
          steps: [
            {
              step: "L7–L5 (Data)",
              detail: "Aplikační, Prezentační a Relační vrstva připraví samotný obsah (např. HTML požadavek zašifrovaný pomocí TLS)."
            },
            {
              step: "L4 Transportní (Segment / Datagram)",
              detail: "Přidání TCP nebo UDP hlavičky se zdrojovým a cílovým portem (např. port 443 pro HTTPS) a sekvenčním číslem."
            },
            {
              step: "L3 Síťová (Paket)",
              detail: "Přidání IP hlavičky se zdrojovou a cílovou IP adresou. Na této vrstvě rozhodují routery o směrování."
            },
            {
              step: "L2 Linková (Rámec / Frame)",
              detail: "Přidání hlavičky s MAC adresami aktuálního skoku a patičky FCS (kontrolní součet CRC). Na této vrstvě přepínají switche."
            },
            {
              step: "L1 Fyzická (Bity)",
              detail: "Převod rámce na elektrické napětí v UTP kabelu, světelné pulzy v optice nebo rádiové vlny ve Wi-Fi."
            }
          ],
          analogy: "Enkapsulace funguje přesně jako posílání dopisu firmou: napíšete text (L7 Data), vložíte ho do obálky se jménem oddělení (L4 Port), tu dáte do větší obálky s poštovní adresou města a ulice (L3 IP paket), pošťák ji na třídírně naloží do přepravní bedny pro konkrétní dodávku (L2 MAC rámec) a dodávka jede po asfaltové silnici (L1 Bity). Příjemce krabici i obálky v opačném pořadí vybalí.",
          comparisonTable: {
            headers: ["Číslo", "Vrstva ISO/OSI", "Vrstva TCP/IP", "PDU", "Zařízení / Protokoly"],
            rows: [
              ["7", "Aplikační", "Aplikační", "Data", "HTTP, DNS, DHCP, SSH, SMTP"],
              ["6", "Prezentační", "Aplikační", "Data", "TLS/SSL, JPEG, UTF-8, MP4"],
              ["5", "Relační", "Aplikační", "Data", "Správa relací, RPC, NetBIOS"],
              ["4", "Transportní", "Transportní", "Segment / Datagram", "TCP, UDP (porty)"],
              ["3", "Síťová", "Internetová", "Paket", "Router, IPv4, IPv6, ICMP"],
              ["2", "Linková", "Síťové rozhraní", "Rámec (Frame)", "Switch, Bridge, Ethernet, MAC"],
              ["1", "Fyzická", "Síťové rozhraní", "Bity", "Hub, kabel UTP, optika, RJ-45"]
            ]
          },
          watchOut: "POZOR NA CHYBY V ANIMACI VIDEA! V přiloženém videu se v čase 0:03 krátce na 3. vrstvě objeví chybný nápis „RÁMEC (IP)“ a v závěru u pravého sloupce PC-B animace vynechá 6. (Prezentační) a 3. (Síťovou) vrstvu. Zapamatujte si správně: na L3 (Síťové vrstvě) je vždy PAKET (IP), na L2 (Linkové vrstvě) je RÁMEC (MAC), a dekapsulace na PC-B v reálu prochází všech 7 vrstev pěkně postupně od 1. až po 7.!"
        },
        example: {
          scenarioTitle: "Pohled do skutečně zachyceného rámce (Wireshark / tcpdump)",
          scenarioText: "Když zachytíme paket v nástroji Wireshark, vidíme jednotlivé vrstvy enkapsulace vypsané pěkně pod sebou – od nejnižší fyzické/linkové vrstvy až po aplikační data.",
          codeBlocks: [
            {
              label: "Struktura zachyceného HTTPS požadavku po vrstvách (zdola nahoru)",
              lang: "text",
              code: "Frame 42: 74 bytes on wire (592 bits)         --> L1 Fyzická (Bity na drátě)\nEthernet II, Src: aa:bb:cc:11:22:33, Dst: 00:11:22:44:55:66  --> L2 Linková (Rámec, MAC)\nInternet Protocol Version 4, Src: 192.168.10.25, Dst: 93.184.216.34 --> L3 Síťová (Paket, IP)\nTransmission Control Protocol, Src Port: 51422, Dst Port: 443        --> L4 Transportní (Segment, TCP)\nTransport Layer Security (TLSv1.3) / Hypertext Transfer Protocol     --> L5-L7 (Data / Šifrované HTTP)"
            }
          ],
          practicalTip: "Pro zapamatování všech 7 vrstev od 1. k 7. nebo od 7. k 1. použijte jednoduchou mnemotechnickou pomůcku zdola nahoru: „Fyzik Láďa Snesl Tři Rohlíky Po Aplikaci“ (Fyzická, Linková, Síťová, Transportní, Relační, Prezentační, Aplikační)."
        },
        quiz: [
          {
            question: "Jak se jmenuje datová jednotka (PDU) na 3. (Síťové) vrstvě a na 2. (Linkové) vrstvě modelu ISO/OSI?",
            options: [
              "Na L3 je Rámec (IP) a na L2 je Paket (MAC)",
              "Na obou vrstvách se datová jednotka nazývá Datagram",
              "Na L3 je Segment a na L2 jsou Bity",
              "Na L3 je Paket (IP) a na L2 je Rámec (MAC)"
            ],
            correctIndex: 3,
            explanation: "Na Síťové vrstvě (L3) pracujeme s Paketem adresovaným pomocí IP adres, na Linkové vrstvě (L2) pak s Rámcem adresovaným pomocí MAC adres."
          },
          {
            question: "Na které vrstvě modelu ISO/OSI pracuje klasický síťový přepínač (Switch) a podle čeho rozhoduje?",
            options: [
              "Na 1. vrstvě podle elektrického napětí",
              "Na 2. vrstvě podle cílové MAC adresy",
              "Na 3. vrstvě podle cílové IP adresy",
              "Na 7. vrstvě podle názvu webové stránky"
            ],
            correctIndex: 1,
            explanation: "Klasický switch je prvek 2. (Linkové) vrstvy, který čte cílovou MAC adresu z hlavičky ethernetového rámce a posílá jej pouze do příslušného portu."
          },
          {
            question: "Která z následujících možností správně popisuje proces enkapsulace při odesílání dat z počítače PC-A?",
            options: [
              "Data se balí od 1. vrstvy směrem ke 7. vrstvě a odstraňují se hlavičky",
              "Data přeskočí 6. a 3. vrstvu přímo ze 7. na 2. vrstvu",
              "Data putují od 7. vrstvy dolů k 1. vrstvě a každá vrstva přidá svou hlavičku",
              "Enkapsulace probíhá pouze uvnitř routeru, počítač ji nedělá"
            ],
            correctIndex: 2,
            explanation: "Enkapsulace (balení dat) probíhá shora dolů (od 7. po 1. vrstvu), kdy každá vrstva obalí data z vyšší vrstvy vlastní hlavičkou (a u L2 i patičkou)."
          }
        ]
      },

      // =========================================================================
      // TÉMA 5: Protokoly TCP vs. UDP a transportní porty
      // =========================================================================
      {
        id: "tcp-udp-ports",
        number: 5,
        moduleId: "models-transport",
        mandatory: false,
        title: "Protokoly TCP vs. UDP a transportní porty",
        shortTitle: "TCP, UDP a porty",
        subtitle: "Spolehlivé doručení přes 3-way handshake versus maximální rychlost a čísla portů služeb.",
        cardSummary: "Spolehlivý TCP (3-way handshake), rychlý UDP a rozlišení aplikací pomocí portů 0–65535.",
        difficulty: "Střední",
        accentColor: "#ec4899",
        tags: ["TCP", "UDP", "3-way handshake", "SYN / ACK", "Porty (0–65535)", "Socket"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/tcp-udp-ports.mp4",
          poster: "media/posters/tcp-udp-ports.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. TCP – spolehlivé spojení :443 (0:00)", time: 0 },
            { label: "2. UDP – rychlý přenos :53 (0:06)", time: 6.0 }
          ],
          transcript: "0:00–0:06: Protokol TCP – „Protokol TCP nejprve naváže spojení a ztracené pakety znovu odešle.“\n0:06–0:13: Protokol UDP – „UDP posílá data okamžitě bez čekání, ideální pro DNS, hovory a hry.“"
        },
        animationType: "tcp-udp",
        labType: "handshake-ports",
        takeaways: [
          "Transportní vrstva (L4) využívá čísla portů (0–65535), aby dokázala na jedné IP adrese rozlišit více spuštěných programů najednou (např. web i hru).",
          "TCP je spojovaný, spolehlivý protokol: před přenosem naváže spojení (SYN → SYN-ACK → ACK), čísluje bajty a ztracené segmenty posílá znovu.",
          "UDP je nespojovaný a bez potvrzování: má jen malou 8B hlavičku a minimální zpoždění, takže se hodí pro DNS, VoIP, online hry a živý streaming.",
          "Dobře známé porty (Well-known 0–1023) musíte znát zpaměti: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 443 HTTPS (a 3389 RDP)."
        ],
        principle: {
          problem: "Když máte v prohlížeči otevřených 10 záložek, k tomu posloucháte hudbu a hrajete online hru na jednom počítači s jedinou IP adresou, jak síťová karta pozná, kterému programu přijatá data patří – a kdy zvolit přesnost před rychlostí?",
          explanation: [
            "IP adresa na 3. vrstvě identifikuje pouze samotný počítač v síti. Aby se data dostala ke konkrétní aplikaci, přidává 4. (Transportní) vrstva 16bitová čísla portů (0 až 65535). Dvojice IP adresa + port se nazývá socket (např. 192.168.10.25:443). Porty 0–1023 jsou vyhrazené jako Well-known (dobře známé) pro standardní serverové služby, 1024–49151 jsou registrované a 49152–65535 jsou dynamické (dočasné) porty, které si pro spojení otevírá klient.",
            "Protokol TCP (Transmission Control Protocol) zaručuje, že všechna data dorazí kompletní a ve správném pořadí. Než pošle první bajt dat, provede tzv. třícestné navázání spojení (3-way handshake): klient pošle SYN, server odpoví SYN-ACK a klient potvrdí ACK. Během přenosu si strany potvrzují přijetí (ACK), používají sekvenční čísla a v případě ztráty segment znovu odešlou.",
            "Spolehlivost TCP ale něco stojí – má větší hlavičku (minimálně 20 bajtů), navazování spojení trvá jednu cestu tam a zpět navíc a při ztrátě jednoho paketu musí zbytek dat čekat na jeho opakované doručení (Head-of-Line blocking). To je nepříjemné u videohovoru nebo střílečky, kde nemá smysl po sekundě posílat starý snímek zvuku.",
            "Proto existuje protokol UDP (User Datagram Protocol). UDP nenavazuje spojení, nic nepotvrzuje a neřeší pořadí. Hlavička má pouhých 8 bajtů (zdrojový port, cílový port, délka a kontrolní součet). Co se ztratí, to se ztratí – ale data letí okamžitě. Proto jej používá DNS (rychlý krátký dotaz), DHCP, živé vysílání, VoIP i herní enginy."
          ],
          steps: [
            {
              step: "1. TCP Krok 1 – SYN",
              detail: "Klient vybere náhodný zdrojový port (např. 51422), pošle paket s příznakem SYN a počátečním sekvenčním číslem (např. Seq=100) na cílový port serveru (např. 443)."
            },
            {
              step: "2. TCP Krok 2 – SYN-ACK",
              detail: "Server na portu 443 naslouchá, potvrdí klientovo číslo (Ack=101) a pošle vlastní příznak SYN se svým číslem (Seq=500)."
            },
            {
              step: "3. TCP Krok 3 – ACK",
              detail: "Klient potvrdí serverovo číslo (Ack=501). V tuto chvíli je obousměrné spojení navázáno (ESTABLISHED) a začíná přenos dat."
            },
            {
              step: "4. Přenos a oprava chyb (TCP) vs. Průtok (UDP)",
              detail: "TCP ztracený segment automaticky pošle znovu a ukončí relaci zprávami FIN. UDP datagramy rovnou vysílá bez úvodního potřesení rukou."
            }
          ],
          analogy: "TCP je jako doporučený dopis s dodejkou – napřed zavoláte adresátovi, zda je doma (handshake), pošta vám podepíše převzetí každé zásilky a ztracený balík se pošle znovu. UDP je jako posílání pohlednic nebo živý rozhlas – vhodíte je do schránky a nečekáte na potvrzení; pro živý přenos zápasu nevadí, když jedno slovo vypadne, hlavně že komentář nezpožďuje.",
          comparisonTable: {
            headers: ["Port", "Protokol L4", "Služba / Protokol", "K čemu slouží v praxi"],
            rows: [
              ["20 / 21", "TCP", "FTP", "Přenos souborů (21 příkazy, 20 data) – nešifrované"],
              ["22", "TCP", "SSH / SFTP / SCP", "Bezpečná šifrovaná vzdálená správa a přenos souborů"],
              ["23", "TCP", "Telnet", "Zastaralá nešifrovaná textová správa (hesla v čitelné podobě!)"],
              ["25", "TCP", "SMTP", "Odesílání elektronické pošty mezi poštovními servery"],
              ["53", "UDP / TCP", "DNS", "Překlad doménových jmen na IP (UDP dotazy, TCP velké odpovědi)"],
              ["67 / 68", "UDP", "DHCP", "Automatické přidělování IP adres (67 server, 68 klient)"],
              ["80", "TCP", "HTTP", "Nešifrovaný přenos webových stránek"],
              ["443", "TCP (i UDP/QUIC)", "HTTPS", "Šifrovaný webový přenos pomocí TLS"],
              ["3389", "TCP / UDP", "RDP", "Vzdálená plocha Windows (Remote Desktop Protocol)"]
            ]
          },
          watchOut: "Pozor na dva časté omyly: zaprvé, UDP není „špatné“ nebo „rozbité“ – pro real-time hlas a DNS je mnohem lepší než TCP. Zadruhé, nezaměňujte porty SSH (22) a Telnet (23)! V produkčních ani testovacích sítích nikdy nepoužívejte Telnet na veřejných sítích, protože posílá hesla v prostém textu (plaintext), kdežto SSH celý přenos šifruje."
        },
        example: {
          scenarioTitle: "Výpis otevřených portů na stanici a analýza TCP spojení",
          scenarioText: "Správce sítě často potřebuje ověřit, které programy na serveru naslouchají na jakých portech a s jakými klienty mají navázaná TCP spojení. Na Windows k tomu slouží netstat, na Linuxu moderní příkaz ss.",
          codeBlocks: [
            {
              label: "Linux – zobrazení naslouchajících TCP/UDP portů (ss -tulnp)",
              lang: "bash",
              code: "$ sudo ss -tulnp\nNetid  State   Local Address:Port   Peer Address:Port  Process\nudp    UNCONN  0.0.0.0:53           0.0.0.0:*          users:((\"unbound\",pid=812))\ntcp    LISTEN  0.0.0.0:22           0.0.0.0:*          users:((\"sshd\",pid=904))\ntcp    LISTEN  0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1021))\ntcp    LISTEN  0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1021))"
            },
            {
              label: "Windows – aktivní spojení klienta na HTTPS server",
              lang: "bash",
              code: "C:\\> netstat -ano\n  Protokol  Místní adresa         Cizí adresa            Stav           PID\n  TCP       192.168.10.25:51422   93.184.216.34:443      ESTABLISHED    4820\n  TCP       192.168.10.25:51423   142.251.36.110:443     SYN_SENT       4820"
            }
          ],
          practicalTip: "Když potřebujete rychle otestovat, jestli na vzdáleném serveru není port zablokovaný firewallem (např. port 22 nebo 3389), použijte v PowerShellu příkaz Test-NetConnection 192.168.10.5 -Port 3389."
        },
        quiz: [
          {
            question: "Jaké je správné pořadí zpráv při navazování TCP spojení (3-way handshake)?",
            options: [
              "ACK → SYN → SYN-ACK",
              "HELLO → OK → DATA",
              "SYN → SYN-ACK → ACK",
              "FIN → ACK → SYN"
            ],
            correctIndex: 2,
            explanation: "Nejprve klient pošle požadavek SYN, server odpoví kombinací SYN-ACK a klient spojení finálně potvrdí zprávou ACK."
          },
          {
            question: "Které dvojice port–služba jsou uvedeny zcela správně?",
            options: [
              "22 = SSH, 53 = DNS, 443 = HTTPS, 3389 = RDP",
              "22 = Telnet, 80 = HTTPS, 53 = DHCP",
              "21 = SMTP, 25 = FTP, 67 = HTTP",
              "23 = SSH, 443 = FTP, 80 = DNS"
            ],
            correctIndex: 0,
            explanation: "SSH používá TCP port 22, DNS port 53, šifrovaný web HTTPS port 443 a vzdálená plocha Windows RDP port 3389."
          },
          {
            question: "Proč online hlasová komunikace (VoIP) a videohovory upřednostňují UDP před TCP?",
            options: [
              "Protože UDP automaticky šifruje zvuk 256bitovým klíčem",
              "Protože TCP neumí přenášet data v binární podobě",
              "Protože UDP má větší propustnost díky 64bajtové hlavičce",
              "Protože UDP nepotřebuje navazovat spojení ani čekat na opakování ztraceného paketu, takže má minimální zpoždění"
            ],
            correctIndex: 3,
            explanation: "U živého zvuku je klíčová nízká latence. Čekání na retransmisi ztraceného TCP segmentu by způsobilo nepříjemné zadrhávání hovoru."
          }
        ]
      },

      // =========================================================================
      // TÉMA 6: Ethernet, rámec, Switch a pasivní prvky sítě
      // =========================================================================
      {
        id: "ethernet-switch",
        number: 6,
        moduleId: "l2-ethernet-vlan",
        mandatory: true,
        title: "Ethernet, rámec, Switch, STP a PoE",
        shortTitle: "Ethernet & Switch",
        subtitle: "Metalická a optická kabeláž, patch panel, rámec IEEE 802.3, Full-Duplex, CAM tabulka, STP/RSTP a napájení PoE.",
        cardSummary: "Kabeláž UTP/optika, rámec 802.3, učení CAM tabulky switche, Full-Duplex, STP a napájení PoE.",
        difficulty: "Střední",
        accentColor: "#3b82f6",
        tags: ["Ethernet 802.3", "Switch & CAM tabulka", "Cat5e / Cat6a", "Optika SM / MM", "STP / RSTP", "PoE (802.3af/at/bt)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/ethernet-switch.mp4",
          poster: "media/posters/ethernet-switch.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Učení MAC adres a CAM tabulka (0:00)", time: 0 },
            { label: "2. Přímé přepínání Full-Duplex (0:06)", time: 6.0 }
          ],
          transcript: "0:00–0:06: CAM tabulka – „Ethernetový switch si z příchozích rámců ukládá MAC adresy do své tabulky.“\n0:06–0:13: Přímé přepínání (Full-Duplex) – „Díky tomu přepíná data přesně na cílový port v režimu Full-Duplex bez kolizí.“"
        },
        animationType: "ethernet-switch",
        labType: "mac-table-sim",
        takeaways: [
          "Strukturovaná kabeláž odděluje pevné instalační rozvody (zásuvka Keystone ↔ Patch panel v racku) od pružných propojovacích kabelů (patch cordů) do switche a PC.",
          "Metalika (Cat5e 1 Gbps, Cat6a 10 Gbps do 100 m) je náchylná na elektromagnetické rušení (EMI); optická vlákna (Multimode pro budovy, Singlemode pro desítky km) jsou proti EMI zcela imunní.",
          "Switch se do své CAM (MAC) tabulky vždy UČÍ ze zdrojové MAC adresy příchozího rámce a PŘEPOSÍLÁ podle cílové MAC adresy (neznámý cíl a broadcast pošle metodou Flooding do všech ostatních portů).",
          "Na rozdíl od zastaralého Hubu (sdílená kolizní doména s CSMA/CD) vytváří každý port moderního Switche samostatnou kolizní doménu v režimu Full-Duplex; smyčkám brání STP/RSTP a napájení přes UTP řeší PoE."
        ],
        principle: {
          problem: "Bez kvalitní fyzické kabeláže a chytrého přepínání rámců by se signály na společném drátě srážely v kolizích a každý úder do stěny nebo souběh se silovým kabelem by zničil data celého síťového segmentu.",
          explanation: [
            "Základem drátové LAN je strukturovaná kabeláž. Ze zásuvky ve zdi (modul Keystone) vede pod omítkou pevný drátový kabel (tzv. drát) do datového rozvaděče (rack 19\"), kde je zařezán zezadu do Patch panelu. Teprve zepředu se krátkými licnovými patch kabely propojuje se Switchem. Krimpování koncovek RJ-45 na pevné kabely se řídí standardem T568A nebo u nás nejčastějším T568B (páry 1–2 a 3–6).",
            "U kroucené dvojlinky rozlišujeme stínění (nestíněný UTP vs. stíněný FTP/STP proti přeslechům a rušení od silových kabelů) a kategorie: Cat5e zvládne 1 Gbps (100 MHz), Cat6 až 10 Gbps na kratší vzdálenost (do 55 m) a Cat6a spolehlivě 10 Gbps na plných 100 metrů. Pro delší trasy a vysoké rychlosti nasazujeme optická vlákna s úplným odrazem světla: Multimode (MM, širší jádro 50 µm, oranžový/tyrkysový plášť, stovky metrů v budově) a Singlemode (SM, úzké jádro 9 µm, žlutý plášť, laser, kilometry až desítky km mezi městy).",
            "Po těchto kabelech cestuje na L2 vrstvě Ethernetový rámec (IEEE 802.3). Začíná Preambulí a SFD (synchronizace hodin), následuje Cílová MAC (6 B), Zdrojová MAC (6 B), EtherType (2 B – určuje zapouzdřený protokol, např. 0x0800 pro IPv4 nebo 0x0806 pro ARP), samotná Data (46–1500 B, tzv. MTU 1500 bajtů) a končí 4bajtovým kontrolním součtem FCS (CRC) pro odhalení poškození při přenosu.",
            "Zastaralý Hub jen hloupě opakoval elektrický signál na všechny porty (Half-Duplex) – všechna PC tvořila jednu kolizní doménu a musela hlídat srážky pomocí metody CSMA/CD. Dnešní Switch ukládá adresy do CAM tabulky (Content Addressable Memory), pracuje v režimu Full-Duplex (vysílá i přijímá současně) a izoluje kolize na úroveň jednoho portu.",
            "Jakmile přijde rámec na port switche, zapíše si switch do CAM tabulky dvojici [Zdrojová MAC → Vstupní port] s časovačem platnosti (obvykle 300 s). Pak vyhledá Cílovou MAC: pokud ji zná, pošle rámec jen na tento jediný port (Forwarding). Pokud cílovou MAC nezná (Unknown Unicast) nebo jde o Broadcast (FF:FF:FF:FF:FF:FF), rozešle rámec do všech portů kromě toho vstupního (Flooding).",
            "Při redundantním propojení více switchů do kruhu hrozí nekonečné obíhání broadcastů (Broadcast Storm) a přepisování CAM tabulky. Řešením je protokol STP / RSTP (Spanning Tree Protocol, IEEE 802.1D / 802.1w), který automaticky zvolí kořenový switch (Root Bridge), nadbytečnou linku logicky uvede do stavu Blocking a při výpadku hlavní trasy ji během sekundy přepne do stavu Forwarding. Moderní přístupové switche navíc podporují PoE (Power over Ethernet) dle norem IEEE 802.3af (PoE až 15,4 W), 802.3at (PoE+ až 30 W) a 802.3bt (PoE++ až 90 W), takže po stejném UTP kabelu napájejí Wi-Fi AP, IP kamery či VoIP telefony bez samostatných adaptérů."
          ],
          steps: [
            {
              step: "1. Příchod rámce a kontrola FCS",
              detail: "Rámec dorazí na Port 1 Switche. Switch spočítá CRC; pokud je rámec poškozený, okamžitě ho zahodí."
            },
            {
              step: "2. Učení zdrojové MAC (Learning)",
              detail: "Switch si přečte Zdrojovou MAC adresu rámce a zapíše do své CAM tabulky: MAC_PC1 → Port 1."
            },
            {
              step: "3. Vyhledání cílové MAC (Lookup)",
              detail: "Zkontroluje Cílovou MAC adresu v CAM tabulce (případně pozná Broadcast FF:FF:FF:FF:FF:FF)."
            },
            {
              step: "4. Přeposlání nebo Flooding (Forwarding)",
              detail: "Zná-li cílový port (např. Port 3), pošle rámec jen tam. Nezná-li ho nebo jde o Broadcast, pošle kopii na všechny ostatní porty kromě Portu 1."
            }
          ],
          analogy: "Hub je jako místnost, kde každý křičí do jednoho megafonu – když promluví dva lidé najednou, dojde ke kolizi a oba musí zmlknout. Switch je chytrá potrubní pošta s adresářem: jakmile z trubky č. 1 přijde dopis od ‚Karla‘, vrátný si napíše ‚Karel bydlí v trubce 1‘. Příště už dopisy pro Karla posílá přímo jedinou trubkou bez rušení ostatních.",
          comparisonTable: {
            headers: ["Přenosové médium", "Max. běžná rychlost", "Max. dosah", "Odolnost vůči EMI", "Typické využití"],
            rows: [
              ["UTP / STP Cat5e", "1 Gbps (1000BASE-T)", "100 m", "Nízká (UTP) / Střední (STP)", "Starší rozvody, běžná kancelářská PC a tiskárny"],
              ["UTP / STP Cat6a", "10 Gbps (10GBASE-T)", "100 m", "Vysoká (proti přeslechům)", "Moderní firemní kabeláž, Wi-Fi 6/7 AP, servery"],
              ["Optika Multimode (OM3/OM4)", "10 / 40 / 100 Gbps", "300–550 m", "100% imunní vůči EMI", "Propoj rozvaděčů a pater v rámci jedné budovy"],
              ["Optika Singlemode (OS2)", "10 / 100+ Gbps", "10–80+ km", "100% imunní vůči EMI", "Páteřní spoje mezi budovami, areály, trasy ISP"]
            ]
          },
          watchOut: "Pozor na smyčku (Loop) v L2 síti: pokud dva switche propojíte omylem dvěma kabely bez ochrany, broadcasty (Flooding) začnou obíhat dokola a během sekundy zahltí celou síť (Broadcast Storm)! Proto mají podnikové switche zapnutý protokol STP / RSTP (Spanning Tree Protocol), který nadbytečnou cestu automaticky zablokuje."
        },
        example: {
          scenarioTitle: "Ověření CAM (MAC) tabulky a stavu portů na Cisco IOS a MikroTik RouterOS",
          scenarioText: "V testovací síti jsme připojili dvě stanice přes nástěnné zásuvky a patch panel do portu 1 a 2 našeho switche (a uplink vede portem 24). Podíváme se, jak v příkazové řádce zkontrolovat naučené MAC adresy v CAM tabulce, rychlost linky (1 Gbps Full-Duplex) a případné chyby na kabelu.",
          codeBlocks: [
            {
              label: "Cisco IOS — Kontrola CAM tabulky a stavu Ethernet portů",
              lang: "ios",
              code: "! Zobrazeni naucenych MAC adres v CAM tabulce switche\nSwitch# show mac address-table\n          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   1    aabb.cc11.2210    DYNAMIC     Gi0/1\n   1    aabb.cc11.2220    DYNAMIC     Gi0/2\n   1    0011.2233.4455    DYNAMIC     Gi0/24\n\n! Kontrola rychlosti, duplexu (a-full = Auto Full-Duplex) a pripojeni\nSwitch# show interfaces status\nPort      Name               Status       Vlan       Duplex  Speed Type\nGi0/1     Lab-PC-A           connected    1          a-full  a-1000 10/100/1000BaseTX\nGi0/2     Lab-PC-B           connected    1          a-full  a-1000 10/100/1000BaseTX\nGi0/24    Uplink-Router      connected    trunk      a-full  a-1000 10/100/1000BaseTX"
            },
            {
              label: "MikroTik RouterOS — Kontrola Bridge Host (CAM) tabulky a test kabelu",
              lang: "routeros",
              code: "# Zobrazeni naucenych MAC adres na portu bridge (CAM tabulka)\n/interface bridge host print\n#  Flags: D - DYNAMIC, L - LOCAL, E - EXTERNAL\n#  #   MAC-ADDRESS        ON-INTERFACE  BRIDGE\n#  0 D AA:BB:CC:11:22:10  ether1        bridge-lan\n#  1 D AA:BB:CC:11:22:20  ether2        bridge-lan\n\n# Rychlost linky, Full-Duplex a opticky/metalicky stav portu ether1\n/interface ethernet monitor ether1 once\n\n# Diagnostika poruseneho UTP kabelu primo ze switche (TDR Cable Test)\n/interface ethernet cable-test ether1 once"
            }
          ],
          practicalTip: "Při krimpování konektorů RJ-45 v praxi si zapamatujte nejrozšířenější standard T568B (zleva při pohledu na piny zástrčky od sebe): Bílo-oranžová, Oranžová, Bílo-zelená, Modrá, Bílo-modrá, Zelená, Bílo-hnědá, Hnědá. Křížený kabel dnes díky funkci Auto-MDI/MDIX už většinou nepotřebujete."
        },
        quiz: [
          {
            question: "Kterou MAC adresu si Switch zapíše do své CAM tabulky při přijetí rámce a podle které MAC adresy se rozhoduje, na který port jej pošle?",
            options: [
              "Učí se z cílové MAC adresy a přeposílá podle zdrojové MAC adresy.",
              "Učí se ze zdrojové MAC adresy a přeposílá podle cílové MAC adresy.",
              "Učí se ze zdrojové IP adresy a přeposílá podle čísla portu TCP.",
              "Do CAM tabulky zapisuje pouze broadcastové MAC adresy FF:FF:FF:FF:FF:FF."
            ],
            correctIndex: 1,
            explanation: "Switch si pamatuje, odkud rámec přišel – proto si do CAM tabulky uloží ZDROJOVOU MAC k číslu vstupního portu. Cílový port pak hledá podle CÍLOVÉ MAC adresy."
          },
          {
            question: "Potřebujete propojit dva datové rozvaděče vzdálené 400 metrů mezi dvěma budovami přes venkovní trasu, kde hrozí blesky a silové vedení. Jaké médium zvolíte?",
            options: [
              "Nestíněný UTP kabel Cat5e.",
              "Stíněný FTP kabel Cat6a bez opakovače.",
              "Koaxiální kabel 10BASE2.",
              "Optické vlákno (např. Singlemode nebo Multimode OM3/OM4) s SFP moduly."
            ],
            correctIndex: 3,
            explanation: "Metalika (Cat5e/Cat6a) má limit 100 metrů a přenáší přepětí při bouřce. Optické vlákno zvládne stovky metrů až desítky kilometrů a je elektricky nevodivé a imunní vůči rušení."
          },
          {
            question: "Kolik kolizních a kolik broadcastových domén má 24portový Gigabit Ethernetový Switch ve výchozím nastavení (bez VLAN), pokud je ke každému portu připojen jeden počítač?",
            options: [
              "1 kolizní doména a 1 broadcastová doména.",
              "24 kolizních domén a 24 broadcastových domén.",
              "24 kolizních domén a 1 broadcastová doména.",
              "1 kolizní doména a 24 broadcastových domén."
            ],
            correctIndex: 2,
            explanation: "Každý port switche tvoří samostatnou kolizní doménu (díky Full-Duplex komunikaci a vyrovnávací paměti). Broadcasty ale switch rozesílá na všechny porty, takže bez VLAN tvoří celý switch jedinou broadcastovou doménu."
          }
        ]
      },

      // =========================================================================
      // TÉMA 7: VLAN (IEEE 802.1Q): Logická segmentace L2 sítě
      // =========================================================================
      {
        id: "vlan",
        number: 7,
        moduleId: "l2-ethernet-vlan",
        mandatory: true,
        title: "VLAN (IEEE 802.1Q): Logická segmentace L2 sítě",
        shortTitle: "VLAN & 802.1Q",
        subtitle: "Oddělení broadcastových domén na jednom switchi: 4B hlavička 802.1Q, Access vs. Trunk, Native VLAN, Voice VLAN a Inter-VLAN routing.",
        cardSummary: "Logické oddělení sítí IEEE 802.1Q: Access vs. Trunk, PVID, Native VLAN, Voice a L3 směrování.",
        difficulty: "Střední",
        accentColor: "#0ea5e9",
        tags: ["VLAN 802.1Q", "TPID 0x8100 / VID", "Access (PVID) vs. Trunk", "Native VLAN & VLAN Hopping", "Voice VLAN", "Router-on-a-Stick vs. L3 SVI"],
        video: {
          hasBundledVideo: false,
          previewMode: "canvas",
          src: null,
          poster: null,
          startTime: 0,
          durationLabel: "Interaktivní",
          chapters: [],
          transcript: "Interaktivní vizualizace znázorňuje vkládání 4bajtové značky IEEE 802.1Q (TPID 0x8100, VID) na Access portech (PVID), souběžný přenos více VLAN po Trunk lince, Voice VLAN pro IP telefony a L3 komunikaci mezi VLAN přes Router-on-a-Stick nebo SVI."
        },
        animationType: "vlan",
        labType: "vlan-sim",
        takeaways: [
          "VLAN (Virtual LAN, IEEE 802.1Q) logicky rozděluje jeden fyzický switch na více izolovaných broadcastových domén – provoz mezi VLAN může komunikovat jen přes L3 prvek (router nebo L3 switch).",
          "Značka IEEE 802.1Q vkládá do ethernetového rámce 4 bajty: TPID 0x8100 (2 B), PCP prioritu 802.1p (3 bity), DEI (1 bit) a VID – číslo VLAN 1–4094 (12 bitů).",
          "Access port přenáší neoznačené (untagged) rámce jediné VLAN určené hodnotou PVID; Trunk port přenáší více VLAN současně s jejich 802.1Q tagem (kromě případné Native VLAN).",
          "Bezpečnost a praxe: změna výchozí Native VLAN 1 a vypnutí DTP brání útoku VLAN Hopping (Double-Tagging); Voice VLAN odděluje IP telefonii s prioritou QoS; Inter-VLAN routing řeší Router-on-a-Stick nebo hardwarové L3 SVI."
        ],
        principle: {
          problem: "Na běžném L2 switchi sdílejí všechna připojená zařízení jedinou broadcastovou doménu i stejnou IP podsíť. Jak na stejných fyzických switchích a páteřních kabelech bezpečně oddělit zaměstnance, servery, hosty, IP kamery a VoIP telefony, aniž bychom pro každé oddělení kupovali samostatné switche a tahali oddělené kabely?",
          explanation: [
            "Řešením je standard IEEE 802.1Q (VLAN – Virtual Local Area Network), který umožňuje rozdělit jeden fyzický switch na desítky nezávislých logických sítí (broadcastových domén). Do standardního ethernetového rámce se mezi zdrojovou MAC adresu a pole EtherType vkládá 4bajtová značka (tag) 802.1Q. První dva bajty tvoří TPID (Tag Protocol Identifier) s pevnou hodnotou 0x8100, která přepínači hlásí, že rámec nese VLAN tag. Zbylé dva bajty (TCI – Tag Control Information) obsahují 3bitové pole PCP (Priority Code Point dle 802.1p pro QoS prioritu hlasu a videa), 1bitový příznak DEI (Drop Eligible Indicator – označení rámců vhodných k zahození při přetížení) a 12bitové pole VID (VLAN Identifier), které dovoluje adresovat VLAN 1 až 4094 (hodnoty 0 a 4095 jsou rezervované).",
            "Porty na řízeném switchi konfigurujeme ve dvou základních režimech. Access port slouží pro koncové stanice (PC, tiskárna, kamera), které značku 802.1Q neznají: přijímá a posílá neoznačené (untagged) rámce a každému příchozímu rámci přiřadí výchozí VLAN portu podle parametru PVID (Port VLAN ID). Trunk port propojuje switche mezi sebou nebo switch s routerem či Wi-Fi AP (Multi-SSID): po jediném kabelu přenáší současně více VLAN se značkou (tagged), aby přijímající zařízení vždy poznalo, které síti rámec patří.",
            "Zvláštní pozornost vyžaduje Native VLAN na Trunk portu – jedna vybraná VLAN (továrně VLAN 1), jejíž rámce se přes Trunk posílají výjimečně bez značky (untagged) kvůli zpětné kompatibilitě. Ponechání Native VLAN 1 pro běžná data i správu však otevírá cestu k útoku VLAN Hopping: útočník může buď zneužít vyjednávací protokol DTP (Switch Spoofing) a přepnout svůj port na Trunk, nebo poslat dvojitě označený rámec (Double-Tagging), kdy první switch sundá vnější tag odpovídající Native VLAN a druhý switch doručí vnitřní tag do cizí VLAN. Obrana je jasná: na Access portech vypnout DTP, nepoužívat VLAN 1 pro uživatele, přesunout Native VLAN na nepoužívané ID a ideálně ji na Trunku také značkovat.",
            "Specifickým případem je Voice VLAN: na pracovním stole často stojí IP telefon a za ním je v integrovaném mini-switchi telefonu zapojené PC přes jediný kabel do zásuvky ve zdi. Switch přes protokoly LLDP-MED nebo CDP sdělí telefonu číslo Voice VLAN (např. VLAN 30), takže telefon posílá hlasové pakety označené tagem 802.1Q s vysokou prioritou PCP (např. 5), zatímco počítač za ním komunikuje klasicky bez značky (untagged) v datové VLAN (např. VLAN 10).",
            "Protože jsou VLAN na L2 vrstvě přísně izolované, pro komunikaci mezi nimi (Inter-VLAN routing) potřebujeme 3. vrstvu. Menší sítě používají tzv. Router-on-a-Stick: jeden fyzický kabel z Trunk portu switche vede do routeru, kde se rozdělí na logická subrozhraní (jedno pro každou VLAN s vlastní IP bránou), což má ale nevýhodu v úzkém hrdle jednoho kabelu. Podnikové sítě proto využívají L3 Switch s virtuálními rozhraními SVI (Switch Virtual Interface): směrování mezi VLAN probíhá přímo v hardwaru ASIC uvnitř switche plnou rychlostí linek (wire-speed) bez zbytečné cesty ven na externí router."
          ],
          steps: [
            {
              step: "1. Vytvoření VLAN a vložení 802.1Q tagu (0x8100)",
              detail: "Switch při příjmu rámce na Access portu interně přiřadí 12bitový VID (1–4094) podle PVID portu (TPID = 0x8100, PCP 0–7, DEI 0/1)."
            },
            {
              step: "2. Přenos přes Trunk port (Tagged)",
              detail: "Mezi switchi nebo k AP/routeru rámec cestuje s 4bajtovou hlavičkou 802.1Q, takže se sítě VLAN 10, 20 a 30 na jednom kabelu nikdy nepromíchají."
            },
            {
              step: "3. Odznačení na výstupním Access portu (Untagged)",
              detail: "Před předáním koncovému PC switch 4B značku 802.1Q odstraní – běžná síťová karta dostane standardní Ethernetový rámec."
            },
            {
              step: "4. Zabezpečení Native VLAN a Voice VLAN",
              detail: "Nepoužívanou Native VLAN oddělíme od VLAN 1, vypneme automatické vyjednávání trunku (DTP) a pro IP telefony přidáme prioritizovanou Voice VLAN."
            },
            {
              step: "5. Inter-VLAN Routing (ROAS nebo L3 SVI)",
              detail: "Provoz mezi různými VLAN směrujeme přes subrozhraní externího routeru (Router-on-a-Stick) nebo hardwarově přes SVI rozhraní na L3 switchi."
            }
          ],
          analogy: "Představte si poštovní třídírnu ve velké budově: jednotlivé kanceláře (Access porty) posílají dopisy bez obálkového kódu, ale podatelna na chodbě (PVID) na každý dopis nalepí barevný štítek oddělení (802.1Q tag: modrá VLAN 10 IT, zelená VLAN 20 Finance). Mezi patry pak jezdí jediný rychlý výtah (Trunk), kde spolu bezpečně cestují modré i zelené zásilky. Na výstupu v cílovém patře se štítek zase sloupne. Pokud si mají dvě oddělení přeposlat zprávu mezi sebou, musí projít přes centrální recepci (Router / L3 SVI), která zásilku zkontroluje a přesměruje.",
          comparisonTable: {
            headers: ["Vlastnost / Mechanismus", "Access Port", "Trunk Port", "Router-on-a-Stick vs. L3 SVI"],
            rows: [
              ["Značkování 802.1Q", "Untagged (bez tagu na drátě)", "Tagged pro povolené VLAN (mimo Native)", "ROAS: tagged subrozhraní; SVI: interní L3 rozhraní"],
              ["Počet VLAN", "1 datová VLAN (+ volitelně 1 Voice VLAN)", "Více VLAN současně (např. 10, 20, 30)", "Směruje provoz mezi všemi vybranými VLAN"],
              ["Cílové zařízení", "PC, tiskárna, IP kamera, IP telefon", "Další switch, router, hypervizor, Wi-Fi AP", "ROAS = externí router; SVI = integrovaný L3 switch"],
              ["Výkon a bezpečnost", "Nutné vypnout DTP, nastavit PVID", "Přenastavit Native VLAN z 1 na nepoužívanou", "ROAS sdílí šířku 1 linky; SVI směruje wire-speed v ASIC"]
            ]
          },
          watchOut: "Pozor na tři klasické chyby v praxi: 1) Neshoda Native VLAN na dvou propojených Trunk portech (Native VLAN mismatch) způsobí tichý únik provozu z jedné VLAN do druhé a varování STP/CDP. 2) Necháte-li na switchi všechny nepoužívané porty v defaultní VLAN 1 s aktivním DTP, útočník může provést VLAN Hopping (Double-Tagging nebo Switch Spoofing). 3) U MikroTik Bridge VLAN Filtering se před zapnutím vlan-filtering=yes vždy chraňte funkcí Safe Mode nebo záložním management portem."
        },
        example: {
          scenarioTitle: "Segmentace firemní sítě: VLAN 10 (Zaměstnanci), VLAN 20 (Hosté), Voice VLAN 30 (VoIP) a L3 směrování",
          scenarioText: "Rozdělíme switch do tří oddělených VLAN: datová VLAN 10 (10.10.10.0/24), izolovaná VLAN 20 pro hosty (10.20.20.0/24) a Voice VLAN 30 pro IP telefony (10.30.30.0/24). Nepoužívaná Native VLAN bude 999. Níže vidíte konfiguraci jak v Cisco IOS (Access + Voice VLAN + zabezpečený Trunk + L3 SVI vs. Router-on-a-Stick), tak v MikroTik RouterOS (Bridge VLAN Filtering).",
          codeBlocks: [
            {
              label: "Cisco IOS — Access/Voice/Trunk porty, ochrana Native VLAN 999 a L3 SVI",
              lang: "ios",
              code: "! === 1. Definice VLAN na Switchi (mimo vychozi VLAN 1) ===\nSwitch(config)# vlan 10\nSwitch(config-vlan)# name Zamestnanci\nSwitch(config)# vlan 20\nSwitch(config-vlan)# name Hoste\nSwitch(config)# vlan 30\nSwitch(config-vlan)# name Voice\nSwitch(config)# vlan 999\nSwitch(config-vlan)# name Native_Unused\n\n! === 2. Access port s Voice VLAN pro PC + IP telefon (vypnute DTP!) ===\nSwitch(config)# interface GigabitEthernet0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10\nSwitch(config-if)# switchport voice vlan 30\nSwitch(config-if)# switchport nonegotiate\n\n! === 3. Zabezpeceny Trunk port mezi switchi (Native VLAN 999, bez DTP) ===\nSwitch(config)# interface GigabitEthernet0/24\nSwitch(config-if)# switchport trunk encapsulation dot1q\nSwitch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk native vlan 999\nSwitch(config-if)# switchport trunk allowed vlan 10,20,30\nSwitch(config-if)# switchport nonegotiate\n\n! === 4A. Inter-VLAN Routing na L3 Switchi (wire-speed SVI) ===\nL3Switch(config)# ip routing\nL3Switch(config)# interface Vlan10\nL3Switch(config-if)# ip address 10.10.10.1 255.255.255.0\nL3Switch(config)# interface Vlan30\nL3Switch(config-if)# ip address 10.30.30.1 255.255.255.0\n\n! === 4B. Alternativa na externim Routeru (Router-on-a-Stick) ===\nRouter(config)# interface GigabitEthernet0/0.10\nRouter(config-subif)# encapsulation dot1Q 10\nRouter(config-subif)# ip address 10.10.10.1 255.255.255.0"
            },
            {
              label: "MikroTik RouterOS — Bridge VLAN Filtering (PVID Access, Tagged Trunk, L3 rozhraní)",
              lang: "routeros",
              code: "# 1. Vytvoreni Bridge (nejdriv vlan-filtering=no, nebo pracovat v Safe Mode)\n/interface bridge add name=br-lan vlan-filtering=no\n\n# 2. Prirazeni Access portu (PVID) a Trunk portu (ether2)\n/interface bridge port add bridge=br-lan interface=ether2 pvid=999 comment=\"Trunk (Native 999)\"\n/interface bridge port add bridge=br-lan interface=ether3 pvid=10 frame-types=admit-only-untagged-and-priority-tagged comment=\"Access VLAN 10\"\n/interface bridge port add bridge=br-lan interface=ether4 pvid=20 frame-types=admit-only-untagged-and-priority-tagged comment=\"Access VLAN 20\"\n\n# 3. Tabulka znackovani 802.1Q (tagged = Trunk + CPU br-lan pro L3 brany)\n/interface bridge vlan add bridge=br-lan vlan-ids=10 tagged=br-lan,ether2 untagged=ether3\n/interface bridge vlan add bridge=br-lan vlan-ids=20 tagged=br-lan,ether2 untagged=ether4\n/interface bridge vlan add bridge=br-lan vlan-ids=30 tagged=br-lan,ether2\n\n# 4. L3 VLAN rozhrani (Router-on-a-Stick / SVI ekvivalent na br-lan)\n/interface vlan add interface=br-lan name=vlan10-emp vlan-id=10\n/interface vlan add interface=br-lan name=vlan20-guest vlan-id=20\n/ip address add address=10.10.10.1/24 interface=vlan10-emp\n/ip address add address=10.20.20.1/24 interface=vlan20-guest\n\n# 5. Aktivace hardwaroveho filtrovani VLAN\n/interface bridge set br-lan vlan-filtering=yes"
            }
          ],
          practicalTip: "Při návrhu Trunk spojů v produkci vždy nastavte na obou koncích shodnou nepoužívanou Native VLAN (např. 999), vypněte automatické vyjednávání trunku (`switchport nonegotiate`) a povolte pouze nutné VLAN pomocí `allowed vlan`. Na Cisco switchi ověříte stav příkazy `show vlan brief` a `show interfaces trunk`."
        },
        quiz: [
          {
            question: "Jakou hodnotu má 2bajtové pole TPID v 4bajtové značce IEEE 802.1Q a kolik bitů je vyhrazeno pro samotné číslo VLAN (VID)?",
            options: [
              "TPID 0x0800 a 8 bitů pro VID (VLAN 1–254)",
              "TPID 0x86DD a 16 bitů pro VID (VLAN 1–65535)",
              "TPID 0x8100 a 12 bitů pro VID (použitelné VLAN 1–4094)",
              "TPID 0x8100 a 3 bity pro VID (VLAN 0–7)"
            ],
            correctIndex: 2,
            explanation: "Hlavička IEEE 802.1Q začíná hodnotou TPID 0x8100 (2 B), po ní následují 3 bity PCP (802.1p priorita), 1 bit DEI a 12 bitů VID (rozsah 0–4095, přičemž 1–4094 jsou použitelné VLAN)."
          },
          {
            question: "Co znamená parametr PVID na Access portu řízeného switche?",
            options: [
              "Číslo VLAN, které switch přiřadí příchozím neoznačeným (untagged) rámcům z připojeného koncového zařízení.",
              "Maximální přenosovou rychlost portu v Mb/s.",
              "Heslo pro šifrování provozu na Trunk lince.",
              "Počet sekund, po které zůstane záznam v ARP tabulce."
            ],
            correctIndex: 0,
            explanation: "PVID (Port VLAN ID) určuje výchozí VLAN, do které switch zařadí neoznačené rámce přicházející z koncové stanice na Access portu."
          },
          {
            question: "Proč je nebezpečné ponechat na Trunk portu výchozí Native VLAN 1 pro běžný uživatelský provoz a jak se proti útoku VLAN Hopping (Double-Tagging) bráníme?",
            options: [
              "Native VLAN 1 snižuje rychlost Ethernetu na 10 Mb/s; bráníme se výměnou kabelu za koaxiální.",
              "Native VLAN blokuje všechny ICMP pakety; obranou je zapnutí režimu Hub.",
              "VLAN 1 nepodporuje protokol IPv4; obranou je vypnutí protokolu ARP.",
              "Útočník může vložit dva 802.1Q tagy, přičemž první switch vnější tag Native VLAN odstraní a vnitřní tag projde do cizí VLAN; obranou je přesunout Native VLAN na nepoužívané ID a vypnout DTP."
            ],
            correctIndex: 3,
            explanation: "Pokud má útočníkův port stejné VLAN ID jako Native VLAN trunku, první switch sundá vnější hlavičku a nechtěně přepošle rámec se zbylým vnitřním tagem do cílové VLAN. Změna Native VLAN na nepoužívané ID (nebo její tagování) a vypnutí DTP útoku zabrání."
          },
          {
            question: "Jaký je hlavní rozdíl mezi Router-on-a-Stick a směrováním přes SVI na L3 switchi při Inter-VLAN routingu?",
            options: [
              "Router-on-a-Stick umí směrovat jen protokol UDP, zatímco L3 SVI jen TCP.",
              "Router-on-a-Stick vede veškerý provoz mezi VLAN tam a zpět přes jeden Trunk kabel k externímu routeru, kdežto L3 switch s SVI směruje mezi VLAN přímo v interním hardwaru (ASIC) plnou rychlostí.",
              "L3 SVI nevyžaduje žádné IP adresy pro brány jednotlivých VLAN.",
              "Router-on-a-Stick funguje výhradně přes Wi-Fi v pásmu 5 GHz."
            ],
            correctIndex: 1,
            explanation: "U Router-on-a-Stick sdílí veškerý mezi-VLANový provoz jeden Trunk port k externímu routeru (úzké hrdlo). L3 switch má virtuální SVI rozhraní pro každou VLAN a směruje pakety interně v ASIC čipech."
          }
        ]
      },

      // =========================================================================
      // TÉMA 8: Adresování v síti: IPv4, IPv6, MAC adresa a protokol ARP
      // =========================================================================
      {
        id: "ip-mac-arp",
        number: 8,
        moduleId: "addressing-services",
        mandatory: false,
        title: "Adresování v síti: IPv4, IPv6, MAC a protokol ARP",
        shortTitle: "IP, MAC a ARP",
        subtitle: "Proč potřebujeme logickou i fyzickou adresu a jak protokol ARP překládá IP na MAC.",
        cardSummary: "Rozdíl mezi 48bitovou MAC a IPv4/IPv6 adresou a překlad IP na MAC pomocí protokolu ARP.",
        difficulty: "Střední",
        accentColor: "#f59e0b",
        tags: ["IPv4", "IPv6", "MAC adresa", "OUI výrobce", "ARP Request/Reply", "arp -a"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/ip-mac-arp.mp4",
          poster: "media/posters/ip-mac-arp.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. IP a MAC adresy (0:00)", time: 0 },
            { label: "2. Protokol ARP – Broadcast → Unicast (0:06)", time: 6.0 }
          ],
          transcript: "0:00–0:06: IP a MAC adresy – „Každé zařízení má logickou IP a fyzickou MAC adresu na síťové kartě.“\n0:06–0:13: Protokol ARP – „Když počítač zná jen IP cíle, zjistí jeho MAC adresu dotazem protokolu ARP.“"
        },
        animationType: "ip-mac-arp",
        labType: "arp-walkthrough",
        takeaways: [
          "MAC adresa (L2) je 48bitová fyzická adresa vypálená v síťové kartě (zápis v HEX, např. 00:1A:2B:3C:4D:5E); platí pouze v rámci lokální sítě (LAN).",
          "První 3 bajty (24 bitů) MAC adresy tvoří kód výrobce OUI, další 3 bajty jsou unikátní sériové číslo rozhraní.",
          "IPv4 (32 bitů) a IPv6 (128 bitů) jsou logické a směrovatelné L3 adresy – zůstávají stejné od zdroje k cíli, zatímco MAC adresy se mění na každém routeru.",
          "Protokol ARP zjišťuje neznámou MAC adresu ke známé IPv4: pošle všesměrový ARP Request (broadcast FF:FF:FF:FF:FF:FF) a dostane adresný ARP Reply (unicast)."
        ],
        principle: {
          problem: "Pokud má každý počítač z výroby jedinečnou MAC adresu, proč si vůbec vymýšlíme další IP adresy – a jak síťová karta zjistí, na jakou MAC adresu má poslat ethernetový rámec, když uživatel zná jen IP adresu?",
          explanation: [
            "Každá síťová karta (Ethernet i Wi-Fi) má od výrobce přidělenu 48bitovou fyzickou adresu zvanou MAC adresa (Media Access Control). Zapisuje se jako šest dvojic hexadecimálních číslic (např. D4:5D:64:1A:2B:3C). První polovina (OUI – Organizationally Unique Identifier) označuje výrobce (Intel, Cisco, MikroTik, Realtek), druhá polovina konkrétní čip. MAC adresa ale nemá žádnou geografickou hierarchii – switch ji umí najít v jedné budově, ale přes miliardy zařízení na Internetu podle MAC adresy směrovat nelze.",
            "K globálnímu směrování slouží logické adresy na 3. vrstvě. Adresa IPv4 má 32 bitů (4 bajty oddělené tečkou v desítkové soustavě, např. 192.168.1.10), což dává přibližně 4,3 miliardy adres – ty jsou dnes již vyčerpány. Nástupcem je IPv6 se 128 bity (8 skupin po 4 hexadecimálních znacích, např. 2001:0db8:85a3::8a2e:0370:7334), kde adresní prostor vystačí na dlouhá staletí dopředu.",
            "Při cestě dat sítí se oba typy adres skvěle doplňují: zdrojová a cílová IP adresa určují původce a konečného příjemce napříč celým světem a během cesty se nemění (pokud se nepoužije NAT). Naproti tomu MAC adresy v hlavičce L2 rámce slouží pouze k předání dat na bezprostředně další zařízení v témže kabelovém či bezdrátovém segmentu – každý router po cestě staré MAC adresy zahodí a zabalí paket do rámce s novými MAC adresami pro další skok.",
            "Aby PC-A mohlo sestavit L2 rámec pro známou IP adresu v lokální síti (např. 192.168.1.20), potřebuje znát její MAC adresu. Nejprve nahlédne do své dočasné ARP tabulky (cache). Pokud tam záznam není, použije protokol ARP (Address Resolution Protocol): vyšle všem zařízením v LAN zprávu ARP Request (L2 cílová MAC FF:FF:FF:FF:FF:FF) s dotazem „Kdo má IP 192.168.1.20?“. Všichni ostatní paket zahodí, pouze vlastník této IP odpoví přímo (unicast) zprávou ARP Reply se svou MAC adresou."
          ],
          steps: [
            {
              step: "1. Kontrola lokální sítě a ARP cache",
              detail: "PC-A pomocí masky zjistí, zda je cílová IP ve stejné síti. Pokud ano, hledá cílovou IP v lokální ARP tabulce; pokud je cíl za hranicí sítě, hledá v ARP tabulce IP adresu výchozí brány (routeru)!"
            },
            {
              step: "2. Odeslání ARP Request (Broadcast)",
              detail: "Pokud záznam chybí, PC-A odešle ethernetový rámec s cílovou MAC adresou FF:FF:FF:FF:FF:FF. Switch tento dotaz rozešle do všech portů v LAN."
            },
            {
              step: "3. Vyhodnocení na stanicích",
              detail: "Stanice, kterým dotazovaná IP nepatří, ARP Request tiše ignorují. Pouze cílové PC-B (nebo router) si rovnou zapíše IP a MAC odesílatele PC-A."
            },
            {
              step: "4. Odpověď ARP Reply (Unicast)",
              detail: "PC-B odešle zpět přímou odpověď adresovanou přímo na MAC adresu PC-A: „IP 192.168.1.20 je na mojí MAC adrese BB:BB:BB:BB:BB:BB“."
            },
            {
              step: "5. Uložení a odeslání dat",
              detail: "PC-A si záznam uloží do ARP cache (obvykle na několik minut) a konečně odešle připravený datový paket zabalený do L2 rámce."
            }
          ],
          analogy: "IP adresa je vaše trvalé bydliště na obálce dopisu (zůstává po celou cestu z Prahy do Londýna). MAC adresa je poznávací značka dodávky na každém úseku trasy – na hranicích nebo překladišti (router) se dopis přeloží do jiné dodávky s novou SPZ (nová MAC), ale adresa na obálce (IP) se nemění. ARP je pak výkřik řidiče na dvoře firmy: „Kdo má na starosti zakázku číslo 20? Potřebuju tvou SPZ!“",
          comparisonTable: {
            headers: ["Vlastnost", "MAC adresa", "IPv4 adresa", "IPv6 adresa"],
            rows: [
              ["Vrstva ISO/OSI", "2. Linková (L2)", "3. Síťová (L3)", "3. Síťová (L3)"],
              ["Velikost", "48 bitů (6 bajtů)", "32 bitů (4 bajty)", "128 bitů (16 bajtů)"],
              ["Zápis", "Hexadecimální (00:1A:2B:3C:4D:5E)", "Desítkové oktety (192.168.1.10)", "Hexadecimální skupiny (2001:db8::1)"],
              ["Přidělování", "Pevně výrobcem (OUI + sériové č.)", "Ručně nebo přes DHCP", "SLAAC, DHCPv6 nebo ručně"],
              ["Platnost / Dosah", "Pouze lokální segment (LAN)", "Globálně směrovatelná přes routery", "Globálně směrovatelná přes routery"]
            ]
          },
          watchOut: "Pozor na zásadní chyták u ARP: když posíláte paket na server na Internetu (např. 1.1.1.1), ARP dotaz se NIKDY neptá na IP 1.1.1.1 (broadcast do Internetu ani neprojde)! Počítač pomocí ARP zjišťuje MAC adresu své místní výchozí brány (routeru), protože přes ni posílá všechny pakety mimo svou síť. Mimochodem, v IPv6 už ARP neexistuje – nahradil jej protokol NDP (Neighbor Discovery Protocol)."
        },
        example: {
          scenarioTitle: "Prohlídka ARP tabulky a identifikace MAC adresy výrobce",
          scenarioText: "V příkazové řádce si můžete okamžitě zobrazit aktuálně naučené dvojice IP → MAC adresa a z prvních tří bajtů (OUI) zjistit výrobce síťové karty nebo routeru.",
          codeBlocks: [
            {
              label: "Windows / Linux – výpis ARP tabulky (arp -a / ip neigh)",
              lang: "bash",
              code: "C:\\> arp -a\nRozhraní: 192.168.10.25 --- 0x6\n  Internetová adresa    Fyzická adresa        Typ\n  192.168.10.1          d4-ca-6d-12-34-56     dynamický  (OUI D4:CA:6D = MikroTik!)\n  192.168.10.50         00-1b-21-ab-cd-ef     dynamický  (OUI 00:1B:21 = Intel Corp.)\n  192.168.10.255        ff-ff-ff-ff-ff-ff     statický   (L3/L2 Broadcast)"
            },
            {
              label: "Linux – moderní náhrada příkazu arp přes iproute2",
              lang: "bash",
              code: "$ ip neigh show\n192.168.10.1 dev eth0 lladdr d4:ca:6d:12:34:56 REACHABLE\n192.168.10.50 dev eth0 lladdr 00:1b:21:ab:cd:ef STALE"
            }
          ],
          practicalTip: "Když v síti řešíte duplicitní IP adresu nebo podezření na útok ARP spoofing (podvržení brány cizím zařízením), výpis arp -a vám ihned odhalí, zda se pod dvěma různými IP adresami neobjevuje podezřelá MAC adresa útočníka. Pomůže i vyčištění cache příkazem arp -d * (jako správce)."
        },
        quiz: [
          {
            question: "Co znamená první polovina MAC adresy (prvních 24 bitů, např. D4:CA:6D u adresy D4:CA:6D:12:34:56)?",
            options: [
              "Číslo podsítě podle masky",
              "Identifikátor výrobce síťového rozhraní (OUI)",
              "Veřejnou IP adresu poskytovatele Internetu",
              "Číslo TCP portu aplikace"
            ],
            correctIndex: 1,
            explanation: "První 3 bajty (24 bitů) MAC adresy tvoří OUI (Organizationally Unique Identifier), který organizace IEEE přiděluje konkrétnímu výrobci (např. MikroTik, Intel, Cisco)."
          },
          {
            question: "Počítač 192.168.1.10 chce odeslat data na server 8.8.8.8 za routerem 192.168.1.1. Jakou cílovou IP a jakou cílovou MAC adresu zapíše do odcházejícího rámce?",
            options: [
              "Cílová IP 8.8.8.8, cílová MAC adresa výchozí brány 192.168.1.1",
              "Cílová IP 192.168.1.1, cílová MAC adresa serveru 8.8.8.8",
              "Cílová IP 8.8.8.8, cílová MAC adresa serveru 8.8.8.8",
              "Cílová IP FF:FF:FF:FF:FF:FF, cílová MAC 192.168.1.1"
            ],
            correctIndex: 0,
            explanation: "Cílová IP adresa v paketu je konečný příjemce (8.8.8.8), ale protože je v jiné síti, L2 rámec musí putovat na nejbližší skok – tedy na MAC adresu výchozí brány (192.168.1.1)."
          },
          {
            question: "Jakým způsobem se šíří zprávy protokolu ARP v lokální síti?",
            options: [
              "ARP Request je unicast a ARP Reply je broadcast",
              "Oba typy zpráv jsou vždy broadcast",
              "ARP Request je L2 broadcast (FF:FF:FF:FF:FF:FF) a ARP Reply je unicast",
              "ARP zprávy směrují výhradně DNS servery na portu 53"
            ],
            correctIndex: 2,
            explanation: "Tázající se stanice ještě nezná cílovou MAC, proto pošle ARP Request jako broadcast všem. Cíl již MAC odesílatele zná z dotazu, takže odpoví adresně (unicast)."
          }
        ]
      },

      // =========================================================================
      // TÉMA 9: Veřejné a privátní IP adresy (RFC 1918), Maska sítě a Broadcast
      // =========================================================================
      {
        id: "public-private-mask",
        number: 9,
        moduleId: "addressing-services",
        mandatory: false,
        title: "Veřejné a privátní IP, maska sítě a broadcast",
        shortTitle: "Veřejné/Privátní IP & Maska",
        subtitle: "RFC 1918, speciální rozsahy (Loopback, APIPA, RFC 5737), konec tříd A/B/C a binární výpočet sítě.",
        cardSummary: "Veřejné vs. privátní rozsahy RFC 1918, speciální bloky a binární výpočet sítě z masky.",
        difficulty: "Střední",
        accentColor: "#eab308",
        tags: ["RFC 1918", "RIPE NCC / IANA", "Maska sítě", "Broadcast", "APIPA / Loopback", "CIDR"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/public-private-mask.mp4",
          poster: "media/posters/public-private-mask.jpg",
          startTime: 0,
          durationLabel: "0:14",
          chapters: [
            { label: "1. Maska sítě – Síť vs. Host (0:00)", time: 0 },
            { label: "2. Privátní vs. veřejné IP (0:06)", time: 6.0 }
          ],
          transcript: "0:00–0:06: Maska sítě – „Maska sítě odděluje v IP adrese část sítě od konkrétního zařízení.“\n0:06–0:14: Privátní vs. veřejné IP – „Privátní adresy slouží uvnitř lokální sítě, v internetu pak jedinečné veřejné adresy.“"
        },
        animationType: "ip-classes-mask",
        labType: "ip-classifier",
        takeaways: [
          "Globální příděl IP adres řídí organizace IANA, pro Evropu je spravuje regionální registr RIPE NCC; koncovým uživatelům je přidělují ISP.",
          "Privátní adresy dle RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) smí kdokoli použít ve své LAN, ale na veřejném Internetu se nesměrují.",
          "Speciální rozsahy, které musíte poznat na první pohled: 127.0.0.0/8 (Loopback – vlastní PC), 169.254.0.0/16 (APIPA – chyba DHCP) a 203.0.113.0/24 (RFC 5737 pro dokumentaci).",
          "Maska sítě odděluje jedničkami v binární podobě síťovou část od hostitelské: binární součin IP AND Maska = Adresa sítě; všechny jedničky v hostitelské části = Broadcast."
        ],
        principle: {
          problem: "Jak může mít milion lokálních sítí stejnou adresu 192.168.1.10 bez toho, aby se navzájem srazily – a jak router z jedné IP adresy pozná, kde končí adresa sítě a začíná adresa konkrétního počítače?",
          explanation: [
            "Správu veřejných IP adres na globální úrovni zastřešuje organizace IANA, která je rozděluje pěti regionálním registrům RIR – pro Evropu a část Asie je to RIPE NCC. Veřejná IP adresa je v Internetu globálně unikátní. Aby se však zpomalilo vyčerpání IPv4, definoval dokument RFC 1918 tři privátní rozsahy (10.0.0.0/8, 172.16.0.0/12 a 192.168.0.0/16). Ty jsou vyhrazeny pro vnitřní sítě (LAN) a internetové routery je na páteři automaticky zahazují; přístup ven vyžaduje překlad NAT na hraničním routeru.",
            "Kromě veřejných a privátních adres existují speciální rezervované rozsahy. Rozsah 127.0.0.0/8 (typicky 127.0.0.1) je Loopback – zpětná smyčka pro testování síťového zásobníku vlastního počítače bez opuštění operačního systému. Rozsah 169.254.0.0/16 je APIPA (Automatic Private IP Addressing) – Windows/macOS si z něj samy vygenerují adresu, když selže spojení s DHCP serverem. Pro dokumentaci a technické příklady jsou dle RFC 5737 vyhrazeny bloky TEST-NET, například 203.0.113.0/24.",
            "V 80. letech se IPv4 adresy dělily do pevných historických tříd podle prvního oktetu: třída A (1–126, výchozí maska /8), třída B (128–191, maska /16), třída C (192–223, maska /24), třída D pro multicast (224–239) a třída E experimentální (240–255). Toto tuhé dělení strašně plýtvalo adresami, proto jej v roce 1993 nahradilo beztřídní směrování CIDR, které umožňuje nastavit masku libovolné délky.",
            "Maska sítě (Subnet Mask) je 32bitové číslo tvořené zleva souvislou řadou binárních jedniček (označují Síťovou část – Network ID) následovaných nulami (Hostitelská část – Host ID). Provedeme-li logický součin (AND) mezi IP adresou a maskou, získáme adresu sítě (první adresu rozsahu, kterou nelze přiřadit PC). Nastavíme-li všechny hostitelské bity na 1, dostaneme Broadcast adresu pro všesměrové vysílání v rámci dané podsítě."
          ],
          steps: [
            {
              step: "1. Převod IP a masky do binární podoby",
              detail: "Například pro IP 172.16.45.130 a masku 255.255.255.128 (/25) převedeme poslední oktet: 130 = 10000010, maska 128 = 10000000."
            },
            {
              step: "2. Výpočet adresy sítě (IP AND Maska)",
              detail: "Kde má maska 1, bit zůstává (1); kde má 0, vynuluje se: 10000010 AND 10000000 = 10000000 (128). Adresa sítě je tedy 172.16.45.128."
            },
            {
              step: "3. Výpočet Broadcast adresy",
              detail: "Síťovou část (první bit: 1) necháme a všech 7 nulových hostitelských bitů nastavíme na 1: 11111111 (255). Broadcast je 172.16.45.255."
            },
            {
              step: "4. Určení použitelných hostů",
              detail: "První použitelný host je o 1 vyšší než adresa sítě (.129), poslední použitelný host je o 1 nižší než broadcast (.254)."
            }
          ],
          analogy: "Maska sítě funguje jako rozdělení telefonního čísla na předčíslí města a linku domu: samotná číslice bez znalosti délky předvolby nic neřekne. Teprve maska určí, kde končí „město“ (Network ID) a kde začíná konkrétní „číslo bytu“ (Host ID). Adresa sítě je pak cedule na vjezdu do města a Broadcast je městský rozhlas, který slyší každý byt uvnitř.",
          comparisonTable: {
            headers: ["Rozsah IPv4", "Prefix / Maska", "Kategorie / Norma", "Použití a chování na Internetu"],
            rows: [
              ["10.0.0.0 – 10.255.255.255", "/8 (255.0.0.0)", "Privátní (RFC 1918)", "Velké firemní sítě, operátoři – v Internetu nesměrovatelné"],
              ["172.16.0.0 – 172.31.255.255", "/12 (255.240.0.0)", "Privátní (RFC 1918)", "Střední firmy, virtualizace, Docker – nesměrovatelné"],
              ["192.168.0.0 – 192.168.255.255", "/16 (255.255.0.0)", "Privátní (RFC 1918)", "Domácnosti, SOHO, firmy – nesměrovatelné"],
              ["127.0.0.0 – 127.255.255.255", "/8 (255.0.0.0)", "Loopback (RFC 1122)", "Test lokálního stroje (127.0.0.1 = localhost)"],
              ["169.254.0.0 – 169.254.255.255", "/16 (255.255.0.0)", "APIPA / Link-Local", "Nouzová adresa při nedostupnosti DHCP serveru"],
              ["203.0.113.0 – 203.0.113.255", "/24 (255.255.255.0)", "TEST-NET-3 (RFC 5737)", "Vyhrazeno výhradně pro dokumentaci a příklady (nepatří nikomu!)"]
            ]
          },
          watchOut: "Pozor na dva velmi časté chytáky: zaprvé, rozsah třídy B privátních adres končí už na 172.31.255.255! Adresa 172.32.0.1 nebo 172.15.0.1 už je VEŘEJNÁ IP adresa v Internetu! Zadruhé, nezaměňujte 192.168.x.x s 192.0.2.x nebo 203.0.113.x – rozsah 203.0.113.0/24 patří mezi bezpečné dokumentační rozsahy RFC 5737 (uvidíte jej např. i v tématu o NAT a PAT)."
        },
        example: {
          scenarioTitle: "Binární výpočet sítě, prvního/posledního hosta a broadcastu",
          scenarioText: "Technik nastavil serveru adresu 172.16.45.130 s maskou 255.255.255.128 (/25). Pojďme přesně spočítat parametry této sítě a zkontrolovat, zda spadá do privátního rozsahu.",
          codeBlocks: [
            {
              label: "Postup výpočtu adresy sítě a broadcastu (poslední 4. oktet)",
              lang: "text",
              code: "IP adresa:     172.16.45.130  ->  4. oktet binárně: 10000010\nMaska (/25):   255.255.255.128 -> 4. oktet binárně: 10000000\n-------------------------------------------------------------\nBitový AND:                                         10000000 = 128\n\nVýsledky pro síť (celkem 2^7 - 2 = 126 použitelných hostů):\n  Síťová adresa (Network ID):  172.16.45.128\n  První použitelná IP:         172.16.45.129\n  Poslední použitelná IP:      172.16.45.254\n  Broadcast adresa:            172.16.45.255\n  Klasifikace IP:              Privátní RFC 1918 (leží v 172.16.0.0/12)"
            },
            {
              label: "Kontrola z příkazové řádky – stav APIPA při výpadku DHCP",
              lang: "bash",
              code: "C:\\> ipconfig\nAdaptér sítě Ethernet Ethernet0:\n   Automaticky nakonfigurovaná adresa IPv4 . . . : 169.254.88.14\n   Maska podsítě . . . . . . . . . . . . . . . : 255.255.0.0\n   Výchozí brána . . . . . . . . . . . . . . . : \n# Diagnostika: Chybí brána a adresa začíná 169.254 -> PC nedostalo IP z DHCP!"
            }
          ],
          practicalTip: "Když uvidíte na počítači ve Windows IP adresu začínající 169.254.x.x a prázdnou výchozí bránu, nejde o chybu internetu u ISP, ale o lokální problém: počítač neslyší DHCP server (např. vytažený kabel, špatná VLAN na portu nebo vypnutý DHCP server)."
        },
        quiz: [
          {
            question: "Která z následujících IPv4 adres NENÍ privátní podle RFC 1918 (jde o veřejnou adresu v Internetu)?",
            options: [
              "10.254.12.5",
              "172.20.14.8",
              "172.32.1.10",
              "192.168.100.1"
            ],
            correctIndex: 2,
            explanation: "Privátní rozsah 172.16.0.0/12 končí adresou 172.31.255.255. Adresa 172.32.1.10 už spadá do veřejného adresního prostoru."
          },
          {
            question: "Co znamená, když si pracovní stanice sama přiřadí IP adresu 169.254.42.19 s maskou 255.255.0.0?",
            options: [
              "Jde o testovací adresu lokální síťové karty (Loopback)",
              "Aktivoval se mechanismus APIPA, protože stanice marně hledala DHCP server",
              "Jde o veřejnou IP adresu přidělenou organizací RIPE NCC",
              "Stanice byla automaticky přepnuta na protokol IPv6"
            ],
            correctIndex: 1,
            explanation: "Rozsah 169.254.0.0/16 používá funkce APIPA jako nouzové řešení, když zařízení neobdrží konfiguraci od žádného DHCP serveru."
          },
          {
            question: "Jaká je adresa sítě (Network ID) a broadcastová adresa pro stanici s IP 192.168.5.70 a maskou 255.255.255.192 (/26)?",
            options: [
              "Síť 192.168.5.0, Broadcast 192.168.5.255",
              "Síť 192.168.5.128, Broadcast 192.168.5.191",
              "Síť 192.168.5.64, Broadcast 192.168.5.255",
              "Síť 192.168.5.64, Broadcast 192.168.5.127"
            ],
            correctIndex: 3,
            explanation: "Maska /26 (255.255.255.192) dělí čtvrtý oktet po blocích 64 adres (0, 64, 128, 192). Adresa .70 spadá do bloku 64–127, takže síť je .64 a broadcast .127."
          }
        ]
      }
    ],

    // =========================================================================
    // SLOVNÍČEK POJMŮ – ČÁST 1 (802.1Q + A–M, 42 pojmů)
    // =========================================================================
    glossary: [
      {
        term: "802.1Q",
        category: "Ethernet & VLAN",
        shortDef: "Standard IEEE vkládající 4bajtovou značku (tag) s číslem VLAN ID do ethernetového rámce na Trunk portech.",
        detail: "IEEE 802.1Q rozšiřuje klasický ethernetový rámec o 4 bajty obsahující TPID (0x8100), 3bitovou prioritu PCP (CoS pro QoS), 1bitový příznak DEI a 12bitové VLAN ID (1–4094). Díky tomu lze jedním Trunk kabelem bezpečně přenášet provoz desítek oddělených VLAN.",
        relatedTopicId: "vlan"
      },
      {
        term: "Access port",
        category: "Ethernet & VLAN",
        shortDef: "Port switche určený pro koncové zařízení (PC, tiskárnu, IP kameru), který posílá a přijímá neoznačené rámce jediné VLAN.",
        detail: "Koncová stanice o existenci VLAN obvykle neví a posílá běžné neoznačené (untagged) ethernetové rámce. Switch příchozímu rámci přiřadí číslo VLAN podle parametru PVID portu a při odesílání směrem ke stanici značku 802.1Q opět odstraní.",
        relatedTopicId: "vlan"
      },
      {
        term: "ACL (Access Control List)",
        category: "Firewall & SDN",
        shortDef: "Seznam bezstavových povolujících a zakazujících pravidel (permit/deny) vyhodnocovaných shora dolů.",
        detail: "Access Control List filtruje pakety podle L3/L4 kritérií (zdrojová a cílová IP adresa, protokol, port) bez sledování stavu relace. Používá se na routerech i L3 switchích k základní filtraci provozu nebo výběru adres pro NAT a QoS.",
        relatedTopicId: "firewall"
      },
      {
        term: "APIPA",
        category: "IP, Podsítě & Služby",
        shortDef: "Automatic Private IP Addressing – nouzové automatické adresování z rozsahu 169.254.0.0/16.",
        detail: "Pokud je operační systém nastaven na automatické získání adresy (DHCP), ale žádný DHCP server neodpoví, přidělí si rozhraní samo náhodnou adresu z bloku 169.254.0.0/16 a ověří pomocí ARP, zda ji nikdo nepoužívá. Umožní lokální spojení v jednom segmentu, nikoli však přístup k Internetu.",
        relatedTopicId: "public-private-mask"
      },
      {
        term: "ARP",
        category: "IP, Podsítě & Služby",
        shortDef: "Address Resolution Protocol – zjišťuje MAC adresu ke známé IPv4 adrese v lokální síti.",
        detail: "Když počítač chce poslat paket na známou IPv4 adresu v téže LAN (nebo na výchozí bránu), vyšle všesměrový dotaz ARP Request (L2 broadcast FF:FF:FF:FF:FF:FF) a cíl mu adresně (unicast) odpoví zprávou ARP Reply se svou MAC adresou. Výsledek se ukládá do ARP tabulky (příkaz arp -a).",
        relatedTopicId: "ip-mac-arp"
      },
      {
        term: "BGP",
        category: "Routování & NAT",
        shortDef: "Border Gateway Protocol – jediný směrovací protokol páteře Internetu propojující autonomní systémy (AS).",
        detail: "BGP je Path Vector protokol pracující nad TCP portem 179. Místo prostého počtu skoků či šířky pásma vybírá nejlepší trasu podle atributů cesty (AS-Path, Local Preference, MED) a směrovacích politik operátorů. Rozlišujeme eBGP (AD 20) mezi různými AS a iBGP (AD 200) uvnitř jednoho AS.",
        relatedTopicId: "routing"
      },
      {
        term: "Bluetooth / BLE",
        category: "Wi-Fi & IoT",
        shortDef: "Bezdrátová osobní technologie (WPAN) v pásmu 2.4 GHz: Classic pro audio stream, BLE pro úsporné IoT senzory.",
        detail: "Bluetooth Classic (BR/EDR) zajišťuje souvislý přenos zvuku (profily A2DP, HFP), kdežto Bluetooth Low Energy (BLE) přenáší krátké GATT zprávy a většinu času spí s výdrží na baterii měsíce až roky. Zařízení tvoří topologii Piconet (1 řídicí uzel a až 7 aktivních podřízených).",
        relatedTopicId: "bluetooth-iot"
      },
      {
        term: "Bridge",
        category: "Ethernet & VLAN",
        shortDef: "Síťový most na 2. vrstvě (L2), který propojuje dva segmenty LAN a filtruje rámce podle MAC adres.",
        detail: "Historicky předchůdce dnešního switche (víceportového mostu). Odděluje kolizní domény tím, že se učí MAC adresy na jednotlivých stranách a nepředává zbytečně lokální provoz z jednoho segmentu do druhého. Dodnes se s pojmem Bridge setkáte u virtualizace nebo v MikroTik RouterOS při spojování portů.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Broadcast",
        category: "IP, Podsítě & Služby",
        shortDef: "Všesměrové vysílání – zpráva doručovaná všem stanicím v dané síti či podsíti.",
        detail: "Rozlišujeme L2 broadcast na MAC adresu FF:FF:FF:FF:FF:FF a L3 broadcast na poslední adresu konkrétní IP podsítě (např. 192.168.1.255/24) nebo omezený broadcast 255.255.255.255. Routery L3 broadcasty standardně nepropouštějí dál, čímž ohraničují broadcastovou doménu.",
        relatedTopicId: "public-private-mask"
      },
      {
        term: "CAM tabulka",
        category: "Ethernet & VLAN",
        shortDef: "Paměťová tabulka switche mapující naučené MAC adresy na konkrétní fyzické porty.",
        detail: "Switch si při průchodu každého ethernetového rámce přečte zdrojovou MAC adresu a zapíše si do CAM (Content Addressable Memory) tabulky, ze kterého portu přišla (včetně čísla VLAN). Díky tomu při dalším přenosu posílá rámec jen na jediný cílový port místo rozesílání všem.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "CGNAT",
        category: "Routování & NAT",
        shortDef: "Carrier-Grade NAT – hromadný překlad adres na straně poskytovatele Internetu (sdílený rozsah 100.64.0.0/10).",
        detail: "Kvůli nedostatku veřejných IPv4 adres přidělují operátoři (zejména mobilní a menší ISP) domácím routerům místo veřejné IP adresu z bloku 100.64.0.0/10 (RFC 6598) a překlad provádějí na vlastních bránách. Nevýhodou je nemožnost zprovoznit příchozí Port Forwarding bez vyžádání veřejné IP.",
        relatedTopicId: "nat-pat"
      },
      {
        term: "CIDR",
        category: "IP, Podsítě & Služby",
        shortDef: "Classless Inter-Domain Routing – beztřídní směrování využívající libovolně dlouhý prefix za lomítkem (např. /26).",
        detail: "Systém zavedený v roce 1993 jako náhrada za neefektivní pevné třídy A, B, C. Umožňuje rozdělovat sítě na podsítě přesné velikosti (VLSM) i spojovat sousední sítě do větších bloků (supernetting / agregace tras) ve směrovacích tabulkách Internetu.",
        relatedTopicId: "subnetting-vlsm"
      },
      {
        term: "Cloud (IaaS/PaaS/SaaS)",
        category: "Základy a topologie",
        shortDef: "Pronájem výpočetních zdrojů, platforem nebo hotových aplikací přes síť podle aktuální spotřeby.",
        detail: "Rozděluje se do tří hlavních modelů: IaaS poskytuje virtuální servery a sítě (AWS EC2, Azure VM), PaaS dodává připravené běhové prostředí pro nasazení vlastního kódu (Firebase, Heroku) a SaaS nabízí koncovému uživateli kompletní aplikaci v prohlížeči (Microsoft 365, Google Workspace).",
        relatedTopicId: "client-server-cloud"
      },
      {
        term: "Control Plane",
        category: "Firewall & SDN",
        shortDef: "Řídicí rovina sítě (‚mozek‘), která rozhoduje o topologii, směrování a bezpečnostních pravidlech.",
        detail: "V tradičních sítích běží Control Plane odděleně na CPU každého routeru a switche (OSPF, BGP, STP). V architektuře SDN je Control Plane vyčleněn do centrálního kontroléru, který počítá pravidla globálně a programuje jimi podřízenou datovou rovinu.",
        relatedTopicId: "sdn"
      },
      {
        term: "CSMA/CA",
        category: "Wi-Fi & IoT",
        shortDef: "Carrier Sense Multiple Access with Collision Avoidance – metoda vyhýbání se kolizím ve Wi-Fi sítích.",
        detail: "Na rozdíl od drátového kabelu nedokáže Wi-Fi karta při vysílání zároveň poslouchat, zda nedošlo ke kolizi. Proto před vysíláním nejdříve naslouchá, náhodně vyčkává (backoff) a případně používá potvrzovací rámce RTS/CTS, aby se kolizím předem vyhnula.",
        relatedTopicId: "wifi-soho"
      },
      {
        term: "CSMA/CD",
        category: "Ethernet & VLAN",
        shortDef: "Carrier Sense Multiple Access with Collision Detection – historická přístupová metoda pro poloduplexní Ethernet.",
        detail: "Stanice na sdílené koaxiální sběrnici nebo na hubu před vysíláním poslouchá, zda je linka volná. Pokud začnou vysílat dvě stanice současně, detekují kolizi (nárůst napětí), vyšlou rušicí signál JAM a obě náhodnou dobu počkají. V dnešních full-duplex sítích se switchi už ke kolizím nedochází.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Data Plane",
        category: "Firewall & SDN",
        shortDef: "Datová (přeposílací) rovina sítě, která přepíná a směruje uživatelské pakety hardwarovou rychlostí.",
        detail: "Data Plane (Forwarding Plane) tvoří specializované čipy ASIC a síťové porty switchů či routerů. Nepočítá složité algoritmy – pouze bleskově vyhledává v tabulkách (CAM, FIB, OpenFlow flow table) připravených řídicí rovinou.",
        relatedTopicId: "sdn"
      },
      {
        term: "Datagram",
        category: "Modely & Transport",
        shortDef: "Datová jednotka (PDU) nespojovaného přenosu, typicky v protokolu UDP na 4. vrstvě.",
        detail: "Samostatná a nezávislá zpráva obsahující hlavičku se zdrojovým a cílovým portem i kontrolním součtem a vlastní uživatelská data. Na rozdíl od TCP segmentů nejsou datagramy součástí spolehlivého proudu – nečíslují se ani se při ztrátě automaticky neopakují.",
        relatedTopicId: "tcp-udp-ports"
      },
      {
        term: "Default Gateway",
        category: "Routování & NAT",
        shortDef: "Výchozí brána – IP adresa rozhraní routeru v lokální síti, kudy odcházejí pakety do jiných sítí.",
        detail: "Když stanice podle masky podsítě zjistí, že cílová IP adresa neleží v její lokální síti (např. přistupuje na web v Internetu), předá paket na MAC adresu své výchozí brány. Bez správně nastavené výchozí brány funguje komunikace jen uvnitř místní LAN.",
        relatedTopicId: "routing"
      },
      {
        term: "DHCP",
        category: "IP, Podsítě & Služby",
        shortDef: "Dynamic Host Configuration Protocol – automaticky přiděluje klientům IP adresu, masku, bránu a DNS.",
        detail: "Pracuje na UDP portech 67 (server) a 68 (klient) prostřednictvím čtyřkrokového procesu DORA (Discover, Offer, Request, Acknowledge). Zabraňuje chybám při ručním vyplňování IP parametrů a konfliktům duplicitních adres v síti.",
        relatedTopicId: "dhcp"
      },
      {
        term: "DHCP Relay (IP Helper)",
        category: "IP, Podsítě & Služby",
        shortDef: "Funkce routeru zachytávající broadcast DHCP Discover a přeposílající jej jako unicast centrálnímu DHCP serveru v jiné podsíti.",
        detail: "Protože routery oddělují broadcastové domény, dotaz DHCP Discover by se normálně nedostal za hranici místní VLAN. DHCP Relay (v Cisco IOS `ip helper-address`) přeloží broadcast na cílený unicast dotaz pro vzdálený DHCP server a doručí odpověď zpět klientovi.",
        relatedTopicId: "dhcp"
      },
      {
        term: "DMZ",
        category: "Firewall & SDN",
        shortDef: "Demilitarizovaná zóna – izolovaná síťová zóna mezi nedůvěryhodným Internetem (WAN) a vnitřní sítí (LAN) pro veřejné servery.",
        detail: "Do DMZ se umisťují webové, poštovní nebo DNS servery dostupné z Internetu. Firewall povoluje příchozí provoz z WAN pouze na vybrané porty v DMZ, ale přísně zakazuje, aby server v DMZ sám otevíral spojení do vnitřní LAN.",
        relatedTopicId: "firewall"
      },
      {
        term: "DNS",
        category: "IP, Podsítě & Služby",
        shortDef: "Domain Name System – hierarchický distribuovaný systém překládající doménová jména na IP adresy.",
        detail: "Využívá port 53 (UDP pro běžné dotazy, TCP pro zónové přenosy a dlouhé odpovědi). Ukládá záznamy typu A (IPv4), AAAA (IPv6), MX (pošta), CNAME (alias), NS, PTR a TXT, které si resolvery dočasně ukládají do cache podle parametru TTL.",
        relatedTopicId: "dns"
      },
      {
        term: "DPI (Deep Packet Inspection)",
        category: "Firewall & SDN",
        shortDef: "Hloubková inspekce paketů analyzující kromě L3/L4 hlaviček i samotný aplikační obsah na L7 vrstvě.",
        detail: "DPI umožňuje firewallům nové generace (NGFW) rozpoznat konkrétní aplikaci (App-ID), zablokovat tunelování či zakázaný přenos dat bez ohledu na použitý TCP/UDP port a odhalit škodlivý kód v datovém proudu.",
        relatedTopicId: "firewall"
      },
      {
        term: "Duplex (Half/Full)",
        category: "Ethernet & VLAN",
        shortDef: "Režim obousměrné komunikace: poloduplex (Half) vysílá střídavě, plný duplex (Full) oběma směry současně.",
        detail: "Half-duplex funguje jako vysílačka (v jeden okamžik může mluvit jen jedna strana, typicky hub nebo Wi-Fi). Full-duplex používá oddělené páry vodičů v kabelu pro příjem (RX) a vysílání (TX) mezi PC a switchem, čímž zdvojnásobuje propustnost a zcela ruší kolize.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Enkapsulace",
        category: "Modely & Transport",
        shortDef: "Postupné balení dat směrem dolů vrstvami modelu ISO/OSI přidáváním hlaviček jednotlivých protokolů.",
        detail: "Aplikační data dostanou na L4 hlavičku s porty (Segment/Datagram), na L3 hlavičku s IP adresami (Paket), na L2 hlavičku s MAC adresami a kontrolní patičku FCS (Rámec) a na L1 se převedou na bity. Opačný proces na straně příjemce se nazývá dekapsulace.",
        relatedTopicId: "iso-osi"
      },
      {
        term: "Ethernet",
        category: "Ethernet & VLAN",
        shortDef: "Nejrozšířenější sada standardů (IEEE 802.3) pro drátové lokální sítě (LAN) na 1. a 2. vrstvě.",
        detail: "Definuje podobu ethernetového rámce, adresování pomocí 48bitových MAC adres, detekci chyb pomocí FCS i fyzická média od historického koaxiálu přes kroucenou dvoulinku (100BASE-TX, 1000BASE-T, 10GBASE-T) až po optická vlákna.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Firewall",
        category: "Firewall & SDN",
        shortDef: "Bezpečnostní prvek filtrující síťový provoz mezi zónami ve třech hlavních úrovních: Stateless, Stateful a NGFW.",
        detail: "Bezstavový (Stateless) firewall kontroluje každý paket izolovaně dle 5-tice L3/L4 údajů. Stavový (Stateful) sleduje tabulku spojení (NEW, ESTABLISHED, RELATED, INVALID). NGFW navíc přidává L7 hloubkovou inspekci DPI, App-ID, IPS/IDS a kontrolu TLS.",
        relatedTopicId: "firewall"
      },
      {
        term: "Hairpin NAT",
        category: "Routování & NAT",
        shortDef: "Zpětný překlad (NAT Loopback), který umožní klientům uvnitř LAN přistoupit k lokálnímu serveru přes jeho veřejnou IP adresu.",
        detail: "Pokud klient v LAN (192.168.1.10) osloví veřejnou IP brány přesměrovanou na interní server (192.168.1.50), odpověděl by server napřímo ze své privátní IP a klient by paket zahodil. Hairpin NAT přepíše i zdrojovou IP na adresu routeru, takže odpověď projde zpět přes bránu.",
        relatedTopicId: "nat-pat"
      },
      {
        term: "Host",
        category: "Základy a topologie",
        shortDef: "Jakékoli koncové zařízení připojené do IP sítě, které má přidělenou vlastní IP adresu.",
        detail: "Hostitelem (hostem) může být stolní počítač, notebook, telefon, síťová tiskárna, chytrá kamera nebo server. V terminologii podsítění pojem „počet hostů“ označuje počet adres, které lze těmto zařízením v síti přiřadit (2^h − 2).",
        relatedTopicId: "topologies-lan-wan"
      },
      {
        term: "IANA / RIPE NCC",
        category: "IP, Podsítě & Služby",
        shortDef: "Organizace koordinující globální (IANA) a evropské (RIPE NCC) přidělování veřejných IP adres a AS čísel.",
        detail: "IANA spravuje kořenovou zónu DNS a bloky IP adres celosvětově. Předává je pěti regionálním registrům (RIR); pro Evropu, Blízký východ a část střední Asie je to RIPE NCC sídlící v Amsterdamu, od něhož adresy získávají jednotliví ISP.",
        relatedTopicId: "public-private-mask"
      },
      {
        term: "ICMP",
        category: "Routování & NAT",
        shortDef: "Internet Control Message Protocol – servisní a diagnostický protokol 3. vrstvy.",
        detail: "Nepřenáší uživatelská data, ale chybová hlášení a řídicí zprávy (např. Cílový hostitel nedosažitelný, Vypršelo TTL). Využívají ho základní diagnostické nástroje ping (Echo Request / Echo Reply) a traceroute.",
        relatedTopicId: "routing"
      },
      {
        term: "Inter-VLAN Routing",
        category: "Ethernet & VLAN",
        shortDef: "Směrování provozu mezi izolovanými L2 VLAN sítěmi pomocí 3. vrstvy (Router-on-a-Stick nebo SVI na L3 switchi).",
        detail: "Protože každá VLAN tvoří samostatnou broadcastovou doménu i IP podsíť, nemohou stanice v různých VLAN komunikovat přímo přes L2 switch. Propojení zajišťuje router přes Trunk s logickými subrozhraními (Router-on-a-Stick) nebo hardwarově L3 switch přes virtuální rozhraní SVI.",
        relatedTopicId: "vlan"
      },
      {
        term: "IPS / IDS",
        category: "Firewall & SDN",
        shortDef: "Systémy detekce (IDS) a aktivní prevence (IPS) průniků odhalující síťové útoky a exploity podle signatur a anomálií.",
        detail: "IDS (Intrusion Detection System) pouze pasivně sleduje kopii provozu a při podezření vyvolá poplach. IPS (Intrusion Prevention System) stojí přímo v cestě provozu (často jako modul NGFW) a nebezpečné pakety dokáže v reálném čase okamžitě zahodit.",
        relatedTopicId: "firewall"
      },
      {
        term: "IPv4 / IPv6",
        category: "IP, Podsítě & Služby",
        shortDef: "Dvě verze síťového protokolu L3: starší 32bitová IPv4 a moderní 128bitová IPv6.",
        detail: "IPv4 nabízí 4,3 miliardy adres zapisovaných jako čtyři čísla (např. 192.168.1.1) a její vyčerpání obchází pomocí NATu. IPv6 přináší astronomických 3,4 × 10^38 adres v hexadecimálním zápisu (např. 2001:db8::1), zjednodušenou hlavičku a autokonfiguraci SLAAC bez nutnosti NAT.",
        relatedTopicId: "ip-mac-arp"
      },
      {
        term: "ISO/OSI",
        category: "Modely & Transport",
        shortDef: "Teoretický referenční model dělící síťovou komunikaci do 7 logicky oddělených vrstev.",
        detail: "Vrstvy od 1. po 7. jsou: Fyzická, Linková, Síťová, Transportní, Relační, Prezentační a Aplikační. Umožňuje srozumitelně popsat úlohy protokolů, zařadit síťová zařízení (Switch = L2, Router = L3) a lokalizovat síťové závady.",
        relatedTopicId: "iso-osi"
      },
      {
        term: "LAN / MAN / WAN",
        category: "Základy a topologie",
        shortDef: "Geografické dělení sítí na místní (LAN), metropolitní v rámci města (MAN) a rozlehlé (WAN).",
        detail: "LAN pokrývá budovu či areál pod vlastní správou (vysoká rychlost, nízká latence). MAN propojuje lokality v jednom městě, zatímco WAN spojuje vzdálená města a státy přes pronajaté linky telekomunikačních operátorů.",
        relatedTopicId: "topologies-lan-wan"
      },
      {
        term: "Lease Time",
        category: "IP, Podsítě & Služby",
        shortDef: "Doba pronájmu IP adresy přidělené klientovi ze serveru DHCP.",
        detail: "Po uplynutí 50 % doby pronájmu (čas T1) pošle klient DHCP serveru žádost o prodloužení (Renew). Pokud není úspěšný, v 87,5 % doby (T2) osloví broadcastem jakýkoli dostupný DHCP server; po vypršení celého Lease Time musí adresu přestat používat.",
        relatedTopicId: "dhcp"
      },
      {
        term: "Longest Prefix Match",
        category: "Routování & NAT",
        shortDef: "Základní pravidlo směrování: router ze všech shodných záznamů v tabulce vybere ten s nejdelší maskou (nejvíce shodných bitů).",
        detail: "Má-li router v tabulce zároveň 0.0.0.0/0, 192.168.0.0/16 a 192.168.2.0/24, paket pro 192.168.2.10 vždy použije trasu /24 bez ohledu na Administrativní vzdálenost – protože 24bitový prefix je nejpřesnější shoda.",
        relatedTopicId: "routing"
      },
      {
        term: "Loopback",
        category: "IP, Podsítě & Služby",
        shortDef: "Virtuální rozhraní zpětné smyčky (127.0.0.0/8, resp. ::1) pro komunikaci uvnitř téhož zařízení.",
        detail: "Pakety poslané na 127.0.0.1 (localhost) nikdy neopustí operační systém a signál vůbec nejde na síťovou kartu. Slouží k ověření správné funkce protokolu TCP/IP a k přístupu k lokálně běžícím webovým nebo databázovým serverům při vývoji.",
        relatedTopicId: "public-private-mask"
      },
      {
        term: "MAC adresa",
        category: "IP, Podsítě & Služby",
        shortDef: "Unikátní 48bitová fyzická adresa síťové karty používaná na 2. (Linkové) vrstvě.",
        detail: "Zapisuje se jako šest dvojic hexadecimálních znaků (např. 00:1A:2B:3C:4D:5E). Prvních 24 bitů určuje výrobce (OUI) a zbývajících 24 bitů je sériové číslo rozhraní. Switche podle ní doručují rámce uvnitř lokální sítě.",
        relatedTopicId: "ip-mac-arp"
      },
      {
        term: "Maska sítě",
        category: "IP, Podsítě & Služby",
        shortDef: "32bitové číslo oddělující binárními jedničkami síťovou část IPv4 adresy od hostitelské.",
        detail: "Může být zapsána dekadicky (např. 255.255.255.0) nebo jako CIDR prefix (/24). Logický součin (AND) mezi IP adresou a maskou určuje síťovou adresu, podle které počítač pozná, zda je cíl v místní LAN, nebo musí jít přes výchozí bránu.",
        relatedTopicId: "public-private-mask"
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
