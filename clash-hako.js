/**
 * mihomo 配置覆写脚本（Hako / Clash by Hako 官方适配版）
 * 基于原 YAML 配置转换而来，严格遵循官方最佳实践
 * 更新时间：2026-09-13
 *
 * 官方适配要点：
 * 1. 不预设 mixed-port / allow-lan / external-controller / 完整 TUN / find-process-mode
 * 2. log-level 使用 warning
 * 3. fake-ip-range 使用官方推荐的 198.18.0.1/16
 * 4. 完全去除自带 proxy-providers（请直接导入订阅）
 * 5. 策略组通过 include-all 自动匹配节点
 */

// ==================== 可配置开关 ====================
const ruleOptionsEnable = {
  Manual: true,
  Auto: true,
  Apple: true,
  bilibili: true,
  'CN-Media': true,
  'Global-Media': true,
  AI: true,
  TikTok: true,
  Microsoft: true,
  Emby: true,
  Spotify: true,
  Gaming: true,
  Global: true,
  Final: true,
  // 地区组
  HK: true,
  TW: true,
  JP: true,
  KR: true,
  SG: true,
  US: true,
  // 其他
  屏蔽信息节点: true,
};

// 信息类伪节点过滤
const infoFilter = 'Remain|Expired|官网|如需|套餐|去除|剩余|距离|Reset|重置|流量';

