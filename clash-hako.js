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

function main(config) {
  // 只取订阅节点，其他全部丢弃
  const proxies = Array.isArray(config && config.proxies) ? config.proxies : [];

  // 固定配置（纯 JS 对象）
  const fixed = {
    mode: "rule",
    "log-level": "warning",
    ipv6: true,
    "unified-delay": true,
    "tcp-concurrent": true,
    "keep-alive-interval": 30,

    profile: {
      "store-selected": true,
      "store-fake-ip": true
    },

    dns: {
      enable: true,
      ipv6: true,
      "prefer-h3": false,
      "respect-rules": true,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",
      "use-hosts": true,
      "use-system-hosts": true,
      "default-nameserver": ["223.5.5.5", "119.29.29.29"],
      nameserver: [
        "https://dns.cloudflare.com/dns-query",
        "https://dns.google/dns-query"
      ],
      "proxy-server-nameserver": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],
      "direct-nameserver": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],
      "nameserver-policy": {
        "geosite:cn": [
          "https://dns.alidns.com/dns-query",
          "https://doh.pub/dns-query"
        ]
      },
      "fake-ip-filter": [
        "*.lan",
        "+.local",
        "localhost",
        "*.msftconnecttest.com",
        "captive.apple.com",
        "+.push.apple.com",
        "stun.*",
        "+.stun.*.*"
      ]
    },

    sniffer: {
      enable: true,
      "force-dns-mapping": true,
      "parse-pure-ip": true,
      "override-destination": false,
      sniff: {
        HTTP: {
          ports: [80, "8080-8880"],
          "override-destination": true
        },
        TLS: {
          ports: [443, 8443]
        },
        QUIC: {
          ports: [443, 8443]
        }
      },
      "skip-domain": ["+.push.apple.com", "+.apple-dns.net"]
    },

    "proxy-groups": [
      // 主入口
      {
        name: "PROXY-Gate",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Final.png",
        proxies: [
          "🌎 Global-Manual",
          "🇺🇸 US-Auto",
          "🇸🇬 SG-Auto",
          "🇭🇰 HK-Auto",
          "🇯🇵 JP-Auto",
          "🇹🇼 TW-Auto",
          "DIRECT"
        ]
      },

      // Apple Push
      {
        name: "Apple Push",
        type: "fallback",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Apple.png",
        proxies: ["APNs-Fallback", "DIRECT"],
        url: "http://captive.apple.com/hotspot-detect.html",
        interval: 300
      },
      {
        name: "APNs-Fallback",
        type: "fallback",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Apple.png",
        proxies: [
          "🇺🇸 US-Auto",
          "🇸🇬 SG-Auto",
          "🇭🇰 HK-Auto",
          "🇯🇵 JP-Auto",
          "🇹🇼 TW-Auto"
        ],
        url: "http://captive.apple.com/hotspot-detect.html",
        interval: 300,
        hidden: true
      },

      // 手动选择
      {
        name: "🌎 Global-Manual",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Global.png",
        "include-all": true,
        filter: "^(?!.*(Remain|Expired|官网|套餐|流量|重置|距离)).*"
      },

      // 服务组
      {
        name: "YouTube",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/YouTube.png",
        proxies: ["🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto", "PROXY-Gate", "DIRECT"]
      },
      {
        name: "Netflix",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Netflix.png",
        proxies: ["🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto", "PROXY-Gate", "DIRECT"]
      },
      {
        name: "TikTok",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/TikTok.png",
        proxies: ["🇯🇵 JP-Auto", "🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇹🇼 TW-Auto", "PROXY-Gate", "DIRECT"]
      },
      {
        name: "GPT",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash/icon/openai.png",
        proxies: ["🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇯🇵 JP-Auto", "🇭🇰 HK-Auto", "🇹🇼 TW-Auto", "PROXY-Gate", "DIRECT"]
      },
      {
        name: "AI",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/ChatGPT.png",
        proxies: ["🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇯🇵 JP-Auto", "🇭🇰 HK-Auto", "🇹🇼 TW-Auto", "PROXY-Gate", "DIRECT"]
      },
      {
        name: "Telegram",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Telegram.png",
        proxies: ["🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto", "PROXY-Gate", "DIRECT"]
      },
      {
        name: "Apple",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Apple_2.png",
        proxies: ["DIRECT", "PROXY-Gate", "🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto"]
      },
      {
        name: "Microsoft",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Microsoft.png",
        proxies: ["DIRECT", "PROXY-Gate", "🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto"]
      },
      {
        name: "Spotify",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Spotify.png",
        proxies: ["DIRECT", "PROXY-Gate", "🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto"]
      },
      {
        name: "Emby",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Emby.png",
        proxies: ["DIRECT", "PROXY-Gate", "🇺🇸 US-Auto", "🇸🇬 SG-Auto", "🇭🇰 HK-Auto", "🇯🇵 JP-Auto", "🇹🇼 TW-Auto"]
      },

      // 地区自动组
      {
        name: "🇺🇸 US-Auto",
        type: "url-test",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/United_States.png",
        "include-all": true,
        filter: "(?i)(🇺🇸|美国|USA?|United\\s*States|\\bUS\\b)",
        url: "http://www.gstatic.com/generate_204",
        interval: 600,
        tolerance: 50,
        lazy: true
      },
      {
        name: "🇸🇬 SG-Auto",
        type: "url-test",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Singapore.png",
        "include-all": true,
        filter: "(?i)(🇸🇬|新加坡|狮城|\\bSG\\b|Singapore)",
        url: "http://www.gstatic.com/generate_204",
        interval: 600,
        tolerance: 50,
        lazy: true
      },
      {
        name: "🇭🇰 HK-Auto",
        type: "url-test",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Hong_Kong.png",
        "include-all": true,
        filter: "(?i)(🇭🇰|香港|\\bHK\\b|Hong\\s*Kong)",
        url: "http://www.gstatic.com/generate_204",
        interval: 600,
        tolerance: 50,
        lazy: true
      },
      {
        name: "🇯🇵 JP-Auto",
        type: "url-test",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Japan.png",
        "include-all": true,
        filter: "(?i)(🇯🇵|日本|东京|大阪|\\bJP\\b|Japan)",
        url: "http://www.gstatic.com/generate_204",
        interval: 600,
        tolerance: 50,
        lazy: true
      },
      {
        name: "🇹🇼 TW-Auto",
        type: "url-test",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Taiwan.png",
        "include-all": true,
        filter: "(?i)(🇹🇼|台湾|台北|\\bTW\\b|Taiwan)",
        url: "http://www.gstatic.com/generate_204",
        interval: 600,
        tolerance: 50,
        lazy: true
      }
    ],

    rules: [
      "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
      "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
      "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
      "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
      "GEOIP,LAN,DIRECT,no-resolve",

      "DOMAIN-SUFFIX,push.apple.com,Apple Push",
      "DOMAIN-SUFFIX,push-apple.com.akadns.net,Apple Push",
      "DOMAIN-KEYWORD,apple.com.edgekey.net,Apple Push",

      "RULE-SET,AdBlock,REJECT",

      "RULE-SET,YouTube,YouTube",
      "RULE-SET,Netflix,Netflix",
      "RULE-SET,TikTok,TikTok",
      "RULE-SET,OpenAI,GPT",
      "RULE-SET,Claude,AI",
      "RULE-SET,Telegram,Telegram",
      "RULE-SET,Apple,Apple",
      "RULE-SET,Microsoft,Microsoft",
      "RULE-SET,Spotify,Spotify",
      "RULE-SET,Emby,Emby",

      "GEOSITE,CN,DIRECT",
      "GEOIP,CN,DIRECT,no-resolve",

      "MATCH,PROXY-Gate"
    ],

    "rule-providers": {
      AdBlock: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.mrs",
        path: "./ruleset/AdBlock.mrs"
      },
      YouTube: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs",
        path: "./ruleset/YouTube.mrs"
      },
      Netflix: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs",
        path: "./ruleset/Netflix.mrs"
      },
      TikTok: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/tiktok.mrs",
        path: "./ruleset/TikTok.mrs"
      },
      OpenAI: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/openai.mrs",
        path: "./ruleset/OpenAI.mrs"
      },
      Claude: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/anthropic.mrs",
        path: "./ruleset/Claude.mrs"
      },
      Telegram: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs",
        path: "./ruleset/Telegram.mrs"
      },
      Apple: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple.mrs",
        path: "./ruleset/Apple.mrs"
      },
      Microsoft: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft.mrs",
        path: "./ruleset/Microsoft.mrs"
      },
      Spotify: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/spotify.mrs",
        path: "./ruleset/Spotify.mrs"
      },
      Emby: {
        type: "http",
        behavior: "domain",
        format: "mrs",
        interval: 86400,
        url: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-emby.mrs",
        path: "./ruleset/Emby.mrs"
      }
    }
  };

  // 返回最终配置
  return {
    ...fixed,
    proxies: proxies
  };
}
