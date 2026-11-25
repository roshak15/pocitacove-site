# OP4 basics • Obecné principy počítačových sítí

Přehledný výukový a prezentační webový dashboard pro obecné principy počítačových sítí určený pro výuku i samostudium. Samostatný, plně soběstačný projekt ve složce `/Users/filip/Desktop/2OP/OP4/` bez jakýchkoli externích nebo projektových závislostí.

---

## Jak aplikaci spustit

- **Požadavek**: Node.js (`v20+`, ověřeno na `v26.4.0`), bez instalace npm balíčků (`npm install` není potřeba).
- **Spuštění vestavěného HTTP serveru**:

```bash
cd /Users/filip/Desktop/2OP/OP4
node server.mjs
```

- Po spuštění otevřete v prohlížeči **`http://localhost:8767`** (výchozí port `8767`, volitelně přepisovatelný přes `PORT=8767 node server.mjs`).
- Vestavěný `server.mjs` podporuje `Accept-Ranges: bytes` (`206 Partial Content`), takže přehrávání i přetáčení `.mp4` videí funguje plynule.

---

## Pokryté okruhy

Obsah je systematicky rozdělen do **7 obecných modulů** (**18 témat**), které pokrývají všechny klíčové síťové oblasti:

1. **Základy sítí a topologie** — přepojování paketů a okruhů, **základní topologie sítí** (PAN–WAN, Bus, Ring, Star, Mesh, Tree, SPOF), klient–server a cloud.
2. **Síťové modely a transport dat** — ISO/OSI a TCP/IP, TCP vs. UDP a porty.
3. **Linková vrstva: Ethernet, Switching a VLAN** — **Ethernet** (IEEE 802.3, kabeláž, CAM tabulka, Full-Duplex, STP/RSTP, PoE) a **VLAN** (IEEE 802.1Q, Access/Trunk, PVID, Inter-VLAN routing).
4. **IP adresování, podsítě a základní služby** — IP/MAC/ARP, veřejné a privátní adresy (RFC 1918), subnetting a VLSM, DHCP (DORA), DNS.
5. **Směrování a překlad adres (NAT/PAT)** — **routování** (směrovací tabulka, Longest Prefix Match, OSPF/BGP/RIP, AD a metriky) a **NAT a PAT** (NAPT/Masquerade, Static SNAT, Port Forwarding, CGNAT).
6. **Bezdrátové sítě (Wi-Fi a IoT)** — **Wi-Fi** (IEEE 802.11 4–7, 2.4/5/6 GHz, kanály, CSMA/CA, WPA2/WPA3/802.1X, roaming) a Bluetooth/IoT (BLE, Zigbee, LoRaWAN, MQTT).
7. **Bezpečnost (Firewall) a moderní sítě (SDN)** — **firewall** (stateless paketový filtr/ACL, stateful inspekce stavů spojení, NGFW s L7 DPI/IPS/TLS inspekcí, DMZ) a **SDN** (Application/Control/Data plane, OpenFlow/NETCONF/RESTCONF, SD-WAN).

---

## Struktura projektu OP4

```text
/Users/filip/Desktop/2OP/OP4/
├── index.html                  # Vstupní SPA stránka
├── README.md                   # Dokumentace projektu OP4 basics
├── server.mjs                  # HTTP/1.1 statický server na portu 8767 (Range 206)
├── css/
│   └── styles.css              # Design systém (světlý/tmavý režim, dashboard, prezentace)
├── js/
│   ├── carbon-icons.js         # Offline sada SVG ikon (window.CarbonIcons)
│   ├── data-part1.js           # Témata 01–09 + slovníček (část 1)
│   ├── data-part2.js           # Témata 10–18 + slovníček (část 2)
│   ├── data.js                 # Sloučený model učiva (window.NETWORK_CURRICULUM)
│   ├── visuals.js              # Canvas animace, náhledy a interaktivní laboratoře
│   └── app.js                  # SPA směrovač, dashboard, detail tématu a studijní nástroje
└── media/
    ├── *.mp4                   # 14 lokálních výukových videí
    └── posters/
        └── *.jpg               # 14 extrahovaných 16:9 náhledových snímků
```

---

## Funkce aplikace

- **Čistý přehledový dashboard**: 16:9 náhledy videí a živých Canvas animací se stručným shrnutím témat, vyhledáváním a filtrováním podle modulů.
- **Plný detail tématu**: 4 karty (`Ukázka`, `Princip`, `Lab & Praxe`, `Kvíz`), videopřehrávač s kapitolami a sbalitelným přepisem, postupné rozbalování sekcí a **režim prezentace**.
- **Studijní nástroje**: IPv4 CIDR/VLSM kalkulačka a trenažér podsítí, vyhledávatelný slovníček pojmů, znalostní test a přepínač světlého/tmavého vzhledu.
