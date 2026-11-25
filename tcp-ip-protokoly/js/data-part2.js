/**
 * OP4 • Protokoly TCP/IP
 * Část 2: Témata 09–16 a Slovníček pojmů (část 2: N–Z)
 */
(function (global) {
  'use strict';

  global.__OP4_DATA_PART2__ = {
    topics: [
      // =========================================================================
      // TÉMA 09: HTTPS a TLS 1.3 (PKI, X.509, ECDHE, SNI, ALPN, HSTS)
      // =========================================================================
      {
        id: "https-tls",
        number: 9,
        moduleId: "web-mail-protocols",
        mandatory: true,
        title: "HTTPS a TLS 1.3: PKI, certifikáty X.509 a šifrovaný handshake",
        shortTitle: "HTTPS & TLS 1.3",
        subtitle: "TCP 443, cíle (důvěrnost, integrita, autentizace), PKI a CA, X.509, ECDHE Forward Secrecy, AES-GCM/ChaCha20, 1-RTT handshake, SNI, ALPN a HSTS.",
        cardSummary: "TLS 1.3 handshake (1-RTT), certifikáty X.509, PKI, ECDHE Forward Secrecy, SNI, ALPN a HSTS.",
        difficulty: "Střední",
        accentColor: "#9333ea",
        tags: ["TLS 1.3", "X.509 certifikát", "PKI", "SNI", "OCSP / OCSP Stapling", "SAN"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/https-tls.mp4",
          poster: "media/posters/https-tls.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. TLS 1.3 1-RTT handshake a ECDHE (0:00)", time: 0 },
            { label: "2. Ověření X.509 přes PKI, SNI a HSTS (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: TLS 1.3 handshake – „Zabezpečené HTTPS pomocí TLS rychle dohodne šifrovací klíče hned při navázání spojení.“\n0:07–0:13: PKI, SNI a HSTS – „Digitální certifikát přitom ověří pravost serveru, takže nikdo po cestě nemůže hesla odposlechnout.“"
        },
        animationType: "https-tls",
        labType: "tls-handshake-sim",
        learningObjectives: [
          "Vysvětlíš tři základní bezpečnostní cíle TLS (důvěrnost, integrita, autentizace serveru) a roli PKI s certifikačními autoritami.",
          "Popíšeš průběh rychlého 1-RTT handshaku v TLS 1.3 včetně výměny klíčů ECDHE (Forward Secrecy) a přechodu na symetrické šifrování AES-GCM / ChaCha20.",
          "Objasníš praktický význam rozšíření SNI (více domén na jedné IP), ALPN (výběr HTTP/2) a hlavičky HSTS proti downgrade útokům."
        ],
        takeaways: [
          "HTTPS není samostatný aplikační protokol, ale protokol HTTP zabalený do šifrovací vrstvy TLS na portu TCP 443 (u HTTP/3 pak QUIC/TLS nad UDP 443), který zajišťuje důvěrnost, integritu i autentizaci serveru.",
          "Důvěryhodnost identity serveru garantuje infrastruktura PKI: server předloží digitální certifikát X.509 (s doménami v poli SAN) podepsaný certifikační autoritou (CA), jejíž kořenový certifikát má prohlížeč v lokálním úložišti.",
          "TLS 1.3 zkracuje navázání šifrovaného spojení na pouhý 1-RTT a povinně používá efemérní výměnu klíčů ECDHE (Forward Secrecy), ze které se odvodí rychlá symetrická AEAD šifra (AES-GCM nebo ChaCha20-Poly1305).",
          "Rozšíření SNI v nešifrovaném ClientHello umožňuje hostovat stovky HTTPS webů na jediné IP adrese, ALPN vyjedná verzi protokolu (h2) bez prodlevy a hlavička HSTS zakazuje návrat k nešifrovanému HTTP."
        ],
        principle: {
          problem: "Otevřené HTTP na portu 80 posílá hesla, soubory cookie i obsah stránek v čistém textu — kdokoli na veřejné Wi-Fi nebo na trase u ISP je může přečíst či podvrhnout reklamou nebo malwarem. Jak prohlížeč naváže s neznámým webem bleskově bezpečný kanál, aniž by uživatel musel předem znát sdílené heslo?",
          explanation: [
            "Protokol TLS (Transport Layer Security, aktuálně ve verzi 1.3 podle RFC 8446) plní tři klíčové úkoly: 1) Důvěrnost — veškerá aplikační data jsou šifrována tak, aby je odposlouchávající útočník nepřečetl. 2) Integrita — každý záznam nese kryptografický ověřovací tag (AEAD), takže jakákoli změna byť jediného bitu po cestě je okamžitě odhalena. 3) Autentizace — klient s jistotou ví, že komunikuje se skutečným vlastníkem domény (a v podnikovém režimu mTLS se certifikátem prokazuje i klient serveru).",
            "Autentizace stojí na infrastruktuře veřejných klíčů PKI (Public Key Infrastructure). Server vlastní certifikát standardu X.509, který kromě jeho veřejného klíče obsahuje název domény v poli SAN (Subject Alternative Name), dobu platnosti a digitální podpis vydavatele (CA — např. Let's Encrypt, DigiCert). Prohlížeč ověří celý řetězec důvěry (Chain of Trust): listový certifikát serveru → zprostředkující Intermediate CA → kořenová Root CA uložená v operačním systému nebo prohlížeči. Zda certifikát nebyl předčasně zneplatněn, ověřuje přes CRL nebo modernější OCSP / OCSP Stapling (server přikládá časově podepsané potvrzení od CA přímo do handshaku).",
            "Vlastní TLS 1.3 handshake kombinuje asymetrickou a symetrickou kryptografii. Asymetrická kryptografie je výpočetně náročná, proto slouží pouze k ověření podpisu a bezpečné domluvě dočasného tajemství. V TLS 1.3 posílá klient hned v první zprávě ClientHello seznam šifer, své rozšíření SNI (cílové jméno domény, aby server s více weby na jedné IP věděl, který certifikát vrátit), ALPN (nabídka h2 / http/1.1) a rovnou i svůj veřejný klíčový podíl key_share pro výměnu ECDHE. Server odpoví zprávou ServerHello se svým podílem ECDHE, zašifrovaným certifikátem, jeho podpisem (CertificateVerify) a zprávou Finished. Celé vyjednání tak zabere jediný 1-RTT (oproti 2-RTT v TLS 1.2) a přináší vlastnost Perfect Forward Secrecy (PFS): pro každou relaci vznikají nové efemérní klíče, takže ani pozdější krádež privátního klíče serveru neumožní dešifrovat dříve zaznamenaný provoz.",
            "Jakmile obě strany z výměny ECDHE odvodí (pomocí funkce HKDF) společný symetrický relační klíč, přepnou komunikaci na bleskovou AEAD šifru (AES-128/256-GCM na procesorech s hardwarovou akcelerací AES-NI nebo ChaCha20-Poly1305 na mobilních ARM zařízeních bez AES instrukcí). Pro ochranu prvního požadavku před SSL-stripping útokem (kde útočník zachytí přesměrování z http:// na https://) posílá server HTTP hlavičku HSTS (Strict-Transport-Security), která prohlížeči nařídí připojovat se k doméně po stanovenou dobu výhradně přes HTTPS a nedovolit uživateli kliknutím obejít neplatný certifikát."
          ],
          steps: [
            {
              step: "1. TCP 3-Way Handshake a ClientHello (1-RTT start)",
              detail: "Klient otevře TCP spojení na port 443 a odešle ClientHello obsahující podporované sady šifer, rozšíření SNI (název domény), ALPN (např. h2) a svůj ECDHE key_share."
            },
            {
              step: "2. ServerHello, certifikát X.509 a podpis",
              detail: "Server vybere shodu, vrátí svůj ECDHE key_share v ServerHello, a z odvozeného handshake klíče už šifruje své rozšíření (ALPN), řetězec certifikátů X.509 a podpis CertificateVerify."
            },
            {
              step: "3. Ověření řetězce CA a výpočet symetrických klíčů",
              detail: "Klient ověří podpis certifikátu vůči důvěryhodné Root CA, zkontroluje shodu domény v SAN a platnost data; zároveň z ECDHE odvodí symetrický relační klíč AES-GCM nebo ChaCha20."
            },
            {
              step: "4. Finished a šifrovaný přenos HTTPS (+ HSTS)",
              detail: "Klient pošle Finished a ihned za ním může odeslat první šifrovaný HTTP požadavek. Server odpovídá daty a v hlavičce HSTS zafixuje HTTPS pro další návštěvy."
            }
          ],
          analogy: "Představte si TLS handshake jako ověřené předání bezpečnostního kufříku: přes SNI řeknete na recepci hotelu, za kterým hostem jdete, recepce vám ukáže jeho občanku potvrzenou státním úřadem (X.509 certifikát od CA) a společně si na místě namícháte jednorázový číselný kód zámku (ECDHE Forward Secrecy), který ani po zničení staré občanky nikdo zpětně nerozluští.",
          comparisonTable: {
            headers: ["Parametr", "TLS 1.2 (starší)", "TLS 1.3 (moderní RFC 8446)", "Bez TLS (čisté HTTP)"],
            rows: [
              ["Délka handshaku", "2-RTT (dvě cesty tam a zpět)", "1-RTT (volitelně 0-RTT resumption)", "0 (žádné šifrování)"],
              ["Výměna klíčů", "RSA (bez PFS) nebo ECDHE", "Výhradně efemérní ECDHE / DHE (vždy PFS)", "Žádná"],
              ["Podporované šifry", "I starší CBC, RC4, SHA-1 (nutné zakázat)", "Jen moderní AEAD (AES-GCM, ChaCha20-Poly1305)", "Plain-text"],
              ["Šifrování certifikátu", "Certifikát posílán nešifrovaně", "Certifikát i ServerExtensions jsou šifrované", "Neexistuje"],
              ["Ochrana integrity", "Oddělený HMAC (zranitelné padding oracles)", "Vestavěná AEAD autentizace v šifře", "Žádná"]
            ]
          },
          watchOut: "Pozor na dva časté omyly: 1) Rozšíření SNI (název cílové domény) je v klasickém TLS 1.3 stále viditelné v nešifrovaném ClientHello, takže poskytovatel internetu vidí, na jakou doménu se připojujete (řeší až moderní rozšíření ECH – Encrypted Client Hello). 2) Nikdy nevystavujte privátní klíč serveru (`privkey.pem`) do Gitu ani veřejné složky a vždy konfigurujte úplný řetězec (`fullchain.pem` = certifikát + Intermediate CA), jinak mobilní prohlížeče a `curl` vyhodí chybu nedůvěryhodného certifikátu."
        },
        example: {
          scenarioTitle: "Inspekce TLS 1.3 certifikátu přes OpenSSL a produkční HTTPS konfigurace v Nginx",
          scenarioText: "Správce ověřuje, zda webový server vrací správný certifikát pro dané SNI, podporuje TLS 1.3 s Forward Secrecy, vyjednává HTTP/2 přes ALPN a posílá bezpečnostní hlavičku HSTS.",
          codeBlocks: [
            {
              label: "Ověření TLS 1.3, SNI, ALPN a řetězce certifikátu nástrojem openssl",
              lang: "bash",
              code: "$ openssl s_client -connect www.firma.cz:443 -servername www.firma.cz -alpn h2 -tls1_3 </dev/null 2>/dev/null | grep -E \"Protocol|Cipher|ALPN|Verify return|subject=|issuer=\"\nsubject=CN = www.firma.cz\nissuer=C = US, O = Let's Encrypt, CN = R11\n    Protocol  : TLSv1.3\n    Cipher    : TLS_AES_256_GCM_SHA384\n    ALPN protocol: h2\n    Verify return code: 0 (ok)\n\n# Rychla kontrola platnosti a SAN domen ziskanych z certifikatu\n$ echo | openssl s_client -servername www.firma.cz -connect www.firma.cz:443 2>/dev/null | openssl x509 -noout -dates -ext subjectAltName"
            },
            {
              label: "Konfigurace HTTPS s TLS 1.3, ECDHE, OCSP Stapling a HSTS v Nginx",
              lang: "nginx",
              code: "server {\n    listen 443 ssl;\n    http2 on;\n    server_name www.firma.cz;\n\n    ssl_certificate     /etc/letsencrypt/live/www.firma.cz/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/www.firma.cz/privkey.pem;\n    ssl_protocols       TLSv1.2 TLSv1.3;\n    ssl_stapling        on;\n    ssl_stapling_verify on;\n\n    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;\n}"
            }
          ],
          practicalTip: "Když jeden Apache/Nginx server obsluhuje více domén na jedné veřejné IP adrese, nezapomeňte u testování přes `curl` nebo `openssl s_client` zadat doménové jméno (ne jen IP adresu) nebo přepínač `-servername`, aby server přes SNI vybral správný X.509 certifikát."
        },
        quiz: [
          {
            question: "Co zajišťuje vlastnost Forward Secrecy (PFS) u výměny klíčů ECDHE v protokolu TLS 1.3?",
            options: [
              "Pro každé spojení se vytváří jednorázové efemérní klíče, takže ani budoucí kompromitace privátního klíče serveru neumožní dešifrovat dříve odchycenou komunikaci.",
              "Zaručuje, že prohlížeč už nikdy nemusí ověřovat certifikační autoritu.",
              "Umožňuje přeposlat ztracené TCP pakety bez jejich opětovného vyžádání.",
              "Automaticky obnoví vypršelý certifikát X.509 o dalších 90 dní."
            ],
            correctIndex: 0,
            explanation: "ECDHE generuje dočasné (efemérní) páry klíčů pouze pro konkrétní relaci a po jejím skončení je zahodí. Starší záznamy provozu proto nelze rozšifrovat ani při pozdějším úniku dlouhodobého privátního klíče serveru."
          },
          {
            question: "K čemu slouží rozšíření SNI (Server Name Indication) během TLS handshaku?",
            options: [
              "Šifruje hlavičku HTTP Cookie v těle požadavku.",
              "Umožňuje klientovi sdělit název cílové domény hned v ClientHello, aby server s více weby na jedné IP adrese mohl odeslat správný certifikát.",
              "Nahrazuje DNS překlad dotazem přímo na kořenovou CA.",
              "Vypíná kontrolu platnosti certifikátu u lokálních testovacích webů."
            ],
            correctIndex: 1,
            explanation: "Protože server musí vybrat správný certifikát ještě před rozšifrováním HTTP požadavku (kde je hlavička Host), potřebuje znát požadované doménové jméno už v zprávě ClientHello pomocí rozšíření SNI."
          },
          {
            question: "Jakou roli plní HTTP hlavička HSTS (Strict-Transport-Security)?",
            options: [
              "Zrychluje přenos statických obrázků vypnutím kontroly integrity.",
              "Přepíná spojení z TCP 443 zpět na nešifrovaný port 80 pro úsporu procesoru.",
              "Přikazuje prohlížeči, aby k dané doméně v zadaném období přistupoval výhradně přes HTTPS a zakázal obejití chyby certifikátu.",
              "Sděluje serveru, jakou verzi protokolu HTTP (1.1 nebo 2) klient podporuje."
            ],
            correctIndex: 2,
            explanation: "HSTS chrání uživatele před downgrade a SSL-stripping útoky: prohlížeč po přijetí hlavičky automaticky přepisuje i zadané http:// odkazy interně na https:// a odmítne neplatný certifikát."
          },
          {
            question: "Které rozšíření TLS slouží k vyjednání aplikačního protokolu (např. HTTP/2 `h2` vs. `http/1.1`) přímo během TLS handshaku bez ztráty času navíc?",
            options: [
              "OCSP Stapling",
              "CRL",
              "SAN",
              "ALPN"
            ],
            correctIndex: 3,
            explanation: "ALPN (Application-Layer Protocol Negotiation) umožňuje klientovi a serveru dohodnout aplikační protokol (h2, http/1.1) hned v rámci TLS handshaku."
          }
        ]
      },

      // =========================================================================
      // TÉMA 10: Poštovní protokoly (SMTP, IMAP4, POP3, MX, SPF/DKIM/DMARC)
      // =========================================================================
      {
        id: "mail-smtp-imap-pop3",
        number: 10,
        moduleId: "web-mail-protocols",
        mandatory: true,
        title: "Poštovní protokoly: SMTP, IMAP4, POP3 a zabezpečení pošty",
        shortTitle: "SMTP, IMAP4 & POP3",
        subtitle: "Odesílání a přenos SMTP (TCP 25, 587, 465), DNS MX záznam, vybírání IMAP4 (143/993) vs. POP3 (110/995) a ochrana SPF, DKIM, DMARC.",
        cardSummary: "Odesílání přes SMTP (25/587/465) a MX záznamy, výběr IMAP4 vs. POP3 a ochrana SPF/DKIM/DMARC.",
        difficulty: "Střední",
        accentColor: "#c084fc",
        tags: ["SMTP / SMTPS", "STARTTLS", "POP3 / POP3S", "SPF", "MX záznam", "IMAP4"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/mail-smtp-imap-pop3.mp4",
          poster: "media/posters/mail-smtp-imap-pop3.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Cesta e-mailu přes SMTP a DNS MX (0:00)", time: 0 },
            { label: "2. IMAP4 vs. POP3 a ochrana SPF/DKIM/DMARC (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Odesílání přes SMTP – „Odeslaný e-mail putuje přes protokol SMTP, který si cílový poštovní server vyhledá v DNS.“\n0:07–0:13: IMAP4 vs. POP3 – „Protokol IMAP synchronizuje složky na serveru, POP3 zprávy stahuje a podpisy brání podvržení.“"
        },
        animationType: "mail-smtp-imap-pop3",
        labType: "mail-flow-sim",
        learningObjectives: [
          "Rozlišíš role a porty protokolu SMTP (25 server–server, 587 Submission se STARTTLS, 465 SMTPS) a popíšeš vyhledání cíle přes DNS MX záznam.",
          "Porovnáš protokoly pro příjem pošty IMAP4 (143/993) a POP3 (110/995) z hlediska synchronizace více zařízení a práce se složkami.",
          "Vysvětlíš princip ochrany domény před podvržením a spamem pomocí DNS záznamů SPF, DKIM a DMARC."
        ],
        takeaways: [
          "SMTP slouží výhradně k odesílání a přenosu pošty mezi servery: klienti (MUA) odesílají přes port 587 (Submission + STARTTLS) nebo 465 (SMTPS implicit TLS), zatímco poštovní servery (MTA) si zprávy předávají na portu TCP 25 podle DNS MX záznamu.",
          "Protokol IMAP4 (TCP 143 / šifrovaně IMAPS 993) uchovává poštu i složky přímo na serveru a synchronizuje stav přečtení mezi notebookem, mobilem i webmailem.",
          "Starší POP3 (TCP 110 / šifrovaně POP3S 995) stáhne zprávy z doručené pošty lokálně do jednoho zařízení a v základním režimu je ze serveru vymaže (neumí synchronizovat složky).",
          "Autentizaci odesílatele v DNS zajišťuje trojice mechanismů: SPF (seznam povolených IP serverů), DKIM (kryptografický podpis zprávy) a DMARC (politika p=none/quarantine/reject pro hlavičku From:)."
        ],
        principle: {
          problem: "E-mail je decentralizovaný systém — pošta ze školní adresy na doméně `skola.cz` musí spolehlivě doputovat do schránky příjemce na `seznam.cz`, umožnit čtení současně z telefonu i počítače a zabránit tomu, aby kdokoli z internetu posílal podvodné e-maily s vaší adresou odesílatele.",
          explanation: [
            "Elektronická pošta odděluje odesílání (push) od vybírání schránky (pull). Odesílání zajišťuje SMTP (Simple Mail Transfer Protocol). Když uživatel v poštovním klientu (MUA – Thunderbird, Outlook) klikne na Odeslat, klient se přihlásí ke svému odchozímu serveru (MSA) na portu TCP 587 (Submission s povinnou autentizací a šifrováním STARTTLS) nebo na portu TCP 465 (SMTPS – okamžité implicitní TLS od prvního paketu). Odesílající server (MTA) pak v DNS zjistí záznam MX (Mail Exchanger) cílové domény, přeloží jeho jméno na IP adresu a naváže spojení s cílovým MTA na portu TCP 25 (pokud oba podporují STARTTLS, přenos po internetu se zašifruje).",
            "Na cílovém serveru převezme zprávu MDA (Mail Delivery Agent) a uloží ji do schránky příjemce. K jejímu čtení slouží dva rozdílné protokoly. Moderní IMAP4 (Internet Message Access Protocol, nešifrovaně TCP 143 se STARTTLS, šifrovaně IMAPS TCP 993) funguje jako vzdálený pohled do schránky na serveru: e-maily i složky (Doručená, Odeslaná, Koš, vlastní archivy) zůstávají na serveru, klient si stahuje jen hlavičky či vyžádané zprávy a změny (přečteno, označeno hvězdičkou, přesun do složky) se okamžitě projeví na všech ostatních zařízeních uživatele.",
            "Naproti tomu starší POP3 (Post Office Protocol v3, nešifrovaně TCP 110, šifrovaně POP3S TCP 995) vychází z doby vytáčeného internetu: klient se připojí, stáhne všechny nové zprávy z jediné složky INBOX k sobě na disk a na serveru je příkazem DELE smaže. I když dnešní klienti umí nechat na serveru kopii několik dní, POP3 neumí synchronizovat odeslanou poštu, složky ani stav přečtení zpráv mezi mobilem a počítačem.",
            "Původní SMTP z 80. let neověřovalo, zda má odesílající server právo používat doménu v hlavičce From:. Proto vznikla trojice ochran publikovaná v DNS TXT záznamech: SPF (Sender Policy Framework) vymezuje veřejné IP adresy oprávněné posílat poštu za doménu; DKIM (DomainKeys Identified Mail) opatří zprávu digitálním podpisem z privátního klíče serveru, který příjemce ověří veřejným klíčem v DNS (chrání i před změnou textu po cestě); DMARC (Domain-based Message Authentication, Reporting and Conformance) nakonec sváže hlavičku From: s výsledkem SPF nebo DKIM a nařídí příjemci, zda podvrženou poštu přijmout s reportem (p=none), hodit do spamu (p=quarantine), nebo rovnou odmítnout (p=reject)."
          ],
          steps: [
            {
              step: "1. Odeslání zprávy od klienta (MUA → MSA na 587 / 465)",
              detail: "Poštovní klient se ověří jménem a heslem ke svému serveru přes port 587 (+ STARTTLS) nebo 465 (SMTPS) a předá e-mail k doručení."
            },
            {
              step: "2. Vyhledání cíle přes DNS MX a přenos MTA → MTA (TCP 25)",
              detail: "Odesílající server se dotáže DNS na MX záznam příjemcovy domény (např. priorita 10 mx1.cil.cz) a po portu TCP 25 přenese zprávu na cílový server."
            },
            {
              step: "3. Kontrola SPF, DKIM a DMARC na vstupu",
              detail: "Cílový MTA ověří zdrojovou IP vůči SPF, kryptografický podpis DKIM a vyhodnotí politiku DMARC; platnou zprávu uloží MDA do schránky."
            },
            {
              step: "4. Vybírání schránky přes IMAP4 (993) nebo POP3 (995)",
              detail: "Příjemce se připojí přes IMAPS (synchronizuje složky napříč zařízeními) nebo POP3S (stáhne zprávy lokálně na jedno PC)."
            }
          ],
          analogy: "SMTP je poštovní dodávka, která veze dopisy z vaší podací pošty (port 587) podle směrovacího seznamu (DNS MX) do třídírny adresáta (port 25). POP3 je jako vybrat si schránku u branky a odnést všechny dopisy domů do šuplíku, kdežto IMAP4 je jako cloudová kartotéka na poště, do které nahlížíte z domova, z práce i z mobilu a vidíte vždy stejný stav.",
          comparisonTable: {
            headers: ["Protokol / Role", "Standardní porty", "Šifrování", "Typické chování a použití"],
            rows: [
              ["SMTP (Server–Server)", "TCP 25", "Oportunistické STARTTLS", "Doručování mezi poštovními servery (MTA ↔ MTA) podle DNS MX"],
              ["SMTP Submission / SMTPS", "TCP 587 / TCP 465", "STARTTLS (587) / Implicit TLS (465)", "Bezpečné odesílání přihlášeného klienta na svůj odchozí server"],
              ["IMAP4 / IMAPS", "TCP 143 / TCP 993", "STARTTLS (143) / Implicit TLS (993)", "Práce se složkami přímo na serveru, synchronizace více zařízení"],
              ["POP3 / POP3S", "TCP 110 / TCP 995", "STARTTLS (110) / Implicit TLS (995)", "Stažení zpráv z INBOXu do jednoho klienta a typicky smazání ze serveru"]
            ]
          },
          watchOut: "Pozor na tři věci v praxi: 1) Port TCP 25 neslouží pro připojení běžného poštovního klienta z domácí sítě (většina ISP ho na odchozím směru blokuje proti spamovým botnetům) — v klientech nastavujte vždy port 587 nebo 465. 2) Záměna POP3 a IMAP při nastavení nového telefonu může způsobit, že telefon zprávy stáhne a ze serveru smaže, takže zmizí z firemního počítače! 3) Nikdy nepoužívejte holý nešifrovaný port 110 nebo 143 bez TLS/STARTTLS."
        },
        example: {
          scenarioTitle: "Diagnostika DNS MX/SPF/DMARC a test komunikace SMTP (587) a IMAPS (993)",
          scenarioText: "Správce poštovního serveru ověřuje MX záznamy a protispamové TXT záznamy cílové domény a následně testuje zabezpečené připojení k odesílání přes SMTP Submission i čtení schránky přes IMAPS.",
          codeBlocks: [
            {
              label: "Zjištění MX záznamů a kontrola SPF / DMARC v DNS pomocí dig",
              lang: "bash",
              code: "# 1) Kam se ma dorucovat posta pro domenu firma.cz (nizsi cislo = vyssi priorita)\n$ dig +short MX firma.cz\n10 mx1.firma.cz.\n20 mx2.firma.cz.\n\n# 2) Ktere servery smi za domenu odesilat (SPF) a jaka je politika DMARC\n$ dig +short TXT firma.cz\n\"v=spf1 mx ip4:198.51.100.25 -all\"\n$ dig +short TXT _dmarc.firma.cz\n\"v=DMARC1; p=reject; rua=mailto:dmarc-report@firma.cz\""
            },
            {
              label: "Ukázka SMTP relace (Submission 587) a IMAP4 dotazu přes TLS",
              lang: "text",
              code: "# --- SMTP Submission (TCP 587 + STARTTLS) ---\nS: 220 mail.firma.cz ESMTP Postfix\nC: EHLO klient.doma.cz\nS: 250-STARTTLS\nS: 250 AUTH PLAIN LOGIN\nC: STARTTLS\nS: 220 2.0.0 Ready to start TLS\n... (po zasifrovani nasleduje AUTH, MAIL FROM:<jan@firma.cz>, RCPT TO:<petr@cil.cz>, DATA) ...\n\n# --- IMAPS (TCP 993) prace se slozkou INBOX na serveru ---\nC: a1 LOGIN jan@firma.cz TajneHeslo\nS: a1 OK Logged in\nC: a2 SELECT INBOX\nS: * 42 EXISTS\nC: a3 FETCH 42 BODY[HEADER.FIELDS (FROM SUBJECT)]\nC: a4 LOGOUT"
            }
          ],
          practicalTip: "Pokud vaše e-maily končí příjemcům ve spamu, v 90 % případů chybí nebo nesedí jeden ze čtyř údajů: reverzní DNS záznam (`PTR`) k veřejné IP adrese serveru, `SPF` záznam zahrnující IP serveru, funkční `DKIM` podpis nebo navazující `DMARC` záznam."
        },
        quiz: [
          {
            question: "Který DNS záznam určuje cílový poštovní server pro příjem e-mailů dané domény?",
            options: [
              "Záznam PTR",
              "Záznam MX (Mail Exchanger)",
              "Záznam CNAME",
              "Záznam AAAA"
            ],
            correctIndex: 1,
            explanation: "Odesílající SMTP server se nejprve dotáže DNS na záznam typu MX pro cílovou doménu, čímž získá název poštovního serveru a jeho prioritu."
          },
          {
            question: "Proč se pro dnešní použití na více zařízeních (PC, mobil, webmail) používá IMAP4 (993) místo POP3 (995)?",
            options: [
              "POP3 neumí posílat přílohy větší než 100 KB.",
              "IMAP4 je výrazně rychlejší, protože vůbec nepoužívá protokol TCP.",
              "IMAP4 ponechává e-maily i složky na serveru a synchronizuje stav přečtení napříč všemi zařízeními.",
              "IMAP4 nepotřebuje pro přihlášení uživatelské jméno ani heslo."
            ],
            correctIndex: 2,
            explanation: "IMAP4 pracuje se schránkou přímo na serveru (složky, příznaky přečteno/označeno), zatímco POP3 ve výchozím nastavení zprávy stáhne do jednoho zařízení a na serveru je vymaže."
          },
          {
            question: "Který TCP port je určen přímo pro bezpečné odesílání pošty z klientského programu (MUA → MSA) s autentizací a STARTTLS?",
            options: [
              "TCP 587 (Submission)",
              "TCP 110",
              "TCP 993",
              "TCP 21"
            ],
            correctIndex: 0,
            explanation: "Pro odesílání pošty od koncových klientů (MUA) slouží port TCP 587 (Submission se STARTTLS) nebo TCP 465 (implicitní SMTPS). Port 25 je určen pro přenos mezi poštovními servery (MTA)."
          },
          {
            question: "Jaký je rozdíl mezi mechanismy SPF a DKIM?",
            options: [
              "SPF šifruje přílohy, DKIM maže spam ze schránky.",
              "SPF definuje v DNS oprávněné IP adresy odesílajících serverů, kdežto DKIM připojuje ke zprávě kryptografický podpis ověřitelný veřejným klíčem v DNS.",
              "SPF funguje pouze pro protokol POP3 a DKIM pouze pro IMAP4.",
              "Mezi SPF a DKIM není žádný rozdíl, jde o dva názvy téhož záznamu."
            ],
            correctIndex: 1,
            explanation: "SPF kontroluje, zda zpráva přišla z povolené IP adresy domény, zatímco DKIM podepisuje hlavičky a obsah e-mailu soukromým klíčem, takže přežije i přeposlání zprávy přes jiný server."
          }
        ]
      },

      // =========================================================================
      // TÉMA 11: FTP (Aktivní vs. Pasivní režim) a FTPS
      // =========================================================================
      {
        id: "ftp-active-passive-ftps",
        number: 11,
        moduleId: "files-shares-protocols",
        mandatory: true,
        title: "FTP: Aktivní (PORT) vs. Pasivní (PASV) režim a zabezpečení FTPS",
        shortTitle: "FTP, PASV & FTPS",
        subtitle: "Oddělení řídicího (TCP 21) a datového kanálu, proč Aktivní režim (PORT/20) selhává za NATem, Pasivní PASV/EPSV a Explicit vs. Implicit FTPS.",
        cardSummary: "Řídicí (21) a datový kanál FTP, aktivní PORT vs. pasivní PASV přes NAT a šifrované FTPS.",
        difficulty: "Střední",
        accentColor: "#0ea5e9",
        tags: ["FTP (TCP 21/20)", "Pasivní režim FTP (PASV / EPSV)", "NAT / PAT", "X.509 certifikát", "SFTP (SSH File Transfer Protocol)", "STARTTLS"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/ftp-active-passive-ftps.mp4",
          poster: "media/posters/ftp-active-passive-ftps.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Aktivní (PORT/20) vs. Pasivní (PASV) režim (0:00)", time: 0 },
            { label: "2. FTPS (Explicit vs. Implicit) vs. SFTP (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Aktivní vs. Pasivní FTP – „Protokol FTP odděluje příkazy od dat, a protože aktivní režim blokuje překlad, vítězí pasivní.“\n0:07–0:13: FTPS a SFTP – „Zabezpečené FTPS pak přidává šifrování buď přímo na řídicím portu, nebo na vyhrazeném portu.“"
        },
        animationType: "ftp-active-passive-ftps",
        labType: "ftp-mode-sim",
        learningObjectives: [
          "Vysvětlíš architekturu FTP se dvěma oddělenými TCP spojeními (řídicí kanál TCP 21 vs. datový kanál pro soubory i výpisy adresářů).",
          "Zdůvodníš, proč Aktivní režim FTP (PORT / server ze zdroje TCP 20) selhává za NATem a firewallem klienta, zatímco Pasivní režim (PASV/EPSV) spolehlivě projde.",
          "Odlišíš nešifrované FTP, Explicit FTPS (TCP 21 + AUTH TLS), Implicit FTPS (TCP 990) a zcela odlišný protokol SFTP (TCP 22)."
        ],
        takeaways: [
          "Na rozdíl od většiny ostatních protokolů používá FTP dvě oddělená TCP spojení: stálé řídicí spojení (TCP 21) pro příkazy a samostatné datové spojení pro každý přenos souboru či výpis adresáře (LIST).",
          "V Aktivním režimu (PORT) posílá klient svou IP a port a server se ze svého portu TCP 20 připojuje zpět směrem ke klientovi — toto zpětné příchozí spojení blokuje klientský firewall i NAT.",
          "V Pasivním režimu (PASV / EPSV) otevře dočasný port server a klient navazuje obě spojení směrem ven, což bezpečně funguje přes klientský NAT i stavové firewally.",
          "Klasické FTP přenáší hesla i data nešifrovaně; zabezpečená varianta FTPS používá TLS buď jako Explicit FTPS (port 21 + AUTH TLS), nebo zastaralejší Implicit FTPS (port 990)."
        ],
        principle: {
          problem: "Přihlásili jste se z kancelářské sítě na vzdálený FTP server na portu 21 — přihlášení proběhlo v pořádku, ale při prvním pokusu o výpis složky (`ls` / `LIST`) nebo stažení souboru připojení zamrzne a po minutě spadne na chybu `425 Can't open data connection`. Proč se spojení zaseklo, když heslo prošlo?",
          explanation: [
            "Protokol FTP (File Transfer Protocol) vznikl v 70.–80. letech s unikátní dvoukolejnou architekturou: odděluje řídicí spojení (Control Connection) od datového spojení (Data Connection). Řídicí kanál naváže klient na cílový port serveru TCP 21 a po něm běží pouze textové příkazy (USER, PASS, CWD, LIST, RETR, STOR) a třímístné stavové kódy (220, 331, 230, 425). Jakmile ale chcete stáhnout soubor nebo jen vypsat obsah složky příkazem LIST, musí se otevřít druhé, zcela nezávislé TCP spojení pro data!",
            "Právě směr navázání tohoto druhého datového spojení rozděluje FTP na Aktivní a Pasivní režim. V Aktivním režimu klient po řídicím kanálu pošle příkaz PORT se svou IP adresou a číslem naslouchajícího portu. Server pak aktivně ze svého zdrojového portu TCP 20 (`ftp-data`) zahájí nové TCP spojení zpět k počítači klienta. Dnes je ale prakticky každý klient skrytý za NAT routerem a osobním firewallem: firewall příchozí spojení z internetu zahodí jako nevyžádané a klient za NATem navíc často oznámí svou neveřejnou adresu `192.168.1.x`, která je z internetu nedosažitelná (proto výpis `LIST` zamrzne, i když port 21 prošel).",
            "Řešením je Pasivní režim (příkaz `PASV` pro IPv4 nebo `EPSV` pro IPv4/IPv6). Místo příkazu PORT klient řekne serveru `PASV`. Server na své straně otevře náhodný efemérní port (např. z rozsahu `40000–40100`) a pošle jeho číslo klientovi v odpovědi `227 Entering Passive Mode (ip,ip,ip,ip,p1,p2)`. Nyní to je klient, kdo iniciuje i druhé datové spojení směrem ven na oznámený port serveru! Stavový firewall klienta i NAT s tím nemají žádný problém. Na straně serveru však správce musí ve firewallu povolit kromě portu 21 i celý nakonfigurovaný rozsah pasivních portů.",
            "Jelikož standardní FTP posílá uživatelská jména, hesla i soubory jako čistý plain-text, nasazuje se zabezpečená verze FTPS (FTP over TLS). Moderní standard je Explicit FTPS (FTPES): spojení začne na standardním portu TCP 21, klient pošle příkaz `AUTH TLS`, provede TLS handshake a následně příkazem `PROT P` (Private) zapne šifrování i pro datové kanály (pozor: zašifrovaný řídicí kanál nevidí staré FTP ALG helpery v NAT routerech, proto musí pasivní rozsah serveru vracet veřejnou IP!). Starší Implicit FTPS používá pevný port TCP 990 (řídicí) a 989 (datový), kde TLS startuje okamžitě bez vyjednávání. Zcela jiným protokolem je SFTP, který běží nad SSH na jediném portu TCP 22 a s FTP nesdílí vůbec nic."
          ],
          steps: [
            {
              step: "1. Navázání řídicího kanálu na TCP 21 (+ volitelné AUTH TLS)",
              detail: "Klient se připojí na TCP 21. U Explicit FTPS odešle AUTH TLS, ověří X.509 certifikát serveru, přihlásí se (USER/PASS) a zapne šifrování dat (PROT P)."
            },
            {
              step: "2. Výběr režimu přenosu (Aktivní PORT vs. Pasivní PASV/EPSV)",
              detail: "Před přenosem souboru nebo výpisem složky (LIST) se musí domluvit parametry datového kanálu."
            },
            {
              step: "3A. Aktivní větev (PORT): Server z TCP 20 → Klient",
              detail: "Klient pošle svou IP a port; server se připojí ze zdroje TCP 20 zpět ke klientovi. Za NATem a firewallem klienta toto spojení typicky selže."
            },
            {
              step: "3B. Pasivní větev (PASV): Klient → Efemérní port serveru",
              detail: "Server nahlásí volný pasivní port (např. 40025) a klient iniciuje datové spojení směrem ven — projde přes NAT i klientský firewall."
            }
          ],
          analogy: "Aktivní FTP je jako když zavoláte na pizzerii (port 21), ale kurýr odmítne nechat pizzu u brány a chce vstoupit až do vašeho zamčeného bytu (port 20 zpět k vám), kde ho zastaví vrátný (NAT a firewall). Pasivní FTP znamená, že vám pizzerie dá číslo výdejního okénka (port 40025) a vy si pro krabici dojdete sami směrem ven.",
          comparisonTable: {
            headers: ["Režim / Varianta", "Řídicí port", "Datový port a směr navázání", "Šifrování & Průchod přes klientský NAT"],
            rows: [
              ["Aktivní FTP (PORT)", "TCP 21", "Server (zdroj TCP 20) → Klient (N+1)", "Nešifrované; za klientským NATem/FW obvykle selhává"],
              ["Pasivní FTP (PASV/EPSV)", "TCP 21", "Klient → Server (rozsah např. 40000–40100)", "Nešifrované; prochází přes NAT klienta bez potíží"],
              ["Explicit FTPS (FTPES)", "TCP 21 (+ AUTH TLS)", "Klient → Server (pasivní rozsah + PROT P)", "TLS šifrování řízení i dat (vyžaduje veřejnou IP v PASV)"],
              ["Implicit FTPS", "TCP 990 (ihned TLS)", "Klient → Server (často TCP 989 / PASV)", "TLS od prvního bajtu (starší varianta nahrazená Explicit FTPS)"],
              ["SFTP (SSH subsystém)", "TCP 22 (jediný port!)", "Žádný druhý port — vše v jednom SSH kanálu", "Šifrované SSH; nejlepší volba pro firewally a NAT"]
            ]
          },
          watchOut: "Při nasazování FTPS (Explicit FTPS) za firemním NATem na straně serveru nespoléhejte na automatický FTP ALG helper routeru! Protože řídicí kanál na portu 21 je po příkazu `AUTH TLS` zašifrovaný, router do něj nevidí, neumí přepsat privátní IP v odpovědi `227 PASV` ani dynamicky otvírat porty. V konfiguraci FTP serveru (např. vsftpd/ProFTPD) musíte napevno uvést veřejnou IP (`pasv_address`) a statický rozsah portů (`pasv_min_port`–`pasv_max_port`), který ručně povolíte na firewallu!"
        },
        example: {
          scenarioTitle: "Porovnání PORT vs. PASV v komunikaci a konfigurace zabezpečeného FTPS ve vsftpd",
          scenarioText: "První ukázka ilustruje přesný rozdíl mezi odpovědí serveru v pasivním režimu a explicitním přechodem na TLS. Druhý blok ukazuje produkční konfiguraci serveru `vsftpd` v Linuxu s pasivním rozsahem a vynuceným šifrováním.",
          codeBlocks: [
            {
              label: "Průběh Explicit FTPS v pasivním režimu (AUTH TLS + PROT P + PASV)",
              lang: "text",
              code: "S: 220 (vsFTPd 3.0.5)\nC: AUTH TLS\nS: 234 Proceed with negotiation.\n... [TLS 1.3 Handshake na TCP 21] ...\nC: USER spravce\nS: 331 Please specify the password.\nC: PASS TajneHeslo\nS: 230 Login successful.\nC: PBSZ 0\nS: 200 PBSZ set to 0.\nC: PROT P                    # Zapnuti TLS sifrovani i pro datovy kanal!\nS: 200 PROT now Private.\nC: PASV\nS: 227 Entering Passive Mode (203,0,113,10,156,65)   # Port = 156*256 + 65 = 40001\nC: LIST                      # Klient navazuje 2. sifrovane spojeni na 203.0.113.10:40001"
            },
            {
              label: "Konfigurace /etc/vsftpd/vsftpd.conf (PASV rozsah + Explicit FTPS)",
              lang: "ini",
              code: "# Zakladni nastaveni a pasivni rozsah pro NAT/Firewall\nlisten=YES\npasv_enable=YES\npasv_min_port=40000\npasv_max_port=40100\npasv_address=203.0.113.10\n\n# Vynuceni Explicit FTPS (TLS 1.2/1.3 na portu 21)\nssl_enable=YES\nallow_anon_ssl=NO\nforce_local_data_ssl=YES\nforce_local_logins_ssl=YES\nrequire_ssl_reuse=NO\nrsa_cert_file=/etc/letsencrypt/live/ftp.firma.cz/fullchain.pem\nrsa_private_key_file=/etc/letsencrypt/live/ftp.firma.cz/privkey.pem"
            }
          ],
          practicalTip: "Pokud dnes budujete novou službu pro přenos souborů a nepotřebujete kompatibilitu se starými FTP klienty (třeba v automatizaci tiskáren či skenerů), zvolte vždy SFTP (TCP 22) místo FTP/FTPS — ušetříte si veškeré starosti s rozsahem pasivních portů a NATem."
        },
        quiz: [
          {
            question: "Proč Aktivní režim FTP (příkaz PORT) za běžným klientským NATem a firewallem selhává?",
            options: [
              "Protože v aktivním režimu server používá místo TCP nespolehlivý protokol UDP.",
              "Protože server se z portu TCP 20 pokouší navázat nové příchozí datové spojení zpět směrem ke klientovi, což klientský firewall a NAT blokují.",
              "Protože aktivní režim povoluje přenos pouze souborů do velikosti 4 MB.",
              "Protože port 21 je vyhrazen jen pro pasivní režim."
            ],
            correctIndex: 1,
            explanation: "V aktivním režimu klient jen oznámí své číslo portu a server se k němu snaží připojit zvenčí (ze zdrojového portu 20). NAT ani stavový firewall klienta takové nevyžádané příchozí spojení nepropustí."
          },
          {
            question: "Jak probíhá datové spojení v Pasivním režimu FTP (`PASV` / `EPSV`)?",
            options: [
              "Všechna data se posílají po stejném TCP portu 21 spolu s příkazy.",
              "Klient otevře port 20 a čeká na server.",
              "Server otevře dočasný datový port, sdělí ho klientovi a klient sám naváže druhé TCP spojení směrem ven k serveru.",
              "Server přepošle soubor zabalený jako e-mail přes SMTP."
            ],
            correctIndex: 2,
            explanation: "V pasivním režimu otevírá datový port server (např. z rozsahu 40000–40100) a klient iniciuje odchozí spojení jak na port 21, tak na tento datový port."
          },
          {
            question: "Jaký je rozdíl mezi Explicit FTPS a Implicit FTPS?",
            options: [
              "Explicit FTPS začíná na portu TCP 21 příkazem `AUTH TLS`, kdežto Implicit FTPS vyžaduje TLS okamžitě od prvního paketu na vyhrazeném portu TCP 990.",
              "Explicit FTPS je pouze pro Windows, Implicit FTPS pouze pro Linux.",
              "Implicit FTPS šifruje přes SSH na portu 22.",
              "Explicit FTPS nešifruje hesla, pouze přenášené soubory."
            ],
            correctIndex: 0,
            explanation: "Explicit FTPS (FTPES) navazuje na port 21 nešifrovaně a povýší kanál přes AUTH TLS. Implicit FTPS běží na samostatném portu 990 hned v TLS."
          },
          {
            question: "Který příkaz musí klient v Explicit FTPS odeslat, aby byl šifrovaný nejen řídicí kanál (heslo), ale i samotná přenášená data a výpis adresářů?",
            options: [
              "PASV ENCRYPT",
              "STARTSSL",
              "PROT P (spolu s PBSZ 0)",
              "SSH SUBSYSTEM"
            ],
            correctIndex: 2,
            explanation: "Příkaz `AUTH TLS` zašifruje pouze řídicí kanál na portu 21; pro zapnutí šifrování i na datovém kanálu je nutné poslat `PBSZ 0` a `PROT P` (Private)."
          }
        ]
      },

      // =========================================================================
      // TÉMA 12: Samba a protokol SMB2 / SMB3
      // =========================================================================
      {
        id: "samba-smb",
        number: 12,
        moduleId: "files-shares-protocols",
        mandatory: true,
        title: "Samba a protokol SMB2 / SMB3: Sdílení souborů napříč OS",
        shortTitle: "Samba & SMB2/SMB3",
        subtitle: "TCP 445 (vs. historický NetBIOS 137–139), Samba (smbd, smb.conf, smbclient, mount -t cifs), NTLMv2 vs. Kerberos, bezpečnost SMBv3 a zákaz SMBv1.",
        cardSummary: "Sdílení souborů SMB2/SMB3 (TCP 445), Samba v Linuxu, NTLMv2 vs. Kerberos a zákaz SMBv1.",
        difficulty: "Střední",
        accentColor: "#0284c7",
        tags: ["SMB2 / SMB3", "Samba (smbd)", "NetBIOS over TCP/IP (NBT)", "NTLMv2", "NFS (Network File System)", "Port (TCP/UDP)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/samba-smb.mp4",
          poster: "media/posters/samba-smb.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Architektura SMB na TCP 445 a Samba (0:00)", time: 0 },
            { label: "2. SMBv3 šifrování, Kerberos a konec SMBv1 (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Samba a SMB nad TCP 445 – „Služba Samba využívá protokol SMB, aby počítače s Linuxem a Windows snadno sdílely síťové složky.“\n0:07–0:13: Bezpečnost SMBv3 – „Třetí verze protokolu SMB přenos spolehlivě šifruje a plně nahrazuje děravou první verzi.“"
        },
        animationType: "samba-smb",
        labType: "smb-share-sim",
        learningObjectives: [
          "Vysvětlíš princip protokolu SMB nad TCP portem 445 (oproti historickému NetBIOS over TCP/IP na portech 137–139) a roli balíku Samba v Linuxu.",
          "Nakonfiguruješ a připojíš sdílenou složku v Linuxu pomocí `/etc/samba/smb.conf`, `smbpasswd`, `smbclient` a `mount -t cifs`.",
          "Porovnáš autentizaci NTLMv2 vs. Kerberos, vysvětlíš důvod tvrdého zákazu SMBv1 (WannaCry) a popíšeš bezpečnostní výhody SMBv3 i rozdíl oproti NFS."
        ],
        takeaways: [
          "Moderní SMB (SMB2/SMB3) komunikuje přímo nad TCP portem 445 (tzv. Direct Hosting); historické porty NetBIOSu (UDP 137–138, TCP 139) se dnes již vypínají.",
          "Samba (démon smbd a konfigurace /etc/samba/smb.conf) implementuje protokol SMB/CIFS a Active Directory v Linuxu pro plnou interoperabilitu se stanicemi Windows a macOS.",
          "Zastaralé SMBv1 obsahuje kritické chyby (EternalBlue / ransomware WannaCry) a nemá moderní kryptografii — na všech serverech musí být zakázáno a nahrazeno SMBv2/SMBv3.",
          "SMBv3 přináší nativní end-to-end šifrování přenosu, SMB Signing proti MITM útokům a v podnikovém prostředí spolupracuje s ověřením Kerberos (místo staršího NTLMv2)."
        ],
        principle: {
          problem: "V kanceláři pracují grafici na Windows a macOS, zatímco centrální úložiště dat (NAS/server) běží na spolehlivém Linuxu. Jak nasdílet síťový disk tak, aby se ve Windows připojil jako jednotka `Z:` s uživatelskými právy, přenos byl šifrovaný a síť neohrozil ransomware zneužívající zastaralé SMBv1?",
          explanation: [
            "Protokol SMB (Server Message Block, v 90. letech známý také jako CIFS) je nativním protokolem Windows pro sdílení souborů, adresářů a tiskáren v lokální síti. Původní implementace běžely nad vrstvou NetBIOS over TCP/IP na portech UDP 137 (jmenná služba), UDP 138 (datagramy) a TCP 139 (relace). Od Windows 2000 a nástupu verzí SMB2 a SMB3 se však používá tzv. přímé SMB přímo nad portem TCP 445, což je rychlejší a nevyžaduje broadcasty NetBIOSu.",
            "Aby se ke sdíleným diskům připojil i Linux nebo sám Linux sloužil jako souborový server pro Windows, vznikl open-source projekt Samba. Jeho hlavní démon `smbd` čte definice sdílených složek ze souboru `/etc/samba/smb.conf` a udržuje vlastní databázi síťových hesel (`smbpasswd`), případně se začlení do firemní domény Active Directory. Z linuxového klienta se ke sdílení připojíme buď jednorázově nástrojem `smbclient`, nebo jej trvale namountujeme do adresářového stromu pomocí jádrového ovladače CIFS (`mount -t cifs` či záznamem v `/etc/fstab`).",
            "Z pohledu ověřování rozlišujeme dva hlavní mechanismy. V menších pracovních skupinách (Workgroup) bez doménového řadiče se používá výzva/odpověď NTLMv2 — klient a server si vymění hash hesla bez jeho poslání v čistém textu, ale NTLMv2 bez povinného podepisování bývá terčem útoků NTLM Relay v LAN. V podnikových sítích s Active Directory proto dominuje Kerberos (TCP/UDP 88): uživatel se jednou přihlásí k řadiči (KDC), získá kryptografické tikety (TGT/TGS) a k souborovým serverům přistupuje pomocí Single Sign-On bez posílání hesel či jejich hashů po síti.",
            "Zásadní bezpečnostní zlom nastal v roce 2017, kdy červ WannaCry a NotPetya masivně zneužily zranitelnost EternalBlue v zastaralém protokolu SMBv1 (TCP 445). SMBv1 proto musíte vždy zakázat (`server min protocol = SMB2`). Moderní protokol SMBv3 (od Windows 8 / Server 2012 a Samby 4.x) navíc přidává end-to-end šifrování dat (AES-GCM/CCM), povinné podepisování rámců (SMB Signing proti podvržení a MITM), podporu více síťových karet současně (SMB Multichannel) a stabilnější obnovu spojení. Na rozdíl od linuxového protokolu NFS (TCP 2049), který tradičně autorizoval klienty podle IP adresy a UID/GID, je SMB postavené od základu na uživatelské autentizaci a bohatých Windows ACL."
          ],
          steps: [
            {
              step: "1. TCP spojení na port 445 a vyjednání verze (Negotiate)",
              detail: "Klient se připojí na TCP 445 a navrhne podporované dialekty protokolu. Server s bezpečnou konfigurací odmítne SMBv1 a vyjedná SMBv2.1 nebo SMBv3.1.1."
            },
            {
              step: "2. Ověření uživatele (Kerberos nebo NTLMv2) a SMB Signing",
              detail: "V doméně AD předloží klient Kerberos tiket; v samostatné síti proběhne výzva/odpověď NTLMv2 a zapne se kryptografické podepisování paketů."
            },
            {
              step: "3. Připojení sdíleného stromu (Tree Connect)",
              detail: "Klient požádá o konkrétní sdílení (např. `\\\\fileserver\\Projekty`), server ověří oprávnění v `smb.conf` a systémová práva souborového systému."
            },
            {
              step: "4. Šifrovaný přenos souborů v SMBv3",
              detail: "Při zapnutém šifrování (`smb encrypt = required`) jsou operace čtení, zápisu i zamykání souborů chráněny AES šifrou přímo v SMB vrstvě."
            }
          ],
          analogy: "Představte si SMB jako zabezpečený výdejní pult ve firemním skladu: u vstupu se musíte prokázat čipovou kartou (Kerberos/NTLMv2), pult ověří, do jakých regálů smíte sáhnout (ACL a smb.conf), a v nejnovější verzi SMBv3 vám navíc dokumenty vloží do zapečetěné obálky (šifrování + podepisování), aby je cestou po chodbě nikdo nepřečetl ani nepodstrčil.",
          comparisonTable: {
            headers: ["Kritérium", "SMBv1 (zastaralý)", "SMBv2 / SMBv3 (Samba 4+)", "NFSv4 (nativní UNIX/Linux)"],
            rows: [
              ["Transportní porty", "TCP 139 (NetBIOS) / TCP 445", "TCP 445 (přímé SMB bez NetBIOS)", "TCP 2049 (bez nutnosti portmapperu)"],
              ["Šifrování přenosu", "Žádné", "Ano — nativní AES v SMBv3", "Volitelně přes Kerberos (krb5p) / TLS"],
              ["Ochrana před MITM", "Slabá, chybí moderní integrita", "SMB Signing + šifrování relace", "Kerberos integrita (krb5i/krb5p)"],
              ["Ověřování uživatelů", "Starší NTLM / LanMan (slabé)", "Kerberos (AD SSO) nebo NTLMv2", "UID/GID + IP klienta (v4 i Kerberos)"],
              ["Stav v praxi", "NUTNO ZAKÁZAT (EternalBlue/WannaCry)", "Standard pro Windows, macOS i Linux", "Standard pro Linux/UNIX, VMware a HPC"]
            ]
          },
          watchOut: "Dvě kritická bezpečnostní pravidla pro SMB: 1) Port TCP 445 NIKDY neotevírejte veřejně do internetu — patří výhradně do interní LAN/VLAN nebo za VPN (přes internet ho blokují i samotní poskytovatelé). 2) Vždy kontrolujte, že máte vypnuté SMBv1 (`min protocol = SMB2`), a pokud používáte Linux `smbd`, nezapomeňte vedle vytvoření linuxového uživatele přidat i jeho heslo do Samba databáze příkazem `smbpasswd -a uzivatel` a povolit SELinux/firewall (`firewall-cmd --add-service=samba`)."
        },
        example: {
          scenarioTitle: "Bezpečná konfigurace Samba serveru (/etc/samba/smb.conf) a připojení sdílení z Linuxu",
          scenarioText: "Administrátor konfiguruje sdílenou složku pro vývojový tým s vynuceným šifrováním SMBv3 a zákazem SMBv1, ověřuje syntaxi nástrojem `testparm` a připojuje sdílení na klientské stanici.",
          codeBlocks: [
            {
              label: "Konfigurace /etc/samba/smb.conf se zákazem SMBv1 a povinným šifrováním",
              lang: "ini",
              code: "[global]\n   workgroup = FIRMA\n   security = user\n   server min protocol = SMB2\n   smb encrypt = required\n   server signing = mandatory\n\n[Projekty]\n   path = /srv/samba/projekty\n   valid users = @vyvoj\n   read only = no\n   create mask = 0660\n   directory mask = 0770\n\n# Nasledna kontrola syntaxe a zalozeni Samba hesla pro uzivatele:\n# $ sudo testparm && sudo smbpasswd -a petr"
            },
            {
              label: "Připojení a diagnostika sdílení z linuxového klienta (smbclient & mount -t cifs)",
              lang: "bash",
              code: "# 1) Rychly vypis a interaktivni test sdileni bez mountovani\n$ smbclient -L //10.10.20.5 -U petr\n$ smbclient //10.10.20.5/Projekty -U petr\n\n# 2) Trvale pripojeni do adresare /mnt/projekty s vynucenym SMB 3.0\n$ sudo mount -t cifs //10.10.20.5/Projekty /mnt/projekty \\\n  -o username=petr,vers=3.0,uid=1000,gid=1000\n\n# 3) Kontrola aktivnich pripojeni a pouzite verze SMB na serveru\n$ sudo smbstatus"
            }
          ],
          practicalTip: "Při připojování SMB sdílení v `/etc/fstab` nikdy nepište heslo přímo do veřejně čitelného souboru `/etc/fstab` — uložte jej do souboru `/root/.smbcreds` s právy `chmod 600` a připojte volbou `credentials=/root/.smbcreds`."
        },
        quiz: [
          {
            question: "Na jakém portu běží moderní přímý protokol SMB2/SMB3 bez nutnosti vrstvy NetBIOS?",
            options: [
              "TCP 21",
              "TCP 445",
              "UDP 161",
              "TCP 3389"
            ],
            correctIndex: 1,
            explanation: "Přímý SMB (Direct Hosting) používá port TCP 445. Historické porty NetBIOS over TCP/IP byly UDP 137–138 a TCP 139."
          },
          {
            question: "Proč je dnes v sítích bezpodmínečně nutné zakázat protokol SMBv1?",
            options: [
              "Protože SMBv1 umí přenášet soubory pouze z Linuxu na macOS.",
              "Protože má zastaralou architekturu bez šifrování a obsahoval kritickou zranitelnost EternalBlue zneužitou ransomwarem WannaCry.",
              "Protože SMBv1 nepodporuje názvy souborů delší než 8 znaků.",
              "Protože SMBv1 vyžaduje veřejný DNS záznam MX."
            ],
            correctIndex: 1,
            explanation: "Zranitelnost v SMBv1 (MS17-010 / EternalBlue) umožnila masivní šíření ransomwaru WannaCry a NotPetya. Bezpečná konfigurace vyžaduje minimálně SMBv2 nebo lépe šifrované SMBv3."
          },
          {
            question: "Který příkaz v Linuxu připojí sdílenou síťovou složku Samba/Windows přímo do lokálního adresáře (např. `/mnt/data`)?",
            options: [
              "`mount -t cifs //server/sdileni /mnt/data -o username=user,vers=3.0`",
              "`sshfs -p 445 //server/sdileni /mnt/data`",
              "`smbpasswd -m /mnt/data`",
              "`iptables -A INPUT --dport 445 -j MOUNT`"
            ],
            correctIndex: 0,
            explanation: "Pro připojení SMB sdílení do souborového systému Linuxu slouží typ souborového systému `cifs` z balíku cifs-utils a volba `vers=3.0` pro vynucení moderního SMBv3."
          },
          {
            question: "Jaký je hlavní rozdíl mezi ověřením NTLMv2 a Kerberos v síti se SMB sdílením?",
            options: [
              "NTLMv2 je šifrovaný a Kerberos posílá hesla v čistém textu.",
              "Kerberos se používá jen v domácnostech bez domény a NTLMv2 výhradně v Active Directory.",
              "NTLMv2 je výzva/odpověď vhodná pro samostatné workgroup servery, zatímco Kerberos v Active Directory vydává tikety (SSO) bez posílání hashů hesel mezi servery.",
              "Oba protokoly jsou totožné, liší se jen použitým portem (139 vs. 445)."
            ],
            correctIndex: 2,
            explanation: "V doménách Active Directory je preferován Kerberos (využívá tikety z KDC), protože poskytuje vyšší odolnost proti relay útokům a opravdové Single Sign-On."
          }
        ]
      },

      // =========================================================================
      // TÉMA 13: Vzdálený terminál a přenos souborů (Telnet vs. SSH-2 a SFTP)
      // =========================================================================
      {
        id: "ssh-telnet-sftp",
        number: 13,
        moduleId: "remote-realtime-protocols",
        mandatory: true,
        title: "Vzdálený terminál a přenos souborů: Telnet vs. SSH-2 a SFTP",
        shortTitle: "SSH, Telnet & SFTP",
        subtitle: "Nešifrovaný Telnet (TCP 23) vs. šifrovaný SSH-2 (TCP 22), ověření Host Key, klíče Ed25519, SSH tunely a subsystém SFTP vs. SCP a FTPS.",
        cardSummary: "Nešifrovaný Telnet (23) vs. šifrovaný SSH-2 (22), klíče Ed25519, tunely a subsystém SFTP.",
        difficulty: "Základy",
        accentColor: "#f43f5e",
        tags: ["SSH (Secure Shell)", "Telnet", "SFTP (SSH File Transfer Protocol)", "SCP (Secure Copy)", "OpenSSH", "Port (TCP/UDP)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/ssh-telnet-sftp.mp4",
          poster: "media/posters/ssh-telnet-sftp.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Telnet (TCP 23) vs. šifrovaný SSH-2 (TCP 22) (0:00)", time: 0 },
            { label: "2. Klíče Ed25519, tunely a subsystém SFTP (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Telnet vs. SSH – „Zastaralý Telnet posílá hesla po síti v čitelném textu, zatímco protokol SSH celou relaci šifruje.“\n0:07–0:13: Klíče a SFTP – „Stejným šifrovaným tunelem na portu 22 pak protokol SFTP bezpečně přenáší soubory.“"
        },
        animationType: "ssh-telnet-sftp",
        labType: "ssh-telnet-sftp-sim",
        learningObjectives: [
          "Zdůvodníš, proč je nešifrovaný Telnet (TCP 23) pro správu serverů zcela nebezpečný, a vysvětlíš mechanismy ochrany v SSH-2 (TCP 22).",
          "Nastavíš přihlašování asymetrickým klíčem Ed25519 a použiješ SSH port forwarding (tunelování) pro bezpečný přístup k interním službám.",
          "Odlišíš subsystém SFTP na TCP 22 od protokolu SCP i od dvoukanálového FTPS z pohledu funkcí a prostupnosti firewallem."
        ],
        takeaways: [
          "Telnet (TCP 23) nepoužívá žádné šifrování ani ověření serveru — každý stisk klávesy včetně hesla putuje po síti jako čitelný text, proto se dnes pro správu nesmí používat.",
          "SSH-2 (TCP 22) chrání přenos šifrováním a integritou, při prvním připojení ukládá otisk host key serveru do `~/.ssh/known_hosts` proti útoku MITM a podporuje autentizaci párem klíčů (např. Ed25519).",
          "SSH umí kromě vzdáleného shellu také tunelovat libovolný TCP provoz (Local `-L`, Remote `-R`, Dynamic SOCKS `-D`) jedním šifrovaným spojením.",
          "SFTP běží jako bezpečný subsystém uvnitř SSH na jediném portu TCP 22, podporuje plnou správu souborů i navázání přenosu a na firewallu je nesrovnatelně jednodušší než FTPS."
        ],
        principle: {
          problem: "Potřebujete ze své kanceláře bezpečně spravovat linuxový server v datacentru a nahrávat na něj konfigurační soubory či zálohy. Proč původní protokol Telnet v dnešní síti neobstojí a proč správci pro přenos souborů dávají přednost SFTP před FTPS?",
          explanation: [
            "Nejstarším standardním protokolem pro vzdálený textový terminál v TCP/IP byl Telnet (TCP port 23). Funguje jako přímé obousměrné textové spojení: každý znak, který napíšete na klávesnici, odejde v nešifrovaném TCP segmentu na server. Pokud kdokoli v síti (na přepínači, Wi-Fi nebo routeru po cestě) spustí zachytávání paketů (`tcpdump` / Wireshark), uvidí v čitelné podobě nejen vaše příkazy, ale i uživatelské jméno a heslo root účtu! Dnes se proto Telnet na produkčních zařízeních vypíná a klientský příkaz `telnet` (nebo lépe `nc`) přežívá jen jako nouzová diagnostika pro ověření, zda vzdálený server naslouchá na určitém TCP portu.",
            "Náhradou se stal protokol SSH-2 (Secure Shell, TCP port 22, nejčastější implementací je OpenSSH). SSH řeší tři bezpečnostní slabiny najednou: 1) Ověření identity serveru — server má vlastní veřejný Host Key; při prvním připojení klient zobrazí jeho otisk (fingerprint) a uloží ho do `~/.ssh/known_hosts` (model TOFU — Trust On First Use). Pokud se klíč serveru příště nečekaně změní, SSH zablokuje připojení varováním před útokem Man-in-the-Middle. 2) Důvěrnost a integrita — celá relace se šifruje (např. ChaCha20-Poly1305 nebo AES-GCM). 3) Bezpečné přihlášení uživatele — místo uhodnutelných hesel se nasazuje asymetrická autentizace moderním klíčem Ed25519 (veřejný klíč `.pub` uložený na serveru v `~/.ssh/authorized_keys`, soukromý klíč bezpečně na disku správce pod přístupovou frází).",
            "Obrovskou předností SSH je také vestavěné tunelování (Port Forwarding). Lokálním tunelem (`ssh -L 8080:127.0.0.1:80 server`) dokážete zpřístupnit webovou administraci nebo databázi, která na serveru naslouchá jen na lokální adrese `127.0.0.1`, aniž byste ji kdy vystavili veřejně na firewallu. Vzdálený tunel (`-R`) zpřístupní službu z vaší sítě na server a dynamický tunel (`-D 1080`) vytvoří šifrované SOCKS5 proxy.",
            "Do téže šifrované SSH relace na portu TCP 22 se připojuje i protokol SFTP (SSH File Transfer Protocol). Na rozdíl od staršího SCP (Secure Copy), které umělo jen jednosměrně zkopírovat soubor bez procházení složek (a v nových verzích OpenSSH už interně stejně používá protokol SFTP), nabízí SFTP kompletní souborového manažera: výpis adresářů, mazání, změnu práv i navázání přerušeného přenosu. A oproti FTPS (které vychází z FTP na portu 21 a vyžaduje otevírat další rozsah pasivních portů) stačí protokolu SFTP přes firewall i NAT jeden jediný otevřený port TCP 22."
          ],
          steps: [
            {
              step: "1. TCP spojení na port 22 a ověření Host Key",
              detail: "Klient se připojí na TCP 22, vyjedná SSH-2 šifry a ověří veřejný klíč serveru v souboru ~/.ssh/known_hosts proti podvržení serveru (MITM)."
            },
            {
              step: "2. Navázání šifrovaného tunelu a autentizace (Ed25519)",
              detail: "Relace se zašifruje a klient prokáže svou identitu podpisem privátního klíče Ed25519 vůči záznamu v ~/.ssh/authorized_keys na serveru."
            },
            {
              step: "3. Otevření logických kanálů (Shell, Tunel nebo SFTP)",
              detail: "Uvnitř jedné šifrované relace lze spustit interaktivní terminál (PTY), přeposílat porty (-L/-R/-D) nebo nastartovat subsystém sftp-server."
            },
            {
              step: "4. Bezpečný přenos souborů nebo správa v jednom kanálu",
              detail: "Příkazy sftp (ls, get, put, resume) i příkazy shellu putují šifrovaně po jediném portu TCP 22 bez nutnosti otevírat datové porty."
            }
          ],
          analogy: "Telnet je jako vyřvávat heslo k sejfu přes otevřenou chodbu plnou cizích lidí. SSH je osobní pancéřovaný tunel s biometrickým ověřením na obou koncích (Host Key + váš klíč Ed25519), kterým můžete nejen posílat příkazy, ale i bezpečně převážet krabice se soubory (SFTP) nebo protáhnout chráněný drát k lokálním službám (SSH tunel).",
          comparisonTable: {
            headers: ["Protokol", "Porty", "Šifrování & Identita", "Hlavní použití a průchod firewallem"],
            rows: [
              ["Telnet", "TCP 23", "Žádné (vše včetně hesla v plain-textu!)", "Zastaralý terminál; dnes pouze ladění otevřenosti portů nebo legacy prvky"],
              ["SSH-2", "TCP 22", "Silné TLS-like šifrování + Host Key + Ed25519", "Standardní vzdálená správa Linuxu, síťových prvků, Ansible a tunelování"],
              ["SFTP", "TCP 22 (v SSH)", "Plně v SSH tunelu (1 spojení)", "Moderní bezpečný přenos a správa souborů přes jediný port firewallem"],
              ["SCP", "TCP 22 (v SSH)", "Plně v SSH tunelu (1 spojení)", "Jednoduché skriptové kopírování (moderní OpenSSH používá interně SFTP)"],
              ["FTPS", "TCP 21 + datové", "TLS (AUTH TLS) + X.509 certifikát", "Rozšíření FTP; na firewallech a za NATem vyžaduje rozsah pasivních portů"]
            ]
          },
          watchOut: "Pozor na dva časté nešvary: 1) Pokud vám SSH klient nahlásí červené varování `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`, bezmyšlenkovitě nesmazávejte řádek ze souboru `known_hosts` dříve, než ověříte u správce, zda byl server skutečně přeinstalován — může jít o aktivní MITM útok! 2) Záměna pojmů: SFTP není FTP se zabezpečením! Pokud klient podporuje jen FTPS (TCP 21/990), k SFTP serveru (TCP 22) se nepřipojí."
        },
        example: {
          scenarioTitle: "Nastavení SSH klíčů Ed25519, lokální tunel a práce se SFTP subsystémem",
          scenarioText: "Správce si vygeneruje moderní pár klíčů Ed25519, zkopíruje veřejný klíč na server, zakáže přihlášení heslem a bezpečně přenese konfigurační archiv pomocí SFTP.",
          codeBlocks: [
            {
              label: "Generování klíče Ed25519, nasazení a vytvoření SSH tunelu",
              lang: "bash",
              code: "# 1) Vygenerovani moderneho eliptickeho klice Ed25519 na pracovni stanici\n$ ssh-keygen -t ed25519 -C \"admin@notebook\"\n\n# 2) Nahrani verejneho klice na server do ~/.ssh/authorized_keys\n$ ssh-copy-id -i ~/.ssh/id_ed25519.pub spravce@10.20.30.5\n\n# 3) Lokalni SSH tunel: zpristupni interni DB Adminer (127.0.0.1:8080 na serveru) na nasem portu 9000\n$ ssh -N -L 9000:127.0.0.1:8080 spravce@10.20.30.5"
            },
            {
              label: "Interaktivní SFTP přenos souborů a zpevnění /etc/ssh/sshd_config",
              lang: "bash",
              code: "# 1) Prace se vzdalenymi soubory pres jediny port TCP 22\n$ sftp spravce@10.20.30.5\nsftp> pwd\nsftp> put zaloha-konfigu.tar.gz /srv/backups/\nsftp> get /var/log/app/error.log\nsftp> bye\n\n# 2) Doporucene parametry v /etc/ssh/sshd_config na serveru:\n# PermitRootLogin no\n# PasswordAuthentication no\n# PubkeyAuthentication yes\n# Subsystem sftp /usr/libexec/openssh/sftp-server"
            }
          ],
          practicalTip: "Abyste nemuseli pokaždé psát dlouhé parametry `ssh -i ... -p ... uzivatel@ip`, vytvořte si na svém počítači soubor `~/.ssh/config` (s právy `chmod 600`) s aliasy `Host prod-web`, `HostName`, `User` a `IdentityFile` — připojení i SFTP se pak zkrátí na prosté `ssh prod-web` nebo `sftp prod-web`."
        },
        quiz: [
          {
            question: "Jaké hlavní bezpečnostní riziko přináší použití protokolu Telnet (TCP 23) pro vzdálenou správu?",
            options: [
              "Telnet dokáže přenášet pouze soubory, ale ne příkazy shellu.",
              "Veškerá komunikace včetně přihlašovacího jména a hesla putuje po síti v čistém nešifrovaném textu.",
              "Telnet funguje výhradně přes protokol UDP a často ztrácí znaky.",
              "Telnet vyžaduje instalaci placeného certifikátu od komerční CA."
            ],
            correctIndex: 1,
            explanation: "Telnet nešifruje spojení ani neověřuje identitu serveru; kdokoli odposlouchávající síťový provoz heslo okamžitě přečte."
          },
          {
            question: "Co v protokolu SSH slouží k ověření, že se nepřipojujete k podvrženému serveru (ochrana proti MITM)?",
            options: [
              "Seznam povolených IP v souboru `/etc/hosts`",
              "Otisk veřejného klíče serveru (Host Key) ukládaný do `~/.ssh/known_hosts`",
              "Hlavička `X-SSH-Verify`",
              "Certifikát vydaný místním DHCP serverem"
            ],
            correctIndex: 1,
            explanation: "SSH při prvním připojení uloží veřejný Host Key serveru do `~/.ssh/known_hosts`. Při každém dalším spojení jej kryptograficky ověřuje a při změně vyvolá varování."
          },
          {
            question: "Jakou hlavní síťovou výhodu má SFTP oproti protokolu FTPS při průchodu přes firewally a NAT?",
            options: [
              "SFTP běží jako subsystém SSH na jediném portu TCP 22, takže nevyžaduje otevírání dalšího rozsahu pasivních datových portů.",
              "SFTP obchází firewall posíláním dat uvnitř DNS dotazů.",
              "SFTP vůbec nepoužívá šifrování, takže firewall do něj snadno vidí.",
              "SFTP používá port TCP 21 i pro datové přenosy."
            ],
            correctIndex: 0,
            explanation: "SFTP multiplexuje řídicí příkazy i přenos dat uvnitř jediného šifrovaného SSH spojení na portu TCP 22, což zásadně zjednodušuje pravidla firewallu a NAT."
          },
          {
            question: "Co udělá příkaz `ssh -L 8443:127.0.0.1:443 admin@server.firma.cz`?",
            options: [
              "Otevře veřejně port 8443 na serveru pro všechny uživatele internetu.",
              "Vytvoří lokální šifrovaný SSH tunel: spojení na port 8443 vašeho vlastního PC se přepošle bezpečně přes SSH na lokální port 443 cílového serveru.",
              "Zkopíruje soubor z portu 8443 na port 443 pomocí SCP.",
              "Zakáže na serveru přihlašování pomocí hesla."
            ],
            correctIndex: 1,
            explanation: "Přepínač `-L` vytváří Local Port Forwarding: váš počítač naslouchá na lokálním portu 8443 a bezpečně tuneluje komunikaci přes SSH k cílové adrese z pohledu vzdáleného serveru."
          }
        ]
      },

      // =========================================================================
      // TÉMA 14: Vzdálená grafická plocha (Microsoft RDP vs. VNC / RFB)
      // =========================================================================
      {
        id: "rdp-vnc",
        number: 14,
        moduleId: "remote-realtime-protocols",
        mandatory: true,
        title: "Vzdálená grafická plocha: Microsoft RDP (3389) vs. VNC / RFB (5900)",
        shortTitle: "RDP vs. VNC",
        subtitle: "RDP (TCP/UDP 3389 — vykreslovací instrukce, více relací, zvuk/tiskárny, NLA + TLS) vs. VNC / RFB (TCP 5900+N — rastrové pixely, slabé zabezpečení, tunelování).",
        cardSummary: "Grafická vzdálená plocha: vektorový Microsoft RDP (3389) s NLA vs. rastrový VNC/RFB (5900+N).",
        difficulty: "Střední",
        accentColor: "#e11d48",
        tags: ["RDP (Remote Desktop Protocol)", "VNC (Virtual Network Computing)", "RFB (Remote Framebuffer)", "NLA (Network Level Authentication)", "TLS 1.3", "SSH (Secure Shell)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/rdp-vnc.mp4",
          poster: "media/posters/rdp-vnc.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. Vektorový RDP (3389) + NLA vs. VNC/RFB (0:00)", time: 0 },
            { label: "2. Bezpečnostní rizika a SSH tunel pro VNC (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: RDP vs. VNC – „Vzdálená plocha RDP přenáší úsporné vykreslovací příkazy, zvuk i schránku v šifrovaném spojení.“\n0:07–0:13: Zabezpečení v praxi – „Multiplatformní VNC posílá přímo čtverce obrazovky, a proto se chrání tunelem přes SSH.“"
        },
        animationType: "rdp-vnc",
        labType: "rdp-vnc-sim",
        learningObjectives: [
          "Porovnáš technický princip přenosu obrazu u Microsoft RDP (vykreslovací grafické příkazy + kodeky) a VNC/RFB (rastrové obdélníky pixelů z framebufferu).",
          "Identifikuješ síťové porty RDP (TCP/UDP 3389) a VNC (TCP 5900 + číslo displeje N) a možnosti přesměrování zdrojů i více relací.",
          "Vysvětlíš roli ověření NLA a TLS u RDP, bezpečnostní limity základního VNC a nutnost skrýt oba protokoly za VPN, RD Gateway nebo SSH tunel."
        ],
        takeaways: [
          "Microsoft RDP (TCP/UDP 3389) neposílá jen hloupé snímky obrazovky, ale vykreslovací grafické příkazy a moderní video proud, díky čemuž je plynulý i na pomalejší lince a umí přesměrovat zvuk, schránku i tiskárny.",
          "RDP na Windows Serverech podporuje více souběžných nezávislých uživatelských ploch a v základu využívá TLS šifrování s předsazeným ověřením NLA (Network Level Authentication).",
          "VNC je multiplatformní řešení nad protokolem RFB (port TCP 5900 + číslo displeje, např. :1 = 5901), které přenáší rastrové obdélníky pixelů stávající obrazovky.",
          "Základní standard RFB má slabé zabezpečení (heslo max 8 znaků přes DES bez šifrování obrazu), proto se VNC nesmí otevírat do internetu a vždy se tuneluje přes SSH nebo VPN."
        ],
        principle: {
          problem: "Potřebujete ze vzdáleného pracoviště ovládat grafické rozhraní aplikace na Windows Serveru nebo vzdáleném linuxovém desktopu či serverové KVM konzoli. Proč se na Windows Remote Desktop pracuje plynuleji než na základním VNC a proč je nebezpečné vystavit port 3389 nebo 5900 přímo do internetu?",
          explanation: [
            "Protokol Microsoft RDP (Remote Desktop Protocol) komunikuje na portu TCP 3389 a nověji využívá paralelně i UDP 3389 pro plynulejší odezvu multimédií. Jeho zásadní předností je způsob, jakým obraz přenáší: namísto posílání surových pixelů zachycuje grafické vykreslovací příkazy operačního systému (GDI/DirectX primitivy, fonty, okna, případně adaptivní H.264/AVC kompresi pro video) a skládá obraz přímo na straně klienta. Díky tomu má mnohem nižší datový tok i latenci a automaticky se přizpůsobí rozlišení monitoru klienta.",
            "Kromě obrazu dokáže RDP po virtuálních kanálech téhož spojení směrovat zvuk, mikrofon, sdílenou schránku (copy/paste), lokální tiskárny, USB zařízení či disky. Na Windows Serveru s rolí RDS navíc může být přes RDP přihlášeno mnoho uživatelů současně, přičemž každý má vlastní izolovanou plochu. Bezpečnost řeší šifrování TLS a především NLA (Network Level Authentication): uživatel se musí autentizovat ještě před tím, než server vytvoří grafickou přihlašovací relaci, což výrazně šetří paměť serveru a chrání před útoky na přihlašovací obrazovku.",
            "Alternativou napříč platformami (Linux, macOS, Windows, vestavěné správcovské karty iLO/iDRAC) je VNC (Virtual Network Computing) postavený na protokolu RFB (Remote Framebuffer). VNC server naslouchá na portu TCP 5900 + číslo obrazovky (např. displej `:0` na portu 5900, `:1` na 5901). Funguje zcela odlišně: čte aktuální obsah obrazové paměti (framebufferu) a po změně posílá klientovi komprimované rastrové obdélníky pixelů (kódování ZRLE, Tight, Hextile) a zpět přijímá kliknutí myši a stisky kláves. Běžně tak více připojených uživatelů sleduje a sdílí tu samou obrazovku (ideální pro dálkovou pomoc uživateli nebo servis BIOSu).",
            "Z hlediska kybernetické bezpečnosti však vyžadují oba protokoly velkou opatrnost. Klasický standard RFB posílá samotný obraz zcela nešifrovaně a heslo ověřuje jen slabým 8znakovým DES challengem (některé moderní odnože jako TigerVNC přidávají TLS rozšíření VeNCrypt, ale není to zaručeno všude). VNC server proto spouštějte výhradně na `127.0.0.1` a připojujte se k němu šifrovaným SSH tunelem. Ani samotný RDP port 3389 nikdy neotvírejte přímo do veřejného internetu — je nejčastějším cílem hrubé síly (brute-force) a ransomwarových skupin; pro vzdálený přístup používejte VPN nebo RD Gateway zapouzdřený v HTTPS (TCP 443)."
          ],
          steps: [
            {
              step: "1. RDP: Vyjednání zabezpečení a NLA na TCP 3389",
              detail: "Klient se připojí na TCP 3389, naváže TLS a přes CredSSP/Kerberos provede ověření NLA ještě před přidělením grafické relace."
            },
            {
              step: "2. RDP: Přenos grafických příkazů a virtuálních kanálů",
              detail: "Server posílá vykreslovací instrukce přizpůsobené rozlišení klienta a podle politiky zpřístupní schránku, zvuk (i přes UDP 3389) či tiskárnu."
            },
            {
              step: "3. VNC/RFB: Připojení na 5900+N (nejlépe přes SSH tunel)",
              detail: "Klient naváže spojení přes lokální SSH tunel na port 5901 (:1) a ověří se VNC heslem nebo systémovým účtem (u VeNCrypt)."
            },
            {
              step: "4. VNC/RFB: Aktualizace rastrových obdélníků framebufferu",
              detail: "Klient posílá události myši/klávesnice a server vrací jen změněné obdélníky pixelů stávající plochy."
            }
          ],
          analogy: "RDP je jako poslat staviteli architektonický plánek a instrukce (‚nakresli okno zde, vypiš text tímto písmem‘) — přenos je lehký a ostrý na každém displeji. VNC je jako posílat soustavně fotografie hotové stěny rozřezané na obdélníkové dlaždice — funguje to na jakékoli zdi bez znalosti jejího jazyka, ale přenáší víc dat a bez SSH tunelu se na fotku může dívat každý kolemjdoucí.",
          comparisonTable: {
            headers: ["Vlastnost", "Microsoft RDP", "VNC (protokol RFB)"],
            rows: [
              ["Porty", "TCP 3389 (+ UDP 3389)", "TCP 5900 + číslo displeje (např. 5901 pro :1)"],
              ["Princip přenosu obrazu", "Grafické příkazy (GDI/RemoteFX) + adaptivní kodeky", "Rastrové obdélníky pixelů z framebufferu (Tight/ZRLE)"],
              ["Více relací současně", "Ano (každý uživatel vlastní izolovanou plochu na Serveru)", "Obvykle sdílí jednu aktivní plochu (nebo oddělený Xvnc)"],
              ["Přesměrování zařízení", "Bohaté: zvuk, mikrofon, schránka, disky, tiskárny, USB", "Základní: obraz, klávesnice, myš, omezeně schránka"],
              ["Zabezpečení v základu", "TLS šifrování + NLA ověření před startem relace", "Slabé (max 8 znaků heslo, nešifrovaný obraz v čistém RFB)"]
            ]
          },
          watchOut: "Port TCP 3389 (RDP) otevřený přímo do internetu bez VPN patří celosvětově mezi top 3 vstupní brány ransomwarových útoků! Stejně tak nechráněné VNC na portech 5900/5901 útočníci automaticky skenují roboty během minut od spuštění. Vždy nechte VNC naslouchat jen na `localhost` (`-localhost yes`) přes SSH tunel a u RDP vyžadujte NLA a přístup výhradně přes VPN nebo RD Gateway."
        },
        example: {
          scenarioTitle: "Bezpečné spuštění VNC přes SSH tunel a připojení k RDP s NLA z Linuxu",
          scenarioText: "První blok ukazuje bezpečné spuštění VNC serveru v Linuxu pouze na loopback adrese a tunelování přes SSH. Druhý blok ukazuje připojení k firemnímu Windows serveru pomocí klienta `xfreerdp` s vynucenou autentizací NLA a kontrolou certifikátu.",
          codeBlocks: [
            {
              label: "Spuštění lokálního VNC (:1 = port 5901) a bezpečné připojení přes SSH tunel",
              lang: "bash",
              code: "# 1) Na vzdalenem Linux serveru spustime VNC jen na 127.0.0.1 (nikdy do site!)\n$ vncserver :1 -localhost yes -geometry 1920x1080\n\n# 2) Z naseho PC vytvorime sifrovany SSH tunel na vzdaleny port 5901\n$ ssh -N -L 5901:127.0.0.1:5901 admin@linux-desktop.firma.cz\n\n# 3) Lokalni VNC prohlizec pak miri bezpecne na nasi vlastni adresu\n$ vncviewer 127.0.0.1:5901"
            },
            {
              label: "Připojení k Windows RDP s NLA z Linuxu (FreeRDP) a kontrola portů",
              lang: "bash",
              code: "# Pripojeni k RDP serveru pres VPN s vynucenim NLA (/sec:nla) a dynamickym rozlisenim\n$ xfreerdp /v:10.10.50.20:3389 /u:spravce /d:FIRMA /sec:nla /dynamic-resolution +clipboard\n\n# Overeni, ze VNC na serveru nasloucha opravdu jen na localhostu (127.0.0.1:5901)\n$ ss -tulnp | grep -E \"590|3389\"\ntcp   LISTEN 0  5  127.0.0.1:5901  0.0.0.0:*  users:((\"Xtigervnc\",pid=2418,fd=6))"
            }
          ],
          practicalTip: "Pokud se přes RDP připojujete k počítači s Windows 10/11 (edice Pro/Enterprise — Home RDP server neobsahuje), pamatujte, že desktopová edice Windows dovoluje vždy jen jednoho aktivně přihlášeného uživatele: přihlášení přes RDP tak lokálně uzamkne obrazovku u stolu."
        },
        quiz: [
          {
            question: "Na jakém portu naslouchá VNC server pro druhý grafický displej označený jako `:2`?",
            options: [
              "TCP 3391",
              "TCP 5902",
              "UDP 5900",
              "TCP 22"
            ],
            correctIndex: 1,
            explanation: "Základní port protokolu RFB/VNC je TCP 5900 (displej :0). Pro každý další displej se číslo přičítá: :1 → 5901, :2 → 5902."
          },
          {
            question: "Proč má protokol Microsoft RDP obvykle nižší datovou náročnost a ostřejší obraz než základní VNC?",
            options: [
              "Protože RDP přenáší grafické vykreslovací instrukce a adaptivní video proud namísto pouhého kopírování rastrových obdélníků pixelů.",
              "Protože RDP zobrazuje obraz jen v 16 barvách.",
              "Protože RDP komprimuje plochu do HTML stránek.",
              "Protože RDP nepřenáší polohu kurzoru myši."
            ],
            correctIndex: 0,
            explanation: "RDP operuje na vyšší úrovni grafického rozhraní (přenáší instrukce pro vykreslení oken, písem i multimédií), kdežto VNC/RFB posílá změněné rastrové obdélníky z obrazové paměti."
          },
          {
            question: "Co zajišťuje funkce NLA (Network Level Authentication) u protokolu RDP?",
            options: [
              "Automaticky vypíná TLS šifrování pro rychlejší odezvu v lokální síti.",
              "Vyžaduje úspěšnou autentizaci uživatele ještě před tím, než server spustí grafickou přihlašovací relaci RDP.",
              "Umožňuje připojit se bez zadání hesla pomocí MAC adresy.",
              "Převádí RDP spojení automaticky na protokol VNC."
            ],
            correctIndex: 1,
            explanation: "NLA ověří přihlašovací údaje před přidělením prostředků relace, čímž chrání server před vyčerpáním paměti (DoS) a chybami v přihlašovací fázi grafického rozhraní."
          },
          {
            question: "Jaký je jediný bezpečný způsob použití klasického nešifrovaného VNC serveru v síti?",
            options: [
              "Nastavit heslo delší než 12 znaků v základním RFB a otevřít port 5900 do internetu.",
              "Přepnout VNC z portu TCP 5900 na port TCP 5999 a nechat ho veřejně dostupný.",
              "Nechat VNC naslouchat jen na `127.0.0.1` a přistupovat k němu výhradně přes šifrovaný SSH tunel nebo VPN.",
              "Vypnout firewall na straně klienta i serveru."
            ],
            correctIndex: 2,
            explanation: "Standardní RFB heslo je omezeno na 8 znaků a obraz se nešifruje, proto musí být VNC navázáno pouze na loopback rozhraní a chráněno SSH tunelem nebo VPN."
          }
        ]
      },

      // =========================================================================
      // TÉMA 15: Dohled a logování sítě (SNMP a Syslog)
      // =========================================================================
      {
        id: "snmp-syslog",
        number: 15,
        moduleId: "remote-realtime-protocols",
        mandatory: true,
        title: "Dohled a logování sítě: SNMP (v1–v3, MIB/OID) a Syslog",
        shortTitle: "SNMP & Syslog",
        subtitle: "SNMP dotazy GET/WALK/SET (UDP 161) a TRAP (UDP 162), MIB a OID, community stringy vs. SNMPv3 authPriv a centralizovaný Syslog (UDP/TCP 514, TLS 6514, 0–7).",
        cardSummary: "Monitoring SNMP (UDP 161/162, MIB/OID, v3 authPriv) a centralizovaný sběr logů přes Syslog.",
        difficulty: "Střední",
        accentColor: "#fb7185",
        tags: ["SNMP (v1 / v2c / v3)", "OID (Object Identifier)", "TRAP (SNMP)", "Syslog", "TLS 1.3", "UDP (User Datagram Protocol)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/snmp-syslog.mp4",
          poster: "media/posters/snmp-syslog.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. SNMP Manager/Agent (161/162), MIB/OID a v3 (0:00)", time: 0 },
            { label: "2. Centralizovaný Syslog (514 / TLS 6514, 0–7) (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: Monitoring přes SNMP – „Protokol SNMP vyčítá vytížení síťových prvků a při poruše sám okamžitě odešle varovnou zprávu.“\n0:07–0:13: Logování Syslog – „Třetí verze SNMP komunikaci šifruje a služba Syslog soustředí systémové záznamy na centrální server.“"
        },
        animationType: "snmp-syslog",
        labType: "snmp-syslog-sim",
        learningObjectives: [
          "Popíšeš architekturu SNMP (Manager vs. Agent), rozlišíš dotazy na portu UDP 161 (GET, GETNEXT/WALK, SET) od asynchronních hlášení TRAP (UDP 162) a význam MIB/OID.",
          "Porovnáš nešifrované community stringy v SNMPv1/v2c s bezpečným režimem SNMPv3 `authPriv` (autentizace + šifrování).",
          "Navrhneš centralizované logování pomocí protokolu Syslog včetně portů (UDP/TCP 514 vs. TLS 6514), kategorií Facility a osmi úrovní Severity (0 Emergency až 7 Debug)."
        ],
        takeaways: [
          "SNMP odděluje pravidelné dotazování Managera na Agentovy proměnné přes UDP 161 (GET, GETNEXT/GETBULK, SET) od okamžitých poplachů TRAP posílaných Agentem na UDP 162.",
          "Jednotlivé sledované metriky (zatížení CPU, bajty na rozhraní, teplota) jsou organizovány do stromové databáze MIB a adresovány unikátním číselným identifikátorem OID (např. .1.3.6.1.2.1.1.1.0).",
          "SNMPv1 a SNMPv2c používají nešifrovaný textový community string (`public`/`private`), zatímco moderní SNMPv3 v úrovni authPriv poskytuje silné ověření integrity i šifrování AES.",
          "Syslog centralizuje provozní a bezpečnostní záznamy na logovací server (UDP/TCP 514 nebo šifrovaně TLS TCP 6514) a třídí je podle původu (Facility) a závažnosti od 0 (Emergency) po 7 (Debug)."
        ],
        principle: {
          problem: "Ve firmě spravujete 40 switchů, 10 routerů, UPS zdroje a linuxové servery. Jak průběžně měřit vytížení linek do grafů, okamžitě se dozvědět o výpadku optického portu a mít bezpečně zálohované záznamy o každém přihlášení dříve, než útočník smaže lokální soubory na napadeném stroji?",
          explanation: [
            "První pilíř představuje SNMP (Simple Network Management Protocol) — standard pro monitoring stavu a výkonu síťových prvků (využívají jej nástroje Zabbix, LibreNMS, PRTG nebo Prometheus SNMP Exporter). V síti běží na straně monitorovaného prvku SNMP Agent (router, switch, tiskárna, UPS), který si udržuje databázi dostupných proměnných popsanou souborem MIB (Management Information Base). Každá proměnná v MIB má jednoznačnou adresu v globálním stromu zvanou OID (Object Identifier), například `.1.3.6.1.2.1.1.1.0` pro popis systému (`sysDescr`) nebo čítače přijatých paketů na konkrétním portu.",
            "Centrální dohledový server (SNMP Manager) posílá na port Agentů UDP 161 požadavky `GET` (čtení jednoho OID), `GETNEXT` / `GETBULK` (sekvenční projití celé tabulky, v praxi nástrojem `snmpwalk`) nebo `SET` (vzdálená změna hodnoty). Pokud na switchi náhle spadne uplink port nebo stoupne teplota, nečeká Agent na další pravidelný dotaz Managera a sám odešle na jeho port UDP 162 nečekanou zprávu `TRAP` (případně potvrzovanou `INFORM`). Zatímco starší SNMPv1 a SNMPv2c chrání přístup pouhým heslem v čistém textu (tzv. community string — nechvalně známé výchozí `public` a `private`, které kdokoli odchytí), SNMPv3 přináší uživatelské účty a úroveň `authPriv` (autentizace HMAC-SHA + šifrování AES).",
            "Zatímco SNMP odpovídá na otázku ‚jaká je aktuální hodnota čítače nebo stavu?‘, druhý pilíř — protokol Syslog — sbírá události v podobě textových řádků (‚kdo se přihlásil, jaké pravidlo firewallu zahodilo paket, proč spadla služba‘). Odesílání logů na vyhrazený centrální server (rsyslog, Graylog, SIEM/Wazuh) má dva důvody: switche a levné routery mají malou paměť RAM a po restartu logy ztratí, a na kompromitovaném serveru útočník své stopy v `/var/log` smaže, ale z centrálního logovacího serveru už záznam neodstraní.",
            "Klasický Syslog (RFC 3164 / RFC 5424) běží standardně na portu UDP 514 (minimální režie bez potvrzení) nebo TCP 514 (spolehlivý přenos bez ztrát). Pro citlivé logy se používá šifrovaný Syslog over TLS na portu TCP 6514. Každá zpráva nese prioritu složenou ze dvou údajů: Facility (0–23, zdroj jako `kern`, `auth`, `daemon`, `local0`–`local7`) a Severity (8 stupňů závažnosti: 0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notice, 6 Informational, 7 Debug)."
          ],
          steps: [
            {
              step: "1. Pravidelný dotaz SNMP Manager → Agent (UDP 161)",
              detail: "Dohledový server každých 30–60 s posílá GET/GETBULK dotazy na OID rozhraní a CPU (nejlépe přes SNMPv3 authPriv s SHA a AES)."
            },
            {
              step: "2. Okamžitý poplach SNMP Agent → Manager (UDP 162)",
              detail: "Při náhlé události (linkDown, výpadek napájení UPS) pošle Agent sám zprávu TRAP na UDP 162, aby alarm vznikl ihned."
            },
            {
              step: "3. Generování Syslog události (Facility + Severity 0–7)",
              detail: "Firewall či server vytvoří záznam s časem, zdrojem (např. authpriv) a úrovní závažnosti (např. 4 Warning při chybném hesle)."
            },
            {
              step: "4. Centralizované odeslání na Log Server (514 / TLS 6514)",
              detail: "Zpráva putuje na centrální SIEM/Log server přes UDP/TCP 514 nebo šifrovaně přes TCP 6514 pro dlouhodobou archivaci a korelaci."
            }
          ],
          analogy: "SNMP je jako teploměr, otáčkoměr a kontrolky v autě, kam se řidič pravidelně dívá (GET na 161) nebo mu sama zapípá varovná kontrolka přehřátí (TRAP na 162). Syslog je palubní černá skříňka, která do bezpečného trezoru mimo vozidlo zapisuje každé nastartování, zabrzdění i chybu motoru.",
          comparisonTable: {
            headers: ["Parametr", "SNMPv2c", "SNMPv3 (authPriv)", "Syslog (514 vs. TLS 6514)"],
            rows: [
              ["Porty", "UDP 161 (dotaz) / UDP 162 (TRAP)", "UDP 161 (dotaz) / UDP 162 (TRAP)", "UDP/TCP 514 (plain) / TCP 6514 (TLS)"],
              ["Typ dat", "Strukturované číselné/textové OID z MIB", "Strukturované OID z MIB (64bit čítače)", "Proud událostí s Facility a Severity 0–7"],
              ["Autentizace", "Textový community string (public/private)", "Uživatel + HMAC-SHA-256/512", "V základu žádná (u 6514 X.509 certifikáty)"],
              ["Šifrování", "Žádné (vše v čistém textu)", "Ano (AES-128 / AES-256)", "Pouze ve variantě TLS na portu TCP 6514"],
              ["Typické použití", "Grafy přenosů, stav CPU/RAM, poplachy portů", "Bezpečný monitoring a případně konfigurace (SET)", "Audit přihlášení, blokace FW, ladění chyb"]
            ]
          },
          watchOut: "Nikdy nenechávejte na síťových prvcích zapnuté výchozí SNMP community stringy `public` (čtení) a už vůbec ne `private` (umožňuje přes SNMP `SET` vzdáleně měnit konfiguraci nebo vypnout porty!). Kdekoliv to hardware podporuje, přejděte na SNMPv3 v úrovni `authPriv` a omezte přístup ACL seznamem jen na IP adresu dohledového serveru. U Syslogu pamatujte, že nižší číslo Severity znamená vážnější problém (0 = systém nepoužitelný, 7 = podrobné ladění Debug)."
        },
        example: {
          scenarioTitle: "Dotazování OID přes SNMPv3 `authPriv` a zabezpečené přeposílání logů v rsyslog (TLS 6514)",
          scenarioText: "V prvním bloku porovnáváme čtení stromu rozhraní přes zabezpečený SNMPv3 oproti nezabezpečenému SNMPv2c. Druhý blok ukazuje nastavení centrálního sběru Syslog zpráv přes TLS i vygenerování testovací události.",
          codeBlocks: [
            {
              label: "Porovnání snmpget/snmpwalk v SNMPv2c vs. šifrovaném SNMPv3 authPriv",
              lang: "bash",
              code: "# 1) Nespolehlivy a nesifrovany dotaz SNMPv2c (community 'public' je v cistem textu)\n$ snmpget -v2c -c public 10.10.1.1 1.3.6.1.2.1.1.1.0\n\n# 2) Bezpecny dotaz SNMPv3 v rezimu authPriv (SHA overeni + AES sifrovani)\n$ snmpwalk -v3 -l authPriv -u mon_user \\\n  -a SHA -A 'SilneAuthHeslo123' \\\n  -x AES -X 'SilneSifrovani456' \\\n  10.10.1.1 IF-MIB::ifDescr"
            },
            {
              label: "Syslog: testovací zpráva `logger` a šifrované odesílání v /etc/rsyslog.d/remote.conf",
              lang: "bash",
              code: "# /etc/rsyslog.d/remote.conf — preposlani logu od Severity 'warning' (4) a vyssi pres TCP 514 nebo TLS 6514\n# *.warning   @@10.10.99.10:514       # @@ = TCP (jedno @ = UDP)\n# S TLS sifrovanim na portu 6514 (driver gtls + CA certifikat):\n# action(type=\"omfwd\" target=\"log.firma.cz\" port=\"6514\" protocol=\"tcp\" StreamDriver=\"gtls\" StreamDriverMode=\"1\")\n\n# Rucni odeslani testovaci udalosti (Facility local0, Severity err = 3)\n$ logger -p local0.err -t app-test \"Ztrata spojeni s databazi na portu 5432\""
            }
          ],
          practicalTip: "Při hledání konkrétního OID pro monitorovací systém si ze stránek výrobce (Cisco, MikroTik, APC) stáhněte jeho oficiální MIB soubor nebo prozkoumejte strom naživo příkazem `snmpwalk` — ušetříte si ruční hádání dlouhých číselných větví."
        },
        quiz: [
          {
            question: "Jaký je rozdíl mezi porty UDP 161 a UDP 162 v protokolu SNMP?",
            options: [
              "UDP 161 je pro Syslog a UDP 162 pro SNMP.",
              "Na UDP 161 posílá Manager dotazy (GET/WALK/SET) Agentovi, kdežto na UDP 162 posílá Agent sám asynchronní upozornění TRAP Managerovi.",
              "UDP 161 je pro SNMPv1 a UDP 162 pro SNMPv3.",
              "UDP 161 šifruje provoz a UDP 162 ho posílá v čistém textu."
            ],
            correctIndex: 1,
            explanation: "SNMP Agent naslouchá dotazům na UDP 161, zatímco SNMP Manager (dohledový server) přijímá asynchronní poplachy TRAP na portu UDP 162."
          },
          {
            question: "Která úroveň zabezpečení SNMPv3 zajišťuje jak ověření identity a integrity zprávy, tak šifrování obsahu?",
            options: [
              "`noAuthNoPriv`",
              "`authNoPriv`",
              "`communityPublic`",
              "`authPriv`"
            ],
            correctIndex: 3,
            explanation: "Úroveň `authPriv` v SNMPv3 kombinuje autentizaci (Auth – např. HMAC-SHA) se šifrováním dat (Priv – např. AES)."
          },
          {
            question: "Která úroveň závažnosti (Severity) v protokolu Syslog označuje nejkritičtější stav systému (okamžitá nepoužitelnost)?",
            options: [
              "0 (Emergency)",
              "7 (Debug)",
              "1 (Informational)",
              "8 (Fatal)"
            ],
            correctIndex: 0,
            explanation: "Syslog definuje 8 úrovní od 0 do 7, kde 0 (Emergency) je nejvážnější stav a 7 (Debug) nejméně závažné ladicí zprávy."
          },
          {
            question: "Na jakém portu běží zabezpečený přenos Syslog zpráv šifrovaný pomocí TLS?",
            options: [
              "UDP 514",
              "TCP 6514",
              "UDP 162",
              "TCP 25"
            ],
            correctIndex: 1,
            explanation: "Klasický nešifrovaný Syslog využívá UDP/TCP 514; standardizovaný Syslog over TLS (RFC 5425) používá port TCP 6514."
          }
        ]
      },

      // =========================================================================
      // TÉMA 16: Další aplikační protokoly (VoIP SIP/RTP, WebSocket, IoT MQTT)
      // =========================================================================
      {
        id: "sip-rtp-mqtt",
        number: 16,
        moduleId: "remote-realtime-protocols",
        mandatory: true,
        title: "Další aplikační protokoly: VoIP (SIP/RTP), WebSocket a IoT MQTT",
        shortTitle: "SIP/RTP, WebSocket & MQTT",
        subtitle: "VoIP signalizace SIP (5060/5061) a média RTP (UDP/jitter), obousměrný WebSocket (ws/wss, HTTP 101) a IoT protokol MQTT (1883/8883, Pub/Sub, QoS 0/1/2).",
        cardSummary: "VoIP signalizace SIP (5060) a média RTP, plně duplexní WebSocket (101) a IoT MQTT (1883/8883).",
        difficulty: "Pokročilé",
        accentColor: "#be123c",
        tags: ["SIP / SIPS", "RTP / RTCP", "WebSocket (ws / wss)", "Publish / Subscribe (Pub/Sub)", "QoS v MQTT (0, 1, 2)", "SDP (Session Description Protocol)"],
        video: {
          hasBundledVideo: true,
          previewMode: "video",
          src: "media/sip-rtp-mqtt.mp4",
          poster: "media/posters/sip-rtp-mqtt.jpg",
          startTime: 0,
          durationLabel: "0:13",
          chapters: [
            { label: "1. VoIP rozdělení SIP (5060) a RTP (UDP) (0:00)", time: 0 },
            { label: "2. WebSocket Upgrade (101) a MQTT Broker (0:06)", time: 6.5 }
          ],
          transcript: "0:00–0:07: VoIP SIP a RTP – „Internetová telefonie naváže hovor protokolem SIP, ale samotný hlas přenáší plynule přes protokol RTP.“\n0:07–0:13: WebSocket a MQTT – „WebSocket drží obousměrné spojení s webem a lehký protokol MQTT rozesílá zprávy přes brokera.“"
        },
        animationType: "sip-rtp-mqtt",
        labType: "realtime-app-sim",
        learningObjectives: [
          "Vysvětlíš rozdělení VoIP telefonie na signalizační protokol SIP (UDP/TCP 5060, TLS 5061) a mediální proud RTP přes dynamické UDP porty včetně vlivu jitteru.",
          "Popíšeš mechanismus navázání plně duplexního spojení WebSocket (`ws://` / `wss://`) pomocí HTTP požadavku Upgrade se stavovým kódem `101 Switching Protocols`.",
          "Navrhneš IoT komunikaci s protokolem MQTT (TCP 1883 / TLS 8883) založenou na modelu Publish/Subscribe přes Broker, tématech a úrovních doručení QoS 0, 1 a 2."
        ],
        takeaways: [
          "VoIP striktně odděluje signalizaci hovoru pomocí SIP (UDP/TCP 5060, šifrovaně SIPS/TLS 5061 — zprávy INVITE, 200 OK, ACK, BYE) od přenosu hlasu protokolem RTP nad UDP (dynamické porty, ochrana před jitterem a zpožděním).",
          "WebSocket (`ws://` 80 / `wss://` 443) začíná jako klasický HTTP požadavek Upgrade a po odpovědi `101 Switching Protocols` přepne spojení na trvalý plně duplexní kanál bez zbytečných HTTP hlaviček.",
          "IoT protokol MQTT (TCP 1883 / šifrovaně TLS 8883) nahrazuje přímé dotazování lehkým modelem Publish/Subscribe přes centrální MQTT Broker s hierarchickými tématy (např. `dum/obyvak/teplota`).",
          "MQTT nabízí tři úrovně garance doručení QoS: 0 (nejvýše jednou bez potvrzení), 1 (nejméně jednou s PUBACK) a 2 (přesně jednou bez duplicit pomocí 4krokové výměny)."
        ],
        principle: {
          problem: "Běžný model HTTP ‚klient se zeptá, server odpoví‘ nestačí pro telefonní hovor v reálném čase, živý chat nebo tisíce bateriových IoT čidel v továrně. Jak síťové protokoly řeší okamžitou obousměrnou komunikaci bez zasekávání a s minimální datovou režií?",
          explanation: [
            "U internetové telefonie (VoIP) se spojují dvě různé potřeby: spolehlivé vytočení čísla a samotný přenos hlasu bez zasekávání. Proto jsou rozdělené do dvou protokolů. Signalizaci řeší textový protokol SIP (Session Initiation Protocol) na portu UDP/TCP 5060 (případně šifrovaně SIPS přes TLS na TCP 5061). Telefon se registruje k ústředně zprávou `REGISTER`, při vytáčení pošle `INVITE` (uvnitř nese tělo SDP s popisem podporovaných kodeků G.711/Opus a číslem UDP portu pro příjem hlasu), volaný odpoví `180 Ringing` (vyzvání), po zvednutí `200 OK`, volající potvrdí `ACK` a na konci hovoru jedna ze stran pošle `BYE`.",
            "Jakmile se hovor spojí, hlas vůbec neputuje přes SIP ani TCP! Přechází přímo mezi účastníky (nebo přes mediální bránu) protokolem RTP (Real-time Transport Protocol) na dynamických UDP portech (často 10000–20000), doprovázeným kontrolním protokolem RTCP (statistiky ztrátovosti). Důvod použití UDP je zásadní: pokud se ztratí 20ms úsek hlasu, jeho dodatečné přeposílání přes TCP by hovor zpozdilo a zaseklo. Kvalitu hovoru nejvíce ohrožuje zpoždění (latence pod 150 ms) a jeho kolísání zvané jitter (vyrovnává se krátkou vyrovnávací pamětí jitter buffer a prioritou QoS v síti; šifrování zajišťuje SRTP).",
            "V webových prohlížečích potřebují aplikace (chaty, živé kurzy akcií, upozornění, online hry) přijímat zprávy ze serveru okamžitě, aniž by se klient musel každou sekundu ptát přes HTTP polling. Protokol WebSocket (`ws://` přes port 80, doporučeně šifrovaně `wss://` přes port 443) tento problém řeší elegantně: klient pošle standardní HTTP/1.1 požadavek s hlavičkami `Upgrade: websocket` a `Connection: Upgrade`. Server odpoví kódem `101 Switching Protocols` a stávající TCP spojení zůstává otevřené jako trvalý plně duplexní (full-duplex) kanál, kudy mohou obě strany posílat lehké rámce dat kdykoli a obousměrně současně.",
            "Pro komunikaci chytrých zařízení a senzorů (IoT) s omezenou pamětí a slabou linkou vznikl binární protokol MQTT (TCP 1883 nešifrovaně, doporučeně TCP 8883 přes TLS; v prohlížečích i nad WebSocketem). Namísto přímého propojení každého čidla s každou aplikací využívá architekturu Publish/Subscribe kolem centrálního uzlu zvaného MQTT Broker (např. Mosquitto, EMQX). Teploměr jen publikuje (`PUBLISH`) hodnotu do tématu `skola/patro1/teplota` a libovolný počet odběratelů (`SUBSCRIBE`, i se zástupnými znaky `+` pro jednu úroveň a `#` pro celý podstrom) zprávu ihned dostane. Pro různé scénáře volíme kvalitu doručení: QoS 0 (pošli a zapomeň — nejrychlejší), QoS 1 (potvrzení PUBACK — zpráva určitě dorazí, ale může přijít dvakrát) nebo QoS 2 (4krokový handshake — dorazí přesně jednou bez duplicit)."
          ],
          steps: [
            {
              step: "1. VoIP: SIP signalizace (5060/5061) domluví hovor a SDP porty",
              detail: "Volající odešle SIP INVITE s SDP popisem kodeků a svého UDP portu. Po 180 Ringing, 200 OK a ACK je hovor navázán."
            },
            {
              step: "2. VoIP: Přenos hlasu přes RTP/SRTP (dynamické UDP porty)",
              detail: "Hlasové rámce tečou v reálném čase přes UDP bez čekání na ztracené pakety; jitter buffer vyhlazuje drobné výkyvy sítě."
            },
            {
              step: "3. WebSocket: HTTP Upgrade (kód 101) na plně duplexní kanál",
              detail: "Prohlížeč přes port 443 (wss://) pošle Upgrade: websocket, server potvrdí 101 Switching Protocols a data proudí obousměrně."
            },
            {
              step: "4. IoT MQTT: Publish/Subscribe přes Broker (1883/8883)",
              detail: "Senzor odešle PUBLISH na téma s zvoleným QoS (0/1/2) a Broker rozdistribuuje zprávu všem přihlášeným odběratelům."
            }
          ],
          analogy: "SIP je jako sekretářka, která zavolá do druhé firmy a domluví místnost i jazyk schůzky (‚sejdeme se u stolu 14000, mluvíme česky‘), a RTP je samotný plynulý rozhovor u stolu. WebSocket je stálá otevřená telefonní linka mezi prohlížečem a serverem místo psaní dopisů tam a zpět. A MQTT Broker je nástěnka se šanony témat: čidlo připíchne lístek do šanonu ‚teplota‘ a všichni zájemci o tento šanon si ho hned přečtou.",
          comparisonTable: {
            headers: ["Protokol", "Standardní porty", "Architektura / Transport", "Typické využití a klíčová vlastnost"],
            rows: [
              ["SIP / SIPS", "UDP/TCP 5060, TLS 5061", "Signalizace Request/Response (+ SDP)", "Navázání, přepojení a ukončení VoIP/video hovoru (INVITE/OK/ACK/BYE)"],
              ["RTP / SRTP", "UDP dynamické (10000–20000)", "Proud médií bez retransmisí (UDP)", "Nízká latence přenosu hlasu a videa; vyrovnávání jitteru a RTCP"],
              ["WebSocket (ws/wss)", "TCP 80 / TLS TCP 443", "Full-duplex nad TCP po HTTP 101 Upgrade", "Webové chaty, živé burzy, notifikace a multiplayer hry v prohlížeči"],
              ["MQTT / MQTTS", "TCP 1883 / TLS TCP 8883", "Publish / Subscribe přes centrální Broker", "IoT čidla a automatizace s nízkou režií a volbou QoS 0 / 1 / 2"]
            ]
          },
          watchOut: "U VoIP v sítích za firewallem a NATem jsou dva klasické kameny úrazu: jednosměrný zvuk (volání zvoní přes SIP 5060, ale po zvednutí jedna strana neslyší druhou, protože NAT zablokoval dynamické UDP porty RTP nebo uvnitř SDP zůstala privátní IP adresa) a problematický `SIP ALG` helper na levných routerech, který poškozuje moderní SIP hlavičky. U MQTT pamatujte, že výchozí port TCP 1883 je zcela bez šifrování i hesla — v praxi vždy zapínejte autentizaci a TLS na portu 8883."
        },
        example: {
          scenarioTitle: "Ukázka SIP + WebSocket Upgrade handshaku a test MQTT Brokeru s TLS a QoS",
          scenarioText: "První blok ukazuje textovou strukturu VoIP požadavku SIP `INVITE` se SDP popisem kodeků a WebSocket `101 Switching Protocols` handshaku. Druhý blok ukazuje reálné příkazy klienta `mosquitto` pro publikování a odběr IoT témat se zástupným znakem a TLS.",
          codeBlocks: [
            {
              label: "1. Zpráva SIP INVITE (se SDP pro RTP) a WebSocket Upgrade (101)",
              lang: "http",
              code: "# --- SIP Signalizace (port 5060) ---\nINVITE sip:petr@voip.firma.cz SIP/2.0\nVia: SIP/2.0/UDP 10.10.20.15:5060;branch=z9hG4bK-7721\nFrom: \"Jan\" <sip:jan@voip.firma.cz>;tag=a12\nTo: <sip:petr@voip.firma.cz>\nContent-Type: application/sdp\n\nv=0\nm=audio 16420 RTP/AVP 0 111    # Hlas pobezi na UDP portu 16420 (kodeky G.711/Opus)\n\n# --- WebSocket HTTP Upgrade (port 443 / wss://) ---\nGET /live-chat HTTP/1.1\nHost: app.firma.cz\nUpgrade: websocket\nConnection: Upgrade\n-> Odpoved serveru: HTTP/1.1 101 Switching Protocols"
            },
            {
              label: "2. IoT MQTT Publish / Subscribe přes Mosquitto (TLS 8883 a QoS 1)",
              lang: "bash",
              code: "# 1) Odber vsech senzoru teploty v cele budove (+ = prave jedna uroven cesty)\n$ mosquitto_sub -h broker.firma.cz -p 8883 --cafile /etc/ssl/certs/ca.crt \\\n  -u iot_reader -P TajneHeslo -t \"budova/+/teplota\" -q 1 -v\n\n# 2) Publikovani hodnoty z cidla s garantovanym dorucenim QoS 1 (At least once)\n$ mosquitto_pub -h broker.firma.cz -p 8883 --cafile /etc/ssl/certs/ca.crt \\\n  -u cidlo_01 -P CidloHeslo -t \"budova/ucebna2/teplota\" -m \"22.4\" -q 1"
            }
          ],
          practicalTip: "Při návrhu IoT témat v MQTT používejte přehlednou hierarchii od obecného k detailu (např. `lokalita/mistnost/zarizeni/metrika`) a nikdy nezačínejte název tématu lomítkem `/` (vytvořilo by to zbytečnou prázdnou první úroveň při filtrování `+`)."
        },
        quiz: [
          {
            question: "Proč VoIP přenáší samotný hlas protokolem RTP přes UDP namísto spolehlivého protokolu TCP?",
            options: [
              "Protože TCP nedokáže přenášet binární zvuková data.",
              "Protože ztracený 20ms balíček hlasu nemá smysl opožděně znovu posílat — retransmise v TCP by vyvolala zasekávání hovoru v reálném čase.",
              "Protože firewall vždy zakazuje TCP spojení pro mikrofony.",
              "Protože SIP nepodporuje protokol TCP."
            ],
            correctIndex: 1,
            explanation: "U hlasu v reálném čase je klíčová plynulost a nízká latence. Zpožděný opakovaně poslaný paket už je v hovoru k ničemu a zbytečně by zadrhl proud následujících slov."
          },
          {
            question: "Který stavový kód HTTP vrátí server při úspěšném přepnutí spojení na plně duplexní WebSocket?",
            options: [
              "200 OK",
              "301 Moved Permanently",
              "101 Switching Protocols",
              "426 Upgrade Required"
            ],
            correctIndex: 2,
            explanation: "Na požadavek obsahující hlavičky `Upgrade: websocket` a `Connection: Upgrade` server odpoví `101 Switching Protocols` a otevřené TCP spojení se změní na WebSocket."
          },
          {
            question: "Co znamená úroveň kvality doručení QoS 1 v protokolu MQTT?",
            options: [
              "Zpráva se odešle nejvýše jednou bez jakéhokoli potvrzení (pošli a zapomeň).",
              "Zpráva dorazí nejméně jednou — odesílatel vyžaduje potvrzení `PUBACK`, takže v síti může při ztrátě potvrzení vzniknout duplicita.",
              "Zpráva dorazí zaručeně přesně jednou bez jediné duplicity.",
              "Zpráva se automaticky uloží do databáze MySQL na klientovi."
            ],
            correctIndex: 1,
            explanation: "MQTT rozlišuje QoS 0 (At most once), QoS 1 (At least once – potvrzeno PUBACK) a QoS 2 (Exactly once – 4krokové doručení bez duplicit)."
          },
          {
            question: "Jaký je typický projev chyby, kdy funguje SIP signalizace (telefon zazvoní a hovor se spojí), ale účastníci se vzájemně neslyší?",
            options: [
              "Selhal DNS MX záznam cílové domény.",
              "Zablokovaný nebo špatně přeložený mediální proud RTP na dynamických UDP portech (např. chybou NAT / firewallu nebo SIP ALG).",
              "Není spuštěn protokol MQTT Broker na portu 1883.",
              "V prohlížeči není zapnutá hlavička HSTS."
            ],
            correctIndex: 1,
            explanation: "SIP na portu 5060 obstará pouze vyzvánění a navázání hovoru; vlastní zvuk teče zvlášť přes RTP na dynamických UDP portech, které bývají za špatně nastaveným NATem či firewallem blokované."
          }
        ]
      }
    ],

    // =========================================================================
    // SLOVNÍČEK POJMŮ – ČÁST 2 (N–Z, 52 pojmů)
    // =========================================================================
    glossary: [
      {
        term: "NAT / PAT",
        category: "FTP, FTPS & Samba",
        shortDef: "Překlad privátních IPv4 adres vnitřní sítě na veřejnou adresu brány s využitím tabulky portů.",
        detail: "NAT/PAT umožňuje stovkám zařízení z privátní sítě sdílet jednu veřejnou IPv4 adresu. Komplikuje však protokoly, které vkládají IP adresy dovnitř aplikačních dat nebo otevírají spojení zpět ke klientovi — typickým příkladem je Aktivní režim FTP (PORT), který za NATem selhává, na rozdíl od Pasivního režimu (PASV).",
        relatedTopicId: "ftp-active-passive-ftps"
      },
      {
        term: "NetBIOS over TCP/IP (NBT)",
        category: "FTP, FTPS & Samba",
        shortDef: "Historická přenosová vrstva pro starší sdílení Windows a SMBv1 na portech UDP 137–138 a TCP 139.",
        detail: "Před příchodem přímého SMB na portu TCP 445 zajišťoval NetBIOS jmenné překlady v lokální síti (UDP 137), datagramy (UDP 138) a relace (TCP 139). V moderních sítích s SMB2/SMB3 a DNS se již nepoužívá a doporučuje se jej vypínat.",
        relatedTopicId: "samba-smb"
      },
      {
        term: "NFS (Network File System)",
        category: "FTP, FTPS & Samba",
        shortDef: "Nativní síťový souborový systém pro UNIX a Linux komunikující ve verzi NFSv4 na portu TCP 2049.",
        detail: "Na rozdíl od SMB, které dominuje v prostředí Windows a staví na uživatelské autentizaci (Kerberos/NTLMv2), tradiční NFS ověřovalo přístup podle IP adresy klienta a čísel UID/GID (moderní NFSv4.1+ podporuje i Kerberos a šifrování).",
        relatedTopicId: "samba-smb"
      },
      {
        term: "NLA (Network Level Authentication)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Bezpečnostní rozšíření Microsoft RDP vyžadující ověření uživatele ještě před zahájením grafické relace.",
        detail: "Díky NLA (nad protokolem CredSSP) nemusí RDP server alokovat prostředky a zobrazovat přihlašovací plochu neznámým útočníkům — neověřené pokusy odmítne hned na začátku, čímž chrání před DoS útoky a zranitelnostmi v přihlašovací obrazovce.",
        relatedTopicId: "rdp-vnc"
      },
      {
        term: "NS záznam (Name Server)",
        category: "DNS, DHCP & NTP",
        shortDef: "DNS záznam určující autoritativní jmenné servery, které spravují záznamy pro danou doménu.",
        detail: "NS záznamy propojují hierarchii DNS směrem shora dolů: TLD servery (např. `.cz`) pomocí NS delegují dotazy pro `firma.cz` na její konkrétní autoritativní DNS servery.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "NTLMv2",
        category: "FTP, FTPS & Samba",
        shortDef: "Autentizační protokol Microsoftu typu výzva/odpověď používaný u samostatných serverů SMB a Samba mimo doménu AD.",
        detail: "Klient neposílá po síti čisté heslo, ale odpověď vypočtenou z hashe hesla a náhodné výzvy (challenge). V podnikových sítích Active Directory jej nahrazuje bezpečnější Kerberos odolnější proti relay útokům.",
        relatedTopicId: "samba-smb"
      },
      {
        term: "NTP (Network Time Protocol)",
        category: "DNS, DHCP & NTP",
        shortDef: "Protokol na portu UDP 123 pro přesnou synchronizaci systémového času v počítačových sítích.",
        detail: "NTP pracuje v hierarchii vrstev Stratum 0–15 a pomocí čtyř časových značek T1–T4 odhaduje zpoždění sítě (RTT) i přesný posun hodin. Bez přesného času nefunguje ověřování certifikátů TLS, Kerberos ani korelace logů.",
        relatedTopicId: "ntp-time"
      },
      {
        term: "OCSP / OCSP Stapling",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Mechanismus ověřování, zda certifikát X.509 nebyl před koncem platnosti předčasně odvolán (revokován).",
        detail: "Při OCSP se prohlížeč ptá certifikační autority; efektivnější OCSP Stapling znamená, že podepsané časové potvrzení o platnosti získá přímo webový server a přiloží ho ke svému certifikátu během TLS handshaku (rychlejší a šetří soukromí uživatele).",
        relatedTopicId: "https-tls"
      },
      {
        term: "OID (Object Identifier)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Jednoznačný tečkou oddělený číselný identifikátor uzlu ve stromové databázi SNMP MIB.",
        detail: "Například OID `.1.3.6.1.2.1.1.1.0` ukazuje na systémový popis zařízení (`sysDescr`) a pod větví `ifTable` leží čítače provozu na jednotlivých síťových rozhraních.",
        relatedTopicId: "snmp-syslog"
      },
      {
        term: "OpenSSH",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Nejrozšířenější open-source sada nástrojů implementující bezpečný protokol SSH-2, SFTP a SCP.",
        detail: "Součástí OpenSSH jsou klienti `ssh`, `sftp`, `scp`, generátor klíčů `ssh-keygen` i serverový démon `sshd`. Je výchozím nástrojem pro správu Linuxu, macOS i moderních Windows.",
        relatedTopicId: "ssh-telnet-sftp"
      },
      {
        term: "OSPF (Open Shortest Path First)",
        category: "RIP, OSPF & BGP",
        shortDef: "Vnitřní Link-State směrovací protokol (IGP, IP protokol 89) počítající nejkratší cestu Dijkstrovým algoritmem SPF.",
        detail: "Všechny routery v jedné oblasti (páteřní Area 0) sdílejí kompletní topologickou databázi LSDB a vyhodnocují trasy podle metriky Cost odvozené od šířky pásma linek.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "Paket (Packet)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Datová jednotka (PDU) 3. síťové vrstvy modelu OSI nesoucí zdrojovou a cílovou IP adresu.",
        detail: "Na základě cílové IP adresy v hlavičce paketu rozhodují routery o dalším směrování sítí a při každém skoku snižují hodnotu čítače TTL.",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "Pasivní režim FTP (PASV / EPSV)",
        category: "FTP, FTPS & Samba",
        shortDef: "Režim FTP, při němž otevře efemérní datový port server a klient sám naváže řídicí i datové spojení směrem ven.",
        detail: "Protože obě TCP spojení iniciuje klient zevnitř sítě ven, pasivní režim bez problémů prochází klientským NATem i stavovým firewallem (na rozdíl od aktivního režimu PORT).",
        relatedTopicId: "ftp-active-passive-ftps"
      },
      {
        term: "PDU (Protocol Data Unit)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Souhrnné označení datové jednotky na jednotlivé vrstvě síťové architektury při zapouzdřování.",
        detail: "Při průchodu dat od aplikace dolů k síťové kartě se PDU postupně nazývá Data (aplikace) → Segment/Datagram (transportní TCP/UDP) → Paket (síťová IP) → Rámec (linková Ethernet) → Bity (fyzická vrstva).",
        relatedTopicId: "tcpip-icmp-arp"
      },
      {
        term: "Peering & Tranzit (BGP)",
        category: "RIP, OSPF & BGP",
        shortDef: "Dva základní obchodní a směrovací vztahy mezi autonomními systémy v protokolu BGP.",
        detail: "Při peeringu si dva operátoři či obsahové sítě vyměňují provoz svých zákazníků napřímo (často v uzlu NIX.CZ zdarma). Při tranzitu si menší síť platí u většího ISP za přístup do celého zbytku internetu.",
        relatedTopicId: "routing-bgp"
      },
      {
        term: "PKI (Public Key Infrastructure)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Infrastruktura veřejných klíčů spojující digitální certifikáty X.509 s identitou domén či osob přes důvěryhodné CA.",
        detail: "PKI vytváří strom důvěry od kořenových certifikačních autorit (Root CA předinstalovaných v OS a prohlížečích) přes zprostředkující Intermediate CA až k jednotlivým webovým a poštovním serverům.",
        relatedTopicId: "https-tls"
      },
      {
        term: "POP3 / POP3S",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Post Office Protocol v3 – jednoduchý protokol na TCP 110 (šifrovaně POP3S 995) pro stažení pošty na lokální počítač.",
        detail: "POP3 pracuje pouze se složkou doručené pošty a v typickém nastavení zprávy po stažení ze serveru maže. Nehodí se tak pro moderní synchronizaci pošty na více zařízeních, kde jej nahradil IMAP4.",
        relatedTopicId: "mail-smtp-imap-pop3"
      },
      {
        term: "Port (TCP/UDP)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "16bitové číslo (0–65535) v transportní hlavičce TCP/UDP, které rozlišuje konkrétní aplikaci nebo službu na jednom IP hostiteli.",
        detail: "Rozděluje se na Well-known porty (0–1023, např. 22 SSH, 443 HTTPS), Registrované porty (1024–49151, např. 1883 MQTT, 3389 RDP) a Efemérní porty klienta (49152–65535).",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "PTR záznam (Pointer)",
        category: "DNS, DHCP & NTP",
        shortDef: "Reverzní DNS záznam překládající IP adresu zpět na doménové jméno (v zóně `in-addr.arpa` / `ip6.arpa`).",
        detail: "Reverzní záznam PTR je kritický zejména u poštovních serverů (SMTP) — cílové servery často odmítají poštu z IP adres, jejichž PTR záznam neodpovídá jménu serveru.",
        relatedTopicId: "dns-protocol"
      },
      {
        term: "Publish / Subscribe (Pub/Sub)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Komunikační model protokolu MQTT, kde producenti publikují zprávy do témat na centrálním Brokeru a odběratelé si je předplácejí.",
        detail: "Výhodou Pub/Sub je volné provázání: IoT čidlo nepotřebuje znát IP adresy ani počet aplikací, které jeho data čtou — stačí mu spojení s MQTT Brokerem.",
        relatedTopicId: "sip-rtp-mqtt"
      },
      {
        term: "QoS v MQTT (0, 1, 2)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Tři úrovně spolehlivosti doručení zprávy mezi MQTT klientem a Brokerem.",
        detail: "QoS 0 (*At most once*) odešle zprávu jednou bez potvrzení; QoS 1 (*At least once*) zaručí doručení potvrzením PUBACK s možností duplicit; QoS 2 (*Exactly once*) garantuje doručení přesně jednou bez duplicit pomocí čtyřkrokové výměny.",
        relatedTopicId: "sip-rtp-mqtt"
      },
      {
        term: "QUIC",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Moderní transportní protokol nad UDP (port 443) s vestavěným TLS 1.3 a nezávislými datovými proudy pro HTTP/3.",
        detail: "QUIC řeší zpoždění handshaku i blokování všech toků jedním ztraceným paketem (Head-of-Line Blocking na transportní vrstvě), které trápilo TCP v HTTP/2.",
        relatedTopicId: "http-versions"
      },
      {
        term: "RDP (Remote Desktop Protocol)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Vzdálená grafická plocha společnosti Microsoft na portu TCP/UDP 3389 přenášející vykreslovací instrukce.",
        detail: "Nabízí podporu více souběžných uživatelských relací na Windows Serveru, přesměrování schránky, audia i tiskáren, šifrování TLS a předsazenou autentizaci NLA. Přes internet patří vždy za VPN nebo RD Gateway.",
        relatedTopicId: "rdp-vnc"
      },
      {
        term: "RFB (Remote Framebuffer)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Jednoduchý podkladový protokol VNC přenášející rastrové obdélníky pixelů obrazové paměti na portu TCP 5900+N.",
        detail: "RFB pracuje s pixely nezávisle na operačním systému, což z něj dělá univerzální nástroj, ale základní verze protokolu nešifruje obraz ani nepoužívá silnou autentizaci.",
        relatedTopicId: "rdp-vnc"
      },
      {
        term: "RIPv2",
        category: "RIP, OSPF & BGP",
        shortDef: "Klasický Distance Vector směrovací protokol (UDP 520) hodnotící cesty pouze podle počtu skoků (hop count, max 15).",
        detail: "RIPv2 podporuje podsítě (VLSM) a rozesílá směrovací tabulky na multicast `224.0.0.9`. Hodnota metriky 16 znamená nedosažitelnou síť; ve větších sítích jej plně nahradil OSPF.",
        relatedTopicId: "routing-rip-ospf"
      },
      {
        term: "RTP / RTCP",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Real-time Transport Protocol pro přenos hlasu a videa v reálném čase nad UDP (doplněný kontrolním RTCP).",
        detail: "RTP nese časová razítka a sekvenční čísla pro správné poskládání audio/video rámců a vyrovnání jitteru na dynamických UDP portech; jeho šifrovaná varianta se nazývá SRTP.",
        relatedTopicId: "sip-rtp-mqtt"
      },
      {
        term: "RTT (Round-Trip Time)",
        category: "DNS, DHCP & NTP",
        shortDef: "Čas potřebný k odeslání signálu či paketu k cíli a přijetí odpovědi zpět (měřeno v milisekundách).",
        detail: "RTT přímo ovlivňuje rychlost navázání spojení (TCP handshake = 1 RTT, TLS 1.3 handshake = 1 RTT) i výpočty přesného času v protokolu NTP.",
        relatedTopicId: "ntp-time"
      },
      {
        term: "Samba (smbd)",
        category: "FTP, FTPS & Samba",
        shortDef: "Open-source implementace protokolu SMB/CIFS a Active Directory služeb pro Linux a BSD.",
        detail: "Samba pomocí démona `smbd` a konfigurace `/etc/samba/smb.conf` umožňuje linuxovému serveru sdílet soubory a tiskárny do sítí Windows a macOS s plnou podporou moderního SMBv3.",
        relatedTopicId: "samba-smb"
      },
      {
        term: "SAN (Subject Alternative Name)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Rozšíření certifikátu X.509 obsahující přesný seznam všech doménových jmen či IP adres, pro které certifikát platí.",
        detail: "Moderní prohlížeče ověřují název navštíveného webu výhradně proti poli SAN (např. `firma.cz` i `www.firma.cz`), nikoli již pouze podle staršího pole Common Name (CN).",
        relatedTopicId: "https-tls"
      },
      {
        term: "SCP (Secure Copy)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Jednoduchý nástroj a protokol pro kopírování souborů přes SSH na portu TCP 22.",
        detail: "Na rozdíl od interaktivního SFTP neumí SCP spravovat vzdálené adresáře ani spolehlivě navazovat přerušené přenosy. Moderní OpenSSH již při volání příkazu `scp` na pozadí používá protokol SFTP.",
        relatedTopicId: "ssh-telnet-sftp"
      },
      {
        term: "SDP (Session Description Protocol)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Textový formát přenášený uvnitř SIP zpráv, kterým si strany VoIP hovoru domluví kodeky a RTP porty.",
        detail: "V SDP bloku každá strana oznámí svou IP adresu, číslo dynamického UDP portu pro zvuk či video a seznam podporovaných kodeků (např. G.711 PCMA/PCMU nebo Opus).",
        relatedTopicId: "sip-rtp-mqtt"
      },
      {
        term: "SFTP (SSH File Transfer Protocol)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Bezpečný protokol pro přenos a správu souborů běžící jako subsystém v šifrovaném kanálu SSH na portu TCP 22.",
        detail: "Na rozdíl od FTPS (který otevírá samostatné datové porty a vyžaduje X.509 certifikáty) si SFTP vystačí s jediným TCP portem 22, čímž bez potíží prochází firewally i NATem.",
        relatedTopicId: "ssh-telnet-sftp"
      },
      {
        term: "SIP / SIPS",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Session Initiation Protocol – textový signalizační protokol VoIP na UDP/TCP 5060 (šifrovaně SIPS přes TLS na TCP 5061).",
        detail: "SIP řeší registraci telefonů (`REGISTER`), vytočení hovoru (`INVITE`), vyzvánění (`180 Ringing`), přijetí (`200 OK` + `ACK`) a zavěšení (`BYE`). Vlastní hlas pak proudí mimo SIP přes RTP.",
        relatedTopicId: "sip-rtp-mqtt"
      },
      {
        term: "SMB2 / SMB3",
        category: "FTP, FTPS & Samba",
        shortDef: "Moderní verze síťového protokolu Server Message Block na portu TCP 445 pro sdílení souborů a tiskáren.",
        detail: "Nahrazují zranitelné SMBv1 (EternalBlue/WannaCry). SMBv3 přidává nativní AES šifrování datových přenosů, povinné podepisování rámců (SMB Signing) proti MITM a vyšší přenosový výkon.",
        relatedTopicId: "samba-smb"
      },
      {
        term: "SMTP / SMTPS",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Simple Mail Transfer Protocol – protokol pro odesílání a přenos e-mailů mezi servery (TCP 25) a od klientů (587 / 465).",
        detail: "Klienti posílají poštu autentizovaně přes Submission port 587 se STARTTLS nebo přes implicitně šifrovaný port 465 (SMTPS). Mezi poštovními servery (MTA) pak přenos probíhá po portu TCP 25.",
        relatedTopicId: "mail-smtp-imap-pop3"
      },
      {
        term: "SNI (Server Name Indication)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Rozšíření protokolu TLS, jímž klient v úvodní zprávě ClientHello oznámí název požadované domény.",
        detail: "Díky SNI dokáže jediný webový server s jednou veřejnou IP adresou vrátit správný X.509 certifikát pro stovky různých hostovaných domén (virtuální hostitelé).",
        relatedTopicId: "https-tls"
      },
      {
        term: "SNMP (v1 / v2c / v3)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Simple Network Management Protocol – standardní dohledový protokol na portech UDP 161 (dotazy) a UDP 162 (TRAP).",
        detail: "Zatímco SNMPv1 a SNMPv2c posílají heslo (community string) v čistém textu, moderní SNMPv3 v režimu `authPriv` zajišťuje uživatelskou autentizaci (SHA) i šifrování provozu (AES).",
        relatedTopicId: "snmp-syslog"
      },
      {
        term: "Socket (Soket)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Kombinace IP adresy a čísla transportního portu (např. `192.0.2.10:443`) jednoznačně identifikující koncový bod spojení.",
        detail: "Operační systém rozlišuje jednotlivé síťové relace právě podle čtveřice soketů: zdrojová IP + zdrojový port a cílová IP + cílový port.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "SPF (Sender Policy Framework)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "DNS TXT záznam definující seznam IP adres a serverů oprávněných odesílat e-maily za danou doménu.",
        detail: "Příjemcův poštovní server porovná IP adresu odesílajícího MTA proti SPF záznamu (`v=spf1 mx ... -all`) a odhalí tak pokusy o podvržení domény.",
        relatedTopicId: "mail-smtp-imap-pop3"
      },
      {
        term: "SSH (Secure Shell)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Šifrovaný protokol na portu TCP 22 pro bezpečný vzdálený příkazový řádek, přenos souborů (SFTP) a tunelování portů.",
        detail: "SSH-2 chrání komunikaci před odposlechem i podvržením pomocí host key (`known_hosts`), silného šifrování a asymetrické autentizace klíči (Ed25519), čímž nahradil nebezpečný Telnet.",
        relatedTopicId: "ssh-telnet-sftp"
      },
      {
        term: "STARTTLS",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Příkaz pro bezpečné povýšení původně nešifrovaného spojení (SMTP 25/587, IMAP 143, POP3 110) na šifrované TLS.",
        detail: "Na rozdíl od implicitního TLS (porty 465, 993, 995) začíná spojení nešifrovanou výměnou pozdravu, po níž klient vyšle příkaz `STARTTLS` a proběhne TLS handshake.",
        relatedTopicId: "mail-smtp-imap-pop3"
      },
      {
        term: "Stratum (NTP)",
        category: "DNS, DHCP & NTP",
        shortDef: "Číslo vrstvy (0–15) udávající vzdálenost NTP serveru od primárního referenčního zdroje času.",
        detail: "Stratum 0 tvoří atomové hodiny či GPS přijímače, Stratum 1 jsou servery napojené přímo na ně, Stratum 2–15 navazují po síti a hodnota 16 znamená nesynchronizované hodiny.",
        relatedTopicId: "ntp-time"
      },
      {
        term: "Syslog",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Standardizovaný protokol pro centralizovaný sběr provozních a bezpečnostních logů (UDP/TCP 514, TLS 6514).",
        detail: "Každá zpráva nese identifikaci zdroje (Facility) a jednu z 8 úrovní závažnosti (Severity 0 Emergency až 7 Debug), což umožňuje automatické filtrování a archivaci v SIEM.",
        relatedTopicId: "snmp-syslog"
      },
      {
        term: "TCP (Transmission Control Protocol)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Spojovaný a spolehlivý transportní protokol zaručující správné pořadí i opakované doručení ztracených dat.",
        detail: "Před přenosem navazuje 3-Way Handshake (`SYN`, `SYN-ACK`, `ACK`), používá sekvenční čísla `SEQ`/`ACK` a klouzavé okno. Stojí za HTTP/S, SSH, SMTP, IMAP, FTP i SMB.",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "Telnet",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Historický nešifrovaný protokol pro vzdálený textový terminál na portu TCP 23.",
        detail: "Telnet přenáší veškeré znaky i hesla v čistém nešifrovaném textu, proto byl pro správu serverů zcela vytlačen protokolem SSH. Dnes se příkaz používá výjimečně k ověření otevřenosti TCP portu.",
        relatedTopicId: "ssh-telnet-sftp"
      },
      {
        term: "TLS 1.3 (Transport Layer Security)",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Nejmodernější kryptografický protokol zajišťující důvěrnost, integritu a autentizaci u HTTPS (TCP 443), FTPS i SMTPS.",
        detail: "TLS 1.3 zrychlil navázání spojení na 1-RTT, odstranil zastaralé slabé šifry a povinně vyžaduje výměnu klíčů ECDHE zaručující Forward Secrecy.",
        relatedTopicId: "https-tls"
      },
      {
        term: "TRAP (SNMP)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Asynchronní poplachová zpráva odeslaná SNMP Agentem na port UDP 162 Managera bez předchozího dotazu.",
        detail: "Díky zprávám TRAP (nebo potvrzovaným INFORM) se dohledový server dozví o pádu linky nebo kritické chybě hardwaru okamžitě, aniž by musel čekat na další interval dotazování.",
        relatedTopicId: "snmp-syslog"
      },
      {
        term: "UDP (User Datagram Protocol)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Nespojovaný transportní protokol s minimální 8bajtovou hlavičkou bez potvrzování a oprav ztracených datagramů.",
        detail: "UDP upřednostňuje minimální zpoždění a režii před spolehlivostí, proto jej využívá DNS, DHCP, NTP, SNMP, VoIP médium RTP i moderní QUIC (HTTP/3).",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "VNC (Virtual Network Computing)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Multiplatformní systém vzdálené grafické plochy nad protokolem RFB (porty TCP 5900 + číslo displeje).",
        detail: "VNC přenáší rastrové obdélníky pixelů stávající obrazovky a události myši/klávesnice. Protože základní RFB postrádá silné šifrování, tuneluje se v praxi přes SSH nebo VPN.",
        relatedTopicId: "rdp-vnc"
      },
      {
        term: "WebSocket (ws / wss)",
        category: "SSH/SFTP, RDP/VNC & App",
        shortDef: "Webový protokol vytvářející nad TCP 80/443 trvalé plně duplexní spojení po úvodním HTTP požadavku Upgrade (101).",
        detail: "Na rozdíl od běžného HTTP dovoluje WebSocket (`wss://` v TLS) serveru i prohlížeči posílat si zprávy kdykoli současně s minimální režií pro chaty, burzy a živé aplikace.",
        relatedTopicId: "sip-rtp-mqtt"
      },
      {
        term: "Well-known porty (0–1023)",
        category: "TCP/IP, TCP & UDP",
        shortDef: "Vyhrazený rozsah základních TCP a UDP portů přidělených organizací IANA standardním síťovým službám.",
        detail: "Patří sem například 21 (FTP), 22 (SSH/SFTP), 23 (Telnet), 25 (SMTP), 53 (DNS), 67/68 (DHCP), 80 (HTTP), 110 (POP3), 123 (NTP), 143 (IMAP), 161/162 (SNMP), 443 (HTTPS), 445 (SMB) a 514 (Syslog).",
        relatedTopicId: "tcp-udp-handshake"
      },
      {
        term: "X.509 certifikát",
        category: "HTTP/S, SMTP & IMAP",
        shortDef: "Standardní datový formát digitálního certifikátu svazujícího veřejný klíč serveru s jeho doménou a podpisem CA.",
        detail: "Obsahuje veřejný klíč, seznam domén (SAN), dobu platnosti, identitu vydávající certifikační autority (Issuer) a digitální podpis CA, podle nějž klient ověří pravost TLS serveru.",
        relatedTopicId: "https-tls"
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
