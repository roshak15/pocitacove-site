/**
 * OP4 basics – Obecné principy počítačových sítí
 * Hlavní datový registr: appInfo, 7 obecných modulů, sloučená témata (01–18) a slovníček pojmů (A–Z).
 */
(function (global) {
  'use strict';

  var part1 = global.__OP4_DATA_PART1__ || { topics: [], glossary: [] };
  var part2 = global.__OP4_DATA_PART2__ || { topics: [], glossary: [] };

  var appInfo = {
    title: "OP",
    subtitle: "Obecné principy počítačových sítí",
    version: "4.0"
  };

  var modules = [
    {
      id: "basics-topologies",
      order: 1,
      title: "1. Základy sítí a topologie",
      shortTitle: "Základy a topologie",
      subtitle: "Přepojování paketů a okruhů, PAN–WAN, síťové topologie, Klient–Server, P2P a Cloud.",
      description: "Přepojování paketů a okruhů, PAN/LAN/MAN/WAN, síťové topologie, Klient–Server, P2P a Cloud.",
      icon: "connect",
      color: "#38bdf8",
      accentColor: "#38bdf8"
    },
    {
      id: "models-transport",
      order: 2,
      title: "2. Síťové modely a transport dat",
      shortTitle: "Modely & Transport",
      subtitle: "Referenční model ISO/OSI, TCP/IP, enkapsulace PDU, protokoly TCP/UDP a transportní porty.",
      description: "Referenční model ISO/OSI, TCP/IP, enkapsulace PDU, protokoly TCP/UDP a transportní porty.",
      icon: "layers",
      color: "#a855f7",
      accentColor: "#a855f7"
    },
    {
      id: "l2-ethernet-vlan",
      order: 3,
      title: "3. Linková vrstva: Ethernet, Switching a VLAN",
      shortTitle: "Ethernet & VLAN",
      subtitle: "Strukturovaná kabeláž, rámec IEEE 802.3, CAM tabulka switche, STP, PoE a segmentace VLAN 802.1Q.",
      description: "Strukturovaná kabeláž, rámec IEEE 802.3, CAM tabulka switche, STP, PoE a segmentace VLAN 802.1Q.",
      icon: "network",
      color: "#3b82f6",
      accentColor: "#3b82f6"
    },
    {
      id: "addressing-services",
      order: 4,
      title: "4. IP adresování, podsítě a základní služby",
      shortTitle: "IP, Podsítě & Služby",
      subtitle: "IPv4/IPv6, MAC, ARP, RFC 1918, masky, CIDR/VLSM, automatická konfigurace DHCP a překlad jmen DNS.",
      description: "IPv4/IPv6, MAC, ARP, RFC 1918, masky, CIDR/VLSM, automatická konfigurace DHCP a překlad jmen DNS.",
      icon: "hashtag",
      color: "#f59e0b",
      accentColor: "#f59e0b"
    },
    {
      id: "routing-nat",
      order: 5,
      title: "5. Směrování a překlad adres (NAT/PAT)",
      shortTitle: "Routování & NAT",
      subtitle: "Směrovací tabulka, Longest Prefix Match, statické i dynamické routování (OSPF, BGP) a NAT/PAT/DNAT.",
      description: "Směrovací tabulka, Longest Prefix Match, statické i dynamické routování (OSPF, BGP) a NAT/PAT/DNAT.",
      icon: "router",
      color: "#10b981",
      accentColor: "#10b981"
    },
    {
      id: "wireless",
      order: 6,
      title: "6. Bezdrátové sítě (Wi-Fi a IoT)",
      shortTitle: "Wi-Fi & IoT",
      subtitle: "Wi-Fi IEEE 802.11 (4–7), pásma 2.4/5/6 GHz, CSMA/CA, WPA2/WPA3, roaming, Bluetooth a LPWAN/IoT.",
      description: "Wi-Fi IEEE 802.11 (4–7), pásma 2.4/5/6 GHz, CSMA/CA, WPA2/WPA3, roaming, Bluetooth a LPWAN/IoT.",
      icon: "wifi",
      color: "#6366f1",
      accentColor: "#6366f1"
    },
    {
      id: "security-sdn",
      order: 7,
      title: "7. Bezpečnost (Firewall) a moderní sítě (SDN)",
      shortTitle: "Firewall & SDN",
      subtitle: "Stateless, Stateful a NGFW firewally, DMZ, oddělení Control/Data Plane, OpenFlow a SDN kontroléry.",
      description: "Stateless, Stateful a NGFW firewally, DMZ, oddělení Control/Data Plane, OpenFlow a SDN kontroléry.",
      icon: "security",
      color: "#f97316",
      accentColor: "#f97316"
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
