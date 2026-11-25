/* ==========================================================================
   OP4 basics • Obecné principy počítačových sítí | Vizuální engine & Laboratoře
   Exportuje na window:
     - window.NetMath            (IPv4 & CIDR výpočetní jádro)
     - window.PixelStageRenderer (16-bit Pixel-Tech Canvas animace + náhledy)
     - window.InteractiveLabs    (18 interaktivních mini-labů)
   Bez ES modulů a bez fetch() – plně funkční lokálně i přes HTTP
   ========================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------------
     1. NetMath: Bezpečná 32bitová IPv4 & CIDR matematika
     ------------------------------------------------------------------------ */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseIp(ipStr) {
    if (typeof ipStr !== 'string') return null;
    var trimmed = ipStr.trim();
    var parts = trimmed.split('.');
    if (parts.length !== 4) return null;
    var octets = [];
    for (var i = 0; i < 4; i++) {
      if (!/^(0|[1-9]\d{0,2})$/.test(parts[i])) return null;
      var num = Number(parts[i]);
      if (num < 0 || num > 255) return null;
      octets.push(num);
    }
    return octets;
  }

  function octetsToInt(octets) {
    return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
  }

  function ipToInt(ipStr) {
    var oct = parseIp(ipStr);
    return oct ? octetsToInt(oct) : null;
  }

  function intToOctets(num) {
    var u = (num >>> 0);
    return [
      (u >>> 24) & 255,
      (u >>> 16) & 255,
      (u >>> 8) & 255,
      u & 255
    ];
  }

  function intToIp(num) {
    return intToOctets(num).join('.');
  }

  function maskFromPrefix(prefix) {
    var p = Math.max(0, Math.min(32, Math.trunc(Number(prefix) || 0)));
    if (p === 0) return 0;
    return ((0xffffffff << (32 - p)) >>> 0);
  }

  function intToBinaryOctets(num) {
    var octs = intToOctets(num);
    return octs.map(function (o) {
      return o.toString(2).padStart(8, '0');
    });
  }

  function classifyIp(ipStr) {
    var oct = parseIp(ipStr);
    if (!oct) return null;
    var a = oct[0];
    var b = oct[1];
    var c = oct[2];

    var ipClass = 'A';
    var defaultMask = '255.0.0.0 (/8)';
    if (a >= 128 && a <= 191) {
      ipClass = 'B';
      defaultMask = '255.255.0.0 (/16)';
    } else if (a >= 192 && a <= 223) {
      ipClass = 'C';
      defaultMask = '255.255.255.0 (/24)';
    } else if (a >= 224 && a <= 239) {
      ipClass = 'D (Multicast)';
      defaultMask = 'N/A';
    } else if (a >= 240) {
      ipClass = 'E (Experimentální)';
      defaultMask = 'N/A';
    }

    var scope = 'Veřejná směrovatelná IPv4';
    var routable = true;
    var badgeTone = 'cyan';
    var note = 'Adresa je globálně unikátní a směrovatelná v síti Internet.';

    if (a === 10) {
      scope = 'Privátní – RFC 1918 (Třída A)';
      routable = false;
      badgeTone = 'emerald';
      note = 'Používá se v lokálních sítích (LAN). Do internetu se překládá pomocí NAT.';
    } else if (a === 172 && b >= 16 && b <= 31) {
      scope = 'Privátní – RFC 1918 (Třída B)';
      routable = false;
      badgeTone = 'emerald';
      note = 'Podnikový a Docker/VPN rozsah (172.16.0.0 – 172.31.255.255). Do internetu vyžaduje NAT.';
    } else if (a === 192 && b === 168) {
      scope = 'Privátní – RFC 1918 (Třída C)';
      routable = false;
      badgeTone = 'emerald';
      note = 'Nejčastější rozsah domácích a firemních LAN. Router ji do internetu bez NAT nepustí.';
    } else if (a === 127) {
      scope = 'Loopback (RFC 1122)';
      routable = false;
      badgeTone = 'amber';
      note = 'Slouží pro testování lokálního TCP/IP zásobníku vlastního zařízení (localhost).';
    } else if (a === 169 && b === 254) {
      scope = 'APIPA / Link-Local (RFC 3927)';
      routable = false;
      badgeTone = 'amber';
      note = 'Zařízení si ji přidělí samo, pokud selže DHCP server. Funguje jen v lokálním segmentu.';
    } else if (
      (a === 192 && b === 0 && c === 2) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113)
    ) {
      scope = 'Dokumentační rozsah (RFC 5737)';
      routable = false;
      badgeTone = 'amber';
      note = 'Rezervováno pro dokumentaci, příklady a testy (TEST-NET-1/2/3).';
    } else if (a === 100 && b >= 64 && b <= 127) {
      scope = 'CGNAT – Shared Address Space (RFC 6598)';
      routable = false;
      badgeTone = 'amber';
      note = 'Rozsah poskytovatelů internetu (ISP) pro Carrier-Grade NAT.';
    } else if (a >= 224 && a <= 239) {
      scope = 'Multicast (RFC 5771)';
      routable = false;
      badgeTone = 'amber';
      note = 'Skupinové vysílání (IPTV, OSPF, mDNS) – nepřiřazuje se běžným hostům.';
    } else if (a >= 240 || a === 0) {
      scope = a === 0 ? 'Speciální / Neurčená (0.0.0.0/8)' : 'Rezervovaná / Experimentální';
      routable = false;
      badgeTone = 'rose';
      note = 'Speciální rozsah nepoužitelný pro běžnou veřejnou adresaci hostů.';
    }

    return {
      ip: oct.join('.'),
      octets: oct,
      ipClass: ipClass,
      defaultMask: defaultMask,
      scope: scope,
      routable: routable,
      badgeTone: badgeTone,
      note: note,
      binaryOctets: intToBinaryOctets(octetsToInt(oct))
    };
  }

  function calculateSubnet(ipStr, prefix) {
    var oct = parseIp(ipStr);
    if (!oct) return null;
    if (prefix === null || prefix === undefined || typeof prefix === 'boolean') return null;
    if (typeof prefix === 'string' && prefix.trim() === '') return null;
    var numPrefix = Number(prefix);
    if (!Number.isFinite(numPrefix)) return null;
    var p = Math.max(0, Math.min(32, Math.trunc(numPrefix)));
    var ipInt = octetsToInt(oct);
    var maskInt = maskFromPrefix(p);
    var wildcardInt = (~maskInt) >>> 0;
    var netInt = (ipInt & maskInt) >>> 0;
    var bcastInt = (netInt | wildcardInt) >>> 0;
    var totalAddresses = Math.pow(2, 32 - p);
    var usableHosts = p === 32 ? 1 : (p === 31 ? 2 : Math.max(0, totalAddresses - 2));
    var firstHostInt = p >= 31 ? netInt : ((netInt + 1) >>> 0);
    var lastHostInt = p >= 31 ? bcastInt : ((bcastInt - 1) >>> 0);

    return {
      inputIp: oct.join('.'),
      prefix: p,
      ipInt: ipInt,
      maskInt: maskInt,
      wildcardInt: wildcardInt,
      networkInt: netInt,
      broadcastInt: bcastInt,
      network: intToIp(netInt),
      mask: intToIp(maskInt),
      wildcard: intToIp(wildcardInt),
      broadcast: intToIp(bcastInt),
      firstHost: intToIp(firstHostInt),
      lastHost: intToIp(lastHostInt),
      totalAddresses: totalAddresses,
      usableHosts: usableHosts,
      ipBinaryOctets: intToBinaryOctets(ipInt),
      maskBinaryOctets: intToBinaryOctets(maskInt),
      classification: classifyIp(oct.join('.'))
    };
  }

  global.NetMath = {
    escapeHtml: escapeHtml,
    parseIp: parseIp,
    ipToInt: ipToInt,
    intToIp: intToIp,
    intToOctets: intToOctets,
    maskFromPrefix: maskFromPrefix,
    intToBinaryOctets: intToBinaryOctets,
    classifyIp: classifyIp,
    calculateSubnet: calculateSubnet
  };

  /* ------------------------------------------------------------------------
     2. PixelStageRenderer: 16-bit Pixel-Tech Canvas Engine (640x360)
     ------------------------------------------------------------------------ */
  var W = 640;
  var H = 360;

  var PAL = {
    skyTop: '#060c18',
    skyMid: '#0d1930',
    skyBot: '#152749',
    star1: '#93c5fd',
    star2: '#f8fafc',
    cloud: '#1c3157',
    mtnBack: '#10203a',
    mtnFront: '#091325',
    ground: '#070f1d',
    grid: '#182947',
    panelBg: '#0c1629',
    panelBorder: '#2a4068',
    cyan: '#38bdf8',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#a78bfa',
    white: '#f8fafc',
    slate: '#94a3b8'
  };

  // Deterministické hvězdy bez blikání pozic
  var STARS = [];
  (function initStars() {
    var seed = 42;
    for (var i = 0; i < 42; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      var sx = (seed % 315) * 2;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      var sy = (seed % 95) * 2 + 12;
      STARS.push({ x: sx, y: sy, phase: (i % 7) * 0.9, size: i % 5 === 0 ? 4 : 2 });
    }
  })();

  function snap(v) {
    return Math.round(v / 2) * 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  function pxRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(snap(x), snap(y), snap(w), snap(h));
  }

  function drawPixelBackdrop(ctx, animTime) {
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, PAL.skyTop);
    grad.addColorStop(0.58, PAL.skyMid);
    grad.addColorStop(1, PAL.skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Hvězdy
    for (var i = 0; i < STARS.length; i++) {
      var st = STARS[i];
      var alpha = 0.45 + 0.55 * Math.sin(animTime * 2.2 + st.phase);
      ctx.globalAlpha = Math.max(0.25, alpha);
      ctx.fillStyle = i % 3 === 0 ? PAL.star1 : PAL.star2;
      ctx.fillRect(st.x, st.y, st.size, st.size);
    }
    ctx.globalAlpha = 1;

    // Pixelová oblaka
    var cloudShift = Math.floor((animTime * 10) % 720);
    drawPixelCloudShape(ctx, ((80 + cloudShift) % 720) - 80, 56, 1);
    drawPixelCloudShape(ctx, ((390 + cloudShift * 0.7) % 720) - 80, 74, 0.8);

    // Zadní hory
    var peaks1 = [0, 240, 80, 198, 160, 224, 250, 184, 340, 218, 440, 190, 540, 222, 640, 194];
    drawMountainLayer(ctx, peaks1, 286, PAL.mtnBack);

    // Přední hory
    var peaks2 = [0, 256, 60, 226, 140, 252, 210, 216, 300, 248, 390, 214, 490, 248, 580, 220, 640, 242];
    drawMountainLayer(ctx, peaks2, 286, PAL.mtnFront);

    // Spodní země & síťová mřížka
    pxRect(ctx, 0, 286, W, H - 286, PAL.ground);
    pxRect(ctx, 0, 286, W, 2, PAL.panelBorder);
    ctx.fillStyle = PAL.grid;
    for (var gx = 0; gx < W; gx += 32) {
      ctx.fillRect(gx, 288, 2, H - 288);
    }
    for (var gy = 304; gy < H; gy += 18) {
      ctx.fillRect(0, gy, W, 2);
    }
  }

  function drawPixelCloudShape(ctx, x, y, scale) {
    var s = scale || 1;
    ctx.fillStyle = PAL.cloud;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(snap(x), snap(y), snap(44 * s), snap(10 * s));
    ctx.fillRect(snap(x + 8 * s), snap(y - 8 * s), snap(26 * s), snap(8 * s));
    ctx.fillRect(snap(x + 14 * s), snap(y - 14 * s), snap(14 * s), snap(6 * s));
    ctx.globalAlpha = 1;
  }

  function drawMountainLayer(ctx, pts, baseY, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (var i = 0; i < pts.length; i += 2) {
      ctx.lineTo(pts[i], pts[i + 1]);
    }
    ctx.lineTo(W, baseY);
    ctx.closePath();
    ctx.fill();
  }

  function drawBadge(ctx, x, y, text, bg, fg, border) {
    ctx.font = 'bold 11px ui-monospace, Menlo, Consolas, monospace';
    var tw = Math.ceil(ctx.measureText(text).width);
    var bw = tw + 14;
    var bh = 20;
    var bx = snap(x - bw / 2);
    var by = snap(y - bh / 2);
    pxRect(ctx, bx, by, bw, bh, bg || PAL.panelBg);
    ctx.strokeStyle = border || PAL.panelBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
    ctx.fillStyle = fg || PAL.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + bw / 2, by + bh / 2 + 1);
  }

  function drawNodeLabels(ctx, x, y, label, sublabel, accent) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 12px ui-monospace, Menlo, Consolas, monospace';
    if (label) {
      ctx.fillStyle = '#040914';
      ctx.fillText(label, snap(x) + 1, snap(y) + 1);
      ctx.fillStyle = PAL.white;
      ctx.fillText(label, snap(x), snap(y));
    }
    if (sublabel) {
      ctx.font = '11px ui-monospace, Menlo, Consolas, monospace';
      ctx.fillStyle = accent || PAL.cyan;
      ctx.fillText(sublabel, snap(x), snap(y + 15));
    }
  }

  function drawPixelPC(ctx, cx, cy, label, sublabel, color) {
    var c = color || PAL.cyan;
    // Monitor
    pxRect(ctx, cx - 22, cy - 22, 44, 30, '#1e293b');
    pxRect(ctx, cx - 20, cy - 20, 40, 26, '#091426');
    pxRect(ctx, cx - 16, cy - 16, 32, 18, '#0f2847');
    pxRect(ctx, cx - 14, cy - 14, 18, 4, c);
    pxRect(ctx, cx - 14, cy - 8, 12, 2, PAL.emerald);
    // Stojan + klávesnice
    pxRect(ctx, cx - 6, cy + 8, 12, 4, '#64748b');
    pxRect(ctx, cx - 18, cy + 12, 36, 6, '#334155');
    pxRect(ctx, cx - 14, cy + 14, 28, 2, '#94a3b8');
    // Okraj zvýraznění
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 22) + 1, snap(cy - 22) + 1, 42, 28);
    drawNodeLabels(ctx, cx, cy + 22, label, sublabel, c);
  }

  function drawPixelRouter(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.emerald;
    // Antény
    pxRect(ctx, cx - 18, cy - 24, 4, 14, '#64748b');
    pxRect(ctx, cx + 14, cy - 24, 4, 14, '#64748b');
    pxRect(ctx, cx - 18, cy - 26, 4, 4, c);
    pxRect(ctx, cx + 14, cy - 26, 4, 4, c);
    // Tělo routeru
    pxRect(ctx, cx - 26, cy - 10, 52, 22, '#1e293b');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 26) + 1, snap(cy - 10) + 1, 50, 20);
    // Šipky routování + blikající LED
    pxRect(ctx, cx - 12, cy - 4, 24, 2, c);
    pxRect(ctx, cx - 10, cy + 2, 20, 2, PAL.amber);
    var blink = Math.floor((animTime || 0) * 4) % 2 === 0;
    pxRect(ctx, cx - 20, cy + 4, 4, 4, blink ? PAL.emerald : '#14532d');
    pxRect(ctx, cx + 16, cy + 4, 4, 4, blink ? PAL.cyan : '#0c4a6e');
    drawNodeLabels(ctx, cx, cy + 16, label, sublabel, c);
  }

  function drawPixelSwitch(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.cyan;
    pxRect(ctx, cx - 32, cy - 10, 64, 20, '#1e293b');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 32) + 1, snap(cy - 10) + 1, 62, 18);
    // 6 port LED
    for (var i = 0; i < 6; i++) {
      var active = ((Math.floor((animTime || 0) * 5) + i) % 3) !== 0;
      pxRect(ctx, cx - 24 + i * 8, cy + 2, 6, 4, active ? PAL.emerald : '#1e3a2f');
    }
    pxRect(ctx, cx - 16, cy - 5, 32, 2, c);
    drawNodeLabels(ctx, cx, cy + 14, label, sublabel, c);
  }

  function drawPixelServer(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.amber;
    pxRect(ctx, cx - 18, cy - 26, 36, 48, '#1e293b');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 18) + 1, snap(cy - 26) + 1, 34, 46);
    for (var row = 0; row < 3; row++) {
      var ry = cy - 20 + row * 14;
      pxRect(ctx, cx - 12, ry, 24, 8, '#0f172a');
      var on = ((Math.floor((animTime || 0) * 4) + row) % 2) === 0;
      pxRect(ctx, cx + 6, ry + 2, 4, 4, on ? PAL.emerald : c);
    }
    drawNodeLabels(ctx, cx, cy + 26, label, sublabel, c);
  }

  function drawPixelCloud(ctx, cx, cy, label, sublabel, color) {
    var c = color || PAL.violet;
    pxRect(ctx, cx - 34, cy - 4, 68, 20, '#1e293b');
    pxRect(ctx, cx - 24, cy - 16, 48, 14, '#1e293b');
    pxRect(ctx, cx - 12, cy - 24, 24, 10, '#1e293b');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 34) + 1, snap(cy - 4) + 1, 66, 18);
    drawNodeLabels(ctx, cx, cy + 20, label, sublabel, c);
  }

  function drawPixelTower(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.emerald;
    pxRect(ctx, cx - 4, cy - 18, 8, 34, '#334155');
    pxRect(ctx, cx - 14, cy + 12, 28, 6, '#475569');
    pxRect(ctx, cx - 4, cy - 22, 8, 6, c);
    // Vyzařovací pixelové oblouky
    var wave = ((animTime || 0) * 2) % 1;
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    for (var r = 1; r <= 2; r++) {
      ctx.globalAlpha = Math.max(0.2, 1 - ((wave + r * 0.4) % 1));
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 10 * r + wave * 8, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    drawNodeLabels(ctx, cx, cy + 22, label, sublabel, c);
  }

  function drawPixelFirewall(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.amber;
    // Tělo brány 52x36 se stylizovaným zdivem a štítem
    pxRect(ctx, cx - 26, cy - 18, 52, 36, '#334155');
    // Cihly – horní řada
    pxRect(ctx, cx - 24, cy - 16, 14, 8, '#991b1b');
    pxRect(ctx, cx - 8, cy - 16, 16, 8, '#7c2d12');
    pxRect(ctx, cx + 10, cy - 16, 14, 8, '#991b1b');
    // Střední řada
    pxRect(ctx, cx - 24, cy - 6, 10, 10, '#7c2d12');
    pxRect(ctx, cx - 12, cy - 6, 24, 10, '#991b1b');
    pxRect(ctx, cx + 14, cy - 6, 10, 10, '#7c2d12');
    // Spodní řada
    pxRect(ctx, cx - 24, cy + 6, 16, 10, '#991b1b');
    pxRect(ctx, cx - 6, cy + 6, 14, 10, '#7c2d12');
    pxRect(ctx, cx + 10, cy + 6, 14, 10, '#991b1b');
    // Centrální bezpečnostní štít
    pxRect(ctx, cx - 8, cy - 8, 16, 16, '#0f172a');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 8) + 1, snap(cy - 8) + 1, 14, 14);
    pxRect(ctx, cx - 4, cy - 4, 8, 8, c);
    // Blikající LED kontroly v rozích
    var blink = Math.floor((animTime || 0) * 4) % 2 === 0;
    pxRect(ctx, cx - 22, cy - 14, 4, 4, blink ? PAL.emerald : '#14532d');
    pxRect(ctx, cx + 18, cy - 14, 4, 4, blink ? c : '#1e293b');
    // Vnější rámeček brány
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 26) + 1, snap(cy - 18) + 1, 50, 34);
    drawNodeLabels(ctx, cx, cy + 22, label, sublabel, c);
  }

  function drawPixelController(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.cyan;
    pxRect(ctx, cx - 36, cy - 14, 72, 28, '#0f172a');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 36) + 1, snap(cy - 14) + 1, 70, 26);
    // Stavové LED vlevo a vpravo
    var leds = [PAL.emerald, PAL.cyan, PAL.violet];
    for (var i = 0; i < 3; i++) {
      var active = ((Math.floor((animTime || 0) * 5) + i) % 2) === 0;
      pxRect(ctx, cx - 28 + i * 6, cy - 2, 4, 4, active ? leds[i] : '#1e293b');
      pxRect(ctx, cx + 14 + i * 6, cy - 2, 4, 4, active ? leds[2 - i] : '#1e293b');
    }
    // Pulzující centrální jádro 8x8
    var pulse = 0.55 + 0.45 * Math.sin((animTime || 0) * 5);
    ctx.save();
    ctx.globalAlpha = pulse;
    pxRect(ctx, cx - 6, cy - 6, 12, 12, c);
    ctx.restore();
    pxRect(ctx, cx - 4, cy - 4, 8, 8, PAL.white);
    drawNodeLabels(ctx, cx, cy + 18, label, sublabel, c);
  }

  function drawPixelLink(ctx, x1, y1, x2, y2, opts) {
    var o = opts || {};
    ctx.save();
    ctx.strokeStyle = o.broken ? PAL.rose : (o.color || '#334a73');
    ctx.lineWidth = o.width || 3;
    if (o.dashed) {
      ctx.setLineDash([8, 6]);
    }
    ctx.beginPath();
    ctx.moveTo(snap(x1), snap(y1));
    ctx.lineTo(snap(x2), snap(y2));
    ctx.stroke();
    ctx.restore();
    if (o.broken) {
      var mx = (x1 + x2) / 2;
      var my = (y1 + y2) / 2;
      pxRect(ctx, mx - 10, my - 10, 20, 20, PAL.rose);
      ctx.fillStyle = PAL.white;
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('X', snap(mx), snap(my) + 1);
    }
  }

  function drawPixelPacket(ctx, x, y, label, color, sublabel) {
    var c = color || PAL.cyan;
    var px = snap(x - 18);
    var py = snap(y - 12);
    // Záře
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(px - 4, py - 4, 44, 32);
    ctx.globalAlpha = 1;
    // Obálka
    pxRect(ctx, px, py, 36, 24, '#0f172a');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, 34, 22);
    pxRect(ctx, px + 4, py + 4, 28, 4, c);
    ctx.fillStyle = PAL.white;
    ctx.font = 'bold 10px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label || 'PKT', px + 18, py + 16);
    if (sublabel) {
      drawBadge(ctx, x, y - 24, sublabel, '#091224', c, c);
    }
  }

  function drawInfoBox(ctx, x, y, w, h, title, lines, accent) {
    var c = accent || PAL.cyan;
    pxRect(ctx, x, y, w, h, 'rgba(9, 16, 32, 0.92)');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(x) + 1, snap(y) + 1, snap(w) - 2, snap(h) - 2);
    pxRect(ctx, x + 2, y + 2, w - 4, 20, '#132442');
    ctx.fillStyle = c;
    ctx.font = 'bold 11px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, snap(x + 8), snap(y + 12));

    ctx.font = '11px ui-monospace, Menlo, monospace';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var text = typeof line === 'string' ? line : line.text;
      var col = typeof line === 'string' ? PAL.white : (line.color || PAL.white);
      var hl = typeof line === 'object' && line.highlight;
      if (hl) {
        pxRect(ctx, x + 4, y + 24 + i * 18, w - 8, 16, hl);
      }
      ctx.fillStyle = col;
      ctx.fillText(text, snap(x + 8), snap(y + 32 + i * 18));
    }
  }

  /* ------------------------------------------------------------------------
     Definice 18 animací pro všechna témata
     ------------------------------------------------------------------------ */
  function buildAnimationSteps(type) {
    var normalizedType = (typeof type === 'string' && type.slice(-4) === '-sdn') ? 'sdn' : type;
    switch (normalizedType) {
      case 'switching':
        return [
          {
            title: '1. Přepojování okruhů: Rezervace linky',
            caption: 'Před přenosem se vyhradí pevná cesta A → R1 → R2 → B. Kapacita je blokovaná i při tichu.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 180, 230, 130, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 230, 130, 410, 130, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 410, 130, 550, 180, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 230, 130, 320, 230, { dashed: true });
              drawPixelLink(ctx, 320, 230, 410, 130, { dashed: true });
              drawPixelPC(ctx, 90, 180, 'Uzel A', 'Volající', PAL.cyan);
              drawPixelRouter(ctx, 230, 130, 'R1', '', PAL.amber, t);
              drawPixelRouter(ctx, 320, 230, 'R3', 'Záložní', PAL.slate, t);
              drawPixelRouter(ctx, 410, 130, 'R2', 'Vyhrazeno', PAL.amber, t);
              drawPixelPC(ctx, 550, 180, 'Uzel B', 'Příjemce', PAL.cyan);
              drawPixelPacket(ctx, lerp(230, 410, p), 130, 'OKRUH', PAL.amber, '100% rezervováno');
            }
          },
          {
            title: '2. Výpadek uzlu u přepojování okruhů',
            caption: 'Pokud vypadne uzel R2 na vyhrazené trase, celý hovor okamžitě spadne.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 180, 230, 130, { color: PAL.amber });
              drawPixelLink(ctx, 230, 130, 410, 130, { broken: true });
              drawPixelLink(ctx, 410, 130, 550, 180, { broken: true });
              drawPixelLink(ctx, 230, 130, 320, 230, { dashed: true });
              drawPixelLink(ctx, 320, 230, 410, 130, { dashed: true });
              drawPixelPC(ctx, 90, 180, 'Uzel A', 'Spojení padlo!', PAL.rose);
              drawPixelRouter(ctx, 230, 130, 'R1', '', PAL.amber, t);
              drawPixelRouter(ctx, 320, 230, 'R3', 'Nevyužito', PAL.slate, t);
              drawPixelRouter(ctx, 410, 130, 'R2', 'VÝPADEK', PAL.rose, t);
              drawPixelPC(ctx, 550, 180, 'Uzel B', 'Odpojeno', PAL.rose);
              drawBadge(ctx, 320, 72, 'OKRUH PŘERUŠEN – NUTNO VYTOČIT ZNOVU', '#2a0912', PAL.rose, PAL.rose);
            }
          },
          {
            title: '3. Přepojování paketů: Rozdělení na pakety',
            caption: 'Data se rozsekají na samostatné pakety (P1, P2, P3). Každý nese cílovou adresu.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 180, 230, 130, { color: PAL.cyan });
              drawPixelLink(ctx, 230, 130, 410, 130, { color: PAL.emerald });
              drawPixelLink(ctx, 230, 130, 320, 230, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 230, 550, 180, { color: PAL.cyan });
              drawPixelLink(ctx, 410, 130, 550, 180, { color: PAL.emerald });
              drawPixelPC(ctx, 90, 180, 'Uzel A', 'Odesílá P1..P3', PAL.cyan);
              drawPixelRouter(ctx, 230, 130, 'R1', '', PAL.emerald, t);
              drawPixelRouter(ctx, 320, 230, 'R3', '', PAL.cyan, t);
              drawPixelRouter(ctx, 410, 130, 'R2', '', PAL.emerald, t);
              drawPixelPC(ctx, 550, 180, 'Uzel B', 'Skládá data', PAL.emerald);
              drawPixelPacket(ctx, lerp(110, 400, p), lerp(175, 130, p), 'P1', PAL.emerald);
              drawPixelPacket(ctx, lerp(140, 320, p), lerp(180, 230, p), 'P2', PAL.cyan);
            }
          },
          {
            title: '4. Odolnost paketové sítě (Rerouting)',
            caption: 'Při výpadku R2 si router R1 vybere záložní cestu přes R3 – komunikace pokračuje!',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 180, 230, 130, { color: PAL.emerald });
              drawPixelLink(ctx, 230, 130, 410, 130, { broken: true });
              drawPixelLink(ctx, 230, 130, 320, 230, { color: PAL.emerald, width: 4 });
              drawPixelLink(ctx, 320, 230, 550, 180, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 90, 180, 'Uzel A', 'Online', PAL.emerald);
              drawPixelRouter(ctx, 230, 130, 'R1', 'Přesměrováno', PAL.emerald, t);
              drawPixelRouter(ctx, 320, 230, 'R3', 'Aktivní trasa', PAL.emerald, t);
              drawPixelRouter(ctx, 410, 130, 'R2', 'VÝPADEK', PAL.rose, t);
              drawPixelPC(ctx, 550, 180, 'Uzel B', 'Doručeno OK', PAL.emerald);
              var px = p < 0.5 ? lerp(230, 320, p * 2) : lerp(320, 550, (p - 0.5) * 2);
              var py = p < 0.5 ? lerp(130, 230, p * 2) : lerp(230, 180, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'P3', PAL.emerald, 'Obchvat přes R3');
            }
          }
        ];

      case 'topologies':
        return [
          {
            title: '1. Sběrnice (BUS) – sdílený kabel',
            caption: 'Všechny stanice sdílejí jeden koaxiální kabel. Přerušení kabelu vyřadí celou síť.',
            render: function (ctx, p) {
              drawPixelLink(ctx, 90, 180, 550, 180, { color: PAL.amber, width: 4 });
              drawBadge(ctx, 74, 180, 'TERM', '#1e293b', PAL.amber, PAL.amber);
              drawBadge(ctx, 566, 180, 'TERM', '#1e293b', PAL.amber, PAL.amber);
              var xs = [160, 320, 480];
              for (var i = 0; i < xs.length; i++) {
                drawPixelLink(ctx, xs[i], 130, xs[i], 180, { color: PAL.amber });
                drawPixelPC(ctx, xs[i], 110, 'PC-' + (i + 1), 'Kolizní doména', PAL.amber);
              }
              drawPixelPacket(ctx, lerp(160, 480, p), 180, 'FRAME', PAL.amber, 'Vysílání po sběrnici');
            }
          },
          {
            title: '2. Kruh (RING) – předávání tokenu',
            caption: 'Data putují jedním směrem z uzlu do uzlu pomocí pověření (Token).',
            render: function (ctx, p) {
              var pts = [[320, 95], [470, 165], [320, 235], [170, 165]];
              for (var i = 0; i < 4; i++) {
                var next = pts[(i + 1) % 4];
                drawPixelLink(ctx, pts[i][0], pts[i][1], next[0], next[1], { color: PAL.violet, width: 3 });
              }
              for (var j = 0; j < 4; j++) {
                drawPixelPC(ctx, pts[j][0], pts[j][1], 'PC-' + (j + 1), '', PAL.violet);
              }
              var seg = Math.floor(p * 4) % 4;
              var sp = (p * 4) % 1;
              var a = pts[seg];
              var b = pts[(seg + 1) % 4];
              drawPixelPacket(ctx, lerp(a[0], b[0], sp), lerp(a[1], b[1], sp), 'TOKEN', PAL.violet);
            }
          },
          {
            title: '3. Hvězda (STAR) – dnešní Ethernet LAN',
            caption: 'Každý uzel má vlastní kabel do centrálního switche. Výpadek jednoho kabelu neovlivní ostatní.',
            render: function (ctx, p, t) {
              var pcs = [[130, 105], [510, 105], [130, 230], [510, 230]];
              for (var i = 0; i < pcs.length; i++) {
                drawPixelLink(ctx, 320, 165, pcs[i][0], pcs[i][1], { color: i === 2 ? PAL.rose : PAL.cyan, broken: i === 2 });
                drawPixelPC(ctx, pcs[i][0], pcs[i][1], 'PC-' + (i + 1), i === 2 ? 'Kabel KO' : 'OK', i === 2 ? PAL.rose : PAL.cyan);
              }
              drawPixelSwitch(ctx, 320, 165, 'SWITCH', 'Centrální uzel', PAL.emerald, t);
              var px = p < 0.5 ? lerp(130, 320, p * 2) : lerp(320, 510, (p - 0.5) * 2);
              var py = p < 0.5 ? lerp(105, 165, p * 2) : lerp(165, 105, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'DATA', PAL.emerald);
            }
          },
          {
            title: '4. Síť (MESH) – maximální odolnost',
            caption: 'Uzly jsou propojeny navzájem více cestami. Ideální pro páteřní WAN a Wi-Fi mesh.',
            render: function (ctx, p, t) {
              var nodes = [[170, 105], [470, 105], [170, 230], [470, 230]];
              for (var i = 0; i < nodes.length; i++) {
                for (var j = i + 1; j < nodes.length; j++) {
                  drawPixelLink(ctx, nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1], { color: PAL.emerald });
                }
              }
              for (var k = 0; k < nodes.length; k++) {
                drawPixelRouter(ctx, nodes[k][0], nodes[k][1], 'R' + (k + 1), '', PAL.emerald, t);
              }
              drawPixelPacket(ctx, lerp(170, 470, p), lerp(105, 230, p), 'MESH', PAL.cyan, 'Redundantní spoje');
            }
          }
        ];

      case 'client-server':
        return [
          {
            title: '1. Model Klient – Server',
            caption: 'Klient posílá požadavek (Request) přes síť, centrální server ho zpracuje a vrací odpověď.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 175, 320, 175, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 175, 510, 175, { color: PAL.emerald });
              drawPixelPC(ctx, 130, 175, 'KLIENT', 'Prohlížeč', PAL.cyan);
              drawPixelCloud(ctx, 320, 175, 'INTERNET', 'TCP/IP', PAL.violet);
              drawPixelServer(ctx, 510, 175, 'SERVER', 'Web + DB', PAL.emerald, t);
              var goOut = p < 0.5;
              var xp = goOut ? lerp(155, 485, p * 2) : lerp(485, 155, (p - 0.5) * 2);
              drawPixelPacket(ctx, xp, 155, goOut ? 'GET' : '200 OK', goOut ? PAL.cyan : PAL.emerald, goOut ? 'Požadavek' : 'Odpověď');
            }
          },
          {
            title: '2. P2P (Peer-to-Peer) – rovní s rovnými',
            caption: 'Každý uzel je zároveň klientem i serverem. Žádný centrální bod řízení.',
            render: function (ctx, p) {
              var peers = [[160, 115], [480, 115], [320, 230]];
              drawPixelLink(ctx, 160, 115, 480, 115, { color: PAL.amber });
              drawPixelLink(ctx, 480, 115, 320, 230, { color: PAL.amber });
              drawPixelLink(ctx, 320, 230, 160, 115, { color: PAL.amber });
              for (var i = 0; i < peers.length; i++) {
                drawPixelPC(ctx, peers[i][0], peers[i][1], 'PEER ' + (i + 1), 'Klient+Server', PAL.amber);
              }
              drawPixelPacket(ctx, lerp(160, 480, p), 115, 'CHUNK', PAL.amber, 'Sdílení napřímo');
            }
          },
          {
            title: '3. Shared Hosting vs. VPS vs. Cloud',
            caption: 'Od sdíleného webhostingu přes vlastní virtuální server (VPS) až po škálovatelný Cloud.',
            render: function (ctx, p, t) {
              drawPixelServer(ctx, 140, 175, 'SHARED', 'Sdílené CPU/RAM', PAL.slate, t);
              drawPixelServer(ctx, 320, 175, 'VPS', 'Vlastní OS / Root', PAL.cyan, t);
              drawPixelCloud(ctx, 505, 175, 'CLOUD', 'Auto-scaling', PAL.emerald);
              var targetX = p < 0.33 ? 140 : (p < 0.66 ? 320 : 505);
              drawBadge(ctx, targetX, 95, 'AKTIVNÍ VÝBĚR', '#0a192f', PAL.amber, PAL.amber);
            }
          }
        ];

      case 'iso-osi':
        return [
          {
            title: '1. Sedm vrstev modelu ISO/OSI',
            caption: 'Komunikace je rozdělena do 7 nezávislých vrstev od Aplikační (L7) po Fyzickou (L1).',
            render: function (ctx, p) {
              var layers = [
                'L7 Aplikační (HTTP, DNS)',
                'L6 Prezentační (TLS, UTF-8)',
                'L5 Relační (Session)',
                'L4 Transportní (TCP/UDP)',
                'L3 Síťová (IP: 192.168.2.10)',
                'L2 Linková (MAC, Ethernet)',
                'L1 Fyzická (Bity / Signál)'
              ];
              var activeIdx = Math.floor(p * 7) % 7;
              for (var i = 0; i < 7; i++) {
                var ly = 64 + i * 30;
                var isAct = i === activeIdx;
                pxRect(ctx, 150, ly, 340, 24, isAct ? '#143b61' : '#101d35');
                ctx.strokeStyle = isAct ? PAL.cyan : PAL.panelBorder;
                ctx.lineWidth = 2;
                ctx.strokeRect(150, ly, 340, 24);
                ctx.fillStyle = isAct ? PAL.cyan : PAL.white;
                ctx.font = 'bold 12px ui-monospace, Menlo, monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(layers[i], 164, ly + 12);
              }
            }
          },
          {
            title: '2. Zapouzdření (Encapsulation) na straně odesílatele',
            caption: 'Data sestupují ze L7 dolů a každá vrstva přidá vlastní hlavičku (Segment → Paket → Rámec).',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 50, 72, 220, 170, 'ODESÍLATEL (L7 → L1)', [
                { text: 'L7-L5: [ DATA ]', color: PAL.white, highlight: p < 0.25 ? '#163554' : null },
                { text: 'L4: [TCP|DATA] Segment', color: PAL.violet, highlight: p >= 0.25 && p < 0.5 ? '#261c47' : null },
                { text: 'L3: [IP|TCP|DATA] Paket', color: PAL.emerald, highlight: p >= 0.5 && p < 0.75 ? '#0c3b2e' : null },
                { text: 'L2: [MAC|IP|..|FCS] Rámec', color: PAL.amber, highlight: p >= 0.75 ? '#3d2807' : null },
                { text: 'L1: 101101001010... Bity', color: PAL.cyan }
              ], PAL.cyan);
              drawPixelLink(ctx, 270, 228, 490, 228, { color: PAL.cyan, width: 3 });
              drawPixelRouter(ctx, 520, 228, 'Síť', '192.168.2.10', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(285, 480, p), 228, 'RÁMEC', PAL.amber, 'L2 + L3 + L4');
            }
          },
          {
            title: '3. Průchod přes Switch (L2) a Router (L3)',
            caption: 'Switch čte jen L2 MAC adresu. Router rozbalí L2, přečte cílovou L3 IP 192.168.2.10 a pošle dál.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 100, 175, 250, 175, { color: PAL.cyan });
              drawPixelLink(ctx, 250, 175, 400, 175, { color: PAL.emerald });
              drawPixelLink(ctx, 400, 175, 540, 175, { color: PAL.emerald });
              drawPixelPC(ctx, 100, 175, 'PC-A', 'Odesílatel', PAL.cyan);
              drawPixelSwitch(ctx, 250, 175, 'SWITCH', 'Vrstva L2 (MAC)', PAL.amber, t);
              drawPixelRouter(ctx, 400, 175, 'ROUTER', 'Vrstva L3 (IP)', PAL.emerald, t);
              drawPixelServer(ctx, 540, 175, 'CÍL', '192.168.2.10', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(115, 525, p), 145, 'IP', PAL.emerald, 'DST: 192.168.2.10');
            }
          },
          {
            title: '4. Rozbalení (Decapsulation) u příjemce',
            caption: 'Příjemce odstraňuje hlavičky zdola nahoru (L1 → L7), až aplikace dostane čistá data.',
            render: function (ctx, p) {
              drawPixelPC(ctx, 110, 185, 'SÍŤ', 'Přichází bity', PAL.cyan);
              drawPixelLink(ctx, 130, 185, 310, 185, { color: PAL.emerald });
              drawPixelPacket(ctx, lerp(145, 295, p), 185, 'BITY', PAL.cyan);
              drawInfoBox(ctx, 320, 74, 270, 165, 'PŘÍJEMCE (L1 → L7)', [
                { text: '1. L1 převede signál na bity', color: PAL.cyan, highlight: p < 0.25 ? '#0e334a' : null },
                { text: '2. L2 ověří FCS a shodu MAC', color: PAL.amber, highlight: p >= 0.25 && p < 0.5 ? '#3d2807' : null },
                { text: '3. L3 zkontroluje cílovou IP', color: PAL.emerald, highlight: p >= 0.5 && p < 0.75 ? '#0c3b2e' : null },
                { text: '4. L4 doručí portu, L7 zobrazí data', color: PAL.white, highlight: p >= 0.75 ? '#163554' : null }
              ], PAL.emerald);
            }
          }
        ];

      case 'tcp-udp':
        return [
          {
            title: '1. TCP 3-Way Handshake: Krok 1 (SYN)',
            caption: 'Klient pošle požadavek na navázání spolehlivého spojení se synchronizačním číslem.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 140, 180, 500, 180, { color: PAL.cyan });
              drawPixelPC(ctx, 140, 180, 'KLIENT', 'Port 51204', PAL.cyan);
              drawPixelServer(ctx, 500, 180, 'SERVER', 'TCP :443 HTTPS', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(165, 475, p), 160, 'SYN', PAL.cyan, '1/3 Navázání spojení');
            }
          },
          {
            title: '2. TCP 3-Way Handshake: Krok 2 (SYN-ACK)',
            caption: 'Server potvrdí příjem SYN a pošle vlastní synchronizační sekvenční číslo.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 140, 180, 500, 180, { color: PAL.emerald });
              drawPixelPC(ctx, 140, 180, 'KLIENT', 'Port 51204', PAL.cyan);
              drawPixelServer(ctx, 500, 180, 'SERVER', 'TCP :443 HTTPS', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(475, 165, p), 160, 'SYN-ACK', PAL.emerald, '2/3 Server souhlasí');
            }
          },
          {
            title: '3. TCP 3-Way Handshake: Krok 3 (ACK) → Spojeno',
            caption: 'Klient potvrdí a spojení je ESTABLISHED. Ztracené pakety se automaticky opakují.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 140, 180, 500, 180, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 140, 180, 'KLIENT', 'ESTABLISHED', PAL.emerald);
              drawPixelServer(ctx, 500, 180, 'SERVER', 'Spolehlivý tok', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(165, 475, p), 160, 'ACK', PAL.emerald, '3/3 Spojení navázáno');
            }
          },
          {
            title: '4. UDP: Rychlý datagram bez potvrzení',
            caption: 'UDP neřeší handshake ani opakování ztracených paketů – ideální pro DNS, VoIP a hry.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 140, 180, 500, 180, { color: PAL.amber, dashed: true });
              drawPixelPC(ctx, 140, 180, 'HRÁČ / DNS', 'UDP klient', PAL.amber);
              drawPixelServer(ctx, 500, 180, 'HRA / DNS', 'UDP :53', PAL.amber, t);
              drawPixelPacket(ctx, lerp(165, 475, (p * 1.4) % 1), 160, 'UDP 1', PAL.amber, 'Minimální latence');
              drawPixelPacket(ctx, lerp(165, 475, ((p * 1.4) + 0.45) % 1), 198, 'UDP 2', PAL.amber);
            }
          }
        ];

      case 'dns':
        return [
          {
            title: '1. DNS dotaz: Klient → Rekurzivní Resolver',
            caption: 'Uživatel zadá example.cz. PC se nejprve zeptá lokální cache a pak svého DNS resolveru (UDP 53).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 290, 185, { color: PAL.cyan });
              drawPixelLink(ctx, 290, 185, 510, 110, { dashed: true });
              drawPixelLink(ctx, 290, 185, 510, 210, { dashed: true });
              drawPixelPC(ctx, 110, 185, 'KLIENT', 'example.cz?', PAL.cyan);
              drawPixelServer(ctx, 290, 185, 'RESOLVER', '1.1.1.1 / ISP', PAL.emerald, t);
              drawPixelCloud(ctx, 510, 110, 'ROOT (.)', 'Kde je .cz?', PAL.violet);
              drawPixelServer(ctx, 510, 215, 'TLD (.cz)', 'NIC.CZ', PAL.amber, t);
              drawPixelPacket(ctx, lerp(135, 265, p), 165, 'DNS ?', PAL.cyan, 'A záznam example.cz');
            }
          },
          {
            title: '2. Dotaz na Root (.) a TLD (.cz) server',
            caption: 'Resolver se postupně doptá Root serveru a následně správce národní domény .cz.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 290, 185, { color: PAL.cyan });
              drawPixelLink(ctx, 290, 185, 510, 105, { color: PAL.violet });
              drawPixelLink(ctx, 290, 185, 510, 215, { color: PAL.amber });
              drawPixelPC(ctx, 110, 185, 'KLIENT', 'Čeká na IP', PAL.cyan);
              drawPixelServer(ctx, 290, 185, 'RESOLVER', 'Iteruje', PAL.emerald, t);
              drawPixelCloud(ctx, 510, 105, 'ROOT (.)', 'Ví o .cz', PAL.violet);
              drawPixelServer(ctx, 510, 215, 'TLD (.cz)', 'Odkáže na NS', PAL.amber, t);
              var py = p < 0.5 ? lerp(185, 105, p * 2) : lerp(185, 215, (p - 0.5) * 2);
              drawPixelPacket(ctx, lerp(310, 485, (p * 2) % 1), py, 'ITER', p < 0.5 ? PAL.violet : PAL.amber);
            }
          },
          {
            title: '3. Autoritativní DNS vrátí IP adresu (A záznam)',
            caption: 'Autoritativní server domény example.cz vrátí IP adresu a resolver ji uloží do cache podle TTL.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 290, 185, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 290, 185, 510, 175, { color: PAL.emerald, width: 3 });
              drawPixelPC(ctx, 110, 185, 'KLIENT', 'IP získána!', PAL.emerald);
              drawPixelServer(ctx, 290, 185, 'RESOLVER', 'Cache TTL=300s', PAL.emerald, t);
              drawPixelServer(ctx, 510, 175, 'AUTH NS', 'example.cz', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(485, 135, p), 160, 'IP', PAL.emerald, 'A: 193.85.10.20');
            }
          }
        ];

      case 'ip-mac-arp':
        return [
          {
            title: '1. ARP Broadcast: Kdo má IP 192.168.1.1?',
            caption: 'PC-A potřebuje MAC adresu brány (routeru). Pošle ARP Request všem v LAN (FF:FF:FF:FF:FF:FF).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 310, 185, { color: PAL.amber });
              drawPixelLink(ctx, 310, 185, 490, 130, { color: PAL.amber });
              drawPixelLink(ctx, 310, 185, 490, 235, { color: PAL.amber });
              drawPixelPC(ctx, 110, 185, 'PC-A', '192.168.1.10', PAL.cyan);
              drawPixelSwitch(ctx, 310, 185, 'SWITCH', 'Flood ARP', PAL.amber, t);
              drawPixelRouter(ctx, 490, 130, 'BRÁNA R1', '192.168.1.1', PAL.emerald, t);
              drawPixelPC(ctx, 490, 235, 'PC-X', 'Ignoruje', PAL.slate);
              drawPixelPacket(ctx, lerp(130, 460, p), lerp(185, 130, p), 'ARP ?', PAL.amber, 'DST MAC: FF:FF..');
            }
          },
          {
            title: '2. ARP Reply: Router odpovídá svou MAC',
            caption: 'Router odpoví unicastem: „192.168.1.1 má MAC R1:R1:11“. PC-A si ji zapíše do ARP cache.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 310, 185, { color: PAL.emerald });
              drawPixelLink(ctx, 310, 185, 490, 130, { color: PAL.emerald });
              drawPixelPC(ctx, 110, 185, 'PC-A', 'ARP uloženo', PAL.emerald);
              drawPixelSwitch(ctx, 310, 185, 'SWITCH', '', PAL.cyan, t);
              drawPixelRouter(ctx, 490, 130, 'BRÁNA R1', 'MAC: R1:11', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(470, 130, p), lerp(130, 185, p), 'ARP OK', PAL.emerald, 'MAC: R1:R1:11');
            }
          },
          {
            title: '3. Průchod přes router: IP zůstává, MAC se mění!',
            caption: 'Cílová IP 192.168.2.10 platí pro celou cestu. Cílová MAC se mění na každém skoku (hop-by-hop).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 100, 180, 320, 180, { color: PAL.cyan, width: 3 });
              drawPixelLink(ctx, 320, 180, 540, 180, { color: PAL.emerald, width: 3 });
              drawPixelPC(ctx, 100, 180, 'PC-A', '192.168.1.10', PAL.cyan);
              drawPixelRouter(ctx, 320, 180, 'ROUTER', 'Přepíše L2 MAC', PAL.amber, t);
              drawPixelPC(ctx, 540, 180, 'PC-B', '192.168.2.10', PAL.emerald);
              var onLeft = p < 0.5;
              var px = onLeft ? lerp(120, 295, p * 2) : lerp(345, 520, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, 150, 'PKT', onLeft ? PAL.cyan : PAL.emerald,
                onLeft ? 'MAC→R1 | IP→.2.10' : 'MAC→PC-B | IP→.2.10');
            }
          }
        ];

      case 'ip-classes-mask':
        return [
          {
            title: '1. 32 bitů IPv4 rozdělených maskou podsítě',
            caption: 'Maska (např. 255.255.255.0 = /24) určuje, které bity patří SÍTI (1) a které HOSTOVI (0).',
            render: function (ctx, p) {
              drawInfoBox(ctx, 60, 74, 520, 128, 'ROZKLAD ADRESY 192.168.1.10 /24', [
                { text: 'IP:    11000000 . 10101000 . 00000001 . 00001010', color: PAL.white },
                { text: 'Maska: 11111111 . 11111111 . 11111111 . 00000000', color: PAL.cyan },
                { text: 'Část:  [======= SÍŤ (24 bitů) ======]  [HOST 8b]', color: PAL.emerald, highlight: '#0c3b2e' },
                { text: 'Síť: 192.168.1.0   |   Host v síti: .10', color: PAL.amber }
              ], PAL.cyan);
              var scanX = lerp(95, 530, p);
              pxRect(ctx, scanX, 74, 4, 128, 'rgba(56,189,248,0.28)');
            }
          },
          {
            title: '2. Privátní rozsahy (RFC 1918) vs. Veřejné IP',
            caption: '10.0.0.0/8, 172.16.0.0/12 a 192.168.0.0/16 jsou pro LAN. Veřejné IP směruje Internet.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 175, 320, 175, { color: PAL.emerald });
              drawPixelLink(ctx, 320, 175, 510, 175, { color: PAL.cyan });
              drawPixelPC(ctx, 130, 175, 'LAN PC', '192.168.1.10', PAL.emerald);
              drawPixelRouter(ctx, 320, 175, 'ROUTER', 'RFC1918 ↔ WAN', PAL.amber, t);
              drawPixelCloud(ctx, 510, 175, 'INTERNET', 'Veřejné IP', PAL.cyan);
              drawBadge(ctx, 130, 96, 'PRIVÁTNÍ LAN', '#0c3b2e', PAL.emerald, PAL.emerald);
              drawBadge(ctx, 510, 96, 'VEŘEJNÁ IP', '#0c2b4a', PAL.cyan, PAL.cyan);
            }
          }
        ];

      case 'subnetting':
        return [
          {
            title: '1. Výchozí síť 192.168.10.0/24 (254 hostů)',
            caption: 'Původní síť má 8 bitů pro hosty. Potřebujeme ji rozdělit na 4 menší oddělení.',
            render: function (ctx) {
              drawInfoBox(ctx, 60, 72, 520, 170, 'PŮVODNÍ SÍŤ /24 (1 VELKÝ BLOK)', [
                { text: 'Rozsah: 192.168.10.0 – 192.168.10.255', color: PAL.white },
                { text: 'Maska:  255.255.255.0   (254 použitelných hostů)', color: PAL.cyan },
                { text: 'Bity 4. oktetu: [ H H H H H H H H ]', color: PAL.amber }
              ], PAL.cyan);
            }
          },
          {
            title: '2. Vypůjčení 2 bitů pro podsítě (/24 → /26)',
            caption: 'Vypůjčíme 2 hostitelské bity → vzniknou 2² = 4 podsítě, každá se 62 použitelnými hosty.',
            render: function (ctx, p) {
              var blocks = [
                { lbl: '#1: .0/26 (.1–.62)', col: PAL.cyan },
                { lbl: '#2: .64/26 (.65–.126)', col: PAL.emerald },
                { lbl: '#3: .128/26 (.129–.190)', col: PAL.amber },
                { lbl: '#4: .192/26 (.193–.254)', col: PAL.violet }
              ];
              var hi = Math.floor(p * 4) % 4;
              for (var i = 0; i < 4; i++) {
                var bx = 50 + (i % 2) * 280;
                var by = 82 + Math.floor(i / 2) * 84;
                pxRect(ctx, bx, by, 260, 68, i === hi ? '#162d4d' : '#0d182b');
                ctx.strokeStyle = blocks[i].col;
                ctx.lineWidth = i === hi ? 3 : 2;
                ctx.strokeRect(bx, by, 260, 68);
                ctx.fillStyle = blocks[i].col;
                ctx.font = 'bold 13px ui-monospace, Menlo, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(blocks[i].lbl, bx + 130, by + 34);
              }
            }
          }
        ];

      case 'dhcp-dora':
        return [
          {
            title: '1. D – DISCOVER (Broadcast klienta)',
            caption: 'Nový klient ještě nemá IP (0.0.0.0) a hledá jakýkoli DHCP server v síti (255.255.255.255).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.amber });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'IP: 0.0.0.0', PAL.amber);
              drawPixelServer(ctx, 510, 180, 'DHCP SERVER', '192.168.1.1', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(155, 485, p), 155, 'D', PAL.amber, 'DISCOVER (Broadcast)');
            }
          },
          {
            title: '2. O – OFFER (Nabídka IP od serveru)',
            caption: 'DHCP server vybere volnou adresu 192.168.1.10/24 a nabídne ji klientovi.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.cyan });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'Čeká na nabídku', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'DHCP SERVER', 'Pool .10–.200', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(485, 155, p), 155, 'O', PAL.cyan, 'OFFER: 192.168.1.10');
            }
          },
          {
            title: '3. R – REQUEST (Žádost o vybranou IP)',
            caption: 'Klient potvrdí přijetí nabídnuté adresy 192.168.1.10, aby ostatní servery uvolnily své nabídky.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.violet });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'Chci .1.10', PAL.violet);
              drawPixelServer(ctx, 510, 180, 'DHCP SERVER', '192.168.1.1', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(155, 485, p), 155, 'R', PAL.violet, 'REQUEST 192.168.1.10');
            }
          },
          {
            title: '4. A – ACKNOWLEDGE (Potvrzení & Lease)',
            caption: 'Server zapíše pronájem (Lease 24h) a klient nastaví IP 192.168.1.10, masku, bránu i DNS.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', '192.168.1.10 OK', PAL.emerald);
              drawPixelServer(ctx, 510, 180, 'DHCP SERVER', 'Lease aktivní', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(485, 155, p), 155, 'ACK', PAL.emerald, 'IP + GW + DNS uloženo');
            }
          }
        ];

      case 'routing':
        return [
          {
            title: '1. Paket přichází na router (Cíl: 192.168.2.10)',
            caption: 'Stanice chce komunikovat mimo svou podsíť, proto posílá paket výchozí bráně (Router R1).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 195, 250, 195, { color: PAL.cyan });
              drawPixelLink(ctx, 250, 195, 430, 130, { color: PAL.slate });
              drawPixelLink(ctx, 250, 195, 430, 225, { color: PAL.slate });
              drawPixelPC(ctx, 90, 195, 'PC-A', '192.168.1.10', PAL.cyan);
              drawPixelRouter(ctx, 250, 195, 'R1', 'Brána', PAL.amber, t);
              drawPixelServer(ctx, 430, 130, 'CÍL A', '192.168.2.10', PAL.emerald, t);
              drawPixelCloud(ctx, 430, 225, 'WAN', '0.0.0.0/0', PAL.violet);
              drawPixelPacket(ctx, lerp(110, 225, p), 168, 'IP', PAL.cyan, 'DST: 192.168.2.10');
            }
          },
          {
            title: '2. Vyhodnocení směrovací tabulky (Longest Prefix Match)',
            caption: 'Router porovná cíl 192.168.2.10 se všemi řádky. Vyhrává nejdelší shodná maska (/24 před /0).',
            render: function (ctx, p, t) {
              drawPixelRouter(ctx, 110, 190, 'ROUTER R1', 'Hledá LPM', PAL.amber, t);
              drawInfoBox(ctx, 210, 66, 390, 128, 'SMĚROVACÍ TABULKA (LPM)', [
                { text: '0.0.0.0/0       → WAN 1    (shoda, 0 bitů)', color: PAL.slate },
                { text: '192.168.1.0/24  → LAN 1    (neshoduje se)', color: PAL.slate },
                { text: '192.168.2.0/24  → LAN 2    (SHODA 24 bitů!)', color: PAL.emerald, highlight: '#0c3b2e' },
                { text: '10.10.0.0/16    → VPN tunel (neshoduje se)', color: PAL.slate }
              ], PAL.emerald);
              drawBadge(ctx, 405, 222, 'VÍTĚZ: 192.168.2.0/24 → PORT LAN 2', '#0c3b2e', PAL.emerald, PAL.emerald);
            }
          },
          {
            title: '3. Přeposlání na výstupní rozhraní LAN 2',
            caption: 'Router sníží TTL o 1, zabalí paket do nového L2 rámce a odešle jej do cílové sítě.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 190, 270, 190, { color: PAL.cyan });
              drawPixelLink(ctx, 270, 190, 520, 145, { color: PAL.emerald, width: 4 });
              drawPixelLink(ctx, 270, 190, 520, 235, { dashed: true });
              drawPixelPC(ctx, 90, 190, 'PC-A', '192.168.1.10', PAL.cyan);
              drawPixelRouter(ctx, 270, 190, 'R1', 'TTL - 1', PAL.emerald, t);
              drawPixelServer(ctx, 520, 145, 'CÍL', '192.168.2.10', PAL.emerald, t);
              drawPixelCloud(ctx, 520, 235, 'WAN', '8.8.8.8', PAL.slate);
              drawPixelPacket(ctx, lerp(290, 495, p), lerp(185, 145, p), 'FWD', PAL.emerald, 'Přeposláno na LAN 2');
            }
          }
        ];

      case 'nat-pat':
        return [
          {
            title: '1. Odchozí paket z privátní LAN (192.168.1.10)',
            caption: 'Privátní adresa 192.168.1.10 nesmí do internetu. Paket dorazí na NAT router.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 310, 185, { color: PAL.amber });
              drawPixelLink(ctx, 310, 185, 530, 185, { color: PAL.cyan });
              drawPixelPC(ctx, 110, 185, 'LAN PC', '192.168.1.10', PAL.amber);
              drawPixelRouter(ctx, 310, 185, 'NAT ROUTER', 'WAN: 203.0.113.5', PAL.cyan, t);
              drawPixelServer(ctx, 530, 185, 'WEB', '8.8.8.8:443', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(135, 285, p), 155, 'LAN', PAL.amber, 'SRC: 192.168.1.10:54122');
            }
          },
          {
            title: '2. Překlad NAT/PAT na veřejnou IP 203.0.113.5',
            caption: 'Router přepíše zdrojovou IP na 203.0.113.5, přidělí port :40001 a uloží mapování do tabulky.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 195, 310, 195, { color: PAL.amber });
              drawPixelLink(ctx, 310, 195, 530, 195, { color: PAL.emerald, width: 3 });
              drawInfoBox(ctx, 130, 56, 380, 74, 'NAT/PAT PŘEKLADOVÁ TABULKA', [
                { text: 'Inside: 192.168.1.10:54122 ↔ Outside: 203.0.113.5:40001', color: PAL.emerald, highlight: '#0c3b2e' },
                { text: 'Protokol: TCP  |  Cíl: 8.8.8.8:443', color: PAL.cyan }
              ], PAL.emerald);
              drawPixelPC(ctx, 110, 195, 'LAN PC', '192.168.1.10', PAL.amber);
              drawPixelRouter(ctx, 310, 195, 'NAT ROUTER', 'Přepis SRC!', PAL.emerald, t);
              drawPixelServer(ctx, 530, 195, 'WEB', '8.8.8.8:443', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(335, 505, p), 168, 'WAN', PAL.emerald, 'SRC: 203.0.113.5:40001');
            }
          },
          {
            title: '3. Návrat odpovědi zpět na 192.168.1.10',
            caption: 'Server odpovídá na 203.0.113.5:40001. Router podle NAT tabulky vrátí cíl na 192.168.1.10.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 185, 310, 185, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 310, 185, 530, 185, { color: PAL.cyan });
              drawPixelPC(ctx, 110, 185, 'LAN PC', '192.168.1.10 OK', PAL.emerald);
              drawPixelRouter(ctx, 310, 185, 'NAT ROUTER', 'Zpětný překlad', PAL.cyan, t);
              drawPixelServer(ctx, 530, 185, 'WEB', '8.8.8.8:443', PAL.emerald, t);
              var isRight = p < 0.5;
              var xp = isRight ? lerp(505, 335, p * 2) : lerp(285, 135, (p - 0.5) * 2);
              drawPixelPacket(ctx, xp, 155, '200 OK', isRight ? PAL.cyan : PAL.emerald,
                isRight ? 'DST: 203.0.113.5:40001' : 'DST: 192.168.1.10:54122');
            }
          }
        ];

      case 'ethernet-switch':
        return [
          {
            title: '1. Neznámá cílová MAC → Učení + FLOOD',
            caption: 'Switch se naučí zdrojovou MAC (PC-A → Port 1). Cíl PC-B nezná, proto zaplaví všechny ostatní porty.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 180, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 180, 520, 105, { color: PAL.amber });
              drawPixelLink(ctx, 320, 180, 520, 235, { color: PAL.amber });
              drawPixelPC(ctx, 120, 180, 'PC-A (P1)', 'MAC: AA:11', PAL.cyan);
              drawPixelSwitch(ctx, 320, 180, 'SWITCH', 'Učí se AA:11→P1', PAL.amber, t);
              drawPixelPC(ctx, 520, 105, 'PC-B (P2)', 'MAC: BB:22', PAL.amber);
              drawPixelPC(ctx, 520, 235, 'PC-C (P3)', 'Ignoruje', PAL.slate);
              if (p < 0.45) {
                drawPixelPacket(ctx, lerp(140, 295, p / 0.45), 180, 'FRAME', PAL.cyan);
              } else {
                var fp = (p - 0.45) / 0.55;
                drawPixelPacket(ctx, lerp(345, 500, fp), lerp(180, 105, fp), 'FLOOD', PAL.amber);
                drawPixelPacket(ctx, lerp(345, 500, fp), lerp(180, 235, fp), 'FLOOD', PAL.amber);
              }
            }
          },
          {
            title: '2. Známá MAC v CAM tabulce → Přesný UNICAST',
            caption: 'Jakmile PC-B odpoví, switch zná oba porty a další rámce posílá už jen na jediný správný port!',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 180, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 320, 180, 520, 105, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 320, 180, 520, 235, { dashed: true });
              drawInfoBox(ctx, 195, 56, 250, 62, 'CAM TABULKA SWITCHE', [
                { text: 'AA:11 → Port 1  |  BB:22 → Port 2', color: PAL.emerald, highlight: '#0c3b2e' }
              ], PAL.emerald);
              drawPixelPC(ctx, 120, 180, 'PC-A (P1)', 'AA:11', PAL.emerald);
              drawPixelSwitch(ctx, 320, 180, 'SWITCH', 'Unicast P1 → P2', PAL.emerald, t);
              drawPixelPC(ctx, 520, 105, 'PC-B (P2)', 'BB:22', PAL.emerald);
              drawPixelPC(ctx, 520, 235, 'PC-C (P3)', 'Klid (žádný šum)', PAL.slate);
              var px = p < 0.5 ? lerp(140, 310, p * 2) : lerp(330, 500, (p - 0.5) * 2);
              var py = p < 0.5 ? 180 : lerp(180, 105, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'UNI', PAL.emerald, 'Pouze Port 2');
            }
          }
        ];

      case 'vlan':
        return [
          {
            title: '1. Přístupové porty (Access): VLAN 10 vs. VLAN 20',
            caption: 'Switch logicky rozdělí fyzické porty na VLAN 10 (Sales) a VLAN 20 (IT). Koncová PC posílají běžné netagované rámce.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 96, 108, 295, 166, { color: PAL.cyan });
              drawPixelLink(ctx, 295, 166, 520, 108, { color: PAL.cyan });
              drawPixelLink(ctx, 96, 224, 295, 166, { color: PAL.amber });
              drawPixelLink(ctx, 295, 166, 520, 224, { color: PAL.amber });
              drawPixelPC(ctx, 96, 108, 'PC-1 (P1)', 'VLAN 10 • Sales', PAL.cyan);
              drawPixelPC(ctx, 96, 224, 'PC-2 (P2)', 'VLAN 20 • IT', PAL.amber);
              drawPixelSwitch(ctx, 295, 166, 'L2 SWITCH', 'P1,P3:V10 | P2,P4:V20', PAL.violet, t);
              drawPixelPC(ctx, 520, 108, 'PC-3 (P3)', 'VLAN 10 • Sales', PAL.cyan);
              drawPixelPC(ctx, 520, 224, 'PC-4 (P4)', 'VLAN 20 • IT', PAL.amber);
              var px = p < 0.5 ? lerp(115, 275, p * 2) : lerp(315, 500, (p - 0.5) * 2);
              var py = p < 0.5 ? lerp(108, 162, p * 2) : lerp(162, 108, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'UNTAG', PAL.cyan, 'Sales (VLAN 10)');
            }
          },
          {
            title: '2. Izolace broadcastových domén',
            caption: 'Broadcast (FF:FF..) z VLAN 10 (Sales) se šíří pouze v VLAN 10. Stanice ve VLAN 20 (IT) jej nikdy neobdrží.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 96, 108, 295, 166, { color: PAL.cyan, width: 4 });
              drawPixelLink(ctx, 295, 166, 520, 108, { color: PAL.cyan, width: 4 });
              drawPixelLink(ctx, 96, 224, 295, 166, { color: PAL.slate, dashed: true });
              drawPixelLink(ctx, 295, 166, 520, 224, { color: PAL.slate, dashed: true });
              drawPixelPC(ctx, 96, 108, 'PC-1 (P1)', 'VLAN 10 • Sales', PAL.cyan);
              drawPixelPC(ctx, 96, 224, 'PC-2 (P2)', 'Izolováno (V20)', PAL.slate);
              drawPixelSwitch(ctx, 295, 166, 'SWITCH', 'Broadcast jen V10', PAL.cyan, t);
              drawPixelPC(ctx, 520, 108, 'PC-3 (P3)', 'VLAN 10 • Sales', PAL.cyan);
              drawPixelPC(ctx, 520, 224, 'PC-4 (P4)', 'Izolováno (V20)', PAL.slate);
              drawBadge(ctx, 415, 232, 'BLOKOVÁNO DO VLAN 20', '#2a0912', PAL.rose, PAL.rose);
              var px = p < 0.5 ? lerp(115, 275, p * 2) : lerp(315, 500, (p - 0.5) * 2);
              var py = p < 0.5 ? lerp(108, 162, p * 2) : lerp(162, 108, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'BCAST', PAL.cyan, 'FF:FF.. pouze V10');
            }
          },
          {
            title: '3. IEEE 802.1Q Trunk: Vložení 4B tagu',
            caption: 'Na Trunk lince switch vloží do rámce 4bajtovou hlavičku 802.1Q (TPID 0x8100 + VID 10/20), aby se provoz více VLAN po 1 kabelu nesmíchal.',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 110, 44, 420, 56, 'RÁMEC S TAGEM IEEE 802.1Q (+4 BAJTY)', [
                { text: '[DMAC] [SMAC] [0x8100 | VID=10/20] [Type] [Data]', color: PAL.cyan, highlight: '#102a46' }
              ], PAL.violet);
              drawPixelLink(ctx, 90, 144, 250, 196, { color: PAL.cyan });
              drawPixelLink(ctx, 90, 224, 250, 196, { color: PAL.amber });
              drawPixelLink(ctx, 250, 196, 515, 196, { color: PAL.violet, width: 5 });
              drawPixelPC(ctx, 90, 144, 'PC Sales', 'VLAN 10', PAL.cyan);
              drawPixelPC(ctx, 90, 224, 'PC IT', 'VLAN 20', PAL.amber);
              drawPixelSwitch(ctx, 250, 196, 'SWITCH', 'Access → Trunk', PAL.violet, t);
              drawPixelRouter(ctx, 515, 196, 'ROUTER / L3', '802.1Q Trunk', PAL.emerald, t);
              drawBadge(ctx, 382, 224, 'TRUNK 802.1Q (V10 + V20)', '#1e1338', PAL.violet, PAL.violet);
              var isV10 = p < 0.5;
              drawPixelPacket(ctx, lerp(280, 485, (p * 2) % 1), 176, isV10 ? 'VID 10' : 'VID 20', isV10 ? PAL.cyan : PAL.amber, isV10 ? 'Tag 0x8100:10' : 'Tag 0x8100:20');
            }
          },
          {
            title: '4. Inter-VLAN Routing (propojení VLAN přes L3)',
            caption: 'Aby spolu VLAN 10 (10.0.10.0/24) a VLAN 20 (10.0.20.0/24) komunikovaly, musí rámec přes Trunk do routeru / L3 switche.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 95, 134, 275, 184, { color: PAL.cyan });
              drawPixelLink(ctx, 95, 232, 275, 184, { color: PAL.amber });
              drawPixelLink(ctx, 275, 184, 505, 184, { color: PAL.violet, width: 4 });
              drawPixelPC(ctx, 95, 134, 'PC Sales', '10.0.10.10', PAL.cyan);
              drawPixelPC(ctx, 95, 232, 'PC IT', '10.0.20.20', PAL.amber);
              drawPixelSwitch(ctx, 275, 184, 'L2 SWITCH', 'Trunk → L3', PAL.violet, t);
              drawPixelRouter(ctx, 505, 184, 'L3 ROUTER', 'SVI .10.1 / .20.1', PAL.emerald, t);
              drawBadge(ctx, 390, 68, 'INTER-VLAN ROUTING: V10 → L3 → V20', '#0c3b2e', PAL.emerald, PAL.emerald);
              if (p < 0.34) {
                var tp1 = p / 0.34;
                drawPixelPacket(ctx, lerp(115, 260, tp1), lerp(134, 180, tp1), 'V10', PAL.cyan, 'Untagged → SW');
              } else if (p < 0.68) {
                var tp2 = (p - 0.34) / 0.34;
                drawPixelPacket(ctx, lerp(295, 480, tp2), 176, 'VID 10', PAL.violet, 'Trunk → L3 GW');
              } else {
                var tp3 = (p - 0.68) / 0.32;
                var px = tp3 < 0.5 ? lerp(480, 295, tp3 * 2) : lerp(260, 115, (tp3 - 0.5) * 2);
                var py = tp3 < 0.5 ? 192 : lerp(188, 232, (tp3 - 0.5) * 2);
                drawPixelPacket(ctx, px, py, 'VID 20', PAL.emerald, 'Přesměrováno do IT');
              }
            }
          }
        ];

      case 'wifi-modes':
        return [
          {
            title: '1. 2.4 GHz vs. 5 GHz / 6 GHz – dosah a zdi',
            caption: '2.4 GHz projde lépe zdmi, ale má úzké kanály a rušení. 5/6 GHz je ultra rychlé na kratší dosah.',
            render: function (ctx, p, t) {
              drawPixelTower(ctx, 120, 175, 'Wi-Fi AP', 'Dual/Tri-Band', PAL.cyan, t);
              // Betonová zeď
              pxRect(ctx, 310, 78, 18, 175, '#475569');
              drawBadge(ctx, 319, 64, 'ZEĎ', '#1e293b', PAL.slate, PAL.slate);
              drawPixelPC(ctx, 505, 130, '2.4 GHz', 'Delší dosah', PAL.amber);
              drawPixelPC(ctx, 505, 225, '5 / 6 GHz', 'Vysoká rychlost', PAL.cyan);
              drawPixelPacket(ctx, lerp(145, 480, p), 130, '2.4G', PAL.amber, 'Projde zdí');
              drawPixelPacket(ctx, lerp(145, 310, p), 225, '5G', PAL.cyan, 'Útlum zdí');
            }
          },
          {
            title: '2. Režimy AP vs. Router vs. Repeater',
            caption: 'AP pouze převádí kabel na Wi-Fi (žádný druhý NAT). Repeater bezdrátově opakuje, ale půlí rychlost.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 100, 185, 260, 185, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 260, 185, 430, 185, { dashed: true, color: PAL.amber });
              drawPixelRouter(ctx, 100, 185, 'HL. ROUTER', 'NAT + DHCP', PAL.emerald, t);
              drawPixelTower(ctx, 260, 185, 'AP (BRIDGE)', '100% rychlost', PAL.emerald, t);
              drawPixelTower(ctx, 430, 185, 'REPEATER', '½ propustnosti', PAL.amber, t);
              drawPixelPC(ctx, 560, 185, 'KLIENT', '', PAL.cyan);
              drawPixelPacket(ctx, lerp(120, 535, p), 150, 'Wi-Fi', PAL.cyan);
            }
          }
        ];

      case 'iot-spectrum':
        return [
          {
            title: '1. Krátký dosah & nízká spotřeba: BLE / Zigbee',
            caption: 'Senzory v místnosti posílají malé zprávy přes Bluetooth LE nebo Zigbee/Thread mesh na bránu.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 140, 290, 175, { color: PAL.emerald, dashed: true });
              drawPixelLink(ctx, 120, 220, 290, 175, { color: PAL.emerald, dashed: true });
              drawPixelLink(ctx, 290, 175, 500, 175, { color: PAL.cyan, width: 3 });
              drawBadge(ctx, 120, 130, 'BLE ČIDLO (21°C)', '#0c3b2e', PAL.emerald, PAL.emerald);
              drawBadge(ctx, 120, 220, 'ZIGBEE MESH', '#0c3b2e', PAL.emerald, PAL.emerald);
              drawPixelRouter(ctx, 290, 175, 'IOT BRÁNA', 'Lokální Hub', PAL.cyan, t);
              drawPixelCloud(ctx, 500, 175, 'CLOUD', 'MQTT / Dashboard', PAL.violet);
              drawPixelPacket(ctx, lerp(160, 480, p), 175, '24 B', PAL.emerald, 'Výdrž roky na baterii');
            }
          },
          {
            title: '2. Dálkové LPWAN: LoRaWAN & NB-IoT (kilometry)',
            caption: 'Měření na poli či ve městě (868 MHz) dosáhne na kilometry díky nízké přenosové rychlosti.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 200, 340, 150, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 340, 150, 530, 180, { color: PAL.cyan });
              drawBadge(ctx, 110, 205, 'LORA SENZOR (8 km)', '#3d2807', PAL.amber, PAL.amber);
              drawPixelTower(ctx, 340, 150, 'LoRa GATEWAY', '868 MHz EU', PAL.amber, t);
              drawPixelCloud(ctx, 530, 180, 'IOT SERVER', 'Telemetrie', PAL.cyan);
              drawPixelPacket(ctx, lerp(140, 325, p), lerp(200, 150, p), 'LoRa', PAL.amber, 'Pár bajtů / hod.');
            }
          }
        ];

      case 'firewall':
        return [
          {
            title: '1. Stateless Firewall (Bezstavový ACL filtr)',
            caption: 'Kontroluje každý paket samostatně podle IP a portu (L3/L4) bez paměti relací. Návratový provoz musí být explicitně povolen.',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 110, 44, 420, 74, 'STATELESS ACL (BEZ PAMĚTI SPOJENÍ)', [
                { text: '1. ALLOW TCP DST :443  → Odchozí dotaz projde', color: PAL.emerald, highlight: p < 0.5 ? '#0c3b2e' : null },
                { text: '2. DENY INBOUND ANY    → Odpověď bez paměti DROP!', color: PAL.rose, highlight: p >= 0.5 ? '#3b0c19' : null }
              ], PAL.amber);
              drawPixelLink(ctx, 95, 204, 315, 204, { color: PAL.cyan });
              drawPixelLink(ctx, 315, 204, 535, 204, { color: p >= 0.5 ? PAL.rose : PAL.emerald });
              drawPixelPC(ctx, 95, 204, 'LAN PC', '192.168.1.10', PAL.cyan);
              drawPixelFirewall(ctx, 315, 204, 'STATELESS ACL', 'L3/L4 bez paměti', PAL.amber, t);
              drawPixelServer(ctx, 535, 204, 'WEB SERVER', '93.184.216.34:443', PAL.emerald, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(115, 515, p * 2), 176, 'SYN :443', PAL.emerald, 'L3/L4 OK');
              } else {
                drawPixelPacket(ctx, lerp(515, 338, (p - 0.5) * 2), 176, 'ACK?', PAL.rose, 'DROP: nezná relaci!');
              }
            }
          },
          {
            title: '2. Stateful Firewall (Stavová inspekce / Conntrack)',
            caption: 'Udržuje stavovou tabulku aktivních spojení. Odpověď ke známé relaci (ESTABLISHED) pustí, nevyžádaný vstup z WAN zahodí.',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 100, 44, 440, 74, 'STAVOVÁ TABULKA (CONNECTION TRACKING)', [
                { text: '192.168.1.10:51200 ↔ :443  [ESTABLISHED] → ACCEPT', color: PAL.emerald, highlight: p < 0.5 ? '#0c3b2e' : null },
                { text: 'WAN 198.51.100.9 → :22   [NEW / Cizí]    → DROP!', color: PAL.rose, highlight: p >= 0.5 ? '#3b0c19' : null }
              ], PAL.emerald);
              drawPixelLink(ctx, 95, 204, 310, 204, { color: PAL.emerald });
              drawPixelLink(ctx, 310, 204, 530, 154, { color: PAL.emerald });
              drawPixelLink(ctx, 310, 204, 530, 240, { color: PAL.rose, dashed: true });
              drawPixelPC(ctx, 95, 204, 'LAN PC', '192.168.1.10', PAL.emerald);
              drawPixelFirewall(ctx, 310, 204, 'STATEFUL FW', 'Conntrack aktivní', PAL.emerald, t);
              drawPixelServer(ctx, 530, 154, 'WEB :443', 'HTTPS odpověď', PAL.emerald, t);
              drawPixelCloud(ctx, 530, 240, 'WAN ÚTOK', 'Port :22 NEW', PAL.rose);
              if (p < 0.5) {
                var ep = p * 2;
                var px = ep < 0.5 ? lerp(510, 320, ep * 2) : lerp(320, 115, (ep - 0.5) * 2);
                var py = ep < 0.5 ? lerp(154, 204, ep * 2) : 204;
                drawPixelPacket(ctx, px, py, 'ESTAB', PAL.emerald, 'Návrat povolen');
              } else {
                var ap = (p - 0.5) * 2;
                drawPixelPacket(ctx, lerp(510, 340, ap), lerp(240, 210, ap), 'SSH NEW', PAL.rose, 'WAN → DROP!');
              }
            }
          },
          {
            title: '3. NGFW (L7 DPI, App-ID & IPS prevence)',
            caption: 'Next-Gen Firewall analyzuje obsah aplikační vrstvy (L7 DPI). Na povoleném portu :443 odliší čisté HTTPS od skrytého malwaru.',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 100, 44, 440, 74, 'NGFW HLUBOKÁ INSPEKCE (L7 DPI + IPS)', [
                { text: 'Port :443 | App-ID: HTTPS Web    → ACCEPT', color: PAL.emerald, highlight: p < 0.5 ? '#0c3b2e' : null },
                { text: 'Port :443 | Signatura: Malware  → IPS BLOCK!', color: PAL.rose, highlight: p >= 0.5 ? '#3b0c19' : null }
              ], PAL.violet);
              drawPixelLink(ctx, 95, 204, 315, 204, { color: PAL.cyan });
              drawPixelLink(ctx, 315, 204, 535, 204, { color: p < 0.5 ? PAL.emerald : PAL.rose });
              drawPixelPC(ctx, 95, 204, 'SÍŤ / KLIENT', 'Port :443 otevřen', PAL.cyan);
              drawPixelFirewall(ctx, 315, 204, 'NGFW (L7)', 'DPI + App-ID + IPS', PAL.violet, t);
              drawPixelServer(ctx, 535, 204, 'SERVER / LAN', 'Chráněný cíl', PAL.emerald, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(115, 515, p * 2), 176, 'HTTPS', PAL.emerald, 'App-ID OK');
              } else {
                drawPixelPacket(ctx, lerp(115, 292, (p - 0.5) * 2), 176, 'EXPLOIT', PAL.rose, 'IPS BLOCK v :443!');
              }
            }
          }
        ];

      case 'sdn':
        return [
          {
            title: '1. Třívrstvá architektura SDN',
            caption: 'SDN odděluje aplikační a řídicí vrstvu (Control Plane) od přeposílání paketů (Data Plane) pomocí otevřených API.',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 90, 44, 460, 38, 'APPLICATION PLANE (Síťové politiky, Monitoring, QoS)', [], PAL.violet);
              drawPixelLink(ctx, 320, 82, 320, 114, { color: PAL.violet, dashed: true });
              drawBadge(ctx, 455, 96, 'Northbound API (REST)', '#1e1338', PAL.violet, PAL.violet);
              drawPixelController(ctx, 320, 134, 'SDN KONTROLÉR', 'Control Plane (Centrální mozek)', PAL.cyan, t);
              drawPixelLink(ctx, 320, 148, 150, 236, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 320, 148, 320, 236, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 320, 148, 490, 236, { color: PAL.amber, dashed: true });
              drawBadge(ctx, 145, 192, 'Southbound (OpenFlow)', '#3d2807', PAL.amber, PAL.amber);
              drawPixelLink(ctx, 150, 236, 320, 236, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 320, 236, 490, 236, { color: PAL.emerald, width: 3 });
              drawPixelSwitch(ctx, 150, 236, 'SW-1', 'Data Plane', PAL.emerald, t);
              drawPixelSwitch(ctx, 320, 236, 'SW-2', 'Data Plane', PAL.emerald, t);
              drawPixelSwitch(ctx, 490, 236, 'SW-3', 'Data Plane', PAL.emerald, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, 320, lerp(82, 128, p * 2), 'INTENT', PAL.violet);
              } else {
                drawPixelPacket(ctx, 320, lerp(148, 226, (p - 0.5) * 2), 'FLOW', PAL.amber);
              }
            }
          },
          {
            title: '2. Nahrání Flow pravidel přes Southbound API',
            caption: 'Kontrolér centrálně vypočítá pravidla a přes OpenFlow / NETCONF je zapíše do Flow tabulek všech switchů.',
            render: function (ctx, p, t) {
              drawInfoBox(ctx, 40, 48, 285, 76, 'OPENFLOW TABULKA (PUSH)', [
                { text: 'DST 10.0.2.0/24 → Port 3', color: PAL.emerald, highlight: '#0c3b2e' },
                { text: 'TCP :22 (Zakázáno) → DROP', color: PAL.rose }
              ], PAL.cyan);
              drawPixelController(ctx, 465, 92, 'SDN KONTROLÉR', 'Generuje Flow pravidla', PAL.cyan, t);
              drawPixelLink(ctx, 465, 112, 130, 234, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 465, 112, 320, 234, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 465, 112, 510, 234, { color: PAL.amber, dashed: true });
              drawPixelSwitch(ctx, 130, 234, 'SW-1', 'Flow tabulka OK', PAL.emerald, t);
              drawPixelSwitch(ctx, 320, 234, 'SW-2', 'Flow tabulka OK', PAL.emerald, t);
              drawPixelSwitch(ctx, 510, 234, 'SW-3', 'Flow tabulka OK', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(465, 130, p), lerp(112, 220, p), 'RULE', PAL.amber);
              drawPixelPacket(ctx, lerp(465, 320, p), lerp(112, 220, p), 'RULE', PAL.amber);
              drawPixelPacket(ctx, lerp(465, 510, p), lerp(112, 220, p), 'RULE', PAL.amber);
            }
          },
          {
            title: '3. Dynamické přeposílání toků v Data Plane',
            caption: 'Při výpadku či přetížení linky přes SW-2 kontrolér okamžitě aktualizuje Flow tabulky a přesměruje tok přes SW-3.',
            render: function (ctx, p, t) {
              drawPixelController(ctx, 320, 82, 'SDN KONTROLÉR', 'Detekoval výpadek → Re-Flow', PAL.cyan, t);
              drawPixelLink(ctx, 320, 98, 205, 214, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 80, 220, 205, 220, { color: PAL.cyan, width: 3 });
              drawPixelLink(ctx, 205, 220, 360, 164, { broken: true });
              drawPixelLink(ctx, 360, 164, 540, 220, { broken: true });
              drawPixelLink(ctx, 205, 220, 360, 236, { color: PAL.emerald, width: 4 });
              drawPixelLink(ctx, 360, 236, 540, 220, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 80, 220, 'KLIENT', '10.10.0.5', PAL.cyan);
              drawPixelSwitch(ctx, 205, 220, 'SW-1', 'Přesměrováno', PAL.emerald, t);
              drawPixelSwitch(ctx, 360, 164, 'SW-2', 'VÝPADEK', PAL.rose, t);
              drawPixelSwitch(ctx, 360, 236, 'SW-3', 'Nový Flow OK', PAL.emerald, t);
              drawPixelServer(ctx, 540, 220, 'SERVER', 'Doručeno', PAL.emerald, t);
              if (p < 0.35) {
                var rp = p / 0.35;
                drawPixelPacket(ctx, lerp(320, 205, rp), lerp(100, 208, rp), 'NEW FLOW', PAL.amber);
              } else {
                var dp = (p - 0.35) / 0.65;
                var px, py;
                if (dp < 0.33) {
                  px = lerp(95, 205, dp / 0.33);
                  py = 220;
                } else if (dp < 0.66) {
                  var s2 = (dp - 0.33) / 0.33;
                  px = lerp(205, 360, s2);
                  py = lerp(220, 236, s2);
                } else {
                  var s3 = (dp - 0.66) / 0.34;
                  px = lerp(360, 520, s3);
                  py = lerp(236, 220, s3);
                }
                drawPixelPacket(ctx, px, py, 'DATA', PAL.emerald, 'Dynamická trasa');
              }
            }
          }
        ];

      default:
        return [
          {
            title: 'Síťová komunikace',
            caption: 'Interaktivní pixel-art vizualizace síťového procesu.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 180, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 180, 520, 180, { color: PAL.emerald });
              drawPixelPC(ctx, 120, 180, 'KLIENT', '', PAL.cyan);
              drawPixelRouter(ctx, 320, 180, 'ROUTER', '', PAL.emerald, t);
              drawPixelServer(ctx, 520, 180, 'SERVER', '', PAL.amber, t);
              drawPixelPacket(ctx, lerp(145, 495, p), 160, 'DATA', PAL.cyan);
            }
          }
        ];
    }
  }

  function ensureCanvasDprSize(canvas, minLogicalW, minLogicalH, maxW) {
    var dpr = Math.min(2, Math.max(1, Number(global.devicePixelRatio) || 1));
    var cssW = canvas.clientWidth || 0;
    var targetW, targetH;

    if (cssW > 0) {
      targetW = Math.min(maxW || 1280, Math.max(minLogicalW, Math.round(cssW * dpr)));
      targetH = Math.round(targetW * (minLogicalH / minLogicalW));
    } else {
      targetW = minLogicalW;
      targetH = minLogicalH;
    }

    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;
    return { scaleX: targetW / minLogicalW, scaleY: targetH / minLogicalH };
  }

  function renderFrameOnCanvas(ctx, scaleX, scaleY, step, stepIndex, totalSteps, stepProgress, animTime, compact) {
    ctx.save();
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    drawPixelBackdrop(ctx, animTime);

    if (step && typeof step.render === 'function') {
      step.render(ctx, stepProgress, animTime);
    }

    if (compact) {
      pxRect(ctx, 0, 0, W, 24, 'rgba(6, 11, 22, 0.72)');
      pxRect(ctx, 0, 24, W, 2, PAL.panelBorder);
      ctx.fillStyle = PAL.cyan;
      ctx.font = 'bold 11px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText((step ? step.title : 'Ukázka'), 10, 12);
      pxRect(ctx, 0, H - 4, W, 4, '#070c17');
      pxRect(ctx, 0, H - 4, Math.round(W * stepProgress), 4, PAL.cyan);
    } else {
      pxRect(ctx, 0, 0, W, 32, 'rgba(6, 11, 22, 0.86)');
      pxRect(ctx, 0, 32, W, 2, PAL.panelBorder);
      ctx.fillStyle = PAL.cyan;
      ctx.font = 'bold 12px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var headerText = 'KROK ' + (stepIndex + 1) + '/' + totalSteps + ': ' + (step ? step.title : '');
      ctx.fillText(headerText, 12, 16);
      pxRect(ctx, 0, H - 6, W, 6, '#070c17');
      pxRect(ctx, 0, H - 6, Math.round(W * stepProgress), 6, PAL.cyan);
    }

    ctx.restore();
  }

  function PixelStageRenderer(canvasEl, animationType, options) {
    if (canvasEl && canvasEl.__op4StageRenderer && canvasEl.__op4StageRenderer !== this) {
      if (typeof canvasEl.__op4StageRenderer.destroy === 'function') {
        canvasEl.__op4StageRenderer.destroy();
      }
    }
    this.canvas = canvasEl;
    this.ctx = canvasEl ? canvasEl.getContext('2d') : null;
    this.opts = options || {};
    this.onStateChange = typeof this.opts.onStateChange === 'function' ? this.opts.onStateChange : null;
    this.steps = [];
    this.stepIndex = 0;
    this.isPlaying = true;
    this.stepProgress = 0;
    this.stepDurationSec = 3.4;
    this.animTime = 0;
    this.lastTs = null;
    this.rafId = null;
    this._destroyed = false;

    if (canvasEl) {
      canvasEl.__op4StageRenderer = this;
    }

    this.setAnimation(animationType || 'iso-osi');
    this._loop = this._tick.bind(this);
    if (this.ctx && this.canvas) {
      this.rafId = global.requestAnimationFrame(this._loop);
    }
  }

  PixelStageRenderer.prototype.setAnimation = function (animationType) {
    this.animationType = animationType || 'iso-osi';
    this.steps = buildAnimationSteps(this.animationType);
    this.stepIndex = 0;
    this.stepProgress = 0;
    this._emitState();
    this._draw();
  };

  PixelStageRenderer.prototype.play = function () {
    this.isPlaying = true;
    this._emitState();
  };

  PixelStageRenderer.prototype.pause = function () {
    this.isPlaying = false;
    this._emitState();
  };

  PixelStageRenderer.prototype.togglePlay = function () {
    this.isPlaying = !this.isPlaying;
    this._emitState();
    return this.isPlaying;
  };

  PixelStageRenderer.prototype.nextStep = function () {
    if (!this.steps.length) return;
    this.stepIndex = (this.stepIndex + 1) % this.steps.length;
    this.stepProgress = 0.08;
    this._emitState();
    this._draw();
  };

  PixelStageRenderer.prototype.prevStep = function () {
    if (!this.steps.length) return;
    this.stepIndex = (this.stepIndex - 1 + this.steps.length) % this.steps.length;
    this.stepProgress = 0.08;
    this._emitState();
    this._draw();
  };

  PixelStageRenderer.prototype.goToStep = function (index) {
    if (!this.steps.length) return;
    this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, Math.trunc(Number(index) || 0)));
    this.stepProgress = 0.08;
    this._emitState();
    this._draw();
  };

  PixelStageRenderer.prototype.setStep = PixelStageRenderer.prototype.goToStep;

  PixelStageRenderer.prototype.reset = function () {
    this.stepIndex = 0;
    this.stepProgress = 0;
    this.isPlaying = true;
    this._emitState();
    this._draw();
  };

  PixelStageRenderer.prototype.getState = function () {
    var cur = this.steps[this.stepIndex] || { title: '', caption: '' };
    return {
      stepIndex: this.stepIndex,
      totalSteps: this.steps.length,
      isPlaying: this.isPlaying,
      stepTitle: cur.title,
      stepCaption: cur.caption,
      steps: this.steps
    };
  };

  PixelStageRenderer.prototype._emitState = function () {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  };

  PixelStageRenderer.prototype._tick = function (ts) {
    if (this._destroyed) return;
    if (typeof document !== 'undefined' && document.hidden) {
      this.lastTs = ts;
      this.rafId = global.requestAnimationFrame(this._loop);
      return;
    }
    if (this.lastTs == null) this.lastTs = ts;
    var dt = Math.min(0.1, Math.max(0, (ts - this.lastTs) / 1000));
    this.lastTs = ts;
    this.animTime += dt;

    if (this.isPlaying && this.steps.length > 0) {
      this.stepProgress += dt / this.stepDurationSec;
      if (this.stepProgress >= 1) {
        this.stepProgress = 0;
        this.stepIndex = (this.stepIndex + 1) % this.steps.length;
        this._emitState();
      }
    }

    this._draw();
    if (!this._destroyed) {
      this.rafId = global.requestAnimationFrame(this._loop);
    }
  };

  PixelStageRenderer.prototype._draw = function () {
    if (!this.ctx || !this.canvas) return;
    var dims = ensureCanvasDprSize(this.canvas, W, H, 1280);
    var step = this.steps[this.stepIndex];
    renderFrameOnCanvas(
      this.ctx,
      dims.scaleX,
      dims.scaleY,
      step,
      this.stepIndex,
      this.steps.length,
      this.stepProgress,
      this.animTime,
      false
    );
  };

  PixelStageRenderer.prototype.destroy = function () {
    this._destroyed = true;
    if (this.rafId != null) {
      global.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.canvas && this.canvas.__op4StageRenderer === this) {
      this.canvas.__op4StageRenderer = null;
    }
  };

  PixelStageRenderer.create = function (canvasEl, animationType, options) {
    return new PixelStageRenderer(canvasEl, animationType, options);
  };

  PixelStageRenderer.render = PixelStageRenderer.create;

  PixelStageRenderer.renderPreviewFrame = function (canvas, animationType, frameProgress, opts) {
    if (!canvas || typeof canvas.getContext !== 'function') return false;
    var ctx = canvas.getContext('2d');
    if (!ctx) return false;

    var o = opts || {};
    var steps = buildAnimationSteps(animationType || 'iso-osi');
    if (!steps.length) return false;

    var raw = (frameProgress === undefined || frameProgress === null || !isFinite(Number(frameProgress)))
      ? 0.45
      : Math.max(0, Number(frameProgress));

    var stepIndex = 0;
    var stepProgress = raw;
    if (typeof o.stepIndex === 'number') {
      stepIndex = ((Math.floor(o.stepIndex) % steps.length) + steps.length) % steps.length;
      stepProgress = raw > 1 ? (raw % 1) : Math.max(0, Math.min(1, raw));
    } else if (raw > 1) {
      stepIndex = Math.floor(raw) % steps.length;
      stepProgress = raw % 1;
    } else {
      stepIndex = 0;
      stepProgress = Math.max(0, Math.min(1, raw));
    }

    var animTime = 1.2 + raw * 3.4;
    var dims = ensureCanvasDprSize(canvas, W, H, 960);
    renderFrameOnCanvas(
      ctx,
      dims.scaleX,
      dims.scaleY,
      steps[stepIndex],
      stepIndex,
      steps.length,
      stepProgress,
      animTime,
      o.compact !== false
    );
    return true;
  };

  global.PixelStageRenderer = PixelStageRenderer;

  /* ------------------------------------------------------------------------
     3. InteractiveLabs: 18 interaktivních síťových mini-labů
     ------------------------------------------------------------------------ */
  function cIcon(name, size) {
    if (global.CarbonIcons && typeof global.CarbonIcons.render === 'function') {
      return global.CarbonIcons.render(name, { size: size || 16 });
    }
    return '';
  }

  function mount(containerEl, topicOrLabType, options) {
    if (!containerEl || !topicOrLabType) return;
    var mountToken = (containerEl.__op4LabToken = (containerEl.__op4LabToken || 0) + 1);
    if (
      typeof document !== 'undefined' &&
      document.activeElement &&
      typeof containerEl.contains === 'function' &&
      containerEl.contains(document.activeElement) &&
      typeof document.activeElement.blur === 'function'
    ) {
      document.activeElement.blur();
    }
    var isStr = typeof topicOrLabType === 'string';
    var labType = isStr ? topicOrLabType : (topicOrLabType.labType || 'osi-inspector');
    var topicObj = isStr ? { labType: labType } : topicOrLabType;
    var fn = LAB_HANDLERS[labType];
    if (!fn) {
      containerEl.innerHTML = '<div class="callout">Interaktivní trenažér pro <code>' + escapeHtml(labType) + '</code> je připraven.</div>';
      return;
    }
    fn(containerEl, topicObj, options || {}, mountToken);
  }

  var LAB_HANDLERS = {
    /* 1. switching-sim */
    'switching-sim': function (el) {
      var mode = 'packet';
      var r2Down = false;
      var packetSent = false;

      function render() {
        var isBroken = r2Down && mode === 'circuit';
        var rerouted = r2Down && mode === 'packet';
        var statusText = isBroken
          ? 'CHYBA: Vyhrazený okruh přes R2 spadl! Hovor je přerušen a kapacita ostatních cest není dostupná.'
          : (rerouted
            ? 'OK: Výpadek uzlu R2 detekován! Pakety se automaticky přesměrovaly záložní cestou R1 → R3 → R4.'
            : (mode === 'circuit'
              ? 'Režim OKRUHY: Cesta A → R1 → R2 → R4 → B je 100% vyhrazena pro jedno spojení.'
              : 'Režim PAKETY: Data rozdělena do paketů putují paralelně přes síť směrovačů.'));

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong>Simulátor přepojování okruhů vs. paketů</strong>' +
              '<span class="badge ' + (isBroken ? 'badge-rose' : 'badge-emerald') + '">' +
                (isBroken ? 'Spojení přerušeno' : (rerouted ? 'Přesměrováno přes R3' : 'Přenos aktivní')) +
              '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (mode === 'circuit' ? 'btn-primary' : '') + '" data-mode="circuit">Přepojování okruhů</button>' +
              '<button type="button" class="btn btn-sm ' + (mode === 'packet' ? 'btn-primary' : '') + '" data-mode="packet">Přepojování paketů</button>' +
              '<button type="button" class="btn btn-sm ' + (r2Down ? 'btn-emerald' : 'btn-rose') + '" data-action="toggle-r2">' +
                (r2Down ? 'Obnovit uzel R2' : 'Simulovat výpadek uzlu R2') +
              '</button>' +
              '<button type="button" class="btn btn-sm" data-action="send">Odeslat dávku dat</button>' +
            '</div>' +
            '<div class="lab-stage">' +
              '<svg class="lab-svg" viewBox="0 0 560 200" aria-label="Schéma přepojování">' +
                '<line x1="60" y1="100" x2="170" y2="100" stroke="' + (isBroken ? '#f43f5e' : '#38bdf8') + '" stroke-width="4" />' +
                '<line x1="170" y1="100" x2="280" y2="48" stroke="' + (r2Down ? '#f43f5e' : '#10b981') + '" stroke-width="4" stroke-dasharray="' + (r2Down ? '6 5' : 'none') + '" />' +
                '<line x1="280" y1="48" x2="390" y2="100" stroke="' + (r2Down ? '#f43f5e' : '#10b981') + '" stroke-width="4" stroke-dasharray="' + (r2Down ? '6 5' : 'none') + '" />' +
                '<line x1="170" y1="100" x2="280" y2="152" stroke="' + (rerouted ? '#10b981' : '#334a73') + '" stroke-width="' + (rerouted ? '4' : '2') + '" stroke-dasharray="' + (mode === 'circuit' ? '5 5' : 'none') + '" />' +
                '<line x1="280" y1="152" x2="390" y2="100" stroke="' + (rerouted ? '#10b981' : '#334a73') + '" stroke-width="' + (rerouted ? '4' : '2') + '" stroke-dasharray="' + (mode === 'circuit' ? '5 5' : 'none') + '" />' +
                '<line x1="390" y1="100" x2="500" y2="100" stroke="' + (isBroken ? '#f43f5e' : '#38bdf8') + '" stroke-width="4" />' +
                '<circle cx="60" cy="100" r="22" fill="#121c30" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="60" y="104" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">Uzel A</text>' +
                '<circle cx="170" cy="100" r="20" fill="#121c30" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="170" y="104" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">R1</text>' +
                '<circle cx="280" cy="48" r="20" fill="' + (r2Down ? '#450a18' : '#121c30') + '" stroke="' + (r2Down ? '#f43f5e' : '#10b981') + '" stroke-width="2" />' +
                '<text x="280" y="52" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">' + (r2Down ? 'R2 KO' : 'R2') + '</text>' +
                '<circle cx="280" cy="152" r="20" fill="#121c30" stroke="' + (rerouted ? '#10b981' : '#64748b') + '" stroke-width="2" />' +
                '<text x="280" y="156" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">R3</text>' +
                '<circle cx="390" cy="100" r="20" fill="#121c30" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="390" y="104" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">R4</text>' +
                '<circle cx="500" cy="100" r="22" fill="#121c30" stroke="' + (isBroken ? '#f43f5e' : '#10b981') + '" stroke-width="2" />' +
                '<text x="500" y="104" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">Uzel B</text>' +
              '</svg>' +
            '</div>' +
            '<div class="callout ' + (isBroken ? 'callout-warn' : 'callout-tip') + '">' +
              '<strong>Výsledek simulace:</strong> ' + escapeHtml(statusText) +
              (packetSent ? '<br><span class="muted">Poslední dávka: ' + (isBroken ? '0/3 paketů doručeno (výpadek linky).' : '3/3 bloků úspěšně doručeno.') + '</span>' : '') +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-mode]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            mode = btn.getAttribute('data-mode');
            render();
          });
        });
        el.querySelector('[data-action="toggle-r2"]').addEventListener('click', function () {
          r2Down = !r2Down;
          render();
        });
        el.querySelector('[data-action="send"]').addEventListener('click', function () {
          packetSent = true;
          render();
        });
      }
      render();
    },

    /* 2. topology-explorer */
    'topology-explorer': function (el) {
      var topo = 'star';
      var fault = false;

      var INFO = {
        bus: {
          name: 'Sběrnice (BUS)',
          cables: '1 páteřní kabel + terminátory',
          okText: 'Všech 5 stanic sdílí jeden koaxiální kabel.',
          faultText: 'KRITICKÉ: Přerušený kabel bez terminace způsobí odrazy signálu a pád CELÉ sítě!'
        },
        ring: {
          name: 'Kruh (RING)',
          cables: '5 kabelů (uzavřený kruh)',
          okText: 'Data kolují po kruhu od uzlu k uzlu (Token).',
          faultText: 'KRITICKÉ: Přerušený jednosměrný kruh zastaví přenos pro celou síť (pokud není duální kruh).'
        },
        star: {
          name: 'Hvězda (STAR)',
          cables: '4 kabely do centrálního switche',
          okText: 'Standard dnešních Ethernet LAN – switch izoluje kolize.',
          faultText: 'ČÁSTEČNÉ: Přerušení kabelu ke stanici PC-2 odpojí jen PC-2. Ostatní stanice pracují dál!'
        },
        mesh: {
          name: 'Plná síť (MESH)',
          cables: '6 přímých spojů (N·(N-1)/2)',
          okText: 'Každý uzel je propojen s každým – maximální redundance.',
          faultText: 'ODOLNÉ: Přerušení jednoho kabelu nic nezastaví – provoz okamžitě přejde přes zbylé spoje.'
        }
      };

      function drawSvg() {
        var strokeOk = '#38bdf8';
        var strokeBad = '#f43f5e';
        if (topo === 'bus') {
          return '<svg class="lab-svg" viewBox="0 0 500 160">' +
            '<line x1="40" y1="110" x2="260" y2="110" stroke="' + (fault ? strokeBad : '#f59e0b') + '" stroke-width="5" />' +
            '<line x1="280" y1="110" x2="460" y2="110" stroke="' + (fault ? strokeBad : '#f59e0b') + '" stroke-width="5" />' +
            (fault ? '<line x1="264" y1="104" x2="276" y2="116" stroke="#f43f5e" stroke-width="3" /><line x1="276" y1="104" x2="264" y2="116" stroke="#f43f5e" stroke-width="3" />' : '<line x1="255" y1="110" x2="285" y2="110" stroke="#f59e0b" stroke-width="5" />') +
            [95, 195, 315, 415].map(function (x, i) {
              return '<line x1="' + x + '" y1="55" x2="' + x + '" y2="110" stroke="' + (fault ? strokeBad : strokeOk) + '" stroke-width="2" />' +
                '<rect x="' + (x - 24) + '" y="22" width="48" height="32" rx="6" fill="#121c30" stroke="' + (fault ? strokeBad : strokeOk) + '" stroke-width="2" />' +
                '<text x="' + x + '" y="42" text-anchor="middle" fill="#f1f5f9" font-size="11">PC-' + (i + 1) + '</text>';
            }).join('') +
            '</svg>';
        }
        if (topo === 'ring') {
          var pts = [[250, 26], [380, 82], [250, 138], [120, 82]];
          var lines = pts.map(function (pt, idx) {
            var nxt = pts[(idx + 1) % 4];
            var brk = fault && idx === 0;
            return '<line x1="' + pt[0] + '" y1="' + pt[1] + '" x2="' + nxt[0] + '" y2="' + nxt[1] + '" stroke="' + (brk ? strokeBad : '#a78bfa') + '" stroke-width="3" stroke-dasharray="' + (brk ? '6 5' : 'none') + '" />';
          }).join('');
          var nodes = pts.map(function (pt, idx) {
            return '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="20" fill="#121c30" stroke="' + (fault ? strokeBad : '#a78bfa') + '" stroke-width="2" />' +
              '<text x="' + pt[0] + '" y="' + (pt[1] + 4) + '" text-anchor="middle" fill="#f1f5f9" font-size="11">PC-' + (idx + 1) + '</text>';
          }).join('');
          return '<svg class="lab-svg" viewBox="0 0 500 165">' + lines + nodes + '</svg>';
        }
        if (topo === 'star') {
          var pcs = [[100, 34], [400, 34], [100, 132], [400, 132]];
          var slines = pcs.map(function (pt, idx) {
            var brk = fault && idx === 1;
            return '<line x1="250" y1="83" x2="' + pt[0] + '" y2="' + pt[1] + '" stroke="' + (brk ? strokeBad : '#10b981') + '" stroke-width="3" stroke-dasharray="' + (brk ? '6 5' : 'none') + '" />';
          }).join('');
          var snodes = pcs.map(function (pt, idx) {
            var brk = fault && idx === 1;
            return '<rect x="' + (pt[0] - 26) + '" y="' + (pt[1] - 16) + '" width="52" height="32" rx="6" fill="#121c30" stroke="' + (brk ? strokeBad : strokeOk) + '" stroke-width="2" />' +
              '<text x="' + pt[0] + '" y="' + (pt[1] + 4) + '" text-anchor="middle" fill="#f1f5f9" font-size="11">' + (brk ? 'PC-2 KO' : 'PC-' + (idx + 1)) + '</text>';
          }).join('');
          return '<svg class="lab-svg" viewBox="0 0 500 165">' + slines +
            '<rect x="205" y="65" width="90" height="36" rx="6" fill="#0f2847" stroke="#10b981" stroke-width="2" />' +
            '<text x="250" y="87" text-anchor="middle" fill="#10b981" font-size="12" font-weight="bold">SWITCH</text>' +
            snodes + '</svg>';
        }
        var mpts = [[140, 34], [360, 34], [140, 132], [360, 132]];
        var mlines = '';
        for (var i = 0; i < 4; i++) {
          for (var j = i + 1; j < 4; j++) {
            var brk = fault && i === 0 && j === 1;
            mlines += '<line x1="' + mpts[i][0] + '" y1="' + mpts[i][1] + '" x2="' + mpts[j][0] + '" y2="' + mpts[j][1] + '" stroke="' + (brk ? strokeBad : '#10b981') + '" stroke-width="3" stroke-dasharray="' + (brk ? '6 5' : 'none') + '" />';
          }
        }
        var mnodes = mpts.map(function (pt, idx) {
          return '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="20" fill="#121c30" stroke="#10b981" stroke-width="2" />' +
            '<text x="' + pt[0] + '" y="' + (pt[1] + 4) + '" text-anchor="middle" fill="#f1f5f9" font-size="11">R' + (idx + 1) + '</text>';
        }).join('');
        return '<svg class="lab-svg" viewBox="0 0 500 165">' + mlines + mnodes + '</svg>';
      }

      function render() {
        var d = INFO[topo];
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Průzkumník síťových topologií</strong><span class="badge badge-cyan">' + escapeHtml(d.cables) + '</span></div>' +
            '<div class="lab-controls">' +
              ['bus', 'ring', 'star', 'mesh'].map(function (k) {
                return '<button type="button" class="btn btn-sm ' + (topo === k ? 'btn-primary' : '') + '" data-topo="' + k + '">' + INFO[k].name + '</button>';
              }).join('') +
              '<button type="button" class="btn btn-sm ' + (fault ? 'btn-emerald' : 'btn-rose') + '" data-action="fault">' +
                (fault ? 'Opravit přerušený kabel' : 'Přerušit kabel / uzel') +
              '</button>' +
            '</div>' +
            '<div class="lab-stage">' + drawSvg() + '</div>' +
            '<div class="callout ' + (fault && (topo === 'bus' || topo === 'ring') ? 'callout-warn' : 'callout-tip') + '">' +
              '<strong>' + escapeHtml(d.name) + ':</strong> ' + escapeHtml(fault ? d.faultText : d.okText) +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-topo]').forEach(function (b) {
          b.addEventListener('click', function () {
            topo = b.getAttribute('data-topo');
            render();
          });
        });
        el.querySelector('[data-action="fault"]').addEventListener('click', function () {
          fault = !fault;
          render();
        });
      }
      render();
    },

    /* 3. hosting-chooser */
    'hosting-chooser': function (el) {
      var scenario = 'blog';
      var SCENARIOS = {
        blog: {
          title: 'Osobní blog / firemní prezentace',
          winner: 'Shared Hosting (Sdílený webhosting)',
          why: 'Nízká cena (~50 Kč/měs.), o aktualizace PHP/Apache se stará poskytovatel, nepotřebujete root přístup.',
          rows: [
            ['Shared Hosting', 'Výborný (nejlevnější)', 'Bez starostí o OS', 'Doporučeno'],
            ['VPS (Virtuální server)', 'Zbytečně složitý', 'Nutná správa Linuxu', 'Možné'],
            ['Dedikovaný server', 'Předimenzované', 'Vysoká cena', 'Nevhodné'],
            ['P2P LAN', 'Není dostupné 24/7 z internetu', 'Chybí veřejná dostupnost', 'Nevhodné']
          ]
        },
        eshop: {
          title: 'E-shop s vlastním Dockerem a Redisem',
          winner: 'VPS (Virtual Private Server)',
          why: 'Získáte root/SSH přístup, vlastní kontejnery Docker a garantovanou RAM/CPU za rozumnou cenu.',
          rows: [
            ['Shared Hosting', 'Nelze spustit Docker/Redis', 'Bez root přístupu', 'Nevhodné'],
            ['VPS (Virtuální server)', 'Plný root, vlastní služby', 'Skvělý poměr cena/výkon', 'Doporučeno'],
            ['Dedikovaný server', 'Drahý pro start e-shopu', 'Fyzický HW jen pro vás', 'Do budoucna'],
            ['Cloud (Auto-scale)', 'Vyšší cena za provoz', 'Skvělé při špičkách', 'Alternativa']
          ]
        },
        stream: {
          title: 'Globální video stream / nárazová špička',
          winner: 'Cloud + CDN (Auto-scaling)',
          why: 'Cloud dynamicky přidá výkon při tisících diváků současně a CDN doručí obsah z nejbližší lokality.',
          rows: [
            ['Shared Hosting', 'Okamžitý pád při zátěži', 'Limity přenosů', 'Nevhodné'],
            ['VPS', 'Limitováno jedním uzlem', 'Ruční navýšení výkonu', 'Omezené'],
            ['Cloud (AWS / Azure / GCP)', 'Automatické škálování + CDN', 'Platba dle spotřeby', 'Doporučeno'],
            ['P2P', 'Závislé na uploadu klientů', 'Nestabilní pro centrální obsah', 'Částečné']
          ]
        },
        lan: {
          title: 'Lokální sdílení velkých souborů v kanceláři / LAN',
          winner: 'P2P / Lokální LAN (SMB / Syncthing)',
          why: 'Využije plnou 1 Gbps rychlost místní LAN bez nutnosti nahrávat gigabajty do internetu.',
          rows: [
            ['P2P / LAN sdílení', '1 Gbps napřímo v místní LAN', 'Žádný veřejný hosting není třeba', 'Doporučeno'],
            ['Cloud úložiště', 'Brzděno uploadem do internetu', 'Závislé na konektivitě WAN', 'Pomalejší'],
            ['Shared Hosting', 'Malá kvóta a nízká rychlost', 'Nepraktické pro GB soubory', 'Nevhodné']
          ]
        }
      };

      function render() {
        var s = SCENARIOS[scenario];
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Porovnávač architektury a hostingu</strong><span class="badge badge-emerald">Doporučeno: ' + escapeHtml(s.winner) + '</span></div>' +
            '<div class="lab-controls">' +
              Object.keys(SCENARIOS).map(function (k) {
                return '<button type="button" class="btn btn-sm ' + (scenario === k ? 'btn-primary' : '') + '" data-sc="' + k + '">' + escapeHtml(SCENARIOS[k].title) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="callout callout-tip"><strong>Proč zvolit ' + escapeHtml(s.winner) + '?</strong><br>' + escapeHtml(s.why) + '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>Řešení</th><th>Výhoda / Limit</th><th>Provoz & správa</th><th>Verdikt</th></tr></thead><tbody>' +
              s.rows.map(function (r) {
                var win = r[3] === 'Doporučeno';
                return '<tr class="' + (win ? 'lab-row-highlight-win' : '') + '">' +
                  r.map(function (cell, idx) {
                    if (idx === 3 && win) {
                      return '<td><span class="inline-icon-label">' + cIcon('checkmark--outline', 14) + ' ' + escapeHtml(cell) + '</span></td>';
                    }
                    return '<td>' + escapeHtml(cell) + '</td>';
                  }).join('') +
                  '</tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>';

        el.querySelectorAll('[data-sc]').forEach(function (b) {
          b.addEventListener('click', function () {
            scenario = b.getAttribute('data-sc');
            render();
          });
        });
      }
      render();
    },

    /* 4. osi-inspector */
    'osi-inspector': function (el) {
      var selected = 3; // L3 default
      var model = 'osi';
      var LAYERS = [
        { num: 7, name: 'Aplikační', tcpip: 'Aplikační (TCP/IP 4)', pdu: 'Data (Zpráva)', protocols: 'HTTP/HTTPS, DNS, DHCP, SSH, SMTP', addr: 'URL / Doména', device: 'L7 Proxy / Firewall' },
        { num: 6, name: 'Prezentační', tcpip: 'Aplikační (TCP/IP 4)', pdu: 'Data (Šifrovaná)', protocols: 'TLS/SSL, JPEG, JSON, UTF-8', addr: 'Kódování & Formát', device: 'Koncový uzel' },
        { num: 5, name: 'Relační', tcpip: 'Aplikační (TCP/IP 4)', pdu: 'Data (Relace)', protocols: 'NetBIOS, RPC, Sockets', addr: 'ID relace', device: 'Koncový uzel' },
        { num: 4, name: 'Transportní', tcpip: 'Transportní (TCP/IP 3)', pdu: 'Segment (TCP) / Datagram (UDP)', protocols: 'TCP, UDP', addr: 'Porty (např. :443, :53)', device: 'L4 Firewall' },
        { num: 3, name: 'Síťová', tcpip: 'Síťová / Internet (TCP/IP 2)', pdu: 'Paket (Packet)', protocols: 'IPv4, IPv6, ICMP, OSPF', addr: 'IP adresa (192.168.2.10)', device: 'Router (Směrovač)' },
        { num: 2, name: 'Linková', tcpip: 'Síťového rozhraní (TCP/IP 1)', pdu: 'Rámec (Frame)', protocols: 'Ethernet (802.3), Wi-Fi (802.11), ARP', addr: 'MAC adresa (48 bitů)', device: 'Switch (Přepínač), NIC' },
        { num: 1, name: 'Fyzická', tcpip: 'Síťového rozhraní (TCP/IP 1)', pdu: 'Bity (0 / 1)', protocols: 'UTP Cat6, Optika, Rádio (RF)', addr: 'Napětí / Světlo / Vlna', device: 'Hub, Repeater, Kabel' }
      ];

      function render() {
        var cur = LAYERS[selected];
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong>Inspektor ISO/OSI &amp; TCP/IP vrstev</strong>' +
              '<div class="lab-controls">' +
                '<button type="button" class="btn btn-sm ' + (model === 'osi' ? 'btn-primary' : '') + '" data-m="osi">Pohled ISO/OSI (7)</button>' +
                '<button type="button" class="btn btn-sm ' + (model === 'tcpip' ? 'btn-primary' : '') + '" data-m="tcpip">Mapování TCP/IP (4)</button>' +
              '</div>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div style="display:flex;flex-direction:column;gap:6px;">' +
                LAYERS.map(function (l, idx) {
                  return '<button type="button" class="lab-osi-row ' + (idx === selected ? 'is-active' : '') + '" data-layer="' + idx + '">' +
                    '<span class="badge badge-cyan">L' + l.num + '</span>' +
                    '<strong>' + escapeHtml(l.name) + '</strong>' +
                    '<span class="muted" style="font-size:0.78rem;">' + escapeHtml(model === 'tcpip' ? l.tcpip : l.pdu.split(' ')[0]) + '</span>' +
                    '</button>';
                }).join('') +
              '</div>' +
              '<div class="stat-tile" style="background:var(--bg-subtle);">' +
                '<div class="badge badge-emerald" style="margin-bottom:8px;">Vrstva L' + cur.num + ' • ' + escapeHtml(cur.name) + '</div>' +
                '<p><strong>Ekvivalent v TCP/IP:</strong> ' + escapeHtml(cur.tcpip) + '</p>' +
                '<p><strong>Datová jednotka (PDU):</strong> <code>' + escapeHtml(cur.pdu) + '</code></p>' +
                '<p><strong>Klíčové protokoly:</strong> ' + escapeHtml(cur.protocols) + '</p>' +
                '<p><strong>Adresace:</strong> ' + escapeHtml(cur.addr) + '</p>' +
                '<p style="margin-bottom:0;"><strong>Síťový prvek:</strong> ' + escapeHtml(cur.device) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-layer]').forEach(function (b) {
          b.addEventListener('click', function () {
            selected = Number(b.getAttribute('data-layer'));
            render();
          });
        });
        el.querySelectorAll('[data-m]').forEach(function (b) {
          b.addEventListener('click', function () {
            model = b.getAttribute('data-m');
            render();
          });
        });
      }
      render();
    },

    /* 5. handshake-ports */
    'handshake-ports': function (el) {
      var proto = 'tcp';
      var packetLoss = false;
      var step = 0;
      var selectedPort = 443;
      var PORTS = [
        { port: 22, service: 'SSH', tr: 'TCP', desc: 'Šifrovaná vzdálená správa příkazové řádky (Linux, síťové prvky).' },
        { port: 53, service: 'DNS', tr: 'UDP / TCP', desc: 'Překlad doménových jmen na IP (dotazy UDP, zónové přenosy TCP).' },
        { port: 80, service: 'HTTP', tr: 'TCP', desc: 'Nešifrovaný přenos webových stránek.' },
        { port: 443, service: 'HTTPS', tr: 'TCP (TLS)', desc: 'Zabezpečený šifrovaný webový přenos (TLS certifikát).' },
        { port: 3389, service: 'RDP', tr: 'TCP / UDP', desc: 'Vzdálená plocha systému Windows (Remote Desktop).' }
      ];

      function getSteps() {
        if (proto === 'udp') {
          return [
            { msg: 'Klient posílá UDP datagram (bez handshake).', badge: 'UDP →' },
            { msg: packetLoss ? 'ZTRÁTA PAKETU! UDP o ztrátě neví a nic neposílá znovu (výpadek snímku/hlasu).' : 'Datagram dorazil s minimálním zpožděním.', badge: packetLoss ? 'ZTRACENO' : 'DORUČENO' }
          ];
        }
        if (packetLoss) {
          return [
            { msg: '1. Klient → Server: SYN (Seq=100) – žádost o spojení.', badge: 'SYN' },
            { msg: '2. ZTRÁTA PAKETU! Serverový SYN-ACK se po cestě ztratil. Klient spustí časovač…', badge: 'TIMEOUT!' },
            { msg: '3. RETRANSMISE: Server posílá SYN-ACK znovu a klient jej úspěšně přijme.', badge: 'RE-SYN-ACK' },
            { msg: '4. Klient → Server: ACK (Ack=301). Spojení ESTABLISHED bez ztráty dat!', badge: 'ESTABLISHED' }
          ];
        }
        return [
          { msg: '1. Klient → Server: SYN (Seq=100) – Chci navázat spojení.', badge: 'SYN' },
          { msg: '2. Server → Klient: SYN-ACK (Seq=300, Ack=101) – Souhlasím.', badge: 'SYN-ACK' },
          { msg: '3. Klient → Server: ACK (Ack=301) – Spojení ESTABLISHED!', badge: 'ESTABLISHED' }
        ];
      }

      function render() {
        var steps = getSteps();
        if (step >= steps.length) step = 0;
        var cur = steps[step];
        var portObj = PORTS.find(function (p) { return p.port === selectedPort; }) || PORTS[0];

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Simulátor TCP/UDP &amp; Přehled síťových portů</strong><span class="badge badge-cyan">' + escapeHtml(cur.badge) + '</span></div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (proto === 'tcp' ? 'btn-primary' : '') + '" data-p="tcp">TCP (Spolehlivý)</button>' +
              '<button type="button" class="btn btn-sm ' + (proto === 'udp' ? 'btn-primary' : '') + '" data-p="udp">UDP (Rychlý)</button>' +
              '<button type="button" class="btn btn-sm ' + (packetLoss ? 'btn-rose' : '') + '" data-act="loss">Ztráta paketu: ' + (packetLoss ? 'ZAP' : 'VYP') + '</button>' +
              '<button type="button" class="btn btn-sm btn-emerald" data-act="next">Další krok (' + (step + 1) + '/' + steps.length + ')</button>' +
            '</div>' +
            '<div class="callout callout-problem">' + escapeHtml(cur.msg) + '</div>' +
            '<div><strong>Klikni na port pro detail služby:</strong></div>' +
            '<div class="lab-controls">' +
              PORTS.map(function (p) {
                return '<button type="button" class="btn btn-sm ' + (p.port === selectedPort ? 'btn-primary' : '') + '" data-port="' + p.port + '">:' + p.port + ' ' + p.service + '</button>';
              }).join('') +
            '</div>' +
            '<div class="callout callout-tip"><strong>Port ' + portObj.port + ' (' + escapeHtml(portObj.service) + ') – ' + escapeHtml(portObj.tr) + ':</strong> ' + escapeHtml(portObj.desc) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-p]').forEach(function (b) {
          b.addEventListener('click', function () { proto = b.getAttribute('data-p'); step = 0; render(); });
        });
        el.querySelector('[data-act="loss"]').addEventListener('click', function () { packetLoss = !packetLoss; step = 0; render(); });
        el.querySelector('[data-act="next"]').addEventListener('click', function () { step = (step + 1) % steps.length; render(); });
        el.querySelectorAll('[data-port]').forEach(function (b) {
          b.addEventListener('click', function () { selectedPort = Number(b.getAttribute('data-port')); render(); });
        });
      }
      render();
    },

    /* 6. dns-resolver */
    'dns-resolver': function (el, topic, opts, mountToken) {
      var domain = 'example.cz';
      var rtype = 'A';
      var step = 0;
      var RECORDS = {
        'example.cz': { A: '193.85.10.20', AAAA: '2001:db8:10::20', MX: '10 mail.example.cz', CNAME: 'www.example.cz -> example.cz', PTR: '20.10.85.193.in-addr.arpa -> example.cz' },
        'google.com': { A: '142.251.36.78', AAAA: '2a00:1450:4014:80f::200e', MX: '10 smtp.google.com', CNAME: 'www.google.com -> google.com', PTR: '78.36.251.142.in-addr.arpa -> prg03s05.1e100.net' },
        'wikipedia.org': { A: '185.15.59.224', AAAA: '2a02:ec80:300:ed1a::1', MX: '10 mx1001.wikimedia.org', CNAME: 'www.wikipedia.org -> dyna.wikimedia.org', PTR: '224.59.15.185.in-addr.arpa -> text-lb.esams.wikimedia.org' }
      };

      function isStale() {
        return mountToken != null && el.__op4LabToken !== mountToken;
      }

      function getFlow(dom) {
        var normalized = String(dom || '').trim().replace(/\.+$/, '') || 'example.cz';
        var dotIdx = normalized.lastIndexOf('.');
        if (dotIdx <= 0 || dotIdx === normalized.length - 1) {
          return [
            '1. Klient kontroluje lokální DNS cache & soubor hosts pro „' + normalized + '“.',
            '2. Jednoúrovňový název „' + normalized + '“ neobsahuje veřejnou TLD koncovku.',
            '3. Dotaz se neposílá na veřejný Root (.) ani TLD server – řeší se lokálně (hosts / mDNS / lokální DNS).',
            '4. Lokální resolver překládá „' + normalized + '“ přímo v lokální síti (např. 127.0.0.1).',
            '5. Výsledek pro „' + normalized + '“ se uloží do lokální cache bez dotazu do internetu.'
          ];
        }
        var tld = normalized.slice(dotIdx);
        return [
          '1. Klient kontroluje lokální DNS cache & soubor hosts. Nenalezeno.',
          '2. Rekurzivní resolver (1.1.1.1 / ISP) přijímá dotaz pro ' + normalized + ' (' + rtype + ').',
          '3. Dotaz na Root server (.) → „Neznám IP, zeptej se TLD serveru pro ' + tld + '“.',
          '4. Dotaz na TLD server (' + tld + ') → „Autoritativní NS je ns1.' + normalized + '“.',
          '5. Autoritativní DNS vrací záznam ' + rtype + ' a ukládá se do cache (TTL 300s).'
        ];
      }

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>DNS Resolver &amp; Inspektor záznamů</strong><span class="badge badge-cyan" id="dns-step-badge"></span></div>' +
          '<div class="lab-controls">' +
            '<input type="text" class="input" style="max-width:220px;" id="dns-dom-input" value="' + escapeHtml(domain) + '" aria-label="Doménové jméno" />' +
            ['example.cz', 'google.com', 'wikipedia.org'].map(function (d) {
              return '<button type="button" class="btn btn-sm" data-dom="' + d + '">' + d + '</button>';
            }).join('') +
          '</div>' +
          '<div class="lab-controls">' +
            ['A', 'AAAA', 'MX', 'CNAME', 'PTR'].map(function (rt) {
              return '<button type="button" class="btn btn-sm" data-rt="' + rt + '">' + rt + '</button>';
            }).join('') +
            '<button type="button" class="btn btn-sm btn-primary" data-act="step">Další krok dotazu</button>' +
            '<button type="button" class="btn btn-sm" data-act="finish">Dokončit ihned</button>' +
          '</div>' +
          '<div id="dns-out"></div>' +
        '</div>';

      var domInp = el.querySelector('#dns-dom-input');
      var badgeEl = el.querySelector('#dns-step-badge');
      var outEl = el.querySelector('#dns-out');
      var domBtns = el.querySelectorAll('[data-dom]');
      var rtBtns = el.querySelectorAll('[data-rt]');

      function renderOutput() {
        if (isStale()) return;
        var cleanDom = domain.trim().toLowerCase().replace(/\.+$/, '') || 'example.cz';
        var rec = RECORDS[cleanDom] || {
          A: '93.184.216.34',
          AAAA: '2606:2800:220:1:248:1893:25c8:1946',
          MX: '10 mail.' + cleanDom,
          CNAME: 'www.' + cleanDom + ' -> ' + cleanDom,
          PTR: '34.216.184.93.in-addr.arpa -> ' + cleanDom
        };
        var flow = getFlow(cleanDom);

        badgeEl.textContent = 'Krok ' + (step + 1) + '/' + flow.length;
        domBtns.forEach(function (b) {
          b.classList.toggle('btn-primary', b.getAttribute('data-dom') === cleanDom);
        });
        rtBtns.forEach(function (b) {
          b.classList.toggle('btn-emerald', b.getAttribute('data-rt') === rtype);
        });

        outEl.innerHTML =
          '<ol class="steps-clean">' +
            flow.map(function (txt, idx) {
              var active = idx <= step;
              return '<li class="stat-tile" style="opacity:' + (active ? '1' : '0.45') + ';border-color:' + (idx === step ? 'var(--accent-cyan)' : 'var(--border-subtle)') + ';">' +
                '<span class="step-num">' + (idx + 1) + '.</span><span>' + escapeHtml(txt) + '</span></li>';
            }).join('') +
          '</ol>' +
          (step === flow.length - 1
            ? '<div class="terminal-block"><div class="terminal-head"><span>DNS ANSWER SECTION (' + escapeHtml(rtype) + ')</span></div><pre class="terminal-pre">;; QUESTION: ' + escapeHtml(cleanDom) + '. IN ' + escapeHtml(rtype) + '\n;; ANSWER:\n' + escapeHtml(cleanDom) + '.   300   IN   ' + escapeHtml(rtype) + '   ' + escapeHtml(rec[rtype]) + '</pre></div>'
            : '<div class="callout">Klikni na <strong>Další krok dotazu</strong> pro postup hierarchií DNS až po finální odpověď.</div>');
      }

      domInp.addEventListener('input', function () {
        if (isStale()) return;
        domain = domInp.value;
        step = 0;
        renderOutput();
      });
      domInp.addEventListener('change', function () {
        if (isStale()) return;
        if (domain !== domInp.value) {
          domain = domInp.value;
          step = 0;
          renderOutput();
        }
      });
      domBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          if (isStale()) return;
          domain = b.getAttribute('data-dom');
          domInp.value = domain;
          step = 0;
          renderOutput();
        });
      });
      rtBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          if (isStale()) return;
          rtype = b.getAttribute('data-rt');
          renderOutput();
        });
      });
      el.querySelector('[data-act="step"]').addEventListener('click', function () {
        if (isStale()) return;
        var flowLen = getFlow(domain.trim().toLowerCase() || 'example.cz').length;
        step = (step + 1) % flowLen;
        renderOutput();
      });
      el.querySelector('[data-act="finish"]').addEventListener('click', function () {
        if (isStale()) return;
        var flowLen = getFlow(domain.trim().toLowerCase() || 'example.cz').length;
        step = flowLen - 1;
        renderOutput();
      });

      renderOutput();
    },

    /* 7. arp-walkthrough */
    'arp-walkthrough': function (el) {
      var stage = 'arp';
      var STAGES = {
        arp: {
          title: '1. ARP dotaz v lokální síti (Před odesláním paketu)',
          srcIp: '192.168.1.10', dstIp: '192.168.1.1 (Brána)',
          srcMac: 'AA:AA:AA:11:11:11', dstMac: 'FF:FF:FF:FF:FF:FF (Broadcast)',
          note: 'PC-A nezná MAC adresu své výchozí brány 192.168.1.1, proto vyšle ARP broadcast do celé LAN.'
        },
        hop1: {
          title: '2. Úsek před routerem (LAN A: PC-A → Router R1)',
          srcIp: '192.168.1.10', dstIp: '192.168.2.10',
          srcMac: 'AA:AA:AA:11:11:11 (PC-A)', dstMac: 'R1:R1:11:11:11:11 (LAN port R1)',
          note: 'Cílová IP už je konečný cíl 192.168.2.10, ale cílová MAC je adresa routeru R1 – protože jinam v LAN paket nedosáhne!'
        },
        hop2: {
          title: '3. Úsek za routerem (LAN B: Router R1 → PC-B)',
          srcIp: '192.168.1.10', dstIp: '192.168.2.10',
          srcMac: 'R1:R1:22:22:22:22 (Port R1 do LAN B)', dstMac: 'BB:BB:BB:22:22:22 (PC-B)',
          note: 'ZLATÉ PRAVIDLO: Zdrojová a cílová IP zůstaly stejné celou cestu! Router pouze přepsal L2 MAC adresy pro další skok.'
        }
      };

      function render() {
        var s = STAGES[stage];
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Průchod paketu 192.168.1.10 → 192.168.2.10 přes router</strong></div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (stage === 'arp' ? 'btn-primary' : '') + '" data-st="arp">1. ARP dotaz v LAN</button>' +
              '<button type="button" class="btn btn-sm ' + (stage === 'hop1' ? 'btn-primary' : '') + '" data-st="hop1">2. Úsek před routerem</button>' +
              '<button type="button" class="btn btn-sm ' + (stage === 'hop2' ? 'btn-primary' : '') + '" data-st="hop2">3. Úsek za routerem</button>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">L2 Hlavička (Mění se na každém skoku)</div>' +
                '<div><strong>SRC MAC:</strong> <code>' + escapeHtml(s.srcMac) + '</code></div>' +
                '<div><strong>DST MAC:</strong> <code style="color:var(--accent-amber);">' + escapeHtml(s.dstMac) + '</code></div>' +
              '</div>' +
              '<div class="stat-tile"><div class="stat-tile-label">L3 IP Hlavička (End-to-End neměnná)</div>' +
                '<div><strong>SRC IP:</strong> <code>' + escapeHtml(s.srcIp) + '</code></div>' +
                '<div><strong>DST IP:</strong> <code style="color:var(--accent-emerald);">' + escapeHtml(s.dstIp) + '</code></div>' +
              '</div>' +
            '</div>' +
            '<div class="callout callout-tip"><strong>' + escapeHtml(s.title) + ':</strong> ' + escapeHtml(s.note) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-st]').forEach(function (b) {
          b.addEventListener('click', function () { stage = b.getAttribute('data-st'); render(); });
        });
      }
      render();
    },

    /* 8. ip-classifier */
    'ip-classifier': function (el, topic, opts, mountToken) {
      var ipVal = '192.168.1.10';
      var PRESETS = ['192.168.1.10', '10.0.5.42', '172.16.12.1', '127.0.0.1', '169.254.44.8', '203.0.113.5', '8.8.8.8', '224.0.0.1'];

      function isStale() {
        return mountToken != null && el.__op4LabToken !== mountToken;
      }

      function renderResult(outEl, val) {
        if (isStale()) return;
        var res = classifyIp(val);
        if (!res) {
          outEl.innerHTML = '<div class="callout callout-warn">Neplatná IPv4 adresa. Zadej 4 oktety v rozsahu 0–255 (např. <code>192.168.1.10</code>).</div>';
          return;
        }
        outEl.innerHTML =
          '<div class="lab-grid-2" style="margin-bottom:12px;">' +
            '<div class="stat-tile"><div class="stat-tile-label">Typ rozsahu</div><div class="stat-tile-val"><span class="badge badge-' + res.badgeTone + '">' + escapeHtml(res.scope) + '</span></div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Třída IPv4</div><div class="stat-tile-val">' + escapeHtml(res.ipClass) + '</div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Směrování v Internetu</div><div class="stat-tile-val">' + (res.routable ? 'ANO (Veřejná)' : 'NE (Lokální / NAT)') + '</div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Výchozí maska třídy</div><div class="stat-tile-val">' + escapeHtml(res.defaultMask) + '</div></div>' +
          '</div>' +
          '<div class="stat-tile" style="margin-bottom:10px;"><div class="stat-tile-label">Binární zápis 32 bitů</div><div class="stat-tile-val">' + res.binaryOctets.join(' . ') + '</div></div>' +
          '<div class="callout callout-problem">' + escapeHtml(res.note) + '</div>';
      }

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>Klasifikátor IPv4 adres (RFC 1918 &amp; speciální rozsahy)</strong></div>' +
          '<div class="lab-controls">' +
            '<input type="text" class="input" id="lab-ip-input" style="max-width:220px;" value="' + escapeHtml(ipVal) + '" aria-label="IPv4 adresa" />' +
            PRESETS.map(function (p) {
              return '<button type="button" class="btn btn-sm" data-ip="' + p + '">' + p + '</button>';
            }).join('') +
          '</div>' +
          '<div id="lab-ip-out"></div>' +
        '</div>';

      var inp = el.querySelector('#lab-ip-input');
      var out = el.querySelector('#lab-ip-out');
      renderResult(out, ipVal);
      inp.addEventListener('input', function () { renderResult(out, inp.value); });
      el.querySelectorAll('[data-ip]').forEach(function (b) {
        b.addEventListener('click', function () {
          inp.value = b.getAttribute('data-ip');
          renderResult(out, inp.value);
        });
      });
    },

    /* 9. subnet-calc */
    'subnet-calc': function (el, topic, opts, mountToken) {
      var baseIp = '192.168.10.0';
      var prefix = 26;

      function isStale() {
        return mountToken != null && el.__op4LabToken !== mountToken;
      }

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>Kompaktní CIDR podsíťovač (/24 – /30)</strong><span class="badge badge-cyan" id="lab-sub-badge"></span></div>' +
          '<div class="lab-grid-2">' +
            '<div><label class="field-label" for="lab-sub-ip">Adresa sítě</label><input id="lab-sub-ip" class="input" value="' + escapeHtml(baseIp) + '" /></div>' +
            '<div><label class="field-label" for="lab-sub-cidr" id="lab-sub-cidr-label">Prefix CIDR: /' + prefix + '</label><input id="lab-sub-cidr" type="range" class="cidr-slider" min="24" max="30" value="' + prefix + '" /></div>' +
          '</div>' +
          '<div class="lab-controls">' +
            [24, 25, 26, 27, 28, 30].map(function (p) {
              return '<button type="button" class="btn btn-sm" data-p="' + p + '">/' + p + '</button>';
            }).join('') +
          '</div>' +
          '<div id="lab-sub-out"></div>' +
        '</div>';

      var badgeEl = el.querySelector('#lab-sub-badge');
      var ipInp = el.querySelector('#lab-sub-ip');
      var cidrLabel = el.querySelector('#lab-sub-cidr-label');
      var cidrInp = el.querySelector('#lab-sub-cidr');
      var prefixBtns = el.querySelectorAll('[data-p]');
      var outEl = el.querySelector('#lab-sub-out');

      function renderOutput() {
        if (isStale()) return;
        var rawIp = ipInp.value.trim();
        var validOct = parseIp(rawIp);
        if (validOct) {
          baseIp = rawIp;
        }
        cidrLabel.textContent = 'Prefix CIDR: /' + prefix;
        cidrInp.value = String(prefix);
        prefixBtns.forEach(function (b) {
          b.classList.toggle('btn-primary', Number(b.getAttribute('data-p')) === prefix);
        });
        if (!validOct) {
          badgeEl.textContent = '/' + prefix + ' (Neplatná IP)';
          outEl.innerHTML =
            '<div class="callout callout-warn"><strong>Neplatná IPv4 adresa:</strong> Zadej čtyři oktety v rozsahu <code>0–255</code> oddělené tečkou (např. <code>192.168.10.0</code>).</div>';
          return;
        }

        var calc = calculateSubnet(baseIp, prefix);
        var hostCount = calc.usableHosts;
        var blockSize = Math.pow(2, 32 - prefix);
        var baseOct = validOct;
        var numSubnets = Math.min(16, Math.pow(2, Math.max(0, prefix - 24)));
        var subnetRows = [];
        if (prefix >= 24 && prefix <= 30) {
          for (var i = 0; i < numSubnets; i++) {
            var start = i * blockSize;
            var end = start + blockSize - 1;
            var netPrefix = baseOct[0] + '.' + baseOct[1] + '.' + baseOct[2] + '.';
            subnetRows.push({
              idx: i + 1,
              net: netPrefix + start + '/' + prefix,
              range: netPrefix + (start + 1) + ' – ' + netPrefix + (end - 1),
              bcast: netPrefix + end
            });
          }
        }

        badgeEl.textContent = '/' + prefix + ' (' + hostCount + ' hostů)';

        outEl.innerHTML =
          '<div class="lab-grid-2">' +
            '<div class="stat-tile"><div class="stat-tile-label">Síť</div><div class="stat-tile-val">' + calc.network + '</div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Maska</div><div class="stat-tile-val">' + calc.mask + '</div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Broadcast</div><div class="stat-tile-val">' + calc.broadcast + '</div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Použitelní hosté</div><div class="stat-tile-val">' + calc.usableHosts + ' (' + calc.firstHost + ' – ' + calc.lastHost + ')</div></div>' +
          '</div>' +
          '<div class="table-scroll"><table class="data-table"><thead><tr><th>Podsíť</th><th>Adresa sítě</th><th>Rozsah použitelných hostů</th><th>Broadcast</th></tr></thead><tbody>' +
            subnetRows.slice(0, 8).map(function (r) {
              return '<tr><td>#' + r.idx + '</td><td><code>' + r.net + '</code></td><td><code>' + r.range + '</code></td><td><code>' + r.bcast + '</code></td></tr>';
            }).join('') +
          '</tbody></table></div>';
      }

      ipInp.addEventListener('input', function () {
        if (isStale()) return;
        renderOutput();
      });
      ipInp.addEventListener('change', function () {
        if (isStale()) return;
        renderOutput();
      });
      cidrInp.addEventListener('input', function (e) {
        if (isStale()) return;
        prefix = Number(e.target.value);
        renderOutput();
      });
      cidrInp.addEventListener('change', function (e) {
        if (isStale()) return;
        prefix = Number(e.target.value);
        renderOutput();
      });
      prefixBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          if (isStale()) return;
          prefix = Number(b.getAttribute('data-p'));
          renderOutput();
        });
      });

      renderOutput();
    },

    /* 10. dora-stepper */
    'dora-stepper': function (el) {
      var step = 0;
      var STEPS = [
        {
          letter: 'D', name: 'DISCOVER (Klient → Broadcast)',
          srcMac: 'AA:AA:AA:11:11:11', dstMac: 'FF:FF:FF:FF:FF:FF',
          srcIp: '0.0.0.0:68', dstIp: '255.255.255.255:67',
          payload: '„Ahoj! Jsem nové zařízení, neznám svou IP. Je tu nějaký DHCP server?“',
          clientIp: '0.0.0.0 (čeká)'
        },
        {
          letter: 'O', name: 'OFFER (Server → Klient)',
          srcMac: 'DD:DD:DD:01:01:01', dstMac: 'AA:AA:AA:11:11:11',
          srcIp: '192.168.1.1:67', dstIp: '192.168.1.10:68',
          payload: '„Nabízím ti IP 192.168.1.10/24, výchozí bránu 192.168.1.1, DNS 1.1.1.1 (Lease 24h).“',
          clientIp: 'Nabídnuto 192.168.1.10'
        },
        {
          letter: 'R', name: 'REQUEST (Klient → Broadcast)',
          srcMac: 'AA:AA:AA:11:11:11', dstMac: 'FF:FF:FF:FF:FF:FF',
          srcIp: '0.0.0.0:68', dstIp: '255.255.255.255:67',
          payload: '„Přijímám nabídku 192.168.1.10 od serveru 192.168.1.1!“',
          clientIp: 'Žádá o 192.168.1.10'
        },
        {
          letter: 'A', name: 'ACKNOWLEDGE (Server → Klient)',
          srcMac: 'DD:DD:DD:01:01:01', dstMac: 'AA:AA:AA:11:11:11',
          srcIp: '192.168.1.1:67', dstIp: '192.168.1.10:68',
          payload: '„Potvrzeno! Pronájem (Lease) aktivní. Můžeš adresu používat.“',
          clientIp: '192.168.1.10/24 (AKTIVNÍ)'
        }
      ];

      function render() {
        var s = STEPS[step];
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Kroková simulace DHCP DORA</strong><span class="badge badge-emerald">Stav klienta: ' + escapeHtml(s.clientIp) + '</span></div>' +
            '<div class="lab-controls">' +
              STEPS.map(function (st, idx) {
                return '<button type="button" class="btn btn-sm ' + (idx === step ? 'btn-primary' : '') + '" data-d="' + idx + '">' + (idx + 1) + '. ' + st.letter + '</button>';
              }).join('') +
              '<button type="button" class="btn btn-sm btn-emerald" data-act="next">Další krok →</button>' +
            '</div>' +
            '<div class="callout callout-problem"><strong>' + escapeHtml(s.name) + '</strong><br>' + escapeHtml(s.payload) + '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">L2 Rámec (Ethernet)</div><div>SRC MAC: <code>' + s.srcMac + '</code></div><div>DST MAC: <code>' + s.dstMac + '</code></div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">L3/L4 Paket (IP + UDP)</div><div>SRC IP: <code>' + s.srcIp + '</code></div><div>DST IP: <code>' + s.dstIp + '</code></div></div>' +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-d]').forEach(function (b) {
          b.addEventListener('click', function () { step = Number(b.getAttribute('data-d')); render(); });
        });
        el.querySelector('[data-act="next"]').addEventListener('click', function () { step = (step + 1) % STEPS.length; render(); });
      }
      render();
    },

    /* 11. routing-table-sim */
    'routing-table-sim': function (el, topic, opts, mountToken) {
      var dstIp = '192.168.2.10';
      var PRESETS = ['192.168.2.10', '192.168.2.150', '192.168.1.55', '10.10.0.5', '8.8.8.8'];
      var ROUTES = [
        { prefix: '0.0.0.0', cidr: 0, via: '203.0.113.1', iface: 'WAN 1 (Default Gateway)', metric: 10 },
        { prefix: '192.168.1.0', cidr: 24, via: 'Directly Connected', iface: 'LAN 1', metric: 0 },
        { prefix: '192.168.2.0', cidr: 24, via: 'Directly Connected', iface: 'LAN 2', metric: 0 },
        { prefix: '192.168.2.128', cidr: 25, via: '192.168.255.2', iface: 'DMZ / VLAN 20', metric: 5 },
        { prefix: '10.10.0.0', cidr: 16, via: '10.255.0.1', iface: 'VPN Tunel', metric: 20 }
      ];

      function isStale() {
        return mountToken != null && el.__op4LabToken !== mountToken;
      }

      function evaluate() {
        var ipInt = ipToInt(dstIp);
        if (ipInt === null) return null;
        var matches = ROUTES.map(function (r) {
          var netInt = ipToInt(r.prefix);
          var maskInt = maskFromPrefix(r.cidr);
          var isMatch = ((ipInt & maskInt) >>> 0) === ((netInt & maskInt) >>> 0);
          return { route: r, isMatch: isMatch };
        });
        var bestIdx = -1;
        var bestCidr = -1;
        for (var i = 0; i < matches.length; i++) {
          if (matches[i].isMatch && matches[i].route.cidr > bestCidr) {
            bestCidr = matches[i].route.cidr;
            bestIdx = i;
          }
        }
        return { matches: matches, bestIdx: bestIdx };
      }

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>Simulátor směrovací tabulky (Longest Prefix Match)</strong>' +
            '<span class="badge" id="rt-out-badge"></span>' +
          '</div>' +
          '<div class="lab-controls">' +
            '<input type="text" id="rt-dst-ip" class="input" style="max-width:200px;" value="' + escapeHtml(dstIp) + '" aria-label="Cílová IP adresa" />' +
            PRESETS.map(function (ip) {
              return '<button type="button" class="btn btn-sm" data-ip="' + ip + '">' + ip + '</button>';
            }).join('') +
          '</div>' +
          '<div id="rt-out"></div>' +
        '</div>';

      var badgeEl = el.querySelector('#rt-out-badge');
      var ipInp = el.querySelector('#rt-dst-ip');
      var presetBtns = el.querySelectorAll('[data-ip]');
      var outEl = el.querySelector('#rt-out');

      function renderOutput() {
        if (isStale()) return;
        var res = evaluate();
        var winner = res && res.bestIdx >= 0 ? res.matches[res.bestIdx].route : null;

        if (winner) {
          badgeEl.className = 'badge badge-emerald';
          badgeEl.textContent = 'Výstup: ' + winner.iface;
        } else {
          badgeEl.className = 'badge badge-rose';
          badgeEl.textContent = 'Neplatná IP';
        }
        presetBtns.forEach(function (b) {
          b.classList.toggle('btn-primary', b.getAttribute('data-ip') === dstIp);
        });

        if (!res) {
          outEl.innerHTML =
            '<div class="callout callout-warn"><strong>Neplatná cílová IPv4 adresa:</strong> Zadej čtyři oktety v rozsahu <code>0–255</code> oddělené tečkou (např. <code>192.168.2.50</code>), aby router mohl vyhodnotit Longest Prefix Match.</div>';
          return;
        }

        outEl.innerHTML =
          '<div class="table-scroll"><table class="data-table"><thead><tr><th>Cílová síť / Maska</th><th>Next-Hop</th><th>Rozhraní</th><th>Shoda</th></tr></thead><tbody>' +
            res.matches.map(function (m, idx) {
              var isWin = idx === res.bestIdx;
              var cls = isWin ? 'lab-row-highlight-win' : (m.isMatch ? 'lab-row-highlight-match' : '');
              return '<tr class="' + cls + '"><td><code>' + m.route.prefix + '/' + m.route.cidr + '</code></td><td>' + escapeHtml(m.route.via) + '</td><td><strong>' + escapeHtml(m.route.iface) + '</strong></td><td>' +
                (isWin ? '<span class="inline-icon-label">' + cIcon('checkmark--outline', 14) + ' VÍTĚZ (/' + m.route.cidr + ')</span>' : (m.isMatch ? 'Shoda (/' + m.route.cidr + ')' : 'Neshoda')) + '</td></tr>';
            }).join('') +
          '</tbody></table></div>' +
          (winner ? '<div class="callout callout-tip"><strong>Rozhodnutí routeru:</strong> Paket pro <code>' + escapeHtml(dstIp) + '</code> odchází přes rozhraní <strong>' + escapeHtml(winner.iface) + '</strong>, protože záznam <code>' + winner.prefix + '/' + winner.cidr + '</code> má nejdelší shodný prefix (' + winner.cidr + ' bitů).</div>' : '');
      }

      ipInp.addEventListener('input', function () {
        if (isStale()) return;
        dstIp = ipInp.value.trim();
        renderOutput();
      });
      ipInp.addEventListener('change', function () {
        if (isStale()) return;
        var trimmed = ipInp.value.trim();
        if (dstIp !== trimmed) {
          dstIp = trimmed;
          renderOutput();
        }
      });
      presetBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          if (isStale()) return;
          dstIp = b.getAttribute('data-ip');
          ipInp.value = dstIp;
          renderOutput();
        });
      });

      renderOutput();
    },

    /* 12. nat-translator */
    'nat-translator': function (el) {
      var entries = [
        { dir: 'Odchozí PAT', inLocal: '192.168.1.10:54122', inGlobal: '203.0.113.5:40001', outGlobal: '8.8.8.8:443', status: 'ACCEPT' }
      ];
      var nextPort = 40002;
      var lastMsg = 'Výchozí relace z 192.168.1.10 byla přeložena na veřejnou IP 203.0.113.5:40001.';

      function render() {
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Simulátor NAT/PAT a Port Forwardingu</strong><span class="badge badge-cyan">WAN IP: 203.0.113.5</span></div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm btn-primary" data-act="out-pc1">Odchozí: 192.168.1.10 → 8.8.8.8:443</button>' +
              '<button type="button" class="btn btn-sm" data-act="out-pc2">Odchozí: 192.168.1.25 → 8.8.8.8:443</button>' +
              '<button type="button" class="btn btn-sm btn-emerald" data-act="in-pf">Příchozí Port Fwd: → 203.0.113.5:8080</button>' +
              '<button type="button" class="btn btn-sm btn-rose" data-act="in-drop">Příchozí bez pravidla: → :22</button>' +
              '<button type="button" class="btn btn-sm" data-act="clear">Vyčistit</button>' +
            '</div>' +
            '<div class="callout callout-problem">' + escapeHtml(lastMsg) + '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>Typ</th><th>Inside Local (LAN)</th><th>Inside Global (WAN)</th><th>Outside (Internet)</th><th>Stav</th></tr></thead><tbody>' +
              entries.map(function (e) {
                return '<tr class="' + (e.status === 'DROP' ? 'lab-row-highlight-drop' : '') + '"><td>' + escapeHtml(e.dir) + '</td><td><code>' + escapeHtml(e.inLocal) + '</code></td><td><code>' + escapeHtml(e.inGlobal) + '</code></td><td><code>' + escapeHtml(e.outGlobal) + '</code></td><td><strong>' + escapeHtml(e.status) + '</strong></td></tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>';

        el.querySelector('[data-act="out-pc1"]').addEventListener('click', function () {
          var p = nextPort++;
          entries.unshift({ dir: 'Odchozí PAT', inLocal: '192.168.1.10:' + (54100 + (p % 900)), inGlobal: '203.0.113.5:' + p, outGlobal: '8.8.8.8:443', status: 'ACCEPT' });
          lastMsg = 'SNAT/PAT přepsal zdrojovou adresu 192.168.1.10 na veřejnou 203.0.113.5:' + p + '.';
          render();
        });
        el.querySelector('[data-act="out-pc2"]').addEventListener('click', function () {
          var p = nextPort++;
          entries.unshift({ dir: 'Odchozí PAT', inLocal: '192.168.1.25:' + (55200 + (p % 900)), inGlobal: '203.0.113.5:' + p, outGlobal: '8.8.8.8:443', status: 'ACCEPT' });
          lastMsg = 'Druhý počítač dostal unikátní zdrojový port :' + p + ', takže si provoz dvou PC neplete!';
          render();
        });
        el.querySelector('[data-act="in-pf"]').addEventListener('click', function () {
          entries.unshift({ dir: 'Port Fwd (DNAT)', inLocal: '192.168.1.50:80', inGlobal: '203.0.113.5:8080', outGlobal: '93.184.216.34:49112', status: 'ACCEPT' });
          lastMsg = 'DNAT pravidlo přesměrovalo příchozí spojení na port :8080 na interní web server 192.168.1.50:80.';
          render();
        });
        el.querySelector('[data-act="in-drop"]').addEventListener('click', function () {
          entries.unshift({ dir: 'Příchozí WAN', inLocal: '— (neexistuje překlad)', inGlobal: '203.0.113.5:22', outGlobal: '198.51.100.99:55110', status: 'DROP' });
          lastMsg = 'Zahozeno! V NAT tabulce není aktivní spojení ani Port Forwarding pro port :22.';
          render();
        });
        el.querySelector('[data-act="clear"]').addEventListener('click', function () {
          entries = [];
          lastMsg = 'NAT tabulka byla vyčištěna.';
          render();
        });
      }
      render();
    },

    /* 13. mac-table-sim */
    'mac-table-sim': function (el) {
      var cam = {};
      var PORTS = {
        'PC-A': { port: 1, mac: 'AA:AA:AA:00:00:01' },
        'PC-B': { port: 2, mac: 'BB:BB:BB:00:00:02' },
        'PC-C': { port: 3, mac: 'CC:CC:CC:00:00:03' },
        'Tiskárna': { port: 4, mac: 'DD:DD:DD:00:00:04' }
      };
      var lastAction = 'Tabulka je prázdná. Odešli první rámec a sleduj chování switche.';

      function sendFrame(srcName, dstName) {
        var src = PORTS[srcName];
        var dst = PORTS[dstName];
        cam[src.mac] = { port: src.port, host: srcName };
        if (cam[dst.mac]) {
          lastAction = 'UČENÍ: ' + srcName + ' (' + src.mac + ') je na Portu ' + src.port + '. CÍL ZNÁMÝ → Přesný UNICAST FORWARD pouze na Port ' + cam[dst.mac].port + ' (' + dstName + ').';
        } else {
          lastAction = 'UČENÍ: ' + srcName + ' (' + src.mac + ') uložen na Port ' + src.port + '. CÍL NEZNÁMÝ → FLOOD (zaplavení na všechny ostatní porty kromě Portu ' + src.port + ').';
        }
        render();
      }

      function render() {
        var keys = Object.keys(cam);
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Simulátor CAM (MAC) tabulky L2 Switche</strong><span class="badge badge-cyan">Záznamů v CAM: ' + keys.length + '/4</span></div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm btn-primary" data-f="PC-A,PC-B">PC-A pošle PC-B</button>' +
              '<button type="button" class="btn btn-sm btn-emerald" data-f="PC-B,PC-A">PC-B odpoví PC-A</button>' +
              '<button type="button" class="btn btn-sm" data-f="PC-A,PC-C">PC-A pošle PC-C</button>' +
              '<button type="button" class="btn btn-sm" data-f="PC-C,Tiskárna">PC-C pošle Tiskárně</button>' +
              '<button type="button" class="btn btn-sm btn-rose" data-act="reset">Vyčistit CAM tabulku</button>' +
            '</div>' +
            '<div class="callout callout-problem">' + escapeHtml(lastAction) + '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>MAC Adresa</th><th>Zařízení</th><th>Naučený Port</th></tr></thead><tbody>' +
              (keys.length
                ? keys.map(function (mac) {
                    return '<tr><td><code>' + mac + '</code></td><td>' + escapeHtml(cam[mac].host) + '</td><td><strong>Port ' + cam[mac].port + '</strong></td></tr>';
                  }).join('')
                : '<tr><td colspan="3" class="muted">CAM tabulka je zatím prázdná (každý neznámý cíl vyvolá Flood).</td></tr>') +
            '</tbody></table></div>' +
          '</div>';

        el.querySelectorAll('[data-f]').forEach(function (b) {
          b.addEventListener('click', function () {
            var p = b.getAttribute('data-f').split(',');
            sendFrame(p[0], p[1]);
          });
        });
        el.querySelector('[data-act="reset"]').addEventListener('click', function () {
          cam = {};
          lastAction = 'CAM tabulka vymazána! Příští rámec spustí opět Flood.';
          render();
        });
      }
      render();
    },

    /* 14. wifi-band-mode */
    'wifi-band-mode': function (el) {
      var band = '5';
      var walls = 1;
      var sohoMode = 'ap';
      var BANDS = {
        '2.4': { label: '2.4 GHz (802.11n/ax)', baseSpeed: 180, baseRange: 95, wallLoss: 12, interference: 'Vysoké (jen 3 nepřekrývající kanály 1, 6, 11)' },
        '5': { label: '5 GHz (802.11ac/ax)', baseSpeed: 860, baseRange: 72, wallLoss: 24, interference: 'Nízké (široké kanály 80 MHz, DFS)' },
        '6': { label: '6 GHz (Wi-Fi 6E / 7)', baseSpeed: 1600, baseRange: 52, wallLoss: 34, interference: 'Minimální (čisté spektrum, krátký dosah)' }
      };
      var MODES = {
        router: 'Router: Přijímá WAN internet, spouští NAT + DHCP server a vysílá Wi-Fi pro LAN.',
        ap: 'AP (Access Point): Připojen kabelem k hlavnímu routeru. Nevytváří druhý NAT, jen převádí LAN na Wi-Fi!',
        wisp: 'WISP: Přijímá internet bezdrátově od ISP anténou (WAN přes Wi-Fi) a rozvádí ho do lokální LAN kabelem.',
        extender: 'Extender / Repeater: Přijímá a znovu vysílá Wi-Fi na stejném rádiu – prodlužuje dosah, ale půlí propustnost!'
      };

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>Wi-Fi pásma (2.4 / 5 / 6 GHz) &amp; Režimy SOHO prvků</strong></div>' +
          '<div class="lab-controls">' +
            ['2.4', '5', '6'].map(function (k) {
              return '<button type="button" class="btn btn-sm" data-band="' + k + '">' + k + ' GHz</button>';
            }).join('') +
          '</div>' +
          '<div>' +
            '<label class="field-label" for="wifi-walls">Počet betonových zdí mezi AP a klientem: <span id="wifi-walls-val">' + walls + '</span></label>' +
            '<input id="wifi-walls" type="range" class="cidr-slider" min="0" max="3" value="' + walls + '" />' +
          '</div>' +
          '<div id="wifi-out"></div>' +
          '<div><strong>Režim bezdrátového zařízení:</strong></div>' +
          '<div class="lab-controls">' +
            [['router', 'Router'], ['ap', 'Access Point (AP)'], ['wisp', 'WISP'], ['extender', 'Extender / Repeater']].map(function (m) {
              return '<button type="button" class="btn btn-sm" data-sm="' + m[0] + '">' + m[1] + '</button>';
            }).join('') +
          '</div>' +
          '<div class="callout callout-tip" id="wifi-mode-callout"></div>' +
        '</div>';

      var bandBtns = el.querySelectorAll('[data-band]');
      var wallsInp = el.querySelector('#wifi-walls');
      var wallsValEl = el.querySelector('#wifi-walls-val');
      var outEl = el.querySelector('#wifi-out');
      var modeBtns = el.querySelectorAll('[data-sm]');
      var modeCalloutEl = el.querySelector('#wifi-mode-callout');

      function renderOutput() {
        var b = BANDS[band];
        var signal = Math.max(5, b.baseRange - walls * b.wallLoss);
        var speed = Math.round(b.baseSpeed * (signal / 100) * (sohoMode === 'extender' ? 0.5 : 1));

        bandBtns.forEach(function (btn) {
          btn.classList.toggle('btn-primary', btn.getAttribute('data-band') === band);
        });
        wallsValEl.textContent = String(walls);
        if (Number(wallsInp.value) !== walls) wallsInp.value = String(walls);
        outEl.innerHTML =
          '<div class="lab-grid-2">' +
            '<div class="stat-tile"><div class="stat-tile-label">Kvalita signálu &amp; dosah</div><div class="stat-tile-val">' + signal + ' %</div><div class="lab-meter" style="margin-top:6px;"><div class="lab-meter-fill" style="width:' + signal + '%;background:' + (signal < 30 ? 'var(--accent-rose)' : 'var(--accent-emerald)') + ';"></div></div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Odhad reálné rychlosti</div><div class="stat-tile-val">' + speed + ' Mbps</div><div class="muted" style="font-size:0.8rem;">Rušení: ' + escapeHtml(b.interference) + '</div></div>' +
          '</div>';
        modeBtns.forEach(function (btn) {
          btn.classList.toggle('btn-emerald', btn.getAttribute('data-sm') === sohoMode);
        });
        modeCalloutEl.textContent = MODES[sohoMode];
      }

      bandBtns.forEach(function (btn) {
        btn.addEventListener('click', function () { band = btn.getAttribute('data-band'); renderOutput(); });
      });
      wallsInp.addEventListener('input', function (e) { walls = Number(e.target.value); renderOutput(); });
      wallsInp.addEventListener('change', function (e) { walls = Number(e.target.value); renderOutput(); });
      modeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () { sohoMode = btn.getAttribute('data-sm'); renderOutput(); });
      });
      renderOutput();
    },

    /* 15. iot-advisor */
    'iot-advisor': function (el) {
      var range = 'km'; // 'room', 'building', 'km'
      var battery = 'years'; // 'ac', 'months', 'years'
      var payload = 'tiny'; // 'tiny', 'medium', 'stream'

      function scoreTechs() {
        var techs = [
          {
            name: 'LoRaWAN (868 MHz)',
            score: (range === 'km' ? 45 : 15) + (battery === 'years' ? 35 : 20) + (payload === 'tiny' ? 20 : -30),
            note: 'Dosah až 10+ km, výdrž let na baterii, ale jen pár bajtů za minutu.'
          },
          {
            name: 'NB-IoT / LTE-M (Operátor)',
            score: (range === 'km' ? 40 : 10) + (battery === 'years' ? 30 : 20) + (payload === 'tiny' ? 20 : (payload === 'medium' ? 15 : -20)),
            note: 'Využívá mobilní síť operátora (SIM) bez nutnosti vlastní brány.'
          },
          {
            name: 'Zigbee / Thread (Mesh 2.4 GHz)',
            score: (range === 'building' ? 40 : (range === 'room' ? 35 : -20)) + (battery === 'years' ? 35 : 25) + (payload === 'tiny' ? 25 : (payload === 'medium' ? 10 : -30)),
            note: 'Ideální pro chytrou domácnost (senzory, vypínače) s mesh přeposíláním.'
          },
          {
            name: 'Bluetooth Low Energy (BLE)',
            score: (range === 'room' ? 45 : (range === 'building' ? 15 : -30)) + (battery === 'years' ? 30 : 25) + (payload === 'medium' ? 20 : (payload === 'tiny' ? 20 : -15)),
            note: 'Nositelné senzory, majáky (beacons), komunikace přímo s mobilem.'
          },
          {
            name: 'Wi-Fi (2.4 / 5 GHz)',
            score: (range === 'building' || range === 'room' ? 30 : -20) + (battery === 'ac' ? 40 : -25) + (payload === 'stream' ? 45 : (payload === 'medium' ? 25 : 10)),
            note: 'Vysoký datový tok (kamery, stream), ale velká spotřeba – chce napájení ze sítě.'
          }
        ];
        return techs.map(function (t) {
          return { name: t.name, score: Math.max(5, Math.min(100, t.score)), note: t.note };
        }).sort(function (a, b) { return b.score - a.score; });
      }

      function render() {
        var list = scoreTechs();
        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header"><strong>Poradce IoT technologií</strong><span class="badge badge-emerald">Nejvhodnější: ' + escapeHtml(list[0].name) + '</span></div>' +
            '<div class="lab-grid-2">' +
              '<div><div class="field-label">1. Požadovaný dosah</div><div class="lab-controls">' +
                [['room', 'Místnost (<10 m)'], ['building', 'Budova (100 m)'], ['km', 'Kilometry (město/pole)']].map(function (o) {
                  return '<button type="button" class="btn btn-sm ' + (range === o[0] ? 'btn-primary' : '') + '" data-r="' + o[0] + '">' + o[1] + '</button>';
                }).join('') +
              '</div></div>' +
              '<div><div class="field-label">2. Napájení &amp; Data</div><div class="lab-controls">' +
                [['ac', 'Ze zásuvky'], ['years', 'Baterie (roky)']].map(function (o) {
                  return '<button type="button" class="btn btn-sm ' + (battery === o[0] ? 'btn-emerald' : '') + '" data-b="' + o[0] + '">' + o[1] + '</button>';
                }).join('') +
                [['tiny', 'Pár bajtů'], ['stream', 'Video stream']].map(function (o) {
                  return '<button type="button" class="btn btn-sm ' + (payload === o[0] ? 'btn-amber' : '') + '" data-d="' + o[0] + '">' + o[1] + '</button>';
                }).join('') +
              '</div></div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
              list.map(function (t, i) {
                return '<div class="stat-tile">' +
                  '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong class="inline-icon-label">' + (i === 0 ? cIcon('star', 14) + ' ' : '') + escapeHtml(t.name) + '</strong><span>' + t.score + ' %</span></div>' +
                  '<div class="lab-meter"><div class="lab-meter-fill" style="width:' + t.score + '%;background:' + (i === 0 ? 'var(--accent-emerald)' : 'var(--accent-cyan)') + ';"></div></div>' +
                  '<div class="muted" style="font-size:0.82rem;margin-top:4px;">' + escapeHtml(t.note) + '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-r]').forEach(function (b) { b.addEventListener('click', function () { range = b.getAttribute('data-r'); render(); }); });
        el.querySelectorAll('[data-b]').forEach(function (b) { b.addEventListener('click', function () { battery = b.getAttribute('data-b'); render(); }); });
        el.querySelectorAll('[data-d]').forEach(function (b) { b.addEventListener('click', function () { payload = b.getAttribute('data-d'); render(); }); });
      }
      render();
    },

    /* 16. vlan-sim */
    'vlan-sim': function (el) {
      var pc2Mode = 'access10'; // 'access10' | 'access20' | 'trunk'
      var uplinkMode = 'trunk'; // 'trunk' | 'access10'
      var interVlan = false;
      var frameType = 'unicast-pc2'; // 'unicast-pc2' | 'unicast-pc3' | 'broadcast'

      function evaluate() {
        var tagText = uplinkMode === 'trunk'
          ? 'Trunk linka: vložen 4B tag 802.1Q (TPID: 0x8100, PCP: 0, VID: 10 / 20). Access porty nesou netagovaný rámec (Ethernet II) a switch doplní interně PVID.'
          : 'Uplink je jen Access VLAN 10: rámce odcházejí bez 802.1Q tagu a provoz z VLAN 20 se na router vůbec nedostane!';

        var ok = false;
        var badge = 'BLOKOVÁNO';
        var badgeCls = 'badge-rose';
        var domainText = '';
        var detail = '';

        if (frameType === 'broadcast') {
          ok = true;
          badge = pc2Mode === 'access10' ? 'DORUČENO (JEN VLAN 10)' : 'IZOLOVÁNO (JEN VLAN 10)';
          badgeCls = 'badge-cyan';
          domainText = pc2Mode === 'access10'
            ? 'PC-1 → SW1 → PC-2 (VLAN 10). PC-3 (VLAN 20) broadcast nikdy nedostane.'
            : 'PC-2 (' + (pc2Mode === 'trunk' ? 'Trunk' : 'VLAN 20') + ') ani PC-3 (VLAN 20) broadcast z VLAN 10 nepřijmou.';
          detail = 'Router L2 broadcasty mezi VLAN nepřeposílá – broadcastová doména zůstává izolovaná i při zapnutém Inter-VLAN routingu.';
        } else if (frameType === 'unicast-pc2') {
          if (pc2Mode === 'access10') {
            ok = true;
            badge = 'DORUČENO (L2 SWITCH)';
            badgeCls = 'badge-emerald';
            domainText = 'Stejná VLAN 10 → přímé L2 přeposlání na Port 2.';
            detail = 'PC-1 i PC-2 jsou v Access VLAN 10. Switch odstraní interní příznak a pošle běžný netagovaný Ethernet rámec přímo na PC-2.';
          } else if (pc2Mode === 'trunk') {
            ok = false;
            badge = 'CHYBA KONFIGURACE';
            badgeCls = 'badge-rose';
            domainText = 'Port 2 je Trunk → koncové PC nerozumí 802.1Q tagu!';
            detail = 'Koncové PC bez VLAN subrozhraní zahodí 802.1Q tagované rámce – port pro běžnou stanici musí být nastaven jako Access.';
          } else {
            // pc2Mode === 'access20' -> cross-VLAN rules
            if (!interVlan) {
              ok = false;
              badge = 'BLOKOVÁNO (L2 IZOLACE)';
              badgeCls = 'badge-rose';
              domainText = 'PC-1 (VLAN 10) vs. PC-2 (VLAN 20) – oddělené L2 domény.';
              detail = 'Různé VLAN = oddělené L2 domény i IP podsítě. Bez L3 routeru / SVI nelze komunikovat.';
            } else if (uplinkMode !== 'trunk') {
              ok = false;
              badge = 'CHYBA TRUNKU';
              badgeCls = 'badge-rose';
              domainText = 'Inter-VLAN zapnut, ale uplink k routeru je Access VLAN 10.';
              detail = 'Router nemá přes Access uplink přístup k VLAN 20 – nastavte uplink SW1 ↔ Router na Trunk 802.1Q.';
            } else {
              ok = true;
              badge = 'DORUČENO (L3 INTER-VLAN)';
              badgeCls = 'badge-emerald';
              domainText = 'PC-1 (V10) → SW1 → Trunk → Router → SW1 → PC-2 (V20).';
              detail = 'SW1 pošle tag VID=10 po trunku na Router (subrozhraní .10), Router přeroutuje na .20 (VID=20) zpět do SW1 a bez tagu na PC-2.';
            }
          }
        } else {
          // unicast-pc3 (always VLAN 10 -> VLAN 20)
          if (!interVlan) {
            ok = false;
            badge = 'BLOKOVÁNO (L2 IZOLACE)';
            badgeCls = 'badge-rose';
            domainText = 'PC-1 (VLAN 10) nemůže přímo na PC-3 (VLAN 20).';
            detail = 'Různé VLAN = oddělené L2 domény i IP podsítě. Bez L3 routeru/SVI nelze komunikovat.';
          } else if (uplinkMode !== 'trunk') {
            ok = false;
            badge = 'CHYBA TRUNKU';
            badgeCls = 'badge-rose';
            domainText = 'Uplink k routeru nenese VLAN 20.';
            detail = 'Router nemá přes Access uplink přístup k VLAN 20 – nastavte Trunk 802.1Q.';
          } else {
            ok = true;
            badge = 'DORUČENO (L3 INTER-VLAN)';
            badgeCls = 'badge-emerald';
            domainText = 'PC-1 (V10) → SW1 → Trunk 802.1Q → Router → PC-3 (V20).';
            detail = 'SW1 pošle tag VID=10 po trunku na Router (subrozhraní .10), Router přeroutuje na .20 (VID=20) zpět do SW1 a bez tagu na PC-3.';
          }
        }

        return { ok: ok, badge: badge, badgeCls: badgeCls, tagText: tagText, domainText: domainText, detail: detail };
      }

      function render() {
        var res = evaluate();
        var pc2Label = pc2Mode === 'access10' ? 'Access V10' : (pc2Mode === 'access20' ? 'Access V20' : 'Trunk 802.1Q');
        var pc2Color = pc2Mode === 'access10' ? '#38bdf8' : (pc2Mode === 'access20' ? '#f59e0b' : '#a78bfa');
        var linkToPc2 = (frameType === 'unicast-pc2' || frameType === 'broadcast')
          ? (pc2Mode === 'access10' ? '#10b981' : (frameType === 'unicast-pc2' && res.ok ? '#10b981' : '#f43f5e'))
          : '#334a73';
        var linkToPc3 = frameType === 'unicast-pc3'
          ? (res.ok ? '#10b981' : '#f43f5e')
          : '#334a73';
        var linkUplink = (interVlan || uplinkMode === 'trunk')
          ? (uplinkMode === 'trunk' ? '#a78bfa' : '#f43f5e')
          : '#334a73';

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('layers', 16) + ' Simulátor VLAN &amp; IEEE 802.1Q</strong>' +
              '<span class="badge ' + res.badgeCls + '">' + escapeHtml(res.badge) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Port 2 (PC-2):</span>' +
              [['access10', 'Access VLAN 10'], ['access20', 'Access VLAN 20'], ['trunk', 'Trunk 802.1Q']].map(function (m) {
                return '<button type="button" class="btn btn-sm ' + (pc2Mode === m[0] ? 'btn-primary' : '') + '" data-pc2="' + m[0] + '">' + m[1] + '</button>';
              }).join('') +
              '<button type="button" class="btn btn-sm ' + (uplinkMode === 'trunk' ? 'btn-emerald' : 'btn-amber') + '" data-act="toggle-uplink">Uplink SW1↔Router: ' + (uplinkMode === 'trunk' ? 'Trunk 802.1Q' : 'Access VLAN 10') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (interVlan ? 'btn-emerald' : '') + '" data-act="toggle-roas">Inter-VLAN Routing: ' + (interVlan ? 'ZAP' : 'VYP') + '</button>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Test provozu z PC-1 (VLAN 10):</span>' +
              '<button type="button" class="btn btn-sm ' + (frameType === 'unicast-pc2' ? 'btn-primary' : '') + '" data-frame="unicast-pc2">Unicast PC-1 → PC-2</button>' +
              '<button type="button" class="btn btn-sm ' + (frameType === 'unicast-pc3' ? 'btn-primary' : '') + '" data-frame="unicast-pc3">Unicast PC-1 → PC-3 (VLAN 20)</button>' +
              '<button type="button" class="btn btn-sm ' + (frameType === 'broadcast' ? 'btn-primary' : '') + '" data-frame="broadcast">Broadcast FF:FF..</button>' +
            '</div>' +
            '<div class="lab-stage">' +
              '<svg class="lab-svg" viewBox="0 0 560 200" aria-label="Schéma VLAN 802.1Q">' +
                '<line x1="95" y1="50" x2="260" y2="105" stroke="#38bdf8" stroke-width="3" />' +
                '<line x1="95" y1="152" x2="260" y2="105" stroke="' + linkToPc2 + '" stroke-width="3" stroke-dasharray="' + (pc2Mode === 'trunk' ? '6 4' : 'none') + '" />' +
                '<line x1="260" y1="105" x2="465" y2="160" stroke="' + linkToPc3 + '" stroke-width="3" />' +
                '<line x1="260" y1="105" x2="465" y2="55" stroke="' + linkUplink + '" stroke-width="' + (uplinkMode === 'trunk' ? '5' : '3') + '" stroke-dasharray="' + (interVlan ? 'none' : '6 5') + '" />' +
                '<rect x="28" y="26" width="112" height="44" rx="6" fill="#121c30" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="84" y="45" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">PC-1 (P1)</text>' +
                '<text x="84" y="61" text-anchor="middle" fill="#38bdf8" font-size="10">Access VLAN 10</text>' +
                '<rect x="28" y="130" width="112" height="44" rx="6" fill="#121c30" stroke="' + pc2Color + '" stroke-width="2" />' +
                '<text x="84" y="149" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">PC-2 (P2)</text>' +
                '<text x="84" y="165" text-anchor="middle" fill="' + pc2Color + '" font-size="10">' + escapeHtml(pc2Label) + '</text>' +
                '<rect x="208" y="83" width="104" height="44" rx="6" fill="#0f2847" stroke="#a78bfa" stroke-width="2" />' +
                '<text x="260" y="103" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="bold">SW1 (802.1Q)</text>' +
                '<text x="260" y="119" text-anchor="middle" fill="#a78bfa" font-size="10">L2 Přepínač</text>' +
                '<rect x="412" y="33" width="122" height="44" rx="6" fill="#121c30" stroke="' + (interVlan ? '#10b981' : '#64748b') + '" stroke-width="2" />' +
                '<text x="473" y="52" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">L3 ROUTER</text>' +
                '<text x="473" y="68" text-anchor="middle" fill="' + (interVlan ? '#10b981' : '#94a3b8') + '" font-size="10">' + (interVlan ? 'SVI .10 / .20 ZAP' : 'Inter-VLAN VYP') + '</text>' +
                '<rect x="412" y="136" width="122" height="44" rx="6" fill="#121c30" stroke="#f59e0b" stroke-width="2" />' +
                '<text x="473" y="155" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">PC-3 (P3)</text>' +
                '<text x="473" y="171" text-anchor="middle" fill="#f59e0b" font-size="10">Access VLAN 20</text>' +
              '</svg>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">IEEE 802.1Q Tagování</div><div>' + escapeHtml(res.tagText) + '</div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">Trasa &amp; Dosah</div><div><strong>' + escapeHtml(res.domainText) + '</strong></div></div>' +
            '</div>' +
            '<div class="callout ' + (res.ok ? 'callout-tip' : 'callout-warn') + '"><strong>Analýza:</strong> ' + escapeHtml(res.detail) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-pc2]').forEach(function (b) {
          b.addEventListener('click', function () { pc2Mode = b.getAttribute('data-pc2'); render(); });
        });
        el.querySelector('[data-act="toggle-uplink"]').addEventListener('click', function () {
          uplinkMode = uplinkMode === 'trunk' ? 'access10' : 'trunk';
          render();
        });
        el.querySelector('[data-act="toggle-roas"]').addEventListener('click', function () {
          interVlan = !interVlan;
          render();
        });
        el.querySelectorAll('[data-frame]').forEach(function (b) {
          b.addEventListener('click', function () { frameType = b.getAttribute('data-frame'); render(); });
        });
      }
      render();
    },

    /* 17. firewall-inspector */
    'firewall-inspector': function (el) {
      var fwMode = 'stateful'; // 'stateless' | 'stateful' | 'ngfw'
      var flowId = 'outbound-https';

      var FLOWS = {
        'outbound-https': {
          label: 'Odchozí HTTPS (LAN → :443)',
          packet: 'LAN 192.168.1.10:51402 → WAN 93.184.216.34:443 [TCP SYN]',
          conntrack: 'Nová odchozí relace → zápis do Conntrack tabulky (NEW → ESTABLISHED)',
          l7: 'App-ID: TLS/HTTPS webový přenos (čistý certifikát, žádná hrozba)',
          modes: {
            stateless: { action: 'ALLOW', risk: false, rule: 'ACL #1: PERMIT TCP LAN → ANY :443', reason: 'Stateless ACL vidí cílový port :443 z LAN a paket propustí.' },
            stateful: { action: 'ALLOW', risk: false, rule: 'Policy: LAN → WAN :443 + Conntrack NEW', reason: 'Stateful firewall povolí odchozí SYN a zapíše spojení do stavové tabulky.' },
            ngfw: { action: 'ALLOW', risk: false, rule: 'L4 Conntrack + L7 App-ID: ssl/web-browsing', reason: 'NGFW ověří pravidlo, stav relace i skutečný aplikační protokol HTTPS.' }
          }
        },
        'return-synack': {
          label: 'Návrat SYN-ACK (:443 → LAN)',
          packet: 'WAN 93.184.216.34:443 → LAN 192.168.1.10:51402 [TCP SYN-ACK]',
          conntrack: 'Nalezena aktivní relace v Conntrack (stav ESTABLISHED)',
          l7: 'Součást navázaného HTTPS spojení',
          modes: {
            stateless: { action: 'ALLOW', risk: true, rule: 'ACL #2: PERMIT TCP SRC :443 → DST >1024', reason: 'Projde, ale Stateless filtr musí mít nebezpečně široké pravidlo pro všechny odpovědi ze src :443!' },
            stateful: { action: 'ALLOW', risk: false, rule: 'Conntrack: ESTABLISHED, RELATED → ACCEPT', reason: 'Stateful firewall pozná odpověď k našemu SYN a automaticky ji pustí bez otevírání WAN portů.' },
            ngfw: { action: 'ALLOW', risk: false, rule: 'Conntrack ESTABLISHED + L7 inspekce OK', reason: 'Návratový provoz ke známé relaci je povolen a průběžně kontrolován.' }
          }
        },
        'spoofed-synack': {
          label: 'Podvržený SYN-ACK z WAN',
          packet: 'WAN 198.51.100.77:443 → LAN 192.168.1.10:51402 [TCP SYN-ACK bez SYN]',
          conntrack: 'Nenalezen odpovídající odchozí SYN → stav INVALID',
          l7: 'Nelegitimní nevyžádaný paket z internetu',
          modes: {
            stateless: { action: 'ALLOW', risk: true, rule: 'ACL #2: Shoda SRC port :443 (RIZIKO!)', reason: 'KRITICKÉ RIZIKO: Bezstavový ACL vidí jen zdrojový port :443 a neověří, zda spojení začalo z LAN!' },
            stateful: { action: 'DROP', risk: false, rule: 'Conntrack: Žádný záznam → INVALID DROP', reason: 'Stateful firewall odhalí, že LAN žádný SYN neposlala, a podvržený paket zahodí.' },
            ngfw: { action: 'DROP', risk: false, rule: 'L4 Conntrack INVALID DROP', reason: 'Zahozeno již ve stavové vrstvě ještě před hlubokou L7 analýzou.' }
          }
        },
        'tunnelled-p2p': {
          label: 'Malware / P2P tunel v portu :443',
          packet: 'LAN 192.168.1.10:52110 → WAN 203.0.113.88:443 [Payload: P2P / C2 tunel]',
          conntrack: 'Odchozí TCP spojení na port :443 (ESTABLISHED)',
          l7: 'DPI / App-ID detekuje ne-HTTPS signaturu (BitTorrent / C2 malware) uvnitř portu :443!',
          modes: {
            stateless: { action: 'ALLOW', risk: true, rule: 'ACL #1: Port :443 povolen (OMEZENÍ)', reason: 'OMEZENÍ STATELESS: Kontroluje pouze L3/L4 hlavičku (port :443) a do obsahu dat vůbec nevidí.' },
            stateful: { action: 'ALLOW', risk: true, rule: 'Conntrack: Legitimní odchozí :443 (OMEZENÍ)', reason: 'OMEZENÍ STATEFUL: Stav TCP spojení je v pořádku, ale L4 firewall nepozná, co se v portu :443 skrývá.' },
            ngfw: { action: 'DROP', risk: false, rule: 'NGFW L7 DPI + IPS: App-ID ≠ HTTPS → BLOCK', reason: 'NGFW rozbalí aplikační vrstvu (L7 DPI), odhalí skrytý P2P/C2 protokol na portu :443 a spojení zastaví!' }
          }
        },
        'port-scan': {
          label: 'Skenování portu :22 z WAN',
          packet: 'WAN 198.51.100.99:49812 → LAN 192.168.1.10:22 [TCP SYN]',
          conntrack: 'Nevyžádaný příchozí požadavek z WAN (NEW)',
          l7: 'IPS signatura: Rychlý SSH / Port Scan útok',
          modes: {
            stateless: { action: 'DROP', risk: false, rule: 'ACL Default Deny: WAN → LAN :22 DROP', reason: 'Zakázáno základním L3/L4 pravidlem pro příchozí provoz z WAN.' },
            stateful: { action: 'DROP', risk: false, rule: 'Zone WAN → LAN Default DROP', reason: 'Nevyžádané NEW spojení z WAN směrem do LAN je zahozeno.' },
            ngfw: { action: 'DROP', risk: false, rule: 'Default DROP + IPS Alert (Port Scan Block)', reason: 'Spojení je zahozeno a IPS navíc zaznamená / dočasně zablokuje útočící IP.' }
          }
        }
      };

      function render() {
        var fl = FLOWS[flowId];
        var cur = fl.modes[fwMode];
        var isAllow = cur.action === 'ALLOW';
        var badgeCls = !isAllow ? 'badge-rose' : (cur.risk ? 'badge-amber' : 'badge-emerald');
        var calloutCls = !isAllow ? 'callout-tip' : (cur.risk ? 'callout-warn' : 'callout-tip');
        var modesList = [
          { id: 'stateless', name: 'Stateless ACL (L3/L4)' },
          { id: 'stateful', name: 'Stateful Firewall (Conntrack)' },
          { id: 'ngfw', name: 'NGFW (L7 DPI + IPS)' }
        ];

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('security', 16) + ' Inspektor Firewallu: Stateless ACL vs. Stateful vs. NGFW</strong>' +
              '<span class="badge ' + badgeCls + '"><span class="inline-icon-label">' +
                cIcon(isAllow ? 'checkmark--outline' : 'close--outline', 14) + ' ' + cur.action +
                (cur.risk ? ' (BEZPEČNOSTNÍ RIZIKO)' : '') +
              '</span></span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Režim firewallu:</span>' +
              modesList.map(function (m) {
                return '<button type="button" class="btn btn-sm ' + (fwMode === m.id ? 'btn-primary' : '') + '" data-fw="' + m.id + '">' + escapeHtml(m.name) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Testovaný tok:</span>' +
              Object.keys(FLOWS).map(function (fid) {
                return '<button type="button" class="btn btn-sm ' + (flowId === fid ? 'btn-emerald' : '') + '" data-flow="' + fid + '">' + escapeHtml(FLOWS[fid].label) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">L3/L4 Hlavička paketu</div><div><code>' + escapeHtml(fl.packet) + '</code></div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">Conntrack &amp; L7 DPI kontext</div><div><strong>Stav:</strong> ' + escapeHtml(fl.conntrack) + '</div><div class="muted" style="font-size:0.82rem;margin-top:4px;"><strong>L7:</strong> ' + escapeHtml(fl.l7) + '</div></div>' +
            '</div>' +
            '<div class="callout ' + calloutCls + '"><strong>' + escapeHtml(cur.rule) + ':</strong> ' + escapeHtml(cur.reason) + '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>Architektura</th><th>Verdikt pro tento tok</th><th>Pravidlo / Mechanismus</th></tr></thead><tbody>' +
              modesList.map(function (m) {
                var r = fl.modes[m.id];
                var active = m.id === fwMode;
                var rowCls = active ? (r.action === 'ALLOW' && !r.risk ? 'lab-row-highlight-win' : (r.action === 'DROP' ? 'lab-row-highlight-match' : 'lab-row-highlight-drop')) : '';
                return '<tr class="' + rowCls + '"><td><strong>' + escapeHtml(m.name) + '</strong></td><td><strong>' + r.action + (r.risk ? ' ⚠' : '') + '</strong></td><td>' + escapeHtml(r.rule) + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>';

        el.querySelectorAll('[data-fw]').forEach(function (b) {
          b.addEventListener('click', function () { fwMode = b.getAttribute('data-fw'); render(); });
        });
        el.querySelectorAll('[data-flow]').forEach(function (b) {
          b.addEventListener('click', function () { flowId = b.getAttribute('data-flow'); render(); });
        });
      }
      render();
    },

    /* 18. sdn-controller-sim */
    'sdn-controller-sim': function (el) {
      var policies = {
        blockP2p: false,
        rerouteCongestion: false,
        isolateGuest: false
      };
      var flowId = 'corp-web';

      var SFLOWS = {
        'corp-web': { label: 'Firemní Web (10.10.0.5 → :443)', src: '10.10.0.5 (Corp)', dst: '10.10.0.10:443 (Server)', port: 443, isGuest: false },
        'p2p-app': { label: 'P2P provoz (10.10.0.5 → :6881)', src: '10.10.0.5 (Corp)', dst: 'WAN :6881 (P2P)', port: 6881, isGuest: false },
        'guest-srv': { label: 'Guest → Server (10.50.0.8 → :443)', src: '10.50.0.8 (Guest)', dst: '10.10.0.10:443 (Server)', port: 443, isGuest: true }
      };

      function buildFlowTable() {
        var rules = [];
        if (policies.blockP2p) {
          rules.push({ prio: 200, match: 'dst_port=6881 (P2P)', action: 'DROP', target: 'S1, S2, S3', key: 'blockP2p' });
        }
        if (policies.isolateGuest) {
          rules.push({ prio: 150, match: 'src=10.50.0.0/24, dst=10.10.0.10', action: 'DROP', target: 'S1', key: 'isolateGuest' });
        }
        if (policies.rerouteCongestion) {
          rules.push({ prio: 100, match: 'in_port=1 → dst=10.10.0.10/WAN', action: 'OUTPUT:port=3 (přes S3)', target: 'S1, S3', key: 'reroute' });
        }
        rules.push({ prio: 10, match: 'any (výchozí trasa)', action: 'OUTPUT:port=2 (přes S2)', target: 'S1, S2', key: 'default' });
        return rules;
      }

      function evaluate() {
        var fl = SFLOWS[flowId];
        var rules = buildFlowTable();
        var matchedKey = 'default';
        var dropped = false;
        var path = 'S1 → S2';
        var explain = 'SDN kontrolér použil výchozí nejkratší trasu S1 → S2.';

        if (fl.port === 6881 && policies.blockP2p) {
          matchedKey = 'blockP2p';
          dropped = true;
          path = 'DROP na S1';
          explain = 'Politika „Blokovat P2P“ zapsala pravidlo P=200 (DROP :6881) do všech switchů přes OpenFlow 1.3. Provoz končí hned na vstupním switchi S1.';
        } else if (fl.isGuest && policies.isolateGuest) {
          matchedKey = 'isolateGuest';
          dropped = true;
          path = 'DROP na S1';
          explain = 'Politika „Izolovat Guest“ zapsala bezpečnostní Flow pravidlo P=150 přímo na hraniční switch S1 – Guest síť 10.50.0.0/24 se k internímu serveru nedostane.';
        } else if (policies.rerouteCongestion) {
          matchedKey = 'reroute';
          dropped = false;
          path = 'S1 → S3 → S2';
          explain = 'Kontrolér detekoval přetížení linky S1–S2 a centrálně přes Southbound API přepsal Flow tabulky tak, aby tok plynul záložní trasou S1 → S3 → S2.';
        }

        return { fl: fl, rules: rules, matchedKey: matchedKey, dropped: dropped, path: path, explain: explain };
      }

      function render() {
        var res = evaluate();
        var viaS3 = !res.dropped && policies.rerouteCongestion;
        var viaS2 = !res.dropped && !policies.rerouteCongestion;

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('router', 16) + ' Simulátor SDN Controlleru: Control Plane vs. Data Plane</strong>' +
              '<span class="badge ' + (res.dropped ? 'badge-rose' : 'badge-emerald') + '">' + (res.dropped ? 'DROP (Zablokováno na S1)' : 'FORWARD: ' + res.path) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Politiky SDN Kontroléru:</span>' +
              '<button type="button" class="btn btn-sm ' + (policies.blockP2p ? 'btn-rose' : '') + '" data-pol="blockP2p">Blokovat P2P (:6881): ' + (policies.blockP2p ? 'ZAP' : 'VYP') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (policies.rerouteCongestion ? 'btn-emerald' : '') + '" data-pol="rerouteCongestion">Obcházet přetíženou linku S1–S2 přes S3: ' + (policies.rerouteCongestion ? 'ZAP' : 'VYP') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (policies.isolateGuest ? 'btn-amber' : '') + '" data-pol="isolateGuest">Izolovat Guest (10.50.0.0/24) od Serveru: ' + (policies.isolateGuest ? 'ZAP' : 'VYP') + '</button>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Testovací tok:</span>' +
              Object.keys(SFLOWS).map(function (k) {
                return '<button type="button" class="btn btn-sm ' + (flowId === k ? 'btn-primary' : '') + '" data-sflow="' + k + '">' + escapeHtml(SFLOWS[k].label) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="lab-stage">' +
              '<svg class="lab-svg" viewBox="0 0 560 210" aria-label="SDN Control Plane a Data Plane">' +
                '<line x1="280" y1="54" x2="180" y2="122" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" />' +
                '<line x1="280" y1="54" x2="380" y2="122" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" />' +
                '<line x1="280" y1="54" x2="280" y2="174" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" />' +
                '<text x="395" y="76" fill="#f59e0b" font-size="10" font-weight="bold">Southbound (OpenFlow 1.3)</text>' +
                '<line x1="78" y1="122" x2="180" y2="122" stroke="' + (res.dropped ? '#f43f5e' : '#38bdf8') + '" stroke-width="4" />' +
                '<line x1="180" y1="122" x2="380" y2="122" stroke="' + (viaS2 ? '#10b981' : (policies.rerouteCongestion ? '#f43f5e' : '#334a73')) + '" stroke-width="' + (viaS2 ? '4' : '2') + '" stroke-dasharray="' + (policies.rerouteCongestion ? '5 4' : 'none') + '" />' +
                '<line x1="180" y1="122" x2="280" y2="174" stroke="' + (viaS3 ? '#10b981' : '#334a73') + '" stroke-width="' + (viaS3 ? '4' : '2') + '" />' +
                '<line x1="280" y1="174" x2="380" y2="122" stroke="' + (viaS3 ? '#10b981' : '#334a73') + '" stroke-width="' + (viaS3 ? '4' : '2') + '" />' +
                '<line x1="380" y1="122" x2="490" y2="122" stroke="' + (res.dropped ? '#334a73' : '#10b981') + '" stroke-width="' + (res.dropped ? '2' : '4') + '" />' +
                '<rect x="195" y="14" width="170" height="40" rx="6" fill="#0f2847" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="280" y="33" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">SDN KONTROLÉR</text>' +
                '<text x="280" y="47" text-anchor="middle" fill="#38bdf8" font-size="9">Control Plane (Centrální řízení)</text>' +
                '<rect x="18" y="100" width="96" height="44" rx="6" fill="#121c30" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="66" y="119" text-anchor="middle" fill="#f1f5f9" font-size="10" font-weight="bold">ZDROJ</text>' +
                '<text x="66" y="134" text-anchor="middle" fill="#38bdf8" font-size="9">' + escapeHtml(res.fl.src) + '</text>' +
                '<rect x="148" y="102" width="64" height="40" rx="6" fill="' + (res.dropped ? '#450a18' : '#121c30') + '" stroke="' + (res.dropped ? '#f43f5e' : '#10b981') + '" stroke-width="2" />' +
                '<text x="180" y="120" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">S1</text>' +
                '<text x="180" y="134" text-anchor="middle" fill="' + (res.dropped ? '#f43f5e' : '#10b981') + '" font-size="9">' + (res.dropped ? 'DROP!' : 'OpenFlow') + '</text>' +
                '<rect x="348" y="102" width="64" height="40" rx="6" fill="#121c30" stroke="' + (viaS2 || viaS3 ? '#10b981' : '#64748b') + '" stroke-width="2" />' +
                '<text x="380" y="120" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">S2</text>' +
                '<text x="380" y="134" text-anchor="middle" fill="#94a3b8" font-size="9">Data Plane</text>' +
                '<rect x="248" y="156" width="64" height="38" rx="6" fill="#121c30" stroke="' + (viaS3 ? '#10b981' : '#64748b') + '" stroke-width="2" />' +
                '<text x="280" y="173" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">S3</text>' +
                '<text x="280" y="187" text-anchor="middle" fill="' + (viaS3 ? '#10b981' : '#94a3b8') + '" font-size="9">' + (viaS3 ? 'Aktivní' : 'Záložní') + '</text>' +
                '<rect id="sdn-dst-box" x="426" y="100" width="128" height="44" rx="6" fill="#121c30" stroke="' + (res.dropped ? '#64748b' : '#10b981') + '" stroke-width="2" />' +
                '<text x="490" y="119" text-anchor="middle" fill="#f1f5f9" font-size="10" font-weight="bold">CÍL</text>' +
                '<text id="sdn-dst-text" x="490" y="134" text-anchor="middle" fill="' + (res.dropped ? '#94a3b8' : '#10b981') + '" font-size="8.5">' + escapeHtml(res.fl.dst) + '</text>' +
              '</svg>' +
            '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>Priorita</th><th>Match (Hlavička toku)</th><th>Akce</th><th>Cíl Switch</th></tr></thead><tbody>' +
              res.rules.map(function (r) {
                var hit = r.key === res.matchedKey;
                var cls = hit ? (r.action === 'DROP' ? 'lab-row-highlight-drop' : 'lab-row-highlight-win') : '';
                return '<tr class="' + cls + '"><td><code>P=' + r.prio + '</code></td><td><code>' + escapeHtml(r.match) + '</code></td><td><strong>' + (hit ? '→ ' : '') + escapeHtml(r.action) + '</strong></td><td>' + escapeHtml(r.target) + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
            '<div class="callout ' + (res.dropped ? 'callout-warn' : 'callout-tip') + '"><strong>Control vs. Data Plane:</strong> ' + escapeHtml(res.explain) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-pol]').forEach(function (b) {
          b.addEventListener('click', function () {
            var k = b.getAttribute('data-pol');
            policies[k] = !policies[k];
            render();
          });
        });
        el.querySelectorAll('[data-sflow]').forEach(function (b) {
          b.addEventListener('click', function () { flowId = b.getAttribute('data-sflow'); render(); });
        });
      }
      render();
    },

    /* Zpětně kompatibilní alias pro starší volání firewall-vlan-sim */
    'firewall-vlan-sim': function (el, topic, helpers) {
      LAB_HANDLERS['firewall-inspector'](el, topic, helpers);
    }
  };

  global.InteractiveLabs = {
    mount: mount
  };
})(window);
