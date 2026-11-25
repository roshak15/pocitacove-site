/**
 * OP4 • Protokoly TCP/IP
 * Hlavní datový registr: appInfo, 6 modulů, sloučená témata (01–16) a slovníček pojmů (A–Z).
 * Exportuje `global.NETWORK_CURRICULUM` kompatibilní s OP4 UI šablonou.
 */
(function (global) {
  'use strict';

  var part1 = global.__OP4_DATA_PART1__ || { topics: [], glossary: [] };
  var part2 = global.__OP4_DATA_PART2__ || { topics: [], glossary: [] };

  var appInfo = {
    title: "OP • Protokoly TCP/IP",
    subtitle: "Architektura TCP/IP, směrovací a aplikační protokoly, simulace a videa",
    version: "4.0"
  };

  var modules = [
    {
      id: "tcpip-transport",
      order: 1,
      title: "1. Architektura TCP/IP, přenos a diagnostika",
      shortTitle: "TCP/IP, TCP & UDP",
      subtitle: "Rodina protokolů TCP/IP, zapouzdření PDU, ARP, ICMP (ping/traceroute), TCP 3-Way Handshake, UDP, porty a sokety.",
      description: "Rodina TCP/IP, zapouzdření dat, ARP/ICMP diagnostika, TCP 3-Way Handshake, UDP, porty a sokety.",
      icon: "connect",
      color: "#38bdf8",
      accentColor: "#38bdf8"
    },
    {
      id: "routing-protocols",
      order: 2,
      title: "2. Směrovací protokoly (RIP, OSPF, BGP)",
      shortTitle: "RIP, OSPF & BGP",
      subtitle: "Dynamické směrování uvnitř i mezi autonomními systémy: RIP (Distance Vector), OSPF (Link-State, Area 0) a BGP (AS_PATH).",
      description: "Vnitřní směrovací protokoly IGP (RIP, OSPF, EIGRP) a hraniční protokol Internetu BGP.",
      icon: "router",
      color: "#10b981",
      accentColor: "#10b981"
    },
    {
      id: "core-infra-services",
      order: 3,
      title: "3. Základní síťové služby (DNS, DHCP, NTP)",
      shortTitle: "DNS, DHCP & NTP",
      subtitle: "Překlad jmen DNS (záznamy, rekurze, DNSSEC/DoH), automatická adresace DHCP (DORA, Relay) a přesný čas NTP (Stratum 0–15).",
      description: "Hierarchie DNS, proces DHCP DORA a synchronizace času protokolem NTP.",
      icon: "globe",
      color: "#f59e0b",
      accentColor: "#f59e0b"
    },
    {
      id: "web-mail-protocols",
      order: 4,
      title: "4. Webové a poštovní protokoly (HTTP/S, Pošta)",
      shortTitle: "HTTP/S, SMTP & IMAP",
      subtitle: "Vývoj HTTP/1.1 → HTTP/2 → HTTP/3 (QUIC), zabezpečení HTTPS/TLS 1.3 (PKI, ECDHE) a elektronická pošta SMTP, IMAP4, POP3, SPF/DKIM/DMARC.",
      description: "Webové protokoly HTTP/1.1–3, TLS 1.3 handshake a poštovní přenos SMTP, IMAP, POP3.",
      icon: "cloud",
      color: "#a855f7",
      accentColor: "#a855f7"
    },
    {
      id: "files-shares-protocols",
      order: 5,
      title: "5. Přenos a sdílení souborů (FTP, FTPS, Samba)",
      shortTitle: "FTP, FTPS & Samba",
      subtitle: "Aktivní vs. pasivní režim FTP (PORT vs. PASV/EPSV přes NAT), Explicit/Implicit FTPS a sdílení souborů v síti pomocí Samba / SMB2 / SMB3.",
      description: "FTP aktivní i pasivní režim, šifrované FTPS a síťové sdílení Samba/SMB.",
      icon: "layers",
      color: "#0ea5e9",
      accentColor: "#0ea5e9"
    },
    {
      id: "remote-realtime-protocols",
      order: 6,
      title: "6. Vzdálený přístup, správa a real-time protokoly",
      shortTitle: "SSH/SFTP, RDP/VNC & App",
      subtitle: "Telnet vs. SSH a SFTP, vzdálená plocha RDP vs. VNC, dohled SNMP a Syslog a moderní aplikační protokoly SIP/RTP, WebSocket a MQTT.",
      description: "SSH/Telnet/SFTP, RDP/VNC, dohled SNMP/Syslog a real-time protokoly SIP/RTP, WebSocket a MQTT.",
      icon: "security",
      color: "#f43f5e",
      accentColor: "#f43f5e"
    }
  ];

  var topics = []
    .concat(part1.topics || [], part2.topics || [])
    .slice()
    .sort(function (a, b) {
      return a.number - b.number;
    });

  var moduleShortById = {};
  modules.forEach(function (m) {
    moduleShortById[m.id] = m.shortTitle;
  });

  var topicModuleById = {};
  topics.forEach(function (t) {
    topicModuleById[t.id] = t.moduleId;
  });

  var glossary = []
    .concat(part1.glossary || [], part2.glossary || [])
    .map(function (item) {
      var modId = topicModuleById[item.relatedTopicId];
      var unifiedCategory = (modId && moduleShortById[modId]) || item.category || "Obecné pojmy";
      var cloned = {};
      for (var key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          cloned[key] = item[key];
        }
      }
      cloned.originalCategory = item.category;
      cloned.category = unifiedCategory;
      return cloned;
    })
    .sort(function (a, b) {
      return a.term.localeCompare(b.term, "cs");
    });

  global.NETWORK_CURRICULUM = {
    appInfo: appInfo,
    modules: modules,
    topics: topics,
    glossary: glossary
  };
})(typeof window !== 'undefined' ? window : globalThis);
