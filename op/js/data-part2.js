/**
 * OP4 basics – Obecné principy počítačových sítí
 * Část 2: Témata 10–18 a Slovníček pojmů (část 2: N–Z)
 */
(function (global) {
  'use strict';

  global.__OP4_DATA_PART2__ = {
    topics: [
      // =========================================================================
      // TÉMA 10: Vytváření podsítí: CIDR a VLSM v praxi
      // =========================================================================
      {
        id: "subnetting-vlsm",
        number: 10,
        moduleId: "addressing-services",
        mandatory: false,
        title: "Vytváření podsítí: CIDR a VLSM v praxi",
        shortTitle: "Subnetting & VLSM",
        subtitle: "Zápis s lomítkem (/24–/32), vzorec 2^h − 2, P2P spoje /30 a /31 a návrh efektivních podsítí bez plýtvání adresami.",
        cardSummary: "Dělení IPv4 sítí na míru pomocí CIDR prefixů, vzorce 2^h − 2 a postupu VLSM od největší.",
        difficulty: "Pokročilé",
        accentColor: "#84cc16",
        tags: ["Subnetting", "CIDR (/24–/30)", "VLSM", "2^h - 2", "Magické číslo", "P2P /30 & /31"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/subnetting-vlsm.mp4",
          poster: "media/posters/subnetting-vlsm.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Dělení podsítí CIDR / VLSM (0:00)", time: 0 },
            { label: "2. Postup od největší podsítě (0:06)", time: 6.0 }
          ],
          transcript: "0:00–0:06: CIDR a VLSM – „Podsítění pomocí CIDR a metody VLSM dělí síť na menší bloky podle potřeby.“\n0:06–0:13: Postup VLSM – „Vždy začínáme od největší podsítě, abychom zbytečně neplýtvali IP adresami.“"
        },
        animationType: "subnetting",
        labType: "subnet-calc",
        takeaways: [
          "Prefix za lomítkem (např. /26) udává počet jedničkových síťových bitů v masce; počet zbývajících hostitelských bitů je h = 32 − prefix.",
          "Počet použitelných adres pro zařízení v podsíti spočítáme podle vzorce 2^h − 2 (odečítáme adresu sítě a broadcast).",
          "Při proměnlivé délce masky (VLSM) vždy začínáme rozdělovat síť od podsítě s NEJVĚTŠÍM počtem požadovaných hostů k nejmenší.",
          "Pro spojení dvou routerů (point-to-point) používáme v IPv4 masku /30 (2 použitelné IP) nebo úspornější RFC 3021 masku /31 (přesně 2 adresy bez sítě/broadcastu)."
        ],
        principle: {
          problem: "Dostali jste pro firemní pobočku rozsah 192.168.10.0/24 (254 adres). Potřebujete jej rozdělit na oddělenou síť pro oddělení Vývoj (50 PC), kancelářskou Wi-Fi (25 mobilů), serverovnu (12 serverů) a přímou linku mezi routery (2 IP) – jak to udělat tak, abyste adresami neplýtvali a podsítě se nepřekrývaly?",
          explanation: [
            "Klasické dělení sítě na stejně velké díly (FLSM) by v tomto případě selhalo: pokud bychom síť /24 rozčtvrtili na čtyři sítě /26 (každá má 62 hostů), už by nezbylo žádné místo pro další rozšíření a na propojovací lince mezi dvěma routery by 60 adres leželo zcela zbytečně ladem.",
            "Řešením je metoda VLSM (Variable-Length Subnet Masking – podsíťování s proměnlivou délkou masky). Délku prefixu volíme pro každou podsíť přesně na míru podle požadavku na počet hostů. Z prefixu určíme počet hostitelských bitů h = 32 − prefix a ověříme, že platí podmínka (2^h − 2) ≥ požadovaný počet hostů.",
            "Pro bleskový výpočet hranic podsítí bez psaní dlouhých binárních tabulek používáme tzv. magické číslo (velikost bloku = 2^h ve čtvrtém oktetu, nebo 256 − hodnota posledního nenulového oktetu masky). Pro /26 (maska .192) je velikost bloku 256 − 192 = 64; podsítě tedy vždy začínají na násobcích 64 (.0, .64, .128, .192). Pro /27 (maska .224) je krok 32, pro /28 (.240) je krok 16 a pro /30 (.252) jen 4 adresy. Kromě klasického P2P spoje /30 umožňuje norma RFC 3021 na dvoubodových linkách mezi routery použít i masku /31 (obě adresy bez adresy sítě a broadcastu, 0 % plýtvání), zatímco prefix /32 označuje jediného hostitele nebo Loopback rozhraní.",
            "Zlaté pravidlo VLSM zní: požadavky na podsítě VŽDY seřaďte sestupně od NEJVĚTŠÍHO počtu hostů k NEJMENŠÍMU! Každá podsíť totiž musí začínat na násobku své vlastní velikosti bloku. Pokud byste nejdříve ukrojili malou síť /30 (.0–.3), velký blok /26 nemůže začít na .4, protože 4 není dělitelná 64 – došlo by buď ke ztrátě místa, nebo k překryvu (overlapping), který router odmítne."
          ],
          steps: [
            {
              step: "1. Seřazení požadavků od největšího",
              detail: "Srovnáme požadavky sestupně: Oddělení Vývoj (50 hostů) → Kancelářská Wi-Fi (25 hostů) → Serverovna (12 hostů) → P2P spoj R1–R2 (2 hosté)."
            },
            {
              step: "2. Výpočet masky přes 2^h − 2",
              detail: "Pro 50 hostů potřebujeme 2^6 − 2 = 62 (h=6, tedy /26). Pro 25 hostů h=5 (/27, 30 hostů). Pro 12 hostů h=4 (/28, 14 hostů). Pro 2 hosty h=2 (/30, 2 hosté)."
            },
            {
              step: "3. Přiřazení 1. bloku (/26)",
              detail: "Začínáme na 192.168.10.0/26 (krok 64). Rozsah je .0 až .63 (hosté .1–.62, broadcast .63)."
            },
            {
              step: "4. Navázání menších bloků (/27, /28, /30)",
              detail: "Další volná adresa je .64: dáme jí /27 (.64–.95). Následuje .96/28 (.96–.111) a nakonec .112/30 (.112–.115)."
            },
            {
              step: "5. Kontrola a rezerva",
              detail: "Adresy .116 až .255 zůstávají volné pro další patra či oddělení a žádná z podsítí se s jinou nepřekrývá."
            }
          ],
          analogy: "VLSM je jako krájení velké obdélníkové pizzy nebo skládání krabic do kufru auta: nejdříve do prázdného kufru vložíte největší krabici (/26), vedle ní střední krabici (/27), do mezery menší (/28) a zbylé rohy doplníte nejmenšími krabičkami (/30). Kdybyste nejmenší krabice naházeli doprostřed první, největší krabice se už do kufru bez rozbití nevejde.",
          comparisonTable: {
            headers: ["CIDR prefix", "Maska podsítě", "Velikost bloku", "Počet bitů hosta (h)", "Použitelní hosté (2^h − 2)"],
            rows: [
              ["/24", "255.255.255.0", "256", "8", "254"],
              ["/25", "255.255.255.128", "128", "7", "126"],
              ["/26", "255.255.255.192", "64", "6", "62"],
              ["/27", "255.255.255.224", "32", "5", "30"],
              ["/28", "255.255.255.240", "16", "4", "14"],
              ["/29", "255.255.255.248", "8", "3", "6"],
              ["/30", "255.255.255.252", "4", "2", "2 (klasický P2P spoj)"],
              ["/31", "255.255.255.254", "2", "1", "2 (RFC 3021 P2P mezi routery)"]
            ]
          },
          watchOut: "Nejčastější chyby při návrhu VLSM: 1) Správce zapomene odečíst 2 ve vzorci 2^h − 2 (např. pro 30 hostů vyjde prefix /27 přesně 32 − 2 = 30 bez rezervy, ale pro 31 hostů už musíte vzít /26!). 2) Technik zapomene zahrnout i IP adresu brány (routeru) do potřebného počtu adres – router v každé podsíti totiž zabírá jednu použitelnou IP adresu! 3) Začátek větší podsítě musí být násobkem její velikosti (např. /26 smí začínat jen na .0, .64, .128 nebo .192)."
        },
        example: {
          scenarioTitle: "Kompletní VLSM plán pro rozdělení firemní sítě 192.168.10.0/24",
          scenarioText: "Rozdělili jsme firemní síť 192.168.10.0/24 pro čtyři reálné požadavky seřazené sestupně od největšího po nejmenší. Podívejte se na přehlednou adresní tabulku a konfiguraci rozhraní na routeru.",
          codeBlocks: [
            {
              label: "Výsledná adresní tabulka VLSM pro 192.168.10.0/24",
              lang: "text",
              code: "Podsíť            | Potřeba | Prefix | Maska           | Síť            | Použitelný rozsah          | Broadcast\n------------------+---------+--------+-----------------+----------------+----------------------------+----------------\nOddělení Vývoj    | 50      | /26    | 255.255.255.192 | 192.168.10.0   | 192.168.10.1   - .62       | 192.168.10.63\nKancelářská Wi-Fi | 25      | /27    | 255.255.255.224 | 192.168.10.64  | 192.168.10.65  - .94       | 192.168.10.95\nServerovna        | 12      | /28    | 255.255.255.240 | 192.168.10.96  | 192.168.10.97  - .110      | 192.168.10.111\nP2P spoj R1-R2    | 2       | /30    | 255.255.255.252 | 192.168.10.112 | 192.168.10.113 - .114      | 192.168.10.115\nVolná rezerva     | --      | --     | --              | 192.168.10.116 | (zbývá 140 adres pro růst) | 192.168.10.255"
            },
            {
              label: "MikroTik RouterOS – přiřazení bran a P2P spoje na R1",
              lang: "routeros",
              code: "/ip address\nadd address=192.168.10.1/26   interface=ether2-vyvoj    comment=\"Brana Vyvoj\"\nadd address=192.168.10.65/27  interface=ether3-wifi     comment=\"Brana Wi-Fi\"\nadd address=192.168.10.97/28  interface=ether4-servery  comment=\"Brana Serverovna\"\nadd address=192.168.10.113/30 interface=ether1-p2p-r2   comment=\"Spoj na Router R2 (.114)\""
            }
          ],
          practicalTip: "Na routeru se obvykle nastavuje jako výchozí brána buď první použitelná adresa podsítě (např. .1, .65, .97), nebo poslední použitelná adresa (.62, .94, .110). Důležité je zvolit v síti jednotné pravidlo a dodržovat ho v celé dokumentaci."
        },
        quiz: [
          {
            question: "Kolik použitelných IP adres pro počítače a bránu obsahuje podsíť s prefixem /28 (maska 255.255.255.240)?",
            options: [
              "16 adres",
              "14 adres",
              "30 adres",
              "6 adres"
            ],
            correctIndex: 1,
            explanation: "U prefixu /28 zbývá pro hosty h = 32 − 28 = 4 bity. Podle vzorce 2^4 − 2 = 16 − 2 = 14 použitelných adres."
          },
          {
            question: "Proč při návrhu VLSM vždy rozdělujeme síť od požadavku s největším počtem hostů k nejmenšímu?",
            options: [
              "Aby se větší podsítě vždy zarovnaly na násobky své velikosti a nedošlo k překryvu rozsahů",
              "Protože routery neumí zpracovat masku /30 dříve než masku /24",
              "Protože nejmenší podsíť musí mít vždy nejvyšší adresu .255",
              "Jde jen o zvyk, pořadí rozdělování nemá na výsledek žádný vliv"
            ],
            correctIndex: 0,
            explanation: "Když jdeme od největší podsítě k nejmenší, konec každého bloku je vždy platným začátkem menšího bloku (např. 64 je dělitelné 32 i 16 i 4), takže nevznikají mezery ani překryvy."
          },
          {
            question: "Jakou masku zvolíte pro přímý spoj mezi dvěma routery (P2P linka), kde potřebujete pouze 2 použitelné IP adresy?",
            options: [
              "/28 (255.255.255.240)",
              "/29 (255.255.255.248)",
              "/30 (255.255.255.252)",
              "/32 (255.255.255.255)"
            ],
            correctIndex: 2,
            explanation: "Prefix /30 nechává 2 bity pro hosty: 2^2 − 2 = 2 použitelné adresy (plus 1 síťová a 1 broadcastová). Pro moderní P2P spoje routery podporují i RFC 3021 /31. Maska /32 označuje jediného hostitele."
          }
        ]
      },

      // =========================================================================
      // TÉMA 11: DHCP: Automatická konfigurace sítě
      // =========================================================================
      {
        id: "dhcp",
        number: 11,
        moduleId: "addressing-services",
        mandatory: false,
        title: "DHCP: Automatická konfigurace sítě",
        shortTitle: "DHCP (DORA)",
        subtitle: "Jak klient bez IP adresy získá kompletní síťovou konfiguraci přes 4krokový proces DORA, pronájem adres, DHCP Relay a statické rezervace.",
        cardSummary: "Automatické přidělování IP adres, masky, brány a DNS ve 4 krocích DORA a DHCP Relay.",
        difficulty: "Střední",
        accentColor: "#10b981",
        tags: ["DHCP", "DORA", "Lease Time", "DHCP Relay", "DHCP Snooping", "UDP 67/68"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/dhcp.mp4",
          poster: "media/posters/dhcp.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Přidělení IP, masky, brány a DNS (0:00)", time: 0 },
            { label: "2. Potvrzení ACK & obnova pronájmu (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Proces DORA – „Protokol DHCP automaticky přidělí novému zařízení IP adresu, masku sítě i bránu.“\n0:07–0:13: Potvrzení a obnova – „Probíhá ve čtyřech krocích od vyhledání serveru po potvrzení a pronájem se průběžně obnovuje.“"
        },
        animationType: "dhcp-dora",
        labType: "dora-stepper",
        takeaways: [
          "DHCP (Dynamic Host Configuration Protocol) běží nad UDP (server port 67, klient port 68) a automaticky přiděluje IPv4 adresu, masku podsítě, výchozí bránu (Default Gateway) a DNS servery.",
          "Přidělení adresy probíhá ve 4 krocích DORA: Discover (broadcast klienta) → Offer (nabídka serveru) → Request (výběr a potvrzení klienta) → Acknowledge (finální zápis pronájmu).",
          "Adresa je pouze pronajatá na dobu Lease Time; klient ji obnovuje v polovině doby pronájmu (T1 = 50 %) a v nouzi v 87,5 % (T2).",
          "DHCP Broadcast neprojde přes router — pro více podsítí použijeme DHCP Relay (IP Helper). Pro servery a tiskárny nastavujeme statickou DHCP rezervaci podle MAC adresy."
        ],
        principle: {
          problem: "Ruční nastavování IP adresy, masky, brány a DNS na každém notebooku, telefonu či kancelářském PC je pomalé, náchylné k překlepům a při přesunu zařízení mezi sítěmi vede k duplicitním IP adresám a výpadkům.",
          explanation: [
            "Protokol DHCP řeší automatickou konfiguraci sítě podle principu klient–server. Jakmile se zařízení připojí kabelem nebo přes Wi-Fi a ještě nemá IP adresu, pošle všesměrový (broadcast) dotaz, na který odpoví DHCP server v dané síti.",
            "Kromě samotné IPv4 adresy a masky podsítě předává DHCP server i další klíčové volby (DHCP Options): výchozí bránu (Option 3 – Router), adresy DNS serverů (Option 6), doménové jméno nebo NTP server. V sítích IPv6 se podobně používá automatická bezstavová konfigurace SLAAC (pomocí ICMPv6 zpráv Router Advertisement) nebo stavový DHCPv6 (UDP porty 546/547).",
            "Každá IP adresa z DHCP poolu (rozsahu) je přidělena jen na určitou dobu pronájmu (Lease Time, např. 8 hodin v kanceláři nebo 30 minut na veřejné Wi-Fi). Po uplynutí 50 % času (T1) klient pošle přímý unicast požadavek DHCP Request o prodloužení. Pokud server neodpoví, zkusí klient v 87,5 % času (T2) broadcast.",
            "Protože první zprávy DORA jsou L2/L3 broadcasty (255.255.255.255), router je standardně nepustí do jiné sítě. Pokud chceme mít jeden centrální DHCP server pro více VLAN nebo poboček, aktivujeme na routeru funkci DHCP Relay (v Cisco IOS příkaz ip helper-address), která zachytí broadcast a přepošle ho jako unicast přímo na DHCP server.",
            "Zařízení, která musí mít stále stejnou IP adresu (síťová tiskárna, kamera, NAS, server), buď nastavíme ručně mimo DHCP pool, nebo jim na DHCP serveru vytvoříme statickou rezervaci (Static Lease) svázanou s jejich unikátní MAC adresou."
          ],
          steps: [
            {
              step: "1. D – Discover (Klient → Broadcast)",
              detail: "Klient bez IP (zdroj 0.0.0.0:68) odešle broadcast na 255.255.255.255:67 (L2 cíl FF:FF:FF:FF:FF:FF): „Hledám jakýkoliv DHCP server v této síti.“"
            },
            {
              step: "2. O – Offer (Server → Klient)",
              detail: "Dostupný DHCP server (např. 192.168.1.1) vybere volnou IP ze svého poolu (např. 192.168.1.10/24) a pošle nabídku s maskou, bránou, DNS a dobou pronájmu."
            },
            {
              step: "3. R – Request (Klient → Broadcast)",
              detail: "Klient si vybere jednu nabídku (pokud odpovědělo více serverů) a broadcastem všem oznámí: „Přijímám IP 192.168.1.10 od serveru 192.168.1.1.“"
            },
            {
              step: "4. A – Acknowledge / ACK (Server → Klient)",
              detail: "Vybraný DHCP server si adresu v databázi pronájmů zamkne na MAC adresu klienta a odešle finální potvrzení ACK. Klient provede rychlou ARP kontrolu kolize a začne síť používat."
            }
          ],
          analogy: "Představte si půjčovnu lyží: přijdete ke dveřím a zeptáte se nahlas: ‚Kdo tu půjčuje lyže?‘ (Discover). Obsluha zvedne ruku a nabídne pár číslo 10 (Offer). Vy nahlas potvrdíte: ‚Beru si číslo 10 od pultu 1!‘ (Request), aby ostatní věděli, že už máte vybráno. Obsluha vám vystaví lístek na 8 hodin (Acknowledge) a vy musíte lyže vrátit nebo si pronájem včas prodloužit.",
          comparisonTable: {
            headers: ["Metoda přidělení IP", "Jak funguje", "Kdy se používá", "Výhoda / Riziko"],
            rows: [
              ["DHCP dynamický pronájem", "Server přidělí volnou IP z poolu na dobu Lease Time", "Notebooky, mobily, kanceláře, hosté na Wi-Fi", "Plně bezúdržbové; IP se může po čase změnit"],
              ["DHCP statická rezervace", "Server vždy přidělí stejnou IP konkrétní MAC adrese", "Tiskárny, PC-A v laboratoři, IP kamery, NAS", "Centrální správa i změna DNS/GW na jednom místě"],
              ["Ruční statická konfigurace", "Admin zadá IP, masku, GW a DNS přímo v OS", "Samotné routery, servery, správa infrastruktury", "Funguje i při výpadku DHCP; riziko překlepu a kolize"]
            ]
          },
          watchOut: "Nikdy nespouštějte v jedné L2 síti dva nekonfigurované DHCP servery současně (například když uživatel do firemní zásuvky zapojí vlastní domácí router portem LAN) – vznikne tzv. Rogue DHCP a část stanic dostane špatnou bránu bez internetu! Na řízených switchích se proti tomu nasazuje ochrana DHCP Snooping, která blokuje zprávy DHCP Offer/ACK z nedůvěryhodných uživatelských portů. Pokud DHCP selže úplně, Windows si přidělí nouzovou adresu APIPA z rozsahu 169.254.0.0/16."
        },
        example: {
          scenarioTitle: "Přidělení IP 192.168.1.10/24 stanici PC-A (MikroTik RouterOS, TP-Link a ipconfig /all)",
          scenarioText: "V síťové laboratoři běží síť 192.168.1.0/24 s výchozí bránou 192.168.1.1. Chceme, aby běžná zařízení dostávala adresy z rozsahu 192.168.1.10 až 192.168.1.200 na 8 hodin, přičemž pracovní stanice PC-A má mít rezervovanou adresu 192.168.1.10. Níže vidíte nastavení v MikroTik RouterOS, ekvivalent v SOHO rozhraní TP-Link a výsledný výpis na Windows stanici PC-A.",
          codeBlocks: [
            {
              label: "MikroTik RouterOS — Nastavení DHCP Serveru a rezervace pro PC-A",
              lang: "routeros",
              code: "# 1. Definice rozsahu (poolu) adres pro klienty\n/ip pool add name=pool-lan ranges=192.168.1.10-192.168.1.200\n\n# 2. Vytvoreni DHCP serveru na rozhrani bridge-lan (Lease Time 8 hodin)\n/ip dhcp-server add name=dhcp-lan interface=bridge-lan address-pool=pool-lan lease-time=8h disabled=no\n\n# 3. Sitove parametry (maska /24, vychozi brana 192.168.1.1, DNS servery)\n/ip dhcp-server network add address=192.168.1.0/24 gateway=192.168.1.1 dns-server=1.1.1.1,8.8.8.8\n\n# 4. Staticka rezervace adresy 192.168.1.10 pro PC-A podle MAC adresy\n/ip dhcp-server lease add address=192.168.1.10 mac-address=AA:BB:CC:11:22:10 server=dhcp-lan comment=\"PC-A\"\n\n# Kontrola prirazenych pronajmu\n/ip dhcp-server lease print"
            },
            {
              label: "TP-Link SOHO (Web GUI) & Cisco IOS (DHCP + Relay)",
              lang: "ios",
              code: "! === TP-Link Web GUI: Network -> DHCP Server ===\n! DHCP Server:        [x] Enable\n! Start IP Address:   192.168.1.10\n! End IP Address:     192.168.1.200\n! Address Lease Time: 480 minutes (8 hodin)\n! Default Gateway:    192.168.1.1\n! Primary / Sec DNS:  1.1.1.1 / 8.8.8.8\n! Address Reservation: MAC AA-BB-CC-11-22-10 -> IP 192.168.1.10\n\n! === Cisco IOS: Konfigurace DHCP Relay na vzdalene VLAN ===\nRouter(config)# interface GigabitEthernet0/1.20\nRouter(config-subif)# ip helper-address 192.168.1.1"
            },
            {
              label: "Windows CLI (PC-A) — Reálný výpis ipconfig /all po DORA",
              lang: "cmd",
              code: "C:\\Users\\Admin> ipconfig /all\n\nEthernet adapter Ethernet0:\n   Connection-specific DNS Suffix  . : corp.example\n   Description . . . . . . . . . . . : Intel(R) Gigabit Network Connection\n   Physical Address. . . . . . . . . : AA-BB-CC-11-22-10\n   DHCP Enabled. . . . . . . . . . . : Yes\n   Autoconfiguration Enabled . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : 192.168.1.10(Preferred)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Lease Obtained. . . . . . . . . . : 10. března 2025 8:00:00\n   Lease Expires . . . . . . . . . . : 10. března 2025 16:00:00\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 1.1.1.1\n                                       8.8.8.8"
            }
          ],
          practicalTip: "Pokud ve Windows potřebujete vynutit nový proces DORA (například po změně statické rezervace), spusťte v příkazovém řádku příkaz `ipconfig /release` (uvolní pronájem) a následně `ipconfig /renew` (získá aktuální konfiguraci)."
        },
        quiz: [
          {
            question: "Jaké je správné pořadí čtyř kroků při získávání IP adresy protokolem DHCP?",
            options: [
              "Discover → Offer → Request → Acknowledge",
              "Discover → Request → Offer → Acknowledge",
              "Offer → Discover → Acknowledge → Request",
              "Request → Acknowledge → Discover → Offer"
            ],
            correctIndex: 0,
            explanation: "Klient nejprve hledá server zprávou Discover (D), server odpovídá nabídkou Offer (O), klient potvrdí výběr zprávou Request (R) a server pronájem stvrdí zprávou Acknowledge (A) – zkratka DORA."
          },
          {
            question: "Uživatel se připojí do sítě, kde selhal DHCP server. Operační systém Windows si po chvíli sám nastaví adresu 169.254.42.17/16. O jaký mechanismus jde?",
            options: [
              "DHCP Relay (IP Helper)",
              "APIPA (Automatic Private IP Addressing)",
              "Statická DHCP rezervace",
              "CGNAT překlad operátora"
            ],
            correctIndex: 1,
            explanation: "Rozsah 169.254.0.0/16 (Link-Local) slouží pro APIPA. OS si ji přiřadí automaticky, když nedostane odpověď na DHCP Discover. Komunikace funguje jen v lokální L2 síti a nedostane se přes bránu do internetu."
          },
          {
            question: "Proč musíme na směrovači (routeru) zapnout funkci DHCP Relay (ip helper-address), když je DHCP server v jiné podsíti (VLAN) než klienti?",
            options: [
              "Protože DHCP používá protokol TCP, který nepodporuje více VLAN.",
              "Protože bez DHCP Relay by se zkrátilo Lease Time na 1 sekundu.",
              "Protože DHCP Relay šifruje hesla Wi-Fi při přidělování IP adresy.",
              "Protože první zpráva DHCP Discover je L2/L3 broadcast, který router standardně nepředává do jiných podsítí."
            ],
            correctIndex: 3,
            explanation: "Směrovače oddělují broadcastové domény, takže broadcast 255.255.255.255 zprávu DHCP Discover normálně zastaví. DHCP Relay ji zachytí a přepošle jako cílený unicast na IP adresu centrálního DHCP serveru."
          }
        ]
      },

      // =========================================================================
      // TÉMA 12: DNS: Telefonní seznam Internetu
      // =========================================================================
      {
        id: "dns",
        number: 12,
        moduleId: "addressing-services",
        mandatory: false,
        title: "DNS: Telefonní seznam Internetu",
        shortTitle: "Systém DNS",
        subtitle: "Hierarchie domén od kořene (Root) po autoritativní server, DNS záznamy, TTL cache, DNSSEC a DoH/DoT.",
        cardSummary: "Hierarchický překlad doménových jmen na IP adresy (Root → TLD → Autoritativní) a TTL.",
        difficulty: "Střední",
        accentColor: "#f43f5e",
        tags: ["DNS", "Root / TLD", "Rekurzivní resolver", "A / AAAA / MX / CNAME", "TTL Cache", "DNSSEC & DoH/DoT"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/dns.mp4",
          poster: "media/posters/dns.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Rekurzivní překlad domény (0:00)", time: 0 },
            { label: "2. Spojení s web serverem (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Rekurzivní překlad – „DNS funguje jako telefonní seznam internetu a překládá domény na IP adresy.“\n0:07–0:13: Spojení s web serverem – „Prohlížeč díky tomu okamžitě najde správný webový server a otevře stránku.“"
        },
        animationType: "dns",
        labType: "dns-resolver",
        takeaways: [
          "DNS (Domain Name System, port 53) překládá lidsky čitelná doménová jména (např. www.seznam.cz) na IP adresy a zpět.",
          "Doménový strom se čte zprava doleva: kořen (.) → doména nejvyšší úrovně TLD (.cz, .com) → doména 2. řádu (firma) → subdoména (www).",
          "Rekurzivní resolver (např. 1.1.1.1 nebo server ISP) pro vás projde hierarchii Root → TLD → Autoritativní server a výsledek si na dobu TTL uloží do cache.",
          "Základní DNS záznamy: A (IPv4), AAAA (IPv6), CNAME (alias), MX (e-mail server), NS (jmenný server), PTR (reverzní IP → jméno) a TXT (ověřovací texty)."
        ],
        principle: {
          problem: "Lidé si snadno zapamatují adresu www.firma.cz, ale směrovače rozumějí pouze číslům jako 195.113.45.12 nebo 2001:db8::1. Jak zařídit celosvětový a bleskurychlý překlad pro miliardy domén?",
          explanation: [
            "V počátcích ARPANETu stačil jediný textový soubor HOSTS.TXT se seznamem všech počítačů, který se ručně kopíroval. S růstem sítě to přestalo stačit, a tak v roce 1983 vznikl distribuovaný hierarchický systém DNS (Domain Name System). Každý vlastník domény si své záznamy spravuje na svém autoritativním serveru.",
            "Když do prohlížeče napíšete adresu portal.firma.cz, počítač nejprve zkontroluje vlastní lokální DNS cache a soubor hosts. Pokud adresu nezná, pošle dotaz na nastavený Rekurzivní DNS Resolver (typicky u vašeho ISP nebo veřejný jako 1.1.1.1 či 8.8.8.8). Ten zjistí odpověď za vás pomocí série iterativních dotazů.",
            "Resolver se nejprve zeptá jednoho z 13 logických kořenových serverů (Root, symbolizovaných tečkou na konci domény), který ho odkáže na správce domény nejvyšší úrovně TLD (.cz, spravuje CZ.NIC). TLD server ho odkáže na autoritativní jmenný server (NS) pro firma.cz. Autoritativní server konečně vrátí platnou IP adresu a hodnotu TTL (Time To Live – kolik sekund si smí resolver odpověď pamatovat v mezipaměti).",
            "DNS neukládá jen IPv4 adresy! Podle typu dotazu vrací různé záznamy: A pro IPv4, AAAA pro IPv6, CNAME jako přezdívku (alias) na jinou doménu (pozor: CNAME nesmí být na samotném vrcholu zóny / apexu vedle záznamů NS a MX), MX pro směrování e-mailů (včetně priority), NS pro určení jmenných serverů zóny, PTR pro zpětný převod IP na jméno a TXT pro textové záznamy (často protispamová ochrana SPF/DKIM či ověření vlastnictví domény).",
            "Klasické DNS přenáší dotazy nešifrovaně a bez ověření pravosti. Moderní sítě proto nasazují DNSSEC (kryptografické podepisování záznamů proti podvržení odpovědi) a šifrovaný přenos mezi klientem a resolverem pomocí DoT (DNS over TLS, port 853) nebo DoH (DNS over HTTPS, port 443)."
          ],
          steps: [
            {
              step: "1. Kontrola lokální cache",
              detail: "Prohlížeč a operační systém zkontrolují, zda IP adresu už nedávno nehledaly. Pokud je v cache s platným TTL, dotaz vůbec nejde na síť."
            },
            {
              step: "2. Dotaz na Rekurzivní Resolver",
              detail: "Počítač odešle UDP dotaz na port 53 svého nastaveného DNS serveru (získaného zpravidla přes DHCP)."
            },
            {
              step: "3. Root server (.)",
              detail: "Pokud ji nezná ani resolver, zeptá se kořenového serveru. Ten nezná cílovou IP, ale vrátí odkaz na TLD servery pro .cz."
            },
            {
              step: "4. TLD server (.cz)",
              detail: "TLD server vrátí NS záznamy ukazující na autoritativní DNS server konkrétní organizace (např. ns1.firma.cz)."
            },
            {
              step: "5. Autoritativní DNS a uložení do cache",
              detail: "Autoritativní server vrátí skutečný A/AAAA záznam s dobou platnosti TTL (např. 3600 s). Resolver výsledek uloží do paměti a předá klientovi."
            }
          ],
          analogy: "DNS je jako telefonní informační linka rozdělená podle poboček: zeptáte se asistentky (rekurzivního resolveru) na číslo pana Nováka v Brně. Pokud si ho pamatuje z rána (TTL cache), řekne vám ho hned. Jinak zavolá na ústřednu ČR (Root), ta ji přepojí na brněnskou ústřednu (TLD), a tam jí dají číslo vrátnice Novákovy firmy (autoritativní DNS), odkud dostane přímou klapku.",
          comparisonTable: {
            headers: ["Typ záznamu", "Význam", "Příklad hodnoty", "Typické využití"],
            rows: [
              ["A", "IPv4 adresa hostitele", "93.184.216.34", "Převod webové domény na IPv4"],
              ["AAAA", "IPv6 adresa hostitele", "2606:2800:220:1::248", "Převod domény na moderní IPv6"],
              ["CNAME", "Kanonické jméno (Alias)", "www -> shop.domena.cz", "Přesměrování jedné subdomény na druhou"],
              ["MX", "Mail eXchanger", "10 mail.firma.cz", "Kam se mají doručovat e-maily (@firma.cz)"],
              ["NS", "Name Server", "ns1.forpsi.net", "Kdo je autoritou pro danou doménu"],
              ["PTR", "Pointer (reverzní záznam)", "34.216.184.93 -> example.com", "Ověření jména podle IP adresy (anti-spam)"],
              ["TXT", "Textový záznam", "v=spf1 mx -all", "Ochrana e-mailů (SPF/DKIM) a ověření domény"]
            ]
          },
          watchOut: "Typická chyba začátečníků při diagnóze poruchy: když na počítači nefunguje žádný web, uživatel prohlásí „nejde Internet“. Přitom ale příkaz ping 8.8.8.8 klidně projde! Pokud jde ping na IP adresu, ale nejde na doménové jméno (ping seznam.cz hlásí neznámého hostitele), Internet funguje – rozbitý je pouze DNS překlad!"
        },
        example: {
          scenarioTitle: "Ověření DNS záznamů pomocí nslookup a dig",
          scenarioText: "Když nasazujete web nebo řešíte, proč se neaktualizoval nový server po změně IP adresy (kvůli TTL cache), použijte příkazové nástroje nslookup nebo dig a ptejte se přímo na konkrétní typy záznamů.",
          codeBlocks: [
            {
              label: "Dotaz na A a MX záznamy pomocí nslookup (Windows / Linux)",
              lang: "bash",
              code: "$ nslookup -type=A seznam.cz 1.1.1.1\nServer:  one.one.one.one\nAddress: 1.1.1.1\n\nNeautorizovaná odpověď:\nNázev:   seznam.cz\nAddress: 77.75.79.222\n\n$ nslookup -type=MX seznam.cz\nseznam.cz  MX preference = 10, mail exchanger = mx1.seznam.cz"
            },
            {
              label: "Detailní diagnostika s výpisem zbývajícího TTL (dig)",
              lang: "bash",
              code: "$ dig example.com A +noall +answer\nexample.com.   2145   IN   A   93.184.215.14\n# Číslo 2145 znamená zbývající TTL v sekundách v cache resolveru."
            }
          ],
          practicalTip: "Když na serveru měníte IP adresu webu, snižte hodnotu TTL u A záznamu už den předem třeba na 300 sekund (5 minut). Po přepnutí se pak změna projeví uživatelům po celém světě téměř okamžitě místo čekání 24 hodin."
        },
        quiz: [
          {
            question: "Ping na IP adresu 8.8.8.8 prochází s odezvou 10 ms, ale prohlížeč hlásí chybu DNS_PROBE_FINISHED_NXDOMAIN a ping www.google.cz selže. Kde je problém?",
            options: [
              "Je vytažený síťový kabel ze switche",
              "Nefunguje DNS překlad (špatný DNS server nebo nedostupný port 53)",
              "Chybí výchozí brána (Default Gateway)",
              "Síťová karta má rozbitou MAC adresu"
            ],
            correctIndex: 1,
            explanation: "Úspěšný ping na veřejnou IP adresu 8.8.8.8 dokazuje, že fyzické připojení, brána i routování do Internetu fungují. Problém je výhradně v překladu jmen (DNS)."
          },
          {
            question: "Který DNS záznam určuje server, jenž přijímá příchozí e-maily pro doménu @firma.cz?",
            options: [
              "Záznam A",
              "Záznam CNAME",
              "Záznam MX",
              "Záznam PTR"
            ],
            correctIndex: 2,
            explanation: "Záznam MX (Mail eXchanger) udává název poštovního serveru a jeho prioritu pro doručování elektronické pošty dané domény."
          },
          {
            question: "V jakém pořadí dotazuje rekurzivní DNS resolver hierarchii serverů při hledání neznámé domény firma.cz?",
            options: [
              "Root (.) → TLD (.cz) → Autoritativní DNS (firma.cz)",
              "Autoritativní DNS → TLD (.cz) → Root (.)",
              "TLD (.cz) → Autoritativní DNS → Root (.)",
              "Klient se vždy ptá přímo Root serveru bez resolveru"
            ],
            correctIndex: 0,
            explanation: "Dotazování postupuje od nejvyšší úrovně hierarchie dolů: nejprve kořenový Root server (.), následně TLD server (.cz) a nakonec autoritativní server pro konkrétní doménu."
          }
        ]
      },

      // =========================================================================
      // TÉMA 13: Principy směrování: Statické a dynamické routování
      // =========================================================================
      {
        id: "routing",
        number: 13,
        moduleId: "routing-nat",
        mandatory: true,
        title: "Principy směrování: Statické a dynamické routování",
        shortTitle: "Routování & Směrování",
        subtitle: "Rozdíl mezi switchem a routerem, směrovací tabulka, Longest Prefix Match, výchozí cesta 0.0.0.0/0 (::/0), OSPF, BGP, RIP a AD.",
        cardSummary: "L3 směrování paketů podle směrovací tabulky, Longest Prefix Match, OSPF, BGP a AD.",
        difficulty: "Pokročilé",
        accentColor: "#14b8a6",
        tags: ["Router", "Směrovací tabulka", "Longest Prefix Match", "0.0.0.0/0", "OSPF / BGP / RIP", "Administrativní vzdálenost"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/routing.mp4",
          poster: "media/posters/routing.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Směrovací tabulka & Longest Prefix (0:00)", time: 0 },
            { label: "2. Statické vs. dynamické routování (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Směrovací tabulka – „Směrovač vybírá cestu pro každý paket ve směrovací tabulce podle nejdelší shody masky.“\n0:07–0:13: Statika a dynamika – „Statické trasy zadává správce ručně, zatímco dynamické protokoly samy najdou objížďku při výpadku.“"
        },
        animationType: "routing",
        labType: "routing-table-sim",
        takeaways: [
          "Switch přepíná rámce na L2 podle MAC adres uvnitř jedné sítě; Router směruje pakety na L3 podle cílové IP adresy mezi různými sítěmi a odděluje broadcastové domény.",
          "Router rozhoduje pomocí směrovací tabulky vždy podle pravidla Longest Prefix Match (nejdelší shoda masky prefixu, např. /26 porazí /24 i 0.0.0.0/0).",
          "Výchozí cesta (Default Route 0.0.0.0/0 pro IPv4, resp. ::/0 pro IPv6) je „záchranná“ cesta pro všechny neznámé cílové sítě – typicky míří přes WAN rozhraní k ISP.",
          "Administrativní vzdálenost (AD) vyjadřuje důvěryhodnost zdroje trasy (Connected 0, Static 1, eBGP 20, OSPF 110, RIP 120), zatímco metrika porovnává kvalitu cest v rámci stejného protokolu."
        ],
        principle: {
          problem: "Switch dokáže propojit pouze počítače v jedné lokální síti (jedné broadcastové doméně). Jak ale doručit paket z lokální sítě do jiné budovy nebo na server na druhém konci světa, aniž by všechna zařízení znala mapu celého internetu?",
          explanation: [
            "Zatímco Switch (L2) pracuje s fyzickými MAC adresami v jedné podsíti, Router (směrovač, L3) propojuje různé IP sítě. Pokaždé když paket projde routerem (udělá tzv. jeden hop), sníží se jeho hodnota TTL o 1, původní L2 rámec se zahodí a router paket zabalí do zbrusu nového L2 rámce s MAC adresami pro další skok. Zdrojová a cílová IP adresa (bez NATu) zůstávají stejné.",
            "Router se při rozhodování, kam paket poslat, dívá do své směrovací tabulky (Routing Table). V ní jsou uloženy záznamy ze tří zdrojů: přímo připojené sítě (Connected – vzniknou samy po nastavení IP na rozhraní), ručně zapsané statické cesty (Static) a cesty naučené dynamickými protokoly (OSPF, BGP, RIP).",
            "Zlatým pravidlem výběru cesty je Longest Prefix Match (nejdelší shoda prefixu). Má-li router v tabulce zároveň záznam 192.168.0.0/16, 192.168.2.0/24 a 0.0.0.0/0 a přijde paket pro 192.168.2.10, vyhraje 192.168.2.0/24, protože 24 shodných bitů je nejvíce specifických. Teprve pro neznámé sítě (třeba internetové IP) spadne paket do výchozí cesty 0.0.0.0/0 (u IPv6 se výchozí cesta zapisuje jako ::/0).",
            "Statické routování se hodí do malých sítí a pro výchozí bránu – nezatěžuje procesor ani linku, ale při výpadku spoje se samo nepřepne. Dynamické směrovací protokoly si routery vyměňují automaticky: RIP (historický Distance Vector, počítá skoky, max. 15 hopů), OSPF (moderní Link-State pro podnikové sítě, počítá cenu trasy ze šířky pásma pomocí Dijkstrova algoritmu SPF) a BGP (Path Vector protokol spojující operátory a autonomní systémy celého Internetu).",
            "Pokud se dvě různé metody naučí přesně stejný prefix (např. 192.168.2.0/24), vybere router tu s nižší Administrativní vzdáleností (AD): Connected = 0, Static = 1, eBGP = 20, OSPF = 110, RIP = 120. Metrika (např. OSPF Cost) rozhoduje až tehdy, když soutěží více cest ze stejného protokolu; při naprosté shodě prefixu, AD i metriky může router využít obě cesty současně k vyvažování zátěže (ECMP – Equal-Cost Multi-Path)."
          ],
          steps: [
            {
              step: "1. Příjem a kontrola L2 rámce",
              detail: "Router přijme Ethernetový rámec na vstupním portu, ověří kontrolní součet FCS a odstraní L2 hlavičku."
            },
            {
              step: "2. Kontrola IP hlavičky a TTL",
              detail: "Zkontroluje cílovou IP adresu (např. 192.168.2.10) a sníží pole TTL o 1. Pokud TTL klesne na 0, paket zahodí a pošle zpět ICMP Time Exceeded."
            },
            {
              step: "3. Vyhledání ve směrovací tabulce (Longest Prefix Match)",
              detail: "Najde nejdelší shodný prefix – v našem příkladu 192.168.2.0/24 směřující přes rozhraní WAN 1 (případně další skok Next-Hop)."
            },
            {
              step: "4. Nová L2 enkapsulace a odeslání",
              detail: "Pomocí ARP zjistí MAC adresu cíle nebo dalšího routeru na rozhraní WAN 1, vytvoří nový L2 rámec a odešle jej do linky."
            }
          ],
          analogy: "Router funguje jako rozcestník nebo dopravní uzel na poště: pracovník na přepážce v Praze nemusí znát každou ulici v Ostravě – stačí, když podle PSČ (síťového prefixu) ví, do kterého vagonu směrem na východ má zásilku naložit. Další uzel na trase si balík převezme a pošle ho zase o kousek blíž.",
          comparisonTable: {
            headers: ["Typ / Protokol", "Princip (Algoritmus)", "Metrika (Cena cesty)", "Admin. vzdálenost (AD)", "Typické nasazení"],
            rows: [
              ["Static Route", "Ruční zadání správcem", "Žádná (pevná)", "1", "Malé sítě, výchozí brána 0.0.0.0/0, záložní cesta"],
              ["RIP v2", "Distance Vector (Bellman-Ford)", "Počet skoků (max 15 hopů)", "120", "Zastaralý, pouze velmi malé sítě nebo výuka"],
              ["OSPF", "Link-State (Dijkstrův SPF)", "Cost (podle šířky pásma)", "110", "Podnikové sítě, kampusy a organizace, datacentra"],
              ["BGP (eBGP)", "Path Vector (AS-Path)", "Atributy cesty (AS-Path, Local Pref)", "20 (iBGP: 200)", "Páteř Internetu, propojení ISP a autonomních systémů"]
            ]
          },
          watchOut: "Nejčastější chyba v laboratořích: nastavíte statickou cestu tam (Router A → síť za Routerem B), ale zapomenete nastavit zpětnou cestu (Router B → síť za Routerem A)! Ping pak dojde do cíle, ale odpověď nemá kudy zpět. Také si pamatujte: Longest Prefix Match se vyhodnocuje VŽDY před Administrativní vzdáleností!"
        },
        example: {
          scenarioTitle: "Směrování do sítě 192.168.2.0/24 (cíl 192.168.2.10) přes rozhraní WAN 1",
          scenarioText: "V návaznosti na animaci potřebuje náš router vědět, kudy poslat pakety mířící na hosta 192.168.2.10 (síť 192.168.2.0/24). Tato vzdálená síť je dostupná přes rozhraní WAN 1 (na bodovém/tunelovém spoji přímo přes interface WAN 1, na Ethernetu přes IP dalšího routeru 10.0.12.2 ležícího za WAN 1). Pro veškerý ostatní provoz do Internetu přidáme výchozí cestu 0.0.0.0/0.",
          codeBlocks: [
            {
              label: "MikroTik RouterOS — Statická cesta na WAN 1 a výpis /ip route print",
              lang: "routeros",
              code: "# Pridani staticke cesty pro cilovou sit 192.168.2.0/24 (pro hosta 192.168.2.10) pres WAN 1\n/ip route add dst-address=192.168.2.0/24 gateway=\"WAN 1\" comment=\"Cesta pro 192.168.2.10\"\n\n# V Ethernet siti s vice routery se bezne uvadi IP dalsiho skoku (Next-Hop):\n# /ip route add dst-address=192.168.2.0/24 gateway=10.0.12.2\n\n# Pridani vychozi cesty (Default Route) do Internetu\n/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1 comment=\"Default Gateway\"\n\n# Zobrazeni smerovaci tabulky (AS = Active Static, DAC = Dynamic Active Connected)\n/ip route print\n#  #      DST-ADDRESS        GATEWAY        DISTANCE\n#  0  AS  0.0.0.0/0          203.0.113.1           1\n#  1  AS  192.168.2.0/24     WAN 1                 1"
            },
            {
              label: "Cisco IOS — Statická routa, OSPF a show ip route",
              lang: "ios",
              code: "! Staticka cesta do site 192.168.2.0/24 pres Next-Hop na portu WAN 1 (napr. Serial0/1/0)\nRouter(config)# ip route 192.168.2.0 255.255.255.0 Serial0/1/0\n! Nebo na Ethernetu s IP adresou protistrany:\nRouter(config)# ip route 192.168.2.0 255.255.255.0 10.0.12.2\n\n! Vychozi cesta (Gateway of last resort)\nRouter(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1\n\n! Alternativne zapnuti dynamickeho protokolu OSPF pro oblast 0\nRouter(config)# router ospf 1\nRouter(config-router)# network 192.168.1.0 0.0.0.255 area 0\nRouter(config-router)# network 10.0.12.0 0.0.0.3 area 0\n\n! Overeni smerovaci tabulky\nRouter# show ip route\nS*   0.0.0.0/0 [1/0] via 203.0.113.1\nS    192.168.2.0/24 is directly connected, Serial0/1/0"
            }
          ],
          practicalTip: "Na Ethernetovém portu v Cisco IOS i MikroTiku vždy preferujte zadání Next-Hop IP adresy protistrany (např. `10.0.12.2`) místo pouhého názvu výstupního rozhraní – router jinak musí posílat ARP dotazy pro každou jednotlivou cílovou IP v cílové síti, což vyčerpává ARP tabulku. Přímé zadání rozhraní (např. `WAN 1`) se používá u bod-bod (Point-to-Point) linek jako PPPoE, Serial nebo WireGuard."
        },
        quiz: [
          {
            question: "Router má ve směrovací tabulce cesty 0.0.0.0/0 (AD 1), 192.168.0.0/16 (AD 1) a 192.168.2.0/24 naučenou přes OSPF (AD 110). Kterou cestu vybere pro cílovou adresu 192.168.2.10?",
            options: [
              "0.0.0.0/0, protože má nižší Administrativní vzdálenost než OSPF.",
              "192.168.0.0/16, protože je statická a zahrnuje celou síť 192.168.",
              "192.168.2.0/24 (OSPF), protože má nejdelší shodu prefixu (Longest Prefix Match).",
              "Router paket zahodí, protože se neshoduje s /32 adresou."
            ],
            correctIndex: 2,
            explanation: "Pravidlo Longest Prefix Match má vždy nejvyšší prioritu před Administrativní vzdáleností. Prefix /24 (24 shodných bitů) je přesnější než /16 i /0, proto zvítězí cesta z OSPF."
          },
          {
            question: "Co se stane s L2 a L3 adresami v hlavičkách paketu při průchodu přes jeden router (bez NATu)?",
            options: [
              "Zdrojová i cílová IP adresa se změní na adresy routeru; MAC adresy zůstávají stejné.",
              "Zdrojová a cílová IP adresa zůstávají původní (sníží se jen TTL), zatímco L2 MAC adresy rámce se změní pro další skok.",
              "MAC adresy se smažou a celý další přenos probíhá bez L2 vrstvy.",
              "Router změní pouze cílovou IP adresu na 0.0.0.0."
            ],
            correctIndex: 1,
            explanation: "IP adresy (L3) slouží pro komunikaci od zdroje až do konečného cíle (end-to-end). L2 rámec s MAC adresami platí vždy jen pro jeden spoj (hop-by-hop), proto ho router přebalí."
          },
          {
            question: "Který dynamický směrovací protokol je standardem v moderních podnikových sítích (využívá Link-State databázi a Dijkstrův algoritmus SPF s AD = 110)?",
            options: [
              "RIP v1",
              "DHCP",
              "ARP",
              "OSPF"
            ],
            correctIndex: 3,
            explanation: "OSPF (Open Shortest Path First) je Link-State IGP protokol s výchozí Administrativní vzdáleností 110, který počítá nejkratší trasu podle šířky pásma (Cost) pomocí Dijkstrova algoritmu."
          }
        ]
      },

      // =========================================================================
      // TÉMA 14: NAT, PAT (Masquerade) a Port Forwarding
      // =========================================================================
      {
        id: "nat-pat",
        number: 14,
        moduleId: "routing-nat",
        mandatory: true,
        title: "NAT, PAT (Masquerade) a Port Forwarding",
        shortTitle: "NAT, PAT & Forwarding",
        subtitle: "Překlad privátních IPv4 adres na veřejnou adresu, NAT tabulka s porty (SNAT/Masquerade), DNAT, Hairpin NAT a CGNAT.",
        cardSummary: "Překlad privátních IPv4 na veřejnou adresu (SNAT/PAT) a přesměrování portů (DNAT).",
        difficulty: "Střední",
        accentColor: "#06b6d4",
        tags: ["NAT", "PAT / Masquerade", "SNAT", "DNAT / Port Forwarding", "Hairpin NAT", "CGNAT / RFC 5737"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/nat-pat.mp4",
          poster: "media/posters/nat-pat.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Překlad PAT (sdílená veřejná IP) (0:00)", time: 0 },
            { label: "2. Tabulka portů & DNAT Forwarding (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Překlad PAT – „Překlad adres PAT umožní celé domácí či firemní síti sdílet jedinou veřejnou IP adresu.“\n0:07–0:13: Tabulka portů a DNAT – „Směrovač si hlídá čísla portů v tabulce a přesměrování portů zpřístupní vnitřní server zvenčí.“"
        },
        animationType: "nat-pat",
        labType: "nat-translator",
        takeaways: [
          "NAT vznikl jako záchranné řešení vyčerpání IPv4 adres: privátní rozsahy RFC 1918 (např. 192.168.1.0/24) nejsou směrovatelné v Internetu a musí se na bráně přeložit na veřejnou IP.",
          "PAT (Port Address Translation / v MikroTiku Masquerade) umožňuje stovkám zařízení sdílet jedinou veřejnou IPv4 adresu díky sledování jedinečných zdrojových TCP/UDP portů v NAT tabulce.",
          "SNAT (Source NAT) překládá zdrojovou adresu při odchodu z LAN do Internetu; DNAT (Destination NAT / Port Forwarding) přesměruje příchozí spojení z veřejné IP na vnitřní server.",
          "Adresa 203.0.113.5 patří do oficiálního dokumentačního rozsahu 203.0.113.0/24 (RFC 5737 TEST-NET-3), který slouží bezpečně pro dokumentaci a příklady."
        ],
        principle: {
          problem: "Adres IPv4 je pouze zhruba 4,3 miliardy a dávno došly. V domácnostech a firmách proto používáme privátní adresy (192.168.1.10), jenže ty internetové routery okamžitě zahazují. Jak se může celá firma připojit k webu přes jedinou veřejnou IP adresu od poskytovatele?",
          explanation: [
            "NAT (Network Address Translation) je metoda, při které hraniční router (Gateway) za letu přepisuje IP adresy v hlavičkách paketů a pamatuje si probíhající spojení ve své paměti (NAT tabulka / Connection Tracking).",
            "V praxi se téměř vždy používá varianta PAT (Port Address Translation, též NAPT nebo Masquerade), tedy překlad M:1. Pokud PC-A (192.168.1.10) a PC-B (192.168.1.11) otevřou web současně, router oběma přepíše zdrojovou IP na svou veřejnou adresu 203.0.113.5, ale každému přidělí v tabulce jiný zdrojový port (např. 52100 a 52101). Když přijde odpověď ze serveru na port 52100, router podle tabulky přesně ví, že patří PC-A.",
            "U odchozího provozu rozlišujeme dvě akce řetězce srcnat: pevný src-nat (ručně určíme výslednou veřejnou IP, např. 203.0.113.5, vhodné u serverů s pevnou veřejnou IP) a masquerade (router automaticky použije aktuální IP adresu výstupního WAN rozhraní, ideální při dynamické IP od ISP).",
            "Opačný směr řeší DNAT (Destination NAT), lidově Port Forwarding (přesměrování portů). Protože z Internetu nelze přímo oslovit privátní IP 192.168.1.50, nastavíme na routeru pravidlo: vše, co zvenčí přijde na veřejnou IP 203.0.113.5 a TCP port 8080, přepiš na cílovou adresu 192.168.1.50 port 80.",
            "Zvláštním případem je Hairpin NAT (NAT Loopback): když klient uvnitř stejné LAN (např. 192.168.1.10) přistoupí na interní server (192.168.1.50) přes jeho veřejnou IP 203.0.113.5:8080, brána přepíše cílovou IP na 192.168.1.50. Kdyby však ponechala původní zdrojovou IP klienta 192.168.1.10, server by mu odpověděl napřímo po L2 ze své privátní adresy – klient čekající odpověď z 203.0.113.5 by takový paket zahodil. Hairpin NAT proto k DNAT pravidlu přidá i SNAT (masquerade) na zdrojovou IP brány pro provoz z LAN zpět do LAN.",
            "Kvůli nedostatku IPv4 dnes mobilní a někteří domácí operátoři nasazují CGNAT (Carrier-Grade NAT, rozsah 100.64.0.0/10 dle RFC 6598) – překlad probíhá ještě jednou u ISP. Dlouhodobým a čistým řešením bez NATu je až nasazení protokolu IPv6."
          ],
          steps: [
            {
              step: "1. Odchozí paket z LAN",
              detail: "PC-A odešle HTTP požadavek: SRC 192.168.1.10:52310 → DST 93.184.216.34:443 směrem ke své bráně (Gateway)."
            },
            {
              step: "2. Překlad SNAT / PAT a zápis do NAT tabulky",
              detail: "Gateway přepíše SRC IP na veřejnou adresu 203.0.113.5 (případně upraví zdrojový port) a uloží záznam do NAT tabulky."
            },
            {
              step: "3. Cesta Internetem a odpověď serveru",
              detail: "Cílový webový server vidí jen 203.0.113.5:52310 a pošle odpověď zpět na tuto veřejnou IP a port."
            },
            {
              step: "4. Zpětný překlad do LAN",
              detail: "Gateway najde v NAT tabulce odpovídající záznam, přepíše DST zpět na 192.168.1.10:52310 a doručí data přímo na PC-A."
            }
          ],
          analogy: "Představte si velkou firmu s jediným veřejným telefonním číslem (+420 222 111 000 = veřejná IP) a sto zaměstnanci uvnitř (klapky 10, 11, 12 = privátní IP). Když zaměstnanec z klapky 10 volá ven, ústředna přepíše volajícího na hlavní firemní číslo a zapíše si číslo linky (port), aby věděla, komu přepojit zpětný hovor.",
          comparisonTable: {
            headers: ["Typ NAT", "Co se v paketu mění", "Kdo iniciuje spojení", "Typické použití"],
            rows: [
              ["PAT / Masquerade (SNAT M:1)", "Zdrojová IP + Zdrojový port", "Klient z vnitřní sítě (LAN → WAN)", "Sdílení jedné veřejné IP celou domácností či firmou"],
              ["Statický SNAT (src-nat)", "Zdrojová IP na pevnou zadanou IP", "Klient z vnitřní sítě (LAN → WAN)", "Když má firma více veřejných IP a chce určit konkrétní pro server"],
              ["Statický NAT 1:1", "Celá IP bez ohledu na porty", "Oběma směry", "Dedikovaný server s vlastní veřejnou IP mapovanou na privátní IP"],
              ["DNAT (Port Forwarding)", "Cílová IP (+ volitelně cílový port)", "Klient z Internetu (WAN → LAN)", "Zpřístupnění interního webu, SSH, herního serveru nebo NVR kamer"]
            ]
          },
          watchOut: "Pozor na dva časté omyly: 1) NAT sám o sobě NENÍ firewall (i když nechtěně blokuje nevyžádané příchozí spojení, bezpečnost řeší až firewallová pravidla). 2) Pokud má váš domácí router na WAN rozhraní privátní adresu (192.168.x.x) nebo rozsah CGNAT (100.64.0.0/10), Port Forwarding z internetu fungovat nebude – musíte si u operátora vyžádat veřejnou IPv4 adresu."
        },
        example: {
          scenarioTitle: "Překlad 192.168.1.10 → 203.0.113.5 (RFC 5737) a Port Forwarding v MikroTik RouterOS",
          scenarioText: "V ukázce používáme veřejnou adresu 203.0.113.5. Rozsah 203.0.113.0/24 (TEST-NET-3) je podle normy RFC 5737 oficiálně vyhrazen pro dokumentaci a příklady – podobně jako 192.0.2.0/24 a 198.51.100.0/24 – abychom nikdy nepoužili skutečnou cizí adresu v Internetu. Nastavíme překlad odchozího provozu z PC-A (192.168.1.10 → 203.0.113.5) a zároveň přesměrujeme port 8080 na interní webový server 192.168.1.50:80.",
          codeBlocks: [
            {
              label: "MikroTik RouterOS — Masquerade, pevný src-nat a dst-nat (Port Forwarding)",
              lang: "routeros",
              code: "# 1A. Bezne nastaveni pro celou LAN (dynamicky bere IP rozhrani ether1-WAN)\n/ip firewall nat add chain=srcnat src-address=192.168.1.0/24 out-interface=ether1-WAN action=masquerade comment=\"PAT Masquerade pro LAN\"\n\n# 1B. Pevny preklad presne podle animace: 192.168.1.10 -> 203.0.113.5 (RFC 5737)\n/ip firewall nat add chain=srcnat src-address=192.168.1.10 out-interface=ether1-WAN action=src-nat to-addresses=203.0.113.5 comment=\"PC-A -> 203.0.113.5\"\n\n# 2. DNAT (Port Forwarding): verejna 203.0.113.5:8080 -> vnitrni server 192.168.1.50:80\n/ip firewall nat add chain=dstnat in-interface=ether1-WAN dst-address=203.0.113.5 protocol=tcp dst-port=8080 action=dst-nat to-addresses=192.168.1.50 to-ports=80 comment=\"Port Forwarding na interni web\"\n\n# Kontrola aktivni NAT tabulky (Connection Tracking)\n/ip firewall connection print where src-address~\"192.168.1.10\""
            },
            {
              label: "Cisco IOS — PAT (NAT Overload) a Port Forwarding",
              lang: "ios",
              code: "Router(config)# interface GigabitEthernet0/1\nRouter(config-if)# ip nat inside\nRouter(config)# interface GigabitEthernet0/0\nRouter(config-if)# ip address 203.0.113.5 255.255.255.0\nRouter(config-if)# ip nat outside\n\n! Povoleni site 192.168.1.0/24 pro PAT (overload)\nRouter(config)# access-list 1 permit 192.168.1.0 0.0.0.255\nRouter(config)# ip nat inside source list 1 interface GigabitEthernet0/0 overload\n\n! Port Forwarding (203.0.113.5:8080 -> 192.168.1.50:80)\nRouter(config)# ip nat inside source static tcp 192.168.1.50 80 203.0.113.5 8080\n\n! Vypis aktivnich prekladu\nRouter# show ip nat translations"
            }
          ],
          practicalTip: "Když testujete Port Forwarding (DNAT) z vlastního PC uvnitř téže LAN sítě přes veřejnou IP 203.0.113.5, spojení bez Hairpin NATu (Loopback NAT) selže. Proto Port Forwarding vždy ověřujte z jiné sítě (např. z mobilních dat mimo lokální síť)."
        },
        quiz: [
          {
            question: "Jak router při použití PAT (Masquerade) pozná, kterému ze tří počítačů v LAN má vrátit odpověď z webového serveru, když všechny sdílejí stejnou veřejnou IP 203.0.113.5?",
            options: [
              "Podle jedinečného zdrojového čísla portu (TCP/UDP) uloženého v NAT tabulce.",
              "Podle MAC adresy cílového webového serveru v Londýně.",
              "Podle názvu operačního systému v hlavičce IP paketu.",
              "Nemůže to poznat, odpověď vždy rozešle všem jako broadcast."
            ],
            correctIndex: 0,
            explanation: "PAT ukládá do NAT tabulky čtveřici hodnot včetně zdrojových a cílových portů. Díky odlišným dočasným portům bezpečně přiřadí vracející se paket správné privátní IP adrese."
          },
          {
            question: "Potřebujete z internetu zpřístupnit interní webový server běžící na vnitřní adrese 192.168.1.50:80 přes veřejnou adresu brány 203.0.113.5:8080. Jaké pravidlo použijete?",
            options: [
              "SNAT (masquerade)",
              "APIPA",
              "DNAT (dst-nat / Port Forwarding)",
              "DHCP Relay"
            ],
            correctIndex: 2,
            explanation: "Pro příchozí spojení směřující z internetu do lokální sítě je nutné změnit cílovou (Destination) adresu a port paketu – tedy použít DNAT (Port Forwarding)."
          },
          {
            question: "Proč se v dokumentaci a příkladech objevuje veřejný rozsah 203.0.113.0/24 (např. 203.0.113.5)?",
            options: [
              "Jde o nový privátní rozsah pro domácí Wi-Fi routery podle RFC 1918.",
              "Je to výchozí IP adresa každého továrního routeru.",
              "Jde o speciální adresu vyhrazenou výhradně pro protokoly DHCP Discover.",
              "Je to oficiální dokumentační rozsah TEST-NET-3 dle normy RFC 5737 určený pro dokumentaci a příklady."
            ],
            correctIndex: 3,
            explanation: "RFC 5737 definuje tři veřejné bloky (192.0.2.0/24, 198.51.100.0/24 a 203.0.113.0/24) výhradně pro příklady a dokumentaci, aby nedocházelo ke kolizi se skutečnými servery v Internetu."
          }
        ]
      },

      // =========================================================================
      // TÉMA 15: Wi-Fi (IEEE 802.11), zabezpečení a režimy SOHO routeru
      // =========================================================================
      {
        id: "wifi-soho",
        number: 15,
        moduleId: "wireless",
        mandatory: true,
        title: "Wi-Fi (IEEE 802.11), zabezpečení a režimy SOHO routeru",
        shortTitle: "Wi-Fi & SOHO režimy",
        subtitle: "Generace Wi-Fi 4 až 7, pásma 2.4 / 5 / 6 GHz a kanály 1/6/11, metoda CSMA/CA, roaming 802.11k/v/r, WPA2/WPA3 a provozní režimy.",
        cardSummary: "Standardy Wi-Fi 802.11, pásma 2.4/5/6 GHz, kanály 1/6/11, WPA2/WPA3 a režimy AP/Router.",
        difficulty: "Střední",
        accentColor: "#6366f1",
        tags: ["Wi-Fi 802.11", "2.4 / 5 / 6 GHz", "CSMA/CA", "WPA2 / WPA3", "Roaming 802.11k/v/r", "Access Point vs. Router"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/wifi-soho.mp4",
          poster: "media/posters/wifi-soho.jpg",
          startTime: 0,
          durationLabel: "0:15",
          chapters: [
            { label: "1. Pásma 2,4 GHz vs. 5 GHz (0:00)", time: 0 },
            { label: "2. Zabezpečení WPA2 / WPA3 (0:08)", time: 8.0 }
          ],
          transcript: "0:00–0:08: Pásma 2,4 a 5 GHz – „Pásmo 2,4 GHz lépe prochází zdmi, zatímco 5 GHz nabízí vyšší rychlost.“\n0:08–0:15: Zabezpečení WPA2 / WPA3 – „Bezdrátovou komunikaci dnes chrání moderní šifrování WPA2 a WPA3.“"
        },
        animationType: "wifi-modes",
        labType: "wifi-band-mode",
        takeaways: [
          "V pásmu 2.4 GHz používejte výhradně nepřekrývající se kanály 1, 6 a 11 (při šířce 20 MHz); pásma 5 GHz a 6 GHz nabízejí mnohem více čistých kanálů a vyšší rychlost, ale hůře procházejí zdmi.",
          "Bezdrátové sítě jsou sdílené Half-Duplex médium, proto používají metodu CSMA/CA (Collision Avoidance) a potvrzení ACK; problém skrytého uzlu řeší volitelný mechanismus RTS/CTS.",
          "WEP a WPA/TKIP jsou prolomené – minimem je WPA2-PSK (AES/CCMP), moderním standardem pak WPA3-Personal (SAE) odolné proti offline slovníkovým útokům. MAC filtr sám o sobě není spolehlivá ochrana.",
          "Když připojujete druhý domácí router kabelem do hlavní sítě, přepněte ho do režimu Access Point (AP) – vypne se tak druhý NAT a DHCP a zařízení v síti na sebe uvidí."
        ],
        principle: {
          problem: "Rádiové vlny ve vzduchu jsou společné pro všechny sousedy v paneláku i desítky klientů v budově. Každý vysílač může ostatní rušit, kdokoliv může signál odposlouchávat a špatně zvolený režim SOHO krabičky snadno rozbije domácí nebo firemní síť dvojitým NATem.",
          explanation: [
            "Standardy rodiny IEEE 802.11 označujeme pro přehlednost generacemi: Wi-Fi 4 (802.11n, 2.4/5 GHz), Wi-Fi 5 (802.11ac, 5 GHz, MU-MIMO), Wi-Fi 6 / 6E (802.11ax, přináší OFDMA pro efektivní dělení subnosných mezi více klientů najednou a v 6E pásmo 6 GHz) a nejnovější Wi-Fi 7 (802.11be, Multi-Link Operation přes více pásem najednou a kanály široké až 320 MHz).",
            "Pásmo 2.4 GHz má dobrý dosah přes zdi, ale je silně zarušené (Bluetooth, mikrovlnky, sousedé) a při standardní šířce kanálu 20 MHz se v něm vejdou vedle sebe pouze tři nepřekrývající se kanály: 1, 6 a 11. Pásmo 5 GHz (a nově 6 GHz) má kanálů desítky, podporuje široké 80/160 MHz kanály a gigabitové rychlosti, ale signál rychleji slábne za překážkami (některé kanály 5 GHz navíc podléhají DFS kontrole kvůli meteorologickým radarům).",
            "Protože Wi-Fi rádio nemůže při vysílání zároveň spolehlivě poslouchat kolize na drátě, používá přístupovou metodu CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance): stanice nejdříve poslouchá, zda je éter volný, počká náhodnou dobu a pak vysílá. Každý úspěšně přijatý rámec musí příjemce potvrdit zprávou ACK. Pokud se dvě stanice na opačných koncích budovy navzájem neslyší (problém skrytého uzlu – Hidden Node), mohou si před vysláním přes AP vyžádat klid pomocí krátkých rámců RTS/CTS. Ve větších budovách s více AP zajišťuje plynulé přepojení bez výpadku hovoru Fast Roaming dle standardů 802.11k (mapa sousedních AP), 802.11v (řízení přechodu klientů) a 802.11r (rychlá předautentizace klíčů).",
            "Zabezpečení dělíme na autentizaci (ověření totožnosti uživatele heslem nebo certifikátem) a autorizaci (jaká práva či VLAN dostane). Zastaralé WEP prolomíte za pár sekund. Bezpečným minimem je WPA2-PSK se šifrováním AES/CCMP. Moderní WPA3-Personal (SAE – Simultaneous Authentication of Equals) navíc znemožňuje offline hádání slabého hesla z odchyceného handshaku. Ve firmách se nasazuje WPA2/WPA3-Enterprise (802.1X s RADIUS serverem). Doplňkový Access List (MAC filtr) dokáže omezit běžné uživatele, ale útočník si MAC adresu snadno změní (MAC spoofing).",
            "SOHO routery (např. TP-Link Archer) umějí pracovat ve čtyřech hlavních režimech: Wireless Router (klasická brána s NAT a DHCP pro WAN → LAN), Access Point (AP – propojeno kabelem do hlavní sítě, bez NAT a DHCP, pouze převádí kabel na Wi-Fi), WISP (přijímá internet bezdrátově přes Wi-Fi jako WAN a za sebou tvoří novou NATovanou síť) a Repeater / Range Extender (bezdrátově opakuje signál hlavního AP, což však na jednom rádiu sníží reálnou rychlost zhruba na polovinu)."
          ],
          steps: [
            {
              step: "1. Vyhledání sítě (Beacon / Probe)",
              detail: "Access Point pravidelně vysílá majákové rámce (Beacon) se jménem sítě (SSID) a podporovanými rychlostmi."
            },
            {
              step: "2. Ověření a výměna klíčů (WPA2/WPA3 SAE)",
              detail: "Klient a AP provedou autentizaci a výměnu šifrovacích klíčů (4-Way Handshake / SAE) bez přenosu samotného hesla v otevřené podobě."
            },
            {
              step: "3. Asociace a získání IP",
              detail: "AP přiřadí klientovi identifikační číslo (AID) a klient si přes DHCP (DORA) požádá o IP adresu."
            },
            {
              step: "4. Přenos dat přes CSMA/CA",
              detail: "Před každým rámcem klient naslouchá volnému kanálu, odešle zašifrovaný rámec a čeká na potvrzení ACK."
            }
          ],
          analogy: "Přednáškový sál po tmě: nikdo nevidí všechny účastníky, proto než promluvíte, musíte poslouchat, zda je ticho, a pak čekat na krátké ‚Rozumím‘ (ACK). Kanály 1, 6 a 11 jsou tři zvukotěsně oddělené místnosti. Pokud si ale někdo sedne ‚na kanál 3‘, překřikuje se s místností 1 i 6 najednou a ruší všechny kolem.",
          comparisonTable: {
            headers: ["Režim SOHO routeru (TP-Link)", "Jak přijímá Internet (WAN)", "Běží NAT & DHCP?", "Doporučená rychlost & použití"],
            rows: [
              ["Wireless Router", "Kabelem do portu WAN (od modemu/ISP)", "ANO", "Plná rychlost – hlavní domácí brána do internetu"],
              ["Access Point (AP)", "Kabelem do LAN portu hlavní sítě", "NE (přepíná L2)", "Plná rychlost bez Double NAT – nejlepší rozšíření pokrytí"],
              ["WISP (Client Router)", "Bezdrátově přes Wi-Fi od poskytovatele", "ANO", "Vytvoří vlastní oddělenou NAT síť z cizí/ISP Wi-Fi"],
              ["Repeater / Range Extender", "Bezdrátově od hlavního Wi-Fi routeru", "NE (jen opakuje)", "Poloviční propustnost (Half-Duplex) – nouzově, kde nejde kabel"]
            ]
          },
          watchOut: "Vyhněte se třem nejčastějším chybám: 1) Nikdy nenastavujte na 2.4 GHz mezikanály jako 2, 3, 4 nebo 8 – způsobujete sousední interferenci, která je horší než sdílení kanálu 1/6/11. 2) Skrytí SSID a MAC filtr nejsou skutečné zabezpečení (SSID je vidět v Probe Requestech klientů). 3) Nezapojujte druhý router kabelem do WAN v režimu Router za hlavní router – vznikne Double NAT a rozbije se přístup na sdílené tiskárny či herní konzole."
        },
        example: {
          scenarioTitle: "Konfigurace bezpečné Wi-Fi sítě a Access Point režimu (TP-Link SOHO & MikroTik)",
          scenarioText: "V kancelářské budově rozšiřujeme pokrytí do nové laboratoře. K hlavnímu routeru vede kabel Cat6a. Záložní SOHO router TP-Link proto přepneme do režimu Access Point (případně nakonfigurujeme podnikové AP MikroTik), nastavíme kanál 6 na 2.4 GHz (20 MHz), kanál 36 na 5 GHz (80 MHz), šifrování WPA2/WPA3-PSK AES a Access List pro kontrolu připojení.",
          codeBlocks: [
            {
              label: "TP-Link SOHO — Doporučené nastavení režimu Access Point (Web GUI)",
              lang: "ini",
              code: "# Operation Mode: Access Point (vypne NAT i duplicitni DHCP server)\nMode = Access Point\nLAN IP (sprava) = 192.168.1.2 / 255.255.255.0 (Static nebo DHCP od hlavni brany)\n\n# 2.4 GHz Radio (delsi dosah pro IoT a mobily na chodbe)\nSSID = Corp-Lab-24\nChannel = 6 (2437 MHz) | Channel Width = 20 MHz\nSecurity = WPA2-PSK [AES] nebo WPA2/WPA3-Personal\n\n# 5 GHz Radio (rychly prenos pro notebooky v kancelari)\nSSID = Corp-Lab-5G\nChannel = 36 (5180 MHz) | Channel Width = 80 MHz\nSecurity = WPA3-SAE / WPA2-PSK [AES]"
            },
            {
              label: "MikroTik RouterOS — Nastavení Wi-Fi (WPA2/WPA3) a MAC Access Listu",
              lang: "routeros",
              code: "# 1. Bezpecnostni profil se sifrovanim WPA2/WPA3-PSK (bez zastaraleho TKIP)\n/interface wifi security add name=sec-corp authentication-types=wpa2-psk,wpa3-psk passphrase=\"SilneSitoveHeslo!\"\n\n# 2. Konfigurace kanalu (2.4 GHz kanal 6 / 20MHz a 5 GHz kanal 36 / 80MHz)\n/interface wifi channel add name=ch-24 band=2ghz-ax frequency=2437 width=20mhz\n/interface wifi channel add name=ch-5g band=5ghz-ax frequency=5180 width=20/40/80mhz\n\n# 3. Aplikace na bezdratova rozhrani\n/interface wifi set wifi1 configuration.ssid=\"Corp-Lab\" channel=ch-5g security=sec-corp disabled=no\n/interface wifi set wifi2 configuration.ssid=\"Corp-Lab\" channel=ch-24 security=sec-corp disabled=no\n\n# 4. Access List (povoleni zname stanice se slabym limitem signalu -75 dBm)\n/interface wifi access-list add mac-address=AA:BB:CC:11:22:10 signal-range=-75..0 action=accept\n/interface wifi access-list add action=reject comment=\"Odpojit klienty se slabym signalem\""
            }
          ],
          practicalTip: "Pokud nastavíte pro 2.4 GHz i 5 GHz stejné SSID a stejné heslo (Band Steering), moderní telefony a notebooky si automaticky zvolí rychlejší 5 GHz v blízkosti AP a na chodbě plynule přejdou na 2.4 GHz bez ručního přepínání."
        },
        quiz: [
          {
            question: "Které tři kanály v pásmu 2.4 GHz (při šířce 20 MHz) se navzájem vůbec nepřekrývají a měly by se používat při plánování více AP?",
            options: [
              "1, 6, 11",
              "1, 5, 9",
              "1, 2, 3",
              "3, 7, 13"
            ],
            correctIndex: 0,
            explanation: "Jeden 20MHz Wi-Fi kanál zabírá šířku přibližně pěti 5MHz kroků. Jediné tři kanály, které do sebe nezasahují a vzájemně se neruší, jsou 1 (2412 MHz), 6 (2437 MHz) a 11 (2462 MHz)."
          },
          {
            question: "Do vedlejší místnosti jste dotáhli Ethernetový kabel z hlavního routeru a chcete z druhého starého TP-Linku udělat Wi-Fi vysílač tak, aby všechna zařízení zůstala v jedné síti bez dvojitého NATu. Jaký režim nastavíte?",
            options: [
              "WISP Mode",
              "Repeater / Range Extender Mode",
              "Wireless Router Mode",
              "Access Point (AP) Mode"
            ],
            correctIndex: 3,
            explanation: "Režim Access Point (AP) vypne NAT i DHCP server na vedlejším routeru a funguje jako průchozí L2 most mezi přívodním kabelem a Wi-Fi rádiem."
          },
          {
            question: "Jaký hlavní problém oproti WPA2-PSK odstraňuje moderní protokol WPA3-Personal (SAE)?",
            options: [
              "Umožňuje připojit se k síti úplně bez hesla z jakéhokoliv zařízení.",
              "Zvyšuje maximální dosah vysílače na 5 kilometrů.",
              "Zabraňuje offline slovníkovým útokům po odchycení autentizačního handshaku (Dragonfly/SAE).",
              "Nahrazuje MAC adresy telefonními čísly."
            ],
            correctIndex: 2,
            explanation: "U WPA2-PSK bylo možné zachytit 4-Way Handshake a poté zkoušet miliony hesel offline na výkonné grafické kartě. WPA3 zavádí protokol SAE, kde každý pokus o hádání vyžaduje živou komunikaci s AP."
          }
        ]
      },

      // =========================================================================
      // TÉMA 16: Bluetooth a IoT sítě (BLE, Zigbee, Thread/Matter, LoRaWAN, NB-IoT)
      // =========================================================================
      {
        id: "bluetooth-iot",
        number: 16,
        moduleId: "wireless",
        mandatory: false,
        title: "Bluetooth a IoT sítě (BLE, Zigbee, Thread/Matter, LoRaWAN, NB-IoT)",
        shortTitle: "Bluetooth & IoT",
        subtitle: "Rozdíl Bluetooth Classic vs. BLE, topologie piconet, chytrá domácnost (Zigbee, Thread, Matter) a dálkové LPWAN sítě (LoRaWAN, NB-IoT).",
        cardSummary: "Bluetooth Classic vs. BLE, chytrá domácnost (Zigbee, Thread, Matter) a LPWAN (LoRaWAN).",
        difficulty: "Střední",
        accentColor: "#8b5cf6",
        tags: ["Bluetooth Classic / BLE", "Piconet & Profily", "Zigbee", "Thread & Matter", "LoRaWAN (868 MHz)", "NB-IoT"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/bluetooth-iot.mp4",
          poster: "media/posters/bluetooth-iot.jpg",
          startTime: 0,
          durationLabel: "0:14",
          chapters: [
            { label: "1. Bluetooth & chytrá domácnost (0:00)", time: 0 },
            { label: "2. Dálkové IoT sítě LoRaWAN / NB-IoT (0:07)", time: 7.0 }
          ],
          transcript: "0:00–0:07: Bluetooth a chytrá domácnost – „Pro krátkou vzdálenost slouží úsporný Bluetooth a v chytré domácnosti mesh sítě Zigbee a Thread.“\n0:07–0:14: Dálkové IoT sítě – „Senzory na kilometry daleko pak na jednu baterii komunikují přes LoRaWAN nebo NB-IoT.“"
        },
        animationType: "iot-spectrum",
        labType: "iot-advisor",
        takeaways: [
          "Bluetooth Classic (A2DP/HFP) slouží pro nepřetržitý tok dat jako hudba a hovory; Bluetooth Low Energy (BLE) většinu času spí a posílá krátké balíčky dat s výdrží na baterii měsíce až roky.",
          "Bluetooth tvoří síť typu Piconet (1 řídicí uzel a až 7 aktivních podřízených zařízení); propojením více piconetů vzniká Scatternet.",
          "Pro chytrou domácnost se používají úsporné Mesh sítě Zigbee a Thread (IEEE 802.15.4), nad nimiž dnes běží jednotný aplikační standard Matter.",
          "Pro přenos pár bajtů na kilometry daleko slouží LPWAN technologie: LoRaWAN (bezlicenční pásmo 868 MHz, vlastní brány, duty cycle 1 %) a NB-IoT (síť mobilních operátorů se SIM kartou, skvělý průnik do sklepů)."
        ],
        principle: {
          problem: "Wi-Fi je skvělá pro notebook, ale miniaturní teploměr na knoflíkovou baterii by vybila během několika hodin a do vodoměrné šachty uprostřed pole vůbec nedosáhne. Každý typ bezdrátového zařízení internetu věcí (IoT) proto vyžaduje jiný kompromis mezi dosahem, rychlostí a spotřebou.",
          explanation: [
            "Krátký dosah v osobní síti (WPAN) zajišťuje Bluetooth v bezlicenčním pásmu 2.4 GHz s technologií přeskakování frekvencí (FHSS), díky níž dobře odolává rušení od Wi-Fi. Rozlišujeme dva světy: Bluetooth Classic (BR/EDR) pro plynulý stream dat (sluchátka, reproduktory) a Bluetooth Low Energy (BLE, od verze 4.0), který vysílá krátké GATT zprávy a po zbytek času spí v mikroampérovém režimu (chytré hodinky, iBeacon majáky, teplotní čidla).",
            "Zařízení Bluetooth se sdružují do topologie Piconet – jeden hlavní uzel (Central/Master, např. telefon) řídí až 7 aktivních podřízených zařízení (Peripheral/Slave). Pokud jedno zařízení patří do dvou piconetů najednou, vzniká Scatternet. Podle vysílacího výkonu dělíme Bluetooth do tříd: Class 1 (100 mW, až 100 m), nejběžnější Class 2 (2.5 mW, cca 10 m) a Class 3 (1 mW, cca 1 m). Schopnosti určují tzv. profily: A2DP (kvalitní stereo hudba), HFP (handsfree s mikrofonem) a HID (klávesnice, myši, ovladače).",
            "V chytré domácnosti (Smart Home) vládnou sítě standardu IEEE 802.15.4 se samoopravnou topologií Mesh, kde zařízení napájená ze zásuvky (chytré žárovky, zásuvky) předávají signál dál bateriovým čidlům na dveřích a oknech. Zigbee je léty prověřené, ale pro připojení do internetu potřebuje bránu (Bridge/Koordinátor). Modernější Thread přidává nativní podporu IPv6 (6LoWPAN). Nad Threadem, Wi-Fi i Ethernetem pak funguje sjednocující aplikační standard Matter, díky němuž spolu konečně bez problémů komunikují prvky od Apple, Google, Samsungu i dalších výrobců.",
            "Potřebujeme-li posílat jen malé zprávy (desítky bajtů za hodinu) na vzdálenost mnoha kilometrů při zachování mnohaleté výdrže na baterii, nastupují sítě LPWAN (Low-Power Wide-Area Network):",
            "LoRaWAN pracuje v Evropě v bezlicenčním pásmu 868 MHz (s přísným zákonným limitem vysílacího času Duty Cycle max. 1 %), dosáhne mimo město 5–15 km a k provozu nepotřebujete tarif od operátora – stačí vlastní gateway nebo komunitní síť (např. The Things Network). Naproti tomu NB-IoT (Narrowband IoT) běží v licencovaných pásmech mobilních operátorů (LTE/5G), vyžaduje SIM/eSIM kartu, ale vyniká obrovskou spolehlivostí a průnikem signálu do hlubokých sklepů a kanalizačních šachet (chytré vodoměry, plynoměry)."
          ],
          steps: [
            {
              step: "1. Snímání veličiny (Senzor / End Node)",
              detail: "Bateriové čidlo se probudí ze spánku (Deep Sleep), změří teplotu nebo stav vodoměru a zabalí hodnotu do pár bajtů."
            },
            {
              step: "2. Rádiový přenos (BLE / Mesh / LPWAN)",
              detail: "Krátkým rádiovým impulsem odešle payload přes BLE, Zigbee/Thread mesh nebo na 868 MHz přes LoRaWAN."
            },
            {
              step: "3. Brána do IP sítě (Gateway / Border Router)",
              detail: "Brána (např. LoRaWAN Gateway nebo Thread Border Router) převede surová rádiová data do standardního TCP/IP provozu (často protokolem MQTT nebo HTTPS)."
            },
            {
              step: "4. Zpracování na serveru a automatizace",
              detail: "Aplikační server (Home Assistant, ChirpStack, cloud) dekóduje bajty na čitelný JSON a zobrazí graf nebo sepne ventil."
            }
          ],
          analogy: "Každá technologie je jiný dopravní prostředek: Wi-Fi je rychlovlak – uveze obrovský náklad videa, ale má obrovskou spotřebu paliva. Bluetooth Classic je bezdrátový kabel ke sluchátkům, BLE je kurýr na koloběžce po bytě, Zigbee/Thread je štafeta sousedů podávajících si zprávu z okna do okna a LoRaWAN s NB-IoT jsou poštovní holubi: unesou jen miniaturní lístek s číslem, ale doletí 10 kilometrů a téměř nic nesnědí.",
          comparisonTable: {
            headers: ["Technologie", "Pásmo", "Typický dosah", "Přenosová rychlost", "Spotřeba / Baterie", "Typické nasazení"],
            rows: [
              ["Bluetooth Classic", "2.4 GHz (FHSS)", "10 m (Class 2)", "1–3 Mbps", "Střední (dny na baterii)", "Bezdrátová sluchátka (A2DP), handsfree (HFP)"],
              ["Bluetooth LE (BLE)", "2.4 GHz", "10–50 m", "125 kbps – 2 Mbps", "Velmi nízká (měsíce až roky)", "Chytré hodinky, lokátory, čidla, HID myši"],
              ["Zigbee / Thread", "2.4 GHz (Mesh)", "10–30 m / skok", "250 kbps", "Nízká (roky na baterii)", "Chytrá domácnost (žárovky, termostaty, Matter)"],
              ["LoRaWAN", "868 MHz (EU)", "2–15 km", "0.3–50 kbps", "Extrémně nízká (5–10 let)", "Zemědělství, meteorologie, vlastní IoT sítě"],
              ["NB-IoT", "LTE licencované", "10+ km (i sklepy)", "20–250 kbps", "Velmi nízká (5–10 let)", "Vodoměry, plynoměry, chytrá parkoviště (SIM)"]
            ]
          },
          watchOut: "Pozor na tři časté chytáky v praxi: 1) LoRaWAN má v pásmu 868 MHz zákonný limit Duty Cycle obvykle 1 % (zařízení smí vysílat max. 36 sekund za hodinu) – v žádném případě přes něj nelze posílat fotky, video ani souvislý tok dat každou sekundu! 2) Matter není nová rádiová technologie místo Wi-Fi – je to jednotný aplikační jazyk, který běží nad existujícími sítěmi Thread, Wi-Fi nebo Ethernetem. 3) Zigbee/Thread používají pásmo 2.4 GHz (kanály 11–26), které se překrývá se silnými Wi-Fi kanály 1, 6 a 11; pro stabilní síť bez rušení se proto často volí Zigbee kanály 25 nebo 26 ležící nad Wi-Fi kanálem 11."
        },
        example: {
          scenarioTitle: "Sběr dat ze senzoru teploty a vlhkosti přes LoRaWAN bránu (MikroTik IoT + MQTT JSON)",
          scenarioText: "V automatizovaném skleníku i venkovní meteostanici snímáme teplotu a vlhkost bateriovým LoRaWAN čidlem na frekvenci 868 MHz. Čidlo kvůli úspoře baterie odešle pouze 4 bajty surových dat (např. hexadecimálně `09 42 18 9C`). LoRaWAN brána (např. MikroTik KNOT / wAP LR8) zprávu předá síťovému serveru, kde dekodér převede bajty na čitelný formát JSON a odešle je do systému Home Assistant přes protokol MQTT.",
          codeBlocks: [
            {
              label: "MikroTik RouterOS — Nastavení LoRaWAN brány (868 MHz EU) a MQTT klienta",
              lang: "routeros",
              code: "# 1. Konfigurace LoRa radia pro evropske bezlicencni pasmo EU868\n/iot lora servers add name=TTN-EU address=eu1.cloud.thethings.network up-port=1700 down-port=1700\n/iot lora set 0 network=public servers=TTN-EU channel-plan=eu-868 disabled=no\n\n# 2. Kontrola prijatych LoRa paketu a sily signalu (RSSI / SNR)\n/iot lora traffic print\n\n# 3. Nastaveni MQTT brokeru pro predavani dat z BLE/LoRa senzoru do centralniho serveru\n/iot mqtt brokers add name=iot-broker address=192.168.1.50 port=1883 client-id=mikrotik-gw"
            },
            {
              label: "JavaScript Uplink Decoder + Výsledný MQTT JSON payload ze senzoru",
              lang: "javascript",
              code: "// Dekoder na LoRaWAN serveru: ze 4 bajtu (09 42 18 9C) vypocte teplotu a vlhkost\nfunction decodeUplink(bytes) {\n  var tempRaw = (bytes[0] << 8) | bytes[1];      // 0x0942 = 2370 -> 23.70 C\n  var humRaw  = (bytes[2] << 8) | bytes[3];      // 0x189C = 6300 -> 63.00 %\n  return {\n    temperatureC: tempRaw / 100,\n    humidityPct: humRaw / 100\n  };\n}\n\n// Vysledna MQTT zprava na tematu: greenhouse/sensor-01\n// {\"deviceId\":\"lora-sklenik-01\",\"rssi\":-84,\"snr\":7.5,\"temperatureC\":23.7,\"humidityPct\":63.0,\"batteryV\":3.58}"
            }
          ],
          practicalTip: "Když vybíráte IoT síť pro vlastní projekt, ptejte se na tři věci: Má zařízení trvalé napájení ze zásuvky (Wi-Fi/Ethernet), potřebuje bateriově pokrýt byt (BLE/Zigbee/Thread+Matter), nebo má hlásit pár čísel ze sklepa či pole bez vlastní elektřiny (NB-IoT/LoRaWAN)?"
        },
        quiz: [
          {
            question: "Potřebujete osadit 200 vodoměrů v hlubokých betonových šachtách po celém městě, kde není elektrická zásuvka ani vaše Wi-Fi, a chcete mít garantované pokrytí bez stavby vlastních vysílačů. Kterou technologii zvolíte?",
            options: [
              "NB-IoT (Narrowband IoT)",
              "Wi-Fi 6E v pásmu 6 GHz",
              "Bluetooth Classic (A2DP)",
              "Zigbee bez koordinátora"
            ],
            correctIndex: 0,
            explanation: "NB-IoT běží v licencované síti mobilních operátorů, nevyžaduje stavbu vlastních bran, má nízkou spotřebu na baterie a vynikající průnik signálu pod zem a do budov."
          },
          {
            question: "Co vyjadřuje pojem „Piconet“ v souvislosti se sítí Bluetooth?",
            options: [
              "Rychlou výměnu šifrovacích klíčů v síti Wi-Fi WPA3.",
              "Lokální Bluetooth síť tvořenou jedním řídicím uzlem (Central/Master) a až 7 aktivními podřízenými zařízeními (Peripheral/Slave).",
              "Celosvětovou páteřní síť protokolu BGP.",
              "Frekvenční kanál 868 MHz vyhrazený pro LoRaWAN."
            ],
            correctIndex: 1,
            explanation: "Piconet je základní topologie Bluetooth: 1 řídicí uzel a až 7 aktivních podřízených uzlů. Více propojených piconetů tvoří Scatternet."
          },
          {
            question: "Jaký je hlavní rozdíl mezi protokolem Thread a starším Zigbee v chytré domácnosti (a jak do toho zapadá Matter)?",
            options: [
              "Zigbee používá optická vlákna, zatímco Thread používá kroucenou dvojlinku Cat6.",
              "Matter nahrazuje Bluetooth sluchátka pro přehrávání stereofonního zvuku.",
              "Thread má dosah 15 kilometrů na jednu baterii v pásmu 868 MHz.",
              "Thread přináší do 802.15.4 Mesh sítí nativní adresaci IPv6 (6LoWPAN) a společně s Wi-Fi slouží jako podklad pro jednotný aplikační standard Matter."
            ],
            correctIndex: 3,
            explanation: "Oba běží na rádiové vrstvě IEEE 802.15.4 v topologii Mesh, ale Thread nativně využívá IPv6 komunikaci přes Thread Border Router, což je základ pro interoperabilní aplikační vrstvu Matter."
          }
        ]
      },

      // =========================================================================
      // TÉMA 17: Firewall: Stateless, Stateful a Next-Generation (NGFW)
      // =========================================================================
      {
        id: "firewall",
        number: 17,
        moduleId: "security-sdn",
        mandatory: true,
        title: "Firewall: Stateless, Stateful a Next-Generation (NGFW)",
        shortTitle: "Firewall (Stateless / Stateful / NGFW)",
        subtitle: "Řízení a filtrace síťového provozu: od bezstavových ACL přes stavový Connection Tracking až po L7 inspekci NGFW, DMZ a politiku Default-Deny.",
        cardSummary: "Filtrace provozu od ACL (Stateless) přes sledování spojení (Stateful) po L7 DPI (NGFW).",
        difficulty: "Pokročilé",
        accentColor: "#ef4444",
        tags: ["Stateless ACL", "Stateful Firewall", "Connection Tracking", "NGFW / DPI", "IPS / IDS", "DMZ & Default-Deny"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/firewall.mp4",
          poster: "media/posters/firewall.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Stavový firewall (State Table) (0:00)", time: 0 },
            { label: "2. NGFW: Inspekce aplikací (L7 + IPS) (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Stavový firewall – „Stavový firewall sleduje navázaná spojení, propustí vyžádané odpovědi a cizí útoky zablokuje.“\n0:07–0:13: NGFW a L7 inspekce – „Moderní firewall nové generace navíc rozpozná samotné aplikace a odhalí hrozby uvnitř paketů.“"
        },
        animationType: "firewall",
        labType: "firewall-inspector",
        takeaways: [
          "Stateless (bezstavový) firewall / ACL posuzuje každý paket izolovaně jen podle L3/L4 hlaviček (5-tice: zdrojová/cílová IP, protokol, zdrojový/cílový port) — nezná kontext spojení a vyžaduje ruční povolení i pro zpětný provoz.",
          "Stateful (stavový) firewall udržuje tabulku aktivních spojení (Connection Tracking: NEW, ESTABLISHED, RELATED, INVALID) — automaticky propouští odpovědi k legitimním odchozím relacím a zahazuje podvržené pakety mimo stav.",
          "NGFW (Next-Generation Firewall) provádí L7 hloubkovou inspekci paketů (DPI): rozpozná konkrétní aplikaci (App-ID) nezávisle na portu, nasazuje IPS/IDS proti exploitům, TLS inspekci a URL/threat-intel filtraci.",
          "Bezpečná architektura vždy uplatňuje politiku Default-Deny (co není výslovně povoleno, je zakázáno) a odděluje veřejně dostupné servery do DMZ zóny mezi WAN a vnitřní LAN."
        ],
        principle: {
          problem: "Připojení k Internetu a rozdělení vnitřní sítě na VLAN nestačí, pokud může kdokoli zvenčí posílat provoz na interní servery nebo se útočník schová za běžně povolený port 443. Jak přesně oddělit legitimní komunikaci od útoků na L3/L4 i aplikační vrstvě L7?",
          explanation: [
            "Firewall je bezpečnostní prvek (síťové zařízení nebo software v OS), který stojí na hranici bezpečnostních zón (např. WAN ↔ LAN, LAN ↔ DMZ, nebo mezi VLAN) a rozhoduje, které pakety projdou (ACCEPT/ALLOW) a které budou zahozeny (DROP tiše bez odpovědi, nebo REJECT s chybou ICMP/RST). Základem každého spolehlivého firewallu je princip Default-Deny (implicitní zákaz na konci řetězce pravidel): povolíme jen přesně definované služby a vše ostatní zablokujeme.",
            "1. generace — Stateless (bezstavový) firewall / Packet Filter (ACL): Pracuje čistě na 3. a 4. vrstvě (L3/L4) a kontroluje každý příchozí paket naprosto izolovaně podle tzv. 5-tice údajů (zdrojová IP, cílová IP, protokol TCP/UDP/ICMP, zdrojový port, cílový port) a TCP příznaků. Neví, zda je paket odpovědí na náš předchozí dotaz, nebo úvodním útokem. Výhodou je extrémní rychlost na hardwarových routerech a switchích (ACL v ASIC); nevýhodou je pracná správa: pro webové prohlížení musíte povolit odchozí TCP/443 a současně i příchozí provoz na dynamické porty 1024–65535 (nebo kontrolovat TCP bit ACK/ESTABLISHED, což ale nefunguje u bezspojového UDP a je zranitelné vůči spoofingu ACK paketů).",
            "2. generace — Stateful (stavový) firewall: Sleduje kontext komunikace v paměťové tabulce spojení (Connection Tracking / State Table). Každému paketu přiřadí stav: NEW (první paket nového spojení, např. TCP SYN nebo první UDP DNS dotaz), ESTABLISHED (paket patřící k již ověřené obousměrné relaci), RELATED (nové související spojení vyvolané existujícím, např. datový kanál FTP nebo chybová ICMP zpráva k existujícímu toku) a INVALID (poškozený paket nebo paket s nesmyslnými příznaky, např. osamocený TCP FIN/ACK bez předchozího handshaku). Správce tak jedním pravidlem povolí `ESTABLISHED, RELATED` a definuje už jen směr nových spojení (`NEW`), např. z LAN na WAN — odpovědi ze serverů se vrátí automaticky a falešné nevyžádané pakety z Internetu jsou zahozeny.",
            "3. generace — NGFW (Next-Generation Firewall): Dnešní útočníci a aplikace běžně maskují provoz přes standardní porty (např. tunely nebo malware na TCP/443, P2P nebo vzdálená správa přes HTTP). NGFW proto přidává hloubkovou inspekci paketů až po 7. aplikační vrstvu (DPI – Deep Packet Inspection) a funkci App-ID, která pozná skutečný protokol/aplikaci bez ohledu na číslo portu. Součástí NGFW bývá integrované IPS/IDS (detekce a aktivní blokování známých útoků a exploitů podle signatur i anomálií), inspekce šifrovaného TLS/SSL provozu (firewall vystupuje jako řízený proxy s interní certifikační autoritou), URL filtrování, napojení na Threat Intelligence a vazba pravidel na identitu uživatele (Active Directory / RADIUS), nikoliv jen na IP adresu.",
            "V architektonické praxi se používá zónový model (Zone-Based Firewall): oddělujeme zónu WAN (nedůvěryhodný Internet), LAN (důvěryhodná vnitřní síť), MGMT (správa síťových prvků) a DMZ (demilitarizovaná zóna). Pokud firma provozuje veřejný web či mailserver, umístí jej do DMZ — WAN smí navazovat spojení jen do DMZ (např. port 443), DMZ však nesmí sama otevírat spojení do vnitřní LAN. I kdyby útočník webový server v DMZ kompromitoval, nedostane se k interním databázím a stanicím v LAN."
          ],
          steps: [
            {
              step: "1. Vyhodnocení zón a rozhraní (Input vs. Forward vs. Output)",
              detail: "Firewall rozliší, zda paket míří do samotného routeru/firewallu (INPUT), prochází mezi sítěmi/zónami (FORWARD), nebo odchází z firewallu (OUTPUT)."
            },
            {
              step: "2. Kontrola tabulky spojení (Stateful Connection Tracking)",
              detail: "U stavového firewallu a NGFW se nejprve zkontroluje paměť relací: pakety se stavem ESTABLISHED/RELATED projdou ihned zrychlenou cestou; INVALID se zahodí. Stateless ACL tento krok zcela vynechává."
            },
            {
              step: "3. Průchod seznamem pravidel shora dolů (Top-Down First Match)",
              detail: "Provoz (zejména stav NEW) prochází pravidly v přesném pořadí od 1. řádku dolů. První shodné pravidlo rozhodne (ACCEPT / DROP / REJECT) a zbývající pravidla se už nehodnotí."
            },
            {
              step: "4. L7 DPI, IPS a TLS inspekce (pouze u NGFW)",
              detail: "NGFW analyzuje aplikační obsah (App-ID, URL, signatury IPS, případně dešifrovaný TLS proud). Při detekci malwaru či zakázané aplikace spojení okamžitě ukončí."
            },
            {
              step: "5. Záchytná politika Default-Deny na konci",
              detail: "Pokud paket nevyhověl žádnému povolujícímu pravidlu výše, narazí na poslední pravidlo `drop all` (implicitní zákaz) a je bezpečně zahozen (volitelně zalogován)."
            }
          ],
          analogy: "Stateless firewall je vrátný s papírovým seznamem: kontroluje každý průchod dveřmi zvlášť — ‚Máš oblek a jdeš do místnosti 443? Projdi!‘ Nepamatuje si ale, jestli člověk vracený z venku byl předtím vůbec uvnitř. Stateful firewall je vrátný s návštěvní knihou: zapíše si, kdy zaměstnanec vyšel na poštu (NEW), a když se pošťák vrací s odpovědí (ESTABLISHED), pustí ho dovnitř, ale cizího člověka bez pozvání nepustí. NGFW je navíc letištní rentgen a celní kontrola: nestačí mu platná letenka (port 443) — otevře i kufr (L7 DPI), zkontroluje, zda v krabici od bot není zakázané zboží (App-ID / IPS), a ověří cestujícího podle občanky (identita uživatele).",
          comparisonTable: {
            headers: ["Vlastnost / Kritérium", "Stateless (Packet Filter / ACL)", "Stateful (Stavový firewall)", "NGFW (Next-Generation Firewall)"],
            rows: [
              ["Vrstvy modelu ISO/OSI", "L3 + L4 (IP, protokol, porty, TCP flagy)", "L3 + L4 + sledování stavu relace", "L3 až L7 (plná aplikační inspekce)"],
              ["Tabulka spojení (State)", "Neexistuje (každý paket izolovaně)", "Ano (NEW, ESTABLISHED, RELATED, INVALID)", "Ano + hluboký aplikační kontext"],
              ["Zpětný provoz (odpovědi)", "Nutné ručně povolit opačným pravidlem", "Automaticky povolen pro ESTABLISHED", "Automaticky povolen + kontrola obsahu"],
              ["Rozpoznání aplikace", "Jen odhad podle čísla portu (snadno obejitelné)", "Jen podle čísla portu", "Skutečné App-ID (DPI) nezávisle na portu"],
              ["IPS/IDS, TLS & URL filtr", "Ne", "Ne", "Ano (IPS signatury, TLS inspekce, Threat Intel)"],
              ["Výkon & Typické nasazení", "Extrémní rychlost v HW (L3 switche, ISP hrany)", "Standardní routery/firewally (Linux nftables, MikroTik)", "Podniková perimetrová obrana (Palo Alto, Fortinet, OPNsense+IPS)"]
            ]
          },
          watchOut: "Pozor na tři klasické chyby v praxi: 1) Špatné pořadí pravidel — pravidla se vyhodnocují SHORA DOLŮ po první shodu; pokud dáte `drop all` před povolující pravidla, zablokujete celou síť! 2) Záměna `DROP` (paket tiše zmizí, útočník čeká na timeout) a `REJECT` (odešle ICMP Unreachable / TCP RST, vhodné jen uvnitř LAN pro rychlé selhání, na WAN raději DROP). 3) NAT NENÍ firewall — spoléhat se na to, že ‚mám NAT, tak jsem v bezpečí‘, selže u IPv6, při odchozím malwaru i při útocích mezi vnitřními VLAN."
        },
        example: {
          scenarioTitle: "Porovnání konfigurace: Stateless ACL, Stateful firewall (nftables / MikroTik) a politika NGFW s DMZ",
          scenarioText: "Navrhneme ochranu podnikové sítě se třemi zónami: `LAN` (10.10.10.0/24), `DMZ` (172.16.50.0/24 s webovým serverem 172.16.50.10:443) a `WAN` (Internet). Uvidíte rozdíl mezi bezstavovým ACL (nutnost povolovat i návratové pakety), stavovým firewallem v Linuxu (`nftables`) / MikroTiku a NGFW pravidlem s L7 App-ID a IPS.",
          codeBlocks: [
            {
              label: "1. Stateless ACL (Cisco IOS) — nutná explicitní pravidla tam i zpět",
              lang: "ios",
              code: "! Stateless ACL na vstupu z WAN: musi explicitne kontrolovat TCP flag 'established'\n! (u UDP by muselo byt povoleno cele spektrum dynamickych portu bez kontroly stavu!)\nip access-list extended WAN-IN-STATELESS\n permit tcp any host 172.16.50.10 eq 443        ! Povolit HTTPS do DMZ webu\n permit tcp any 10.10.10.0 0.0.0.255 established ! Povolit JEN pakety s ACK/RST zpet do LAN\n deny ip any any log                             ! Implicitni / explicitni Default-Deny"
            },
            {
              label: "2. Stateful Firewall (Linux nftables & MikroTik RouterOS) — Connection Tracking + DMZ",
              lang: "bash",
              code: "# === Linux nftables (/etc/nftables.conf) ===\ntable inet filter {\n  chain forward {\n    type filter hook forward priority 0; policy drop;   # Default-Deny!\n    ct state established,related accept                 # Automaticky vraci odpovedi\n    ct state invalid drop                               # Zahodi neplatne pakety\n    iifname \"lan0\" oifname \"wan0\" accept                # LAN -> Internet OK\n    iifname \"wan0\" oifname \"dmz0\" ip daddr 172.16.50.10 tcp dport 443 accept\n    iifname \"dmz0\" oifname \"lan0\" drop                  # DMZ nesmi iniciovat spojeni do LAN!\n  }\n}\n\n# === Ekvivalent v MikroTik RouterOS ===\n/ip firewall filter\nadd chain=forward connection-state=established,related action=accept\nadd chain=forward connection-state=invalid action=drop\nadd chain=forward in-interface=ether2-LAN out-interface=ether1-WAN action=accept\nadd chain=forward in-interface=ether1-WAN out-interface=ether3-DMZ dst-address=172.16.50.10 protocol=tcp dst-port=443 action=accept\nadd chain=forward action=drop comment=\"Default-Deny\""
            },
            {
              label: "3. Logika NGFW politiky (L7 App-ID, identita a IPS profil)",
              lang: "yaml",
              code: "# Koncept NGFW pravidla (Palo Alto / Fortinet / OPNsense Zenarmor):\nrule_1_allow_web:\n  source_zone: LAN\n  source_users: [\"AD-Group-Employees\"]   # Vazba na identitu uzivatele\n  destination_zone: WAN\n  application_id: [\"ssl\", \"web-browsing\"] # L7 DPI App-ID (ne jen port 443!)\n  service: \"application-default\"          # Aplikace smi jen na svuj standardni port\n  security_profiles:\n    ips: \"strict-vulnerability-protection\"\n    url_filtering: \"block-malware-phishing\"\n    tls_inspection: \"decrypt-outbound-except-banking\"\n  action: allow\n\nrule_99_default_deny:\n  source: any\n  destination: any\n  action: deny\n  log: true"
            }
          ],
          practicalTip: "Při ladění pravidel firewallu si vždy na konec (těsně před `drop all`) dočasně zapněte logování zahozených paketů — v reálném čase tak uvidíte přesnou zdrojovou/cílovou IP a port služby, kterou jste zapomněli povolit."
        },
        quiz: [
          {
            question: "Jaký je hlavní rozdíl mezi bezstavovým (Stateless) a stavovým (Stateful) firewallem při zpracování odpovědi ze vzdáleného webového serveru?",
            options: [
              "Stateless firewall automaticky rozpozná HTTP odpověď podle obsahu HTML stránky.",
              "Stateless firewall šifruje veškerý provoz pomocí TLS certifikátu.",
              "Stateful firewall funguje pouze pro protokol UDP, zatímco Stateless pouze pro TCP.",
              "Stateful firewall si uloží odchozí spojení do Connection Tracking tabulky (ESTABLISHED) a zpětnou odpověď pustí bez nutnosti psát široké příchozí pravidlo; Stateless posuzuje každý paket izolovaně."
            ],
            correctIndex: 3,
            explanation: "Stavový firewall udržuje tabulku aktivních spojení (NEW, ESTABLISHED, RELATED, INVALID), takže odpovědi k dříve povolenému odchozímu spojení propustí automaticky, kdežto bezstavový filtr vyhodnocuje jen hlavičku každého jednotlivého paketu bez paměti."
          },
          {
            question: "Kterou schopnost přináší až Next-Generation Firewall (NGFW) oproti klasickému stavovému L3/L4 firewallu?",
            options: [
              "Překlad privátních IP adres na veřejnou IP adresu (NAT).",
              "Přepínání ethernetových rámců podle MAC adres v CAM tabulce.",
              "Hloubkovou inspekci paketů až na L7 (DPI), rozpoznání aplikace nezávisle na portu (App-ID), integrované IPS/IDS a kontrolu TLS/URL.",
              "Dynamické přidělování IP adres pomocí 4krokového procesu DORA."
            ],
            correctIndex: 2,
            explanation: "NGFW analyzuje i aplikační obsah (L7 DPI), takže odhalí tunelování, zneužití portu 443 nebo exploit v datovém proudu pomocí IPS a TLS inspekce."
          },
          {
            question: "Proč umisťujeme veřejný firemní webový server do oddělené zóny DMZ (demilitarizované zóny) místo přímo do vnitřní sítě LAN?",
            options: [
              "Aby se v případě napadení veřejného serveru útočník z Internetu nedostal přímo do vnitřní LAN sítě s interními daty a stanicemi.",
              "Aby měl server vyšší přenosovou rychlost přes optický kabel.",
              "Protože protokol HTTPS neumí fungovat ve stejné síti jako DHCP.",
              "Aby server nemusel mít žádnou IP adresu ani masku podsítě."
            ],
            correctIndex: 0,
            explanation: "DMZ izoluje veřejně vystavené servery. Firewall povolí z WAN spojení jen na konkrétní port do DMZ, ale zakáže DMZ iniciovat nová spojení do důvěryhodné LAN."
          },
          {
            question: "Na firewallu máte pravidlo č. 1 `drop all` (zahodit vše) a pod ním pravidlo č. 2 `accept tcp port 443`. Co se stane s odchozím HTTPS provozem?",
            options: [
              "HTTPS provoz projde, protože pravidla s konkrétním portem mají vždy přednost.",
              "HTTPS provoz bude zahozen, protože firewall vyhodnocuje pravidla shora dolů a zastaví se na první shodě (pravidlo č. 1).",
              "Firewall oba řádky sečte a polovinu paketů propustí.",
              "Provoz projde pouze v případě, že jde o protokol UDP."
            ],
            correctIndex: 1,
            explanation: "Pravidla firewallu se vyhodnocují postupně shora dolů (Top-Down First Match). Obecný zákaz (`Default-Deny`) proto musí být VŽDY až jako poslední pravidlo na konci řetězce."
          }
        ]
      },

      // =========================================================================
      // TÉMA 18: SDN (Software-Defined Networking), API a SD-WAN
      // =========================================================================
      {
        id: "sdn",
        number: 18,
        moduleId: "security-sdn",
        mandatory: true,
        title: "SDN (Software-Defined Networking), API a SD-WAN",
        shortTitle: "SDN & Moderní správa sítí",
        subtitle: "Oddělení Control Plane a Data Plane, Northbound a Southbound API (OpenFlow, NETCONF/RESTCONF), SD-WAN, Intent-Based Networking a praxe kontrolérů.",
        cardSummary: "Oddělení Control a Data Plane, API OpenFlow/NETCONF, SD-WAN a centrální SDN kontroléry.",
        difficulty: "Pokročilé",
        accentColor: "#f97316",
        tags: ["SDN", "Control vs. Data Plane", "OpenFlow", "NETCONF / RESTCONF", "SD-WAN", "IBN & Kontroléry"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/sdn.mp4",
          poster: "media/posters/sdn.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Architektura Control vs. Data Plane (0:00)", time: 0 },
            { label: "2. Hromadná konfigurace z kontroleru (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Oddělení rovin – „Softwarově definovaná síť odděluje centrální řídicí mozek od přepínačů, které přeposílají data.“\n0:07–0:13: Hromadná správa – „Správce tak z jediného kontroleru okamžitě nastaví pravidla i trasy napříč celou sítí.“"
        },
        animationType: "sdn",
        labType: "sdn-controller-sim",
        takeaways: [
          "Základním principem SDN je oddělení řídicí roviny (Control Plane — ‚mozek‘ rozhodující o cestách a politikách) od datové roviny (Data Plane — hardware přeposílající pakety v plné rychlosti).",
          "Architektura SDN má tři vrstvy propojené rozhraními: Aplikační rovina ↔ (Northbound API: REST/gRPC) ↔ SDN Kontrolér (Control Plane) ↔ (Southbound API: OpenFlow, NETCONF/RESTCONF, OVSDB) ↔ Data Plane.",
          "SD-WAN přenáší principy SDN na propojení poboček přes více linek (optika, MPLS, LTE/5G) a automaticky směruje kritické aplikace po nejzdravější trase.",
          "V reálné praxi se s centralizovanou správou setkáte u kontrolérů UniFi Network, TP-Link Omada, MikroTik CAPsMAN i podnikového Cisco Catalyst Center (IBN — Intent-Based Networking)."
        ],
        principle: {
          problem: "V tradičních sítích má každý switch a router vlastní samostatný mozek — když chcete změnit VLAN, QoS nebo Wi-Fi politiku na 50 zařízeních, musíte se přihlásit na každý prvek zvlášť a riskujete chyby z nekonzistence. Jak udělat ze sítě jeden programovatelný celek řízený z jednoho místa?",
          explanation: [
            "V klasické síťové architektuře jsou na každém switchi i routeru svázány tři funkce dohromady: Data Plane (datová rovina — čipy ASIC, které bleskově přeposílají rámce a pakety mezi porty), Control Plane (řídicí rovina — procesor počítající STP, OSPF, BGP či CAM tabulky) a Management Plane (správa přes SSH/GUI). Každý prvek si tak ‚myslí sám za sebe‘ a koordinace desítek prvků je pomalá a náchylná k lidským chybám.",
            "SDN (Software-Defined Networking) tuto architekturu rozděluje: z jednotlivých switchů a přístupových bodů vyjme ‚mozek‘ (Control Plane) a přesune jej do centrálního softwarového SDN kontroléru. Síťové prvky v infrastrukturní datové rovině (Data Plane) se pak soustředí čistě na rychlé přeposílání provozu podle pravidel, která jim kontrolér pošle.",
            "Komunikace v třívrstvé SDN architektuře probíhá přes standardizovaná rozhraní (API): 1) Application Plane (aplikační rovina — monitorovací nástroje, bezpečnostní orchestrátory, automatizační skripty) předává požadavky kontroléru přes Northbound API (typicky moderní HTTP REST API s JSON nebo gRPC). 2) Control Plane (SDN kontrolér — např. OpenDaylight, ONOS, nebo firemní kontrolér) udržuje globální pohled na celou topologii a překládá záměr na konkrétní pravidla. 3) Southbound API propojuje kontrolér se zařízeními v Data Plane — historickým průkopníkem byl protokol OpenFlow (kontrolér přímo zapisuje Match–Action pravidla do flow tabulek switche); v moderní praxi dominují protokoly NETCONF (XML přes SSH), RESTCONF (JSON/XML přes HTTPS s datovými modely YANG) a gRPC/gNMI.",
            "Významnou aplikací SDN v rozlehlých sítích je SD-WAN (Software-Defined WAN). Místo drahých pronajatých MPLS okruhů spojí pobočky přes běžný internet (optika + záložní 5G/LTE) pomocí šifrovaných tunelů. Centrální SD-WAN kontrolér v reálném čase měří latenci, jitter a ztrátovost na každé lince a sám přepne hlasový hovor nebo cloudovou aplikaci na linku, která má právě nejlepší kvalitu (Application-Aware Routing), bez zásahu správce.",
            "Nejnovějším vývojovým krokem je Intent-Based Networking (IBN — např. Cisco Catalyst Center): správce nezadává stovky řádků CLI příkazů, ale deklaruje záměr (‚Odděl hosty od účetního systému a garantuj prioritu videokonferencím‘). Kontrolér záměr automaticky přeloží do konfigurace desítek prvků a průběžně telemetrií ověřuje, zda síť záměr skutečně splňuje. S principy centrálního SDN kontroléru se běžně setkáte i v menších sítích u platforem Ubiquiti UniFi Network, TP-Link Omada nebo MikroTik CAPsMAN pro hromadnou správu desítek Wi-Fi AP a switchů."
          ],
          steps: [
            {
              step: "1. Deklarace požadavku v Aplikační rovině (Northbound API)",
              detail: "Správce v dashboardu nebo automatizační skript přes Northbound REST API zadá politiku (např. vytvoření nové VLAN 30 pro hosty s limitem 50 Mbps)."
            },
            {
              step: "2. Výpočet topologie a pravidel v Control Plane (SDN Kontrolér)",
              detail: "Centrální kontrolér zná mapu všech switchů, routerů a AP. Přepočítá optimální trasy, ACL i VLAN mapování pro celou síť najednou."
            },
            {
              step: "3. Distribuce pravidel přes Southbound API",
              detail: "Kontrolér odešle konfiguraci nebo Match–Action záznamy do dotčených zařízení pomocí OpenFlow, NETCONF, RESTCONF nebo proprietárního protokolu kontroléru."
            },
            {
              step: "4. Rychlé přeposílání v Data Plane + Telemetrie zpět",
              detail: "Switche a routery přeposílají pakety hardwarovou rychlostí podle nových tabulek a zpět do kontroléru posílají statistiky provozu (telemetrii) pro další optimalizaci."
            }
          ],
          analogy: "Tradiční síť je křižovatka s deseti policisty, z nichž každý řídí jen svůj roh podle papírových instrukcí — když se o dvě ulice dál ucpe silnice, ostatní o tom nevědí. SDN je centrální dopravní dispečink chytrého města: dispečink (Control Plane) vidí kamery ze všech ulic najednou a přes semafory (Southbound API) v jednom okamžiku přepne zelenou vlnu (Data Plane) po celém městě.",
          comparisonTable: {
            headers: ["Kritérium", "Tradiční distribuovaná síť", "Centralizované SDN", "SD-WAN (SDN pro WAN)"],
            rows: [
              ["Umístění Control Plane", "Samostatně v každém switchi / routeru", "Centralizovaně v SDN kontroléru", "Centrální orchestrátor v cloudu / DC"],
              ["Způsob konfigurace", "Ručně prvek po prvku (SSH / CLI / GUI)", "Centrálně šablony & API (Northbound REST)", "Zero-Touch Provisioning pro pobočky"],
              ["Protokoly řízení", "OSPF, BGP, STP běžící lokálně na prvcích", "OpenFlow, NETCONF/RESTCONF (YANG), OVSDB", "IPsec/WireGuard overlay + telemetrie linek"],
              ["Přepínání při změně", "Lokální konvergence protokolů", "Okamžitý přepočet z globálního pohledu", "Automatický failover podle kvality linky (SLA)"],
              ["Typické příklady", "Klasické Cisco Catalyst / MikroTik standalone", "UniFi Network, TP-Link Omada, Catalyst Center", "Fortinet Secure SD-WAN, Cisco Viptela, VMware VeloCloud"]
            ]
          },
          watchOut: "Dvě časté chyby v chápání SDN: 1) Kontrolér NEpřeposílá každý uživatelský paket! Kdyby všechna videa a soubory proudily přes kontrolér, zahltil by se. Kontrolér pouze rozdává pravidla (Control Plane), kdežto vlastní data proudí přímo po lokálních switchích a linkách (Data Plane) — většinou proto Data Plane běží dál, i když se kontrolér krátce restartuje. 2) OpenFlow není totéž co SDN — OpenFlow byl jen první známý Southbound protokol; dnes se v praxi mnohem častěji používá NETCONF/RESTCONF s modely YANG nebo kontroléry typu UniFi/Omada/CAPsMAN."
        },
        example: {
          scenarioTitle: "Programování sítě přes API: OpenFlow Match–Action pravidlo, RESTCONF dotaz a kontroléry v praxi",
          scenarioText: "V prvním bloku vidíte princip pravidla v protokolu OpenFlow (Match–Action v datové rovině). Druhý blok ukazuje moderní Southbound/Northbound automatizaci pomocí RESTCONF/JSON (standard YANG), kterou lze jedním požadavkem nakonfigurovat rozhraní nebo VLAN.",
          codeBlocks: [
            {
              label: "1. Princip OpenFlow Flow Table (Match -> Action v Data Plane)",
              lang: "json",
              code: "{\n  \"dpid\": \"00:00:00:00:00:00:00:01\",\n  \"priority\": 200,\n  \"match\": {\n    \"in_port\": 1,\n    \"eth_type\": \"0x0800\",\n    \"ipv4_dst\": \"10.20.0.0/24\",\n    \"ip_proto\": 6,\n    \"tcp_dst\": 443\n  },\n  \"actions\": [\n    { \"type\": \"SET_VLAN_VID\", \"vlan_vid\": 20 },\n    { \"type\": \"OUTPUT\", \"port\": 24 }\n  ]\n}"
            },
            {
              label: "2. Automatizace přes RESTCONF (HTTP PATCH s JSON na základě YANG modelu)",
              lang: "bash",
              code: "$ curl -X PATCH https://switch-core.example/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet1%2F0%2F5 \\\n  -H \"Content-Type: application/yang-data+json\" \\\n  -H \"Accept: application/yang-data+json\" \\\n  -u admin:token \\\n  -d '{\n    \"ietf-interfaces:interface\": {\n      \"name\": \"GigabitEthernet1/0/5\",\n      \"description\": \"SDN-Managed-Access-VLAN20\",\n      \"enabled\": true\n    }\n  }'"
            },
            {
              label: "3. MikroTik CAPsMAN (Centralizované řízení Wi-Fi AP z jednoho routeru)",
              lang: "routeros",
              code: "# Zapnuti centralniho kontroleru CAPsMAN pro vsechna firemni AP\n/interface wifi capsman set enabled=yes interfaces=br-mgmt\n\n# Sablona konfigurace (provisioning) automaticky nasadi SSID a VLAN na nova AP\n/interface wifi provisioning add action=create-dynamic-enabled master-configuration=cfg-corp-5g slave-configurations=cfg-guest-vlan30"
            }
          ],
          practicalTip: "Pokud se chcete učit síťovou automatizaci a SDN v praxi, vyzkoušejte si zdarma nástroj Mininet (virtuální síť switchů s OpenFlow v Linuxu) nebo Python knihovny Netmiko / RESTCONF — stejný skript pak dokáže nakonfigurovat jeden i sto switchů."
        },
        quiz: [
          {
            question: "Co je hlavní myšlenkou architektury SDN (Software-Defined Networking)?",
            options: [
              "Oddělení řídicí roviny (Control Plane v centrálním kontroléru) od datové roviny (Data Plane na switchích/routerech).",
              "Nahrazení všech optických kabelů bezdrátovou technologií Bluetooth Mesh.",
              "Zrušení IP adres a přechod na přeposílání paketů výhradně podle názvů domén.",
              "Přesměrování úplně všech uživatelských datových paketů přes webový prohlížeč správce."
            ],
            correctIndex: 0,
            explanation: "SDN centralizuje ‚mozek‘ sítě (Control Plane) do softwarového kontroléru, zatímco síťové prvky v Data Plane přeposílají pakety v hardwarové rychlosti podle dodaných pravidel."
          },
          {
            question: "Které rozhraní slouží ke komunikaci mezi SDN kontrolérem (Control Plane) a síťovými prvky v datové rovině (Data Plane)?",
            options: [
              "Northbound API (např. uživatelská aplikace → kontrolér)",
              "DHCP Relay (IP Helper)",
              "CSMA/CD kolizní rozhraní",
              "Southbound API (např. OpenFlow, NETCONF, RESTCONF, OVSDB)"
            ],
            correctIndex: 3,
            explanation: "Southbound API propojuje kontrolér ‚dolů‘ se síťovými prvky (OpenFlow, NETCONF/RESTCONF, gRPC/gNMI). Northbound API propojuje kontrolér ‚nahoru‘ s aplikacemi a orchestrátory."
          },
          {
            question: "Kterou hlavní výhodu přináší SD-WAN oproti klasickému propojení poboček pevnou linkou?",
            options: [
              "Umožňuje pobočkám pracovat úplně bez internetu a bez šifrování.",
              "Sdružuje více běžných přípojek (optika, LTE/5G), průběžně měří jejich latenci/ztrátovost a automaticky směruje aplikace po nejkvalitnější trase z jednoho orchestrátoru.",
              "Zvyšuje maximální délku UTP kabelu Cat6a z 100 m na 10 km.",
              "Nahrazuje transportní protokoly TCP a UDP protokolem ARP."
            ],
            correctIndex: 1,
            explanation: "SD-WAN odděluje řízení WAN propojení do centrálního orchestrátoru, šifruje provoz nad libovolnými linkami a dynamicky volí nejlepší cestu podle aktuálního stavu spojení."
          },
          {
            question: "Co se stane s lokálním přenosem dat mezi dvěma počítači připojenými ke switchi, pokud se centrální SDN kontrolér na 30 sekund restartuje (při zachování stávajících flow tabulek)?",
            options: [
              "Veškerá síťová komunikace se okamžitě zastaví, protože každý paket musí projít kontrolérem.",
              "Switche automaticky smažou všechny VLAN a přepnou se do režimu Hub.",
              "Data Plane pokračuje v přeposílání provozu podle již nahraných pravidel v paměti switche; dočasně jen nelze nasazovat nové centrální politiky.",
              "Všem počítačům se změní MAC adresa na FF:FF:FF:FF:FF:FF."
            ],
            correctIndex: 2,
            explanation: "Uživatelský provoz teče přes Data Plane přímo mezi porty switche, nikoliv přes kontrolér. Během krátkého výpadku kontroléru existující toky běží dál (headless/resilient mode)."
          }
        ]
      }
    ],

    // =========================================================================
    // SLOVNÍČEK POJMŮ – ČÁST 2 (N–Z, 45 pojmů)
    // =========================================================================
    glossary: [
      {
        term: "NAT / PAT (Masquerade)",
        category: "Routování & NAT",
        shortDef: "Překlad privátních IPv4 adres vnitřní sítě na veřejnou adresu brány (s využitím čísel portů).",
        detail: "NAT (Network Address Translation) přepisuje IP adresy v hlavičkách paketů na hraničním routeru. Varianta PAT (v MikroTiku akce masquerade / src-nat) umožňuje stovkám zařízení z privátní sítě RFC 1918 sdílet jedinou veřejnou IPv4 adresu rozlišením zdrojových TCP/UDP portů v NAT tabulce.",
        relatedTopicId: "nat-pat"
      },
      {
        term: "Native VLAN",
        category: "Ethernet & VLAN",
        shortDef: "Výchozí VLAN na Trunk portu (standardně VLAN 1), jejíž rámce se přenášejí bez 802.1Q značky.",
        detail: "Pokud po Trunk portu přijde neoznačený rámec, switch jej zařadí do Native VLAN. Z bezpečnostních důvodů (ochrana proti VLAN Hoppingu) se doporučuje přenastavit Native VLAN na nepoužívané číslo a nepoužívat ji pro uživatelský provoz.",
        relatedTopicId: "vlan"
      },
      {
        term: "NB-IoT / LoRaWAN",
        category: "Wi-Fi & IoT",
        shortDef: "Úsporné LPWAN sítě určené pro bezdrátový přenos malých zpráv z bateriových čidel na kilometry daleko.",
        detail: "LoRaWAN pracuje v EU v bezlicenčním pásmu 868 MHz (dosah 5–15 km, limit vysílání Duty Cycle 1 %) přes vlastní nebo komunitní brány. NB-IoT běží v licencovaných pásmech mobilních operátorů (vyžaduje SIM), nabízí výborný průnik do sklepů a šachet a hodí se například pro chytré vodoměry.",
        relatedTopicId: "bluetooth-iot"
      },
      {
        term: "NETCONF / RESTCONF",
        category: "Firewall & SDN",
        shortDef: "Moderní standardizované protokoly (Southbound/Management API) pro programatickou konfiguraci sítí nad modely YANG.",
        detail: "NETCONF přenáší strukturovaná konfigurační data ve formátu XML bezpečně přes SSH (port 830) s podporou transakcí a rollbacku. RESTCONF nabízí lehčí rozhraní přes HTTPS s formátem JSON nebo XML, vhodné pro přímé volání z automatizačních skriptů a SDN kontrolérů.",
        relatedTopicId: "sdn"
      },
      {
        term: "NGFW (Next-Generation Firewall)",
        category: "Firewall & SDN",
        shortDef: "Firewall nové generace spojující stavovou filtraci s L7 inspekcí DPI, rozpoznáním aplikací (App-ID), IPS/IDS a TLS kontrolou.",
        detail: "Na rozdíl od klasického stavového firewallu nehodnotí jen IP adresy a porty, ale rozumí obsahu na aplikační vrstvě, kontroluje šifrovaný TLS provoz, blokuje škodlivé URL a umožňuje vázat bezpečnostní politiky na identitu konkrétních uživatelů.",
        relatedTopicId: "firewall"
      },
      {
        term: "OpenFlow",
        category: "Firewall & SDN",
        shortDef: "Průkopnický Southbound protokol SDN umožňující centrálnímu kontroléru přímo zapisovat Match–Action pravidla do flow tabulek switchů.",
        detail: "OpenFlow odděluje datovou rovinu switche od řídicí roviny kontroléru. Kontrolér programuje záznamy skládající se z podmínky (Match – port, MAC, IP, VLAN, TCP port), akce (Action – přepošli, označ VLAN, zahoď) a počítadel statistik.",
        relatedTopicId: "sdn"
      },
      {
        term: "OSPF",
        category: "Routování & NAT",
        shortDef: "Moderní dynamický Link-State směrovací protokol pro podnikové a kampusové sítě (AD = 110).",
        detail: "Open Shortest Path First udržuje u všech routerů v oblasti (např. Area 0) kompletní mapu topologie sítě a pomocí Dijkstrova algoritmu SPF počítá nejvýhodnější trasu podle metriky Cost odvozené od šířky pásma linek.",
        relatedTopicId: "routing"
      },
      {
        term: "Paket",
        category: "Modely & Transport",
        shortDef: "Datová jednotka (PDU) 3. síťové vrstvy modelu ISO/OSI nesoucí zdrojovou a cílovou IP adresu.",
        detail: "Paket vzniká zapouzdřením transportního segmentu a přidáním IP hlavičky (IPv4 nebo IPv6). Na rozdíl od L2 rámce zůstávají jeho IP adresy při průchodu routery až k cíli zachovány (pokud nedojde k překladu NAT), mění se však čítač životnosti TTL.",
        relatedTopicId: "iso-osi"
      },
      {
        term: "Patch panel / Keystone",
        category: "Ethernet & VLAN",
        shortDef: "Pasivní prvky strukturované kabeláže ukončující pevné instalační kabely v rozvaděči a ve zdi.",
        detail: "Pevné instalační kabely (drát) vedené zdmi či žlaby se na straně uživatele zařezávají do modulů Keystone v zásuvkách a v 19\" datovém rozvaděči zezadu do Patch panelu. Zepředu se pak pružným patch cordem připojují do aktivního switche.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "PDU",
        category: "Modely & Transport",
        shortDef: "Protocol Data Unit – odborné označení datové jednotky na konkrétní vrstvě síťového modelu.",
        detail: "Každá vrstva má vlastní název PDU: na aplikační vrstvě pracujeme s daty, na transportní (L4) se segmentem (TCP) či datagramem (UDP), na síťové (L3) s paketem, na linkové (L2) s rámcem a na fyzické (L1) s bity.",
        relatedTopicId: "iso-osi"
      },
      {
        term: "Ping / Traceroute",
        category: "Routování & NAT",
        shortDef: "Základní CLI nástroje postavené na protokolu ICMP pro ověření dostupnosti cíle a trasy paketů.",
        detail: "Příkaz ping posílá zprávy ICMP Echo Request a měří odezvu (latenci RTT) a ztrátovost paketů. Příkaz traceroute (ve Windows tracert) postupně zvyšuje TTL od 1 a odhaluje IP adresy všech routerů (hopů) na cestě k cíli.",
        relatedTopicId: "routing"
      },
      {
        term: "PoE",
        category: "Ethernet & VLAN",
        shortDef: "Power over Ethernet – napájení koncových zařízení (AP, IP kamer, telefonů) přímo po datovém UTP kabelu.",
        detail: "Standardy IEEE 802.3af (PoE do 15,4 W), 802.3at (PoE+ do 30 W) a 802.3bt (PoE++ až 90 W) umožňují vést po kroucené dvojlince současně data i bezpečné stejnosměrné napětí (obvykle 48 V). Některé starší prvky používají tzv. Passive PoE (24 V).",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Port (transportní)",
        category: "Modely & Transport",
        shortDef: "16bitové číslo (0–65535) v hlavičce TCP/UDP rozlišující konkrétní aplikaci nebo službu na jednom hostu.",
        detail: "Známé porty (0–1023) jsou pevně přiřazené systémovým službám (např. 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS). Registrované porty (1024–49151) využívají uživatelské aplikace (např. 8291 WinBox) a dynamické/efemérní porty (49152–65535) volí operační systém pro odchozí klientská spojení.",
        relatedTopicId: "tcp-udp-ports"
      },
      {
        term: "Port Forwarding (DNAT)",
        category: "Routování & NAT",
        shortDef: "Přesměrování konkrétního portu z veřejné IP adresy brány na privátní IP adresu vnitřního serveru (DNAT).",
        detail: "Využívá se tehdy, když potřebujeme z Internetu zpřístupnit službu běžící za NATem (webový server, SSH, NVR kamery, herní server). Router změní cílovou IP a port příchozího paketu podle pravidla DNAT.",
        relatedTopicId: "nat-pat"
      },
      {
        term: "PVID",
        category: "Ethernet & VLAN",
        shortDef: "Port VLAN ID – výchozí číslo VLAN, které switch přiřadí neoznačenému rámci přicházejícímu na Access port (nebo jako Native VLAN na Trunk).",
        detail: "Při konfiguraci Access portu (např. pro počítač v oddělení VLAN 10) nestačí jen povolit výstup bez tagu – parametr PVID=10 určuje, jakou značku switch přidělí rámcům vstupujícím z počítače do vnitřku switche.",
        relatedTopicId: "vlan"
      },
      {
        term: "QoS",
        category: "Firewall & SDN",
        shortDef: "Quality of Service – mechanismy pro řízení šířky pásma, omezení latence a prioritizaci důležitého provozu.",
        detail: "QoS zaručuje, že časově citlivý provoz (hlas VoIP, videokonference, telemetrie) dostane přednost před hromadným stahováním souborů či aktualizacemi. Nastavuje se jak lokálně na routerech (fronty/shaping), tak centrálně přes politiky SDN kontrolérů.",
        relatedTopicId: "sdn"
      },
      {
        term: "Rámec (Frame)",
        category: "Ethernet & VLAN",
        shortDef: "Datová jednotka (PDU) 2. linkové vrstvy s hlavičkou obsahující MAC adresy a kontrolním součtem FCS.",
        detail: "Ethernetový rámec IEEE 802.3 obsahuje cílovou a zdrojovou 48bitovou MAC adresu, typ protokolu EtherType (případně 4B VLAN značku 802.1Q), payload o velikosti 46–1500 B a na konci 4B kontrolní součet FCS (CRC) pro odhalení chyb přenosu.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Redundance",
        category: "Základy a topologie",
        shortDef: "Zajištění záložních tras, prvků nebo napájení v síti tak, aby výpadek jedné části nezpůsobil nedostupnost služby.",
        detail: "V topologii sítí se redundance dosahuje např. částečným či plným propojením Mesh, dvěma uplinky mezi switchi (řízenými protokolem STP/RSTP nebo agregací LACP) či záložním připojením k druhému ISP. Zvyšuje dostupnost a odstraňuje kritická místa selhání (SPOF).",
        relatedTopicId: "switching"
      },
      {
        term: "Roaming (802.11k/v/r)",
        category: "Wi-Fi & IoT",
        shortDef: "Plynulé přepojování pohybujícího se Wi-Fi klienta mezi více přístupovými body (AP) se stejným SSID.",
        detail: "Pokud má budova více AP se stejným názvem sítě (SSID) a zabezpečením na nepřekrývajících se kanálech, přechází telefon při pohybu z jednoho AP na silnější druhé. Moderní standardy rychlého roamingu (802.11k/v/r) zkracují výpadek na desítky milisekund.",
        relatedTopicId: "wifi-soho"
      },
      {
        term: "Router",
        category: "Routování & NAT",
        shortDef: "Aktivní síťový prvek 3. síťové vrstvy propojující různé IP sítě a vybírající optimální cestu paketů.",
        detail: "Router odděluje broadcastové domény, nahlíží do své směrovací tabulky podle pravidla Longest Prefix Match, snižuje TTL a pro každý skok balí paket do nového L2 rámce. Doma či ve firmě navíc zajišťuje DHCP, NAT a stavový firewall.",
        relatedTopicId: "routing"
      },
      {
        term: "Router-on-a-Stick",
        category: "Ethernet & VLAN",
        shortDef: "Metoda směrování mezi více VLAN (Inter-VLAN routing) pomocí jediného Trunk kabelu a podrozhraní (subinterfaces) na routeru.",
        detail: "Fyzický port routeru připojený k Trunk portu switche se logicky rozdělí na virtuální podrozhraní (např. Gi0/0.10 s `encapsulation dot1Q 10`), z nichž každé slouží jako výchozí brána pro svou VLAN. Alternativou s vyšším výkonem je L3 switch se SVI.",
        relatedTopicId: "vlan"
      },
      {
        term: "SDN",
        category: "Firewall & SDN",
        shortDef: "Software-Defined Networking – oddělení centrální řídicí roviny (Control Plane) od datové roviny (Data Plane).",
        detail: "V architektuře SDN spravuje celou síť centrální softwarový kontrolér komunikující přes Northbound API (REST/gRPC) a Southbound API (OpenFlow, NETCONF/RESTCONF). V praxi se s centralizovanou správou setkáte u platforem UniFi, TP-Link Omada, MikroTik CAPsMAN či Cisco Catalyst Center.",
        relatedTopicId: "sdn"
      },
      {
        term: "SD-WAN",
        category: "Firewall & SDN",
        shortDef: "Software-Defined WAN – centrálně řízené propojení poboček přes více internetových i mobilních linek s automatickým výběrem trasy.",
        detail: "SD-WAN vytváří šifrovaný overlay přes běžné přípojky (optika, MPLS, LTE/5G), průběžně měří latenci, jitter a ztrátovost a na základě aplikačních politik dynamicky směruje citlivý provoz (např. VoIP) po nejlepší dostupné lince.",
        relatedTopicId: "sdn"
      },
      {
        term: "Segment",
        category: "Modely & Transport",
        shortDef: "Datová jednotka (PDU) 4. transportní vrstvy (u TCP se nazývá segment, u UDP datagram).",
        detail: "Segment nese aplikační data rozdělená na části do velikosti MSS a hlavičku protokolu TCP obsahující zdrojový a cílový port, sekvenční číslo (Sequence Number), potvrzovací číslo (ACK) a řídicí příznaky (SYN, ACK, FIN, RST).",
        relatedTopicId: "tcp-udp-ports"
      },
      {
        term: "Směrovací tabulka",
        category: "Routování & NAT",
        shortDef: "Paměťová tabulka v routeru (i OS) obsahující známé cílové sítě a výstupní rozhraní nebo další skok (Next-Hop).",
        detail: "Obsahuje přímo připojené sítě (Connected), ruční záznamy (Static) a trasy z dynamických protokolů (OSPF, BGP, RIP) včetně výchozí cesty 0.0.0.0/0. Zobrazuje se příkazy `route print` (Windows), `/ip route print` (MikroTik) nebo `show ip route` (Cisco IOS).",
        relatedTopicId: "routing"
      },
      {
        term: "SPOF (Single Point of Failure)",
        category: "Základy a topologie",
        shortDef: "Jediný bod selhání – součást sítě, jejíž výpadek vyřadí z provozu celou síť nebo klíčovou službu.",
        detail: "Typickým příkladem SPOF je centrální switch ve hvězdicové topologii, jediný hraniční router bez zálohy nebo jeden společný optický kabel do budovy. Návrh vysoce dostupných sítí usiluje o eliminaci SPOF pomocí redundance.",
        relatedTopicId: "topologies-lan-wan"
      },
      {
        term: "SSID",
        category: "Wi-Fi & IoT",
        shortDef: "Service Set Identifier – textový název bezdrátové Wi-Fi sítě vysílaný přístupovým bodem.",
        detail: "SSID může mít až 32 znaků a umožňuje uživatelům rozpoznat síť (např. Firma-Hoste). Jeden fyzický Access Point nebo Wi-Fi router dokáže vysílat více nezávislých SSID současně (Multi-SSID), přičemž každé může být přiřazeno do jiné VLAN.",
        relatedTopicId: "wifi-soho"
      },
      {
        term: "Stateful firewall (stavový)",
        category: "Firewall & SDN",
        shortDef: "Firewall sledující kontext spojení v paměťové tabulce (NEW, ESTABLISHED, RELATED, INVALID) a automaticky propouštějící odpovědi.",
        detail: "Stavový firewall si pamatuje každé oprávněně navázané odchozí spojení. Příchozí odpověď serveru rozpozná jako ESTABLISHED a propustí ji, zatímco nevyžádané pakety z Internetu nebo pakety mimo platný stav (INVALID) okamžitě zahodí.",
        relatedTopicId: "firewall"
      },
      {
        term: "Stateless firewall (bezstavový)",
        category: "Firewall & SDN",
        shortDef: "Bezstavový paketový filtr (ACL), který hodnotí každý paket izolovaně jen podle L3/L4 hlaviček bez paměti předchozích paketů.",
        detail: "Vyhodnocuje 5-tici hodnot (zdrojová/cílová IP, protokol, zdrojový/cílový port) extrémní hardwarovou rychlostí, ale vyžaduje explicitní pravidla pro oba směry komunikace a neochrání spolehlivě před podvrženými pakety u bezspojového UDP.",
        relatedTopicId: "firewall"
      },
      {
        term: "STP / RSTP",
        category: "Ethernet & VLAN",
        shortDef: "Spanning Tree Protocol (IEEE 802.1D / 802.1w) – automaticky brání vzniku L2 smyček při redundantním propojení switchů.",
        detail: "Pokud jsou switche propojeny do kruhu kvůli záložní cestě, broadcasty by v síti obíhaly donekonečna (Broadcast Storm). STP zvolí kořenový switch (Root Bridge) a nadbytečnou cestu logicky zablokuje; při výpadku hlavní linky ji RSTP během sekundy znovu aktivuje.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "Subnetting",
        category: "IP, Podsítě & Služby",
        shortDef: "Rozdělení většího IP adresního bloku na menší logické podsítě pomocí prodloužení masky (CIDR).",
        detail: "Subnetting omezuje rozsah broadcastové domény, zlepšuje bezpečnostní izolaci oddělení a umožňuje efektivně hospodařit s IPv4 prostorem. Při návrhu proměnlivě velkých podsítí se rozšiřuje na techniku VLSM.",
        relatedTopicId: "subnetting-vlsm"
      },
      {
        term: "SVI (Switch Virtual Interface)",
        category: "Ethernet & VLAN",
        shortDef: "Virtuální L3 rozhraní na řízeném L3 switchi přiřazené konkrétní VLAN, které slouží jako její výchozí brána.",
        detail: "Místo posílání provozu mezi VLAN tam a zpět po jednom kabelu na externí router (Router-on-a-Stick) umožňuje SVI směrovat mezi VLAN přímo v hardwaru L3 switche plnou linkovou rychlostí.",
        relatedTopicId: "vlan"
      },
      {
        term: "Switch",
        category: "Ethernet & VLAN",
        shortDef: "Aktivní síťový prvek 2. linkové vrstvy přepínající rámce mezi porty podle CAM tabulky MAC adres.",
        detail: "Switch se učí zdrojové MAC adresy příchozích rámců a přeposílá data v režimu Full-Duplex přímo na cílový port (čímž eliminuje kolize mezi porty). Řízené (managed) switche navíc podporují VLAN 802.1Q, STP proti smyčkám a SNMP monitoring.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "TCP",
        category: "Modely & Transport",
        shortDef: "Transmission Control Protocol – spolehlivý spojovaný transportní protokol s potvrzováním doručení.",
        detail: "Před přenosem dat navazuje spojení pomocí 3-Way Handshaku (SYN, SYN-ACK, ACK), kontroluje pořadí paketů, znovu posílá ztracené segmenty a řídí rychlost toku. Využívají ho weby (HTTP/HTTPS), SSH, e-mail nebo přenos souborů.",
        relatedTopicId: "tcp-udp-ports"
      },
      {
        term: "Topologie",
        category: "Základy a topologie",
        shortDef: "Fyzické nebo logické uspořádání prvků a spojů v počítačové síti (hvězda, strom, kruh, sběrnice, mesh).",
        detail: "Dnešní drátové LAN využívají fyzickou hvězdicovou či hierarchickou stromovou topologii kolem switchů. Bezdrátové IoT sítě (Zigbee, Thread) nasazují samoopravnou síť Mesh, kde si uzly navzájem předávají zprávy.",
        relatedTopicId: "topologies-lan-wan"
      },
      {
        term: "Trunk",
        category: "Ethernet & VLAN",
        shortDef: "Port switche propojující switche mezi sebou nebo s routerem, který přenáší provoz více VLAN současně se značkami 802.1Q.",
        detail: "Trunk port vkládá do odchozích rámců 4bajtovou hlavičku IEEE 802.1Q s číslem VLAN ID (tagged), díky čemuž po jediném optickém či metalickém kabelu procházejí oddělené sítě (např. zaměstnanci, hosté, správa i kamery).",
        relatedTopicId: "vlan"
      },
      {
        term: "TTL",
        category: "Routování & NAT",
        shortDef: "Time To Live – čítač životnosti paketu v IP hlavičce (nebo doba uložení záznamu v DNS cache).",
        detail: "V IP paketu udává maximální počet skoků přes routery (každý router jej sníží o 1; při dosažení 0 paket zahodí, čímž brání nekonečnému bloudění při smyčce). V DNS určuje počet sekund, po které si resolver smí výsledek pamatovat v mezipaměti.",
        relatedTopicId: "routing"
      },
      {
        term: "UDP",
        category: "Modely & Transport",
        shortDef: "User Datagram Protocol – rychlý nespojovaný transportní protokol bez potvrzování a garance doručení.",
        detail: "UDP má minimální 8bajtovou hlavičku a nečeká na handshake ani opakované poslání ztracených datagramů. Díky nízké režii a zpoždění je ideální pro DNS dotazy, DHCP, streamování videa, VoIP hovory a akční online hry.",
        relatedTopicId: "tcp-udp-ports"
      },
      {
        term: "UTP / STP / Optika",
        category: "Ethernet & VLAN",
        shortDef: "Hlavní kabelová přenosová média: nestíněná a stíněná kroucená dvojlinka a optická vlákna.",
        detail: "Kroucená dvojlinka (UTP bez stínění, STP/FTP se stíněním proti elektromagnetickému rušení) se hodí do 100 m (Cat5e/Cat6a). Optické vlákno vede světlo (Multimode stovky metrů uvnitř budov, Singlemode kilometry mezi lokalitami) bez ztráty vlivem rušení.",
        relatedTopicId: "ethernet-switch"
      },
      {
        term: "VLAN",
        category: "Ethernet & VLAN",
        shortDef: "Virtual LAN (IEEE 802.1Q) – logické rozdělení jednoho fyzického switche do více oddělených broadcastových domén.",
        detail: "Díky VLAN lze na téže kabelové infrastruktuře bezpečně oddělit provoz oddělení, hostů, kamer i serverů. Komunikace mezi různými VLAN je možná pouze přes router nebo L3 switch pod kontrolou firewallu.",
        relatedTopicId: "vlan"
      },
      {
        term: "VLAN Hopping",
        category: "Ethernet & VLAN",
        shortDef: "Bezpečnostní útok (Switch Spoofing nebo Double Tagging), při němž se útočník pokouší přeskočit z jedné VLAN do jiné.",
        detail: "Při Switch Spoofingu se útočník vydává za druhý switch a vyjedná si Trunk přes DTP; při Double Taggingu vloží do rámce dvě značky 802.1Q a zneužije Native VLAN na Trunku. Obrana spočívá ve vypnutí DTP, nastavení všech uživatelských portů natvrdo jako Access a změně Native VLAN.",
        relatedTopicId: "vlan"
      },
      {
        term: "VLSM",
        category: "IP, Podsítě & Služby",
        shortDef: "Variable Length Subnet Mask – dělení IP adresního bloku na podsítě různých velikostí přesně podle počtu hostů.",
        detail: "Na rozdíl od pevné masky umožňuje VLSM přidělit pobočce se 100 počítači masku /25, menší kanceláři masku /27 a propoji mezi dvěma routery úspornou masku /30 (pouze 2 použitelné adresy), čímž šetří IPv4 adresy.",
        relatedTopicId: "subnetting-vlsm"
      },
      {
        term: "Voice VLAN",
        category: "Ethernet & VLAN",
        shortDef: "Vyhrazená VLAN pro VoIP IP telefony na sdíleném portu s PC, automaticky předávaná přes LLDP-MED/CDP s QoS prioritou.",
        detail: "IP telefon připojený kabelem ke switchi posílá hlasové pakety s 802.1Q značkou Voice VLAN a vysokou prioritou PCP (802.1p), zatímco počítač zapojený do integrovaného portu v telefonu komunikuje neoznačeně (untagged) v datové VLAN.",
        relatedTopicId: "vlan"
      },
      {
        term: "WISP",
        category: "Wi-Fi & IoT",
        shortDef: "Wireless Internet Service Provider – poskytovatel internetu přes bezdrátové spoje a stejnojmenný režim SOHO routeru.",
        detail: "Jako provozní mód na SOHO routeru (např. TP-Link) znamená WISP to, že zařízení přijímá internet bezdrátově přes své Wi-Fi rádio jako WAN rozhraní a za sebou přes LAN porty i vlastní Wi-Fi vytváří oddělenou NATovanou síť.",
        relatedTopicId: "wifi-soho"
      },
      {
        term: "WPA2 / WPA3",
        category: "Wi-Fi & IoT",
        shortDef: "Bezpečnostní standardy pro šifrování a ověřování uživatelů v bezdrátových sítích Wi-Fi.",
        detail: "WPA2-Personal využívá silné blokové šifrování AES/CCMP a heslo (PSK). Moderní WPA3-Personal nahrazuje původní výměnu klíčů protokolem SAE (Simultaneous Authentication of Equals), který brání offline slovníkovým útokům na heslo; ve firmách se používá varianta Enterprise s 802.1X/RADIUS.",
        relatedTopicId: "wifi-soho"
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
