"use strict";

import IUser from "../models/user";
// tslint:disable-next-line:no-var-requires
const makeQrCode: (text: string) => Promise<string> = require("qrcode")
  .toDataURL;

export interface IGuide {
  vmess: IGuideItem[];
  ss: IGuideItem[];
}
export interface IGuideItem {
  os: string;
  descriptions: IGuideDescription[];
}
interface IGuideDescription {
  title: string;
  content: string;
  qrcode?: string;
  links?: IGuideLink[];
  fields?: IGuideField[];
}
interface IGuideLink {
  name: string;
  href: string;
}
interface IGuideField {
  name: string;
  data: string | number;
}

const getGuide = async (user: IUser, siteName?: string): Promise<IGuide> => {
  const ssUri =
    "ss://" +
    Buffer.from(
      `${user.ss.encryption}:${user.ss.password}@${user.ss.host}:${
        user.ss.port
      }`
    ).toString("base64");
  const ssQr = await makeQrCode(ssUri);
  return {
    vmess: [
      {
        os: "Android",
        descriptions: [
          {
            title: "下载应用",
            content: "下载客户端并安装(app-universal-release.apk)。",
            links: [
              {
                name: "GitHub",
                href: "https://github.com/2dust/v2rayNG/releases",
              },
            ],
          },
          {
            title: "添加配置",
            content:
              "点击下面的按钮，按照系统提示用应用 v2rayNG 打开，并按照应用提示确认添加。",
            links: [
              {
                name: "配置",
                href:
                  "vmess://" +
                  Buffer.from(
                    JSON.stringify({
                      add: user.vmess.host,
                      aid: user.vmess.aid,
                      host: `${user.vmess.webSocket.path};${
                        user.vmess.webSocket.host
                      }`,
                      id: user.vmess.id,
                      net: user.vmess.network,
                      port: user.vmess.port,
                      ps: siteName,
                      tls: user.vmess.tls.status === "off" ? "" : "tls",
                      type:
                        user.vmess.network === "tcp"
                          ? user.vmess.tcp.header.type
                          : user.vmess.network === "kcp"
                          ? user.vmess.kcp.header.type
                          : "none",
                    })
                  ).toString("base64"),
              },
            ],
          },
          {
            title: "改善配置（可选）",
            content:
              "点击新增的配置文件右侧编辑图标，在弹出的面板内，修改「security」为「chacha20-poly1305」，点击右上角对号保存。",
          },
          {
            title: "设置路由",
            content:
              "点击右上角菜单，选择「Settings」；打开「Bypass Mainland」，（可选）打开「Enable Mux」；返回首页。",
          },
          {
            title: "启动代理",
            content:
              "点击下方纸飞机，待提示「Start Server Success」后即可开始使用网络。个别系统可能会询问权限，请一律允许。",
          },
        ],
      },
      {
        os: "iOS(Kitsunebi)",
        descriptions: [
          {
            title: "下载应用",
            content:
              "在 App Store 购买应用 Kitsunebi（￥12），或申请免费的测试版（需要挂代理访问）。",
            links: [
              {
                name: "App Store",
                href: "https://itunes.apple.com/cn/app/kitsunebi/id1275446921",
              },
              {
                name: "TestFlight",
                href:
                  "https://docs.google.com/forms/d/e/1FAIpQLSekOGRE7cXk3vBTVjlHiv6RJRXfeItZvjQCDRxyigKYq6ChmA/viewform",
              },
            ],
          },
          {
            title: "添加配置",
            content:
              "打开应用，点击左上角📷图标扫描下方二维码；移动设备可以长按保存二维码后，点击左上角📷图标，再点击右上角文件夹图标，从相册中选择二维码图片。",
            qrcode: await makeQrCode(
              "vmess://" +
                Buffer.from(
                  `chacha20-poly1305:${user.vmess.id}@${user.vmess.host}:${
                    user.vmess.port
                  }`
                ).toString("base64") +
                `?network=${user.vmess.network}` +
                (user.vmess.network === "ws"
                  ? `&wspath=${user.vmess.webSocket.path}`
                  : "") +
                `&tls=${
                  user.vmess.tls.status === "off" ? 0 : 1
                }&allowInsecure=${
                  user.vmess.tls.cert.trust ? 0 : 1
                }&remark=${siteName}`
            ),
          },
          {
            title: "调整配置",
            content: `点击确认，进入「服务器」，点击「${siteName}」右侧信息图标，编辑配置，关闭「Mux」。`,
          },
          {
            title: "启用配置",
            content: `点击保存返回，选择「${siteName}」，使左侧图标变为绿色。`,
          },
          {
            title: "设置路由",
            content:
              "进入「高级特性」，找到「Tunnel 选项」，打开「Full Tunnel」。",
          },
          {
            title: "启动代理",
            content: "回到主界面，打开连接。系统可能多次询问权限，请一律允许。",
          },
        ],
      },
      {
        os: "iOS(Shadowrocket)",
        descriptions: [
          {
            title: "下载应用",
            content:
              "在非中国大陆区域的 App Store 里购买并安装应用「Shadowrocket」（约合人民币 18 元）。",
            links: [
              {
                name: "App Store",
                href:
                  "https://itunes.apple.com/us/app/shadowrocket/id932747118?mt=8",
              },
            ],
          },
          {
            title: "添加配置",
            content:
              "点击下面的按钮，按照系统提示用应用 Shadowrocket 打开，并按照应用提示确认添加。",
            links: [
              {
                name: "配置",
                href: `vmess://${Buffer.from(
                  `chacha20-poly1305:${user.vmess.id}@${user.vmess.host}:${
                    user.vmess.port
                  }`
                ).toString("base64")}?obfsParam=${
                  user.vmess.webSocket.host
                }&path=${
                  user.vmess.network === "ws"
                    ? user.vmess.webSocket.path
                    : user.vmess.tcp.header.type
                }&obfs=${
                  user.vmess.network === "ws"
                    ? "websocket"
                    : user.vmess.network === "tcp"
                    ? user.vmess.tcp.header.type
                    : "none"
                }&tls=${user.vmess.tls.status === "off" ? 0 : 1}`,
              },
            ],
          },
          {
            title: "启动代理",
            content:
              "在主界面点击「未连接」的开关，按照系统提示允许建立 VPN 连接。此后每次需要连接代理时，请手动打开应用连接。也可以在控制中心添加快捷开关。",
          },
        ],
      },
      {
        os: "Windows",
        descriptions: [
          {
            title: "下载应用",
            content:
              "下载 v2rayN 和 v2ray-core (v2ray-windows-64.zip)，使 v2rayN.exe 和 v2ray.exe 在同一目录下。",
            links: [
              {
                name: "v2rayN",
                href: "https://github.com/2dust/v2rayN/releases",
              },
              {
                name: "v2ray-core",
                href: "https://github.com/v2ray/v2ray-core/releases",
              },
            ],
          },
          {
            title: "启动应用",
            content:
              "打开 v2rayN.exe，从系统托盘区找到粉色图标，双击打开主界面。",
          },
          {
            title: "添加配置",
            content:
              "复制下面的内容到剪贴板。选择「服务器」，从菜单中选择「添加一个服务器」。点击最上方「导入配置文件」，选择「从剪贴板导入 URL」。点击确定，回到主界面。",
            fields: [
              {
                name: "URL",
                data:
                  "vmess://" +
                  Buffer.from(
                    JSON.stringify({
                      add: user.vmess.host,
                      aid: user.vmess.aid,
                      host: `${user.vmess.webSocket.path};${
                        user.vmess.webSocket.host
                      }`,
                      id: user.vmess.id,
                      net: user.vmess.network,
                      port: user.vmess.port,
                      ps: siteName,
                      tls: user.vmess.tls.status === "off" ? "" : "tls",
                      type:
                        user.vmess.network === "tcp"
                          ? user.vmess.tcp.header.type
                          : user.vmess.network === "kcp"
                          ? user.vmess.kcp.header.type
                          : "none",
                    })
                  ).toString("base64"),
              },
            ],
          },
          {
            title: "设置路由",
            content:
              "选择「参数设置」，切换到「路由设置」，打开「绕过大陆地址」和「绕过大陆 IP」。",
          },
          {
            title: "设置开机自启",
            content: "切换到「v2rayN 设置」，打开「开机自动启动」。",
          },
          {
            title: "启动代理",
            content:
              "点击确定，关闭主界面。右击托盘区图标，选择「启用系统代理」，「系统代理模式」选择「全局模式」。",
          },
        ],
      },
      {
        os: "macOS",
        descriptions: [
          {
            title: "下载应用",
            content: "下载 v2rayX。",
            links: [
              {
                name: "v2rayX",
                href: "https://github.com/Cenmrev/V2RayX/releases",
              },
            ],
          },
          {
            title: "启动应用",
            content: "打开应用，系统可能多次询问权限，请一律允许。",
          },
          {
            title: "基础设置",
            content:
              "从托盘区找到 V 形图标，点击打开菜单，选择「Configure」。勾选「Support UDP」。",
          },
          {
            title: "添加配置",
            content:
              "在「V2Ray Servers」处点击减号删除原有的服务器，点击加号添加新的服务器。对应填写：",
            fields: [
              { name: "Address", data: user.vmess.host },
              { name: "冒号后", data: user.vmess.port },
              { name: "User ID", data: user.vmess.id },
              { name: "alterId", data: user.vmess.aid },
              { name: "Security", data: "aes-128-gcm" },
              {
                name: "Network",
                data:
                  user.vmess.network === "ws"
                    ? "WebSocket"
                    : user.vmess.network,
              },
            ],
          },
          {
            title: "配置网络",
            content:
              user.vmess.network === "tcp"
                ? "打开「transport settings」，切换到「TCP」，对应填写："
                : user.vmess.network === "kcp"
                ? "打开「transport settings」，切换到「KCP」，对应填写："
                : user.vmess.network === "ws"
                ? "打开「transport settings」，切换到「WebSocket」，对应填写："
                : "",
            fields:
              user.vmess.network === "tcp"
                ? [
                    { name: "connection reuse", data: "勾选" },
                    { name: "path", data: user.vmess.webSocket.path },
                  ]
                : user.vmess.network === "kcp"
                ? [
                    {
                      name: "uplink capacity",
                      data: user.vmess.kcp.uplinkCapacity,
                    },
                    {
                      name: "downlink capacity",
                      data: user.vmess.kcp.downlinkCapacity,
                    },
                    {
                      name: "congestion",
                      data: user.vmess.kcp.congestion ? "true" : "false",
                    },
                    { name: "header type", data: user.vmess.kcp.header.type },
                  ]
                : user.vmess.network === "ws"
                ? [
                    { name: "connection reuse", data: "勾选" },
                    { name: "header type", data: user.vmess.tcp.header.type },
                  ]
                : [],
          },
          {
            title: "进一步配置网络",
            content:
              "切换到「Mux」，勾选「Enable」；" +
              (user.vmess.tls.status !== "off" &&
                (`切换到「TLS」，勾选「Use TLS」，「Server Name」填写 ${
                  user.vmess.tls.server
                }` + !user.vmess.tls.cert.trust &&
                  "，勾选「Allow insecure」")) +
              "；多次点击「OK」关闭主界面。",
          },
          {
            title: "启动代理",
            content:
              "从托盘区找到 V 形图标，点击打开菜单，选择「V2Ray Rules」，点击「Start V2Ray」。",
          },
        ],
      },
      {
        os: "其它",
        descriptions: [
          {
            title: "配置参数",
            content: "本服务是 v2ray VMess 服务，请按照如下参数自行配置：",
            links: [{ name: "了解详情", href: "https://www.v2ray.com/" }],
            fields: [
              { name: "服务器地址", data: user.vmess.host },
              { name: "端口", data: user.vmess.port },
              { name: "用户 ID", data: user.vmess.id },
              { name: "Alter ID", data: user.vmess.aid },
              {
                name: "连接信息",
                data:
                  (user.vmess.network === "ws"
                    ? "WebSocket"
                    : user.vmess.network) +
                  (user.vmess.network === "tcp"
                    ? `,Header Type=${user.vmess.tcp.header.type}`
                    : user.vmess.network === "kcp"
                    ? `,Upload=${user.vmess.kcp.uplinkCapacity},Download=${
                        user.vmess.kcp.downlinkCapacity
                      },Header Type=${user.vmess.kcp.header.type}`
                    : user.vmess.network === "ws"
                    ? `,Path=${user.vmess.webSocket.path},Host=${
                        user.vmess.webSocket.host
                      },Headers=${JSON.stringify(user.vmess.webSocket.headers)}`
                    : "") +
                  (user.vmess.tls.status !== "off" &&
                    `\n+TLS,Host=${user.vmess.tls.server},allowInsecure=${
                      user.vmess.tls.cert.trust ? "false" : "true"
                    }`),
              },
            ],
          },
        ],
      },
    ],
    ss: [
      {
        os: "Android",
        descriptions: [
          {
            title: "安装应用",
            content: "下载客户端并安装",
            links: [
              {
                name: "GitHub",
                href:
                  "https://github.com/shadowsocks/shadowsocks-android/releases",
              },
            ],
          },
          {
            title: "添加配置",
            content:
              "点击下面的按钮，按照系统提示用应用 Shadowsocks 打开，并按照应用提示确认添加。",
            links: [{ name: "Config", href: ssUri }],
          },
          {
            title: "设置路由",
            content:
              "点击新增的配置文件右侧编辑图标。在弹出的面板内，修改「配置名称」为自己喜欢的值。下拉找到「路由」，选择「绕过局域网及中国大陆地址」；打开「IPv6 路由」。点击右上角对号保存，回到主界面。",
          },
          {
            title: "启动代理",
            content:
              "首先点击刚刚建立的配置文件，其左侧条变为绿色；然后点击下方纸飞机，待最下方文本框变为绿色后即可开始使用网络。个别系统可能会询问权限，请一律允许。",
          },
          {
            title: "设置开机自启",
            content:
              "若网络没有问题，可点击主界面左上角图标打开菜单，选择「设置选项」并启用「自动连接」，代理将在开机且有网络时自动启动。",
          },
        ],
      },
      {
        os: "iOS",
        descriptions: [
          {
            title: "安装应用",
            content:
              "在非中国大陆区域的 App Store 里购买并安装应用「Shadowrocket」（约合人民币 18 元）。",
            links: [
              {
                name: "App Store",
                href:
                  "https://itunes.apple.com/us/app/shadowrocket/id932747118?mt=8",
              },
            ],
          },
          {
            title: "添加配置",
            content:
              "点击下面的按钮，按照系统提示用应用 Shadowrocket 打开，并按照应用提示确认添加。",
            links: [{ name: "Config", href: ssUri }],
          },
          {
            title: "启动代理",
            content:
              "在主界面点击「未连接」的开关，按照系统提示允许建立 VPN 连接。此后每次需要连接代理时，请手动打开应用连接。也可以在控制中心添加快捷开关。",
          },
        ],
      },
      {
        os: "Others",
        descriptions: [
          {
            title: "配置信息",
            content:
              "本服务是 shadowsocks 服务，请按照如下参数自行配置；如果你的客户端支持配置链接，也可以点击「配置」按钮，或者扫描下面的二维码：",
            links: [
              { name: "了解更多", href: "https://shadowsocks.org" },
              { name: "配置", href: ssUri },
            ],
            fields: [
              { name: "服务器地址", data: user.ss.host },
              { name: "端口", data: user.ss.port },
              { name: "密码", data: user.ss.password },
              { name: "加密方式", data: user.ss.port },
            ],
            qrcode: ssQr,
          },
        ],
      },
    ],
  };
};

export default getGuide;
