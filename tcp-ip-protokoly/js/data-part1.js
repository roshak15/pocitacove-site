/**
 * OP4 • Protokoly TCP/IP
 * Část 1: Témata 01–08 (Architektura TCP/IP, TCP/UDP, RIP/OSPF, BGP, DNS, DHCP, NTP, HTTP)
 *         a Slovníček pojmů (část 1: A–M, 53 hesel)
 */
(function (global) {
  'use strict';

  global.__OP4_DATA_PART1__ = {
    topics: [
      // =========================================================================
      // TÉMA 1: Architektura TCP/IP, zapouzdření PDU, ARP a ICMP diagnostika
      // =========================================================================
      {
        id: "tcpip-icmp-arp",
        number: 1,
        moduleId: "tcpip-transport",
        mandatory: true,
        title: "Architektura TCP/IP, zapouzdření PDU, ARP a ICMP",
        shortTitle: "TCP/IP, ARP a ICMP",
        subtitle: "Čtyřvrstvý model TCP/IP oproti ISO/OSI, zapouzdření datových jednotek PDU, překlad IP na MAC (ARP) a diagnostika sítě (ping, traceroute).",
        cardSummary: "Model TCP/IP, zapouzdření PDU od dat po bity, ARP překlad IP→MAC a ICMP ping / traceroute.",
        difficulty: "Základy",
        accentColor: "#38bdf8",
        tags: ["TCP/IP", "ISO/OSI", "Zapouzdření (PDU)", "ARP", "ICMP", "ping / traceroute", "TTL"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/tcpip-icmp-arp.mp4",
          poster: "media/posters/tcpip-icmp-arp.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Model TCP/IP, PDU a ARP (0:00)", time: 0 },
            { label: "2. ICMP diagnostika ping a traceroute (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Model TCP/IP a ARP – „Model TCP/IP postupně balí data do rámců a protokol ARP dohledá MAC adresu v místní síti.“\n0:07–0:13: ICMP diagnostika – „Protokol ICMP pak příkazem ping ověří spojení a traceroute odhalí každý směrovač na trase.“"
        },
        animationType: "tcpip-icmp-arp",
        labType: "encapsulation-icmp-sim",
        learningObjectives: [
          "Přiřadíš všechny čtyři vrstvy modelu TCP/IP k sedmi vrstvám ISO/OSI a správně pojmenuješ jejich datové jednotky (PDU).",
          "Vysvětlíš, jak ARP překládá cílovou IP adresu (nebo IP výchozí brány) na fyzickou MAC adresu v lokální síti LAN.",
          "Diagnostikuješ síťovou dostupnost a směrovací smyčky či výpadky pomocí ICMP zpráv Echo Request/Reply, Time Exceeded a Destination Unreachable."
        ],
        takeaways: [
          "Praktický model TCP/IP spojuje vrstvy komunikace do 4 vrstev (Aplikační, Transportní, Internetová/Síťová a Vrstva síťového rozhraní), zatímco teoretický ISO/OSI má vrstev 7.",
          "Při odesílání dochází k zapouzdření (Encapsulation) s přesným pořadím PDU: Data (aplikační) → Segment/Datagram (TCP/UDP) → Paket (IP) → Rámec + FCS (Ethernet) → Bity.",
          "Protokol ARP pracuje na pomezí L2/L3: pomocí broadcastového dotazu zjistí MAC adresu cílového zařízení ve stejné podsíti nebo výchozí brány (Default Gateway).",
          "ICMP (IP protokol 1) je servisní protokol síťové vrstvy bez čísel portů; pohání příkaz ping (Echo Request/Reply) i traceroute (využívající vypršení TTL a zprávu Time Exceeded)."
        ],
        principle: {
          problem: "Jak se textový požadavek z prohlížeče změní v elektrické či optické pulzy v kabelu, jak stanice zjistí fyzickou adresu souseda z jeho IP a jak zjistíme, kde se po cestě paket ztratil?",
          explanation: [
            "Internet a podnikové sítě stojí na rodině protokolů TCP/IP (někdy označované jako DoD model), která organizuje komunikaci do 4 logických vrstev. Nejvyšší Aplikační vrstva sdružuje obsah horních tří vrstev modelu ISO/OSI (Aplikační, Prezentační, Relační – např. HTTP, DNS, SSH). Transportní vrstva (L4 v OSI) zajišťuje komunikaci mezi procesy pomocí TCP a UDP. Internetová vrstva (L3 v OSI) řeší logické adresování (IPv4/IPv6), směrování a diagnostiku (ICMP). Spodní Vrstva síťového rozhraní spojuje Linkovou a Fyzickou vrstvu OSI (Ethernet, Wi-Fi, MAC adresy a přenos signálu).",
            "Aby mohl protokol z jedné vrstvy spolupracovat s jiným protokolem vrstvy nižší, používá se zapouzdření (Encapsulation). Aplikace vygeneruje Data (PDU aplikační vrstvy). Transportní vrstva přidá hlavičku s čísly portů a vytvoří Segment (u TCP) nebo Datagram (u UDP). Síťová vrstva obalí celek IP hlavičkou se zdrojovou a cílovou IP adresou a vzniká Paket. Linková vrstva nakonec přidá ethernetovou hlavičku se zdrojovou a cílovou MAC adresou i koncový kontrolní součet FCS, čímž vzniká Rámec (Frame), který fyzická vrstva převede na Bity. Na straně příjemce probíhá opačný proces – rozbalování (Decapsulation).",
            "Přestože aplikace komunikují pomocí IP adres, lokální ethernetový switch rozumí pouze 48bitovým MAC adresám. Pokud chce stanice poslat paket jinému počítači ve stejné podsíti (např. 192.168.1.20), podívá se nejprve do své ARP tabulky (ARP Cache). Když záznam chybí, vyšle všesměrový (broadcastový) dotaz ARP Request na L2 adresu FF:FF:FF:FF:FF:FF s otázkou „Kdo má IP 192.168.1.20?“. Dotázaný stroj odpoví jednosměrným (unicast) rámcem ARP Reply se svou MAC adresou. Pokud je cíl v jiné síti (např. na Internetu), pošle ARP dotaz na IP adresu své výchozí brány (Default Gateway).",
            "Síťová vrstva obsahuje také pomocný a diagnostický protokol ICMP (Internet Control Message Protocol, číslo IP protokolu 1). Příkaz ping odesílá zprávy ICMP Echo Request (Type 8) a měří dobu návratu odpovědi Echo Reply (Type 0). Příkaz traceroute (tracert) naopak chytře manipuluje s polem TTL (Time To Live) v IP hlavičce: první sonda má TTL=1, druhý pokus TTL=2 atd. Každý směrovač na trase sníží TTL o jedničku; jakmile hodnota klesne na 0, router paket zahodí a vrátí odesílateli zprávu ICMP Time Exceeded (Type 11), čímž prozradí svou IP adresu. Pokud je cílový hostitel či síť nedosažitelná nebo port zavřený, vrací uzel zprávu ICMP Destination Unreachable (Type 3)."
          ],
          steps: [
            {
              step: "1. Zapouzdření dat od aplikace po linku (PDU)",
              detail: "Aplikace předá Data → Transportní vrstva přidá porty (Segment/Datagram) → IP vrstva přidá IP adresy a TTL (Paket) → Linková vrstva přidá MAC adresy a FCS (Rámec) → Fyzická vrstva vyšle Bity."
            },
            {
              step: "2. Rozhodnutí LAN vs. Výchozí brána a ARP překlad",
              detail: "Podle masky sítě stanice ověří, zda je cíl lokální. Pro lokální cíl nebo pro bránu vyšle broadcast ARP Request (FF:FF:FF:FF:FF:FF) a uloží vrácenou MAC do ARP Cache."
            },
            {
              step: "3. Směrování paketů a odpočítávání TTL",
              detail: "Na každém routeru se rozbalí L2 rámec, ověří se cílová IP a sníží se TTL o 1 (prevence nekonečných smyček). Router zabalí paket do nového L2 rámce pro další skok."
            },
            {
              step: "4. Diagnostika pomocí ICMP (ping a traceroute)",
              detail: "Ping ověřuje obousměrnou dostupnost (Echo Request Type 8 → Echo Reply Type 0). Traceroute posílá sondy s TTL=1, 2, 3… a ze zpětných zpráv Time Exceeded (Type 11) skládá mapu cesty."
            }
          ],
          analogy: "Zapouzdření PDU je jako poslání firemního dopisu: samotný text (Data) vložíte do vnitřní obálky se jménem oddělení (Segment s portem), tu dáte do větší obálky s poštovní adresou příjemce (IP Paket) a kurýr na ní cestou mění lokální přepravní štítky mezi depy (MAC Rámec). ARP funguje jako vyhlášení rozhlasem v kanceláři: „Kdo sedí u stolu 192.168.1.20, ať mi řekne číslo své židle!“",
          comparisonTable: {
            headers: ["Vrstva TCP/IP", "Vrstvy ISO/OSI", "PDU (Datová jednotka)", "Typické protokoly a adresy"],
            rows: [
              ["4. Aplikační", "7. Aplikační, 6. Prezentační, 5. Relační", "Data (Zpráva)", "HTTP, HTTPS, DNS, DHCP, SMTP, SSH"],
              ["3. Transportní", "4. Transportní", "Segment (TCP) / Datagram (UDP)", "TCP, UDP (čísla portů 0–65535)"],
              ["2. Internetová (Síťová)", "3. Síťová", "Paket (Packet)", "IPv4, IPv6, ICMP (IP adresy, TTL)"],
              ["1. Síťového rozhraní", "2. Linková, 1. Fyzická", "Rámec (Frame) / Bity", "Ethernet, Wi-Fi, ARP (MAC adresy, signál)"]
            ]
          },
          watchOut: "Pozor na častý mýtus: ICMP nepoužívá porty TCP ani UDP, leží přímo v IP hlavičce (protokol 1). Navíc zatímco Windows tracert vysílá ICMP Echo Request se zvyšujícím se TTL, Linuxový traceroute ve výchozím nastavení posílá UDP datagramy na porty od 33434 výše – od routerů na trase ale oba čekají na stejnou zprávu ICMP Time Exceeded, a od cíle pak buď Echo Reply, nebo ICMP Port Unreachable."
        },
        example: {
          scenarioTitle: "Ověření ARP tabulky, test dostupnosti ping a trasování TTL pomocí traceroute",
          scenarioText: "Správce sítě ověřuje z linuxové stanice, zda zná MAC adresu své výchozí brány 192.168.10.1, testuje dostupnost DNS serveru 1.1.1.1 a zjišťuje jednotlivé směrovače na cestě.",
          codeBlocks: [
            {
              label: "Linux – výpis ARP tabulky (ip neigh), ping a traceroute",
              lang: "bash",
              code: "# 1. Kontrola ARP cache (překlad IP -> MAC lokálních sousedů)\n$ ip neigh show\n192.168.10.1 dev eth0 lladdr 00:1a:2b:3c:4d:5e REACHABLE\n\n# 2. Test dostupnosti ICMP Echo Request/Reply (4 pakety, výchozí TTL=64)\n$ ping -c 4 1.1.1.1\n64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=11.4 ms\n\n# 3. Trasování cesty pomocí postupného zvyšování TTL (1, 2, 3...)\n$ traceroute -n 1.1.1.1\n 1  192.168.10.1   0.82 ms   (TTL=1 vypršelo -> ICMP Time Exceeded)\n 2  10.240.0.1     4.15 ms   (TTL=2 vypršelo -> ICMP Time Exceeded)\n 3  195.47.235.1   9.70 ms   (NIX.CZ uzel)\n 4  1.1.1.1       11.30 ms   (Cíl odpověděl)"
            },
            {
              label: "Zachycení ARP a ICMP provozu v nástroji tcpdump",
              lang: "bash",
              code: "# Sledování ARP dotazu na bránu a následného ICMP pingu\n$ sudo tcpdump -ni eth0 'arp or icmp' -c 4\n10:15:01.102 ARP, Request who-has 192.168.10.1 tell 192.168.10.55, length 28\n10:15:01.103 ARP, Reply 192.168.10.1 is-at 00:1a:2b:3c:4d:5e, length 28\n10:15:01.104 IP 192.168.10.55 > 1.1.1.1: ICMP echo request, id 412, seq 1, length 64\n10:15:01.115 IP 1.1.1.1 > 192.168.10.55: ICMP echo reply, id 412, seq 1, length 64"
            }
          ],
          practicalTip: "Když vám při příkazu ping vyskočí „Destination Host Unreachable“ přímo z vaší vlastní IP adresy nebo výchozí brány, znamená to nejčastěji, že na cílovou IP neuspěl ARP dotaz v lokální síti (stanice je vypnutá nebo má špatnou masku sítě)."
        },
        quiz: [
          {
            question: "Jaké je správné pořadí datových jednotek (PDU) při zapouzdření od aplikační vrstvy dolů k fyzickému médiu?",
            options: [
              "Data → Paket → Segment → Rámec → Bity",
              "Data → Segment → Paket → Rámec → Bity",
              "Rámec → Paket → Segment → Data → Bity",
              "Segment → Data → Rámec → Paket → Bity"
            ],
            correctIndex: 1,
            explanation: "Aplikace vytváří Data, transportní vrstva z nich udělá Segment (TCP) nebo Datagram (UDP), síťová vrstva Paket (IP), linková vrstva Rámec (Ethernet) a fyzická vrstva Bity."
          },
          {
            question: "Počítač 192.168.1.50/24 chce poslat data na webový server 1.1.1.1. Na jakou IP adresu se zeptá prostřednictvím protokolu ARP?",
            options: [
              "Na adresu 1.1.1.1 přes celou síť Internet",
              "Na MAC adresu kořenového DNS serveru",
              "Na IP adresu své výchozí brány (Default Gateway) v podsíti 192.168.1.0/24",
              "ARP se vůbec nepoužije, protože se jedná o HTTPS provoz"
            ],
            correctIndex: 2,
            explanation: "ARP funguje pouze uvnitř jedné lokální broadcastové domény. Pro cíl mimo místní podsíť se stanice pomocí ARP zeptá na MAC adresu svého routeru (výchozí brány)."
          },
          {
            question: "Jakou ICMP zprávu pošle směrovač zpět odesílateli, když sníží hodnotu TTL příchozího paketu na nulu?",
            options: [
              "ICMP Echo Reply (Type 0)",
              "ICMP Redirect (Type 5)",
              "ICMP Time Exceeded (Type 11)",
              "ICMP Source Quench (Type 4)"
            ],
            correctIndex: 2,
            explanation: "Po vypršení TTL (TTL = 0) musí router paket zahodit a vrátit zprávu ICMP Time Exceeded (Type 11), čehož využívá nástroj traceroute k zjištění trasy."
          },
          {
            question: "Na kterou cílovou L2 adresu se posílá počáteční dotaz ARP Request při zjišťování neznámé MAC adresy v Ethernetu?",
            options: [
              "FF:FF:FF:FF:FF:FF (L2 Broadcast)",
              "00:00:00:00:00:00 (Null MAC)",
              "01:00:5E:00:00:01 (Multicast)",
              "Přímo na cílovou IP adresu převedenou na hexadecimální číslo"
            ],
            correctIndex: 0,
            explanation: "Odesílatel cílovou MAC adresu ještě nezná, proto musí ARP Request poslat jako L2 broadcast na FF:FF:FF:FF:FF:FF všem stanicím v dané VLAN."
          }
        ]
      },

      // =========================================================================
      // TÉMA 2: Transportní vrstva – TCP 3-Way Handshake, UDP, porty a sokety
      // =========================================================================
      {
        id: "tcp-udp-handshake",
        number: 2,
        moduleId: "tcpip-transport",
        mandatory: true,
        title: "Transportní vrstva: TCP 3-Way Handshake, UDP, porty a sokety",
        shortTitle: "TCP, UDP, porty a sokety",
        subtitle: "Spolehlivé spojení TCP (SYN/SYN-ACK/ACK, SEQ/ACK, Sliding Window), rychlé bezestavové UDP, rozsahy portů a sokety IP:port.",
        cardSummary: "TCP 3-Way Handshake, retransmise a Sliding Window vs. rychlé UDP; rozsahy portů a soket IP:port.",
        difficulty: "Základy",
        accentColor: "#0ea5e9",
        tags: ["TCP", "UDP", "3-Way Handshake", "Sliding Window", "Porty (0–65535)", "Soket (IP:port)", "QUIC"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/tcp-udp-handshake.mp4",
          poster: "media/posters/tcp-udp-handshake.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. TCP 3-Way Handshake a Sliding Window (0:00)", time: 0 },
            { label: "2. UDP, porty a sokety IP:port (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Spolehlivý TCP – „Protokol TCP nejprve třikrát potvrdí spojení, hlídá pořadí paketů a ztracená data znovu odešle.“\n0:07–0:13: Rychlé UDP a porty – „Naopak rychlé UDP posílá datagramy okamžitě bez čekání a čísla portů určí cílovou službu.“"
        },
        animationType: "tcp-udp-handshake",
        labType: "tcp-udp-sim",
        learningObjectives: [
          "Popíšeš průběh navázání (SYN, SYN-ACK, ACK) i ukončení (FIN/RST) spojení v TCP a význam čísel SEQ, ACK a Window Size.",
          "Odlišíš případy použití TCP (spolehlivost, pořadí) od UDP (nízká režie a latence pro DNS, NTP, RTP a QUIC).",
          "Rozdělíš porty 0–65535 do tří IANA kategorií a vysvětlíš úlohu soketu (IP:port) při multiplexování komunikace."
        ],
        takeaways: [
          "Transportní vrstva používá 16bitová čísla portů (0–65535) k rozlišení aplikací: Well-Known (0–1023), Registered (1024–49151) a Ephemeral (49152–65535).",
          "Kombinace IP adresy a portu tvoří soket (např. 192.168.1.10:52418); jedno spojení jednoznačně určuje pětice {protokol, zdrojová IP, zdrojový port, cílová IP, cílový port}.",
          "TCP před přenosem dat provede 3-Way Handshake (SYN → SYN-ACK → ACK), zaručuje pořadí a doručení pomocí SEQ/ACK, retransmisí a posuvného okna (Sliding Window).",
          "UDP má jen 8bajtovou hlavičku bez handshaku a potvrzování – díky minimální režii a absenci zpoždění při ztrátě pohání DNS, NTP, VoIP (RTP) i HTTP/3 (QUIC)."
        ],
        principle: {
          problem: "IP vrstva dokáže paket pouze bez záruky doručit na konkrétní počítač. Jak ale operační systém pozná, kterému z desítek běžících programů data patří, a jak zaručí doručení celého souboru bez poškození a zpřeházení?",
          explanation: [
            "O směrování dat přímo k jednotlivým programům se stará transportní vrstva (L4) pomocí 16bitových čísel portů (0 až 65535). Správce sítě musí ovládat rozdělení portů podle IANA: Well-Known porty (0–1023) jsou vyhrazeny systémovým a základním službám (HTTP 80, HTTPS 443, SSH 22, DNS 53), Registered porty (1024–49151) registrují konkrétní aplikace a databáze (MySQL 3306, RDP 3389, PostgreSQL 5432) a Ephemeral / dynamické porty (49152–65535) si dočasně půjčuje klientský operační systém pro odchozí dotazy. Dvojice IP adresa a číslo portu tvoří soket (např. 93.184.216.34:443), díky němuž můžete mít v prohlížeči otevřeno dvacet karet na stejný server najednou.",
            "Protokol TCP (Transmission Control Protocol, IP protokol 6) je spojově orientovaný a spolehlivý. Každá komunikace začíná procesem 3-Way Handshake: klient pošle segment s příznakem SYN a náhodným počátečním sekvenčním číslem (např. SEQ=1000). Server odpoví segmentem SYN-ACK (vlastní SEQ=5000 a potvrzení ACK=1001, tedy „čekám další bajt 1001“). Klient pak spojení potvrdí závěrečným ACK (SEQ=1001, ACK=5001) a teprve poté tečou data. Korektní ukončení probíhá pomocí příznaků FIN a ACK v obou směrech, zatímco příznak RST (Reset) spojení okamžitě násilně přeruší.",
            "Během přenosu každému odeslanému bajtu odpovídá sekvenční číslo (SEQ) a příjemce průběžně potvrzuje doručení pomocí ACK. Pokud se segment v síti ztratí a vyprší časovač RTO (nebo dorazí trojnásobný duplicitní ACK), TCP provede retransmisi jen ztracené části. Aby rychlý server nezahltil pomalého klienta, vkládá příjemce do každého potvrzení pole Window Size (posuvné okno – Sliding Window), kterým dynamicky oznamuje, kolik bajtů je ještě schopen uložit do vyrovnávací paměti (Flow Control).",
            "Naproti tomu UDP (User Datagram Protocol, IP protokol 17) je bezestavový (connectionless) protokol s pevnou, pouze 8bajtovou hlavičkou (zdrojový port, cílový port, délka, kontrolní součet). Neposílá žádný handshake, neudržuje stav spojení, nečísluje bajty a ztracené datagramy znovu neposílá. Tato zdánlivá „nespolehlivost“ je v síti nenahraditelná tam, kde by čekání na opakované doručení škodilo nebo kde stačí jediná krátká otázka a odpověď: DNS dotazy, DHCP, synchronizace času NTP, živé streamování hlasu a videa (RTP) i moderní transport QUIC (základ HTTP/3), který si spolehlivost řídí modernějším způsobem sám nad UDP."
          ],
          steps: [
            {
              step: "1. Výběr soketů a 3-Way Handshake (TCP)",
              detail: "Klient si zvolí efemérní port (např. 54210) a na cílový soket serveru (např. 443) pošle SYN (SEQ=x) → server odpoví SYN-ACK (SEQ=y, ACK=x+1) → klient potvrdí ACK (ACK=y+1)."
            },
            {
              step: "2. Přenos dat, Sliding Window a retransmise",
              detail: "Data proudí po segmentech do velikosti MSS (typicky 1460 B). Příjemce potvrzuje souvisle doručené bajty pomocí ACK a hodnotou Window Size reguluje rychlost odesílatele."
            },
            {
              step: "3. Ukončení spojení (FIN vs. RST)",
              detail: "Po skončení přenosu si obě strany vymění příznaky FIN a ACK (každá zavírá svůj směr). Při chybě aplikace nebo zásahu firewallu se pošle okamžitý RST."
            },
            {
              step: "4. Bezestavová alternativa UDP",
              detail: "U UDP klient rovnou zabalí data do datagramu s 8B hlavičkou a odešle je bez čekání na handshake. Případné opakování dotazu při ztrátě řeší až sama aplikace (např. DNS nebo QUIC)."
            }
          ],
          analogy: "TCP je jako doporučený balík na dodejku s očíslovanými krabicemi: nejprve zavoláte příjemci, jestli je doma (3-Way Handshake), posíláte krabice 1–10 podle toho, kolik se mu jich vejde do předsíně (Sliding Window), a když se krabice č. 4 ztratí, pošlete ji znovu. UDP je jako pohlednice nebo živý telefonát z pódia: křičíte slova rovnou bez ověřování, a když jedno slovo v hluku zanikne, nemá smysl ho opakovat o pět sekund později.",
          comparisonTable: {
            headers: ["Vlastnost", "TCP (Transmission Control Protocol)", "UDP (User Datagram Protocol)"],
            rows: [
              ["Navázání spojení", "Ano – 3-Way Handshake (SYN / SYN-ACK / ACK)", "Ne – bezestavový (connectionless), odesílá ihned"],
              ["Velikost hlavičky", "20–60 bajtů (obsahuje SEQ, ACK, příznaky, Window)", "Pouhých 8 bajtů (Porty, Délka, Checksum)"],
              ["Spolehlivost a pořadí", "Garantuje doručení bez děr a v přesném pořadí", "Negarantuje – ztrátu ani přehození neřeší"],
              ["Řízení toku a zahlcení", "Ano – Sliding Window a algoritmy Congestion Control", "Ne – aplikace může síť zahltit, pokud si to nehlídá sama"],
              ["Typické protokoly", "HTTP/1.1, HTTP/2, HTTPS, SSH, SMTP, IMAP, FTP, SMB", "DNS, DHCP, NTP, SNMP, RTP (VoIP), HTTP/3 (QUIC)"]
            ]
          },
          watchOut: "Pozor na častou záměnu: UDP se v učebnicích někdy přezdívá „nespolehlivý“, což svádí k představě, že je horší. Pro živý hlas (VoIP), videohovory nebo online hry je ale TCP naprosto nevhodné – jediný ztracený paket by v TCP zastavil celý proud kvůli retransmisi a způsobil by zadrhnutí zvuku. Vždy také rozlišujte TCP port 53 a UDP port 53 – jde o dva na sobě nezávislé adresní prostory!"
        },
        example: {
          scenarioTitle: "Inspekce otevřených soketů na serveru a sledování TCP 3-Way Handshake",
          scenarioText: "Na linuxovém serveru vypíšeme naslouchající TCP i UDP sokety pomocí moderního příkazu ss a následně v tcpdumpu zachytíme průběh jednoho celého TCP spojení na port 80.",
          codeBlocks: [
            {
              label: "Linux – výpis aktivních TCP/UDP soketů příkazem ss",
              lang: "bash",
              code: "# -t (TCP), -u (UDP), -l (naslouchající), -n (čísla portů), -p (proces)\n$ sudo ss -tulnp\nNetid  State   Local Address:Port   Peer Address:Port  Process\nudp    UNCONN  0.0.0.0:68           0.0.0.0:*          users:((\"dhclient\",pid=612))\nudp    UNCONN  0.0.0.0:123          0.0.0.0:*          users:((\"chronyd\",pid=704))\ntcp    LISTEN  0.0.0.0:22           0.0.0.0:*          users:((\"sshd\",pid=815))\ntcp    LISTEN  *:443                *:*                users:((\"nginx\",pid=940))"
            },
            {
              label: "tcpdump – zachycení SYN, SYN-ACK, ACK, přenosu dat a FIN",
              lang: "bash",
              code: "$ sudo tcpdump -ni eth0 'tcp port 80' -S -c 7\n11:02:10.001 IP 10.0.1.5.51842 > 93.184.216.34.80: Flags [S], seq 1000, win 64240\n11:02:10.019 IP 93.184.216.34.80 > 10.0.1.5.51842: Flags [S.], seq 5000, ack 1001, win 65160\n11:02:10.019 IP 10.0.1.5.51842 > 93.184.216.34.80: Flags [.], ack 5001, win 502\n11:02:10.020 IP 10.0.1.5.51842 > 93.184.216.34.80: Flags [P.], seq 1001:1079, ack 5001\n11:02:10.039 IP 93.184.216.34.80 > 10.0.1.5.51842: Flags [F.], seq 5001, ack 1079"
            }
          ],
          practicalTip: "V nástroji tcpdump označuje příznak [S] samotný SYN, tečka [.] znamená ACK, takže [S.] je SYN-ACK, [P.] je PSH+ACK (okamžité předání dat aplikaci) a [F.] je FIN+ACK."
        },
        quiz: [
          {
            question: "Jaké přesné pořadí příznaků probíhá při navazování TCP spojení (3-Way Handshake)?",
            options: [
              "ACK → SYN → FIN",
              "SYN → SYN-ACK → ACK",
              "SYN → ACK → PSH",
              "DISCOVER → OFFER → REQUEST"
            ],
            correctIndex: 1,
            explanation: "Klient zahájí spojením SYN (se svým SEQ), server potvrdí a navrhne vlastní sekvenční číslo pomocí SYN-ACK a klient dokončí handshake zprávou ACK."
          },
          {
            question: "Do jakého IANA rozsahu patří porty 49152–65535, které operační systém automaticky přiděluje odchozím klientským relacím?",
            options: [
              "Well-Known Ports",
              "Registered Ports",
              "Ephemeral (Dynamické / Privátní) porty",
              "Rezervované multicastové porty"
            ],
            correctIndex: 2,
            explanation: "Porty 49152–65535 tvoří rozsah dynamických (efemérních) portů pro dočasná klientská spojení."
          },
          {
            question: "K čemu slouží v TCP hlavičce hodnota Window Size (posuvné okno / Sliding Window)?",
            options: [
              "Určuje maximální počet routerů (TTL), kterými segment projde",
              "Sděluje odesílateli, kolik bajtů může ještě poslat před dalším potvrzením (Flow Control)",
              "Nastavuje prioritu pro multimediální aplikace v prohlížeči",
              "Určuje velikost zašifrovaného hesla při přihlašování"
            ],
            correctIndex: 1,
            explanation: "Sliding Window řídí tok dat (Flow Control), aby rychlý odesílatel nepřeplnil přijímací vyrovnávací paměť pomalejšího příjemce."
          },
          {
            question: "Který z následujících protokolů běží primárně nad UDP a nikoli nad TCP?",
            options: [
              "SSH (Secure Shell)",
              "SMTP (odesílání e-mailů)",
              "HTTP/3 (QUIC)",
              "HTTPS s TLS 1.2"
            ],
            correctIndex: 2,
            explanation: "Protokol HTTP/3 využívá moderní transportní protokol QUIC postavený nad UDP (port 443), aby se vyhnul zdržení zvanému TCP Head-of-Line Blocking."
          }
        ]
      },

      // =========================================================================
      // TÉMA 3: Vnitřní směrovací protokoly IGP – RIPv2, OSPF a srovnání s EIGRP
      // =========================================================================
      {
        id: "routing-rip-ospf",
        number: 3,
        moduleId: "routing-protocols",
        mandatory: true,
        title: "Vnitřní směrovací protokoly IGP: RIPv2, OSPF a EIGRP",
        shortTitle: "IGP: RIPv2, OSPF & EIGRP",
        subtitle: "Dynamické směrování uvnitř organizace: Distance Vector (RIPv2, max 15 hopů) versus Link-State (OSPF, Area 0, LSDB, SPF) a EIGRP.",
        cardSummary: "IGP protokoly: RIPv2 (max 15 hopů, UDP 520) vs. OSPF (Area 0, LSDB, Dijkstra SPF, IP 89) a EIGRP.",
        difficulty: "Střední",
        accentColor: "#10b981",
        tags: ["IGP", "RIPv2", "OSPF", "Area 0", "Dijkstra SPF", "LSDB", "Distance Vector", "EIGRP"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/routing-rip-ospf.mp4",
          poster: "media/posters/routing-rip-ospf.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Distance Vector: RIPv2 (0:00)", time: 0 },
            { label: "2. Link-State: OSPF a Area 0 (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: RIPv2 (Distance Vector) – „Jednoduchý protokol RIP počítá pouze skoky mezi směrovači a zvládne nejvýše 15 přeskoků.“\n0:07–0:13: OSPF (Link-State) – „Modernější OSPF si sestaví mapu celé sítě a vybere nejrychlejší trasu podle kapacity linek.“"
        },
        animationType: "routing-rip-ospf",
        labType: "ospf-rip-sim",
        learningObjectives: [
          "Rozlišíš princip algoritmu Distance Vector (RIPv2) od Link-State (OSPF) včetně jejich metrik a rychlosti konvergence.",
          "Vysvětlíš funkci databáze LSDB, páteřní oblasti Area 0, Hello paketů a Dijkstrova SPF výpočtu u protokolu OSPF.",
          "Porovnáš RIPv2, OSPF a EIGRP podle transportního protokolu, multicastové adresy, metriky a administrativní vzdálenosti."
        ],
        takeaways: [
          "IGP (Interior Gateway Protocols) vyměňují trasy uvnitř jednoho autonomního systému (firmy či ISP); při shodném prefixu se router řídí nižší Administrativní vzdáleností (EIGRP 90 < OSPF 110 < RIP 120).",
          "RIPv2 je protokol Distance Vector používající UDP 520 a multicast 224.0.0.9; měří jen počet routerů (Hop Count max 15, 16 = nedosažitelné) a proti smyčkám používá Split Horizon.",
          "OSPF je otevřený Link-State protokol běžící přímo nad IP (protokol 89, multicast 224.0.0.5/.6); staví shodnou topologickou mapu LSDB a Dijkstrovým algoritmem SPF volí nejnižší cenu Cost dle šířky pásma.",
          "Velké OSPF sítě se dělí do oblastí kolem povinné páteřní Area 0; oproti RIPv2 a OSPF kombinuje EIGRP výhody obou světů pomocí bezsmyčkového algoritmu DUAL."
        ],
        principle: {
          problem: "Ruční zadávání statických tras je ve firmě s desítkami poboček neudržitelné a při výpadku optiky samo nepřesměruje provoz. Jak si mají routery uvnitř jedné organizace automaticky najít nejlepší a nezacyklenou cestu?",
          explanation: [
            "Pro automatickou výměnu směrovacích informací uvnitř jedné organizace (jednoho autonomního systému) slouží protokoly IGP (Interior Gateway Protocol). Pokud se o stejné síti dozví router více cestami, rozhoduje nejprve nejpřesnější maska (Longest Prefix Match) a při shodě délky prefixu Administrativní vzdálenost (AD – míra důvěryhodnosti zdroje: přímo připojená síť 0, statická trasa 1, interní EIGRP 90, OSPF 110, RIP 120). Vlastní volbu nejlepší trasy v rámci jednoho protokolu pak určuje jeho metrika.",
            "Nejstarším rozšířeným přístupem je Distance Vector v podobě protokolu RIPv2 (Routing Information Protocol v2). Router v RIPu nevidí celou mapu sítě – zná jen vzdálenost (počet skoků – Hop Count) a směr (sousedního routeru), kterou si routery posílají každých 30 sekund přes UDP port 520 na multicast adresu 224.0.0.9 (na rozdíl od zastaralého RIPv1 už v hlavičce nese masku podsítě a podporuje VLSM/CIDR). Maximální platná vzdálenost je 15 skoků; hodnota 16 znamená „nedosažitelné nekonečno“. Proti smyčkám a „počítání do nekonečna“ se používá Split Horizon (neposílat informaci o trase zpět rozhraním, odkud přišla) a Route Poisoning, ale konvergence při výpadku je stále pomalá.",
            "Moderním průmyslovým standardem pro podnikové a kampusové sítě je OSPF (Open Shortest Path First – v2 pro IPv4, v3 pro IPv6) založený na principu Link-State. OSPF nepoužívá UDP ani TCP, ale běží přímo v IP jako protokol číslo 89 a komunikuje na multicastových adresách 224.0.0.5 (všechny OSPF routery) a 224.0.0.6 (zvolený DR/BDR router na sdíleném Ethernetu). Routery nejprve navážou sousedství pomocí Hello paketů, poté si vymění stavové zprávy LSA pouze při změně a sestaví identickou databázi celé sítě zvanou LSDB. Nad ní každý router samostatně spustí Dijkstrův algoritmus SPF (Shortest Path First), čímž spočítá strom nejkratších cest s metrikou Cost odvozenou ze šířky pásma (výchozí 100 Mb/s / rychlost rozhraní). Rozsáhlé sítě dělí OSPF hierarchicky do oblastí, které musí být napojeny na páteřní oblast Area 0 (Backbone).",
            "Třetí variantou hojně nasazovanou v sítích Cisco je protokol EIGRP (Enhanced Interior Gateway Routing Protocol, dříve proprietární, později publikovaný jako RFC 7868). EIGRP je pokročilý Distance Vector (často označovaný jako hybridní), který komunikuje přímo přes IP protokol 88 na multicast 224.0.0.10. Neposílá celé tabulky periodicky jako RIP, ale po navázání sousedství zasílá pouze inkrementální změny. Jeho metrika kombinuje šířku pásma a zpoždění a díky algoritmu DUAL dokáže v paměti předem držet zaručeně bezsmyčkovou záložní cestu (Feasible Successor), takže při výpadku linky přepne v řádu milisekund."
          ],
          steps: [
            {
              step: "1. Vyhledání sousedů (Hello pakety)",
              detail: "V OSPF si routery na rozhraní vyměňují periodické Hello pakety (IP 89, 224.0.0.5); po shodě ID oblasti, timerů a masky navážou sousedství (stav Full)."
            },
            {
              step: "2. Výměna LSA a sjednocení LSDB",
              detail: "OSPF routery rozešlou popisy svých linek (LSA) do své oblasti, takže každý router v Area 0 má v paměti úplně stejnou mapu sítě (LSDB)."
            },
            {
              step: "3. Výpočet nejkratších tras (Dijkstrův SPF vs. RIP Hop Count)",
              detail: "OSPF spustí nad LSDB Dijkstrův algoritmus podle ceny Cost (rychlosti linky). Naproti tomu RIPv2 jen přičte +1 hop ke zprávě od souseda na UDP 520 (max 15)."
            },
            {
              step: "4. Zápis vítězných cest a hlídání změn",
              detail: "Nejlepší trasy s nejnižší metrikou se zapíší do hlavní směrovací tabulky (RIB). Při výpadku linky OSPF okamžitě rozešle aktualizaci LSA a bleskově přepočítá SPF."
            }
          ],
          analogy: "RIP je jako ptaní se kolemjdoucích na křižovatce („Do Brna je to rovně 3 křižovatky!“) – nikdo nezná celou mapu republiky, takže při uzavírce si sousedé mohou chvíli předávat zastaralou zprávu v kruhu. OSPF funguje tak, že každý řidič dostane stejnou aktuální automapu s dálnicemi i okreskami (LSDB) a v navigaci (Dijkstrův algoritmus) si sám vypočítá nejrychlejší trasu podle šířky silnice (Cost).",
          comparisonTable: {
            headers: ["Parametr", "RIPv2", "OSPF (v2 / v3)", "EIGRP"],
            rows: [
              ["Typ algoritmu", "Distance Vector (Bellman–Ford)", "Link-State (Dijkstra SPF)", "Pokročilý Distance Vector (DUAL)"],
              ["Transport / Adresa", "UDP 520 / Multicast 224.0.0.9", "IP protokol 89 / 224.0.0.5 a .6", "IP protokol 88 / Multicast 224.0.0.10"],
              ["Metrika", "Hop Count (1–15, 16 = nedosažitelné)", "Cost (Reference BW / Bandwidth)", "Složená (Bandwidth + Delay)"],
              ["Admin. vzdálenost (AD)", "120", "110", "90 (interní) / 170 (externí)"],
              ["Konvergence a škála", "Pomalá (30s periodika), jen malé sítě", "Rychlá, velké podnikové sítě (Area 0)", "Velmi rychlá (Feasible Successor)"]
            ]
          },
          watchOut: "U OSPF je klasickým chytákem výchozí referenční šířka pásma 100 Mb/s: vzorec 100 Mb/s děleno rychlostí portu dává pro 100 Mb/s, 1 Gb/s i 10 Gb/s linku stejný výsledek Cost = 1 (zaokrouhluje se nahoru na min. 1), takže OSPF pak nerozliší gigabitovou optiku od starého Fast Ethernetu! V praxi vždy nastavte auto-cost reference-bandwidth (např. na 100000 pro 100 Gb/s). A u RIPv2 nezapomeňte, že 1 hop po pomalém 2 Mb/s spoji pro něj porazí 2 hopy po 10 Gb/s!"
        },
        example: {
          scenarioTitle: "Konfigurace OSPF v Area 0 vs. RIPv2 na podnikovém směrovači",
          scenarioText: "Porovnání základní konfigurace OSPF (včetně úpravy referenční šířky pásma pro gigabitové porty) a RIPv2 na směrovači v syntaxi blízké Cisco IOS / FRRouting.",
          codeBlocks: [
            {
              label: "Konfigurace OSPFv2 s páteřní Area 0 a korekcí Cost",
              lang: "text",
              code: "router ospf 1\n router-id 10.255.0.1\n auto-cost reference-bandwidth 10000\n passive-interface GigabitEthernet0/1\n network 10.0.0.0 0.0.0.3 area 0\n network 192.168.10.0 0.0.0.255 area 0\n!\n# Ověření sousedů a směrovací tabulky:\nR1# show ip ospf neighbor\nR1# show ip route ospf\nO   192.168.20.0/24 [110/20] via 10.0.0.2, 00:14:02, GigabitEthernet0/0"
            },
            {
              label: "Konfigurace RIPv2 (s podporou VLSM bez automatické sumarizace)",
              lang: "text",
              code: "router rip\n version 2\n no auto-summary\n network 10.0.0.0\n network 192.168.10.0\n passive-interface GigabitEthernet0/1\n!\n# Výpis naučené trasy v RIPv2 (AD 120, metrika 1 hop):\nR1# show ip route rip\nR   192.168.20.0/24 [120/1] via 10.0.0.2, 00:00:12, GigabitEthernet0/0"
            }
          ],
          practicalTip: "Na koncových rozhraních vedoucích k uživatelům (LAN) zapínejte `passive-interface`: router pak danou podsíť stále oznamuje sousedům v OSPF/RIP, ale zbytečně neposílá řídicí Hello/RIP pakety uživatelům a brání podvržení falešného sousedního routeru."
        },
        quiz: [
          {
            question: "Co znamená metrika Hop Count = 16 v protokolu RIPv2?",
            options: [
              "Cílová síť je dosažitelná přes záložní trasu s nižší prioritou",
              "Cílová síť je považována za nedosažitelnou (nekonečno)",
              "Maximální povolený počet VLAN na jednom směrovači",
              "Automatické přepnutí RIPv2 do režimu OSPF Area 0"
            ],
            correctIndex: 1,
            explanation: "RIP povoluje nejvýše 15 skoků (hopů); hodnota 16 slouží jako označení nedosažitelné sítě k potlačení směrovacích smyček."
          },
          {
            question: "Jaký transportní protokol a jakou multicastovou adresu využívá OSPF pro běžnou komunikaci mezi všemi OSPF routery?",
            options: [
              "UDP port 520 a multicast 224.0.0.9",
              "TCP port 179 a unicast spojení",
              "Přímo IP protokol číslo 89 a multicast 224.0.0.5",
              "IP protokol číslo 88 a multicast 224.0.0.10"
            ],
            correctIndex: 2,
            explanation: "OSPF běží přímo nad IP protokolem č. 89 a pro komunikaci se všemi OSPF sousedy používá multicast 224.0.0.5 (224.0.0.6 patří DR/BDR)."
          },
          {
            question: "Kterou oblast (Area) musí obsahovat každá vícepásmová síť OSPF, aby ostatní oblasti dokázaly vzájemně směrovat provoz?",
            options: [
              "Area 1 (Stub Area)",
              "Area 0 (Backbone Area)",
              "Area 255 (Transit Area)",
              "Area 64512 (Private Area)"
            ],
            correctIndex: 1,
            explanation: "Area 0 (páteřní oblast) je centrální uzel hierarchie OSPF, ke kterému musí být připojeny všechny ostatní oblasti."
          },
          {
            question: "Proč je při nasazení OSPF v síti s 1 Gb/s a 10 Gb/s linkami nutné upravit parametr reference-bandwidth?",
            options: [
              "Protože výchozí hodnota 100 Mb/s přiřadí 100 Mb/s, 1 Gb/s i 10 Gb/s lince stejný Cost = 1",
              "Protože OSPF bez této úpravy nepodporuje podsítě menší než /24",
              "Aby se zapnul mechanismus Split Horizon proti smyčkám",
              "Jinak OSPF odmítne přijmout IP adresy začínající číslem 10"
            ],
            correctIndex: 0,
            explanation: "Vzorec Cost = Reference BW / Interface BW se zaokrouhluje minimálně na 1, takže při výchozích 100 Mb/s nevidí OSPF rozdíl mezi 100M, 1G a 10G připojením."
          }
        ]
      },

      // =========================================================================
      // TÉMA 4: Hraniční směrovací protokol BGP-4 (AS, eBGP/iBGP, AS_PATH)
      // =========================================================================
      {
        id: "routing-bgp",
        number: 4,
        moduleId: "routing-protocols",
        mandatory: true,
        title: "Hraniční směrovací protokol BGP-4 (AS, Path Vector a peering)",
        shortTitle: "BGP-4 a autonomní systémy",
        subtitle: "Jak si poskytovatelé Internetu vyměňují trasy: autonomní systémy (ASN), TCP 179, eBGP vs. iBGP, AS_PATH, LOCAL_PREF a peering.",
        cardSummary: "EGP protokol Internetu BGP-4 na TCP 179: autonomní systémy ASN, eBGP/iBGP, AS_PATH a peering.",
        difficulty: "Pokročilé",
        accentColor: "#059669",
        tags: ["BGP-4", "ASN", "eBGP / iBGP", "AS_PATH", "LOCAL_PREF", "MED", "Peering / Tranzit", "TCP 179"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/routing-bgp.mp4",
          poster: "media/posters/routing-bgp.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Autonomní systémy a AS_PATH (0:00)", time: 0 },
            { label: "2. Výběr trasy: LOCAL_PREF, MED a peering (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: BGP a AS_PATH – „Hraniční protokol BGP propojuje sítě velkých operátorů a datových center po celém internetu.“\n0:07–0:13: Politiky a peering – „Sleduje cestu přes autonomní systémy, brání vzniku smyček a řídí pravidla pro peering i tranzit.“"
        },
        animationType: "routing-bgp",
        labType: "bgp-aspath-sim",
        learningObjectives: [
          "Vysvětlíš úlohu BGP-4 jako jediného EGP protokolu Internetu a rozdíl mezi sousedstvím eBGP a iBGP.",
          "Pochopíš princip Path Vectoru a jak atribut AS_PATH zabraňuje vzniku směrovacích smyček mezi operátory.",
          "Použiješ hlavní BGP atributy (LOCAL_PREF, délka AS_PATH, MED) a rozlišíš smluvní vztahy peering a tranzit."
        ],
        takeaways: [
          "BGP-4 je jediný hraniční protokol (EGP) spojující desetitisíce sítí Internetu; na rozdíl od IGP nepoužívá multicast, ale spolehlivé TCP relace na portu 179.",
          "Autonomní systém (AS) je síť pod jednou správou identifikovaná číslem ASN (např. AS6881; privátní rozsah 64512–65534); eBGP běží mezi různými AS, iBGP uvnitř téhož AS.",
          "BGP pracuje metodou Path Vector: každá ohlášená síť nese seznam všech AS v atributu AS_PATH – uvidí-li router své vlastní ASN v příchozí cestě, trasu kvůli smyčce zahodí.",
          "Výběr trasy v BGP se neřídí rychlostí linky, ale politikou operátora: prioritně podle nejvyšší LOCAL_PREF (odchod z AS), nejkratšího AS_PATH a nejnižšího MED."
        ],
        principle: {
          problem: "OSPF dokáže spolehlivě řídit síť jedné firmy, ale na celém Internetu existuje přes milion tras a desítky tisíc konkurujících si operátorů, kteří si navzájem nechtějí prozrazovat interní topologii ani směrovat cizí tranzitní provoz zadarmo. Jak Internet drží pohromadě?",
          explanation: [
            "Internet je tvořen více než 75 tisíci propojených sítí zvaných Autonomní systémy (AS), kde každý AS představuje skupinu sítí pod jednotnou technickou správou a politikou (např. poskytovatel připojení ISP, vysoká škola, banka či cloudový gigant) s přiděleným unikátním číslem ASN (v Evropě je přiděluje RIPE NCC; rozsah 64512–65534 je vyhrazen pro privátní testování). Jediným směrovacím protokolem typu EGP (Exterior Gateway Protocol), který tyto systémy propojuje, je BGP-4 (Border Gateway Protocol). Aby si dva hraniční routery vyměňovaly obrovskou globální tabulku bez nutnosti neustále posílat celá data znovu, navazují explicitně definované spojení přes TCP port 179.",
            "Rozlišujeme dvě podoby stejného protokolu: eBGP (External BGP) běží mezi sousedy z různých autonomních systémů (např. naše firma AS64512 ↔ operátor AS64520). Při přechodu přes eBGP router automaticky připojí své ASN na začátek atributu AS_PATH a nastaví sebe jako NEXT_HOP (výchozí AD pro eBGP je 20). Naproti tomu iBGP (Internal BGP) synchronizuje naučené externí trasy mezi více hraničními routery uvnitř stejného AS (AD 200). Protože iBGP nemění AS_PATH, platí přísné pravidlo „iBGP split-horizon“: trasy přijaté od jednoho iBGP souseda nesmí router poslat dál jinému iBGP sousedovi – proto se vnitřní routery propojují buď každý s každým (Full Mesh), nebo přes centrální Route Reflector.",
            "Na rozdíl od Distance Vectoru (RIP) a Link-State (OSPF) je BGP algoritmem typu Path Vector. Každá ohlášená podsíť (NLRI) s sebou nese seznam AS čísel, kterými prošla – atribut AS_PATH (např. 64520 3356 15169). Tento seznam slouží jednak k hrubému odhadu vzdálenosti, ale především jako absolutní pojistka proti směrovacím smyčkám: pokud router našeho AS64512 obdrží zvenčí ohlášku obsahující v AS_PATH číslo 64512, okamžitě ví, že zpráva oběhla kruh, a bez milosti ji zahodí.",
            "BGP nerozhoduje podle nejnižší latence ani rychlosti optiky, nýbrž podle obchodně-technických politik pomocí sady atributů (Path Attributes). Má-li router více platných cest se stejným prefixem a dosažitelným NEXT_HOPem, porovnává je shora dolů: 1. nejvyšší WEIGHT (lokální parametr pouze na daném Cisco routeru), 2. nejvyšší LOCAL_PREF (lokální preference sdílená v celém našem AS – klíčový nástroj, jak určit preferovaný odchozí směr přes levnější linku), 3. trasa vzniklá lokálně na routeru, 4. nejkratší AS_PATH (nejméně AS přeskoků), 5. nejnižší typ původu ORIGIN (IGP < EGP < Incomplete) a 6. nejnižší MED (Multi-Exit Discriminator), kterým sousednímu AS jemně naznačujeme, kterou z našich dvou přípojek má zvolit pro příchozí provoz. V praxi si sítě v národních uzlech jako NIX.CZ zdarma či levně vyměňují vlastní provoz (Peering), zatímco pro přístup ke zbytku světa si od velkých Tier-1/Tier-2 operátorů kupují placený Tranzit."
          ],
          steps: [
            {
              step: "1. Navázání BGP relace přes TCP port 179",
              detail: "Hraniční routery se ručně nakonfigurují pomocí IP adresy souseda a jeho ASN. Po 3-Way Handshaku si vymění zprávy OPEN a KEEP-ALIVE."
            },
            {
              step: "2. Ohlášení sítí a kontrola AS_PATH proti smyčkám",
              detail: "Routery oznamují své prefixy zprávou UPDATE. Každý přechod přes eBGP připíše ASN odesílatele do AS_PATH; výskyt vlastního ASN vede k odmítnutí."
            },
            {
              step: "3. Vyhodnocení politik (LOCAL_PREF → AS_PATH → MED)",
              detail: "BGP proces zváží obchodní politiky: nejprve nejvyšší LOCAL_PREF v rámci našeho AS, pak délku AS_PATH a při více spojích k témuž sousedovi nejnižší MED."
            },
            {
              step: "4. Zápis do směrovací tabulky a iBGP distribuce",
              detail: "Pouze jediná vítězná cesta označená symbolem *> se uloží do hlavní směrovací tabulky a přepošle dalším eBGP i iBGP partnerům."
            }
          ],
          analogy: "Představte si mezinárodní vlakovou dopravu mezi soukromými dopravci (AS): v rámci jednoho podniku (OSPF) ví každý výpravčí o každé výhybce, ale konkurenční dopravci (BGP) si řeknou jen „Přes mě se dostanete do Paříže přes firmy [DB → SNCF]“. Podnik si podle ceny lístku nastaví preferovanou firmu (LOCAL_PREF), nikdy nenastoupí do vlaku, jehož lístek už obsahuje jeho vlastní název (AS_PATH), a v Praze na hlavním nádraží (peeringový uzel NIX.CZ) si cestující předávají napřímo bez placení cizím dopravcům.",
          comparisonTable: {
            headers: ["Prvek / Atribut BGP", "Rozsah a smysl", "Pravidlo výběru / chování"],
            rows: [
              ["eBGP (External BGP)", "Mezi dvěma různými AS (AD = 20)", "Přidává vlastní ASN do AS_PATH a mění NEXT_HOP"],
              ["iBGP (Internal BGP)", "Mezi routery uvnitř stejného AS (AD = 200)", "Nemění AS_PATH; vyžaduje Full Mesh nebo Route Reflector"],
              ["LOCAL_PREF (výchozí 100)", "Platí v celém vlastním AS (Well-known discretionary)", "Vyhrává NEJVYŠŠÍ hodnota – řídí odchozí provoz (Outbound)"],
              ["AS_PATH", "Seznam ASN po cestě (Well-known mandatory)", "Vyhrává NEJKRATŠÍ seznam; chrání před smyčkami"],
              ["MED (Multi-Exit Disc.)", "Porovnává jen souběžné linky do stejného AS", "Vyhrává NEJNIŽŠÍ hodnota – doporučuje cestu příchozímu provozu"]
            ]
          },
          watchOut: "BGP je historicky postaveno na důvěře mezi operátory. Bez nasazení přísných filtrů (prefix-listy a kryptografická validace RPKI/ROA) může jediný překlep u malého ISP omylem oznámit cizí síť (např. YouTube nebo banku) a způsobit celosvětový výpadek známý jako BGP Hijack nebo Route Leak. Stejně tak pamatujte: pokud nastavíte LOCAL_PREF na 200, porazí i cestu s výrazně kratším AS_PATH!"
        },
        example: {
          scenarioTitle: "Konfigurace eBGP s nastavením LOCAL_PREF a čtení BGP tabulky",
          scenarioText: "Podnik s privátním AS 64512 je připojen ke dvěma operátorům (AS 64520 hlavní optika a AS 64530 záložní linka). Pomocí route-mapy zvýšíme LOCAL_PREF na 200 pro hlavního operátora a ověříme vítěznou trasu.",
          codeBlocks: [
            {
              label: "Nastavení eBGP souseda a preference odchozího směru (LOCAL_PREF)",
              lang: "text",
              code: "router bgp 64512\n bgp router-id 198.51.100.1\n neighbor 203.0.113.1 remote-as 64520\n neighbor 203.0.113.1 route-map PREFER-PRIMARY in\n neighbor 203.0.113.5 remote-as 64530\n network 198.51.100.0 mask 255.255.255.0\n!\nroute-map PREFER-PRIMARY permit 10\n set local-preference 200"
            },
            {
              label: "Výstup příkazu show ip bgp – symbol *> značí platnou nejlepší trasu",
              lang: "text",
              code: "R1# show ip bgp\n   Network          Next Hop            Metric LocPrf Weight Path\n*> 8.8.8.0/24       203.0.113.1              0    200      0 64520 15169 i\n*                   203.0.113.5              0    100      0 64530 15169 i\n\n# Vítězí 203.0.113.1 díky LocPrf=200; AS_PATH k cíli je [64520 -> 15169]."
            }
          ],
          practicalTip: "Ve výpisu `show ip bgp` hledejte vždy dvojici znaků `*>`: hvězdička `*` znamená, že je cesta platná (Next Hop je dosažitelný), a šipka `>` označuje jedinou vítěznou nejlepší trasu zapsanou do směrovací tabulky."
        },
        quiz: [
          {
            question: "Jaký transportní protokol a číslo portu používá BGP-4 pro výměnu směrovacích aktualizací mezi sousedy?",
            options: [
              "UDP port 520",
              "TCP port 179",
              "IP protokol 89",
              "UDP port 161"
            ],
            correctIndex: 1,
            explanation: "Na rozdíl od IGP protokolů využívá BGP spolehlivé spojení TCP na portu 179, takže nemusí periodicky posílat celou obří tabulku."
          },
          {
            question: "Jak protokol BGP bezpečně odhalí a zablokuje směrovací smyčku mezi autonomními systémy?",
            options: [
              "Omezí maximální počet skoků na 15 jako v RIP",
              "Zkontroluje atribut AS_PATH; pokud v něm uvidí své vlastní číslo AS, ohlášku zahodí",
              "Spustí každých 5 minut Dijkstrův algoritmus nad celou tabulkou Internetu",
              "Zmenší hodnotu MED na nulu"
            ],
            correctIndex: 1,
            explanation: "Protože každý AS při průchodu eBGP zapíše své číslo do seznamu AS_PATH, přítomnost vlastního ASN znamená, že zpráva oběhla kruh."
          },
          {
            question: "Který z těchto atributů rozhoduje dříve než délka AS_PATH a řídí preferovaný odchozí směr provozu z našeho AS?",
            options: [
              "LOCAL_PREF (vyhrává nejvyšší hodnota)",
              "MED (vyhrává nejnižší hodnota)",
              "Hop Count (vyhrává nejnižší hodnota)",
              "TTL v IP hlavičce"
            ],
            correctIndex: 0,
            explanation: "V rozhodovacím stromu BGP má LOCAL_PREF (nejvyšší hodnota) vyšší prioritu než porovnávání délky AS_PATH i atributu MED."
          },
          {
            question: "Jaký je rozdíl mezi peeringem a tranzitem z pohledu poskytovatele Internetu (ISP)?",
            options: [
              "Peering funguje jen přes iBGP, tranzit jen přes OSPF",
              "Peering je přímá výměna provozu jen vlastních sítí a zákazníků (často bezplatně v IXP uzlech), tranzit je placená cesta ke zbytku Internetu",
              "Peering vyžaduje šifrování IPsec, tranzit je nešifrovaný",
              "Tranzit se používá jen uvnitř jedné budovy na L2 switchích"
            ],
            correctIndex: 1,
            explanation: "Při peeringu (např. v českém uzlu NIX.CZ) si sítě vyměňují pouze cíle ve svých sítích; pro dosažitelnost všech ostatních sítí světa musí menší operátor nakupovat tranzit."
          }
        ]
      },

      // =========================================================================
      // TÉMA 5: DNS (Domain Name System) – hierarchie, záznamy, DNSSEC a DoH/DoT
      // =========================================================================
      {
        id: "dns-protocol",
        number: 5,
        moduleId: "core-infra-services",
        mandatory: true,
        title: "DNS (Domain Name System): hierarchie, dotazování, záznamy a DNSSEC",
        shortTitle: "DNS, záznamy a DNSSEC",
        subtitle: "Překlad domén na IP adresy (UDP/TCP 53), kořenové a autoritativní servery, rekurze vs. iterace, záznamy A–SRV, TTL a DNSSEC/DoH.",
        cardSummary: "DNS na UDP/TCP 53: kořen, TLD a autorita, rekurze vs. iterace, záznamy A/MX/TXT, TTL a DNSSEC.",
        difficulty: "Základy",
        accentColor: "#f59e0b",
        tags: ["DNS", "UDP/TCP 53", "Rekurzivní resolver", "Záznamy A/MX/TXT", "TTL Cache", "DNSSEC", "DoH / DoT"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/dns-protocol.mp4",
          poster: "media/posters/dns-protocol.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Hierarchie DNS a iterace vs. rekurze (0:00)", time: 0 },
            { label: "2. DNS záznamy, TTL a zabezpečení (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Hierarchie DNS – „Služba DNS překládá čitelné domény na IP adresy postupným dotazem od kořenových serverů.“\n0:07–0:13: Záznamy a bezpečnost – „Jednotlivé záznamy směřují weby i poštu, zatímco DNSSEC a šifrované dotazy chrání soukromí.“"
        },
        animationType: "dns-protocol",
        labType: "dns-resolver-sim",
        learningObjectives: [
          "Rozlišíš role kořenových (.), TLD a autoritativních serverů od lokálního rekurzivního resolveru při překladu jména.",
          "Vybereš správný typ DNS záznamu (A, AAAA, CNAME, MX, NS, PTR, TXT, SRV) pro web, poštu, reverzní překlad i ověřování domén.",
          "Vysvětlíš vliv TTL na mezipaměť a přesný rozdíl mezi integritou v DNSSEC a šifrováním provozu přes DoH / DoT."
        ],
        takeaways: [
          "DNS překládá doménová jména na IP adresy pomocí UDP portu 53 (rychlé dotazy) a TCP portu 53 (zónové přenosy AXFR/IXFR nebo rozsáhlé odpovědi s DNSSEC).",
          "Strom DNS vychází z kořenové zóny (.) přes domény nejvyšší úrovně TLD (.cz, .com) až k autoritativnímu serveru vlastníka domény.",
          "Klient pokládá rekurzivní dotaz svému resolveru (žádá konečný výsledek); resolver pak při prázdné cache provádí iterativní kroky od kořene k autoritě a výsledek kešuje po dobu TTL.",
          "Záznamy A/AAAA nesou IPv4/IPv6, CNAME alias, MX poštovní server a TXT textová metadata; DNSSEC chrání pravost dat podpisy, zatímco DoT (853) a DoH (443) šifrují samotné dotazy."
        ],
        principle: {
          problem: "Lidé si nedokážou pamatovat desítky 32bitových či 128bitových IP adres webových a poštovních serverů. Jak udržet celosvětově jednotný, bleskurychlý a bezpečný překlad jmen bez zahlcení jediného centrálního serveru?",
          explanation: [
            "Systém DNS (Domain Name System) tvoří distribuovanou hierarchickou databázi Internetu. Pro rychlé dotazy klientů používá bezestavové UDP na portu 53, kde se otázka i odpověď vejde do jediného paketu. Naopak TCP port 53 nastupuje při replikaci celé zóny mezi primárním a sekundárním autoritativním serverem (zónové přenosy AXFR/IXFR) nebo tehdy, když odpověď přesáhne limit UDP (typicky kvůli dlouhým kryptografickým podpisům DNSSEC nebo velkým TXT záznamům). Doménové jméno se čte zprava doleva: za koncovou tečkou (kořen .) následuje TLD (.cz, .com, .org), doména druhé úrovně (nic.cz) a subdoména (www.nic.cz) – celkový zápis zakončený tečkou se nazývá FQDN.",
            "Samotný překlad rozděluje role mezi dva typy dotazů. Operační systém (stub resolver) pošle rekurzivní dotaz nakonfigurovanému rekurzivnímu resolveru (např. firemnímu serveru nebo veřejným službám 1.1.1.1 / 9.9.9.9 / 8.8.8.8) – tím říká „zjisti mi finální odpověď za každou cenu“. Pokud ji resolver nemá v paměti, provede sérii iterativních dotazů: nejprve se zeptá jednoho ze 13 logických kořenových serverů (.), který mu nevrátí IP adresu webu, ale odkaz na správný TLD server (.cz). TLD server jej odkáže na autoritativní server dané domény a teprve ten vrátí autoritativní IP adresu. Aby se tento postup nemusel opakovat při každém kliknutí, uloží si resolver odpověď do cache na dobu stanovenou parametrem TTL (Time to Live v sekundách).",
            "V zónovém souboru autoritativního serveru najdeme různé typy záznamů (Resource Records). Záznam A mapuje jméno na IPv4 adresu, AAAA na 128bitovou IPv6 adresu. CNAME vytváří kanonický alias na jiné doménové jméno (např. shop.firma.cz → firma.hosting.cz). MX udává název poštovního serveru pro doručování e-mailů včetně číselné priority (nižší číslo znamená přednostní server). NS určuje autoritativní jmenné servery zóny, PTR slouží k reverznímu překladu z IP na jméno (ve speciální zóně in-addr.arpa, zásadní u pošty), TXT nese textová ověření vlastnictví či bezpečnostní politiky SPF/DKIM/DMARC a SRV popisuje konkrétní službu a port (využívá Active Directory či SIP).",
            "Původní DNS z 80. let nemělo žádnou bezpečnost – útočník na cestě mohl odpověď podvrhnout (DNS spoofing / otrava cache) nebo veškeré dotazy odposlouchávat. Dnes proto řešíme dvě nezávislé vrstvy ochrany. DNSSEC (DNS Security Extensions) doplňuje zónu o digitální podpisy (RRSIG, DNSKEY, DS), takže resolver dokáže kryptograficky ověřit, že odpověď skutečně pochází od majitele domény a nikdo ji cestou nezměnil. DNSSEC ale provoz nešifruje! K zajištění důvěrnosti mezi uživatelem a rekurzivním resolverem před zraky operátora či útočníka na veřejné Wi-Fi slouží šifrované přenosy DoT (DNS over TLS na TCP portu 853) a DoH (DNS over HTTPS na portu 443)."
          ],
          steps: [
            {
              step: "1. Kontrola lokální cache a rekurzivní dotaz",
              detail: "Prohlížeč zkontroluje lokální cache OS a soubor hosts; při neúspěchu pošle rekurzivní dotaz na UDP 53 svému rekurzivnímu resolveru."
            },
            {
              step: "2. Iterativní sestup hierarchií (. → TLD → Autorita)",
              detail: "Při prázdné cache se resolver iterativně zeptá kořenového serveru (.), získá odkaz na TLD (.cz) a následně na autoritativní NS server konkrétní domény."
            },
            {
              step: "3. Ověření podpisu DNSSEC a uložení s TTL",
              detail: "Autoritativní server vrátí požadovaný záznam (např. A / AAAA / MX) s hodnotou TTL. Podporuje-li doména DNSSEC, resolver řetězem důvěry ověří platnost podpisu RRSIG."
            },
            {
              step: "4. Doručení odpovědi klientovi",
              detail: "Resolver uloží výsledek do paměti na dobu TTL (příští dotaz odbaví ihned) a pošle IP adresu klientovi (případně šifrovaným kanálem DoH nebo DoT)."
            }
          ],
          analogy: "DNS je jako telefonní ústředna firem: vy zavoláte své asistentce (rekurzivní resolver) a řeknete „sežeň mi číslo pana Nováka z firmy Alfa“ (rekurzivní dotaz). Asistentka obvolá celostátní ústřednu (Root), pak městskou pobočku (TLD .cz) a nakonec recepci firmy Alfa (autoritativní server), přičemž každý jí jen předá číslo na další štaci (iterativní dotazy). Nakonec si číslo zapíše na lísteček s datem platnosti (TTL) a předá vám ho.",
          comparisonTable: {
            headers: ["Typ záznamu", "Význam", "Typický příklad"],
            rows: [
              ["A / AAAA", "Překlad jména na IPv4 (A) nebo IPv6 (AAAA)", "www.firma.cz. IN A 93.184.216.34"],
              ["CNAME", "Alias (přesměrování jména na jiné jméno)", "blog.firma.cz. IN CNAME hosting.poskytovatel.cz."],
              ["MX", "Poštovní server domény a jeho priorita", "firma.cz. IN MX 10 mail1.firma.cz."],
              ["NS", "Autoritativní jmenný server zóny", "firma.cz. IN NS ns1.firma.cz."],
              ["PTR", "Reverzní záznam (IP adresa → doménové jméno)", "34.216.184.93.in-addr.arpa. IN PTR web.firma.cz."],
              ["TXT / SRV", "Textová metadata (SPF/DKIM) / poloha a port služby", "firma.cz. IN TXT \"v=spf1 mx -all\""]
            ]
          },
          watchOut: "Dva časté omyly: zaprvé, DNSSEC nijak nešifruje vaše dotazy – každý na síti stále vidí, jakou doménu otevíráte, jen zaručuje integritu odpovědi. Soukromí dává až DoT či DoH. Zadruhé, záznam CNAME nikdy nesmíte nastavit na vrchol domény (apex, např. firma.cz bez www), protože podle normy koliduje s povinnými záznamy SOA a NS – pro kořen domény použijte A/AAAA."
        },
        example: {
          scenarioTitle: "Sledování iterativní cesty DNS pomocí dig +trace a dotaz na MX / TXT / PTR",
          scenarioText: "Pomocí nástroje dig zkontrolujeme celou cestu rozkladu domény od kořenových serverů až po autoritativní server a vypíšeme poštovní, bezpečnostní i reverzní záznamy.",
          codeBlocks: [
            {
              label: "Linux – sledování iterace od kořene po autoritu (dig +trace)",
              lang: "bash",
              code: "# Postupný průchod Root (.) -> TLD (.cz) -> Autoritativní NS -> Záznam A\n$ dig +trace www.nic.cz\n.                       518400  IN  NS  a.root-servers.net.\ncz.                     172800  IN  NS  a.ns.nic.cz.\nnic.cz.                 1800    IN  NS  a.ns.nic.cz.\nwww.nic.cz.             1800    IN  A   217.31.205.50"
            },
            {
              label: "Dotazy na konkrétní typy záznamů (MX, TXT, PTR) a kontrola DNSSEC",
              lang: "bash",
              code: "# Dotaz na poštovní servery (MX) a ověření podpisu DNSSEC (příznak 'ad')\n$ dig +dnssec nic.cz MX +short\n10 mx.nic.cz.\n\n# Dotaz na TXT záznamy (SPF politika pro poštu)\n$ dig seznam.cz TXT +short\n\"v=spf1 include:_spf.seznam.cz ~all\"\n\n# Reverzní překlad IP adresy na doménové jméno (PTR záznam)\n$ dig -x 1.1.1.1 +short\none.one.one.one."
            }
          ],
          practicalTip: "Před plánovanou migrací webu na nový server snižte s jednodenním předstihem hodnotu TTL u A záznamu z běžných 3600 s (hodina) na 60 nebo 300 sekund – po přepnutí nové IP adresy pak uživatelé uvidí nový web během několika minut."
        },
        quiz: [
          {
            question: "Kdy protokol DNS kromě standardního UDP portu 53 využívá také TCP port 53?",
            options: [
              "Pouze při dotazech na záznamy typu AAAA (IPv6)",
              "Pro zónové přenosy mezi autoritativními servery (AXFR) a při velkých odpovědích (např. s DNSSEC podpisy)",
              "Výhradně při použití protokolu DoH (DNS over HTTPS)",
              "TCP port 53 DNS vůbec nepoužívá"
            ],
            correctIndex: 1,
            explanation: "TCP 53 zajišťuje spolehlivý přenos zónových souborů (AXFR/IXFR) a slouží jako záloha pro rozsáhlé odpovědi, které se nevejdou do UDP datagramu."
          },
          {
            question: "Jaký je hlavní rozdíl mezi rekurzivním a iterativním DNS dotazem?",
            options: [
              "Rekurzivní dotaz žádá po resolveru konečnou odpověď (IP adresu); při iterativním dotazu vrací oslovený server i jen odkaz na další nižší úroveň",
              "Rekurzivní dotazy směřují na TCP, iterativní na UDP",
              "Iterativní dotaz používá prohlížeč, rekurzivní jen poštovní servery",
              "Rekurzivní dotaz obchází kořenové servery"
            ],
            correctIndex: 0,
            explanation: "Koncový klient klade rekurzivní dotaz svému resolveru a čeká hotový výsledek; resolver pak iterativně oslovuje kořen, TLD a autoritativní server."
          },
          {
            question: "Který DNS záznam určuje název a prioritu poštovního serveru přijímajícího e-maily pro danou doménu?",
            options: [
              "PTR",
              "CNAME",
              "MX",
              "SRV"
            ],
            correctIndex: 2,
            explanation: "Záznam MX (Mail Exchanger) s číselnou prioritou říká odesílajícím SMTP serverům, kam mají doručit poštu pro danou doménu."
          },
          {
            question: "Co zajišťuje rozšíření DNSSEC na rozdíl od protokolů DoH (DNS over HTTPS) a DoT (DNS over TLS)?",
            options: [
              "DNSSEC šifruje komunikaci před poskytovatelem Internetu, zatímco DoH ji jen podepisuje",
              "DNSSEC kryptograficky ověřuje pravost a integritu DNS záznamu (proti podvržení), kdežto DoH a DoT šifrují dotaz mezi klientem a resolverem",
              "DNSSEC automaticky zkracuje hodnotu TTL na nulu",
              "DNSSEC zcela nahrazuje potřebu TLS certifikátů na webech"
            ],
            correctIndex: 1,
            explanation: "DNSSEC chrání integritu pomocí digitálních podpisů (RRSIG), ale data nešifruje; šifrování proti odposlechu dotazů řeší DoT (853) nebo DoH (443)."
          }
        ]
      },

      // =========================================================================
      // TÉMA 6: DHCP (Dynamic Host Configuration Protocol) a proces DORA
      // =========================================================================
      {
        id: "dhcp-dora",
        number: 6,
        moduleId: "core-infra-services",
        mandatory: true,
        title: "DHCP (Dynamic Host Configuration Protocol) a proces DORA",
        shortTitle: "DHCP, DORA a Relay",
        subtitle: "Automatická síťová konfigurace klientů na UDP 67/68: proces DORA, Lease Time (T1/T2), DHCP Options, rezervace MAC a Relay Agent.",
        cardSummary: "DHCP (UDP 67/68): proces DORA, doba pronájmu T1/T2, statická rezervace MAC, volby a DHCP Relay.",
        difficulty: "Základy",
        accentColor: "#eab308",
        tags: ["DHCP", "DORA", "UDP 67/68", "Lease Time (T1/T2)", "DHCP Relay", "DHCP Options", "APIPA"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/dhcp-dora.mp4",
          poster: "media/posters/dhcp-dora.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Čtyřkrokový proces DORA (0:00)", time: 0 },
            { label: "2. Lease Time T1/T2 a DHCP Relay (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Proces DORA – „Protokol DHCP automaticky přidělí novému počítači IP adresu, masku i bránu ve čtyřech krocích.“\n0:07–0:13: Lease a Relay – „Stanice si pronájem průběžně prodlužuje a do vzdálených podsítí žádosti přeposílá směrovač.“"
        },
        animationType: "dhcp-dora",
        labType: "dhcp-dora-sim",
        learningObjectives: [
          "Popíšeš jednotlivé zprávy procesu DORA včetně zdrojových a cílových IP adres a portů UDP 67 a 68.",
          "Vypočítáš okamžik obnovení pronájmu při časovačích T1 (50 %) a T2 (87,5 %) a nastavíš statickou rezervaci na MAC adresu.",
          "Zdůvodníš nasazení DHCP Relay Agenta (ip helper-address) mezi VLAN sítěmi a pojmenuješ klíčové volby DHCP Options 3, 6 a 15."
        ],
        takeaways: [
          "DHCP funguje nad UDP na portech 67 (server) a 68 (klient); automaticky přiděluje IP adresu, masku, výchozí bránu (Option 3), DNS servery (Option 6) i doménu (Option 15).",
          "Nový klient získává adresu ve 4 krocích DORA: Discover (broadcast klienta) → Offer (nabídka serveru) → Request (výběr nabídky) → Acknowledge (potvrzení pronájmu).",
          "IP adresa se nepůjčuje natrvalo, ale na dobu Lease Time: v 50 % doby (T1) žádá klient o prodloužení přímo server, v 87,5 % (T2) volá broadcastem jakýkoli dostupný DHCP server.",
          "Protože router nepropouští broadcasty, přenáší požadavky do centrálního DHCP serveru funkce DHCP Relay Agent (např. ip helper-address)."
        ],
        principle: {
          problem: "V síti se stovkami notebooků a telefonů nelze IP adresy, masky, brány a DNS nastavovat ručně – hrozily by duplicitní konflikty IP adres a obrovská pracnost. Jak zařízení po zapnutí bezpečně a automaticky nakonfigurovat?",
          explanation: [
            "Protokol DHCP (Dynamic Host Configuration Protocol) automaticky předává koncovým stanicím kompletní síťové nastavení ihned po připojení do sítě. Využívá bezestavové UDP na portech 67 (naslouchá DHCP server) a 68 (naslouchá DHCP klient; u DHCPv6 jde o UDP porty 547 a 546). Správce na serveru definuje rozsah volných adres (Pool / Scope), vyloučené adresy pro statické servery, síťovou masku a doplňující parametry známé jako DHCP Options – nejčastěji Option 3 (výchozí brána / router), Option 6 (DNS servery), Option 15 (doménový název) nebo Option 42 (NTP server).",
            "Získání adresy probíhá ve čtyřkrokovém dialogu DORA. Nejprve klient bez IP adresy (zdrojová IP 0.0.0.0) vyšle L2/L3 broadcast DHCP Discover na adresu 255.255.255.255:67. Všechny dostupné DHCP servery vyberou volnou IP z poolu a vrátí zprávu DHCP Offer s nabídkou adresy a parametrů. Klient si jednu nabídku vybere a vyšle (opět broadcastem, aby odmítl případné další nabídky a dal najevo svou volbu) zprávu DHCP Request. Nakonec vybraný server pronájem závazně potvrdí zprávou DHCP Acknowledge (ACK) a označí adresu ve své databázi jako obsazenou.",
            "Aby se adresy po odpojení notebooků či hostů ze sítě nezablokovaly navždy, uděluje je DHCP na omezenou dobu pronájmu zvanou Lease Time (např. 8 hodin pro kancelář nebo 30 minut pro veřejnou Wi-Fi). Po uplynutí 50 % této doby (časovač T1 – Renew) pošle klient serveru jednosměrný (unicast) požadavek DHCP Request na prodloužení. Pokud je server nedostupný, zkusí klient po 87,5 % doby (časovač T2 – Rebinding) oslovit broadcastem jakýkoli jiný DHCP server v síti. Vyprší-li celých 100 % doby pronájmu bez odpovědi, musí klient adresu uvolnit. Zařízení jako síťové tiskárny, AP nebo kamery, která vyžadují stálou IP, dostávají na DHCP serveru statickou rezervaci svázanou s jejich pevnou MAC adresou.",
            "V podnikových sítích s více oddělenými VLAN sítěmi nebývá DHCP server přítomen v každé podsíti zvlášť, ale sídlí centrálně v serverovně. Protože routery na L3 vrstvě standardně zahazují broadcasty (včetně DHCP Discover), musí se na bráně každé klientské sítě zapnout DHCP Relay Agent (na zařízeních Cisco příkazem ip helper-address <IP_DHCP_serveru>). Relay zachytí klientský broadcast, zapíše do pole giaddr IP adresu rozhraní, ze kterého dotaz přišel, a přepošle jej jako běžný unicast paket přímo centrálnímu DHCP serveru, který tak přesně pozná, z jakého adresního poolu má IP vybrat."
          ],
          steps: [
            {
              step: "1. D – Discover (Klient hledá server)",
              detail: "Stanice nemá IP (0.0.0.0) a na UDP port 67 vyšle broadcast (255.255.255.255, L2 FF:FF:FF:FF:FF:FF) se svou MAC adresou."
            },
            {
              step: "2. O – Offer (Server nabízí konfiguraci)",
              detail: "DHCP server vybere nepoužívanou IP z poolu a pošle klientovi zprávu Offer na UDP port 68 s nabízenou IP, maskou, délkou Lease a volbami (brána, DNS)."
            },
            {
              step: "3. R – Request (Klient žádá o vybranou IP)",
              detail: "Klient přijme první vhodnou nabídku a broadcastem DHCP Request potvrdí vybranému serveru svůj zájem (ostatní servery své nabídky stornují)."
            },
            {
              step: "4. A – Acknowledge (Potvrzení a časovače T1/T2)",
              detail: "Server odešle DHCP ACK a zaznamená pronájem. Klient si adresu nastaví a začne odpočítávat T1 (50 %) pro tiché prodloužení pronájmu."
            }
          ],
          analogy: "Proces DORA je jako půjčovna kol na náměstí: zakřičíte do davu „Má tu někdo volné kolo?“ (Discover), dva stánkaři zvednou ruku s cenou (Offer), vy ukážete na prvního „Chci tohle modré kolo od tebe!“ (Request) a on vám ho zapíše na vaše jméno do sešitu na 4 hodiny (Acknowledge). V polovině výpůjčky (T1) se zastavíte, jestli si ho můžete nechat o další čtyři hodiny déle.",
          comparisonTable: {
            headers: ["Krok / Parametr DHCP", "Směr a porty", "Adresace (L3)", "Klíčová role v síti"],
            rows: [
              ["DHCP Discover", "Klient (68) → Server (67)", "0.0.0.0 → 255.255.255.255 (Broadcast)", "Nalezení dostupného DHCP serveru v síti"],
              ["DHCP Offer", "Server (67) → Klient (68)", "IP serveru → Broadcast / nabízená IP", "Nabídka konkrétní IP, masky, brány (Opt 3) a DNS (Opt 6)"],
              ["DHCP Request", "Klient (68) → Server (67)", "0.0.0.0 → 255.255.255.255 (Broadcast)", "Závazné potvrzení výběru jednoho ze serverů"],
              ["DHCP ACK", "Server (67) → Klient (68)", "IP serveru → Broadcast / přidělená IP", "Uzavření pronájmu a start časovačů T1 (50 %) a T2 (87,5 %)"],
              ["DHCP Relay (giaddr)", "Router (67) ↔ Centrální DHCP (67)", "Unicast mezi VLAN a serverovnou", "Přeposlání broadcastu DORA přes směrovač do centrály"]
            ]
          },
          watchOut: "Pokud v síti vypadne DHCP server nebo se zablokují porty UDP 67/68, přiřadí si Windows či macOS po marných pokusech nouzovou adresu APIPA z rozsahu 169.254.0.0/16 – zařízení s ní komunikují jen na lokálním kabelu a nedostanou se na Internet. Velkým bezpečnostním rizikem je také podvržený server (Rogue DHCP), který rozdá útočníkovu bránu a podstrčí provoz (MITM) – bráníme se funkcí DHCP Snooping na switchích!"
        },
        example: {
          scenarioTitle: "Konfigurace DHCP serveru se statickou rezervací a DHCP Relay na routeru",
          scenarioText: "V první ukázce definujeme rozsah DHCP, volby 3 a 6 a statickou rezervaci pro tiskárnu podle její MAC adresy. Ve druhé ukázce přepošleme DHCP dotazy z oddělené VLAN 20 na centrální server.",
          codeBlocks: [
            {
              label: "ISC DHCP / dhcpd.conf – pool, Options 3/6/15 a MAC rezervace",
              lang: "text",
              code: "subnet 192.168.20.0 netmask 255.255.255.0 {\n  range 192.168.20.100 192.168.20.220;\n  option routers 192.168.20.1;           # Option 3: Výchozí brána\n  option domain-name-servers 192.168.10.5, 1.1.1.1;  # Option 6: DNS\n  option domain-name \"firma.local\";      # Option 15: Doména\n  default-lease-time 28800;              # 8 hodin (T1 = 4h, T2 = 7h)\n  max-lease-time 86400;\n}\n\nhost sitova-tiskarna {\n  hardware ethernet 00:1b:63:84:45:e6;   # Statická rezervace na MAC\n  fixed-address 192.168.20.50;\n}"
            },
            {
              label: "Směrovač (DHCP Relay Agent) a klientská diagnostika DORA",
              lang: "bash",
              code: "# Konfigurace Relay na rozhraní VLAN 20 směrovače (Cisco IOS):\ninterface GigabitEthernet0/1.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\n ip helper-address 10.10.0.10   # Přepošle UDP 67/68 unicastem na DHCP server\n\n# Vynucení nového DORA dialogu na linuxovém klientovi:\n$ sudo dhclient -r eth0 && sudo dhclient -v eth0\nDHCPDISCOVER on eth0 to 255.255.255.255 port 67\nDHCPOFFER of 192.168.20.101 from 10.10.0.10\nDHCPREQUEST for 192.168.20.101 on eth0 to 255.255.255.255 port 67\nDHCPACK of 192.168.20.101 from 10.10.0.10 (lease time 28800s)"
            }
          ],
          practicalTip: "Při nastavování statické DHCP rezervace vždy přidělujte IP adresu mimo rozsah dynamického poolu (např. pool .100–.220 a rezervace .50), nebo u chytrých DHCP serverů ověřte, že je adresa z poolu automaticky vyhrazená."
        },
        quiz: [
          {
            question: "Jaké UDP porty používá protokol DHCPv4 pro komunikaci mezi serverem a klientem?",
            options: [
              "TCP 67 (server) a TCP 68 (klient)",
              "UDP 67 (server) a UDP 68 (klient)",
              "UDP 53 (server) a UDP 54 (klient)",
              "UDP 123 (server) a UDP 124 (klient)"
            ],
            correctIndex: 1,
            explanation: "DHCP server naslouchá na UDP portu 67 a odpovědi posílá zpět klientovi na UDP port 68."
          },
          {
            question: "Pokud DHCP server přidělí IP adresu s dobou pronájmu (Lease Time) 10 hodin, kdy se klient poprvé pokusí prodloužit pronájem v čase T1?",
            options: [
              "Po 1 hodině (10 %)",
              "Po 5 hodinách (50 %) přímým unicastem na server",
              "Po 8,75 hodinách (87,5 %)",
              "Teprve po vypršení všech 10 hodin"
            ],
            correctIndex: 1,
            explanation: "Časovač T1 (Renew) nastává v 50 % doby pronájmu a klient v něm žádá o prodloužení přímo svého původního DHCP serveru."
          },
          {
            question: "K čemu slouží na směrovači funkce DHCP Relay Agent (příkaz ip helper-address)?",
            options: [
              "Zrychluje vypršení doby pronájmu u neaktivních zařízení",
              "Zachytává lokální DHCP broadcasty a přeposílá je jako unicast na centrální DHCP server v jiné podsíti",
              "Šifruje DORA komunikaci pomocí TLS certifikátů",
              "Brání přidělování adres z rozsahu APIPA 169.254.0.0/16"
            ],
            correctIndex: 1,
            explanation: "Routery nepropouští broadcasty mezi VLAN sítěmi, takže DHCP Relay Agent přebalí Discover/Request do unicastu směřujícího na centrální DHCP server."
          },
          {
            question: "Co signalizuje IP adresa 169.254.18.42 na síťovém rozhraní klientského počítače?",
            options: [
              "Stanice úspěšně získala veřejnou IP adresu z Internetu",
              "Stanice má statickou DHCP rezervaci pro tiskárnu",
              "DHCP dotazy selhaly a operační systém si sám nastavil nouzovou link-local adresu APIPA",
              "Router zablokoval komunikaci pomocí NAT"
            ],
            correctIndex: 2,
            explanation: "Rozsah 169.254.0.0/16 je APIPA (Automatic Private IP Addressing) – nouzové samo-přidělení adresy při nedostupnosti DHCP serveru."
          }
        ]
      },

      // =========================================================================
      // TÉMA 7: NTP (Network Time Protocol) – Stratum 0–15, T1–T4 a chrony
      // =========================================================================
      {
        id: "ntp-time",
        number: 7,
        moduleId: "core-infra-services",
        mandatory: true,
        title: "NTP (Network Time Protocol): vrstvy Stratum, T1–T4 a chrony",
        shortTitle: "NTP a přesný čas (Stratum)",
        subtitle: "Synchronizace času přes UDP 123: hierarchie Stratum 0–15, výpočet offsetu a RTT z časových značek T1–T4, chrony a bezpečnostní závislosti.",
        cardSummary: "NTP (UDP 123): hierarchie Stratum 0–15, výpočet RTT a offsetu z T1–T4, TLS, Kerberos a chrony.",
        difficulty: "Střední",
        accentColor: "#d97706",
        tags: ["NTP", "UDP 123", "Stratum 0–15", "Offset a RTT", "chrony / ntpd", "Kerberos", "Korelace logů"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/ntp-time.mp4",
          poster: "media/posters/ntp-time.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Hierarchie Stratum 0–15 (0:00)", time: 0 },
            { label: "2. Výpočet RTT/Offset z T1–T4 (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Hierarchie Stratum – „Protokol NTP přenáší přesný čas v hierarchii vrstev od atomových hodin až k běžným serverům.“\n0:07–0:13: Výpočet T1 až T4 – „Ze čtyř časových značek spočítá zpoždění linky, aby správně fungovaly certifikáty, Kerberos i logy.“"
        },
        animationType: "ntp-time",
        labType: "ntp-stratum-sim",
        learningObjectives: [
          "Zařadíš zdroje času do hierarchie Stratum 0 až 15 a rozpoznáš význam hodnoty Stratum 16.",
          "Vypočítáš síťové zpoždění (RTT) a časovou odchylku (offset) z čtveřice časových značek T1, T2, T3 a T4.",
          "Zdůvodníš, proč přesný čas vyžadují TLS certifikáty, Kerberos/Active Directory, DNSSEC a vyšetřování bezpečnostních logů."
        ],
        takeaways: [
          "NTP běží nad UDP portem 123 a distribuuje koordinovaný světový čas (UTC) v hierarchii Stratum 0 (atomové hodiny/GPS) až Stratum 15; Stratum 16 znamená nesynchronizováno.",
          "Zpoždění v síti nesmí zkreslit čas: klient ze 4 časových značek (T1–T4) vypočte dobu letu RTT δ = (T4−T1)−(T3−T2) a odchylku hodin θ = ((T2−T1)+(T3−T4))/2.",
          "Bez jednotného času (typicky s tolerancí pod 5 minut) selže přihlašování Kerberos/Active Directory, platnost TLS certifikátů, DNSSEC podpisy i korelace logů.",
          "Na moderním Linuxu (AlmaLinux 9, Ubuntu) spravuje synchronizaci démon chrony (chronyc) metodou plynulého zrychlování/zpomalování hodin (slewing) bez zpětných skoků."
        ],
        principle: {
          problem: "Hardwarové hodiny na základní desce serveru se kvůli kolísání teploty krystalu denně rozejdou i o několik sekund. Jak udržet tisíce serverů v přesnosti na milisekundy i přes proměnlivé zpoždění na Internetu?",
          explanation: [
            "Přesný čas v sítích udržuje protokol NTP (Network Time Protocol) nad UDP portem 123. Všechny servery si předávají jednotný světový čas UTC (nikoli lokální zimní/letní čas – časová pásma řeší až operační systém při zobrazení). Rozdíl několika minut totiž v infrastruktuře způsobí řetězový výpadek: autentizace Kerberos v Microsoft Active Directory odmítne lístky starší než 5 minut jako pokus o replay útok, webové prohlížeče a systémy vyhodnotí platné TLS/SSL certifikáty či DNSSEC podpisy jako expirované nebo „ještě neplatné“, přestanou fungovat jednorázové TOTP kódy (2FA) a bezpečnostní analytici v SIEMu nedokážou časově spárovat logy útoku z firewallu, serveru a databáze (korelace logů).",
            "Aby se přetížení nekoncentrovalo k jednomu zdroji, staví NTP stromovou hierarchii zvanou Stratum (úroveň 0 až 15). Úroveň Stratum 0 tvoří samotná referenční zařízení bez síťové karty – atomové césiové hodiny, přijímače družicového signálu GPS/GNSS či rádiový signál DCF77. Přímo k nim připojené primární NTP servery mají označení Stratum 1 (v ČR např. přesné servery sdružení CESNET tik.cesnet.cz a tak.cesnet.cz). Každý další krok po síti zvyšuje číslo Stratum o 1: firemní interní NTP server synchronizovaný proti veřejnému Stratum 1/2 bude mít Stratum 2 nebo 3 a koncové stanice Stratum 3–4. Hodnota Stratum 16 je rezervována pro stav „nesynchronizováno“.",
            "Samotné odeslání času „teď je 12:00:00.000“ by nestačilo, protože paket letí po síti několik až desítek milisekund. NTP klient proto vymění 4 časové značky: T1 (čas odeslání dotazu klientem), T2 (čas příjmu dotazu na serveru), T3 (čas odeslání odpovědi ze serveru) a T4 (čas příjmu odpovědi klientem). Z nich spočítá čisté obousměrné zpoždění na síti δ = (T4 − T1) − (T3 − T2) (odečte dobu zpracování uvnitř serveru) a přesnou odchylku (offset) svých hodin vůči serveru: θ = ((T2 − T1) + (T3 − T4)) / 2. Klient sleduje více NTP serverů najednou, vyřadí nespolehlivé („falsetickers“) a drží se spolehlivé většiny.",
            "V moderních linuxových systémech (včetně AlmaLinux 9) nahradil starší démon ntpd rychlejší a přesnější nástroj chrony (démon chronyd a ovládací nástroj chronyc). Klíčovou zásadou korekce času v produkci je tzv. slewing: drobné odchylky (řádově milisekundy) chrony neskáče okamžitým přepisem času, nýbrž nepatrně zrychlí nebo zpomalí tikání systémových hodin, dokud se odchylka nesrovná. Skokové přenastavení (stepping) by totiž mohlo posunout čas zpět a poškodit časové značky databází nebo kompilací; povoluje se proto typicky jen bezprostředně po startu systému pomocí volby makestep. Proti podvržení času vzniklo moderní šifrované rozšíření NTS (Network Time Security) nad TLS."
          ],
          steps: [
            {
              step: "1. Výběr NTP zdrojů ze Stratum hierarchie",
              detail: "Klient či firemní NTP server (Stratum 2) si vybere 3 a více nezávislých zdrojů (např. pool.ntp.org / CESNET Stratum 1), aby poznal chybně běžící server."
            },
            {
              step: "2. Výměna 4 časových značek T1–T4 na UDP 123",
              detail: "Klient zapíše čas odeslání T1, server doplní T2 (příjem) a T3 (odeslání zpět) a klient zaznamená čas příchodu T4."
            },
            {
              step: "3. Výpočet RTT (δ) a odchylky hodin (θ)",
              detail: "Vzorec δ = (T4−T1)−(T3−T2) určí zpoždění trasy a θ = ((T2−T1)+(T3−T4))/2 spočítá, o kolik se klientské hodiny opožďují či předcházejí."
            },
            {
              step: "4. Plynulé doladění (slewing) v chrony",
              detail: "Démon chronyd plynule upravuje frekvenci hodin (slew), měří jejich dlouhodobý teplotní drift a drží systém v rozptylu pod jednu milisekundu."
            }
          ],
          analogy: "Představte si, že telefonujete kamarádovi do jiné místnosti s velkou ozvěnou, abyste si seřídili hodinky. Odešlete vzkaz ve své 12:00:00 (T1), kamarád ho slyší ve své 12:00:05 (T2), po vteřině přemýšlení odpoví ve 12:00:06 (T3) a vy odpověď zachytíte ve 12:00:08 (T4). Doba cesty tam i zpět bez přemýšlení byla (8−0)−(6−5) = 7 s (3,5 s tam a 3,5 s zpět), takže ve vašich 12:00:00 bylo u kamaráda 12:00:01,5 – vaše hodiny jdou o 1,5 s pozadu!",
          comparisonTable: {
            headers: ["Úroveň / Parametr", "Zdroj nebo význam", "Typická přesnost / chování"],
            rows: [
              ["Stratum 0", "Atomové hodiny, GPS/GNSS přijímač, DCF77", "Referenční hardware mimo IP síť (nanosekundy)"],
              ["Stratum 1", "Primární NTP server přímo připojený ke Stratum 0", "Např. tik.cesnet.cz (mikrosekundy)"],
              ["Stratum 2–15", "Síťové servery a stanice synchronizované přes UDP 123", "Milisekundy v LAN / desítky ms v WAN"],
              ["Stratum 16", "Hodiny nejsou synchronizovány", "Server odmítá garantovat přesný čas"],
              ["chrony vs. ntpd", "Moderní chronyd (chronyc) vs. klasický ntpd", "chrony rychleji konverguje a lépe zvládá přerušenou síť"]
            ]
          },
          watchOut: "Pamatujte na dvě kritické věci: za prvé, vzorec pro offset θ předpokládá symetrickou dobu cesty tam a zpět – pokud linka tam trvá 2 ms a zpět 42 ms, vnese tato asymetrie do výpočtu chybu 20 ms! Za druhé, starší NTP servery s nezakázaným příkazem `monlist` bývaly zneužívány k obrovským DDoS amplifikačním útokům po UDP 123, proto veřejně otevřený NTP démon vždy zabezpečte."
        },
        example: {
          scenarioTitle: "Konfigurace démona chrony a kontrola zdrojů v AlmaLinux 9",
          scenarioText: "V konfiguraci `/etc/chrony.conf` nastavíme důvěryhodné české NTP servery s volbou `iburst` (rychlá synchronizace po startu) a ověříme odchylku hodin i hodnoty Stratum pomocí `chronyc`.",
          codeBlocks: [
            {
              label: "/etc/chrony.conf – nastavení NTP zdrojů a lokální korekce",
              lang: "ini",
              code: "# Primární servery Stratum 1 (CESNET) a veřejný pool\nserver tik.cesnet.cz iburst\nserver tak.cesnet.cz iburst\npool 2.cz.pool.ntp.org iburst\n\n# Uložení driftu krystalu a povolení skoku (step) jen v prvních 3 aktualizacích\ndriftfile /var/lib/chrony/drift\nmakestep 1.0 3\nrtcsync"
            },
            {
              label: "chronyc – ověření zdrojů (* = vybraný), Stratum a offsetu",
              lang: "bash",
              code: "$ chronyc sources -v\nMS Name/IP address         Stratum Poll Reach LastRx Last sample\n===============================================================================\n^* tik.cesnet.cz                 1   6   377    28   +112us[ +145us] +/- 3810us\n^+ tak.cesnet.cz                 1   6   377    29   -204us[ -171us] +/- 4120us\n\n$ chronyc tracking\nReference ID    : C371140A (tik.cesnet.cz)\nStratum         : 2\nSystem time     : 0.000084 seconds fast of NTP time\nLast offset     : +0.000033 seconds"
            }
          ],
          practicalTip: "Ve výstupu `chronyc sources` znamená hvězdička `^*` aktuálně zvolený hlavní synchronizační zdroj, `^+` značí kvalitní záložní kandidáty a `^?` hlásí nedosažitelný server (zkontrolujte firewall na UDP portu 123)."
        },
        quiz: [
          {
            question: "Které číslo Stratum nese atomový zdroj času (GPS/césiové hodiny) a které značí nesynchronizovaný stav?",
            options: [
              "Stratum 1 = atomové hodiny, Stratum 0 = nesynchronizováno",
              "Stratum 0 = atomové hodiny / GPS, Stratum 16 = nesynchronizováno",
              "Stratum 0 = lokální PC, Stratum 15 = atomové hodiny",
              "Stratum 15 = GPS, Stratum 16 = primární internetový server"
            ],
            correctIndex: 1,
            explanation: "Stratum 0 označuje fyzický zdroj času bez síťového rozhraní, Stratum 1–15 pak vzdálenost po síti a hodnota 16 značí nesynchronizovaný stav."
          },
          {
            question: "Proč je při odchylce času větší než 5 minut v podnikové síti okamžitě zablokováno přihlašování do Active Directory (Kerberos)?",
            options: [
              "Protože DHCP server pak odmítá přidělit IP adresu",
              "Protože Kerberos chrání autentizační tikety před replay útokem kontrolou časového razítka",
              "Protože TCP 3-Way Handshake kontroluje UTC čas v hlavičce",
              "Protože Ethernetové switche zahazují rámce se starým časem"
            ],
            correctIndex: 1,
            explanation: "Kerberos vkládá do autentizačních zpráv časové razítko; rozptyl přes 5 minut vede k odmítnutí tiketu kvůli ochraně před znovupoužitím zachycené komunikace."
          },
          {
            question: "Klient odešle NTP dotaz v T1=10.000 s, server jej přijme v T2=10.050 s a odešle v T3=10.060 s, klient odpověď přijme v T4=10.120 s. Jaké je čisté zpoždění na síti (RTT)?",
            options: [
              "120 ms",
              "100 ms",
              "110 ms",
              "60 ms"
            ],
            correctIndex: 2,
            explanation: "Podle vzorce δ = (T4 − T1) − (T3 − T2) dostaneme (10.120 − 10.000) − (10.060 − 10.050) = 0.120 − 0.010 = 0.110 s (110 ms)."
          },
          {
            question: "Co znamená metoda „slewing“ při seřizování hodin v démonu chrony?",
            options: [
              "Okamžitý skok hodin zpět o celou zjištěnou chybu",
              "Plynulé jemné zrychlení či zpomalení tikání hodin, aby čas nikdy neskočil zpět",
              "Vypnutí síťové karty během synchronizace",
              "Převod lokálního času na zimní čas"
            ],
            correctIndex: 1,
            explanation: "Slewing plynule dožene odchylku úpravou rychlosti hodin, čímž brání nebezpečným skokům času zpět v běžících databázích a logech."
          }
        ]
      },

      // =========================================================================
      // TÉMA 8: HTTP/1.1, HTTP/2 a HTTP/3 (QUIC)
      // =========================================================================
      {
        id: "http-versions",
        number: 8,
        moduleId: "web-mail-protocols",
        mandatory: true,
        title: "Webové protokoly HTTP/1.1, HTTP/2 a HTTP/3 (QUIC)",
        shortTitle: "HTTP/1.1, HTTP/2 a HTTP/3",
        subtitle: "Model Request/Response, metody (GET–DELETE), stavové kódy (1xx–5xx), hlavičky a vývoj od HTTP/1.1 přes HTTP/2 po HTTP/3 nad QUIC.",
        cardSummary: "HTTP (TCP 80 / UDP 443): metody GET–DELETE, kódy 1xx–5xx, hlavičky a vývoj HTTP/1.1 → HTTP/3.",
        difficulty: "Základy",
        accentColor: "#a855f7",
        tags: ["HTTP/1.1", "HTTP/2", "HTTP/3 (QUIC)", "Metody (GET/POST)", "Stavové kódy", "HoL Blocking", "HPACK / QPACK"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/http-versions.mp4",
          poster: "media/posters/http-versions.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. HTTP Request/Response a kódy (0:00)", time: 0 },
            { label: "2. Vývoj HTTP/1.1 → HTTP/2 → HTTP/3 (0:07)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Model HTTP – „Webový protokol HTTP funguje formou dotazu a odpovědi pomocí metod a přehledných stavových kódů.“\n0:07–0:13: HTTP/2 a HTTP/3 – „Druhá verze posílá více proudů najednou a třetí verze zrychluje načítání díky protokolu QUIC.“"
        },
        animationType: "http-versions",
        labType: "http-inspector-sim",
        learningObjectives: [
          "Sestavíš strukturu HTTP požadavku a odpovědi včetně hlavních metod (GET, POST, PUT, PATCH, DELETE, HEAD) a tříd stavových kódů 1xx–5xx.",
          "Vysvětlíš účel hlaviček Host, Content-Type a Cookie v bezestavovém protokolu HTTP.",
          "Porovnáš technické inovace mezi HTTP/1.1 (Keep-Alive, HoL blocking), HTTP/2 (multiplex, HPACK) a HTTP/3 (QUIC nad UDP 443)."
        ],
        takeaways: [
          "HTTP je bezestavový protokol typu Request/Response (TCP port 80 pro nešifrovaný provoz, TCP/UDP 443 pro HTTPS/HTTP3); stav uživatele udržují hlavičky Cookie a tokeny.",
          "Metody definují akci nad zdrojem (GET čte, POST vytváří, PUT nahrazuje, PATCH částečně upravuje, DELETE maže) a stavové kódy hlásí výsledek (2xx OK, 3xx přesměrování, 4xx chyba klienta, 5xx chyba serveru).",
          "HTTP/1.1 (textové) zavedlo Keep-Alive, ale trpí Head-of-Line (HoL) blokováním v rámci jednoho TCP spojení; HTTP/2 přešlo na binární rámce, multiplex a kompresi hlaviček HPACK.",
          "HTTP/3 opouští TCP a běží nad protokolem QUIC (UDP 443): odstraňuje i TCP HoL blocking při ztrátě paketu, zrychluje handshake (TLS 1.3 uvnitř) a podporuje migraci spojení mezi Wi-Fi a 5G."
        ],
        principle: {
          problem: "Moderní webová stránka potřebuje načíst desítky stylů, skriptů a obrázků během zlomku sekundy i na nestabilní mobilní síti. Jak se původně jednoduchý textový protokol HTTP musel vyvinout, aby nebrzdil prohlížeče?",
          explanation: [
            "HTTP (Hypertext Transfer Protocol) funguje na modelu Klient–Server (Request/Response) a v nešifrované podobě využívá TCP port 80 (šifrovaně HTTPS na TCP 443, u HTTP/3 na UDP 443). Jde o bezestavový (stateless) protokol: server si ze samotného HTTP požadavku nepamatuje předchozí akci téhož uživatele. Proto pro přihlášení či nákupní košík posílá server hlavičku Set-Cookie a prohlížeč ji v dalších požadavcích vrací zpět v hlavičce Cookie. Od verze HTTP/1.1 je povinná hlavička Host, která umožňuje na jedné IP adrese provozovat stovky různých webů (Virtual Hosting), a hlavička Content-Type (MIME typ, např. application/json či text/html) popisuje formát přenášeného těla.",
            "Požadavek vždy začíná metodou: GET bezpečně čte data bez těla, HEAD stáhne jen hlavičky, POST odesílá formulář či vytváří nový záznam (opakované volání může vytvořit duplicitní záznamy), PUT nahradí celý zdroj na dané adrese (je idempotentní), PATCH mění jen vybrané pole a DELETE zdroj maže. Server odpovídá třímístným stavovým kódem: 1xx jsou informační (např. 101 Switching Protocols), 2xx potvrzují úspěch (200 OK, 201 Created, 204 No Content), 3xx přesměrovávají (301 trvale, 302 dočasně, 304 z lokální cache), 4xx upozorňují na chybu klienta (400 Bad Request, 401 chybějící přihlášení, 403 odepřený přístup, 404 nenalezeno) a 5xx hlásí selhání serveru či brány (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable).",
            "V době HTTP/1.1 (1997) se zprávy posílaly v čistém textu. Přestože přineslo volbu Keep-Alive (znovupoužití jednoho TCP spojení bez opakovaného 3-Way Handshaku), musel klient v jednom spojení čekat na odpověď předchozího souboru, než mohl požádat o další – tento problém se nazývá aplikační Head-of-Line (HoL) Blocking. Prohlížeče jej obcházely otevíráním až 6 paralelních TCP spojení na jednu doménu. V roce 2015 proto vzniklo HTTP/2: převedlo zprávy na binární rámce, zavedlo pravé multiplexování (jedním TCP spojením proudí desítky požadavků a odpovědí souběžně v nezávislých tocích – Streams) a kompresi opakujících se hlaviček pomocí tabulky HPACK.",
            "HTTP/2 však narazilo na limit samotného TCP: když se po cestě ztratí jediný IP paket s kouskem jednoho obrázku, jádro OS zastaví doručování všech ostatních souběžných streamů v témže TCP spojení, dokud ztracený paket nedorazí (TCP Head-of-Line Blocking). Řešením je standard HTTP/3 (2022) běžící nad novým transportním protokolem QUIC přes UDP port 443. QUIC spojuje transport a povinné šifrování TLS 1.3 do jediného rychlého handshaku (1-RTT nebo dokonce 0-RTT při návratu), řeší ztrátu paketu izolovaně pro každý jednotlivý stream, komprimuje hlavičky metodou QPACK a díky unikátnímu Connection ID udrží aktivní stahování i při přepnutí telefonu z domácí Wi-Fi na mobilní 5G."
          ],
          steps: [
            {
              step: "1. Sestavení HTTP Requestu (Metoda + URI + Hlavičky)",
              detail: "Klient pošle metodu (např. GET /api/user), povinnou hlavičku Host, případně Cookie či Authorization a u metod POST/PUT/PATCH také tělo s Content-Type."
            },
            {
              step: "2. Zpracování a odpověď se stavovým kódem",
              detail: "Server vyhodnotí oprávnění a zdroj; vrátí stavový kód (200 OK, 301, 403, 404 či 502), hlavičky Cache-Control/Set-Cookie a požadovaná data."
            },
            {
              step: "3. Přechod na HTTP/2 multiplex (binární rámce a HPACK)",
              detail: "Přes ALPN v TLS si klient a server domluví HTTP/2: všechny soubory webu tečou současně jedním TCP spojením jako prokládané binární rámce."
            },
            {
              step: "4. HTTP/3 nad QUIC (UDP 443 a Connection Migration)",
              detail: "Server může v hlavičce Alt-Svc nabídnout HTTP/3; prohlížeč přejde na UDP/443 (QUIC) bez TCP HoL blokování a s QPACK kompresí hlaviček."
            }
          ],
          analogy: "HTTP/1.1 je jako úzká pokladna v obchodě – dokud paní před vámi nezaplatí plný košík, vaše láhev vody čeká (HoL blocking). HTTP/2 otevře jeden široký pás s deseti košíky vedle sebe, ale když vypadne jeden šroub z pásu (ztracený TCP paket), stojí všechny košíky. HTTP/3 (QUIC) nahradí jeden pás deseti samostatnými drony nad UDP: zpozdí se jen ten dron, kterému zafoukal vítr, a ostatní doručí nákup okamžitě.",
          comparisonTable: {
            headers: ["Vlastnost", "HTTP/1.1", "HTTP/2", "HTTP/3"],
            rows: [
              ["Transportní vrstva", "TCP (port 80 / TLS 443)", "TCP (typicky s TLS na portu 443)", "QUIC nad UDP (port 443, TLS 1.3 vestavěno)"],
              ["Formát zpráv", "Čistý text (ASCII řádky)", "Binární rámce (Streams)", "Binární rámce v QUIC streamech"],
              ["Souběžnost (Multiplex)", "Ne – 1 požadavek za druhým (Keep-Alive)", "Ano – více streamů v jednom TCP", "Ano – plně nezávislé streamy v QUIC"],
              ["Head-of-Line Blocking", "Na aplikační i TCP vrstvě", "Vyřešeno v HTTP, přetrvává v TCP", "Odstraněno i na úrovni ztracených paketů"],
              ["Komprese hlaviček", "Žádná (opakují se celé hlavičky)", "HPACK", "QPACK (odolná proti ztrátám UDP)"]
            ]
          },
          watchOut: "Pozor na přesný rozdíl mezi kódy 401 Unauthorized a 403 Forbidden: 401 znamená „nejsi přihlášen nebo máš neplatný token“ (klient neprokázal identitu), zatímco 403 znamená „vím, kdo jsi, ale do této složky nemáš přístup“. Při nasazování HTTP/3 nezapomeňte na firewallu povolit kromě TCP/443 také UDP/443 – jinak se klienti tiše vrátí na HTTP/2."
        },
        example: {
          scenarioTitle: "Surový HTTP/1.1 požadavek vs. ověření HTTP/2 a HTTP/3 pomocí curl",
          scenarioText: "Podíváme se, jak vypadá čitelný textový požadavek HTTP/1.1 a jak v terminálu otestujeme vyjednání verze HTTP/2 i HTTP/3 s hlavičkou Alt-Svc.",
          codeBlocks: [
            {
              label: "Textová struktura HTTP/1.1 Request a Response",
              lang: "http",
              code: "# Požadavek klienta:\nPOST /api/v1/login HTTP/1.1\nHost: portal.firma.cz\nContent-Type: application/json\nContent-Length: 42\n\n{\"user\":\"admin\",\"token\":\"9f8a7b\"}\n\n# Odpověď serveru:\nHTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nSet-Cookie: sid=xyz123; HttpOnly; Secure\n\n{\"status\":\"authenticated\"}"
            },
            {
              label: "curl – kontrola stavového kódu, hlavičky Alt-Svc a HTTP/2 vs. HTTP/3",
              lang: "bash",
              code: "# 1. Kontrola hlaviček a podpory HTTP/2 (HEAD požadavek):\n$ curl -I --http2 https://www.cloudflare.com\nHTTP/2 200 \ncontent-type: text/html; charset=UTF-8\nalt-svc: h3=\":443\"; ma=86400   # Server oznamuje podporu HTTP/3 na UDP 443!\n\n# 2. Vynucení spojení přes HTTP/3 (QUIC nad UDP 443):\n$ curl -I --http3-only https://www.cloudflare.com\nHTTP/3 200"
            }
          ],
          practicalTip: "Hlavička `alt-svc: h3=\":443\"` říká prohlížeči při prvním spojení přes TCP/HTTP2, že příště může přepnout na rychlejší HTTP/3 přes UDP port 443."
        },
        quiz: [
          {
            question: "Která hlavička je od verze HTTP/1.1 povinná v každém požadavku, aby na jedné IP adrese mohlo běžet více různých domén?",
            options: [
              "User-Agent",
              "Host",
              "Accept-Encoding",
              "Referer"
            ],
            correctIndex: 1,
            explanation: "Hlavička Host (např. Host: www.firma.cz) umožňuje webovému serveru rozlišit, pro kterou doménu na sdílené IP adrese je požadavek určen."
          },
          {
            question: "Jaký je rozdíl mezi stavovými kódy HTTP 401 a 403?",
            options: [
              "401 je dočasné přesměrování a 403 trvalé přesměrování",
              "401 značí chybějící nebo neplatnou autentizaci (přihlášení), zatímco 403 odepření přístupu přihlášenému uživateli bez oprávnění",
              "401 znamená chybu na straně klienta a 403 pád databáze na serveru",
              "Oba kódy znamenají, že stránka byla smazána"
            ],
            correctIndex: 1,
            explanation: "401 Unauthorized znamená, že klient se dosud platně neověřil; 403 Forbidden znamená, že identita může být známá, ale oprávnění nestačí."
          },
          {
            question: "Jaký hlavní problém HTTP/2 definitivně odstranil protokol HTTP/3 přechodem na QUIC nad UDP?",
            options: [
              "Nedostatek IPv4 adres",
              "TCP Head-of-Line Blocking – zpoždění všech streamů při ztrátě jediného TCP paketu",
              "Nemožnost používat metodu POST a soubory Cookie",
              "Nekompatibilitu s DNS záznamy typu AAAA"
            ],
            correctIndex: 1,
            explanation: "V HTTP/2 ztráta jediného TCP paketu zablokuje v jádru OS i ostatní paralelní streamy; QUIC nad UDP řeší doručování pro každý stream zvlášť."
          },
          {
            question: "Kterou dvojici transportního protokolu a portu musí firewall povolit, aby fungovalo moderní HTTP/3?",
            options: [
              "TCP port 80",
              "UDP port 80",
              "UDP port 443",
              "TCP port 8080"
            ],
            correctIndex: 2,
            explanation: "HTTP/3 využívá protokol QUIC běžící nad UDP na portu 443 (hlavička Alt-Svc: h3=\":443\")."
          }
        ]
      }
    ],

    // =========================================================================
    // SLOVNÍČEK POJMŮ – Část 1 (A–M, 53 hesel)
    // =========================================================================
    glossary: [
      {
        term: "A / AAAA záznam",
        category: "DNS, DHCP & NTP",
        shortDef: "Základní DNS záznamy překládající doménové jméno na 32bitovou IPv4 adresu (A) nebo 128bitovou IPv6 adresu (AAAA).",
        detail: "Záznam A (Address) vrací čtyři oktety IPv4 (např. 93.184.216.34), zatímco záznam AAAA (Quad-A, 4× 32 = 128 bitů) vrací hexadecimální IPv6 adresu. Jedno jméno může mít více záznamů A/AAAA pro jednoduché rozkládání zátěže (Round-Robin DNS).",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "ACK (Potvrzení v TCP)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Řídicí příznak a číslo v hlavičce TCP oznamující odesílateli, kolik bajtů příjemce v pořádku přijal a jaký bajt očekává jako další.",
        detail: "Je součástí každého kroku po úvodním paketu SYN (včetně SYN-ACK a potvrzení závěrečného FIN). Pokud odesílateli nedorazí ACK v časovém limitu RTO nebo obdrží třikrát stejné duplicitní ACK, okamžitě znovu odešle ztracený segment.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "Administrative Distance (AD)",
        category: "RIP, OSPF & BGP",
        shortDef: "Hodnota důvěryhodnosti zdroje směrovací informace na routeru (0–255); při stejném prefixu vyhrává nižší číslo.",
        detail: "Pokud se router dozví o téže podsíti ze dvou různých protokolů, vybere zdroj s nižší AD: Connected = 0, Static = 1, eBGP = 20, interní EIGRP = 90, OSPF = 110, RIP = 120, iBGP = 200. Hodnota 255 znamená nedůvěryhodnou trasu.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "APIPA (169.254.0.0/16)",
        category: "DNS, DHCP & NTP",
        shortDef: "Automatic Private IP Addressing – záložní link-local IPv4 rozsah, který si operační systém nastaví sám při selhání DHCP serveru.",
        detail: "Nedostane-li klient odpověď DHCP Offer po odeslání Discover, vylosuje si adresu z 169.254.0.0/16 a ověří ji přes ARP, zda není obsazená. S touto adresou lze komunikovat pouze v lokální L2 síti; routery ji nikdy nesměrují do Internetu.",
        relatedTopicId: "dhcp-dora"
      },
      {
        term: "Area 0 (Backbone Area)",
        category: "RIP, OSPF & BGP",
        shortDef: "Povinná páteřní oblast směrovacího protokolu OSPF, ke které musí být připojeny všechny ostatní OSPF oblasti.",
        detail: "Rozdělení rozsáhlé OSPF sítě do oblastí (Areas) zmenšuje velikost databáze LSDB i četnost přepočtu Dijkstrova algoritmu SPF. Veškerý provoz mezi dvěma ne-páteřními oblastmi musí fyzicky či virtuálně procházet přes Area 0 prostřednictvím hraničních routerů ABR.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "ARP (Address Resolution Protocol)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Protokol zjišťující 48bitovou fyzickou MAC adresu zařízení v lokální síti na základě jeho známé IPv4 adresy.",
        detail: "Odesílatel vyšle L2 broadcast ARP Request (FF:FF:FF:FF:FF:FF) a dotázaný stroj odpoví unicastem ARP Reply. Zjištěný pár se na několik minut uloží do ARP tabulky (ip neigh / arp -a). V IPv6 nahrazuje ARP protokol NDP (Neighbor Discovery Protocol) uvnitř ICMPv6.",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "ASN (Autonomous System Number)",
        category: "RIP, OSPF & BGP",
        shortDef: "Jedinečné 16bitové nebo 32bitové identifikační číslo přidělené autonomnímu systému pro směrování v BGP.",
        detail: "Veřejná čísla ASN v Evropě přiděluje regionální registr RIPE NCC (např. AS6881 či AS2852 pro CESNET). Rozsah 64512–65534 (a část 4bajtových čísel 4200000000–4294967294) je rezervován pro privátní a laboratorní BGP sítě.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "AS_PATH",
        category: "RIP, OSPF & BGP",
        shortDef: "Povinný atribut protokolu BGP obsahující uspořádaný seznam čísel AS, kterými ohlášená trasa prošla.",
        detail: "Slouží ke dvěma účelům: zabraňuje vzniku směrovacích smyček (pokud router v příchozím AS_PATH uvidí své vlastní ASN, trasu zahodí) a jako metrika v rozhodovacím procesu BGP (při stejné LOCAL_PREF vyhrává kratší AS_PATH). Operátoři někdy své ASN úmyslně opakují (AS-Path Prepending), aby cestu zdánlivě prodloužili.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "Autonomní systém (AS)",
        category: "RIP, OSPF & BGP",
        shortDef: "Soubor IP sítí a směrovačů pod jednotnou technickou správou a společnou směrovací politikou vystupující vůči Internetu jako jeden celek.",
        detail: "Uvnitř jednoho AS běží vnitřní směrovací protokol IGP (např. OSPF nebo IS-IS), zatímco navenek k ostatním poskytovatelům a peeringovým uzlům komunikuje hraničními routery přes protokol BGP-4.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "Autoritativní DNS server",
        category: "DNS, DHCP & NTP",
        shortDef: "DNS server spravující originální zónový soubor dané domény a poskytující konečné, závazné odpovědi o jejích záznamech.",
        detail: "Na rozdíl od rekurzivního resolveru, který odpovědi jen vyhledává a dočasně kešuje, nese autoritativní server zdroj pravdy pro zónu (např. firma.cz) a v odpovědích nastavuje příznak AA (Authoritative Answer).",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "BGP (Border Gateway Protocol)",
        category: "RIP, OSPF & BGP",
        shortDef: "Jediný dnes používaný vnější směrovací protokol (EGP) propojující autonomní systémy celého Internetu přes TCP port 179.",
        detail: "Verze BGP-4 pracuje na principu Path Vectoru a umožňuje operátorům řídit toky provozu nikoli pouze podle rychlosti linky, ale podle obchodních dohod (peering/tranzit) pomocí atributů jako LOCAL_PREF, AS_PATH, MED a Communities.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "Broadcast",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Všesměrové vysílání určené všem zařízením v lokální síti (L2 adresa FF:FF:FF:FF:FF:FF nebo L3 omezený broadcast 255.255.255.255).",
        detail: "Využívá se tam, kde odesílatel předem nezná adresu příjemce – typicky v protokolech ARP Request a DHCP Discover. Routery na síťové vrstvě broadcasty dál nepředávají, čímž oddělují broadcastové domény (na rozdíl od L2 switchů).",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "Chrony / ntpd",
        category: "DNS, DHCP & NTP",
        shortDef: "Dva hlavní démoni pro synchronizaci času přes NTP v Linuxu; moderní chrony (chronyd/chronyc) nahradil starší ntpd.",
        detail: "Chrony výrazně rychleji dosahuje přesné synchronizace po startu, přesněji kompenzuje kolísání teploty hardwarového krystalu, zvládá přerušované síťové připojení i virtuální stroje a standardně využívá plynulé seřizování hodin (slewing).",
        relatedTopicId: "ntp-time"
      },
      {
        term: "CNAME záznam",
        category: "DNS, DHCP & NTP",
        shortDef: "Canonical Name – DNS záznam vytvářející alias (přezdívku) jednoho doménového jména na jiné kanonické jméno.",
        detail: "Pokud má subdoména www.firma.cz záznam CNAME ukazující na firma.cloudprovider.net, vyhledá resolver následně záznam A/AAAA pro cílový název. CNAME nesmí stát na vrcholu zóny (apex) společně se záznamy NS a SOA.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "Cookie (HTTP Cookie)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Krátký textový záznam uložený serverem do prohlížeče (hlavička Set-Cookie), který klient posílá zpět v dalších HTTP požadavcích.",
        detail: "Protože protokol HTTP je ze své podstaty bezestavový, umožňují Cookies udržet přihlášenou relaci (Session ID) nebo obsah košíku. Bezpečnostní příznaky HttpOnly (chrání před krádeží přes JavaScript/XSS), Secure (jen přes HTTPS) a SameSite (proti CSRF) jsou dnes nezbytností.",
        relatedTopicId: "http-versions"
      },
      {
        term: "Cost (Metrika OSPF)",
        category: "RIP, OSPF & BGP",
        shortDef: "Bezrozměrná cena linky v protokolu OSPF vypočítaná ze šířky pásma rozhraní; Dijkstrův algoritmus volí trasu s nejnižším součtem Cost.",
        detail: "Počítá se podle vzorce Reference Bandwidth / Interface Bandwidth (minimálně 1). Výchozí referenční šířka 100 Mb/s již nestačí pro 1G/10G/100G sítě, proto ji správci navyšují příkazem auto-cost reference-bandwidth.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "Default Gateway (Výchozí brána)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "IP adresa lokálního směrovače, na který stanice posílá všechny pakety určené mimo její vlastní podsíť.",
        detail: "Porovnáním cílové IP se svou vlastní IP a maskou sítě počítač rozhodne, zda cíl leží v místní LAN (pak zjistí MAC cíle přímo přes ARP), nebo ve vzdálené síti (pak přes ARP zjistí MAC výchozí brány a předá paket jí).",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "Destination Unreachable (ICMP)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Chybová zpráva ICMP Type 3 informující odesílatele, že paket nebylo možné doručit k cíli a z jakého přesného důvodu.",
        detail: "Podrobný kód určuje příčinu: Code 0 (Network Unreachable – neznámá síť na routeru), Code 1 (Host Unreachable – selhal ARP u cíle), Code 3 (Port Unreachable – uzavřený UDP port, používá i traceroute), Code 4 (Fragmentation Needed při zapnutém DF bitu) nebo Code 13 (zakázáno firewallem).",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "DHCP (Dynamic Host Configuration Protocol)",
        category: "DNS, DHCP & NTP",
        shortDef: "Síťová služba nad UDP porty 67 (server) a 68 (klient) pro automatické přidělování IP adres, masek, bran a dalších parametrů.",
        detail: "Odstraňuje ruční konfiguraci a riziko kolizí IP adres. Pracuje na principu 4krokového dialogu DORA, přiděluje adresy na omezenou dobu Lease Time a umožňuje fixovat důležitá zařízení přes statické MAC rezervace.",
        relatedTopicId: "dhcp-dora"
      },
      {
        term: "DHCP Option (3, 6, 15)",
        category: "DNS, DHCP & NTP",
        shortDef: "Rozšiřující položky v odpovědích DHCP Offer a ACK předávající klientovi síťové parametry nad rámec samotné IP adresy a masky.",
        detail: "Nejpoužívanější volby jsou Option 3 (Router / výchozí brána), Option 6 (IP adresy DNS serverů), Option 15 (výchozí doménový název sítě), Option 42 (NTP servery) a Option 66/67 (TFTP server a zaváděcí soubor pro síťový boot PXE).",
        relatedTopicId: "dhcp-dora"
      },
      {
        term: "DHCP Relay Agent",
        category: "DNS, DHCP & NTP",
        shortDef: "Funkce směrovače (např. ip helper-address), která zachytí broadcastové požadavky DHCP a přepošle je unicastem na centrální DHCP server.",
        detail: "Umožňuje provozovat jediný centrální DHCP server pro desítky oddělených VLAN sítí. Relay doplní do hlavičky pole giaddr s IP adresou rozhraní příchozí podsítě, podle něhož server vybere odpovídající adresní pool.",
        relatedTopicId: "dhcp-dora"
      },
      {
        term: "Dijkstraův algoritmus (SPF)",
        category: "RIP, OSPF & BGP",
        shortDef: "Matematický algoritmus hledání nejkratších cest v grafu (Shortest Path First), který používá protokol OSPF nad databází LSDB.",
        detail: "Každý OSPF router umístí do kořene stromu sám sebe a na základě cen linků (Cost) z tabulky LSDB spočítá zaručeně bezsmyčkovou nejkratší cestu do každé cílové sítě v dané oblasti.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "Distance Vector",
        category: "RIP, OSPF & BGP",
        shortDef: "Kategorie směrovacích protokolů (např. RIPv2), kde router zná pouze vzdálenost k cíli a směr (sousední router), aniž by viděl celou mapu sítě.",
        detail: "Routery si periodicky vyměňují své směrovací tabulky s přímými sousedy („směrování podle doslechu“). Nevýhodou bývá pomalejší konvergence při výpadku linky a potřeba opatření proti smyčkám (Split Horizon, Route Poisoning).",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "DNS (Domain Name System)",
        category: "DNS, DHCP & NTP",
        shortDef: "Distribuovaný hierarchický systém překládající čitelná doménová jména na IP adresy a další záznamy přes UDP i TCP port 53.",
        detail: "Skládá se z kořenových serverů (.), TLD serverů a autoritativních serverů jednotlivých domén. Kešování podle parametru TTL zásadně snižuje zátěž sítě a zrychluje odezvu pro uživatele.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "DNSSEC",
        category: "DNS, DHCP & NTP",
        shortDef: "Bezpečnostní rozšíření DNS přidávající kryptografické podpisy (RRSIG, DNSKEY) na ochranu před podvržením odpovědí.",
        detail: "Zajišťuje integritu a ověření původu záznamů v řetězu důvěry od kořenové zóny až po konkrétní doménu (DNS spoofing tak neprojde). Samotné dotazy a odpovědi však zůstávají nezašifrované – soukromí řeší až DoT a DoH.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "DoH / DoT (DNS over HTTPS / TLS)",
        category: "DNS, DHCP & NTP",
        shortDef: "Moderní protokoly šifrující DNS dotazy mezi klientem a rekurzivním resolverem proti odposlechu a manipulaci po cestě.",
        detail: "DoT (DNS over TLS) používá vyhrazený TCP port 853, takže jej firewally snadno rozliší a kontrolují. DoH (DNS over HTTPS) zapouzdřuje DNS dotazy do běžného HTTPS provozu na portu 443, což ztěžuje jejich blokování na restrikčních sítích.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "DORA (Discover, Offer, Request, Ack)",
        category: "DNS, DHCP & NTP",
        shortDef: "Čtyřkrokový postup získání nové IP adresy v protokolu DHCP: Discover → Offer → Request → Acknowledge.",
        detail: "První tři zprávy (případně i čtvrtá) probíhají v lokální síti jako broadcast nebo přes DHCP Relay. Po doručení DHCP ACK začne klient nabízenou adresu používat a sleduje časovače obnovy T1 a T2.",
        relatedTopicId: "dhcp-dora"
      },
      {
        term: "DR / BDR (Designated Router)",
        category: "RIP, OSPF & BGP",
        shortDef: "Volený hlavní (DR) a záložní (BDR) směrovač v OSPF na sdílených ethernetových sítích pro snížení počtu vzájemných spojení.",
        detail: "Kdyby si v síti s 10 routery posílal aktualizace každý s každým, vzniklo by 45 sousedství. Všichni proto posílají změny na multicast 224.0.0.6 pouze pro DR a BDR, a DR je rozpošle ostatním na 224.0.0.5.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "eBGP / iBGP",
        category: "RIP, OSPF & BGP",
        shortDef: "Dvě role protokolu BGP-4: vnější eBGP mezi různými autonomními systémy a vnitřní iBGP pro synchronizaci uvnitř stejného AS.",
        detail: "eBGP má výchozí AD = 20, přepisuje NEXT_HOP a přidává vlastní ASN do AS_PATH. iBGP má AD = 200, zachovává atributy z vnějšku a kvůli pravidlu iBGP split-horizon vyžaduje plné propojení nebo Route Reflector.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "Echo Request / Echo Reply",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Dvojice základních diagnostických zpráv protokolu ICMP (Type 8 a Type 0) používaná nástrojem ping pro ověření dosažitelnosti.",
        detail: "Odesílatel pošle ICMP Echo Request s identifikátorem a pořadovým číslem (icmp_seq) a čeká na ICMP Echo Reply od cíle. Z rozdílu časů vypočítá odezvu RTT v milisekundách.",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "EIGRP",
        category: "RIP, OSPF & BGP",
        shortDef: "Enhanced Interior Gateway Routing Protocol – pokročilý vnitřní směrovací protokol (IP protokol 88) využívající algoritmus DUAL.",
        detail: "Kombinuje rychlost konvergence s nízkou režií: do směrovací tabulky zapisuje nejlepší trasu (Successor) a v topologické tabulce udržuje prověřenou bezsmyčkovou zálohu (Feasible Successor). Komunikuje na multicast 224.0.0.10 s výchozí AD 90.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "Ephemeral Ports (49152–65535)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Dynamické (efemérní) porty, které si klientský operační systém krátkodobě přiděluje jako zdrojový port odchozích spojení.",
        detail: "Když prohlížeč otevírá stránku na cílovém portu 443, vybere mu OS pro tuto kartu volný zdrojový port např. 53412. Po uzavření spojení se port po ochranné lhůtě TIME_WAIT uvolní pro další aplikaci.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "FIN / RST příznaky",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Dva řídicí bity hlavičky TCP pro ukončení komunikace: FIN (řádné rozloučení) a RST (okamžité násilné přerušení).",
        detail: "Řádné uzavření TCP probíhá oboustrannou výměnou FIN a ACK (každý směr se zavírá zvlášť). Naopak RST posílá OS nebo firewall při pokusu o spojení na uzavřený port či při nečekané chybě.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "FQDN (Plně kvalifikované jméno)",
        category: "DNS, DHCP & NTP",
        shortDef: "Fully Qualified Domain Name – jednoznačný úplný doménový název určující přesnou polohu v hierarchii DNS včetně koncové tečky.",
        detail: "Například zápis mail.firma.cz. obsahuje název hostitele (mail), doménu druhé úrovně (firma), TLD (.cz) i kořenovou tečku (.). Bez jednoznačné hierarchie by prohlížeč musel spoléhat na lokální vyhledávací přípony.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "GET / POST (HTTP metody)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Nejčastější metody protokolu HTTP: GET slouží k bezpečnému čtení zdroje bez těla požadavku, POST k odeslání dat a vytvoření nového záznamu.",
        detail: "GET je bezpečná a idempotentní metoda (parametry nese v URL za znakem ?, odpověď lze kešovat). POST nese data v těle zprávy (Body) podle Content-Type a opakované odeslání může akci provést dvakrát (např. duplicitní platba).",
        relatedTopicId: "http-versions"
      },
      {
        term: "Handshake (TCP 3-Way Handshake)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Tříkrokový postup navázání spolehlivého TCP spojení (SYN → SYN-ACK → ACK) před začátkem přenosu aplikačních dat.",
        detail: "Klient a server si při něm ověří obousměrnou dosažitelnost, vymění počáteční náhodná sekvenční čísla (ISN) i parametry jako MSS (Maximum Segment Size) či podporu Window Scaling.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "Head-of-Line (HoL) Blocking",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Problém zablokování fronty požadavků nebo paketů za jedním opožděným či ztraceným prvkem před nimi.",
        detail: "V HTTP/1.1 blokuje pomalá odpověď další požadavky v tomtéž spojení. HTTP/2 vyřešilo HoL na úrovni HTTP multiplexem, ale ztráta jediného TCP paketu stále pozastaví všechny streamy v jádru OS – to odstraňuje až HTTP/3 nad QUIC (UDP).",
        relatedTopicId: "http-versions"
      },
      {
        term: "Hop Count",
        category: "RIP, OSPF & BGP",
        shortDef: "Nejjednodušší směrovací metrika počítající počet směrovačů (skoků) mezi zdrojem a cílovou sítí, používaná v protokolu RIP.",
        detail: "Přímá síť má vzdálenost 0, síť za jedním routerem 1 hop. RIPv2 podporuje nejvýše 15 skoků (16 znamená nedosažitelné). Hlavní slabinou je úplné ignorování rychlosti linek.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "HPACK / QPACK",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Algoritmy bezztrátové komprese HTTP hlaviček používané v protokolech HTTP/2 (HPACK) a HTTP/3 (QPACK).",
        detail: "Místo opakovaného odesílání dlouhých řetězců User-Agent, Accept nebo Cookie je odkazují na dynamické a statické slovníky indexů. QPACK byl upraven speciálně pro QUIC tak, aby ztráta UDP paketu nerozbila stav dekomprese ostatním streamům.",
        relatedTopicId: "http-versions"
      },
      {
        term: "HTTP / HTTP/2 / HTTP/3",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Aplikační protokol World Wide Webu (TCP 80, HTTPS/HTTP3 port 443) pro přenos webových stránek a API rozhraní.",
        detail: "Vyvíjel se od textového HTTP/1.1 (Keep-Alive) přes binární a multiplexované HTTP/2 (HPACK) až po moderní HTTP/3 běžící nad QUIC (UDP 443) se zabudovaným TLS 1.3 a bez TCP HoL blokování.",
        relatedTopicId: "http-versions"
      },
      {
        term: "ICMP",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Internet Control Message Protocol (IP protokol č. 1) – servisní a diagnostický protokol síťové vrstvy bez portů TCP/UDP.",
        detail: "Nepřenáší uživatelská data, nýbrž stavové a chybové zprávy (Echo Request/Reply pro ping, Time Exceeded pro traceroute, Destination Unreachable při chybě doručení). V IPv6 plní jeho roli rozšířený ICMPv6 (včetně NDP).",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "IGP / EGP",
        category: "RIP, OSPF & BGP",
        shortDef: "Rozdělení dynamických směrovacích protokolů na vnitřní IGP (uvnitř jednoho AS – RIP, OSPF, EIGRP) a vnější EGP (mezi AS – BGP).",
        detail: "Protokoly IGP cílí na rychlou reakci na výpadky a optimální využití interních linek firmy nebo ISP. Protokol BGP (EGP) naopak škáluje na statisíce prefixů Internetu a upřednostňuje směrovací politiky a obchodní smlouvy.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "Iterativní a rekurzivní DNS dotaz",
        category: "DNS, DHCP & NTP",
        shortDef: "Dva způsoby dotazování v DNS: klient žádá finální výsledek (rekurze), zatímco resolver postupně obchází hierarchii od kořene (iterace).",
        detail: "Klientské zařízení nastaví v dotazu příznak RD (Recursion Desired) směrem ke svému resolveru. Resolver pak iterativně oslovuje kořenový server (.), TLD a autoritu, které mu vrací odkazy (referrals) na další stupeň stromu.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "Keep-Alive (Trvalé spojení)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Mechanismus v HTTP/1.1 (výchozí) umožňující poslat více HTTP požadavků a odpovědí přes jedno již otevřené TCP spojení.",
        detail: "Eliminuje opakované režijní náklady na 3-Way Handshake a pomalý start TCP (Slow Start) pro každý obrázek či skript na stránce.",
        relatedTopicId: "http-versions"
      },
      {
        term: "Korelace logů a NTP",
        category: "DNS, DHCP & NTP",
        shortDef: "Sjednocení časových razítek ze všech prvků infrastruktury pomocí NTP, bez něhož nelze rekonstruovat průběh kybernetického útoku ani výpadku.",
        detail: "Pokud má firewall čas posunutý o 4 minuty oproti databázi a syslog serveru, nelze v nástrojích SIEM zjistit příčinnou souvislost událostí. Standardem v logování je ukládání času v UTC synchronizovaného přes NTP.",
        relatedTopicId: "ntp-time"
      },
      {
        term: "Lease Time (T1 / T2)",
        category: "DNS, DHCP & NTP",
        shortDef: "Časově omezená doba pronájmu IP adresy přidělené DHCP serverem, doplněná časovači obnovy T1 (50 %) a T2 (87,5 %).",
        detail: "V čase T1 kontaktuje klient původní server unicastem. Neuspěje-li, osloví v T2 broadcastem jakýkoli DHCP server v síti. Po uplynutí 100 % Lease Time bez prodloužení nesmí stanice IP adresu dále používat.",
        relatedTopicId: "dhcp-dora"
      },
      {
        term: "Link-State (LSDB / LSA)",
        category: "RIP, OSPF & BGP",
        shortDef: "Princip směrování (např. v OSPF), kde si každý router složí kompletní topologickou mapu sítě (LSDB) ze stavových zpráv sousedů (LSA).",
        detail: "Namísto předávání hotových směrovacích tabulek si routery vymění pouze popisy stavu svých linek a cen. Na základě shodné LSDB si pak každý sám Dijkstrovým algoritmem nezávisle vypočítá optimální trasy.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "LOCAL_PREF",
        category: "RIP, OSPF & BGP",
        shortDef: "Atribut protokolu BGP šířený uvnitř jednoho autonomního systému (iBGP), který určuje preferovaný bod odchodu provozu ze sítě.",
        detail: "Výchozí hodnota bývá 100 a vyhrává trasa s NEJVYŠŠÍ hodnotou LOCAL_PREF. Vyhodnocuje se ještě před délkou AS_PATH, takže operátor jejím zvýšením snadno přesměruje odchozí provoz přes výhodnější peeringovou linku.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "MAC adresa",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Jedinečná 48bitová fyzická adresa síťového rozhraní zapisovaná hexadecimálně (např. 00:1A:2B:3C:4D:5E) pro doručování rámců na L2.",
        detail: "Prvních 24 bitů určuje výrobce (OUI), zbylých 24 bitů sériové číslo karty. Na rozdíl od IP adresy se MAC adresa mění na každém směrovači, kterým paket projde – vždy platí jen pro aktuální lokální segment sítě.",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "MED (Multi-Exit Discriminator)",
        category: "RIP, OSPF & BGP",
        shortDef: "Nepovinný atribut BGP, kterým náš autonomní systém doporučuje sousednímu AS, přes které z paralelních propojení k nám má posílat provoz.",
        detail: "Na rozdíl od LOCAL_PREF vyhrává NEJNIŽŠÍ hodnota MED (čím menší „vstupní metrika“, tím lépe). Porovnává se standardně pouze u tras přicházejících ze stejného sousedního autonomního systému.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "MTU / MSS",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Maximální velikost přenosové jednotky na lince (MTU – u Ethernetu 1500 B) a maximální užitečný náklad jednoho TCP segmentu (MSS – typicky 1460 B).",
        detail: "MSS se rovná MTU minus velikost IP a TCP hlaviček (1500 − 20 − 20 = 1460 bajtů). Správně vyjednané MSS při 3-Way Handshaku zabraňuje pomalé a problémové fragmentaci paketů na směrovačích po cestě (Path MTU Discovery).",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "Multiplexing (L4 a HTTP/2)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Současné sdílení jediného komunikačního kanálu více nezávislými datovými toky nebo aplikacemi.",
        detail: "Na transportní vrstvě umožňuje multiplexing pomocí portů (soketů) běžet desítkám programů nad jednou IP kartou. V protokolu HTTP/2 a HTTP/3 pak označuje souběžný přenos mnoha souborů v jediném spojení pomocí číslovaných streamů.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "MX záznam",
        category: "DNS, DHCP & NTP",
        shortDef: "Mail Exchanger – DNS záznam určující doménové jméno poštovního serveru přijímajícího e-maily pro danou doménu a jeho prioritu.",
        detail: "Nižší číslo priority znamená vyšší přednost (např. MX 10 je primární server, MX 20 záložní). Jméno v MX musí ukazovat přímo na záznam A nebo AAAA, nikoli na alias CNAME.",
        relatedTopicId: "dns-protocol"
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
