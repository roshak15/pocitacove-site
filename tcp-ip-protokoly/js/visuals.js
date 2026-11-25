/* ==========================================================================
   OP4 • Protokoly TCP/IP | Vizuální engine & 16 interaktivních laboratoří
   Exportuje na window:
     - window.NetMath            (IPv4 & CIDR výpočetní jádro)
     - window.PixelStageRenderer (16-bit Pixel-Tech Canvas animace pro 16 témat)
     - window.InteractiveLabs    (16 interaktivních protokolových simulátorů)
   Bez ES modulů a bez fetch() – plně funkční offline i přes server.mjs
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
      note = 'Skupinové vysílání (OSPF 224.0.0.5, RIPv2 224.0.0.9, mDNS) – nepřiřazuje se hostům.';
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

  var STARS = [];
  (function initStars() {
    var seed = 73;
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

  function drawPixelBackdrop(ctx, animTime) {
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, PAL.skyTop);
    grad.addColorStop(0.58, PAL.skyMid);
    grad.addColorStop(1, PAL.skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < STARS.length; i++) {
      var st = STARS[i];
      var alpha = 0.45 + 0.55 * Math.sin(animTime * 2.2 + st.phase);
      ctx.globalAlpha = Math.max(0.25, alpha);
      ctx.fillStyle = i % 3 === 0 ? PAL.star1 : PAL.star2;
      ctx.fillRect(st.x, st.y, st.size, st.size);
    }
    ctx.globalAlpha = 1;

    var cloudShift = Math.floor((animTime * 10) % 720);
    drawPixelCloudShape(ctx, ((80 + cloudShift) % 720) - 80, 56, 1);
    drawPixelCloudShape(ctx, ((390 + cloudShift * 0.7) % 720) - 80, 74, 0.8);

    var peaks1 = [0, 240, 80, 198, 160, 224, 250, 184, 340, 218, 440, 190, 540, 222, 640, 194];
    drawMountainLayer(ctx, peaks1, 286, PAL.mtnBack);

    var peaks2 = [0, 256, 60, 226, 140, 252, 210, 216, 300, 248, 390, 214, 490, 248, 580, 220, 640, 242];
    drawMountainLayer(ctx, peaks2, 286, PAL.mtnFront);

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
    pxRect(ctx, cx - 22, cy - 22, 44, 30, '#1e293b');
    pxRect(ctx, cx - 20, cy - 20, 40, 26, '#091426');
    pxRect(ctx, cx - 16, cy - 16, 32, 18, '#0f2847');
    pxRect(ctx, cx - 14, cy - 14, 18, 4, c);
    pxRect(ctx, cx - 14, cy - 8, 12, 2, PAL.emerald);
    pxRect(ctx, cx - 6, cy + 8, 12, 4, '#64748b');
    pxRect(ctx, cx - 18, cy + 12, 36, 6, '#334155');
    pxRect(ctx, cx - 14, cy + 14, 28, 2, '#94a3b8');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 22) + 1, snap(cy - 22) + 1, 42, 28);
    drawNodeLabels(ctx, cx, cy + 22, label, sublabel, c);
  }

  function drawPixelRouter(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.emerald;
    pxRect(ctx, cx - 18, cy - 24, 4, 14, '#64748b');
    pxRect(ctx, cx + 14, cy - 24, 4, 14, '#64748b');
    pxRect(ctx, cx - 18, cy - 26, 4, 4, c);
    pxRect(ctx, cx + 14, cy - 26, 4, 4, c);
    pxRect(ctx, cx - 26, cy - 10, 52, 22, '#1e293b');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 26) + 1, snap(cy - 10) + 1, 50, 20);
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

  function drawPixelFirewall(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.amber;
    pxRect(ctx, cx - 26, cy - 18, 52, 36, '#334155');
    pxRect(ctx, cx - 24, cy - 16, 14, 8, '#991b1b');
    pxRect(ctx, cx - 8, cy - 16, 16, 8, '#7c2d12');
    pxRect(ctx, cx + 10, cy - 16, 14, 8, '#991b1b');
    pxRect(ctx, cx - 24, cy - 6, 10, 10, '#7c2d12');
    pxRect(ctx, cx - 12, cy - 6, 24, 10, '#991b1b');
    pxRect(ctx, cx + 14, cy - 6, 10, 10, '#7c2d12');
    pxRect(ctx, cx - 24, cy + 6, 16, 10, '#991b1b');
    pxRect(ctx, cx - 6, cy + 6, 14, 10, '#7c2d12');
    pxRect(ctx, cx + 10, cy + 6, 14, 10, '#991b1b');
    pxRect(ctx, cx - 8, cy - 8, 16, 16, '#0f172a');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 8) + 1, snap(cy - 8) + 1, 14, 14);
    pxRect(ctx, cx - 4, cy - 4, 8, 8, c);
    var blink = Math.floor((animTime || 0) * 4) % 2 === 0;
    pxRect(ctx, cx - 22, cy - 14, 4, 4, blink ? PAL.emerald : '#14532d');
    pxRect(ctx, cx + 18, cy - 14, 4, 4, blink ? c : '#1e293b');
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
    var leds = [PAL.emerald, PAL.cyan, PAL.violet];
    for (var i = 0; i < 3; i++) {
      var active = ((Math.floor((animTime || 0) * 5) + i) % 2) === 0;
      pxRect(ctx, cx - 28 + i * 6, cy - 2, 4, 4, active ? leds[i] : '#1e293b');
      pxRect(ctx, cx + 14 + i * 6, cy - 2, 4, 4, active ? leds[2 - i] : '#1e293b');
    }
    var pulse = 0.55 + 0.45 * Math.sin((animTime || 0) * 5);
    ctx.save();
    ctx.globalAlpha = pulse;
    pxRect(ctx, cx - 6, cy - 6, 12, 12, c);
    ctx.restore();
    pxRect(ctx, cx - 4, cy - 4, 8, 8, PAL.white);
    drawNodeLabels(ctx, cx, cy + 18, label, sublabel, c);
  }

  function drawPixelClock(ctx, cx, cy, label, sublabel, color, animTime) {
    var c = color || PAL.amber;
    pxRect(ctx, cx - 18, cy - 18, 36, 36, '#1e293b');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 18) + 1, snap(cy - 18) + 1, 34, 34);
    pxRect(ctx, cx - 14, cy - 14, 28, 28, '#091426');
    pxRect(ctx, cx - 2, cy - 12, 4, 2, c);
    pxRect(ctx, cx - 2, cy + 10, 4, 2, c);
    pxRect(ctx, cx - 12, cy - 2, 2, 4, c);
    pxRect(ctx, cx + 10, cy - 2, 2, 4, c);
    var ang = (animTime || 0) * 3;
    ctx.strokeStyle = PAL.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(snap(cx), snap(cy));
    ctx.lineTo(snap(cx + Math.cos(ang) * 9), snap(cy + Math.sin(ang) * 9));
    ctx.stroke();
    pxRect(ctx, cx - 2, cy - 2, 4, 4, PAL.emerald);
    drawNodeLabels(ctx, cx, cy + 22, label, sublabel, c);
  }

  function drawPixelLock(ctx, cx, cy, locked, color) {
    var c = color || (locked ? PAL.emerald : PAL.rose);
    ctx.strokeStyle = c;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (locked) {
      ctx.arc(snap(cx), snap(cy - 8), 8, Math.PI, 0);
    } else {
      ctx.arc(snap(cx + 4), snap(cy - 11), 8, Math.PI, Math.PI * 1.75);
    }
    ctx.stroke();
    pxRect(ctx, cx - 12, cy - 6, 24, 18, '#0f172a');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(snap(cx - 12) + 1, snap(cy - 6) + 1, 22, 16);
    pxRect(ctx, cx - 2, cy, 4, 6, c);
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
    var txt = String(label || 'PKT');
    ctx.font = 'bold 10px ui-monospace, Menlo, monospace';
    var tw = Math.ceil(ctx.measureText(txt).width);
    var pw = snap(Math.max(40, tw + 14));
    var ph = 24;
    var px = snap(x - pw / 2);
    var py = snap(y - ph / 2);

    ctx.fillStyle = c;
    ctx.globalAlpha = 0.24;
    ctx.fillRect(px - 4, py - 4, pw + 8, ph + 8);
    ctx.globalAlpha = 1;

    pxRect(ctx, px, py, pw, ph, '#0f172a');
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    pxRect(ctx, px + 4, py + 4, pw - 8, 4, c);
    ctx.fillStyle = PAL.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, px + pw / 2, py + 16);
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
     Definice 16 animací pro všechna TCP/IP témata
     ------------------------------------------------------------------------ */
  function buildAnimationSteps(type) {
    switch (type) {
      /* 1. tcpip-icmp-arp */
      case 'tcpip-icmp-arp':
        return [
          {
            title: '1. Rodina TCP/IP: Zapouzdření PDU',
            caption: 'Data sestupují ze 4. aplikační vrstvy přes Segment (L3) a Paket (L2) až na Rámec (L1).',
            render: function (ctx, p) {
              drawInfoBox(ctx, 26, 54, 270, 174, 'ZAPOUZDŘENÍ TCP/IP (PDU)', [
                { text: '4. Aplikační  -> Data (HTTP/DNS)', color: PAL.violet, highlight: p < 0.25 ? '#1e1b4b' : null },
                { text: '3. Transport  -> Segment (TCP/UDP)', color: PAL.cyan, highlight: p >= 0.25 && p < 0.5 ? '#0c2d48' : null },
                { text: '2. Internet   -> Paket (IP + TTL)', color: PAL.emerald, highlight: p >= 0.5 && p < 0.75 ? '#063326' : null },
                { text: '1. Síť. rozhr -> Rámec (MAC) + Bity', color: PAL.amber, highlight: p >= 0.75 ? '#3a2207' : null },
                { text: '--------------------------------', color: PAL.slate },
                { text: '[MAC][IP][TCP][DATA][FCS]', color: PAL.white }
              ], PAL.cyan);
              drawPixelLink(ctx, 360, 168, 560, 168, { color: PAL.cyan, width: 4 });
              drawPixelPC(ctx, 360, 168, 'KLIENT', '192.168.1.10', PAL.cyan);
              drawPixelRouter(ctx, 560, 168, 'BRÁNA', '192.168.1.1', PAL.emerald, p * 4);
              drawPixelPacket(ctx, lerp(395, 525, p), 144, 'PDU', PAL.amber, 'Paket + Rámec');
            }
          },
          {
            title: '2. ARP: Překlad IP adresy na MAC adresu',
            caption: 'PC hledá MAC brány 192.168.1.1 pomocí ARP Broadcastu; brána odpovídá unicastem.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 180, 320, 180, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 180, 530, 180, { color: PAL.emerald });
              drawPixelPC(ctx, 110, 180, 'PC-A', '192.168.1.10', PAL.cyan);
              drawPixelSwitch(ctx, 320, 180, 'SWITCH', 'L2 LAN', PAL.cyan, t);
              drawPixelRouter(ctx, 530, 180, 'BRÁNA', 'AA:BB:CC:11:22:01', PAL.emerald, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(130, 510, p * 2), 146, 'ARP?', PAL.amber, 'Broadcast FF:FF..');
              } else {
                drawPixelPacket(ctx, lerp(510, 130, (p - 0.5) * 2), 146, 'ARP OK', PAL.emerald, 'MAC: AA:BB:CC..');
              }
            }
          },
          {
            title: '3. ICMP Echo Request & Echo Reply (ping)',
            caption: 'Příkaz ping ověří dostupnost cíle přes ICMP Type 8 (Request) a Type 0 (Reply).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 100, 180, 320, 180, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 180, 540, 180, { color: PAL.emerald });
              drawPixelPC(ctx, 100, 180, 'KLIENT', 'ping 8.8.8.8', PAL.cyan);
              drawPixelRouter(ctx, 320, 180, 'ROUTER', 'Forward IP', PAL.emerald, t);
              drawPixelServer(ctx, 540, 180, 'SERVER', '8.8.8.8', PAL.amber, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(120, 520, p * 2), 145, 'PING', PAL.cyan, 'ICMP Type 8');
              } else {
                drawPixelPacket(ctx, lerp(520, 120, (p - 0.5) * 2), 145, 'PONG', PAL.emerald, 'ICMP Type 0 (12ms)');
              }
            }
          },
          {
            title: '4. Traceroute: Postupné zvyšování TTL (1, 2, 3)',
            caption: 'Každý router sníží TTL o 1. Při TTL=0 vrací ICMP Time Exceeded a odhalí trasu.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 90, 180, 240, 180, { color: PAL.amber });
              drawPixelLink(ctx, 240, 180, 390, 180, { color: PAL.emerald });
              drawPixelLink(ctx, 390, 180, 550, 180, { color: PAL.cyan });
              drawPixelPC(ctx, 90, 180, 'KLIENT', 'traceroute', PAL.cyan);
              drawPixelRouter(ctx, 240, 180, 'R1', 'TTL=1 -> 0', PAL.amber, t);
              drawPixelRouter(ctx, 390, 180, 'R2', 'TTL=2 -> 0', PAL.emerald, t);
              drawPixelServer(ctx, 550, 180, 'CÍL', 'TTL=3 OK', PAL.cyan, t);
              if (p < 0.34) {
                drawPixelPacket(ctx, lerp(110, 240, p / 0.34), 145, 'TTL=1', PAL.amber, 'ICMP Time Exceeded');
              } else if (p < 0.68) {
                drawPixelPacket(ctx, lerp(110, 390, (p - 0.34) / 0.34), 145, 'TTL=2', PAL.emerald, 'ICMP Time Exceeded');
              } else {
                drawPixelPacket(ctx, lerp(110, 530, (p - 0.68) / 0.32), 145, 'TTL=3', PAL.cyan, 'Dosažen cíl!');
              }
            }
          }
        ];

      /* 2. tcp-udp-handshake */
      case 'tcp-udp-handshake':
        return [
          {
            title: '1. TCP 3-Way Handshake: SYN → SYN-ACK → ACK',
            caption: 'Před přenosem dat si klient a server synchronizují sekvenční čísla (ESTABLISHED).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.cyan, width: 4 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', ':51420 (SYN_SENT)', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'SERVER', ':443 (LISTEN)', PAL.emerald, t);
              if (p < 0.33) {
                drawPixelPacket(ctx, lerp(150, 490, p / 0.33), 145, 'SYN', PAL.cyan, 'Seq=100');
              } else if (p < 0.66) {
                drawPixelPacket(ctx, lerp(490, 150, (p - 0.33) / 0.33), 145, 'SYN-ACK', PAL.amber, 'Seq=300 Ack=101');
              } else {
                drawPixelPacket(ctx, lerp(150, 490, (p - 0.66) / 0.34), 145, 'ACK', PAL.emerald, 'ESTABLISHED');
              }
            }
          },
          {
            title: '2. TCP spolehlivost: Retransmise při ztrátě',
            caption: 'Pokud se segment po cestě ztratí, odesílatel po timeoutu provede retransmisi.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.amber, width: 3 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'Buffer + Timer', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'SERVER', 'Čeká SEQ=2', PAL.emerald, t);
              if (p < 0.42) {
                var loseX = lerp(150, 320, p / 0.42);
                drawPixelPacket(ctx, loseX, 145, 'SEQ=2', PAL.rose, 'ZTRÁTA PAKETU!');
                if (p > 0.3) drawBadge(ctx, 320, 180, 'X DROP', '#2a0912', PAL.rose, PAL.rose);
              } else if (p < 0.78) {
                drawPixelPacket(ctx, lerp(150, 490, (p - 0.42) / 0.36), 145, 'RE-TX 2', PAL.amber, 'Opakovaný přenos');
              } else {
                drawPixelPacket(ctx, lerp(490, 150, (p - 0.78) / 0.22), 145, 'ACK=3', PAL.emerald, 'Potvrzeno OK');
              }
            }
          },
          {
            title: '3. UDP: Bezestavový přenos (Fire & Forget)',
            caption: 'UDP má jen 8B hlavičku a žádný handshake – ideální pro DNS, NTP, VoIP a QUIC.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.violet, dashed: true, width: 3 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'Hlavička jen 8 B', PAL.violet);
              drawPixelServer(ctx, 510, 180, 'UDP SERVER', 'DNS / VoIP / NTP', PAL.cyan, t);
              drawPixelPacket(ctx, lerp(150, 490, p), 145, 'UDP 1', PAL.violet, 'Bez čekání na ACK');
              drawPixelPacket(ctx, lerp(150, 490, (p + 0.33) % 1), 205, 'UDP 2', PAL.cyan);
            }
          },
          {
            title: '4. Porty & Sokety (IP:Port)',
            caption: 'Soket jednoznačně identifikuje spojení. Porty 0–1023 patří systémovým službám.',
            render: function (ctx) {
              drawInfoBox(ctx, 85, 62, 470, 198, 'ROZSAHY PORTŮ & SOKET (IP:PORT)', [
                { text: '0 – 1023     : Well-Known (HTTP 80, HTTPS 443, SSH 22)', color: PAL.emerald },
                { text: '1024 – 49151 : Registered (RDP 3389, MQTT 1883, SIP 5060)', color: PAL.cyan },
                { text: '49152 – 65535: Ephemeral (Dočasné klientské porty)', color: PAL.amber },
                { text: '--------------------------------------------------------', color: PAL.slate },
                { text: 'Klientský soket : 192.168.1.10:51420', color: PAL.white },
                { text: 'Serverový soket : 93.184.216.34:443', color: PAL.white }
              ], PAL.cyan);
            }
          }
        ];

      /* 3. routing-rip-ospf */
      case 'routing-rip-ospf':
        return [
          {
            title: '1. RIPv2: Distance Vector (Metrika = počet skoků)',
            caption: 'RIPv2 (UDP 520, multicast 224.0.0.9) volí cestu s nejmenším počtem routerů (hopů).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 170, 320, 100, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 320, 100, 530, 170, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 110, 170, 260, 235, { color: PAL.slate });
              drawPixelLink(ctx, 260, 235, 410, 235, { color: PAL.slate });
              drawPixelLink(ctx, 410, 235, 530, 170, { color: PAL.slate });
              drawPixelRouter(ctx, 110, 170, 'R1', 'RIPv2', PAL.amber, t);
              drawPixelRouter(ctx, 320, 100, 'R2 (10M)', '2 hopy (VÍTĚZ)', PAL.amber, t);
              drawPixelRouter(ctx, 260, 235, 'R3 (10G)', '', PAL.slate, t);
              drawPixelRouter(ctx, 410, 235, 'R4 (10G)', '3 hopy', PAL.slate, t);
              drawPixelRouter(ctx, 530, 170, 'R5', 'Cíl', PAL.cyan, t);
              var px = p < 0.5 ? lerp(110, 320, p * 2) : lerp(320, 530, (p - 0.5) * 2);
              var py = p < 0.5 ? lerp(170, 100, p * 2) : lerp(100, 170, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'RIPv2', PAL.amber, 'UDP 520 • 2 hopy');
            }
          },
          {
            title: '2. RIP limit: 15 hopů (16 = nedosažitelné)',
            caption: 'Při výpadku linky RIP hlásí metriku 16 (nekonečno). Proti smyčkám chrání Split Horizon.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 180, { color: PAL.amber });
              drawPixelLink(ctx, 320, 180, 520, 180, { broken: true });
              drawPixelRouter(ctx, 120, 180, 'R1', 'Split Horizon', PAL.amber, t);
              drawPixelRouter(ctx, 320, 180, 'R2', 'Metrika -> 16', PAL.rose, t);
              drawPixelServer(ctx, 520, 180, 'SÍŤ B', 'NEDOSAŽITELNÁ', PAL.rose, t);
              drawPixelPacket(ctx, lerp(300, 140, p), 140, 'HOP=16', PAL.rose, 'Max RIP limit = 15');
            }
          },
          {
            title: '3. OSPF: Link-State & LSDB (IP protokol 89)',
            caption: 'OSPF routery si v Area 0 posílají LSA zprávy (224.0.0.5) a znají celou mapu sítě.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 140, 120, 320, 180, { color: PAL.emerald });
              drawPixelLink(ctx, 500, 120, 320, 180, { color: PAL.emerald });
              drawPixelLink(ctx, 140, 120, 500, 120, { color: PAL.emerald });
              drawPixelRouter(ctx, 140, 120, 'R1', 'Area 0', PAL.emerald, t);
              drawPixelRouter(ctx, 500, 120, 'R2', 'Area 0', PAL.emerald, t);
              drawPixelRouter(ctx, 320, 180, 'DR / R3', 'LSDB Sync', PAL.cyan, t);
              drawPixelPacket(ctx, lerp(140, 500, p), 100, 'LSA', PAL.emerald, 'IP proto 89 • 224.0.0.5');
            }
          },
          {
            title: '4. OSPF Dijkstra SPF: Rychlejší linka vyhrává',
            caption: 'OSPF počítá Cost podle šířky pásma: 10G cesta (Cost 2) porazí pomalou 10M (Cost 10).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 170, 320, 100, { color: PAL.slate, dashed: true });
              drawPixelLink(ctx, 320, 100, 530, 170, { color: PAL.slate, dashed: true });
              drawPixelLink(ctx, 110, 170, 260, 235, { color: PAL.emerald, width: 4 });
              drawPixelLink(ctx, 260, 235, 410, 235, { color: PAL.emerald, width: 4 });
              drawPixelLink(ctx, 410, 235, 530, 170, { color: PAL.emerald, width: 4 });
              drawPixelRouter(ctx, 110, 170, 'R1', 'SPF strom', PAL.emerald, t);
              drawPixelRouter(ctx, 320, 100, 'R2 (10M)', 'Cost = 10', PAL.slate, t);
              drawPixelRouter(ctx, 260, 235, 'R3 (10G)', 'Cost 1', PAL.emerald, t);
              drawPixelRouter(ctx, 410, 235, 'R4 (10G)', 'Cost 1', PAL.emerald, t);
              drawPixelRouter(ctx, 530, 170, 'R5', 'Cost celkem 3', PAL.emerald, t);
              var seg = p < 0.33 ? 0 : (p < 0.66 ? 1 : 2);
              var sp = seg === 0 ? p / 0.33 : (seg === 1 ? (p - 0.33) / 0.33 : (p - 0.66) / 0.34);
              var pts = [[110, 170], [260, 235], [410, 235], [530, 170]];
              drawPixelPacket(ctx, lerp(pts[seg][0], pts[seg + 1][0], sp), lerp(pts[seg][1], pts[seg + 1][1], sp), 'OSPF', PAL.emerald, 'Nejlepší Cost!');
            }
          }
        ];

      /* 4. routing-bgp */
      case 'routing-bgp':
        return [
          {
            title: '1. BGP-4 (TCP 179): Peering mezi Autonomními systémy',
            caption: 'Hraniční směrovače různých sítí (eBGP) si navážou TCP spojení na portu 179.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 150, 180, 490, 180, { color: PAL.emerald, width: 4 });
              drawPixelRouter(ctx, 150, 180, 'AS 64512', 'Firma eBGP', PAL.cyan, t);
              drawPixelRouter(ctx, 490, 180, 'AS 64515', 'ISP Peering', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(170, 470, p), 145, 'BGP OPEN', PAL.emerald, 'TCP 179 • KEEPALIVE');
            }
          },
          {
            title: '2. Path Vector: Prefix + seznam AS_PATH',
            caption: 'Každý AS přidá při předání trasy své číslo ASN do atributu AS_PATH.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 170, 320, 170, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 170, 530, 170, { color: PAL.emerald });
              drawPixelCloud(ctx, 110, 170, 'AS 64520', '203.0.113.0/24', PAL.amber);
              drawPixelCloud(ctx, 320, 170, 'AS 64515', 'Tranzit ISP', PAL.emerald);
              drawPixelRouter(ctx, 530, 170, 'AS 64512', 'Náš BGP', PAL.cyan, t);
              drawPixelPacket(ctx, lerp(130, 500, p), 130, 'UPDATE', PAL.cyan, 'AS_PATH: 64515 64520');
            }
          },
          {
            title: '3. Ochrana proti smyčkám: Vlastní ASN v AS_PATH',
            caption: 'Pokud router uvidí své vlastní číslo AS v došlém AS_PATH, trasu ihned zahodí.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 150, 180, 490, 180, { color: PAL.rose, dashed: true });
              drawPixelRouter(ctx, 150, 180, 'AS 64515', 'Inzeruje cestu', PAL.amber, t);
              drawPixelRouter(ctx, 490, 180, 'AS 64512', 'Detekuje 64512!', PAL.rose, t);
              drawPixelPacket(ctx, lerp(180, 430, p), 145, 'LOOP!', PAL.rose, 'AS_PATH: 64515 64512 -> DROP');
            }
          },
          {
            title: '4. Výběr nejlepší trasy: LOCAL_PREF & AS_PATH',
            caption: 'Před délkou AS_PATH má přednost politika administrátora (vyšší LOCAL_PREF vyhrává).',
            render: function (ctx) {
              drawInfoBox(ctx, 70, 60, 500, 198, 'BGP BEST PATH SELECTION (POŘADÍ PRAVIDEL)', [
                { text: '1. Největší LOCAL_PREF (odchozí politika naší sítě)', color: PAL.emerald, highlight: '#063326' },
                { text: '2. Nejkratší AS_PATH (nejméně tranzitních AS)', color: PAL.cyan },
                { text: '3. Nejnižší MED (doporučení sousednímu AS pro vstup)', color: PAL.amber },
                { text: '----------------------------------------------------', color: PAL.slate },
                { text: 'Trasa A: LP=200, AS_PATH [64515 64520] -> VYBRÁNO', color: PAL.emerald },
                { text: 'Trasa B: LP=100, AS_PATH [64518]       -> Záložní', color: PAL.slate }
              ], PAL.emerald);
            }
          }
        ];

      /* 5. dns-protocol */
      case 'dns-protocol':
        return [
          {
            title: '1. Rekurzivní dotaz klienta na Resolver (UDP 53)',
            caption: 'Klient pošle dotaz www.skola.cz rekurzivnímu resolveru (např. 1.1.1.1) na UDP 53.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 340, 180, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 340, 180, 530, 180, { color: PAL.slate, dashed: true });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'Cache MISS', PAL.cyan);
              drawPixelServer(ctx, 340, 180, 'RESOLVER', '1.1.1.1:53', PAL.amber, t);
              drawPixelCloud(ctx, 530, 180, 'HIERARCHIE', 'Root / TLD / NS', PAL.violet);
              drawPixelPacket(ctx, lerp(150, 320, p), 144, 'DNS ?', PAL.amber, 'UDP 53: www.skola.cz');
            }
          },
          {
            title: '2. Iterativní dotazy: Root (.) → TLD (.cz)',
            caption: 'Resolver se postupně ptá kořenového serveru (.) a následně správce domény .cz.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 105, { color: PAL.amber });
              drawPixelLink(ctx, 120, 180, 510, 180, { color: PAL.emerald });
              drawPixelServer(ctx, 120, 180, 'RESOLVER', 'Iteruje', PAL.cyan, t);
              drawPixelServer(ctx, 320, 105, 'ROOT (.)', '-> Zkus .cz', PAL.amber, t);
              drawPixelServer(ctx, 510, 180, 'TLD (.cz)', '-> ns1.skola.cz', PAL.emerald, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(135, 305, p * 2), lerp(168, 105, p * 2), 'ROOT .', PAL.amber, 'Kde je .cz?');
              } else {
                drawPixelPacket(ctx, lerp(140, 490, (p - 0.5) * 2), 165, 'TLD .cz', PAL.emerald, 'Kde je skola.cz?');
              }
            }
          },
          {
            title: '3. Autoritativní odpověď A & Uložení do Cache (TTL)',
            caption: 'Autoritativní server vrátí IPv4 adresu (A) s platností TTL; resolver ji uloží.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 180, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 320, 180, 520, 180, { color: PAL.emerald, width: 3 });
              drawPixelPC(ctx, 120, 180, 'KLIENT', '193.85.10.20', PAL.emerald);
              drawPixelServer(ctx, 320, 180, 'RESOLVER', 'TTL = 300s', PAL.amber, t);
              drawPixelServer(ctx, 520, 180, 'ns1.skola', 'Autoritativní', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(500, 140, p), 144, 'A RECORD', PAL.emerald, '193.85.10.20 (TTL 300s)');
            }
          },
          {
            title: '4. DNS záznamy & Zabezpečení (DNSSEC / DoH)',
            caption: 'Kromě A/AAAA nese DNS i MX pro poštu, CNAME, PTR, TXT. DNSSEC brání podvržení.',
            render: function (ctx) {
              drawInfoBox(ctx, 65, 58, 510, 204, 'KLÍČOVÉ DNS ZÁZNAMY & PROTOKOLY', [
                { text: 'A / AAAA : Doména -> IPv4 (32 b) / IPv6 (128 b)', color: PAL.cyan },
                { text: 'CNAME    : Alias domény na jiný kanonický název', color: PAL.white },
                { text: 'MX / TXT : Poštovní server (SMTP) / SPF, DKIM, DMARC', color: PAL.amber },
                { text: 'PTR / NS : Reverzní překlad IP -> jméno / DNS server', color: PAL.emerald },
                { text: 'UDP 53   : Běžné dotazy | TCP 53: Zónový přenos AXFR', color: PAL.slate },
                { text: 'DNSSEC   : Podpis zóny | DoT (853) / DoH (443): Šifrování', color: PAL.violet }
              ], PAL.amber);
            }
          }
        ];

      /* 6. dhcp-dora */
      case 'dhcp-dora':
        return [
          {
            title: '1. DORA (1–2): DISCOVER & OFFER (UDP 67/68)',
            caption: 'Klient bez IP vysílá broadcast Discover (:68 -> :67); server nabízí volnou IP (Offer).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.amber, width: 4 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', '0.0.0.0:68', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'DHCP SRV', '192.168.10.2:67', PAL.amber, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(150, 490, p * 2), 145, 'DISCOVER', PAL.cyan, 'Broadcast 255.255.255.255');
              } else {
                drawPixelPacket(ctx, lerp(490, 150, (p - 0.5) * 2), 145, 'OFFER', PAL.amber, 'Nabídka 192.168.10.50');
              }
            }
          },
          {
            title: '2. DORA (3–4): REQUEST & ACK + Volby (Options)',
            caption: 'Klient potvrdí výběr (Request) a server zapůjčí IP spolu s maskou, bránou a DNS.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', '192.168.10.50/24', PAL.emerald);
              drawPixelServer(ctx, 510, 180, 'DHCP SRV', 'Lease 24h', PAL.amber, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(150, 490, p * 2), 145, 'REQUEST', PAL.cyan, 'Beru 192.168.10.50');
              } else {
                drawPixelPacket(ctx, lerp(490, 150, (p - 0.5) * 2), 145, 'ACK', PAL.emerald, 'GW .1 | DNS 1.1.1.1');
              }
            }
          },
          {
            title: '3. DHCP Relay Agent (ip helper-address)',
            caption: 'Router nepropouští broadcasty, ale Relay je přepošle unicastem na centrální DHCP.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 100, 180, 320, 180, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 320, 180, 540, 180, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 100, 180, 'VLAN 10', 'Broadcast', PAL.cyan);
              drawPixelRouter(ctx, 320, 180, 'RELAY R1', 'ip helper-address', PAL.amber, t);
              drawPixelServer(ctx, 540, 180, 'DHCP VLAN 99', '10.99.0.10', PAL.emerald, t);
              if (p < 0.45) {
                drawPixelPacket(ctx, lerp(120, 300, p / 0.45), 145, 'DISCOVER', PAL.amber, 'L2 Broadcast');
              } else {
                drawPixelPacket(ctx, lerp(340, 520, (p - 0.45) / 0.55), 145, 'RELAY', PAL.emerald, 'L3 Unicast -> 10.99.0.10');
              }
            }
          },
          {
            title: '4. Časovače pronájmu: T1 (50 %) a T2 (87,5 %)',
            caption: 'V polovině pronájmu klient žádá o prodloužení (T1), v 87,5 % hledá jakýkoli DHCP (T2).',
            render: function (ctx, p) {
              drawInfoBox(ctx, 65, 64, 510, 192, 'ŽIVOTNÍ CYKLUS DHCP PRONÁJMU (LEASE TIME)', [
                { text: '0 %     : DORA dokončena (IP adresa přidělena)', color: PAL.emerald },
                { text: '50 % T1 : Unicast RENEW na původní DHCP server', color: PAL.cyan, highlight: p > 0.35 && p < 0.65 ? '#0c2d48' : null },
                { text: '87,5% T2: Broadcast REBIND na jakýkoli dostupný DHCP', color: PAL.amber, highlight: p >= 0.65 && p < 0.9 ? '#3a2207' : null },
                { text: '100 %   : Vypršení pronájmu -> uvolnění IP / APIPA', color: PAL.rose, highlight: p >= 0.9 ? '#450a18' : null },
                { text: '---------------------------------------------------', color: PAL.slate },
                { text: 'Volby: Opt 3 (Router) | Opt 6 (DNS) | Opt 15 (Doména)', color: PAL.white }
              ], PAL.amber);
            }
          }
        ];

      /* 7. ntp-time */
      case 'ntp-time':
        return [
          {
            title: '1. Hierarchie NTP: Stratum 0 až Stratum 3',
            caption: 'Čas se šíří po UDP 123 od atomových/GPS hodin (Stratum 0) níže; Stratum 16 = chyba.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 110, 175, 250, 175, { color: PAL.amber });
              drawPixelLink(ctx, 250, 175, 390, 175, { color: PAL.emerald });
              drawPixelLink(ctx, 390, 175, 530, 175, { color: PAL.cyan });
              drawPixelClock(ctx, 110, 175, 'STRATUM 0', 'GPS / Atom', PAL.amber, t);
              drawPixelServer(ctx, 250, 175, 'STRATUM 1', 'Primární NTP', PAL.emerald, t);
              drawPixelServer(ctx, 390, 175, 'STRATUM 2', 'Firemní NTP', PAL.cyan, t);
              drawPixelPC(ctx, 530, 175, 'STRATUM 3', 'Stanice/Server', PAL.white);
              drawPixelPacket(ctx, lerp(130, 510, p), 125, 'NTP 123', PAL.amber, 'UDP port 123');
            }
          },
          {
            title: '2. Výměna 4 časových značek T1, T2, T3, T4',
            caption: 'Klient zapíše čas odeslání T1 a návratu T4; server přidá čas příjmu T2 a odeslání T3.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.cyan, width: 4 });
              drawPixelPC(ctx, 135, 180, 'KLIENT', 'T1=10.000 | T4=10.044', PAL.cyan);
              drawPixelClock(ctx, 505, 180, 'NTP SRV', 'T2=10.025 | T3=10.027', PAL.amber, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(160, 480, p * 2), 142, 'T1 -> T2', PAL.cyan, 'Dotaz klienta');
              } else {
                drawPixelPacket(ctx, lerp(480, 160, (p - 0.5) * 2), 142, 'T3 -> T4', PAL.amber, 'Odpověď serveru');
              }
            }
          },
          {
            title: '3. Výpočet zpoždění (delta RTT) a posunu (theta)',
            caption: 'NTP odečte síťové zpoždění (RTT) a určí přesný časový posun místních hodin.',
            render: function (ctx) {
              drawInfoBox(ctx, 75, 62, 490, 196, 'MATEMATIKA NTP SYNCHRONIZACE (T1–T4)', [
                { text: 'RTT (delta) = (T4 - T1) - (T3 - T2)', color: PAL.cyan },
                { text: 'Offset (theta) = ((T2 - T1) + (T3 - T4)) / 2', color: PAL.emerald, highlight: '#063326' },
                { text: '---------------------------------------------------', color: PAL.slate },
                { text: 'Příklad: T1=0ms, T2=25ms, T3=27ms, T4=44ms', color: PAL.white },
                { text: '-> delta (RTT) = 44 - 2 = 42 ms (21 ms jedním směrem)', color: PAL.amber },
                { text: '-> theta       = (+25 + -17) / 2 = +4 ms (zpožděno)', color: PAL.emerald }
              ], PAL.amber);
            }
          },
          {
            title: '4. Bez přesného času selžou TLS, Kerberos i logy',
            caption: 'chrony/ntpd udržují plynulý čas (slewing) pro certifikáty, Active Directory i SIEM.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 320, 180, { color: PAL.emerald });
              drawPixelLink(ctx, 320, 180, 510, 180, { color: PAL.cyan });
              drawPixelClock(ctx, 130, 180, 'CHRONYD', 'UTC ±0.2 ms', PAL.emerald, t);
              drawPixelServer(ctx, 320, 180, 'KERBEROS', 'Max skew 5 min', PAL.amber, t);
              drawPixelServer(ctx, 510, 180, 'TLS / SIEM', 'Validní logy', PAL.cyan, t);
              drawPixelLock(ctx, 320, 108, true, PAL.emerald);
              drawPixelPacket(ctx, lerp(150, 490, p), 146, 'UTC OK', PAL.emerald);
            }
          }
        ];

      /* 8. http-versions */
      case 'http-versions':
        return [
          {
            title: '1. HTTP Request & Response (TCP port 80)',
            caption: 'Bezestavový textový model: prohlížeč pošle metodu (GET/POST), server vrátí stavový kód.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.violet, width: 4 });
              drawPixelPC(ctx, 135, 180, 'PROHLÍŽEČ', 'Metody + Hlavičky', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'WEB SERVER', 'TCP 80', PAL.violet, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(160, 480, p * 2), 145, 'GET /', PAL.cyan, 'Host: web.cz');
              } else {
                drawPixelPacket(ctx, lerp(480, 160, (p - 0.5) * 2), 145, '200 OK', PAL.emerald, 'Content-Type: text/html');
              }
            }
          },
          {
            title: '2. HTTP/1.1: Fronta v TCP (Head-of-Line Blocking)',
            caption: 'V jednom TCP spojení musí další požadavek čekat, dokud nedorazí předchozí odpověď.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.amber, width: 4 });
              drawPixelPC(ctx, 135, 180, 'KLIENT', 'Keep-Alive', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'HTTP/1.1', 'Textové hlavičky', PAL.amber, t);
              drawPixelPacket(ctx, lerp(260, 460, p), 152, '1. IMG', PAL.rose, 'HoL BLOCKING!');
              drawPixelPacket(ctx, 200, 152, '2. CSS', PAL.slate);
              drawBadge(ctx, 320, 224, 'Další soubory čekají ve frontě na TCP spojení', '#291a05', PAL.amber, PAL.amber);
            }
          },
          {
            title: '3. HTTP/2: Binární rámce, Multiplexing & HPACK',
            caption: 'Jediné TCP spojení nese více paralelních streamů najednou a komprimuje hlavičky.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.emerald, width: 6 });
              drawPixelPC(ctx, 135, 180, 'KLIENT', 'Multiplexing', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'HTTP/2', 'Binární rámce', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(160, 480, p), 142, 'STR-1', PAL.emerald, 'HPACK komprese');
              drawPixelPacket(ctx, lerp(160, 480, (p + 0.35) % 1), 178, 'STR-2', PAL.cyan);
              drawPixelPacket(ctx, lerp(160, 480, (p + 0.7) % 1), 214, 'STR-3', PAL.violet);
            }
          },
          {
            title: '4. HTTP/3: Protokol QUIC nad UDP (Port 443)',
            caption: 'QUIC odstraňuje i TCP HoL blocking: ztráta paketu zpomalí jen jeden UDP stream.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 145, 505, 145, { color: PAL.cyan, dashed: true });
              drawPixelLink(ctx, 135, 185, 505, 185, { color: PAL.rose, broken: true });
              drawPixelLink(ctx, 135, 225, 505, 225, { color: PAL.emerald, dashed: true });
              drawPixelPC(ctx, 135, 185, 'KLIENT', '0-RTT QUIC', PAL.cyan);
              drawPixelServer(ctx, 505, 185, 'HTTP/3', 'UDP 443 + TLS 1.3', PAL.violet, t);
              drawPixelPacket(ctx, lerp(165, 475, p), 145, 'QUIC 1', PAL.cyan, 'Stream 1 nezávislý!');
              drawPixelPacket(ctx, lerp(165, 475, (p + 0.4) % 1), 225, 'QUIC 3', PAL.emerald);
            }
          }
        ];

      /* 9. https-tls */
      case 'https-tls':
        return [
          {
            title: '1. TLS 1.3 ClientHello (SNI, ALPN & ECDHE klíč)',
            caption: 'Klient pošle podporované šifry, název domény (SNI) a svůj veřejný ECDHE podíl klíče.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.violet, width: 4 });
              drawPixelPC(ctx, 135, 180, 'PROHLÍŽEČ', 'TCP 443', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'HTTPS SRV', 'SNI: banka.cz', PAL.violet, t);
              drawPixelPacket(ctx, lerp(160, 480, p), 145, 'ClientHello', PAL.cyan, 'ECDHE key_share + ALPN');
            }
          },
          {
            title: '2. ServerHello + Certifikát X.509 + Ověření CA',
            caption: 'Server odešle certifikát X.509 a svůj klíč. Prohlížeč ověří podpis u důvěryhodné CA.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.amber, width: 3 });
              drawPixelPC(ctx, 135, 180, 'KLIENT', 'Ověřuje CA + SAN', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'SERVER', 'X.509 Cert', PAL.amber, t);
              drawPixelPacket(ctx, lerp(480, 160, p), 145, 'CERT X.509', PAL.amber, 'ServerHello + Finished');
            }
          },
          {
            title: '3. Forward Secrecy (ECDHE) & Symetrický AES-GCM tunel',
            caption: 'Obě strany odvodí dočasný symetrický klíč (AES-GCM/ChaCha20) pro rychlý šifrovaný přenos.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.emerald, width: 6 });
              drawPixelPC(ctx, 135, 180, 'KLIENT', 'Session Key', PAL.emerald);
              drawPixelServer(ctx, 505, 180, 'HTTPS SRV', 'AES-256-GCM', PAL.emerald, t);
              drawPixelLock(ctx, 320, 112, true, PAL.emerald);
              drawPixelPacket(ctx, lerp(160, 480, p), 180, 'TLS DATA', PAL.emerald, 'Důvěrnost + Integrita');
            }
          },
          {
            title: '4. HSTS & Obrana proti podvrženému certifikátu',
            caption: 'Expirovaný certifikát nebo cizí CN/SAN prohlížeč zablokuje; HSTS vynucuje HTTPS.',
            render: function (ctx) {
              drawInfoBox(ctx, 70, 62, 500, 196, 'BEZPEČNOSTNÍ VERDIKT X.509 & TLS 1.3', [
                { text: '1. Podpis řetězce CA (Root -> Intermediate -> Leaf)', color: PAL.emerald },
                { text: '2. Shoda domény v SAN (Subject Alternative Name)', color: PAL.cyan },
                { text: '3. Platnost NotBefore / NotAfter (vyžaduje přesný NTP!)', color: PAL.amber },
                { text: '---------------------------------------------------', color: PAL.slate },
                { text: 'TLS 1.3 : Jen 1-RTT handshake, povinné Forward Secrecy', color: PAL.emerald },
                { text: 'Chyba   : Neplatná CA / jiná doména -> ZABLOKOVÁNO!', color: PAL.rose }
              ], PAL.violet);
            }
          }
        ];

      /* 10. mail-smtp-imap-pop3 */
      case 'mail-smtp-imap-pop3':
        return [
          {
            title: '1. Odeslání pošty: Klient (MUA) → SMTP 587 STARTTLS',
            caption: 'Poštovní klient ověří heslo a odešle zprávu na svůj odesílací server (Submission 587).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 350, 180, { color: PAL.cyan, width: 4 });
              drawPixelLink(ctx, 350, 180, 520, 180, { color: PAL.slate, dashed: true });
              drawPixelPC(ctx, 130, 180, 'MUA KLIENT', 'Thunderbird', PAL.cyan);
              drawPixelServer(ctx, 350, 180, 'ODESÍLACÍ MTA', 'Port 587 + TLS', PAL.violet, t);
              drawPixelServer(ctx, 520, 180, 'CÍLOVÝ MX', 'Port 25', PAL.amber, t);
              drawPixelPacket(ctx, lerp(150, 330, p), 144, 'SMTP 587', PAL.cyan, 'AUTH + STARTTLS');
            }
          },
          {
            title: '2. DNS MX dotaz & SMTP přenos mezi servery (Port 25)',
            caption: 'Odesílající MTA najde v DNS záznam MX cílové domény a doručí e-mail na TCP 25.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 110, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 120, 180, 520, 180, { color: PAL.emerald, width: 4 });
              drawPixelServer(ctx, 120, 180, 'MTA ODESÍL.', 'Hledá MX cil.cz', PAL.violet, t);
              drawPixelServer(ctx, 320, 110, 'DNS MX', '10 mx.cil.cz', PAL.amber, t);
              drawPixelServer(ctx, 520, 180, 'mx.cil.cz', 'TCP 25 STARTTLS', PAL.emerald, t);
              if (p < 0.45) {
                drawPixelPacket(ctx, lerp(140, 300, p / 0.45), lerp(165, 115, p / 0.45), 'DNS MX?', PAL.amber);
              } else {
                drawPixelPacket(ctx, lerp(145, 500, (p - 0.45) / 0.55), 165, 'SMTP 25', PAL.emerald, 'Server -> Server');
              }
            }
          },
          {
            title: '3. Výběr schránky: IMAP (993) vs. POP3 (995)',
            caption: 'IMAP udržuje složky synchronizované na serveru pro více zařízení; POP3 poštu stáhne.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 125, 320, 180, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 130, 230, 320, 180, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 320, 180, 520, 180, { color: PAL.amber, dashed: true });
              drawPixelPC(ctx, 130, 125, 'NOTEBOOK', 'IMAP4 TLS 993', PAL.emerald);
              drawPixelPC(ctx, 130, 230, 'TELEFON', 'Synchronizace', PAL.emerald);
              drawPixelServer(ctx, 320, 180, 'SCHRÁNKA', 'Složky na serveru', PAL.cyan, t);
              drawPixelPC(ctx, 520, 180, 'POP3 KLIENT', '995: Stáhnout+Smazat', PAL.amber);
              drawPixelPacket(ctx, lerp(300, 150, p), lerp(180, 125, p), 'IMAP 993', PAL.emerald);
              drawPixelPacket(ctx, lerp(340, 500, p), 180, 'POP3 995', PAL.amber);
            }
          },
          {
            title: '4. Ochrana proti phishingu: SPF, DKIM a DMARC',
            caption: 'Trojice DNS záznamů ověřuje oprávněnou IP odesílatele, digitální podpis i politiku.',
            render: function (ctx) {
              drawInfoBox(ctx, 68, 60, 504, 198, 'AUTENTIZACE E-MAILŮ (OCHRANA PROTI SPOOFINGU)', [
                { text: 'SPF   : DNS TXT seznam IP adres povolených k odesílání', color: PAL.cyan },
                { text: 'DKIM  : Kryptografický podpis hlaviček a těla zprávy', color: PAL.emerald },
                { text: 'DMARC : Spojuje SPF + DKIM a říká, zda falešný mail', color: PAL.amber },
                { text: '        pustit (none), dát do spamu (quarantine) či odmítnout (reject)', color: PAL.amber },
                { text: '----------------------------------------------------------', color: PAL.slate },
                { text: 'Porty: 25 (MTA-MTA) | 587 (MUA+STARTTLS) | 993 (IMAPS)', color: PAL.white }
              ], PAL.violet);
            }
          }
        ];

      /* 11. ftp-active-passive-ftps */
      case 'ftp-active-passive-ftps':
        return [
          {
            title: '1. FTP: Dva oddělené TCP kanály (Řídicí 21 + Datový)',
            caption: 'Na rozdíl od HTTP používá FTP samostatný řídicí kanál (TCP 21) a oddělený kanál pro soubory.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 150, 510, 150, { color: PAL.cyan, width: 3 });
              drawPixelLink(ctx, 130, 210, 510, 210, { color: PAL.emerald, width: 3, dashed: true });
              drawPixelPC(ctx, 130, 180, 'FTP KLIENT', 'Příkazy + Data', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'FTP SERVER', 'Ctrl:21 / Data', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(155, 485, p), 140, 'CTRL 21', PAL.cyan, 'USER / PASS / LIST');
              drawPixelPacket(ctx, lerp(485, 155, p), 215, 'DATA', PAL.emerald, 'Soubor data.zip');
            }
          },
          {
            title: '2. Aktivní režim (PORT): Problém za NAT/Firewallem',
            caption: 'Klient pošle PORT; server se z portu 20 připojuje ZPĚT ke klientovi – firewall to zablokuje!',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 115, 150, 320, 150, { color: PAL.cyan });
              drawPixelLink(ctx, 320, 150, 525, 150, { color: PAL.cyan });
              drawPixelLink(ctx, 525, 210, 320, 210, { color: PAL.rose, width: 3 });
              drawPixelLink(ctx, 320, 210, 115, 210, { broken: true });
              drawPixelPC(ctx, 115, 180, 'KLIENT', 'Privátní IP + NAT', PAL.cyan);
              drawPixelFirewall(ctx, 320, 180, 'NAT / FW', 'Blokuje příchozí!', PAL.rose, t);
              drawPixelServer(ctx, 525, 180, 'FTP SRV', 'Zdrojový port 20', PAL.amber, t);
              if (p < 0.45) {
                drawPixelPacket(ctx, lerp(140, 500, p / 0.45), 140, 'PORT', PAL.cyan, 'TCP 21: Zpět na mě!');
              } else {
                drawPixelPacket(ctx, lerp(500, 345, (p - 0.45) / 0.55), 210, 'PORT 20', PAL.rose, 'BLOCKED BY FW!');
              }
            }
          },
          {
            title: '3. Pasivní režim (PASV/EPSV): Průchod přes NAT',
            caption: 'Klient pošle PASV, server otevře datový port (>1023) a klient otevírá OBA spoje ven.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 115, 150, 525, 150, { color: PAL.cyan, width: 3 });
              drawPixelLink(ctx, 115, 210, 525, 210, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 115, 180, 'KLIENT', 'Otevírá oba směry', PAL.emerald);
              drawPixelFirewall(ctx, 320, 180, 'NAT / FW', 'Odchozí POVOLENO', PAL.emerald, t);
              drawPixelServer(ctx, 525, 180, 'FTP SRV', 'Otevře :50120', PAL.emerald, t);
              if (p < 0.45) {
                drawPixelPacket(ctx, lerp(500, 140, p / 0.45), 140, '227 PASV', PAL.cyan, 'Připoj se na :50120');
              } else {
                drawPixelPacket(ctx, lerp(140, 500, (p - 0.45) / 0.55), 210, 'PASV OK', PAL.emerald, 'TCP -> :50120 přes NAT');
              }
            }
          },
          {
            title: '4. FTPS: Explicit (Port 21 + AUTH TLS) vs. Implicit (990)',
            caption: 'Čisté FTP je v plain-textu. FTPS přidává TLS šifrování nad řídicím i datovým kanálem.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.emerald, width: 6 });
              drawPixelPC(ctx, 130, 180, 'FTPS KLIENT', 'TLS + PASV (PROT P)', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'FTPS SRV', '21 AUTH TLS / 990', PAL.emerald, t);
              drawPixelLock(ctx, 320, 108, true, PAL.emerald);
              drawPixelPacket(ctx, lerp(155, 485, p), 180, 'AUTH TLS', PAL.emerald, 'Šifrované heslo i data');
            }
          }
        ];

      /* 12. samba-smb */
      case 'samba-smb':
        return [
          {
            title: '1. Samba / SMB: Sdílení souborů přes TCP port 445',
            caption: 'Moderní SMB2/SMB3 běží přímo nad TCP 445 (nahradilo staré NetBIOS porty 137–139).',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.cyan, width: 4 });
              drawPixelPC(ctx, 135, 180, 'WIN / LINUX', '\\\\srv\\projekty', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'SAMBA (smbd)', 'TCP 445', PAL.amber, t);
              drawPixelPacket(ctx, lerp(160, 480, p), 145, 'SMB 445', PAL.cyan, 'TREE_CONNECT');
            }
          },
          {
            title: '2. Ověřování: NTLMv2 vs. Kerberos & ACL oprávnění',
            caption: 'Samba spojuje síťové sdílení (smb.conf) s lokálními POSIX oprávněními souborů.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 320, 115, { color: PAL.amber, dashed: true });
              drawPixelLink(ctx, 120, 180, 520, 180, { color: PAL.emerald, width: 4 });
              drawPixelPC(ctx, 120, 180, 'KLIENT', 'Uživatel Jan', PAL.cyan);
              drawPixelServer(ctx, 320, 115, 'AD / KDC', 'Kerberos (88)', PAL.amber, t);
              drawPixelServer(ctx, 520, 180, 'SAMBA', 'smb.conf + POSIX', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(145, 495, p), 162, 'KERBEROS', PAL.emerald, 'Ticket + NTLMv2');
            }
          },
          {
            title: '3. Zastaralé SMBv1 (WannaCry) vs. SMBv3 (AES Šifrování)',
            caption: 'SMBv1 je nutné zakázat (ransomware EternalBlue). SMBv3 podporuje AES šifrování a podpisy.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 130, 505, 130, { broken: true });
              drawPixelLink(ctx, 135, 220, 505, 220, { color: PAL.emerald, width: 5 });
              drawPixelPC(ctx, 135, 175, 'KLIENT', 'Dialekt vyjednání', PAL.cyan);
              drawPixelServer(ctx, 505, 175, 'SAMBA', 'min protocol = SMB2', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(165, 300, p), 120, 'SMBv1', PAL.rose, 'ZAKÁZÁNO (WannaCry)');
              drawPixelPacket(ctx, lerp(165, 475, p), 215, 'SMB3', PAL.emerald, 'AES-GCM Šifrováno');
            }
          },
          {
            title: '4. Klienti v praxi: smbclient, mount -t cifs & NFS',
            caption: 'Samba propojuje Windows s Linuxem; v čistě linuxových sítích se používá i NFS (2049).',
            render: function (ctx) {
              drawInfoBox(ctx, 68, 60, 504, 198, 'PRAXE SAMBA / SMB3 & POROVNÁNÍ S NFS', [
                { text: '/etc/samba/smb.conf : Nastavení sdílení, valid users', color: PAL.cyan },
                { text: 'smbclient //srv/data -U jan : Interaktivní test přístupu', color: PAL.emerald },
                { text: 'mount -t cifs //srv/data /mnt : Připojení v Linuxu', color: PAL.white },
                { text: '--------------------------------------------------------', color: PAL.slate },
                { text: 'SMB3 (TCP 445)  : Windows + Linux, šifrování + NTLM/Kerb', color: PAL.amber },
                { text: 'NFSv4 (TCP 2049): Primárně Linux/UNIX export adresářů', color: PAL.violet }
              ], PAL.cyan);
            }
          }
        ];

      /* 13. ssh-telnet-sftp */
      case 'ssh-telnet-sftp':
        return [
          {
            title: '1. Telnet (TCP 23): Nebezpečný plain-text v síti',
            caption: 'Telnet nic nešifruje – útočník se snifferem přečte uživatelské jméno, heslo i příkazy.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 520, 180, { color: PAL.rose, width: 3 });
              drawPixelPC(ctx, 120, 180, 'ADMIN', 'telnet 10.0.0.1', PAL.cyan);
              drawPixelServer(ctx, 320, 105, 'SNIFFER', 'ČTE HESLO!', PAL.rose, t);
              drawPixelLink(ctx, 320, 130, 320, 180, { color: PAL.rose, dashed: true });
              drawPixelRouter(ctx, 520, 180, 'SWITCH', 'TCP 23 Open', PAL.rose, t);
              drawPixelLock(ctx, 320, 224, false, PAL.rose);
              drawPixelPacket(ctx, lerp(145, 495, p), 165, 'TELNET', PAL.rose, 'PASS: Tajne123!');
            }
          },
          {
            title: '2. SSH-2 (TCP 22): Ověření otisku Host Key & Šifrování',
            caption: 'SSH šifruje celý kanál a při prvním připojení ověří identitu serveru proti MITM.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 520, 180, { color: PAL.emerald, width: 6 });
              drawPixelPC(ctx, 120, 180, 'ADMIN', 'ssh admin@srv', PAL.cyan);
              drawPixelServer(ctx, 320, 105, 'SNIFFER', 'Vidí jen šum', PAL.slate, t);
              drawPixelRouter(ctx, 520, 180, 'SERVER', 'TCP 22 SSH-2', PAL.emerald, t);
              drawPixelLock(ctx, 320, 224, true, PAL.emerald);
              drawPixelPacket(ctx, lerp(145, 495, p), 165, 'SSH 22', PAL.emerald, 'Host Key SHA256 OK');
            }
          },
          {
            title: '3. Autentizace klíčem ed25519 & Port Forwarding',
            caption: 'Privátní klíč nikdy neopustí klienta; server ověří podpis veřejným klíčem v authorized_keys.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 130, 180, 510, 180, { color: PAL.cyan, width: 4 });
              drawPixelPC(ctx, 130, 180, 'KLIENT', 'id_ed25519', PAL.cyan);
              drawPixelServer(ctx, 510, 180, 'SSH SERVER', 'authorized_keys', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(155, 485, p), 145, 'ED25519', PAL.cyan, 'Podpis + Tunel -L');
            }
          },
          {
            title: '4. SFTP (TCP 22): Bezpečný přenos přes 1 port firewallu',
            caption: 'SFTP běží jako subsystém uvnitř SSH (TCP 22) – firewallu stačí otevřít jediný port.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 115, 180, 525, 180, { color: PAL.emerald, width: 5 });
              drawPixelPC(ctx, 115, 180, 'SFTP KLIENT', 'sftp user@srv', PAL.cyan);
              drawPixelFirewall(ctx, 320, 180, 'FIREWALL', 'Povoleno jen :22', PAL.emerald, t);
              drawPixelServer(ctx, 525, 180, 'SSHD', 'Subsystém SFTP', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(140, 500, p), 144, 'SFTP', PAL.emerald, 'TCP 22 (1 port, žádné PASV!)');
            }
          }
        ];

      /* 14. rdp-vnc */
      case 'rdp-vnc':
        return [
          {
            title: '1. Microsoft RDP (3389): Vektorové vykreslování (GDI)',
            caption: 'RDP nepřenáší surové pixely, ale grafické instrukce (okna, písma) – šetří pásmo.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.cyan, width: 4 });
              drawPixelPC(ctx, 135, 180, 'RDP KLIENT', 'Vykresluje GDI', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'WIN SERVER', 'TCP/UDP 3389', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(485, 155, p), 145, 'RDP 3389', PAL.cyan, 'Vektor + Písmo (~150 kbps)');
            }
          },
          {
            title: '2. RDP: NLA (Network Level Auth) + Přesměrování',
            caption: 'NLA ověří uživatele přes TLS ještě před startem plochy; podporuje i více relací najednou.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.emerald, width: 5 });
              drawPixelPC(ctx, 135, 180, 'KLIENT', 'Schránka/Tisk/Zvuk', PAL.emerald);
              drawPixelServer(ctx, 505, 180, 'WIN SERVER', 'Multi-session', PAL.emerald, t);
              drawPixelLock(ctx, 320, 112, true, PAL.emerald);
              drawPixelPacket(ctx, lerp(160, 480, p), 180, 'NLA+TLS', PAL.emerald, 'Ověření před relací');
            }
          },
          {
            title: '3. VNC / RFB (TCP 5900+N): Rastrové obdélníky pixelů',
            caption: 'VNC přenáší rastrové snímky existující plochy – funguje napříč OS, ale žere více dat.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.amber, width: 5 });
              drawPixelPC(ctx, 135, 180, 'VNC VIEWER', 'Sdílí displej :1', PAL.amber);
              drawPixelServer(ctx, 505, 180, 'LINUX / MAC', 'TCP 5901 (RFB)', PAL.amber, t);
              drawPixelPacket(ctx, lerp(485, 155, p), 145, 'VNC 5901', PAL.amber, 'Rastrové pixely (~3 Mbps)');
            }
          },
          {
            title: '4. Bezpečný VNC přes SSH Tunel (-L 5901:127.0.0.1:5901)',
            caption: 'Samotné VNC (RFB) má slabé šifrování – v praxi se vždy balí do SSH nebo VPN tunelu.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 180, 520, 180, { color: PAL.emerald, width: 6 });
              drawPixelPC(ctx, 120, 180, 'VNC -> :5901', 'Lokální tunel', PAL.cyan);
              drawPixelFirewall(ctx, 320, 180, 'SSH TUNEL', 'Port 22 šifruje VNC', PAL.emerald, t);
              drawPixelServer(ctx, 520, 180, 'VNC SERVER', 'Listen 127.0.0.1', PAL.emerald, t);
              drawPixelLock(ctx, 320, 108, true, PAL.emerald);
              drawPixelPacket(ctx, lerp(145, 495, p), 144, 'SSH+RFB', PAL.emerald, 'Bezpečný VNC provoz');
            }
          }
        ];

      /* 15. snmp-syslog */
      case 'snmp-syslog':
        return [
          {
            title: '1. SNMP GET / WALK (UDP 161): Dohledová stanice → Agent',
            caption: 'NMS se ptá agenta na hodnoty ze stromu MIB podle číselného identifikátoru OID.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.cyan, width: 4 });
              drawPixelServer(ctx, 135, 180, 'NMS DOHLED', 'snmpwalk (UDP 161)', PAL.cyan, t);
              drawPixelRouter(ctx, 505, 180, 'AGENT (R1)', 'MIB / OID strom', PAL.emerald, t);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(160, 480, p * 2), 144, 'GET OID', PAL.cyan, '.1.3.6.1.2.1.1.3 (Uptime)');
              } else {
                drawPixelPacket(ctx, lerp(480, 160, (p - 0.5) * 2), 144, 'RESPONSE', PAL.emerald, '42 dní 06:15');
              }
            }
          },
          {
            title: '2. SNMP TRAP (UDP 162): Okamžité varování při poruše',
            caption: 'Agent nečeká na dotaz a sám okamžitě pošle TRAP zprávu při pádu rozhraní.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.rose, width: 4 });
              drawPixelServer(ctx, 135, 180, 'NMS DOHLED', 'Poslouchá UDP 162', PAL.amber, t);
              drawPixelRouter(ctx, 505, 180, 'SWITCH', 'Port eth0 DOWN!', PAL.rose, t);
              drawPixelPacket(ctx, lerp(485, 155, p), 144, 'TRAP 162', PAL.rose, 'LinkDown Alert!');
            }
          },
          {
            title: '3. SNMPv2c (Heslo v plain-textu) vs. SNMPv3 (authPriv)',
            caption: 'v1/v2c posílají community string "public" nešifrovaně; SNMPv3 používá SHA + AES.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 130, 505, 130, { color: PAL.rose, dashed: true });
              drawPixelLink(ctx, 135, 220, 505, 220, { color: PAL.emerald, width: 5 });
              drawPixelServer(ctx, 135, 175, 'NMS', 'Porovnání verzí', PAL.cyan, t);
              drawPixelRouter(ctx, 505, 175, 'AGENT', 'SNMPv3 authPriv', PAL.emerald, t);
              drawPixelPacket(ctx, lerp(165, 475, p), 120, 'v2c', PAL.rose, 'community: "public"!');
              drawPixelPacket(ctx, lerp(165, 475, p), 215, 'SNMPv3', PAL.emerald, 'SHA-256 + AES-128');
            }
          },
          {
            title: '4. Centralizovaný Syslog (UDP 514 vs. TLS 6514)',
            caption: 'Všechna zařízení posílají logy se závažností 0–7 (Emergency–Debug) na jeden server.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 120, 120, 510, 180, { color: PAL.amber });
              drawPixelLink(ctx, 120, 230, 510, 180, { color: PAL.emerald, width: 4 });
              drawPixelRouter(ctx, 120, 120, 'FIREWALL', 'Sev 3 (Error)', PAL.amber, t);
              drawPixelServer(ctx, 120, 230, 'LINUX SRV', 'rsyslog TLS 6514', PAL.emerald, t);
              drawPixelServer(ctx, 510, 180, 'SYSLOG / SIEM', 'Centrální sběr', PAL.cyan, t);
              drawPixelPacket(ctx, lerp(145, 485, p), lerp(125, 172, p), 'UDP 514', PAL.amber);
              drawPixelPacket(ctx, lerp(145, 485, p), lerp(225, 186, p), 'TLS 6514', PAL.emerald, 'Šifrované logy');
            }
          }
        ];

      /* 16. sip-rtp-mqtt */
      case 'sip-rtp-mqtt':
        return [
          {
            title: '1. VoIP Signalizace SIP (UDP/TCP 5060, TLS 5061)',
            caption: 'SIP naváže, upraví a ukončí hovor (INVITE → 180 Ringing → 200 OK → ACK), hlas ale nenese.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 115, 180, 320, 115, { color: PAL.cyan, width: 3 });
              drawPixelLink(ctx, 320, 115, 525, 180, { color: PAL.cyan, width: 3 });
              drawPixelPC(ctx, 115, 180, 'TELEFON A', 'sip:jana@firma.cz', PAL.cyan);
              drawPixelServer(ctx, 320, 115, 'SIP PROXY', 'Port 5060 / 5061', PAL.violet, t);
              drawPixelPC(ctx, 525, 180, 'TELEFON B', '200 OK / ACK', PAL.emerald);
              var px = p < 0.5 ? lerp(135, 320, p * 2) : lerp(320, 505, (p - 0.5) * 2);
              var py = p < 0.5 ? lerp(170, 115, p * 2) : lerp(115, 170, (p - 0.5) * 2);
              drawPixelPacket(ctx, px, py, 'SIP INVITE', PAL.cyan, 'Signalizace hovoru');
            }
          },
          {
            title: '2. VoIP Média RTP (UDP): Hlas bez zdržování',
            caption: 'Po navázání hovoru proudí hlas přímo po UDP (RTP) – ztracený paket se znovu neposílá.',
            render: function (ctx, p) {
              drawPixelLink(ctx, 125, 180, 515, 180, { color: PAL.emerald, width: 4, dashed: true });
              drawPixelPC(ctx, 125, 180, 'TELEFON A', 'Kodek Opus/G.711', PAL.emerald);
              drawPixelPC(ctx, 515, 180, 'TELEFON B', 'Jitter Buffer', PAL.emerald);
              drawPixelPacket(ctx, lerp(155, 485, p), 145, 'RTP UDP', PAL.emerald, 'Přímý hlas (20ms rámce)');
              drawPixelPacket(ctx, lerp(485, 155, p), 210, 'RTP UDP', PAL.cyan);
            }
          },
          {
            title: '3. WebSocket (ws:// 80 / wss:// 443): Plný duplex',
            caption: 'Z HTTP požadavku se přes Upgrade (101) stane trvalý obousměrný kanál pro chaty a data.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 135, 180, 505, 180, { color: PAL.violet, width: 5 });
              drawPixelPC(ctx, 135, 180, 'PROHLÍŽEČ', 'wss:// (TLS 443)', PAL.cyan);
              drawPixelServer(ctx, 505, 180, 'WS SERVER', '101 Switching', PAL.violet, t);
              drawPixelPacket(ctx, lerp(160, 480, p), 145, 'WS UP', PAL.cyan, 'Plný duplex');
              drawPixelPacket(ctx, lerp(480, 160, p), 210, 'WS PUSH', PAL.violet, 'Server push v reálném čase');
            }
          },
          {
            title: '4. IoT protokol MQTT (TCP 1883 / TLS 8883): Publish/Subscribe',
            caption: 'Senzor publikuje zprávu (PUB) s tématem na Broker; ten ji okamžitě doručí odběratelům.',
            render: function (ctx, p, t) {
              drawPixelLink(ctx, 115, 180, 320, 180, { color: PAL.amber, width: 4 });
              drawPixelLink(ctx, 320, 180, 525, 120, { color: PAL.emerald, width: 3 });
              drawPixelLink(ctx, 320, 180, 525, 225, { color: PAL.emerald, width: 3 });
              drawPixelPC(ctx, 115, 180, 'IoT SENZOR', 'PUB sensor/temp', PAL.amber);
              drawPixelController(ctx, 320, 180, 'MQTT BROKER', '1883 / TLS 8883', PAL.cyan, t);
              drawPixelPC(ctx, 525, 120, 'DASHBOARD', 'SUB sensor/#', PAL.emerald);
              drawPixelPC(ctx, 525, 225, 'MOBIL', 'QoS 0 / 1 / 2', PAL.emerald);
              if (p < 0.5) {
                drawPixelPacket(ctx, lerp(140, 290, p * 2), 145, 'MQTT PUB', PAL.amber, 'temp = 23.4 °C');
              } else {
                var t2 = (p - 0.5) * 2;
                drawPixelPacket(ctx, lerp(345, 500, t2), lerp(170, 120, t2), 'SUB', PAL.emerald);
                drawPixelPacket(ctx, lerp(345, 500, t2), lerp(190, 225, t2), 'QoS 1', PAL.cyan);
              }
            }
          }
        ];

      default:
        return [
          {
            title: 'Síťová komunikace TCP/IP',
            caption: 'Interaktivní pixel-art vizualizace síťového protokolu.',
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
    this.stepDurationSec = 3.5;
    this.animTime = 0;
    this.lastTs = null;
    this.rafId = null;
    this._destroyed = false;

    if (canvasEl) {
      canvasEl.__op4StageRenderer = this;
    }

    this.setAnimation(animationType || 'tcpip-icmp-arp');
    this._loop = this._tick.bind(this);
    if (this.ctx && this.canvas) {
      this.rafId = global.requestAnimationFrame(this._loop);
    }
  }

  PixelStageRenderer.prototype.setAnimation = function (animationType) {
    this.animationType = animationType || 'tcpip-icmp-arp';
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
    var steps = buildAnimationSteps(animationType || 'tcpip-icmp-arp');
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
     3. InteractiveLabs: 16 interaktivních TCP/IP simulátorů
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
    var labType = isStr ? topicOrLabType : (topicOrLabType.labType || 'encapsulation-icmp-sim');
    var topicObj = isStr ? { labType: labType } : topicOrLabType;
    var fn = LAB_HANDLERS[labType];
    if (!fn) {
      containerEl.innerHTML = '<div class="callout">Interaktivní simulátor pro <code>' + escapeHtml(labType) + '</code> je připraven.</div>';
      return;
    }
    fn(containerEl, topicObj, options || {}, mountToken);
  }

  var LAB_HANDLERS = {
    /* 1. encapsulation-icmp-sim */
    'encapsulation-icmp-sim': function (el) {
      var mode = 'pdu';
      var selectedLayer = 2;
      var icmpTool = 'traceroute';
      var ttlStep = 1;
      var unreachable = false;

      var LAYERS = [
        { idx: 0, badge: 'L4', name: 'Aplikační vrstva (HTTP/DNS)', pdu: 'Data (Payload)', header: 'GET /index.html HTTP/1.1 | Host: web.cz', desc: 'Aplikační data bez síťového a linkového záhlaví. Připravuje je prohlížeč nebo síťová služba.' },
        { idx: 1, badge: 'L3', name: 'Transportní vrstva (TCP/UDP)', pdu: 'Segment / Datagram', header: 'SRC Port: 51420 | DST Port: 443 | SEQ=100 | ACK=1', desc: 'Přidává čísla portů pro rozlišení aplikací, sekvenční čísla a kontrolní součet.' },
        { idx: 2, badge: 'L2', name: 'Síťová vrstva (Internet – IPv4 + ICMP)', pdu: 'Paket (IP Packet)', header: 'SRC IP: 192.168.1.10 | DST IP: 93.184.216.34 | TTL=' + (64 - ttlStep + 1) + ' | Proto: 6', desc: 'Adresování mezi sítěmi pomocí IP adres. Obsahuje TTL proti zacyklení a pole Protocol (1=ICMP, 6=TCP, 17=UDP).' },
        { idx: 3, badge: 'L1', name: 'Vrstva síťového rozhraní (Ethernet + ARP)', pdu: 'Rámec (Frame) → Bity', header: 'SRC MAC: AA:11:22:33:44:55 | DST MAC: R1:00:11:22:33:01 (z ARP) | EtherType 0x0800 | FCS', desc: 'ARP nejprve přeloží IP výchozí brány na cílovou MAC adresu pro lokální segment LAN. Na konci je kontrolní součet FCS.' }
      ];

      function render() {
        var curLayer = LAYERS[selectedLayer] || LAYERS[0];
        var hops = [
          { ttl: 1, node: 'R1 (Výchozí brána 192.168.1.1)', rtt: '1.2 ms', reply: 'ICMP Type 11 (Time Exceeded) – TTL kleslo z 1 na 0.' },
          { ttl: 2, node: 'R2 (ISP Core 10.40.0.1)', rtt: '8.4 ms', reply: 'ICMP Type 11 (Time Exceeded) – TTL kleslo z 2 na 0.' },
          { ttl: 3, node: 'R3 (Páteřní uzel 198.51.100.2)', rtt: '14.9 ms', reply: unreachable ? 'ICMP Type 3 (Destination Unreachable – Host nedosažitelný)!' : 'ICMP Type 11 (Time Exceeded) – TTL kleslo z 3 na 0.' },
          { ttl: 4, node: 'Cíl (93.184.216.34)', rtt: unreachable ? '* * *' : '19.3 ms', reply: unreachable ? 'Nedoručeno: Cíl neodpovídá / blokováno na R3.' : 'ICMP Type 0 (Echo Reply) / Port Unreachable – Cíl dosažen!' }
        ];

        var activeHop = hops[ttlStep - 1];
        var pingOk = !unreachable;

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('layers', 16) + ' Zapouzdření PDU TCP/IP &amp; Diagnostika ICMP (Ping / Traceroute)</strong>' +
              '<span class="badge badge-cyan">' + (mode === 'pdu' ? 'PDU: ' + curLayer.pdu : (icmpTool === 'ping' ? 'PING (Type 8 / 0)' : 'TTL = ' + ttlStep)) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (mode === 'pdu' ? 'btn-primary' : '') + '" data-m="pdu">1. Zásobník PDU &amp; ARP</button>' +
              '<button type="button" class="btn btn-sm ' + (mode === 'icmp' ? 'btn-primary' : '') + '" data-m="icmp">2. Ping &amp; Traceroute (TTL)</button>' +
            '</div>' +
            (mode === 'pdu'
              ? '<div style="display:flex;flex-direction:column;gap:8px;">' +
                  LAYERS.map(function (l) {
                    var active = l.idx === selectedLayer;
                    return '<button type="button" class="lab-osi-row ' + (active ? 'is-active' : '') + '" data-l="' + l.idx + '">' +
                      '<span class="badge badge-cyan mono">' + l.badge + '</span>' +
                      '<span><strong>' + escapeHtml(l.name) + '</strong></span>' +
                      '<span class="mono muted" style="font-size:0.78rem;">' + escapeHtml(l.pdu) + '</span>' +
                    '</button>';
                  }).join('') +
                '</div>' +
                '<div class="stat-tile"><div class="stat-tile-label">Hlavička přidaná na této vrstvě</div><div class="mono" style="font-size:0.84rem;">' + escapeHtml(curLayer.header) + '</div></div>' +
                '<div class="callout callout-tip">' + escapeHtml(curLayer.desc) + '</div>'
              : '<div class="lab-controls">' +
                  '<button type="button" class="btn btn-sm ' + (icmpTool === 'traceroute' ? 'btn-primary' : '') + '" data-tool="traceroute">Traceroute (TTL 1..4)</button>' +
                  '<button type="button" class="btn btn-sm ' + (icmpTool === 'ping' ? 'btn-primary' : '') + '" data-tool="ping">Ping (Echo Request/Reply)</button>' +
                  (icmpTool === 'traceroute'
                    ? [1, 2, 3, 4].map(function (n) {
                        return '<button type="button" class="btn btn-sm ' + (ttlStep === n ? 'btn-emerald' : '') + '" data-ttl="' + n + '">TTL=' + n + '</button>';
                      }).join('')
                    : '') +
                  '<button type="button" class="btn btn-sm ' + (unreachable ? 'btn-rose' : '') + '" data-act="unreach">Simulovat výpadek před cílem: ' + (unreachable ? 'ZAP' : 'VYP') + '</button>' +
                '</div>' +
                '<div class="lab-stage">' +
                  '<svg class="lab-svg" viewBox="0 0 560 170" aria-label="Trasa ICMP paketů">' +
                    '<line x1="65" y1="85" x2="175" y2="85" stroke="#38bdf8" stroke-width="3" />' +
                    '<line x1="175" y1="85" x2="290" y2="85" stroke="#10b981" stroke-width="3" />' +
                    '<line x1="290" y1="85" x2="405" y2="85" stroke="' + (unreachable ? '#f43f5e' : '#10b981') + '" stroke-width="3" stroke-dasharray="' + (unreachable ? '5 4' : 'none') + '" />' +
                    '<line x1="405" y1="85" x2="505" y2="85" stroke="' + (unreachable ? '#334a73' : '#38bdf8') + '" stroke-width="3" />' +
                    '<circle cx="65" cy="85" r="22" fill="#121c30" stroke="#38bdf8" stroke-width="2" /><text x="65" y="89" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">PC</text>' +
                    '<circle cx="175" cy="85" r="20" fill="#121c30" stroke="' + (icmpTool === 'traceroute' && ttlStep === 1 ? '#f59e0b' : '#38bdf8') + '" stroke-width="2" /><text x="175" y="89" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R1</text>' +
                    '<circle cx="290" cy="85" r="20" fill="#121c30" stroke="' + (icmpTool === 'traceroute' && ttlStep === 2 ? '#f59e0b' : '#10b981') + '" stroke-width="2" /><text x="290" y="89" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R2</text>' +
                    '<circle cx="405" cy="85" r="20" fill="' + (unreachable ? '#450a18' : '#121c30') + '" stroke="' + (unreachable ? '#f43f5e' : (icmpTool === 'traceroute' && ttlStep === 3 ? '#f59e0b' : '#10b981')) + '" stroke-width="2" /><text x="405" y="89" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R3</text>' +
                    '<circle cx="505" cy="85" r="22" fill="#121c30" stroke="' + (unreachable ? '#f43f5e' : '#10b981') + '" stroke-width="2" /><text x="505" y="89" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">Cíl</text>' +
                    '<text x="280" y="142" text-anchor="middle" fill="#94a3b8" font-size="11">' +
                      (icmpTool === 'ping'
                        ? (pingOk ? 'ICMP Echo Request (Type 8) -> Cíl -> Echo Reply (Type 0, 19 ms)' : 'ICMP Echo Request (Type 8) -> R3 vrací Type 3 (Destination Unreachable)')
                        : 'Aktivní sonda: TTL=' + ttlStep + ' -> ' + activeHop.node) +
                    '</text>' +
                  '</svg>' +
                '</div>' +
                (icmpTool === 'traceroute'
                  ? '<div class="table-scroll"><table class="data-table"><thead><tr><th>TTL</th><th>Směrovač / Uzel</th><th>RTT</th><th>ICMP Zpráva</th></tr></thead><tbody>' +
                      hops.map(function (h) {
                        var hit = h.ttl === ttlStep;
                        var cls = hit ? (unreachable && h.ttl >= 3 ? 'lab-row-highlight-drop' : 'lab-row-highlight-win') : '';
                        return '<tr class="' + cls + '"><td class="mono">' + h.ttl + '</td><td>' + escapeHtml(h.node) + '</td><td class="mono">' + escapeHtml(h.rtt) + '</td><td>' + escapeHtml(h.reply) + '</td></tr>';
                      }).join('') +
                    '</tbody></table></div>'
                  : '<div class="callout ' + (pingOk ? 'callout-tip' : 'callout-warn') + '">' +
                      (pingOk
                        ? '<strong>PING 93.184.216.34 OK:</strong> 4/4 paketů Echo Request (Type 8) se vrátilo jako Echo Reply (Type 0), 0 % ztráta, RTT 19.3 ms, TTL=57.'
                        : '<strong>PING SELHAL (Type 3 Code 1):</strong> Router R3 nenašel cestu k cílovému hostovi a poslal zpět <code>ICMP Destination Host Unreachable</code>.') +
                    '</div>')
            ) +
          '</div>';

        el.querySelectorAll('[data-m]').forEach(function (b) {
          b.addEventListener('click', function () { mode = b.getAttribute('data-m'); render(); });
        });
        el.querySelectorAll('[data-l]').forEach(function (b) {
          b.addEventListener('click', function () { selectedLayer = Number(b.getAttribute('data-l')); render(); });
        });
        el.querySelectorAll('[data-tool]').forEach(function (b) {
          b.addEventListener('click', function () { icmpTool = b.getAttribute('data-tool'); render(); });
        });
        el.querySelectorAll('[data-ttl]').forEach(function (b) {
          b.addEventListener('click', function () { ttlStep = Number(b.getAttribute('data-ttl')); render(); });
        });
        var uBtn = el.querySelector('[data-act="unreach"]');
        if (uBtn) uBtn.addEventListener('click', function () { unreachable = !unreachable; render(); });
      }
      render();
    },

    /* 2. tcp-udp-sim */
    'tcp-udp-sim': function (el) {
      var proto = 'tcp';
      var packetLoss = false;
      var step = 0;
      var selectedSocket = 'https';

      var SOCKETS = {
        https: { client: '192.168.1.10:51420', server: '93.184.216.34:443', state: 'ESTABLISHED', proto: 'TCP', range: 'Ephemeral (51420) ↔ Well-Known (443)', note: 'Prohlížeč otevřel dvěma sokety jedno spolehlivé TLS/HTTPS spojení.' },
        dns: { client: '192.168.1.10:58102', server: '1.1.1.1:53', state: 'STATELESS (Bez stavu)', proto: 'UDP', range: 'Ephemeral (58102) ↔ Well-Known (53)', note: 'UDP dotaz bez handshake – jeden datagram tam, jeden zpět.' },
        ssh: { client: '192.168.1.10:49811', server: '10.0.0.5:22', state: 'ESTABLISHED', proto: 'TCP', range: 'Ephemeral (49811) ↔ Well-Known (22)', note: 'Vzdálená správa SSH udržuje šifrovaný TCP kanál s potvrzováním SEQ/ACK.' },
        mqtt: { client: '192.168.1.44:61004', server: '10.0.0.20:1883', state: 'ESTABLISHED', proto: 'TCP', range: 'Ephemeral (61004) ↔ Registered (1883)', note: 'IoT senzor má trvale připojený soket k MQTT brokeru na registrovaném portu 1883.' }
      };

      function getSteps() {
        if (proto === 'udp') {
          return [
            { badge: 'UDP →', clientState: 'Odesílá bez navázání', serverState: 'Čeká na datagram', msg: '1. Klient pošle UDP datagram (jen 8 B hlavička, žádný SYN). Minimální zpoždění.' },
            { badge: packetLoss ? 'ZTRACENO' : 'DORUČENO', clientState: 'Neví o výsledku', serverState: packetLoss ? 'Nic nepřišlo' : 'Přijato', msg: packetLoss ? '2. ZTRÁTA PAKETU! UDP nemá SEQ/ACK ani retransmisi – datagram je navždy ztracen (řeší až aplikace).' : '2. Datagram dorazil na cílový port v jednom kroku bez čekání na potvrzení.' }
          ];
        }
        if (packetLoss) {
          return [
            { badge: 'SYN', clientState: 'SYN_SENT', serverState: 'LISTEN', msg: '1. Klient → Server: SYN (Seq=100, Win=65535) – žádost o navázání spojení.' },
            { badge: 'TIMEOUT!', clientState: 'SYN_SENT (Čeká)', serverState: 'SYN_RCVD', msg: '2. ZTRÁTA PAKETU! Odpověď SYN-ACK se po cestě ztratila. Vyprší RTO časovač…' },
            { badge: 'RE-TX', clientState: 'SYN_SENT', serverState: 'SYN_RCVD', msg: '3. RETRANSMISE: Server automaticky znovu odešle SYN-ACK (Seq=300, Ack=101).' },
            { badge: 'ESTABLISHED', clientState: 'ESTABLISHED', serverState: 'ESTABLISHED', msg: '4. Klient → Server: ACK (Ack=301). Spojení je navázáno spolehlivě bez ztráty dat.' }
          ];
        }
        return [
          { badge: 'SYN', clientState: 'SYN_SENT', serverState: 'LISTEN', msg: '1. Klient → Server: SYN (Seq=100) – Synchronizuji počáteční sekvenční číslo.' },
          { badge: 'SYN-ACK', clientState: 'SYN_SENT', serverState: 'SYN_RCVD', msg: '2. Server → Klient: SYN-ACK (Seq=300, Ack=101) – Potvrzuji + posílám své číslo.' },
          { badge: 'ESTABLISHED', clientState: 'ESTABLISHED', serverState: 'ESTABLISHED', msg: '3. Klient → Server: ACK (Ack=301) – Obousměrný TCP kanál otevřen (Sliding Window).' },
          { badge: 'FIN / ACK', clientState: 'TIME_WAIT', serverState: 'CLOSED', msg: '4. Řádné ukončení přenosu pomocí příznaku FIN a potvrzení ACK (4-Way Teardown).' }
        ];
      }

      function render() {
        var steps = getSteps();
        if (step >= steps.length) step = 0;
        var cur = steps[step];
        var sock = SOCKETS[selectedSocket];

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('connect', 16) + ' Simulátor TCP 3-Way Handshake vs. UDP &amp; Sokety</strong>' +
              '<span class="badge badge-cyan">' + escapeHtml(cur.badge) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (proto === 'tcp' ? 'btn-primary' : '') + '" data-p="tcp">TCP (Spolehlivý + Handshake)</button>' +
              '<button type="button" class="btn btn-sm ' + (proto === 'udp' ? 'btn-primary' : '') + '" data-p="udp">UDP (Bezestavový rychlý)</button>' +
              '<button type="button" class="btn btn-sm ' + (packetLoss ? 'btn-rose' : '') + '" data-act="loss">Ztráta paketu: ' + (packetLoss ? 'ZAP' : 'VYP') + '</button>' +
              '<button type="button" class="btn btn-sm btn-emerald" data-act="next">Další krok (' + (step + 1) + '/' + steps.length + ')</button>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">Stav Klienta</div><div class="stat-tile-val">' + escapeHtml(cur.clientState) + '</div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">Stav Serveru</div><div class="stat-tile-val">' + escapeHtml(cur.serverState) + '</div></div>' +
            '</div>' +
            '<div class="callout ' + (packetLoss && cur.badge === 'TIMEOUT!' || cur.badge === 'ZTRACENO' ? 'callout-warn' : 'callout-problem') + '">' + escapeHtml(cur.msg) + '</div>' +
            '<div><strong>Inspektor soketů (IP:Port):</strong></div>' +
            '<div class="lab-controls">' +
              Object.keys(SOCKETS).map(function (k) {
                return '<button type="button" class="btn btn-sm ' + (selectedSocket === k ? 'btn-primary' : '') + '" data-sock="' + k + '">' + k.toUpperCase() + ' (' + SOCKETS[k].proto + ')</button>';
              }).join('') +
            '</div>' +
            '<div class="stat-tile">' +
              '<div><code>' + escapeHtml(sock.client) + '</code> ↔ <code>' + escapeHtml(sock.server) + '</code> · <strong>Stav:</strong> ' + escapeHtml(sock.state) + '</div>' +
              '<div class="muted" style="font-size:0.82rem;margin-top:4px;">' + escapeHtml(sock.range) + ' — ' + escapeHtml(sock.note) + '</div>' +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-p]').forEach(function (b) {
          b.addEventListener('click', function () { proto = b.getAttribute('data-p'); step = 0; render(); });
        });
        el.querySelector('[data-act="loss"]').addEventListener('click', function () { packetLoss = !packetLoss; step = 0; render(); });
        el.querySelector('[data-act="next"]').addEventListener('click', function () { step = (step + 1) % steps.length; render(); });
        el.querySelectorAll('[data-sock]').forEach(function (b) {
          b.addEventListener('click', function () { selectedSocket = b.getAttribute('data-sock'); render(); });
        });
      }
      render();
    },

    /* 3. ospf-rip-sim */
    'ospf-rip-sim': function (el) {
      var proto = 'ospf';
      var upperBroken = false;
      var ripPoisonStep = 15;

      function render() {
        var upperAlive = !upperBroken;
        var activePath = '';
        var verdict = '';
        var badge = '';

        if (proto === 'rip') {
          if (upperAlive) {
            activePath = 'R1 → R2 → R5 (Horní pomalá 10M cesta)';
            verdict = 'RIPv2 sleduje jen počet hopů (2 skoky vs. 3 skoky spodem), takže si vybral pomalou 10 Mbps linku!';
            badge = 'RIPv2: 2 hopy';
          } else {
            activePath = ripPoisonStep >= 16 ? 'R1 → R3 → R4 → R5 (Konvergence po vypršení)' : 'Počítání do nekonečna (Hop = ' + ripPoisonStep + ' / 16)';
            verdict = ripPoisonStep >= 16
              ? 'Po dosažení metriky 16 (nedosažitelné) RIP trasu přes R2 zahodil a přepnul na 3hopy spodem (Split Horizon urychluje úklid).'
              : 'Linka R1–R2 spadla! Bez Split Horizon mohou RIP routery zacyklit metriku až k limitu 16 (klikni na +1 Hop).';
            badge = ripPoisonStep >= 16 ? 'Metrika 16 = Unreachable' : 'RIP Hop: ' + ripPoisonStep;
          }
        } else {
          if (upperAlive) {
            activePath = 'R1 → R3 → R4 → R5 (Spodní 10G páteř, Cost = 3)';
            verdict = 'OSPF spočítal Cost podle šířky pásma (100M / BW, resp. ref-bw): 10G cesta spodem má Cost 1+1+1=3, zatímco 10M horem má Cost 10+1=11!';
            badge = 'OSPF Cost: 3';
          } else {
            activePath = 'R1 → R3 → R4 → R5 (Páteřní 10G cesta beze změny)';
            verdict = 'Výpadek záložní 10M linky R1–R2 OSPF ani nezpomalil – SPF (Dijkstra) okamžitě udržel 10G trasu s Cost 3.';
            badge = 'OSPF OK (Cost 3)';
          }
        }

        var useUpper = proto === 'rip' && upperAlive;
        var useLower = proto === 'ospf' || (proto === 'rip' && upperBroken && ripPoisonStep >= 16);

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('router', 16) + ' Topologický simulátor IGP: RIPv2 (Hop Count) vs. OSPF (Bandwidth Cost)</strong>' +
              '<span class="badge ' + (proto === 'rip' && upperBroken && ripPoisonStep < 16 ? 'badge-rose' : 'badge-emerald') + '">' + escapeHtml(badge) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (proto === 'ospf' ? 'btn-primary' : '') + '" data-igp="ospf">OSPF (Link-State, Area 0, IP 89)</button>' +
              '<button type="button" class="btn btn-sm ' + (proto === 'rip' ? 'btn-primary' : '') + '" data-igp="rip">RIPv2 (Distance Vector, UDP 520)</button>' +
              '<button type="button" class="btn btn-sm ' + (upperBroken ? 'btn-emerald' : 'btn-rose') + '" data-act="brk">' + (upperBroken ? 'Obnovit horní linku R1–R2' : 'Přerušit linku R1–R2') + '</button>' +
              (proto === 'rip' && upperBroken
                ? '<button type="button" class="btn btn-sm btn-amber" data-act="hop">RIP Count-to-16 (' + ripPoisonStep + '/16)</button>'
                : '') +
            '</div>' +
            '<div class="lab-stage">' +
              '<svg class="lab-svg" viewBox="0 0 560 190" aria-label="Topologie RIP vs OSPF">' +
                '<line x1="75" y1="95" x2="280" y2="42" stroke="' + (upperBroken ? '#f43f5e' : (useUpper ? '#f59e0b' : '#334a73')) + '" stroke-width="' + (useUpper ? '4' : '2') + '" stroke-dasharray="' + (upperBroken ? '6 4' : 'none') + '" />' +
                '<line x1="280" y1="42" x2="485" y2="95" stroke="' + (useUpper ? '#f59e0b' : '#334a73') + '" stroke-width="' + (useUpper ? '4' : '2') + '" />' +
                '<line x1="75" y1="95" x2="205" y2="148" stroke="' + (useLower ? '#10b981' : '#334a73') + '" stroke-width="' + (useLower ? '4' : '2') + '" />' +
                '<line x1="205" y1="148" x2="355" y2="148" stroke="' + (useLower ? '#10b981' : '#334a73') + '" stroke-width="' + (useLower ? '4' : '2') + '" />' +
                '<line x1="355" y1="148" x2="485" y2="95" stroke="' + (useLower ? '#10b981' : '#334a73') + '" stroke-width="' + (useLower ? '4' : '2') + '" />' +
                '<text x="170" y="54" fill="#f59e0b" font-size="10">10 Mbps (Cost 10)</text>' +
                '<text x="280" y="138" text-anchor="middle" fill="#10b981" font-size="10">10 Gbps (Cost 1 + 1 + 1)</text>' +
                '<circle cx="75" cy="95" r="21" fill="#121c30" stroke="#38bdf8" stroke-width="2" /><text x="75" y="99" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R1</text>' +
                '<circle cx="280" cy="42" r="19" fill="' + (upperBroken ? '#450a18' : '#121c30') + '" stroke="' + (upperBroken ? '#f43f5e' : '#f59e0b') + '" stroke-width="2" /><text x="280" y="46" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R2</text>' +
                '<circle cx="205" cy="148" r="19" fill="#121c30" stroke="#10b981" stroke-width="2" /><text x="205" y="152" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R3</text>' +
                '<circle cx="355" cy="148" r="19" fill="#121c30" stroke="#10b981" stroke-width="2" /><text x="355" y="152" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R4</text>' +
                '<circle cx="485" cy="95" r="21" fill="#121c30" stroke="#10b981" stroke-width="2" /><text x="485" y="99" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">R5</text>' +
              '</svg>' +
            '</div>' +
            '<div class="callout ' + (useLower ? 'callout-tip' : 'callout-warn') + '">' +
              '<strong>Aktivní trasa: ' + escapeHtml(activePath) + '</strong><br>' + escapeHtml(verdict) +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-igp]').forEach(function (b) {
          b.addEventListener('click', function () { proto = b.getAttribute('data-igp'); ripPoisonStep = 14; render(); });
        });
        el.querySelector('[data-act="brk"]').addEventListener('click', function () {
          upperBroken = !upperBroken;
          ripPoisonStep = upperBroken ? 14 : 2;
          render();
        });
        var hopBtn = el.querySelector('[data-act="hop"]');
        if (hopBtn) {
          hopBtn.addEventListener('click', function () {
            ripPoisonStep = ripPoisonStep >= 16 ? 14 : ripPoisonStep + 1;
            render();
          });
        }
      }
      render();
    },

    /* 4. bgp-aspath-sim */
    'bgp-aspath-sim': function (el) {
      var directPeeringUp = true;
      var localPrefTransit = 100;
      var prependDirect = false;
      var simulateLoop = false;

      function render() {
        var directPath = prependDirect ? '64515 64515 64520' : '64515 64520';
        var directLen = prependDirect ? 3 : 2;
        var transitPath = '64518 64519 64520';
        var transitLen = 3;

        var routes = [];
        if (directPeeringUp) {
          routes.push({
            id: 'direct',
            peer: 'AS64515 (Přímý peering)',
            lp: 150,
            asPath: simulateLoop ? '64515 64512 64520' : directPath,
            len: directLen,
            med: 10,
            loopDrop: simulateLoop
          });
        }
        routes.push({
          id: 'transit',
          peer: 'AS64518 (Tranzitní ISP)',
          lp: localPrefTransit,
          asPath: transitPath,
          len: transitLen,
          med: 50,
          loopDrop: false
        });

        var validRoutes = routes.filter(function (r) { return !r.loopDrop; });
        validRoutes.sort(function (a, b) {
          if (b.lp !== a.lp) return b.lp - a.lp;
          if (a.len !== b.len) return a.len - b.len;
          return a.med - b.med;
        });
        var winnerId = validRoutes.length ? validRoutes[0].id : null;
        var winner = validRoutes[0] || null;

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('globe', 16) + ' BGP-4 Simulátor: AS_PATH &amp; Výběrová politika (AS64512 → 203.0.113.0/24)</strong>' +
              '<span class="badge badge-emerald">' + (winner ? 'VÍTĚZ: ' + winner.peer : 'Žádná platná cesta') + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (directPeeringUp ? 'btn-emerald' : 'btn-rose') + '" data-act="peer">Peering AS64515: ' + (directPeeringUp ? 'UP' : 'DOWN') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (localPrefTransit === 250 ? 'btn-primary' : '') + '" data-act="lp">LOCAL_PREF pro Tranzit AS64518: ' + localPrefTransit + '</button>' +
              '<button type="button" class="btn btn-sm ' + (prependDirect ? 'btn-amber' : '') + '" data-act="prep">AS_PATH Prepend na AS64515: ' + (prependDirect ? 'ZAP' : 'VYP') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (simulateLoop ? 'btn-rose' : '') + '" data-act="loop">Smyčka (AS64512 v AS_PATH): ' + (simulateLoop ? 'ZAP' : 'VYP') + '</button>' +
            '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>Soused (eBGP TCP 179)</th><th>LOCAL_PREF</th><th>AS_PATH</th><th>MED</th><th>Verdikt BGP</th></tr></thead><tbody>' +
              routes.map(function (r) {
                var isWin = r.id === winnerId;
                var cls = r.loopDrop ? 'lab-row-highlight-drop' : (isWin ? 'lab-row-highlight-win' : '');
                var status = r.loopDrop ? 'DROP (Detekováno vlastní AS64512!)' : (isWin ? '→ AKTIVNÍ TRASA' : 'Záložní');
                return '<tr class="' + cls + '"><td><strong>' + escapeHtml(r.peer) + '</strong></td><td class="mono">' + r.lp + '</td><td class="mono">' + escapeHtml(r.asPath) + '</td><td class="mono">' + r.med + '</td><td>' + escapeHtml(status) + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
            '<div class="callout ' + (simulateLoop ? 'callout-warn' : 'callout-tip') + '">' +
              (simulateLoop
                ? '<strong>Ochrana před smyčkou:</strong> Přijatá cesta přes AS64515 obsahuje naše vlastní číslo <code>64512</code> v <code>AS_PATH</code>, proto ji BGP okamžitě zahodil a vybral čistou cestu přes AS64518.'
                : (localPrefTransit > 150
                    ? '<strong>Politika LOCAL_PREF:</strong> Přestože má tranzit přes AS64518 delší <code>AS_PATH</code> (3 AS), vyšší hodnota <code>LOCAL_PREF=' + localPrefTransit + '</code> má v BGP vyšší prioritu!'
                    : '<strong>Výběr podle nejkratšího AS_PATH / LOCAL_PREF:</strong> BGP dává přednost nejvyššímu <code>LOCAL_PREF</code> a při shodě nejkratšímu seznamu autonomních systémů <code>AS_PATH</code>.')) +
            '</div>' +
          '</div>';

        el.querySelector('[data-act="peer"]').addEventListener('click', function () { directPeeringUp = !directPeeringUp; render(); });
        el.querySelector('[data-act="lp"]').addEventListener('click', function () { localPrefTransit = localPrefTransit === 100 ? 250 : 100; render(); });
        el.querySelector('[data-act="prep"]').addEventListener('click', function () { prependDirect = !prependDirect; render(); });
        el.querySelector('[data-act="loop"]').addEventListener('click', function () { simulateLoop = !simulateLoop; render(); });
      }
      render();
    },

    /* 5. dns-resolver-sim */
    'dns-resolver-sim': function (el, topic, opts, mountToken) {
      var domain = 'skola.cz';
      var rtype = 'A';
      var queryMode = 'iterative';
      var cacheHit = false;
      var step = 0;

      var RECORDS = {
        'skola.cz': {
          A: '193.85.10.20',
          AAAA: '2001:db8:10::20',
          MX: '10 mail.skola.cz.',
          TXT: '"v=spf1 mx ip4:193.85.10.0/24 -all"',
          CNAME: 'www.skola.cz. -> portal.skola.cz.',
          PTR: '20.10.85.193.in-addr.arpa. -> web.skola.cz.'
        },
        'firma.com': {
          A: '198.51.100.45',
          AAAA: '2001:db8:45::45',
          MX: '10 mx1.firma.com.',
          TXT: '"v=spf1 include:_spf.firma.com ~all"',
          CNAME: 'shop.firma.com. -> cdn.firma.com.',
          PTR: '45.100.51.198.in-addr.arpa. -> edge.firma.com.'
        },
        'github.com': {
          A: '140.82.121.4',
          AAAA: '2606:50c0:8000::154',
          MX: '1 aspmx.l.google.com.',
          TXT: '"v=spf1 ip4:192.30.252.0/22 -all"',
          CNAME: 'docs.github.com. -> github.io.',
          PTR: '4.121.82.140.in-addr.arpa. -> lb-140-82-121-4.github.com.'
        }
      };

      function isStale() {
        return mountToken != null && el.__op4LabToken !== mountToken;
      }

      function getFlow(cleanDom) {
        if (cacheHit) {
          return [
            '1. Klient posílá rekurzivní dotaz (' + cleanDom + ' ' + rtype + ') na Resolver 1.1.1.1 (UDP 53).',
            '2. CACHE HIT! Záznam je v paměti resolveru (zbývá TTL = 242 s) → Okamžitá odpověď za 2 ms bez dotazu na Root!'
          ];
        }
        var tld = cleanDom.indexOf('.') !== -1 ? cleanDom.slice(cleanDom.lastIndexOf('.')) : '.cz';
        if (queryMode === 'recursive') {
          return [
            '1. Klient → Resolver (1.1.1.1): Rekurzivní dotaz „Dej mi hotovou odpověď pro ' + cleanDom + ' (' + rtype + ')“.',
            '2. Resolver na pozadí vyřídí všechny iterace přes Root (.) → TLD (' + tld + ') → Autoritativní NS.',
            '3. Resolver ukládá výsledek do cache (TTL 300s) a vrací klientovi finální záznam ' + rtype + '.'
          ];
        }
        return [
          '1. Resolver kontroluje lokální cache → Cache MISS (záznam vypršel nebo neexistuje).',
          '2. Iterativní dotaz na Root (.): „Neznám ' + cleanDom + ', ale zeptej se TLD serveru pro ' + tld + '.“',
          '3. Iterativní dotaz na TLD (' + tld + '): „Autoritativní server pro doménu je ns1.' + cleanDom + '.“',
          '4. Dotaz na Autoritativní DNS (ns1.' + cleanDom + '): Vrací závaznou odpověď ' + rtype + ' (TTL 300s, DNSSEC ověřeno).'
        ];
      }

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>DNS Resolver: Rekurze vs. Iterace, Cache TTL &amp; Záznamy</strong><span class="badge badge-cyan" id="dns-step-badge"></span></div>' +
          '<div class="lab-controls">' +
            '<input type="text" class="input" style="max-width:200px;" id="dns-dom-input" value="' + escapeHtml(domain) + '" aria-label="Doména" />' +
            ['skola.cz', 'firma.com', 'github.com'].map(function (d) {
              return '<button type="button" class="btn btn-sm" data-dom="' + d + '">' + d + '</button>';
            }).join('') +
            '<button type="button" class="btn btn-sm" id="dns-cache-btn">Cache TTL: MISS</button>' +
          '</div>' +
          '<div class="lab-controls">' +
            ['iterative', 'recursive'].map(function (qm) {
              return '<button type="button" class="btn btn-sm" data-qm="' + qm + '">' + (qm === 'iterative' ? 'Iterativní průchod (Root→TLD→NS)' : 'Pohled klienta (Rekurzivní dotaz)') + '</button>';
            }).join('') +
          '</div>' +
          '<div class="lab-controls">' +
            ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'PTR'].map(function (rt) {
              return '<button type="button" class="btn btn-sm" data-rt="' + rt + '">' + rt + '</button>';
            }).join('') +
            '<button type="button" class="btn btn-sm btn-primary" data-act="step">Další krok</button>' +
            '<button type="button" class="btn btn-sm" data-act="finish">Dokončit dotaz</button>' +
          '</div>' +
          '<div id="dns-out"></div>' +
        '</div>';

      var domInp = el.querySelector('#dns-dom-input');
      var badgeEl = el.querySelector('#dns-step-badge');
      var cacheBtn = el.querySelector('#dns-cache-btn');
      var outEl = el.querySelector('#dns-out');
      var domBtns = el.querySelectorAll('[data-dom]');
      var qmBtns = el.querySelectorAll('[data-qm]');
      var rtBtns = el.querySelectorAll('[data-rt]');

      function renderOutput() {
        if (isStale()) return;
        var cleanDom = domain.trim().toLowerCase().replace(/\.+$/, '') || 'skola.cz';
        var rec = RECORDS[cleanDom] || {
          A: '93.184.216.34',
          AAAA: '2606:2800:220:1:248:1893:25c8:1946',
          MX: '10 mail.' + cleanDom + '.',
          TXT: '"v=spf1 mx -all"',
          CNAME: 'www.' + cleanDom + '. -> ' + cleanDom + '.',
          PTR: '34.216.184.93.in-addr.arpa. -> ' + cleanDom + '.'
        };
        var flow = getFlow(cleanDom);
        if (step >= flow.length) step = flow.length - 1;

        badgeEl.textContent = (cacheHit ? 'CACHE HIT · ' : '') + 'Krok ' + (step + 1) + '/' + flow.length;
        cacheBtn.textContent = 'Cache TTL: ' + (cacheHit ? 'HIT (242s zbývá)' : 'MISS (plný dotaz)');
        cacheBtn.className = 'btn btn-sm ' + (cacheHit ? 'btn-emerald' : '');
        domBtns.forEach(function (b) { b.classList.toggle('btn-primary', b.getAttribute('data-dom') === cleanDom); });
        qmBtns.forEach(function (b) { b.classList.toggle('btn-primary', b.getAttribute('data-qm') === queryMode); });
        rtBtns.forEach(function (b) { b.classList.toggle('btn-emerald', b.getAttribute('data-rt') === rtype); });

        outEl.innerHTML =
          '<ol class="steps-clean" style="margin-bottom:10px;">' +
            flow.map(function (txt, idx) {
              var active = idx <= step;
              return '<li class="stat-tile" style="opacity:' + (active ? '1' : '0.45') + ';border-color:' + (idx === step ? 'var(--accent)' : 'var(--border-subtle)') + ';">' +
                '<span class="step-num">' + (idx + 1) + '.</span><span>' + escapeHtml(txt) + '</span></li>';
            }).join('') +
          '</ol>' +
          (step === flow.length - 1
            ? '<div class="terminal-block"><div class="terminal-head"><span>dig @1.1.1.1 ' + escapeHtml(cleanDom) + ' ' + escapeHtml(rtype) + ' (UDP 53 · DNSSEC AD)</span></div><pre class="terminal-pre">;; ANSWER SECTION:\n' + escapeHtml(cleanDom) + '.   ' + (cacheHit ? '242' : '300') + '   IN   ' + escapeHtml(rtype) + '   ' + escapeHtml(rec[rtype]) + '</pre></div>'
            : '<div class="callout">Klikej na <strong>Další krok</strong> pro průchod hierarchií DNS (nebo přepni <strong>Cache TTL: HIT</strong>).</div>');
      }

      domInp.addEventListener('input', function () { domain = domInp.value; step = 0; renderOutput(); });
      cacheBtn.addEventListener('click', function () { cacheHit = !cacheHit; step = 0; renderOutput(); });
      domBtns.forEach(function (b) { b.addEventListener('click', function () { domain = b.getAttribute('data-dom'); domInp.value = domain; step = 0; renderOutput(); }); });
      qmBtns.forEach(function (b) { b.addEventListener('click', function () { queryMode = b.getAttribute('data-qm'); step = 0; renderOutput(); }); });
      rtBtns.forEach(function (b) { b.addEventListener('click', function () { rtype = b.getAttribute('data-rt'); renderOutput(); }); });
      el.querySelector('[data-act="step"]').addEventListener('click', function () {
        var len = getFlow(domain.trim().toLowerCase() || 'skola.cz').length;
        step = (step + 1) % len;
        renderOutput();
      });
      el.querySelector('[data-act="finish"]').addEventListener('click', function () {
        var len = getFlow(domain.trim().toLowerCase() || 'skola.cz').length;
        step = len - 1;
        renderOutput();
      });
      renderOutput();
    },

    /* 6. dhcp-dora-sim */
    'dhcp-dora-sim': function (el) {
      var doraIdx = 0;
      var relayMode = false;
      var leasePct = 0;

      var DORA_STEPS = [
        { code: 'D', name: 'DHCPDISCOVER', src: '0.0.0.0:68', dst: '255.255.255.255:67 (Broadcast)', relayDst: '10.99.0.10:67 (Unicast přes Relay)', note: 'Klient ještě nemá IP. Vysílá broadcast do LAN a hledá libovolný DHCP server.' },
        { code: 'O', name: 'DHCPOFFER', src: '192.168.10.2:67', dst: 'Nabídka 192.168.10.50/24', relayDst: '10.99.0.10 -> Relay -> Klient', note: 'Server rezervuje adresu z poolu a nabízí IP, masku, bránu (Opt 3) a DNS (Opt 6).' },
        { code: 'R', name: 'DHCPREQUEST', src: '0.0.0.0:68', dst: 'Broadcast: „Beru .50 od .2“', relayDst: 'Relay -> 10.99.0.10:67', note: 'Klient broadcastem potvrdí přijetí jedné nabídky (ostatní DHCP servery uvolní své návrhy).' },
        { code: 'A', name: 'DHCPACK', src: '192.168.10.2:67', dst: '192.168.10.50 přiděleno (Lease 24h)', relayDst: '10.99.0.10 -> Klient: Lease 24h', note: 'Server závazně potvrdí pronájem. Klient si nastaví IP, masku, bránu, DNS a spustí časovače T1/T2.' }
      ];

      function getLeaseInfo(pct) {
        if (pct < 50) return { cls: 'callout-tip', title: 'Aktivní pronájem (' + pct + ' % z 24h)', text: 'Klient běžně komunikuje se svou IP 192.168.10.50. Čeká na T1 (12h).' };
        if (pct < 87) return { cls: 'callout-problem', title: 'Časovač T1 dosažen (' + pct + ' %)', text: 'V 50 % doby pronájmu posílá klient přímý Unicast DHCPREQUEST (Renew) původnímu DHCP serveru.' };
        if (pct < 100) return { cls: 'callout-warn', title: 'Časovač T2 dosažen (' + pct + ' %)', text: 'Původní server neodpověděl! V 87,5 % posílá klient Broadcast DHCPREQUEST (Rebind) jakémukoli DHCP serveru.' };
        return { cls: 'callout-warn', title: 'Pronájem vypršel (100 %)', text: 'Klient musí IP adresu okamžitě uvolnit a zahájit nový proces DORA (nebo si přidělí APIPA 169.254.x.x).' };
      }

      function render() {
        var cur = DORA_STEPS[doraIdx];
        var lInfo = getLeaseInfo(leasePct);

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('settings--adjust', 16) + ' DHCP Simulátor: DORA, Relay Agent (ip helper-address) &amp; Časovače T1/T2</strong>' +
              '<span class="badge badge-cyan">' + cur.name + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              DORA_STEPS.map(function (st, i) {
                return '<button type="button" class="btn btn-sm ' + (doraIdx === i ? 'btn-primary' : '') + '" data-d="' + i + '">' + (i + 1) + '. ' + st.code + ' (' + st.name.slice(4) + ')</button>';
              }).join('') +
              '<button type="button" class="btn btn-sm ' + (relayMode ? 'btn-amber' : '') + '" data-act="relay">DHCP Relay (přes Router): ' + (relayMode ? 'ZAP' : 'VYP') + '</button>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">Zdroj (UDP 67/68)</div><div class="stat-tile-val">' + escapeHtml(cur.src) + '</div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">' + (relayMode ? 'Cíl přes ip helper-address' : 'Cíl v téže VLAN') + '</div><div class="stat-tile-val">' + escapeHtml(relayMode ? cur.relayDst : cur.dst) + '</div></div>' +
            '</div>' +
            '<div class="callout callout-tip">' + escapeHtml(cur.note) +
              (relayMode ? ' <br><strong>Relay Agent:</strong> Router zachytil lokální broadcast na rozhraní VLAN 10 a přeposlal jej jako směrovaný Unicast na centrální DHCP server <code>10.99.0.10</code> (VLAN 99).' : '') +
            '</div>' +
            '<div style="border-top:1px solid var(--border-subtle);padding-top:10px;">' +
              '<div class="lab-header" style="margin-bottom:6px;">' +
                '<label for="dhcp-lease-slider"><strong>Časová osa pronájmu (Lease Time = 24 hodin):</strong> <span class="mono">' + leasePct + ' %</span></label>' +
                '<span class="badge ' + (leasePct >= 87 ? 'badge-rose' : (leasePct >= 50 ? 'badge-amber' : 'badge-emerald')) + '">' + (leasePct >= 100 ? 'EXPIRED' : (leasePct >= 87 ? 'T2 REBIND' : (leasePct >= 50 ? 'T1 RENEW' : 'LEASE OK'))) + '</span>' +
              '</div>' +
              '<input id="dhcp-lease-slider" type="range" class="cidr-slider" min="0" max="100" value="' + leasePct + '" />' +
              '<div class="lab-controls">' +
                [0, 50, 88, 100].map(function (v) {
                  var lbl = v === 0 ? '0% Start' : (v === 50 ? '50% T1' : (v === 88 ? '87.5% T2' : '100% Konec'));
                  return '<button type="button" class="btn btn-sm ' + (leasePct === v ? 'btn-primary' : '') + '" data-lp="' + v + '">' + lbl + '</button>';
                }).join('') +
              '</div>' +
              '<div class="callout ' + lInfo.cls + '" style="margin-top:8px;"><strong>' + escapeHtml(lInfo.title) + ':</strong> ' + escapeHtml(lInfo.text) + '</div>' +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-d]').forEach(function (b) {
          b.addEventListener('click', function () { doraIdx = Number(b.getAttribute('data-d')); render(); });
        });
        el.querySelector('[data-act="relay"]').addEventListener('click', function () { relayMode = !relayMode; render(); });
        el.querySelectorAll('[data-lp]').forEach(function (b) {
          b.addEventListener('click', function () { leasePct = Number(b.getAttribute('data-lp')); render(); });
        });
        el.querySelector('#dhcp-lease-slider').addEventListener('input', function (e) {
          leasePct = Number(e.target.value);
          render();
        });
      }
      render();
    },

    /* 7. ntp-stratum-sim */
    'ntp-stratum-sim': function (el, topic, opts, mountToken) {
      var upDelay = 18;
      var downDelay = 18;
      var clientSkew = 12;
      var stratum = 2;

      function isStale() {
        return mountToken != null && el.__op4LabToken !== mountToken;
      }

      el.innerHTML =
        '<div class="lab-shell">' +
          '<div class="lab-header"><strong>NTP Stratum &amp; Kalkulátor T1/T2/T3/T4 (Offset &amp; RTT)</strong><span class="badge badge-cyan" id="ntp-badge"></span></div>' +
          '<div class="lab-controls">' +
            '<span class="muted" style="font-size:0.82rem;">Vrstva serveru:</span>' +
            [1, 2, 3, 15, 16].map(function (s) {
              return '<button type="button" class="btn btn-sm" data-str="' + s + '">Stratum ' + s + '</button>';
            }).join('') +
          '</div>' +
          '<div class="lab-grid-2">' +
            '<div><label class="field-label" for="ntp-up" id="ntp-up-lbl">Cesta tam (Klient → Server): ' + upDelay + ' ms</label><input id="ntp-up" type="range" class="cidr-slider" min="2" max="100" value="' + upDelay + '" /></div>' +
            '<div><label class="field-label" for="ntp-down" id="ntp-down-lbl">Cesta zpět (Server → Klient): ' + downDelay + ' ms</label><input id="ntp-down" type="range" class="cidr-slider" min="2" max="100" value="' + downDelay + '" /></div>' +
          '</div>' +
          '<div><label class="field-label" for="ntp-skew" id="ntp-skew-lbl">Skutečná odchylka hodin klienta (server je napřed o): ' + clientSkew + ' ms</label><input id="ntp-skew" type="range" class="cidr-slider" min="-50" max="50" value="' + clientSkew + '" /></div>' +
          '<div id="ntp-out"></div>' +
        '</div>';

      var badgeEl = el.querySelector('#ntp-badge');
      var upInp = el.querySelector('#ntp-up');
      var downInp = el.querySelector('#ntp-down');
      var skewInp = el.querySelector('#ntp-skew');
      var upLbl = el.querySelector('#ntp-up-lbl');
      var downLbl = el.querySelector('#ntp-down-lbl');
      var skewLbl = el.querySelector('#ntp-skew-lbl');
      var outEl = el.querySelector('#ntp-out');
      var strBtns = el.querySelectorAll('[data-str]');

      function renderOut() {
        if (isStale()) return;
        upLbl.textContent = 'Cesta tam (Klient → Server): ' + upDelay + ' ms';
        downLbl.textContent = 'Cesta zpět (Server → Klient): ' + downDelay + ' ms';
        skewLbl.textContent = 'Skutečná odchylka hodin (server napřed o): ' + (clientSkew >= 0 ? '+' : '') + clientSkew + ' ms';

        strBtns.forEach(function (b) {
          var s = Number(b.getAttribute('data-str'));
          b.className = 'btn btn-sm ' + (stratum === s ? (s === 16 ? 'btn-rose' : 'btn-primary') : '');
        });

        var procTime = 2;
        var T1 = 1000;
        var T2 = T1 + clientSkew + upDelay;
        var T3 = T2 + procTime;
        var T4 = T1 + upDelay + procTime + downDelay;

        var delta = (T4 - T1) - (T3 - T2);
        var theta = ((T2 - T1) + (T3 - T4)) / 2;
        var asymError = Math.abs(theta - clientSkew);

        badgeEl.textContent = stratum === 16 ? 'Stratum 16 (UNSYNC!)' : 'Stratum ' + stratum + ' (Klient: ' + (stratum + 1) + ')';

        var stratumDesc = stratum === 1
          ? 'Stratum 1 je přímo připojen ke Stratum 0 (atomové hodiny / GPS přijímač).'
          : (stratum <= 3
            ? 'Běžná firemní hierarchie (Stratum ' + stratum + '). Klient bude Stratum ' + (stratum + 1) + '.'
            : (stratum === 15
              ? 'Poslední platná úroveň Stratum 15 – za ním už další klient nemůže být synchronizován.'
              : 'POZOR: Stratum 16 znamená NESYNCHRONIZOVÁNO! Server ztratil zdroj času a klient jej odmítne.'));

        outEl.innerHTML =
          '<div class="lab-grid-2" style="margin-bottom:10px;">' +
            '<div class="stat-tile"><div class="stat-tile-label">Časové značky (ms od startu)</div><div class="mono" style="font-size:0.84rem;">T1=' + T1 + ' · T2=' + T2 + ' · T3=' + T3 + ' · T4=' + T4 + '</div></div>' +
            '<div class="stat-tile"><div class="stat-tile-label">Vypočtené RTT (delta) &amp; Offset (theta)</div><div class="stat-tile-val">δ = ' + delta + ' ms · θ = ' + (theta >= 0 ? '+' : '') + theta.toFixed(1) + ' ms</div></div>' +
          '</div>' +
          '<div class="callout ' + (stratum === 16 || asymError > 5 ? 'callout-warn' : 'callout-tip') + '">' +
            '<strong>Výsledek NTP:</strong> ' + escapeHtml(stratumDesc) +
            (stratum < 16 ? '<br>Zpoždění RTT = <code>(' + T4 + '-' + T1 + ') - (' + T3 + '-' + T2 + ') = ' + delta + ' ms</code>. Odhadovaný posun <code>θ = ' + (theta >= 0 ? '+' : '') + theta.toFixed(1) + ' ms</code>' + (upDelay !== downDelay ? ' (asymetrie linky vnáší chybu ' + asymError.toFixed(1) + ' ms, protože NTP předpokládá symetrickou trasu!).' : ' (přesně odpovídá skutečné odchylce!).') : '') +
          '</div>';
      }

      strBtns.forEach(function (b) {
        b.addEventListener('click', function () { stratum = Number(b.getAttribute('data-str')); renderOut(); });
      });
      upInp.addEventListener('input', function () { upDelay = Number(upInp.value); renderOut(); });
      downInp.addEventListener('input', function () { downDelay = Number(downInp.value); renderOut(); });
      skewInp.addEventListener('input', function () { clientSkew = Number(skewInp.value); renderOut(); });
      renderOut();
    },

    /* 8. http-inspector-sim */
    'http-inspector-sim': function (el) {
      var method = 'GET';
      var status = 200;
      var httpVer = 'h2';

      var STATUS_INFO = {
        200: { text: '200 OK', cls: 'badge-emerald', desc: 'Požadavek uspěl. Server vrací požadovaný zdroj (HTML/JSON).' },
        301: { text: '301 Moved Permanently', cls: 'badge-cyan', desc: 'Trvalé přesměrování na novou URL (hlavička Location: https://...).' },
        403: { text: '403 Forbidden', cls: 'badge-amber', desc: 'Klient nemá oprávnění k přístupu ke zdroji (ani po přihlášení).' },
        404: { text: '404 Not Found', cls: 'badge-amber', desc: 'Požadovaný zdroj na serveru neexistuje.' },
        500: { text: '500 Internal Server Error', cls: 'badge-rose', desc: 'Neočekávaná chyba na straně serveru / backend aplikace.' }
      };

      var VER_INFO = {
        h1: {
          label: 'HTTP/1.1 (TCP 80/443)',
          desc: 'Textový protokol. Soubory v jednom spojení čekají za sebou (Head-of-Line Blocking).',
          bars: [
            { name: '1. index.html', start: 0, width: 25, color: '#38bdf8' },
            { name: '2. style.css (čeká)', start: 25, width: 30, color: '#f59e0b' },
            { name: '3. app.js (čeká)', start: 55, width: 45, color: '#f43f5e' }
          ]
        },
        h2: {
          label: 'HTTP/2 (Multiplexing + HPACK)',
          desc: 'Binární rámce v jednom TCP spojení: CSS, JS i HTML tečou paralelně! Při ztrátě 1 TCP paketu se ale zastaví všechny streamy.',
          bars: [
            { name: 'Stream 1: index.html', start: 0, width: 25, color: '#38bdf8' },
            { name: 'Stream 3: style.css', start: 10, width: 32, color: '#10b981' },
            { name: 'Stream 5: app.js', start: 10, width: 42, color: '#a78bfa' }
          ]
        },
        h3: {
          label: 'HTTP/3 (QUIC nad UDP 443)',
          desc: 'Běží nad UDP s vestavěným TLS 1.3 (0-RTT/1-RTT). Ztráta paketu v jednom streamu neblokuje ostatní!',
          bars: [
            { name: 'QUIC Stream 1 (0-RTT)', start: 0, width: 20, color: '#38bdf8' },
            { name: 'QUIC Stream 2 (nezávislý)', start: 5, width: 28, color: '#10b981' },
            { name: 'QUIC Stream 3 (bez TCP HoL)', start: 5, width: 34, color: '#a78bfa' }
          ]
        }
      };

      function render() {
        var st = STATUS_INFO[status];
        var v = VER_INFO[httpVer];
        var reqBody = method === 'POST' ? '\nContent-Type: application/json\nContent-Length: 27\n\n{"user":"jana","role":"net"}' : '';
        var extraHdr = status === 301 ? '\nLocation: https://skola.cz/portal' : '\nContent-Type: text/html; charset=utf-8';

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('cloud', 16) + ' HTTP Request/Response Builder &amp; Waterfall (HTTP/1.1 vs. HTTP/2 vs. HTTP/3)</strong>' +
              '<span class="badge ' + st.cls + '">' + escapeHtml(st.text) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              ['GET', 'POST', 'DELETE'].map(function (m) {
                return '<button type="button" class="btn btn-sm ' + (method === m ? 'btn-primary' : '') + '" data-hm="' + m + '">' + m + '</button>';
              }).join('') +
              [200, 301, 403, 404, 500].map(function (code) {
                return '<button type="button" class="btn btn-sm ' + (status === code ? 'btn-emerald' : '') + '" data-hs="' + code + '">' + code + '</button>';
              }).join('') +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>HTTP REQUEST</span></div><pre class="terminal-pre">' + escapeHtml(method) + ' /api/data HTTP/1.1\nHost: skola.cz\nAccept: text/html, application/json' + escapeHtml(reqBody) + '</pre></div>' +
              '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>HTTP RESPONSE</span></div><pre class="terminal-pre">HTTP/1.1 ' + escapeHtml(st.text) + escapeHtml(extraHdr) + '\nCache-Control: max-age=300\n\n' + escapeHtml(st.desc) + '</pre></div>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Verze protokolu (Waterfall):</span>' +
              Object.keys(VER_INFO).map(function (k) {
                return '<button type="button" class="btn btn-sm ' + (httpVer === k ? 'btn-primary' : '') + '" data-hv="' + k + '">' + escapeHtml(VER_INFO[k].label) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="stat-tile">' +
              v.bars.map(function (b) {
                return '<div style="margin-bottom:8px;">' +
                  '<div style="font-size:0.78rem;margin-bottom:3px;" class="mono">' + escapeHtml(b.name) + '</div>' +
                  '<div class="lab-meter"><div style="margin-left:' + b.start + '%;width:' + b.width + '%;height:100%;background:' + b.color + ';border-radius:3px;"></div></div>' +
                '</div>';
              }).join('') +
              '<div class="muted" style="font-size:0.82rem;">' + escapeHtml(v.desc) + '</div>' +
            '</div>' +
          '</div>';

        el.querySelectorAll('[data-hm]').forEach(function (b) { b.addEventListener('click', function () { method = b.getAttribute('data-hm'); render(); }); });
        el.querySelectorAll('[data-hs]').forEach(function (b) { b.addEventListener('click', function () { status = Number(b.getAttribute('data-hs')); render(); }); });
        el.querySelectorAll('[data-hv]').forEach(function (b) { b.addEventListener('click', function () { httpVer = b.getAttribute('data-hv'); render(); }); });
      }
      render();
    },
    /* 9. tls-handshake-sim */
    'tls-handshake-sim': function (el) {
      var certCase = 'valid';
      var step = 0;

      var CERTS = {
        valid: {
          label: 'Platný certifikát (Let\'s Encrypt)',
          targetHost: 'portal.skola.cz',
          cnSan: 'portal.skola.cz, www.skola.cz',
          issuer: 'Let\'s Encrypt R10 (Důvěryhodná CA)',
          validWindow: '2026-09-01 až 2026-12-01 (Platný)',
          ok: true,
          verdict: 'ZÁMEK OK (TLS 1.3 · TLS_AES_256_GCM_SHA384 · ECDHE X25519)',
          reason: 'Certifikát je podepsán důvěryhodnou CA, doména v SAN odpovídá SNI a časové okno je platné.'
        },
        expired: {
          label: 'Expirovaný certifikát',
          targetHost: 'portal.skola.cz',
          cnSan: 'portal.skola.cz',
          issuer: 'DigiCert Global Root G2',
          validWindow: '2025-01-01 až 2026-01-01 (VYPRŠEL!)',
          ok: false,
          verdict: 'VAROVÁNÍ: CERT_DATE_INVALID',
          reason: 'Platnost certifikátu vypršela (nebo má klient špatně nastavený čas bez NTP!). Prohlížeč spojení zablokuje.'
        },
        wrong_san: {
          label: 'Špatný CN / SAN (Jiná doména)',
          targetHost: 'portal.skola.cz',
          cnSan: '*.cizi-domena.cz',
          issuer: 'DigiCert Global Root G2',
          validWindow: '2026-08-01 až 2027-08-01 (Platný)',
          ok: false,
          verdict: 'VAROVÁNÍ: CERT_COMMON_NAME_INVALID',
          reason: 'Server předložil platný certifikát, ale pro jinou doménu (*.cizi-domena.cz != portal.skola.cz). Možný útok nebo chyba SNI!'
        },
        self_signed: {
          label: 'Self-Signed / Neznámá CA',
          targetHost: 'portal.skola.cz',
          cnSan: 'portal.skola.cz',
          issuer: 'CN=Self-Signed Router CA (Nedůvěryhodná)',
          validWindow: '2026-01-01 až 2036-01-01',
          ok: false,
          verdict: 'VAROVÁNÍ: CERT_AUTHORITY_INVALID',
          reason: 'Vydavatel není v systémovém úložišti kořenových certifikačních autorit (Root CA). Riziko MITM odposlechu!'
        }
      };

      var STEPS = [
        { name: '1. ClientHello (+ SNI, ALPN, key_share)', desc: 'Klient pošle podporované šifry TLS 1.3, cílové jméno SNI=portal.skola.cz, ALPN=h2 a svůj veřejný ECDHE klíč (X25519).' },
        { name: '2. ServerHello + Certifikát X.509 + CertificateVerify', desc: 'Server vybere šifru, pošle svůj klíč ECDHE, podepsaný certifikát X.509 a oba odvodí dočasný symetrický klíč (Forward Secrecy).' },
        { name: '3. Ověření X.509 v prohlížeči & Šifrovaný HTTP/2 přenos', desc: 'Klient zkontroluje řetězec CA, doménu v SAN a platnost data (vyžaduje přesný čas NTP). Po ověření tečou data šifrovaně přes AES-GCM.' }
      ];

      function render() {
        var c = CERTS[certCase];
        var st = STEPS[step];

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('security', 16) + ' HTTPS / TLS 1.3 Handshake &amp; Validátor certifikátu X.509</strong>' +
              '<span class="badge ' + (c.ok ? 'badge-emerald' : 'badge-rose') + '">' + (c.ok ? 'HTTPS Důvěryhodné' : 'CHYBA CERTIFIKÁTU') + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              STEPS.map(function (s, idx) {
                return '<button type="button" class="btn btn-sm ' + (step === idx ? 'btn-primary' : '') + '" data-st="' + idx + '">' + escapeHtml(s.name.split(' (+')[0].split(' +')[0].split(' &')[0]) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="callout callout-problem"><strong>' + escapeHtml(st.name) + ':</strong> ' + escapeHtml(st.desc) + '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Test certifikátu X.509:</span>' +
              Object.keys(CERTS).map(function (k) {
                return '<button type="button" class="btn btn-sm ' + (certCase === k ? (CERTS[k].ok ? 'btn-emerald' : 'btn-rose') : '') + '" data-cert="' + k + '">' + escapeHtml(CERTS[k].label) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">Požadavek prohlížeče (SNI)</div><div class="mono">https://' + escapeHtml(c.targetHost) + ':443</div><div class="muted" style="font-size:0.8rem;margin-top:4px;">ALPN: h2 | Key Exchange: ECDHE (Forward Secrecy)</div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">Pole certifikátu X.509</div><div class="mono" style="font-size:0.8rem;">SAN: ' + escapeHtml(c.cnSan) + '</div><div class="mono" style="font-size:0.8rem;">CA: ' + escapeHtml(c.issuer) + '</div><div class="mono" style="font-size:0.8rem;">Platnost: ' + escapeHtml(c.validWindow) + '</div></div>' +
            '</div>' +
            '<div class="callout ' + (c.ok ? 'callout-tip' : 'callout-warn') + '"><strong>' + escapeHtml(c.verdict) + ':</strong> ' + escapeHtml(c.reason) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-st]').forEach(function (b) { b.addEventListener('click', function () { step = Number(b.getAttribute('data-st')); render(); }); });
        el.querySelectorAll('[data-cert]').forEach(function (b) { b.addEventListener('click', function () { certCase = b.getAttribute('data-cert'); step = 2; render(); }); });
      }
      render();
    },

    /* 10. mail-flow-sim */
    'mail-flow-sim': function (el) {
      var readProto = 'imap';
      var spfOk = true;
      var dkimOk = true;
      var dmarcPolicy = 'reject';
      var traceStep = 3;

      function render() {
        var authPass = spfOk || dkimOk;
        var verdictBadge = (spfOk && dkimOk) ? 'badge-emerald' : (authPass ? 'badge-amber' : 'badge-rose');
        var verdictText = (spfOk && dkimOk)
          ? 'DORUČENO DO DORUČENÉ POŠTY (SPF PASS + DKIM PASS + DMARC PASS)'
          : (authPass
            ? 'ČÁSTEČNÁ SHODA (' + (spfOk ? 'SPF OK' : 'SPF FAIL') + ', ' + (dkimOk ? 'DKIM OK' : 'DKIM FAIL') + ') – DMARC prochází jen při zarovnání domény.'
            : (dmarcPolicy === 'reject'
              ? 'ODMÍTNUTO (550 5.7.1 DMARC Reject) – Ani SPF ani DKIM neprošel, server zprávu rovnou zahodil!'
              : 'PŘESUNUTO DO SPAMU (DMARC Quarantine) – Podezření na podvrženého odesílatele!'));

        var hops = [
          '1. MUA (Klient) → Odesílací server (MSA): SMTP port 587 + STARTTLS + AUTH LOGIN.',
          '2. Odesílací MTA → DNS dotaz MX pro cílovou doménu cil.cz → odpověď: 10 mx.cil.cz.',
          '3. Přenos Server → Server (MTA → MTA): SMTP port 25 (+ oportunistické STARTTLS).',
          readProto === 'imap'
            ? '4. Příjemce vybírá poštu přes IMAP4 TLS (port 993): Složky i stav „Přečteno“ zůstávají na serveru pro PC i mobil.'
            : '4. Příjemce vybírá poštu přes POP3 TLS (port 995): Zprávy se stáhnou lokálně do jednoho PC a ze serveru se typicky smažou.'
        ];

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('flow', 16) + ' Tok e-mailu (SMTP 587/25, DNS MX, IMAP 993 vs. POP3 995) &amp; SPF/DKIM/DMARC</strong>' +
              '<span class="badge ' + verdictBadge + '">' + (spfOk && dkimOk ? 'DMARC PASS' : (!authPass && dmarcPolicy === 'reject' ? 'REJECTED' : 'SPAM / WARN')) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Protokol příjmu:</span>' +
              '<button type="button" class="btn btn-sm ' + (readProto === 'imap' ? 'btn-primary' : '') + '" data-rp="imap">IMAP4 TLS (:993 – synchronizace)</button>' +
              '<button type="button" class="btn btn-sm ' + (readProto === 'pop3' ? 'btn-primary' : '') + '" data-rp="pop3">POP3 TLS (:995 – stažení)</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:6px;">' +
              hops.map(function (h, i) {
                return '<button type="button" class="lab-osi-row ' + (traceStep === i ? 'is-active' : '') + '" data-ts="' + i + '">' +
                  '<span class="badge badge-cyan mono">0' + (i + 1) + '</span>' +
                  '<span>' + escapeHtml(h) + '</span>' +
                  '<span class="mono muted" style="font-size:0.75rem;">' + (i === 0 ? 'TCP 587' : (i === 1 ? 'DNS MX' : (i === 2 ? 'TCP 25' : (readProto === 'imap' ? 'TCP 993' : 'TCP 995')))) + '</span>' +
                '</button>';
              }).join('') +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Ověření pravosti:</span>' +
              '<button type="button" class="btn btn-sm ' + (spfOk ? 'btn-emerald' : 'btn-rose') + '" data-act="spf">SPF (Oprávněná IP): ' + (spfOk ? 'PASS' : 'FAIL') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (dkimOk ? 'btn-emerald' : 'btn-rose') + '" data-act="dkim">DKIM (Podpis zprávy): ' + (dkimOk ? 'PASS' : 'FAIL') + '</button>' +
              '<button type="button" class="btn btn-sm" data-act="dmarc">DMARC politika: p=' + dmarcPolicy + '</button>' +
            '</div>' +
            '<div class="callout ' + (spfOk && dkimOk ? 'callout-tip' : 'callout-warn') + '">' + escapeHtml(verdictText) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-rp]').forEach(function (b) { b.addEventListener('click', function () { readProto = b.getAttribute('data-rp'); render(); }); });
        el.querySelectorAll('[data-ts]').forEach(function (b) { b.addEventListener('click', function () { traceStep = Number(b.getAttribute('data-ts')); render(); }); });
        el.querySelector('[data-act="spf"]').addEventListener('click', function () { spfOk = !spfOk; render(); });
        el.querySelector('[data-act="dkim"]').addEventListener('click', function () { dkimOk = !dkimOk; render(); });
        el.querySelector('[data-act="dmarc"]').addEventListener('click', function () { dmarcPolicy = dmarcPolicy === 'reject' ? 'quarantine' : 'reject'; render(); });
      }
      render();
    },

    /* 11. ftp-mode-sim */
    'ftp-mode-sim': function (el) {
      var ftpMode = 'active';
      var secMode = 'plain';
      var natEnabled = true;

      function render() {
        var activeBlocked = ftpMode === 'active' && natEnabled;
        var ctrlPort = secMode === 'implicit' ? '990' : '21';
        var encrypted = secMode !== 'plain';
        var cmdLabel = ftpMode === 'active' ? 'PORT 192,168,1,10,196,10' : 'PASV (227 Entering Passive Mode)';
        var dataDirection = ftpMode === 'active' ? 'SERVER (:20) → KLIENT' : 'KLIENT → SERVER (:50120)';
        var secBadge = secMode === 'plain' ? 'Plaintext (Heslo čitelné!)' : (secMode === 'explicit' ? 'Explicit FTPS (21 + AUTH TLS)' : 'Implicit FTPS (Port 990 TLS)');

        var explain = activeBlocked
          ? 'SELHÁNÍ AKTIVNÍHO REŽIMU ZA NAT/FIREWALLEM: Klient poslal privátní IP v příkazu PORT. Server se pokusil navázat DATOVÉ spojení z portu 20 ZPĚT ke klientovi – klientský NAT/Firewall příchozí spojení ZABLOKOVAL!'
          : (ftpMode === 'active'
            ? 'AKTIVNÍ REŽIM (Bez firewallu): Server navázal datové spojení ze zdrojového portu TCP 20 na klientský port. Za NATem by spojení selhalo.'
            : 'PASIVNÍ REŽIM ÚSPĚŠNÝ I ZA NAT: Server otevřel port 50120 a klient otevírá OBA kanály (řídicí i datový) směrem VEN přes NAT a firewall!');

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('firewall', 16) + ' FTP Simulátor: Aktivní (PORT) vs. Pasivní (PASV) &amp; FTPS za NAT/Firewallem</strong>' +
              '<span class="badge ' + (activeBlocked ? 'badge-rose' : 'badge-emerald') + '">' + (activeBlocked ? 'DATOVÝ KANÁL BLOKOVÁN!' : 'PŘENOS ÚSPĚŠNÝ') + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (ftpMode === 'active' ? 'btn-primary' : '') + '" data-fm="active">Aktivní režim (PORT)</button>' +
              '<button type="button" class="btn btn-sm ' + (ftpMode === 'passive' ? 'btn-primary' : '') + '" data-fm="passive">Pasivní režim (PASV/EPSV)</button>' +
              '<button type="button" class="btn btn-sm ' + (natEnabled ? 'btn-amber' : '') + '" data-act="nat">Klientský NAT + Firewall: ' + (natEnabled ? 'ZAP (Běžná síť)' : 'VYP (Veřejná IP)') + '</button>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Zabezpečení kanálů:</span>' +
              '<button type="button" class="btn btn-sm ' + (secMode === 'plain' ? 'btn-rose' : '') + '" data-sm="plain">Čisté FTP (Plaintext)</button>' +
              '<button type="button" class="btn btn-sm ' + (secMode === 'explicit' ? 'btn-emerald' : '') + '" data-sm="explicit">Explicit FTPS (21 + AUTH TLS)</button>' +
              '<button type="button" class="btn btn-sm ' + (secMode === 'implicit' ? 'btn-emerald' : '') + '" data-sm="implicit">Implicit FTPS (Port 990)</button>' +
            '</div>' +
            '<div class="lab-stage">' +
              '<svg class="lab-svg" viewBox="0 0 560 190" aria-label="FTP Aktivní vs Pasivní režim">' +
                '<line x1="90" y1="68" x2="470" y2="68" stroke="' + (encrypted ? '#10b981' : '#38bdf8') + '" stroke-width="3" />' +
                '<text x="280" y="56" text-anchor="middle" fill="' + (encrypted ? '#10b981' : '#38bdf8') + '" font-size="10.5" font-weight="bold">1. Řídicí kanál (Klient → Server :' + ctrlPort + ') · ' + escapeHtml(cmdLabel) + '</text>' +
                '<line x1="90" y1="132" x2="280" y2="132" stroke="' + (activeBlocked ? '#f43f5e' : '#10b981') + '" stroke-width="4" stroke-dasharray="' + (activeBlocked ? '6 4' : 'none') + '" />' +
                '<line x1="280" y1="132" x2="470" y2="132" stroke="' + (activeBlocked ? '#f43f5e' : '#10b981') + '" stroke-width="4" />' +
                '<text x="280" y="164" text-anchor="middle" fill="' + (activeBlocked ? '#f43f5e' : '#10b981') + '" font-size="10.5" font-weight="bold">2. Datový kanál: ' + escapeHtml(dataDirection) + (activeBlocked ? ' [BLOCKED BY NAT/FW!]' : ' [OK]') + '</text>' +
                '<rect x="24" y="64" width="100" height="74" rx="6" fill="#121c30" stroke="#38bdf8" stroke-width="2" />' +
                '<text x="74" y="96" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">FTP KLIENT</text>' +
                '<text x="74" y="114" text-anchor="middle" fill="#94a3b8" font-size="9">' + (natEnabled ? '192.168.1.10' : '198.51.100.8') + '</text>' +
                '<rect x="235" y="72" width="90" height="76" rx="6" fill="' + (natEnabled ? (activeBlocked ? '#450a18' : '#121c30') : '#0f172a') + '" stroke="' + (natEnabled ? (activeBlocked ? '#f43f5e' : '#f59e0b') : '#475569') + '" stroke-width="2" />' +
                '<text x="280" y="104" text-anchor="middle" fill="#f1f5f9" font-size="10.5" font-weight="bold">' + (natEnabled ? 'NAT / FW' : 'Bez NAT') + '</text>' +
                '<text x="280" y="122" text-anchor="middle" fill="#94a3b8" font-size="9">' + (activeBlocked ? 'DROP příchozí!' : 'Odchozí OK') + '</text>' +
                '<rect x="436" y="64" width="100" height="74" rx="6" fill="#121c30" stroke="#10b981" stroke-width="2" />' +
                '<text x="486" y="96" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="bold">FTP SERVER</text>' +
                '<text x="486" y="114" text-anchor="middle" fill="#10b981" font-size="9">Ctrl:' + ctrlPort + ' | Data:' + (ftpMode === 'active' ? '20' : '50120') + '</text>' +
              '</svg>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">Šifrování přenosu</div><div class="stat-tile-val">' + escapeHtml(secBadge) + '</div><div class="muted" style="font-size:0.8rem;margin-top:4px;">' + (encrypted ? 'Příkazy (USER/PASS) i datový kanál (PROT P) jsou šifrovány TLS.' : 'POZOR: Hesla i soubory letí v čistém textu! V produkci nahraď FTPS nebo SFTP (:22).') + '</div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">Poznámka k firewallu</div><div style="font-size:0.84rem;">FTPS vyžaduje povolit na firewallu rozsah pasivních portů (protože firewall nevidí do šifrovaného <code>PASV</code>). Alternativa s jediným portem je <strong>SFTP (TCP 22)</strong>.</div></div>' +
            '</div>' +
            '<div class="callout ' + (activeBlocked ? 'callout-warn' : 'callout-tip') + '">' + escapeHtml(explain) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-fm]').forEach(function (b) { b.addEventListener('click', function () { ftpMode = b.getAttribute('data-fm'); render(); }); });
        el.querySelectorAll('[data-sm]').forEach(function (b) { b.addEventListener('click', function () { secMode = b.getAttribute('data-sm'); render(); }); });
        el.querySelector('[data-act="nat"]').addEventListener('click', function () { natEnabled = !natEnabled; render(); });
      }
      render();
    },

    /* 12. smb-share-sim */
    'smb-share-sim': function (el) {
      var dialect = 'smb3';
      var auth = 'kerberos';
      var shareReadOnly = false;
      var posixWritable = true;

      function render() {
        var blockedV1 = dialect === 'smb1';
        var canWrite = !blockedV1 && !shareReadOnly && posixWritable;
        var effectiveMsg = blockedV1
          ? 'ZABLOKOVÁNO: Samba má nastaveno `server min protocol = SMB2`. SMBv1 je zakázáno kvůli kritické zranitelnosti EternalBlue (ransomware WannaCry).'
          : (canWrite
            ? 'ČTENÍ I ZÁPIS POVOLENY: Práva se vyhodnocují jako průnik Share oprávnění (smb.conf read only = no) a souborových práv (POSIX chmod/ACL).'
            : 'POUZE ČTENÍ (Access Denied při zápisu): ' + (shareReadOnly ? 'Sdílení v smb.conf je read only = yes.' : 'Chybí právo zápisu na souborovém systému Linuxu (POSIX ACL)!'));

        var confText = '[global]\n  server min protocol = ' + (dialect === 'smb1' ? 'NT1  # NEBEZPEČNÉ!' : 'SMB2_10') +
          '\n  smb encrypt = ' + (dialect === 'smb3' ? 'required' : 'disabled') +
          '\n\n[projekty]\n  path = /srv/samba/projekty\n  read only = ' + (shareReadOnly ? 'yes' : 'no') +
          '\n  valid users = @vyvojari';

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('layers', 16) + ' Samba / SMB3 Simulátor: Dialekty, Autentizace &amp; smb.conf ACL</strong>' +
              '<span class="badge ' + (blockedV1 ? 'badge-rose' : (canWrite ? 'badge-emerald' : 'badge-amber')) + '">' + (blockedV1 ? 'SMBv1 ZAKÁZÁNO' : (canWrite ? 'READ / WRITE OK' : 'READ ONLY')) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (dialect === 'smb1' ? 'btn-rose' : '') + '" data-sd="smb1">SMBv1 (1984 / WannaCry)</button>' +
              '<button type="button" class="btn btn-sm ' + (dialect === 'smb2' ? 'btn-primary' : '') + '" data-sd="smb2">SMBv2 (TCP 445)</button>' +
              '<button type="button" class="btn btn-sm ' + (dialect === 'smb3' ? 'btn-emerald' : '') + '" data-sd="smb3">SMBv3 (AES Šifrování + Podpis)</button>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (auth === 'kerberos' ? 'btn-primary' : '') + '" data-sa="kerberos">Autentizace: Kerberos (AD)</button>' +
              '<button type="button" class="btn btn-sm ' + (auth === 'ntlmv2' ? 'btn-primary' : '') + '" data-sa="ntlmv2">Autentizace: NTLMv2 (Workgroup)</button>' +
              '<button type="button" class="btn btn-sm ' + (shareReadOnly ? 'btn-amber' : 'btn-emerald') + '" data-act="ro">smb.conf read only: ' + (shareReadOnly ? 'YES' : 'NO') + '</button>' +
              '<button type="button" class="btn btn-sm ' + (posixWritable ? 'btn-emerald' : 'btn-rose') + '" data-act="px">Linux POSIX zápis: ' + (posixWritable ? 'rwx (OK)' : 'r-x (Zakázán)') + '</button>' +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>/etc/samba/smb.conf</span></div><pre class="terminal-pre">' + escapeHtml(confText) + '</pre></div>' +
              '<div class="stat-tile">' +
                '<div class="stat-tile-label">Připojení klienta (TCP 445)</div>' +
                '<div class="mono" style="font-size:0.8rem;margin-bottom:6px;">mount -t cifs //srv/projekty /mnt -o vers=' + (dialect === 'smb1' ? '1.0' : (dialect === 'smb2' ? '2.1' : '3.1.1')) + ',sec=' + (auth === 'kerberos' ? 'krb5' : 'ntlmssp') + '</div>' +
                '<div class="muted" style="font-size:0.82rem;"><strong>Protokol:</strong> ' + (dialect === 'smb3' ? 'AES-128-GCM šifrování + podpis proti MITM.' : (dialect === 'smb2' ? 'Moderní dialekt bez vestavěného šifrování přenosu (jen podpis).' : 'Zastaralý NetBIOS/SMB1 bez podpisu – zranitelný!')) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="callout ' + (blockedV1 || !canWrite ? 'callout-warn' : 'callout-tip') + '">' + escapeHtml(effectiveMsg) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-sd]').forEach(function (b) { b.addEventListener('click', function () { dialect = b.getAttribute('data-sd'); render(); }); });
        el.querySelectorAll('[data-sa]').forEach(function (b) { b.addEventListener('click', function () { auth = b.getAttribute('data-sa'); render(); }); });
        el.querySelector('[data-act="ro"]').addEventListener('click', function () { shareReadOnly = !shareReadOnly; render(); });
        el.querySelector('[data-act="px"]').addEventListener('click', function () { posixWritable = !posixWritable; render(); });
      }
      render();
    },

    /* 13. ssh-telnet-sftp-sim */
    'ssh-telnet-sftp-sim': function (el) {
      var mode = 'telnet';
      var authType = 'key';

      function render() {
        var sniffText = '';
        var verdict = '';
        var cls = 'callout-tip';
        var badge = 'badge-emerald';
        var badgeLbl = 'Šifrováno (TCP 22)';

        if (mode === 'telnet') {
          badge = 'badge-rose';
          badgeLbl = 'PLAIN-TEXT! (TCP 23)';
          cls = 'callout-warn';
          sniffText = 'Frame #41  SRC 192.168.1.10:51200 -> DST 10.0.0.1:23 [TELNET DATA]\n' +
            'ASCII: login: admin\\r\\nPassword: SuPerTajneHeslo2026!\\r\\nshow running-config\\r\\n';
          verdict = 'KRITICKÉ RIZIKO: Každý v síti (Wireshark / tcpdump / ARP spoofing) okamžitě přečte heslo i veškerou konfiguraci! Telnet používej výhradně nouzově pro test TCP portu, nikdy k přihlášení.';
        } else if (mode === 'ssh') {
          sniffText = 'Frame #18  SRC 192.168.1.10:53110 -> DST 10.0.0.1:22 [SSH-2.0-OpenSSH]\n' +
            'Host Key Fingerprint: SHA256:9xK4mZpQ7vL2nR8tB1wE4yA0cF5hJ3uM6sP (Ověřeno)\n' +
            'Encrypted Packet (chacha20-poly1305): 8f 3a e1 9c 04 b7 72 d9 5e 11 a8 4c ...';
          verdict = authType === 'key'
            ? 'DOPORUČENÁ PRAXE (SSH-2 + klíč ed25519): Sniffer vidí jen nerozluštitelný šum. Privátní klíč zůstává na počítači správce; heslo po síti vůbec necestuje.'
            : 'BEZPEČNÝ KANÁL (SSH-2 + heslo): Přenos je šifrovaný proti odposlechu, ale klíčová autentizace (ed25519) je ještě odolnější proti hádání hesel (brute-force).';
        } else {
          badgeLbl = mode === 'sftp' ? 'SFTP (1 port: TCP 22)' : 'FTPS (21 + rozsah datových portů)';
          sniffText = mode === 'sftp'
            ? '$ sftp -i ~/.ssh/id_ed25519 admin@10.0.0.1\nConnected to 10.0.0.1 (TCP port 22).\nsftp> put backup.tar.gz /srv/backups/\n[Firewall pravidlo: ALLOW TCP 22 ONLY]'
            : '$ lftp -e "set ftp:ssl-force true" ftps://10.0.0.1\n234 AUTH TLS successful (TCP port 21)\n227 Entering Passive Mode (10,0,0,1,195,120) -> Data TCP 50040\n[Firewall pravidlo: ALLOW TCP 21 + TCP 50000-50100]';
          verdict = mode === 'sftp'
            ? 'SFTP (SSH File Transfer Protocol) běží jako subsystém SSH na jediném portu TCP 22 – snadno projde každým firewallem a NATem.'
            : 'FTPS je nadstavba FTP s TLS (Explicit 21 / Implicit 990): odděluje řídicí a datový kanál, takže správce musí na firewallu povolit i rozsah pasivních portů.';
        }

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('code', 16) + ' Wire Sniffer: Telnet (TCP 23) vs. SSH-2 (TCP 22) &amp; SFTP vs. FTPS</strong>' +
              '<span class="badge ' + badge + '">' + escapeHtml(badgeLbl) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (mode === 'telnet' ? 'btn-rose' : '') + '" data-sm="telnet">Telnet (TCP 23)</button>' +
              '<button type="button" class="btn btn-sm ' + (mode === 'ssh' ? 'btn-emerald' : '') + '" data-sm="ssh">SSH-2 (TCP 22)</button>' +
              '<button type="button" class="btn btn-sm ' + (mode === 'sftp' ? 'btn-primary' : '') + '" data-sm="sftp">SFTP (TCP 22)</button>' +
              '<button type="button" class="btn btn-sm ' + (mode === 'ftps' ? 'btn-primary' : '') + '" data-sm="ftps">FTPS (21 + Data)</button>' +
              (mode === 'ssh'
                ? '<button type="button" class="btn btn-sm ' + (authType === 'key' ? 'btn-emerald' : '') + '" data-act="auth">Autentizace: ' + (authType === 'key' ? 'Klíč ed25519' : 'Heslo') + '</button>'
                : '') +
            '</div>' +
            '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>PACKETS / WIRE CAPTURE (tcpdump)</span></div><pre class="terminal-pre">' + escapeHtml(sniffText) + '</pre></div>' +
            '<div class="callout ' + cls + '">' + escapeHtml(verdict) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-sm]').forEach(function (b) { b.addEventListener('click', function () { mode = b.getAttribute('data-sm'); render(); }); });
        var authBtn = el.querySelector('[data-act="auth"]');
        if (authBtn) authBtn.addEventListener('click', function () { authType = authType === 'key' ? 'pass' : 'key'; render(); });
      }
      render();
    },

    /* 14. rdp-vnc-sim */
    'rdp-vnc-sim': function (el) {
      var proto = 'rdp';
      var sshTunnel = false;
      var nlaEnabled = true;

      function render() {
        var isRdp = proto === 'rdp';
        var port = isRdp ? 'TCP / UDP 3389' : (sshTunnel ? 'TCP 22 (SSH tunel → localhost:5901)' : 'TCP 5901 (Display :1)');
        var method = isRdp ? 'Vektorové GDI / grafické instrukce + H.264/AVC' : 'Rastrové obdélníky pixelů (RFB Framebuffer)';
        var bw = isRdp ? '~180 kbps (úsporné i přes pomalou WAN)' : '~3.4 Mbps (náročné na šířku pásma)';
        var bwPct = isRdp ? 12 : 85;
        var secOk = isRdp ? nlaEnabled : sshTunnel;

        var explain = isRdp
          ? (nlaEnabled
            ? 'RDP + NLA (Network Level Authentication): Uživatel se ověří přes TLS ještě před spuštěním vzdálené relace. Podporuje nezávislé relace více uživatelů a přesměrování schránky/tiskáren/zvuku.'
            : 'VAROVÁNÍ RDP bez NLA: Zobrazí se celá přihlašovací obrazovka Windows před ověřením, což zvyšuje zatížení serveru i plochu útoku.')
          : (sshTunnel
            ? 'BEZPEČNÉ VNC PŘES SSH TUNEL: VNC server naslouchá jen lokálně (127.0.0.1:5901) a veškerý rastrový provoz je šifrovaně přenášen příkazem `ssh -L 5901:127.0.0.1:5901 user@server`.'
            : 'NEBEZPEČNÉ PŘÍMÉ VNC (:5901): Standardní RFB šifruje jen úvodní výzvu slabým DES a obrazovka cestuje nešifrovaně! Nutné zabalit do SSH nebo VPN.');

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('screen', 16) + ' Vzdálená plocha: Microsoft RDP (3389) vs. VNC / RFB (5900+)</strong>' +
              '<span class="badge ' + (secOk ? 'badge-emerald' : 'badge-rose') + '">' + (secOk ? 'Zabezpečeno' : 'Slabé zabezpečení!') + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (isRdp ? 'btn-primary' : '') + '" data-rp="rdp">Microsoft RDP (Port 3389)</button>' +
              '<button type="button" class="btn btn-sm ' + (!isRdp ? 'btn-primary' : '') + '" data-rp="vnc">VNC / RFB (Port 5900+N)</button>' +
              (isRdp
                ? '<button type="button" class="btn btn-sm ' + (nlaEnabled ? 'btn-emerald' : 'btn-rose') + '" data-act="nla">NLA (Ověření před relací): ' + (nlaEnabled ? 'ZAP' : 'VYP') + '</button>'
                : '<button type="button" class="btn btn-sm ' + (sshTunnel ? 'btn-emerald' : 'btn-amber') + '" data-act="tun">SSH Tunel (-L 5901): ' + (sshTunnel ? 'ZAP' : 'VYP') + '</button>') +
            '</div>' +
            '<div class="lab-grid-2">' +
              '<div class="stat-tile"><div class="stat-tile-label">Port &amp; Transport</div><div class="stat-tile-val">' + escapeHtml(port) + '</div></div>' +
              '<div class="stat-tile"><div class="stat-tile-label">Způsob přenosu obrazu</div><div style="font-size:0.86rem;font-weight:600;">' + escapeHtml(method) + '</div></div>' +
            '</div>' +
            '<div class="stat-tile">' +
              '<div class="stat-tile-label">Spotřeba šířky pásma při práci v prohlížeči/dokumentech: <strong>' + escapeHtml(bw) + '</strong></div>' +
              '<div class="lab-meter"><div class="lab-meter-fill" style="width:' + bwPct + '%;background:' + (isRdp ? '#10b981' : '#f59e0b') + ';"></div></div>' +
            '</div>' +
            '<div class="callout ' + (secOk ? 'callout-tip' : 'callout-warn') + '">' + escapeHtml(explain) + '</div>' +
          '</div>';

        el.querySelectorAll('[data-rp]').forEach(function (b) { b.addEventListener('click', function () { proto = b.getAttribute('data-rp'); render(); }); });
        var nlaBtn = el.querySelector('[data-act="nla"]');
        if (nlaBtn) nlaBtn.addEventListener('click', function () { nlaEnabled = !nlaEnabled; render(); });
        var tunBtn = el.querySelector('[data-act="tun"]');
        if (tunBtn) tunBtn.addEventListener('click', function () { sshTunnel = !sshTunnel; render(); });
      }
      render();
    },

    /* 15. snmp-syslog-sim */
    'snmp-syslog-sim': function (el) {
      var snmpVer = 'v3';
      var snmpOp = 'walk';
      var maxSev = 4;
      var syslogTls = true;

      var LOGS = [
        { sev: 0, name: 'Emergency', fac: 'kern', msg: 'Kernel panic – systém je nepoužitelný!' },
        { sev: 1, name: 'Alert', fac: 'auth', msg: 'Kritické selhání RAID pole na /dev/md0 – nutný zásah.' },
        { sev: 2, name: 'Critical', fac: 'daemon', msg: 'Teplota CPU jádra routeru překročila 92 °C.' },
        { sev: 3, name: 'Error', fac: 'kern', msg: 'Interface eth1 Link Down (výpadek uplinku).' },
        { sev: 4, name: 'Warning', fac: 'auth', msg: 'Opakované neúspěšné přihlášení SSH z 203.0.113.99.' },
        { sev: 5, name: 'Notice', fac: 'local0', msg: 'Konfigurace firewallu uložena správcem filip.' },
        { sev: 6, name: 'Info', fac: 'daemon', msg: 'DHCPACK vydán pro 192.168.10.50 (MAC aa:bb:cc:11:22:33).' },
        { sev: 7, name: 'Debug', fac: 'local0', msg: 'OSPF Hello packet přijat na Gi0/1 od 10.0.0.2.' }
      ];

      function render() {
        var visibleLogs = LOGS.filter(function (l) { return l.sev <= maxSev; });
        var snmpCmd = snmpVer === 'v2c'
          ? (snmpOp === 'trap' ? 'SNMPv2-TRAP -> NMS:162 community="public" OID=.1.3.6.1.6.3.1.1.5.3 (linkDown)' : 'snmpwalk -v2c -c public 10.0.0.1 .1.3.6.1.2.1.1 (UDP 161)')
          : (snmpOp === 'trap' ? 'SNMPv3-TRAP -> NMS:162 user=nms auth=SHA256 priv=AES128 linkDown' : 'snmpwalk -v3 -l authPriv -u nms -a SHA -x AES 10.0.0.1 .1.3.6.1.2.1.1 (UDP 161)');

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('settings', 16) + ' Dohled sítě: SNMP (GET/WALK/TRAP · v2c vs. v3) &amp; Syslog Severity (0–7)</strong>' +
              '<span class="badge ' + (snmpVer === 'v3' && syslogTls ? 'badge-emerald' : 'badge-amber') + '">' + (snmpVer === 'v3' ? 'SNMPv3 authPriv' : 'SNMPv2c Plaintext!') + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (snmpOp === 'walk' ? 'btn-primary' : '') + '" data-so="walk">SNMP GET/WALK (UDP 161)</button>' +
              '<button type="button" class="btn btn-sm ' + (snmpOp === 'trap' ? 'btn-primary' : '') + '" data-so="trap">SNMP TRAP (UDP 162)</button>' +
              '<button type="button" class="btn btn-sm ' + (snmpVer === 'v2c' ? 'btn-rose' : '') + '" data-sv="v2c">SNMPv2c (community "public")</button>' +
              '<button type="button" class="btn btn-sm ' + (snmpVer === 'v3' ? 'btn-emerald' : '') + '" data-sv="v3">SNMPv3 (SHA + AES authPriv)</button>' +
            '</div>' +
            '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>SNMP PROVOZ (' + (snmpOp === 'trap' ? 'Agent → Manager :162' : 'Manager → Agent :161') + ')</span></div><pre class="terminal-pre">' + escapeHtml(snmpCmd) + (snmpOp === 'walk' ? '\nSNMPv2-MIB::sysDescr.0 = STRING: Cisco IOS / Linux Router\nSNMPv2-MIB::sysUpTime.0 = Timeticks: 42 days, 06:15:10' : '\nAsynchronní poplach odeslán ihned při poruše rozhraní bez čekání na polling!') + '</pre></div>' +
            '<div class="lab-controls">' +
              '<span class="muted" style="font-size:0.82rem;">Syslog filtr max. Severity (0–' + maxSev + '):</span>' +
              [2, 3, 4, 6, 7].map(function (s) {
                return '<button type="button" class="btn btn-sm ' + (maxSev === s ? 'btn-primary' : '') + '" data-sev="' + s + '">0–' + s + ' (' + LOGS[s].name + ')</button>';
              }).join('') +
              '<button type="button" class="btn btn-sm ' + (syslogTls ? 'btn-emerald' : 'btn-amber') + '" data-act="stls">Transport: ' + (syslogTls ? 'TLS TCP 6514' : 'UDP 514 (Plaintext)') + '</button>' +
            '</div>' +
            '<div class="table-scroll"><table class="data-table"><thead><tr><th>Sev</th><th>Úroveň</th><th>Facility</th><th>Zpráva Syslog</th></tr></thead><tbody>' +
              visibleLogs.map(function (l) {
                var cls = l.sev <= 3 ? 'lab-row-highlight-drop' : (l.sev === 4 ? 'lab-row-highlight-match' : '');
                return '<tr class="' + cls + '"><td class="mono">' + l.sev + '</td><td><strong>' + escapeHtml(l.name) + '</strong></td><td class="mono">' + escapeHtml(l.fac) + '</td><td>' + escapeHtml(l.msg) + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>';

        el.querySelectorAll('[data-so]').forEach(function (b) { b.addEventListener('click', function () { snmpOp = b.getAttribute('data-so'); render(); }); });
        el.querySelectorAll('[data-sv]').forEach(function (b) { b.addEventListener('click', function () { snmpVer = b.getAttribute('data-sv'); render(); }); });
        el.querySelectorAll('[data-sev]').forEach(function (b) { b.addEventListener('click', function () { maxSev = Number(b.getAttribute('data-sev')); render(); }); });
        el.querySelector('[data-act="stls"]').addEventListener('click', function () { syslogTls = !syslogTls; render(); });
      }
      render();
    },

    /* 16. realtime-app-sim */
    'realtime-app-sim': function (el) {
      var tab = 'voip';
      var rtpJitter = 25;
      var mqttQos = 1;
      var mqttTls = true;
      var sipStep = 2;

      function render() {
        var sipStages = [
          '1. SIP INVITE (UDP/TCP 5060 nebo TLS 5061): Telefon A žádá o hovor s jana@firma.cz a v SDP posílá svůj RTP port + kodeky.',
          '2. SIP 180 Ringing → 200 OK → ACK: Telefon B zvoní, přijímá hovor a obě strany si potvrdí parametry.',
          '3. RTP Media Stream (UDP dynamické porty): Hlas teče přímo mezi telefony po 20ms rámcích; Jitter Buffer vyrovnává kolísání zpoždění.'
        ];
        var qosMap = {
          0: { title: 'QoS 0 – At most once (Max. jednou)', flow: 'Senzor → PUBLISH → Broker (bez potvrzení PUBACK)', note: 'Nejrychlejší „fire & forget“. Vhodné pro časté telemetrie, kde nevadí výpadek jedné hodnoty.' },
          1: { title: 'QoS 1 – At least once (Alespoň jednou)', flow: 'Senzor → PUBLISH → Broker → PUBACK', note: 'Zaručí doručení (při ztrátě se opakuje), ale zpráva může dorazit výjimečně dvakrát. Zlatý střed pro IoT.' },
          2: { title: 'QoS 2 – Exactly once (Přesně jednou)', flow: 'PUBLISH → PUBREC → PUBREL → PUBCOMP (4-way)', note: 'Největší režie, ale garantuje přesně jedno doručení bez duplicit (např. platební nebo kritické povely).' }
        };

        el.innerHTML =
          '<div class="lab-shell">' +
            '<div class="lab-header">' +
              '<strong class="inline-icon-label">' + cIcon('flash', 16) + ' Real-time &amp; IoT protokoly: VoIP (SIP/RTP), MQTT &amp; WebSocket</strong>' +
              '<span class="badge badge-cyan">' + (tab === 'voip' ? 'SIP 5060 + RTP UDP' : (tab === 'mqtt' ? 'MQTT ' + (mqttTls ? 'TLS 8883' : 'TCP 1883') : 'WebSocket wss:// 443')) + '</span>' +
            '</div>' +
            '<div class="lab-controls">' +
              '<button type="button" class="btn btn-sm ' + (tab === 'voip' ? 'btn-primary' : '') + '" data-rtab="voip">1. VoIP (SIP + RTP)</button>' +
              '<button type="button" class="btn btn-sm ' + (tab === 'mqtt' ? 'btn-primary' : '') + '" data-rtab="mqtt">2. IoT MQTT (Pub/Sub)</button>' +
              '<button type="button" class="btn btn-sm ' + (tab === 'ws' ? 'btn-primary' : '') + '" data-rtab="ws">3. WebSocket (HTTP Upgrade)</button>' +
            '</div>' +
            (tab === 'voip'
              ? '<div class="lab-controls">' +
                  [0, 1, 2].map(function (idx) {
                    var lbl = idx === 0 ? 'INVITE' : (idx === 1 ? '200 OK / ACK' : 'RTP Hlas (UDP)');
                    return '<button type="button" class="btn btn-sm ' + (sipStep === idx ? 'btn-emerald' : '') + '" data-ss="' + idx + '">' + lbl + '</button>';
                  }).join('') +
                  [10, 25, 90].map(function (j) {
                    return '<button type="button" class="btn btn-sm ' + (rtpJitter === j ? (j > 50 ? 'btn-rose' : 'btn-primary') : '') + '" data-jit="' + j + '">Jitter: ' + j + ' ms</button>';
                  }).join('') +
                '</div>' +
                '<div class="callout callout-problem">' + escapeHtml(sipStages[sipStep]) + '</div>' +
                '<div class="callout ' + (rtpJitter > 50 ? 'callout-warn' : 'callout-tip') + '">' +
                  '<strong>Kvalita hovoru RTP (Jitter Buffer 40 ms):</strong> ' +
                  (rtpJitter <= 40
                    ? 'Plynulý hlas (jitter ' + rtpJitter + ' ms se vejde do vyrovnávací paměti). RTP nepoužívá TCP retransmisi, protože opožděný zvuk je k ničemu.'
                    : 'KOKTÁNÍ HOVORU! Jitter ' + rtpJitter + ' ms překročil Jitter Buffer (40 ms) – opožděné UDP pakety se zahazují a v řeči vznikají mezery.') +
                '</div>'
              : (tab === 'mqtt'
                ? '<div class="lab-controls">' +
                    [0, 1, 2].map(function (q) {
                      return '<button type="button" class="btn btn-sm ' + (mqttQos === q ? 'btn-primary' : '') + '" data-qos="' + q + '">QoS ' + q + '</button>';
                    }).join('') +
                    '<button type="button" class="btn btn-sm ' + (mqttTls ? 'btn-emerald' : 'btn-amber') + '" data-act="mtls">Kanál: ' + (mqttTls ? 'MQTTS (TLS 8883)' : 'MQTT (Plaintext 1883)') + '</button>' +
                  '</div>' +
                  '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>MQTT BROKER TOPIC: sensor/temp</span></div><pre class="terminal-pre">$ mosquitto_pub -h broker.firma.cz -p ' + (mqttTls ? '8883' : '1883') + ' -q ' + mqttQos + ' -t "sensor/temp" -m "23.4"\n[Broker -> Subscriberům "sensor/#"]: ' + escapeHtml(qosMap[mqttQos].flow) + '</pre></div>' +
                  '<div class="callout callout-tip"><strong>' + escapeHtml(qosMap[mqttQos].title) + ':</strong> ' + escapeHtml(qosMap[mqttQos].note) + '</div>'
                : '<div class="terminal-block" style="margin-top:0;"><div class="terminal-head"><span>WEBSOCKET HANDSHAKE (wss:// port 443)</span></div><pre class="terminal-pre">GET /live-feed HTTP/1.1\nHost: burza.cz\nUpgrade: websocket\nConnection: Upgrade\n\nHTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\n--&gt; Od této chvíle je TCP spojení plně duplexní (obousměrné v reálném čase bez pollingu!)</pre></div>' +
                  '<div class="callout callout-tip"><strong>Proč WebSocket?</strong> Na rozdíl od klasického HTTP Request/Response umožňuje serveru okamžitě posílat data prohlížeči (chaty, živé grafy, burza, notifikace) jediným trvalým spojením přes port 80 (<code>ws://</code>) nebo šifrovaně 443 (<code>wss://</code>).</div>')) +
          '</div>';

        el.querySelectorAll('[data-rtab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.getAttribute('data-rtab'); render(); }); });
        el.querySelectorAll('[data-ss]').forEach(function (b) { b.addEventListener('click', function () { sipStep = Number(b.getAttribute('data-ss')); render(); }); });
        el.querySelectorAll('[data-jit]').forEach(function (b) { b.addEventListener('click', function () { rtpJitter = Number(b.getAttribute('data-jit')); render(); }); });
        el.querySelectorAll('[data-qos]').forEach(function (b) { b.addEventListener('click', function () { mqttQos = Number(b.getAttribute('data-qos')); render(); }); });
        var mtlsBtn = el.querySelector('[data-act="mtls"]');
        if (mtlsBtn) mtlsBtn.addEventListener('click', function () { mqttTls = !mqttTls; render(); });
      }
      render();
    }
  };

  global.InteractiveLabs = {
    mount: mount
  };
})(window);
