# OP4 • Protokoly TCP/IP

Přehledný interaktivní výukový a prezentační webový dashboard pro **protokoly TCP/IP** určený pro výuku i samostudium. Samostatný, plně **offline** soběstačný projekt ve složce `/Users/filip/Desktop/2OP/TCP-IP-Protokoly/` bez jakýchkoli externích závislostí, CDN či build nástrojů.

---

## Jak aplikaci spustit (Offline & lokální server)

- **Požadavek**: Node.js (`v20+`), bez instalace npm balíčků (`npm install` není potřeba).
- **Spuštění vestavěného HTTP serveru**:

```bash
cd /Users/filip/Desktop/2OP/TCP-IP-Protokoly
node server.mjs
```

- Po spuštění otevřete v prohlížeči **`http://localhost:8772`** (výchozí port `8772`, volitelně nastavitelný přes `PORT=8772 node server.mjs`).
- Vestavěný `server.mjs` podporuje `Accept-Ranges: bytes` (`206 Partial Content`), takže přehrávání i přetáčení všech 16 lokálních `.mp4` videí funguje plynule i zcela bez internetu.

---

## Pokryté okruhy (6 modulů / 16 témat / 16 simulací / 16 videí)

1. **Architektura TCP/IP, přenos a diagnostika**
   - `01` **Rodina TCP/IP, zapouzdření PDU, ARP a ICMP** (`ping`, `traceroute`, TTL)
   - `02` **Transportní vrstva: TCP (3-Way Handshake) vs. UDP, porty a sokety**
2. **Směrovací protokoly (RIP, OSPF, BGP)**
   - `03` **Vnitřní směrovací protokoly IGP: RIPv2 vs. OSPF** (Area 0, Dijkstra SPF)
   - `04` **Hraniční protokol Internetu BGP-4** (`TCP 179`, ASN, `AS_PATH`, `LOCAL_PREF`)
3. **Základní síťové služby (DNS, DHCP, NTP)**
   - `05` **DNS (Domain Name System)** (hierarchie, rekurze/iterace, záznamy `A`/`AAAA`/`MX`/`TXT`/`CNAME`/`PTR`, DNSSEC/DoH)
   - `06` **DHCP** (proces **DORA**, DHCP Relay `ip helper-address`, časovače `T1`/`T2`)
   - `07` **NTP (Network Time Protocol)** (`UDP 123`, Stratum 0–15, výpočet zpoždění a offsetu z `T1`–`T4`)
4. **Webové a poštovní protokoly (HTTP/S, Pošta)**
   - `08` **HTTP/1.1 → HTTP/2 → HTTP/3 (QUIC)** (metody, stavové kódy, multiplexing, HoL blocking)
   - `09` **HTTPS a TLS 1.3** (PKI, certifikáty X.509, ECDHE Forward Secrecy, SNI, ALPN, HSTS)
   - `10` **Elektronická pošta: SMTP, IMAP4, POP3 a DNS MX** (`25`, `587`, `465`, `993`, `995`, SPF/DKIM/DMARC)
5. **Přenos a sdílení souborů (FTP, FTPS, Samba)**
   - `11` **FTP Aktivní (`PORT`) vs. Pasivní (`PASV`) a FTPS** (průchod přes NAT/firewall, Explicit vs. Implicit FTPS)
   - `12` **Samba a protokol SMB2 / SMB3** (`TCP 445`, `smb.conf`, NTLMv2 vs. Kerberos, zákaz SMBv1, srovnání s NFS)
6. **Vzdálený přístup, správa a real-time protokoly**
   - `13` **Telnet vs. SSH-2 a SFTP** (`TCP 23` plain-text vs. `TCP 22` šifrovaně, klíče `ed25519`, SFTP vs. FTPS)
   - `14` **Vzdálená grafická plocha: RDP vs. VNC** (`3389` vektor/NLA vs. `5900+` rastr přes SSH tunel)
   - `15` **Dohled a logování sítě: SNMP a Syslog** (`UDP 161/162`, MIB/OID, SNMPv3 `authPriv`, Syslog `514`/`6514`)
   - `16` **Real-time a IoT protokoly: SIP/RTP, WebSocket a MQTT** (`5060`+RTP, `wss:// 443`, `MQTT 1883/8883` QoS 0/1/2)

---

## Struktura projektu

```text
/Users/filip/Desktop/2OP/TCP-IP-Protokoly/
├── index.html                  # Vstupní SPA stránka (Carbon Design System, témata)
├── README.md                   # Dokumentace projektu OP4 • Protokoly TCP/IP
├── server.mjs                  # Lokální HTTP/1.1 statický server na portu 8772 (Range 206)
├── css/
│   └── styles.css              # Design systém (světlý/tmavý/prezentační režim, Port Explorer)
├── js/
│   ├── carbon-icons.js         # Offline sada SVG ikon (window.CarbonIcons)
│   ├── data-part1.js           # Témata 01–08 + slovníček A–M
│   ├── data-part2.js           # Témata 09–16 + slovníček N–Z
│   ├── data.js                 # Sloučený model učiva (window.NETWORK_CURRICULUM)
│   ├── visuals.js              # NetMath + 16 Canvas animací + 16 interaktivních simulátorů
│   └── app.js                  # SPA směrovač, dashboard, Porty & Kalkulačka, slovníček, test
└── media/
    ├── *.mp4                   # 16 lokálních výukových videí (1920×1080, cz komentář)
    └── posters/
        └── *.jpg               # 16 extrahovaných 16:9 náhledových snímků (1280×720)
```

---

## Hlavní funkce aplikace

- **Přehledový dashboard**: 16:9 náhledy videí a animací, odznaky portů protokolů, filtrování podle 6 modulů a vyhledávání podle názvu, portu či pojmu.
- **4záložkový pracovní prostor kapitoly**: `Ukázka` (Video s kapitolami / 4kroková 16-bit Canvas animace), `Princip & Výklad`, `Simulace & Praxe` (interaktivní protokolový simulátor + reálné CLI příkazy) a `Kvíz`.
- **Porty & Kalkulačka (`#calc`)**: Vyhledávatelná tabulka 39 klíčových TCP/UDP portů a protokolů s filtrem kategorií, přímým proklikem do kapitol a trenažérem **„Poznej port a protokol“**, doplněná o kompletní **IPv4 CIDR kalkulačku** s 32bitovým binárním rozkladem a **trenažérem podsítí**.
- **Slovníček (`#glossary`) & Znalostní test (`#test`)**: Přes 100 pojmů s modálními definicemi a souhrnný test s výběrem modulu a vyhodnocením slabých míst.
- **Plně offline provoz & izolované úložiště**: Stav pokroku (`tcpip_progress`), téma (`tcpip_theme`) a režim prezentace (`tcpip_prefs`) se ukládají lokálně v `localStorage`.