// ==================== 主入口 ====================
function main(config) {
  const newConfig = {};

  // ---------- 官方推荐通用设置 ----------
  newConfig.mode = 'rule';
  newConfig['log-level'] = 'warning';
  newConfig.ipv6 = true;
  newConfig['unified-delay'] = true;
  newConfig['tcp-concurrent'] = true;
  newConfig['keep-alive-interval'] = 30;

  newConfig.profile = {
    'store-selected': true,
    'store-fake-ip': true,
  };

  newConfig['geodata-mode'] = true;

  // ---------- DNS ----------
  newConfig.dns = {
    enable: true,
    ipv6: true,
    'prefer-h3': false,
    'respect-rules': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/16',
    'use-hosts': true,
    'use-system-hosts': true,
    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    nameserver: [
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query',
    ],
    'proxy-server-nameserver': [
      'https://223.5.5.5/dns-query',
      'https://dns.alidns.com/dns-query',
    ],
    'direct-nameserver': [
      'https://dns.alidns.com/dns-query',
      'https://doh.pub/dns-query',
    ],
    'direct-nameserver-follow-policy': false,
    'fake-ip-filter': [
      '*.lan',
      '+.local',
      'geosite:private',
      'geosite:category-ntp',
    ],
  };

  // ---------- 嗅探 ----------
  newConfig.sniffer = {
    enable: true,
    'force-dns-mapping': true,
    'parse-pure-ip': true,
    'override-destination': false,
    sniff: {
      HTTP: {
        ports: [80, '8080-8880'],
        'override-destination': true,
      },
      TLS: { ports: [443, 8443] },
      QUIC: { ports: [443, 8443] },
    },
    'skip-domain': ['+.push.apple.com', '+.apple-dns.net'],
  };

  // ==================== 策略组（严格控制顺序） ====================
  const proxyGroups = [];

  // 1. 手动选择
  if (ruleOptionsEnable.Manual) {
    proxyGroups.push({
      name: 'Manual',
      type: 'select',
      icon: 'https://raw.githubusercontent.com/Centralmatrix3/Matrix-io/master/Gallery/Color/Static.png',
      url: 'https://cp.cloudflare.com/generate_204',
      'include-all': true,
      filter: '^',
      'exclude-filter': infoFilter,
      interval: 3600,
      lazy: true,
    });
  }

  // 2. 功能分流组（按原 YAML 顺序）
  const serviceProxies = ['Manual', 'Auto', 'DIRECT', 'HK', 'TW', 'JP', 'KR', 'SG', 'US'];

  if (ruleOptionsEnable.Apple) {
    proxyGroups.push({
      name: 'Apple',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple_2.png',
      proxies: ['DIRECT', ...serviceProxies.filter(p => p !== 'DIRECT')],
    });
  }
  if (ruleOptionsEnable.bilibili) {
    proxyGroups.push({
      name: 'bilibili',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili_3.png',
      proxies: ['DIRECT', ...serviceProxies.filter(p => p !== 'DIRECT')],
    });
  }
  if (ruleOptionsEnable['CN-Media']) {
    proxyGroups.push({
      name: 'CN-Media',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/DomesticMedia.png',
      proxies: ['DIRECT', ...serviceProxies.filter(p => p !== 'DIRECT')],
    });
  }
  if (ruleOptionsEnable['Global-Media']) {
    proxyGroups.push({
      name: 'Global-Media',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.AI) {
    proxyGroups.push({
      name: 'AI',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/anthropic.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.TikTok) {
    proxyGroups.push({
      name: 'TikTok',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/tiktok.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.Microsoft) {
    proxyGroups.push({
      name: 'Microsoft',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/microsoft.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.Emby) {
    proxyGroups.push({
      name: 'Emby',
      type: 'select',
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.Spotify) {
    proxyGroups.push({
      name: 'Spotify',
      type: 'select',
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.Gaming) {
    proxyGroups.push({
      name: 'Gaming',
      type: 'select',
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.Global) {
    proxyGroups.push({
      name: 'Global',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png',
      proxies: serviceProxies,
    });
  }
  if (ruleOptionsEnable.Final) {
    proxyGroups.push({
      name: 'Final',
      type: 'select',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Final.png',
      proxies: serviceProxies,
    });
  }

  // 3. Auto（自动选择）
  if (ruleOptionsEnable.Auto) {
    proxyGroups.push({
      name: 'Auto',
      type: 'url-test',
      icon: 'https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/Roundrobin.png',
      url: 'https://cp.cloudflare.com/generate_204',
      'include-all': true,
      filter: '^',
      'exclude-filter': infoFilter,
      tolerance: 50,
      interval: 3600,
      lazy: true,
    });
  }

  // 4. 信息节点（隐藏）
  if (ruleOptionsEnable.屏蔽信息节点) {
    proxyGroups.push({
      name: 'Info-Nodes',
      type: 'select',
      'include-all': true,
      filter: infoFilter,
      hidden: true,
    });
  }

  // 5. 地区组（放在最后，隐藏的 AUTO/BALANCE 也在后面）
  function addRegion(name, icon, filter) {
    // 先放主组（界面可见）
    proxyGroups.push({
      name: name,
      type: 'select',
      icon: icon,
      'include-all': true,
      filter: filter,
      proxies: [`${name}-AUTO`, `${name}-BALANCE`],
    });
    // 再放隐藏的 AUTO 和 BALANCE
    proxyGroups.push(
      {
        name: `${name}-AUTO`,
        type: 'url-test',
        icon: icon,
        url: 'https://cp.cloudflare.com/generate_204',
        'include-all': true,
        filter: filter,
        tolerance: 50,
        interval: 3600,
        lazy: true,
        hidden: true,
      },
      {
        name: `${name}-BALANCE`,
        type: 'load-balance',
        strategy: 'round-robin',
        icon: icon,
        url: 'https://cp.cloudflare.com/generate_204',
        'include-all': true,
        filter: filter,
        interval: 3600,
        lazy: true,
        hidden: true,
      },
    );
  }

  if (ruleOptionsEnable.HK) {
    addRegion('HK', 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png', '香港|港|🇭🇰|HK|(?i)Hong');
  }
  if (ruleOptionsEnable.TW) {
    addRegion('TW', 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png', '台湾|台|TW|🇹🇼');
  }
  if (ruleOptionsEnable.JP) {
    addRegion('JP', 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png', '日本|日|JP|🇯🇵');
  }
  if (ruleOptionsEnable.KR) {
    addRegion('KR', 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png', '韩国|韩|KR|🇰🇷');
  }
  if (ruleOptionsEnable.SG) {
    addRegion('SG', 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png', '新加坡|狮|SG|🇸🇬');
  }
  if (ruleOptionsEnable.US) {
    addRegion('US', 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png', '美国|美|US|🇺🇸|(?i)States');
  }

  newConfig['proxy-groups'] = proxyGroups;

  // ---------- 规则 ----------
  newConfig.rules = [
    'RULE-SET,LAN,DIRECT',
    'DOMAIN-SUFFIX,gwdang.com,DIRECT',
    'DOMAIN-SUFFIX,cloudflare.com,Global-Media',
    'DOMAIN-SUFFIX,freedom.gov,Global-Media',
    'RULE-SET,Unbreak,DIRECT',
    'RULE-SET,AdBlock,REJECT',
    'RULE-SET,AI,AI',
    'RULE-SET,TikTok,TikTok',
    'RULE-SET,Microsoft,Microsoft',
    'RULE-SET,Emby,Emby',
    'RULE-SET,Spotify,Spotify',
    'RULE-SET,Steam,Gaming',
    'RULE-SET,bilibili,bilibili',
    'RULE-SET,CN-Media,CN-Media',
    'RULE-SET,Global-Media,Global-Media',
    'RULE-SET,Global,Global',
    'RULE-SET,Apple,Apple',
    'RULE-SET,ChinaDomain,DIRECT',
    'RULE-SET,ChinaDirect,DIRECT,no-resolve',
    'MATCH,Final',
  ];

  // ---------- 规则集 ----------
  newConfig['rule-providers'] = {
    Unbreak: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/Unbreak.yaml',
      url: 'https://raw.githubusercontent.com/Centralmatrix3/Matrix-io/master/Ruleset/Clash/Unbreak.yaml',
    },
    AdBlock: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/AdBlock.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Advertising/Advertising.yaml',
    },
    bilibili: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/BiliBili.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/BiliBili/BiliBili.yaml',
    },
    'CN-Media': {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/ChinaMedia.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/ChinaMedia/ChinaMedia.yaml',
    },
    'Global-Media': {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/GlobalMedia.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GlobalMedia/GlobalMedia.yaml',
    },
    AI: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './raw/Ai.yaml',
      url: 'https://gist.githubusercontent.com/ddgksf2013/cb4121e8b5c5d865cc949cb8120320c4/raw/Ai.yaml',
    },
    TikTok: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './raw/TikTok.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/TikTok/TikTok.yaml',
    },
    Microsoft: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './raw/Microsoft.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Microsoft/Microsoft.yaml',
    },
    Emby: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './raw/Emby1.yaml',
      url: 'https://raw.githubusercontent.com/xlh8394/Emby/refs/heads/main/Emby1.yaml',
    },
    Spotify: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './raw/Spotify.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Spotify/Spotify.yaml',
    },
    Steam: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './raw/Steam.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Steam/Steam.yaml',
    },
    Global: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/Global.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Global/Global.yaml',
    },
    Apple: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/Apple.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Apple/Apple.yaml',
    },
    LAN: {
      behavior: 'classical',
      interval: 86400,
      type: 'http',
      path: './Ruleset/LAN.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Lan/Lan.yaml',
    },
    ChinaDomain: {
      behavior: 'domain',
      interval: 86400,
      type: 'http',
      path: './Ruleset/ChinaMax_Domain.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/ChinaMax/ChinaMax_Domain.yaml',
    },
    ChinaDirect: {
      behavior: 'ipcidr',
      interval: 86400,
      type: 'http',
      path: './Ruleset/ChinaIPs_IP.yaml',
      url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/ChinaIPs/ChinaIPs_IP.yaml',
    },
  };

  // 保留原有节点
  if (config.proxies && Array.isArray(config.proxies)) {
    newConfig.proxies = config.proxies;
  }

  return newConfig;
}
