
let 快速订阅访问入口 = ['auto'];
let addresses = [];
let addressesapi = [];

let addressesnotls = [];
let addressesnotlsapi = [];

let addressescsv = [];
let DLS = 7;
let remarkIndex = 1;//CSV备注所在列偏移量

let subConverter = 'subapi.fgfw.eu.org';
let subConfig = 'https://raw.githubusercontent.com/cmliu/ACM4SSR/main/Clash/config/ACM4SSR_Online_Full_MultiMode.ini';
let subProtocol = 'https';
let noTLS = 'false';
let link;
let 隧道版本作者 = 'ed';
let 获取代理IP = 'true';
let proxyIPs = [
	'proxyip.fxxk.dedyn.io',
];
let 匹配PROXYIP = [];
let socks5DataURL = '';
let BotToken = '';
let ChatID = '';
let 临时中转域名 = [];
let 临时中转域名接口 = '';
let EndPS = '';
let 协议类型 = 'VLESS';
let FileName = 'SUB-BestCFip';
let SUBUpdateTime = 1;
let total = 24;
let timestamp = 4102329600000;
const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[.*\]):?(\d+)?#?(.*)?$/;
let fakeUserID;
let fakeHostName;
let httpsPorts = ["2053", "2083", "2087", "2096", "8443"];
let 有效时间 = 7;
let 更新时间 = 3;
let MamaJustKilledAMan = ['wget','axios','go-resty','cf-workers-sub','mozilla','koipy','周润发公益订阅器','workervless2sub','telegram','twitter','python-requests','webrequesthelper','miaoko'];
let myforbiddenhost = ['cfxr.eu.org','o0w0o.qzz.io','3333r567.11890604.xyz','ekt.me','www.bing.com','lzj.pp.ua','lzjnb.shop'];
let proxyIPPool = [];
let socks5Data;
let alpn = 'h3';
let 网络备案 = `<a href="https://t.me/danfeng_chat" target="_blank" rel="noopener" class="tg-link">
Telegram交流群
</a>

<style>
.tg-link {
background: linear-gradient(90deg, #ff6b6b, #f7d794, #1dd1a1, #54a0ff, #5f27cd);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
font-weight: bold;
font-size: 20px;
text-decoration: none;
transition: text-shadow 0.3s ease, transform 0.3s ease;
}

.tg-link:hover {
text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 
			 0 0 20px rgba(255, 255, 255, 0.6);
transform: scale(1.05);
}
</style>`;//写你自己的维护者广告
let 额外ID = '0';
let 加密方式 = 'auto';
let 网站图标, 网站头像, 网站背景, xhttp = '';
async function 整理优选列表(api) {
	if (!api || api.length === 0) return [];

	let newapi = "";

	// 创建一个AbortController对象，用于控制fetch请求的取消
	const controller = new AbortController();

	const timeout = setTimeout(() => {
		controller.abort(); // 取消所有请求
	}, 2000); // 2秒后触发

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		// 对api数组进行遍历，对每个API地址发起fetch请求
		const responses = await Promise.allSettled(api.map(apiUrl => fetch(apiUrl, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'User-Agent': FileName + 'TG@danfeng_chat'
			},
			signal: controller.signal // 将AbortController的信号量添加到fetch请求中，以便于需要时可以取消请求
		}).then(response => response.ok ? response.text() : Promise.reject())));

		// 遍历所有响应
		for (const [index, response] of responses.entries()) {
			// 检查响应状态是否为'fulfilled'，即请求成功完成
			if (response.status === 'fulfilled') {
				// 获取响应的内容
				const content = await response.value;

				const lines = content.split(/\r?\n/);
				let 节点备注 = '';
				let 测速端口 = '443';

				if (lines[0].split(',').length > 3) {
					const idMatch = api[index].match(/id=([^&]*)/);
					if (idMatch) 节点备注 = idMatch[1];

					const portMatch = api[index].match(/port=([^&]*)/);
					if (portMatch) 测速端口 = portMatch[1];

					for (let i = 1; i < lines.length; i++) {
						const columns = lines[i].split(',')[0];
						if (columns) {
							newapi += `${columns}:${测速端口}${节点备注 ? `#${节点备注}` : ''}\n`;
							if (api[index].includes('proxyip=true')) proxyIPPool.push(`${columns}:${测速端口}`);
						}
					}
				} else {
					// 验证当前apiUrl是否带有'proxyip=true'
					if (api[index].includes('proxyip=true')) {
						// 如果URL带有'proxyip=true'，则将内容添加到proxyIPPool
						proxyIPPool = proxyIPPool.concat((await 整理(content)).map(item => {
							const baseItem = item.split('#')[0] || item;
							if (baseItem.includes(':')) {
								const port = baseItem.split(':')[1];
								if (!httpsPorts.includes(port)) {
									return baseItem;
								}
							} else {
								return `${baseItem}:443`;
							}
							return null; // 不符合条件时返回 null
						}).filter(Boolean)); // 过滤掉 null 值
					}
					// 将内容添加到newapi中
					newapi += content + '\n';
				}
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		// 无论成功或失败，最后都清除设置的超时定时器
		clearTimeout(timeout);
	}

	const newAddressesapi = await 整理(newapi);

	// 返回处理后的结果
	return newAddressesapi;
}

async function 整理测速结果(tls) {
	// 参数验证
	if (!tls) {
		console.error('TLS参数不能为空');
		return [];
	}

	// 检查CSV地址列表
	if (!Array.isArray(addressescsv) || addressescsv.length === 0) {
		console.warn('没有可用的CSV地址列表');
		return [];
	}

	// CSV解析函数
	function parseCSV(text) {
		return text
			.replace(/\r\n/g, '\n')   // 统一Windows换行
			.replace(/\r/g, '\n')	 // 处理老Mac换行
			.split('\n')			   // 按Unix/Linux风格分割
			.filter(line => line.trim() !== '')  // 移除空行
			.map(line => line.split(',').map(cell => cell.trim()));
	}


	// 把机场映射和计数器移到函数外，保持全局唯一
	const airportToRegion = {
		// 美国
		'LAX': 'US🌎美国', 'SJC': 'US🌎美国', 'JFK': 'US🌎美国', 'SFO': 'US🌎美国', 'SEA': 'US🌎美国',
		'ORD': 'US🌎美国', 'ATL': 'US🌎美国', 'IAD': 'US🌎美国', 'DFW': 'US🌎美国', 'PHX': 'US🌎美国',
		'PDX': 'US🌎美国', 'MIA': 'US🌎美国', 'BOS': 'US🌎美国', 'DEN': 'US🌎美国', 'LAS': 'US🌎美国',
	
		// 加拿大
		'YYZ': 'CA🌎加拿大', 'YVR': 'CA🌎加拿大', 'YUL': 'CA🌎加拿大', 'YYC': 'CA🌎加拿大',
	
		// 英国 / 欧洲
		'LHR': 'GB🌍英国', 'LGW': 'GB🌍英国', 'MAN': 'GB🌍英国', 'AMS': 'NL🌍荷兰',
		'CDG': 'FR🌍法国', 'ORY': 'FR🌍法国', 'FRA': 'DE🌍德国', 'MUC': 'DE🌍德国', 'TXL': 'DE🌍德国',
		'WAW': 'PL🌍波兰', 'VIE': 'AT🌍奥地利', 'CPH': 'DK🌍丹麦', 'ARN': 'SE🌍瑞典',
		'MAD': 'ES🌍西班牙', 'BCN': 'ES🌍西班牙', 'FCO': 'IT🌍意大利', 'MXP': 'IT🌍意大利',
	
		// 澳大利亚 / 新西兰
		'SYD': 'AU🌏澳大利亚', 'MEL': 'AU🌏澳大利亚', 'BNE': 'AU🌏澳大利亚', 'PER': 'AU🌏澳大利亚',
		'AKL': 'NZ🌏新西兰', 'WLG': 'NZ🌏新西兰',
	
		// 亚洲
		'HKG': 'HK🔒香港', 'TPE': 'TW🔒台湾', 'KHH': 'TW🔒台湾',
		'NRT': 'JP🌏日本', 'HND': 'JP🌏日本', 'KIX': 'JP🌏日本', 'FUK': 'JP🌏日本', 'CTS': 'JP🌏日本', 'OKA': 'JP🌏日本',
		'ICN': 'KR🌏韩国', 'GMP': 'KR🌏韩国',
		'SIN': 'SG🌏新加坡', 'KUL': 'MY🌏马来西亚', 'PEN': 'MY🌏马来西亚',
		'BKK': 'TH🌏泰国', 'DMK': 'TH🌏泰国', 'CGK': 'ID🌏印度尼西亚', 'DPS': 'ID🌏印度尼西亚',
		'MNL': 'PH🌏菲律宾', 'CEB': 'PH🌏菲律宾', 'SGN': 'VN🌏越南', 'HAN': 'VN🌏越南',
	
		// 中国大陆
		'PEK': 'CN🔒中国', 'PVG': 'CN🔒中国', 'SHA': 'CN🔒中国', 'CAN': 'CN🔒中国', 'SZX': 'CN🔒中国',
		'CTU': 'CN🔒中国', 'HGH': 'CN🔒中国', 'XMN': 'CN🔒中国',
	
		// 南亚 / 中东 / 非洲
		'DEL': 'IN🌏印度', 'BOM': 'IN🌏印度', 'MAA': 'IN🌏印度',
		'DXB': 'AE🛰️阿联酋', 'AUH': 'AE🛰️阿联酋',
		'ISB': 'PK🌏巴基斯坦', 'KHI': 'PK🌏巴基斯坦',
		'CMB': 'LK🌏斯里兰卡', 'KTM': 'NP🌏尼泊尔',
		'JNB': 'ZA🛰️南非', 'IST': 'TR🛰️土耳其',
	
		// 俄罗斯 / 中亚
		'SVO': 'RU🛰️俄罗斯', 'DME': 'RU🛰️俄罗斯', 'ALA': 'KZ🌏哈萨克斯坦', 'ULN': 'MN🌏蒙古', 'DAC': 'BD🌏孟加拉'
	};

// 连接符备选池（支持很多 CSV）
const connectorSymbols = ['✦', '⚡', '➤', '★', '✪', '⧫', '◇', '◉', '⬤', '✧', '⬟', '✶', '✷', '⬢', '❖', '🞛'];

// 为每个 CSV 初始化一个计数器对象
const perCsvRegionCounters = addressescsv.map(() => ({}));

// 生成编号的函数：传入tem（备注）、连接符、计数器
function getRegionWithNumber(tem, connector, regionCounters) {
	for (const code in airportToRegion) {
		if (tem.includes(code)) {
			const regionStr = airportToRegion[code];
			const match = regionStr.match(/^([A-Z]{2})/);
			if (!match) return regionStr;

			const regionCode = match[1];
			regionCounters[regionCode] = (regionCounters[regionCode] || 0) + 1;
			const seq = regionCounters[regionCode].toString().padStart(2, '0');

			return `${regionStr}${connector}${seq}`; // 如 HK🔒香港✪01
		}
	}
	return tem;
}

// 并行处理每个 CSV
const csvPromises = addressescsv.map(async (csvUrl, index) => {
	const regionCounters = perCsvRegionCounters[index]; // 独立计数器
	const connector = connectorSymbols[index % connectorSymbols.length]; // 循环使用连接符

	try {
		const response = await fetch(csvUrl);
		if (!response.ok) throw new Error(`HTTP错误 ${response.status}: ${response.statusText}`);

		const text = await response.text();
		const rows = parseCSV(text);
		const [header, ...dataRows] = rows;

		const tlsIndex = header.findIndex(col => col.toUpperCase() === 'TLS');
		if (tlsIndex === -1) throw new Error('CSV文件缺少TLS字段');

		return dataRows
			.filter(row => {
				const tlsValue = row[tlsIndex].toUpperCase();
				const speed = parseFloat(row[row.length - 1]);
				return tlsValue === tls.toUpperCase() && speed > DLS;
			})
			.map(row => {
				const ipAddress = row[0];
				const port = row[1];
				const tem = row[tlsIndex + remarkIndex];

				const dataCenter = getRegionWithNumber(tem, connector, regionCounters);
				const formattedAddress = `${ipAddress}:${port}#${dataCenter}`;

				// 处理代理IP池
				if (csvUrl.includes('proxyip=true') &&
					row[tlsIndex].toUpperCase() === 'TRUE' &&
					!httpsPorts.includes(port)) {
					proxyIPPool.push(`${ipAddress}:${port}`);
				}

				return formattedAddress;
			});
	} catch (error) {
		console.error(`处理CSV ${csvUrl} 时出错:`, error);
		return [];
	}
});

// 使用Promise.all并行处理并展平结果
const results = await Promise.all(csvPromises);
return results.flat();

}

async function 整理(内容) {
	// 将制表符、双引号、单引号和换行符都替换为逗号
	// 然后将连续的多个逗号替换为单个逗号
	var 替换后的内容 = 内容.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');

	// 删除开头和结尾的逗号（如果有的话）
	if (替换后的内容.charAt(0) == ',') 替换后的内容 = 替换后的内容.slice(1);
	if (替换后的内容.charAt(替换后的内容.length - 1) == ',') 替换后的内容 = 替换后的内容.slice(0, 替换后的内容.length - 1);

	// 使用逗号分割字符串，得到地址数组
	const 地址数组 = 替换后的内容.split(',');

	return 地址数组;
}

function countryCodeToFlagEmoji(countryCode) {
	if (!countryCode || countryCode.length !== 2) return '';
	// 将 A-Z 映射到区域码 🇦 (U+1F1E6) 到 🇿 (U+1F1FF)
	return countryCode
		.toUpperCase()
		.split('')
		.map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
		.join('');
}

async function sendMessage(type, ip, add_data = "") {
	if (!BotToken || !ChatID) return;

	try {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.ok) {
			const ipInfo = await response.json();
			const flagEmoji = countryCodeToFlagEmoji(ipInfo.countryCode);
			msg =
				`${type}\n` +
				`🌐 IP: ${ip}\n` +
				`${flagEmoji} 国家: ${ipInfo.country}\n` +
				`🏙️ 城市: ${ipInfo.city}\n` +
				`🏢 组织: ${ipInfo.org}\n` +
				`📶 ASN: ${ipInfo.as}\n` +
				add_data;
		} else {
			msg = `${type}\n🌐 IP: ${ip}\n${add_data}`;
		}

		const url = `https://api.telegram.org/bot${BotToken}/sendMessage?chat_id=${ChatID}&parse_mode=HTML&text=${encodeURIComponent(msg)}`;
		return fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	} catch (error) {
		console.error('Error sending message:', error);
	}
}


async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

function surge(content, url, path) {
	let 每行内容;
	if (content.includes('\r\n')) {
		每行内容 = content.split('\r\n');
	} else {
		每行内容 = content.split('\n');
	}

	let 输出内容 = "";
	for (let x of 每行内容) {
		if (x.includes('trojan')) {
			const host = x.split("sni=")[1].split(",")[0];
			const 备改内容 = `skip-cert-verify=true, tfo=false, udp-relay=false`;
			const 正确内容 = `skip-cert-verify=true, ws=true, ws-path=${path}, ws-headers=Host:"${host}", tfo=false, udp-relay=false`;
			输出内容 += x.replace(new RegExp(备改内容, 'g'), 正确内容).replace("[", "").replace("]", "") + '\n';
		} else {
			输出内容 += x + '\n';
		}
	}

	输出内容 = `#!MANAGED-CONFIG ${url.href} interval=86400 strict=false` + 输出内容.substring(输出内容.indexOf('\n'));
	return 输出内容;
}

function getRandomProxyByMatch(CC, socks5Data) {
	// 将匹配字符串转换为小写
	const lowerCaseMatch = CC.toLowerCase();

	// 过滤出所有以指定匹配字符串结尾的代理字符串
	let filteredProxies = socks5Data.filter(proxy => proxy.toLowerCase().endsWith(`#${lowerCaseMatch}`));

	// 如果没有匹配的代理，尝试匹配 "US"
	if (filteredProxies.length === 0) {
		filteredProxies = socks5Data.filter(proxy => proxy.toLowerCase().endsWith(`#us`));
	}

	// 如果还是没有匹配的代理，从整个代理列表中随机选择一个
	if (filteredProxies.length === 0) {
		return socks5Data[Math.floor(Math.random() * socks5Data.length)];
	}

	// 从匹配的代理中随机选择一个并返回
	const randomProxy = filteredProxies[Math.floor(Math.random() * filteredProxies.length)];
	return randomProxy;
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function revertFakeInfo(content, userID, hostName) {
	return content;
}

function generateFakeInfo(content, userID, hostName) {
		return content;
}

function generateRandomIP() {
	return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
}

const sanZiJing = [
	"人之初", "性本善", "性相近", "习相远", "苟不教", "性乃迁", "教之道", "贵以专",
	"昔孟母", "择邻处", "子不学", "断机杼", "窦燕山", "有义方", "教五子", "名俱扬",
	"养不教", "父之过", "教不严", "师之惰", "非所宜", "幼不学", "老何为", "玉不琢",
	"不成器", "人不学", "不知义", "为人子", "方少时", "亲师友", "习礼仪", "香九龄",
	"能温席", "孝于亲", "所当执", "融四岁", "能让梨", "弟于长", "宜先知", "首孝悌",
	"次见闻", "知某数", "识某文", "一而十", "十而百", "百而千", "千而万", "三才者",
	"天地人", "三光者", "日月星", "三纲者", "君臣义", "父子亲", "夫妇顺", "曰春夏",
	"曰秋冬", "此四时", "运不穷", "曰南北", "曰西东", "此四方", "应乎中", "曰水火",
	"木金土", "此五行", "本乎数", "十干者", "甲至癸", "十二支", "子至亥", "曰黄道",
	"曰赤道", "曰南极", "曰北极", "日行南", "月行北", "星辰旋", "周复始", "干支顺",
	"阴阳定", "昼夜分", "寒暑明", "人有初", "性有别", "教之勤", "成之捷", "父母恩",
	"重如山", "兄友弟", "恭且安", "夫妇义", "始于婚", "男女别", "定礼门", "长者先",
	"幼者后", "尊尊长", "顺为先", "晨必盥", "暮必洗", "衣冠整", "坐立正", "出必告",
	"反必面", "居有常", "业无变", "事虽小", "勿擅为", "苟擅为", "子道亏", "物虽小",
	"勿私藏", "苟私藏", "亲心伤", "亲所好", "力为具", "亲所恶", "谨为去", "身有伤",
	"贻亲忧", "德有伤", "贻亲羞", "亲爱我", "孝何难", "亲憎我", "孝方贤", "亲有过",
	"谏使更", "怡吾色", "柔吾声", "谏不入", "悦复谏", "号泣随", "挞无怨", "亲有疾",
	"药先尝", "昼夜侍", "不离床", "丧三年", "常悲咽", "居处变", "酒肉绝", "丧尽礼",
	"祭尽诚", "事死者", "如事生", "兄道友", "弟道恭", "兄弟睦", "孝在中", "财物轻",
	"怨何生", "言语忍", "忿自泯", "或饮食", "或坐走", "长呼人", "即代叫", "人不在",
	"己即到", "称尊长", "勿呼名", "对尊长", "勿见能", "路遇长", "疾趋揖", "长无言",
	"退恭立", "骑下马", "乘下车", "过犹待", "百步余", "长者立", "幼勿坐", "长者坐",
	"命乃坐", "尊长前", "声要低", "低不闻", "却非宜", "进必趋", "退必迟", "问起对",
	"视勿移", "事诸父", "如事父", "事诸兄", "如事兄", "朝起早", "夜眠迟", "老易至",
	"惜此时", "兼漱口", "便溺回", "辄净手", "冠必正", "纽必结", "袜与履", "俱紧切",
	"置冠服", "有定位", "勿乱顿", "致污秽", "对饮食", "勿拣择", "食适可", "勿过则",
	"年方少", "勿饮酒", "饮酒醉", "最为丑", "步从容", "立端正", "揖深圆", "拜恭敬",
	"勿践阈", "勿跛倚", "勿箝齿", "勿摇髀", "缓揭帘", "勿有声", "宽转弯", "勿触棱",
	"执虚器", "如执盈", "入虚室", "如有人", "事勿忙", "忙多错", "勿畏难", "勿轻略",
	"斗闹场", "绝勿近", "邪僻事", "绝勿问", "将入门", "问孰存", "将上堂", "声必扬",
	"人问谁", "对以名", "吾与我", "不分明", "用人物", "须明求", "善莫大", "恶莫作",
	"身虽残", "心不懈", "自立志", "方成功", "书不尽", "言不达", "惟勤学", "惟好问",
	"心日增", "力日著", "戒之哉", "宜勉学", "为学者", "必有志", "志不立", "不成学",
	"淫慢惰", "不足戒", "子不学", "非所宜", "幼不学", "老何为", "玉不琢", "不成器",
	"人不学", "不知义", "为人子", "方少时", "亲师友", "习礼仪"
  ];
  
  // 定义全局索引
let sanZiIndex = 0;

// addressid 依次取三字经
function getNextSanZiJing() {
	const id = sanZiJing[sanZiIndex];
	sanZiIndex = (sanZiIndex + 1) % sanZiJing.length; // 到末尾后从头开始
	return id;
}

/**
 * 根据请求 URL 返回 IP 列表
 * - 前三行原封不动输出
 * - 剩余部分按 ip:port 去重
 * - 随机抽取 30 个节点
 * - HK 3–8 个（随机）
 * - US ≥5，JP ≥2，SG ≥2，TW ≥2（先随机，不够再补）
 * - 重写备注，格式：国家⚡TG@danfeng_chat
 * - 国家顺序排序 CN→HK→JP→KR→SG→TW→US→其他
 * - ?numbers=all → 返回原数据，不做处理
 * @param {Request} request - Cloudflare Worker Request 对象
 * @param {string[]} allAddresses - 原始 IP 列表，每行 ip:port#备注
 * @returns {string[]} - 处理后的 IP 列表
 */
function getProcessedAddresses(request, allAddresses) {
	const url = new URL(request.url);
	const numbersParam = url.searchParams.get('numbers');
  
	// numbers=all 直接返回原数据
	if (numbersParam && numbersParam.toLowerCase() === 'all') {
	  return allAddresses;
	}
  
	// 前三行原样保留
	const header = allAddresses.slice(0, 3);
	const body = allAddresses.slice(3);
  
	// 按 ip:port 去重
	const uniqueMap = new Map();
	body.forEach(item => {
	  const [ipPort, remark = ''] = item.split('#');
	  if (!uniqueMap.has(ipPort)) {
		uniqueMap.set(ipPort, remark);
	  }
	});
	const unique = Array.from(uniqueMap, ([ipPort, remark]) => `${ipPort}#${remark}`);
  
	// 随机抽取 30 个（包含约束）
	const random30 = getRandomWithConstraints(unique, 30, 5, 2, 2, 2, 3, 8);
  
	// 保留原映射表，不动
	const mapping = [
	  { keywords: ['HK', '香港'], value: 'HK' },
	  { keywords: ['US', '美国', '美'], value: 'US' },
	  { keywords: ['JP', '日本'], value: 'JP' },
	  { keywords: ['KR', '韩国'], value: 'KR' },
	  { keywords: ['SG', '新加坡'], value: 'SG' },
	  { keywords: ['TW', '台湾'], value: 'TW' },
	  { keywords: ['CN', '中国'], value: 'CN' },
	  { keywords: ['GB', '英国'], value: 'GB' },
	  { keywords: ['DE', '德国'], value: 'DE' },
	  { keywords: ['FR', '法国'], value: 'FR' },
	  { keywords: ['CA', '加拿大'], value: 'CA' },
	  { keywords: ['AU', '澳大利亚'], value: 'AU' },
	  { keywords: ['NZ', '新西兰'], value: 'NZ' },
	  { keywords: ['RU', '俄罗斯'], value: 'RU' },
	  { keywords: ['IN', '印度'], value: 'IN' },
	  { keywords: ['TH', '泰国'], value: 'TH' },
	  { keywords: ['MY', '马来西亚'], value: 'MY' },
	  { keywords: ['VN', '越南'], value: 'VN' },
	  { keywords: ['ID', '印度尼西亚'], value: 'ID' },
	  { keywords: ['PH', '菲律宾'], value: 'PH' },
	  { keywords: ['NL', '荷兰'], value: 'NL' },
	  { keywords: ['SE', '瑞典'], value: 'SE' },
	  { keywords: ['CH', '瑞士'], value: 'CH' },
	  { keywords: ['ES', '西班牙'], value: 'ES' },
	  { keywords: ['IT', '意大利'], value: 'IT' },
	  { keywords: ['BE', '比利时'], value: 'BE' },
	  { keywords: ['FI', '芬兰'], value: 'FI' },
	  { keywords: ['NO', '挪威'], value: 'NO' },
	  { keywords: ['DK', '丹麦'], value: 'DK' },
	];
  
	const rewriteRemark = (remark) => {
	  const upper = remark.toUpperCase();
	  for (const rule of mapping) {
		if (rule.keywords.some(k => upper.includes(k.toUpperCase()))) {
		  return `${rule.value}⚡TG@danfeng_chat`;
		}
	  }
	  return `${remark}⚡TG@danfeng_chat`;
	};
  
	// 重写备注
	const rewritten = random30.map(item => {
	  const [ipPort, remark = ''] = item.split('#');
	  return `${ipPort}#${rewriteRemark(remark)}`;
	});
  
	// 国家顺序排序：CN → HK → JP → KR → SG → TW → US → 其他字母
	const countryOrder = ['CN', 'HK', 'JP', 'KR', 'SG', 'TW', 'US'];
	rewritten.sort((a, b) => {
	  const rA = a.split('#')[1].split('⚡')[0];
	  const rB = b.split('#')[1].split('⚡')[0];
	  const iA = countryOrder.indexOf(rA);
	  const iB = countryOrder.indexOf(rB);
	  if (iA !== -1 && iB !== -1) return iA - iB;
	  if (iA !== -1) return -1;
	  if (iB !== -1) return 1;
	  return rA.localeCompare(rB);
	});
  
	return header.concat(rewritten);
  }
  
  /**
   * 随机抽取函数
   * - US ≥ minUS，JP ≥ minJP，SG ≥ minSG，TW ≥ minTW
   * - HK 在 [minHK, maxHK] 之间
   */
  function getRandomWithConstraints(array, totalCount, minUS, minJP, minSG, minTW, minHK, maxHK) {
	const usNodes = array.filter(item => /#.*US/i.test(item));
	const hkNodes = array.filter(item => /#.*HK/i.test(item));
	const jpNodes = array.filter(item => /#.*JP/i.test(item));
	const sgNodes = array.filter(item => /#.*SG/i.test(item));
	const twNodes = array.filter(item => /#.*TW/i.test(item));
	const otherNodes = array.filter(item =>
	  !/#.*US/i.test(item) &&
	  !/#.*HK/i.test(item) &&
	  !/#.*JP/i.test(item) &&
	  !/#.*SG/i.test(item) &&
	  !/#.*TW/i.test(item)
	);
  
	// HK 3~8 个（随机）
	let hkMin = Math.min(hkNodes.length, minHK);
	let hkMax = Math.min(hkNodes.length, maxHK);
	let hkCount = hkMin > 0 ? hkMin + Math.floor(Math.random() * (hkMax - hkMin + 1)) : 0;
	const selectedHK = getRandomSubset(hkNodes, hkCount);
  
	// 随机抽剩余节点
	const remainingPool = shuffleArray([...usNodes, ...jpNodes, ...sgNodes, ...twNodes, ...otherNodes]);
	const remainingCount = totalCount - selectedHK.length;
	let selected = [...selectedHK, ...remainingPool.slice(0, remainingCount)];
  
	// 兜底逻辑：US/JP/SG/TW 不低于要求
	selected = ensureMin(selected, usNodes, 'US', minUS);
	selected = ensureMin(selected, jpNodes, 'JP', minJP);
	selected = ensureMin(selected, sgNodes, 'SG', minSG);
	selected = ensureMin(selected, twNodes, 'TW', minTW);
  
	// 超出总数，从“其他”里随机移除多余的
	if (selected.length > totalCount) {
	  const overflow = selected.length - totalCount;
	  const removable = selected.filter(x =>
		!/#.*US/i.test(x) &&
		!/#.*JP/i.test(x) &&
		!/#.*SG/i.test(x) &&
		!/#.*TW/i.test(x) &&
		!/#.*HK/i.test(x)
	  );
	  const toRemove = getRandomSubset(removable, overflow);
	  selected = selected.filter(x => !toRemove.includes(x));
	}
  
	return shuffleArray(selected);
  }
  
  // 保证某国至少 minCount
  function ensureMin(selected, pool, tag, minCount) {
	const currentCount = selected.filter(x => new RegExp(`#.*${tag}`, 'i').test(x)).length;
	if (currentCount >= minCount) return selected;
	const need = minCount - currentCount;
	const extra = getRandomSubset(pool.filter(x => !selected.includes(x)), need);
	return [...selected, ...extra];
  }
  
  // 基础随机抽取
  function getRandomSubset(array, count) {
	const shuffled = array.slice();
	for (let i = shuffled.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, count);
  }
  
  // 洗牌
  function shuffleArray(array) {
	const arr = array.slice();
	for (let i = arr.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
  }			

function isValidIPv4(address) {
	const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return ipv4Regex.test(address);
}

function 生成动态UUID(密钥) {
	const 时区偏移 = 8; // 北京时间相对于UTC的时区偏移+8小时
	const 起始日期 = new Date(2007, 6, 7, 更新时间, 0, 0); // 固定起始日期为2007年7月7日的凌晨3点
	const 一周的毫秒数 = 1000 * 60 * 60 * 24 * 有效时间;

	function 获取当前周数() {
		const 现在 = new Date();
		const 调整后的现在 = new Date(现在.getTime() + 时区偏移 * 60 * 60 * 1000);
		const 时间差 = Number(调整后的现在) - Number(起始日期);
		return Math.ceil(时间差 / 一周的毫秒数);
	}

	function 生成UUID(基础字符串) {
		const 哈希缓冲区 = new TextEncoder().encode(基础字符串);
		return crypto.subtle.digest('SHA-256', 哈希缓冲区).then((哈希) => {
			const 哈希数组 = Array.from(new Uint8Array(哈希));
			const 十六进制哈希 = 哈希数组.map(b => b.toString(16).padStart(2, '0')).join('');
			return `${十六进制哈希.substr(0, 8)}-${十六进制哈希.substr(8, 4)}-4${十六进制哈希.substr(13, 3)}-${(parseInt(十六进制哈希.substr(16, 2), 16) & 0x3f | 0x80).toString(16)}${十六进制哈希.substr(18, 2)}-${十六进制哈希.substr(20, 12)}`;
		});
	}

	const 当前周数 = 获取当前周数(); // 获取当前周数
	const 结束时间 = new Date(起始日期.getTime() + 当前周数 * 一周的毫秒数);

	// 生成两个 UUID
	const 当前UUIDPromise = 生成UUID(密钥 + 当前周数);
	const 上一个UUIDPromise = 生成UUID(密钥 + (当前周数 - 1));

	// 格式化到期时间
	const 到期时间UTC = new Date(结束时间.getTime() - 时区偏移 * 60 * 60 * 1000); // UTC时间
	const 到期时间字符串 = `到期时间(UTC): ${到期时间UTC.toISOString().slice(0, 19).replace('T', ' ')} (UTC+8): ${结束时间.toISOString().slice(0, 19).replace('T', ' ')}\n`;

	return Promise.all([当前UUIDPromise, 上一个UUIDPromise, 到期时间字符串]);
}

async function getLink(重新汇总所有链接) {
	let 节点LINK = [];
	let 订阅链接 = [];
	for (let x of 重新汇总所有链接) {
		if (x.toLowerCase().startsWith('http')) {
			订阅链接.push(x);
		} else {
			节点LINK.push(x);
		}
	}

	if (订阅链接 && 订阅链接.length !== 0) {
		function base64Decode(str) {
			const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
			const decoder = new TextDecoder('utf-8');
			return decoder.decode(bytes);
		}
		const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求

		const timeout = setTimeout(() => {
			controller.abort(); // 2秒后取消所有请求
		}, 2000);

		try {
			// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
			const responses = await Promise.allSettled(订阅链接.map(apiUrl => fetch(apiUrl, {
				method: 'get',
				headers: {
					'Accept': 'text/html,application/xhtml+xml,application/xml;',
					'User-Agent': 'v2rayN/' + FileName + 'TG@danfeng_chat'
				},
				signal: controller.signal // 将AbortController的信号量添加到fetch请求中
			}).then(response => response.ok ? response.text() : Promise.reject())));

			// 遍历所有响应
			const modifiedResponses = responses.map((response, index) => {
				// 检查是否请求成功
				return {
					status: response.status,
					value: response.status === 'fulfilled' ? response.value : null,
					apiUrl: 订阅链接[index] // 将原始的apiUrl添加到返回对象中
				};
			});

			console.log(modifiedResponses); // 输出修改后的响应数组

			for (const response of modifiedResponses) {
				// 检查响应状态是否为'fulfilled'
				if (response.status === 'fulfilled') {
					const content = await response.value || 'null'; // 获取响应的内容
					if (content.includes('://')) {
						const lines = content.includes('\r\n') ? content.split('\r\n') : content.split('\n');
						节点LINK = 节点LINK.concat(lines);
					} else {
						const 尝试base64解码内容 = base64Decode(content);
						if (尝试base64解码内容.includes('://')) {
							const lines = 尝试base64解码内容.includes('\r\n') ? 尝试base64解码内容.split('\r\n') : 尝试base64解码内容.split('\n');
							节点LINK = 节点LINK.concat(lines);
						}
					}
				}
			}
		} catch (error) {
			console.error(error); // 捕获并输出错误信息
		} finally {
			clearTimeout(timeout); // 清除定时器
		}
	}

	return 节点LINK;
}

function utf8ToBase64(str) {
	return btoa(unescape(encodeURIComponent(str)));
}

async function subHtml(request) {
	const url = new URL(request.url);
	const HTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
                  .input-group label {
                    color: gold;
                  }
                </style>
				<style>
				input::placeholder {
					font-family: "SimHei", "Microsoft YaHei", sans-serif;
					font-weight: normal;
					color: #555555; /* 你可以换成任何你喜欢的纯色 */
					letter-spacing: normal;
					text-shadow: none;
				  }
				  
				  /* Firefox */
				  input::-moz-placeholder {
					font-family: "SimHei", "Microsoft YaHei", sans-serif;
					font-weight: normal;
					color: #555555;
					letter-spacing: normal;
					text-shadow: none;
				  }
				  
				  /* IE */
				  input:-ms-input-placeholder {
					font-family: "SimHei", "Microsoft YaHei", sans-serif;
					font-weight: normal;
					color: #555555;
					letter-spacing: normal;
					text-shadow: none;
				  }			  
  </style>
				<style>
				.logo-title h1 {
					font-size: 36px;
					font-weight: 900;
					color: gold;
				  
					/* 立体浮雕效果 */
					text-shadow:
					  1px 1px 0 rgba(0,0,0,0.7),
					  2px 2px 2px rgba(0,0,0,0.5),
					  -1px -1px 0 rgba(255,255,255,0.8),
					  -2px -2px 2px rgba(255,255,255,0.6);
				  
					margin: 0;
					text-align: center; /* 或者 left/right 取决于你页面布局 */
					word-break: break-word; /* 避免长词撑破容器 */
					padding: 10px 0;
				  }
				  
				  /* 手机适配 */
				  @media (max-width: 768px) {
					.logo-title h1 {
					  font-size: 22px;        /* 缩小标题字体 */
					  padding: 8px 0;         /* 减少上下间距 */
					  text-shadow:
						1px 1px 1px rgba(0,0,0,0.4); /* 简化阴影以提高可读性 */
					}
				  }
                </style>
				<title>${FileName}</title>
				${网站图标}
				<style>
					:root {
						--primary-color: #4361ee;
						--hover-color: #3b4fd3;
						--bg-color: #f5f6fa;
						--card-bg: #ffffff;
					}
					
					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
					}
					
					body {
						${网站背景}
						background-size: cover;
						background-position: center;
						background-attachment: fixed;
						background-color: var(--bg-color);
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						line-height: 1.6;
						color: #333;
						min-height: 100vh;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					
					.container {
						position: relative;
						background: -webkit-linear-gradient(90deg, 
							rgba(0, 123, 255, 0.5), 
							rgba(123, 0, 255, 0.5), 
							rgba(255, 0, 150, 0.5));
						background: linear-gradient(90deg, 
							rgba(0, 123, 255, 0.5), 
							rgba(123, 0, 255, 0.5), 
							rgba(255, 0, 150, 0.5));
						background-clip: padding-box;
						backdrop-filter: blur(10px);
						-webkit-backdrop-filter: blur(10px);
						max-width: 600px;
						width: 90%;
						padding: 2rem;
						border-radius: 20px;
						box-shadow: 0 10px 20px rgba(0,0,0,0.05),
									inset 0 0 0 1px rgba(255, 255, 255, 0.15);
						transition: transform 0.25s ease;
					}
					
					.container:hover {
						transform: translateY(-5px);
						box-shadow: 0 15px 30px rgba(0,0,0,0.1),
									inset 0 0 0 1px rgba(255, 255, 255, 0.2);
					}					
					
					h1 {
						text-align: center;
						color: var(--primary-color);
						margin-bottom: 2rem;
						font-size: 1.8rem;
					}
					
					.input-group {
						margin-bottom: 1.5rem;
					}
					
					label {
						display: block;
						margin-bottom: 0.5rem;
						color: #555;
						font-weight: 500;
					}
					
					input {
						width: 100%;
						padding: 12px;
						/* 修改边框颜色从 #eee 到更深的颜色 */
						border: 2px solid rgba(0, 0, 0, 0.15);  /* 使用rgba实现更自然的深度 */
						border-radius: 10px;
						font-size: 1rem;
						transition: all 0.3s ease;
						/* 添加轻微的内阴影增强边框效果 */
						box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
					}

					input:focus {
						outline: none;
						border-color: var(--primary-color);
						/* 增强focus状态下的阴影效果 */
						box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15),
									inset 0 2px 4px rgba(0, 0, 0, 0.03);
					}
					
					button {
						width: 100%;
						padding: 12px;
						background: linear-gradient(90deg, #ff7e5f, #00f2c3, #feb47b); /* 紫青紫渐变 */
						color: white;
						border: none;
						border-radius: 10px;
						font-size: 1rem;
						font-weight: 600;
						cursor: pointer;
						transition: all 0.3s ease;
						margin-bottom: 1.5rem;
						background-size: 200% auto; /* 为 hover 动画准备 */
					}
					
					button:hover {
						background-position: right center; /* 渐变移动方向 */
						transform: translateY(-2px);
					}
					
					button:active {
						transform: translateY(0);
					}
					
					#result {
						background-color: #f8f9fa;
						font-family: monospace;
						word-break: break-all;
					}

					.github-corner svg {
						fill: var(--primary-color);
						color: var(--card-bg);
						position: absolute;
						top: 0;
						right: 0;
						border: 0;
						width: 80px;
						height: 80px;
					}

					.github-corner:hover .octo-arm {
						animation: octocat-wave 560ms ease-in-out;
					}

					@keyframes octocat-wave {
						0%, 100% { transform: rotate(0) }
						20%, 60% { transform: rotate(-25deg) }
						40%, 80% { transform: rotate(10deg) }
					}

					@keyframes rotate {
						from { transform: rotate(0deg); }
						to { transform: rotate(360deg); }
					}

					.logo-title {
						position: relative;
						display: flex;
						justify-content: center;
						align-items: center;
						margin-bottom: 2rem;
					}

					.logo-wrapper {
						position: absolute;
						left: 0;
						width: 50px;
						height: 50px;
					}

					.logo-title img {
						width: 100%;
						height: 100%;
						border-radius: 50%;
						position: relative;
						z-index: 1;
						background: var(--card-bg);
						box-shadow: 0 0 15px rgba(67, 97, 238, 0.1);
					}

					.logo-border {
						position: absolute;
						/* 扩大边框范围以确保完全覆盖 */
						top: -3px;
						left: -3px;
						right: -3px;
						bottom: -3px;
						border-radius: 50%;
						animation: rotate 3s linear infinite;
						background: conic-gradient(
							from 0deg,
							transparent 0%,
							var(--primary-color) 20%,
							rgba(67, 97, 238, 0.8) 40%,
							transparent 60%,
							transparent 100%
						);
						box-shadow: 0 0 10px rgba(67, 97, 238, 0.3);
						filter: blur(0.5px);
					}

					.logo-border::after {
						content: '';
						position: absolute;
						/* 调整内圆遮罩的大小 */
						inset: 3px;
						border-radius: 50%;
						background: var(--card-bg);
					}

					@keyframes rotate {
						from { transform: rotate(0deg); }
						to { transform: rotate(360deg); }
					}

					.logo-title h1 {
						margin-bottom: 0;
						text-align: center;
					}

					@media (max-width: 480px) {
						.container {
							padding: 1.5rem;
						}
						
						h1 {
							font-size: 1.5rem;
						}

						.github-corner:hover .octo-arm {
							animation: none;
						}
						.github-corner .octo-arm {
							animation: octocat-wave 560ms ease-in-out;
						}

						.logo-wrapper {
							width: 40px;
							height: 40px;
						}
					}

					.beian-info {
						text-align: center;
						font-size: 13px;
					}

					.beian-info a {
						color: var(--primary-color);
						text-decoration: none;
						border-bottom: 1px dashed var(--primary-color);
						padding-bottom: 2px;
					}

					.beian-info a:hover {
						border-bottom-style: solid;
					}

					#qrcode {
						display: flex;
						justify-content: center;
						align-items: center;
						margin-top: 20px;
					}

					.info-icon {
						display: inline-flex;
						align-items: center;
						justify-content: center;
						width: 18px;
						height: 18px;
						border-radius: 50%;
						background-color: var(--primary-color);
						color: white;
						font-size: 12px;
						margin-left: 8px;
						cursor: pointer;
						font-weight: bold;
						position: relative;   /* 添加相对定位 */
						top: -3px;            /* 微调垂直位置 */
					}

					.info-tooltip {
						display: none;
						position: fixed; /* 改为固定定位 */
						background: white;
						border: 1px solid var(--primary-color);
						border-radius: 8px;
						padding: 15px;
						z-index: 1000;
						box-shadow: 0 2px 10px rgba(0,0,0,0.1);
						min-width: 200px;
						max-width: 90vw;  /* 视窗宽度的90% */
						width: max-content;  /* 根据内容自适应宽度 */
						left: 50%;
						top: 50%;
						transform: translate(-50%, -50%); /* 居中定位 */
						margin: 0;
						line-height: 1.6;
						font-size: 13px;
						white-space: normal;
						word-wrap: break-word;
						overflow-wrap: break-word;
					}

					/* 移除原来的箭头 */
					.info-tooltip::before {
						display: none;
					}
				</style>
				<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
			</head>
			<body>
				<a href="https://github.com/cmliu/WorkerVless2sub" target="_blank" class="github-corner" aria-label="View source on Github">
					<svg viewBox="0 0 250 250" aria-hidden="true">
						<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
						<path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
						<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
					</svg>
				</a>
				<div class="container">
						<div class="logo-title">
							${网站头像}
							<h1>${FileName}</h1>
						</div>
					<div class="input-group">
						<label for="link">节点链接：</label>
						<input type="text" id="link" placeholder="请输入 VMess / VLESS / Trojan 链接">
					</div>
					
					<button onclick="generateLink()">生成优选订阅</button>
					
					<div class="input-group">
						<div style="display: flex; align-items: center;">
							<label for="result">优选订阅：</label>
							<div style="position: relative;">
								<span class="info-icon" onclick="toggleTooltip(event)">!</span>
								<div class="info-tooltip" id="infoTooltip">
									<strong>安全提示</strong>：使用优选订阅生成器时，需要您提交 <strong>节点配置信息</strong> 用于生成优选订阅链接。这意味着订阅器的维护者可能会获取到该节点信息。<strong>请自行斟酌使用风险。</strong><br>
									<br>
									订阅转换后端：<strong><a href='${subProtocol}://${subConverter}/version' target="_blank" rel="noopener noreferrer">${subProtocol}://${subConverter}</a></strong><br>
									订阅转换配置文件：<strong><a href='${subConfig}' target="_blank" rel="noopener noreferrer">${subConfig}</a></strong>
								</div>
							</div>
						</div>
						<input type="text" id="result" readonly onclick="copyToClipboard()">
						<label id="qrcode" style="margin: 15px 10px -15px 10px;"></label>
					</div>
					<div class="beian-info" style="text-align: center; font-size: 13px;">${网络备案}</div>
				</div>
	
				<script>
					function toggleTooltip(event) {
						event.stopPropagation(); // 阻止事件冒泡
						const tooltip = document.getElementById('infoTooltip');
						tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
					}
					
					// 点击页面其他区域关闭提示框
					document.addEventListener('click', function(event) {
						const tooltip = document.getElementById('infoTooltip');
						const infoIcon = document.querySelector('.info-icon');
						
						if (!tooltip.contains(event.target) && !infoIcon.contains(event.target)) {
							tooltip.style.display = 'none';
						}
					});

					function copyToClipboard() {
						const resultInput = document.getElementById('result');
						if (!resultInput.value) {
							return;
						}
						
						resultInput.select();
						navigator.clipboard.writeText(resultInput.value).then(() => {
							const tooltip = document.createElement('div');
							tooltip.style.position = 'fixed';
							tooltip.style.left = '50%';
							tooltip.style.top = '20px';
							tooltip.style.transform = 'translateX(-50%)';
							tooltip.style.padding = '8px 16px';
							tooltip.style.background = '#4361ee';
							tooltip.style.color = 'white';
							tooltip.style.borderRadius = '4px';
							tooltip.style.zIndex = '1000';
							tooltip.textContent = '已复制到剪贴板';
							
							document.body.appendChild(tooltip);
							
							setTimeout(() => {
								document.body.removeChild(tooltip);
							}, 2000);
						}).catch(err => {
							alert('复制失败，请手动复制');
						});
					}
	
					function generateLink() {
						const link = document.getElementById('link').value;
						if (!link) {
							alert('请输入节点链接');
							return;
						}
						
						let uuidType = 'uuid';
						const isTrojan = link.startsWith(\`\${atob('dHJvamFuOi8v')}\`);
						if (isTrojan) uuidType = 'password';
						let subLink = '';
						try {
							const isVMess = link.startsWith('vmess://');
							if (isVMess){
								const vmessLink = link.split('vmess://')[1];
								const vmessJson = JSON.parse(atob(vmessLink));
								
								const host = vmessJson.host;
								const uuid = vmessJson.id;
								const path = vmessJson.path || '/';
								const sni = vmessJson.sni || host;
								const type = vmessJson.type || 'none';
								const alpn = vmessJson.alpn || '';
								const alterId = vmessJson.aid || 0;
								const security = vmessJson.scy || 'auto';
								const domain = window.location.hostname;
								
								subLink = \`https://\${domain}/sub?host=\${host}&uuid=\${uuid}&path=\${encodeURIComponent(path)}&sni=\${sni}&type=\${type}&alpn=\${encodeURIComponent(alpn)}&alterid=\${alterId}&security=\${security}\`;
							} else {
								const uuid = link.split("//")[1].split("@")[0];
								const search = link.split("?")[1].split("#")[0];
								const domain = window.location.hostname;
								
								subLink = \`https://\${domain}/sub?\${uuidType}=\${uuid}&\${search}\`;
							}
							document.getElementById('result').value = subLink;
	
							// 更新二维码
							const qrcodeDiv = document.getElementById('qrcode');
							qrcodeDiv.innerHTML = '';
							new QRCode(qrcodeDiv, {
								text: subLink,
								width: 220, // 调整宽度
								height: 220, // 调整高度
								colorDark: "#4a60ea", // 二维码颜色
								colorLight: "#ffffff", // 背景颜色
								correctLevel: QRCode.CorrectLevel.L, // 设置纠错级别
								scale: 1 // 调整像素颗粒度
							});
						} catch (error) {
							alert('链接格式错误，请检查输入');
						}
					}
				</script>
			</body>
			</html>
			`;

	return new Response(HTML, {
		headers: {
			"content-type": "text/html;charset=UTF-8",
		},
	});
}

export default {
	async fetch(request, env) {
		if (env.TOKEN) 快速订阅访问入口 = await 整理(env.TOKEN);
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;
		socks5DataURL = env.SOCKS5DATA || socks5DataURL;
		if (env.CMPROXYIPS) 匹配PROXYIP = await 整理(env.CMPROXYIPS);;
		if (env.CFPORTS) httpsPorts = await 整理(env.CFPORTS);
		EndPS = env.PS || EndPS;
		网站图标 = env.ICO ? `<link rel="icon" sizes="32x32" href="${env.ICO}">` : '';
		网站头像 = env.PNG ? `<div class="logo-wrapper"><div class="logo-border"></div><img src="${env.PNG}" alt="Logo"></div>` : '';
		if (env.IMG) {
			const imgs = await 整理(env.IMG);
			网站背景 = `background-image: url('${imgs[Math.floor(Math.random() * imgs.length)]}');`;
		} else 网站背景 = '';
		网络备案 = env.BEIAN || env.BY || 网络备案;
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const format = url.searchParams.get('format') ? url.searchParams.get('format').toLowerCase() : "null";
		let host = "";
		let uuid = "";
		let path = "";
		let sni = "";
		let type = "ws";
		alpn = env.ALPN || alpn;
		let UD = Math.floor(((timestamp - Date.now()) / timestamp * 99 * 1099511627776) / 2);
		if (env.UA) MamaJustKilledAMan = MamaJustKilledAMan.concat(await 整理(env.UA));

		const currentDate = new Date();
		const fakeUserIDMD5 = await MD5MD5(Math.ceil(currentDate.getTime()));
		fakeUserID = fakeUserIDMD5.slice(0, 8) + "-" + fakeUserIDMD5.slice(8, 12) + "-" + fakeUserIDMD5.slice(12, 16) + "-" + fakeUserIDMD5.slice(16, 20) + "-" + fakeUserIDMD5.slice(20);
		fakeHostName = fakeUserIDMD5.slice(6, 9) + "." + fakeUserIDMD5.slice(13, 19) + ".xyz";

		total = total * 1099511627776;
		total = total * 4;
		let expire = Math.floor(timestamp / 1000);

		link = env.LINK || link;

		if (env.ADD) addresses = await 整理(env.ADD);
		if (env.ADDAPI) addressesapi = await 整理(env.ADDAPI);
		if (env.ADDNOTLS) addressesnotls = await 整理(env.ADDNOTLS);
		if (env.ADDNOTLSAPI) addressesnotlsapi = await 整理(env.ADDNOTLSAPI);
		function moveHttpUrls(sourceArray, targetArray) {
			if (!Array.isArray(sourceArray) || sourceArray.length === 0) return sourceArray || [];
			const httpRegex = /^https?:\/\//i;
			const httpUrls = sourceArray.filter(item => httpRegex.test(item));
			if (httpUrls.length > 0) {
				targetArray.push(...httpUrls);
				return sourceArray.filter(item => !httpRegex.test(item));
			}
			return sourceArray;
		}
		addresses = moveHttpUrls(addresses, addressesapi);
		addressesnotls = moveHttpUrls(addressesnotls, addressesnotlsapi);
		if (env.ADDCSV) addressescsv = await 整理(env.ADDCSV);
		DLS = Number(env.DLS) || DLS;
		remarkIndex = Number(env.CSVREMARK) || remarkIndex;

		if (socks5DataURL) {
			try {
				const response = await fetch(socks5DataURL);
				const socks5DataText = await response.text();
				if (socks5DataText.includes('\r\n')) {
					socks5Data = socks5DataText.split('\r\n').filter(line => line.trim() !== '');
				} else {
					socks5Data = socks5DataText.split('\n').filter(line => line.trim() !== '');
				}
			} catch {
				socks5Data = null;
			}
		}

		let 临时proxyIPs = [];
		if (env.PROXYIP) 临时proxyIPs = await 整理(env.PROXYIP);
		if (env.PROXYIPAPI) {
			const proxyIPsapi = await 整理(env.PROXYIPAPI);
			if (proxyIPsapi.length > 0) {
				const response = await fetch(proxyIPsapi[0]);
				if (response.ok) {
					const 响应内容 = await response.text();
					const 整理成数组 = await 整理(响应内容);
					if (整理成数组.length > 0) {
						临时proxyIPs = 临时proxyIPs.concat(整理成数组);	//追加到proxyIPs数组中
					}
				}
			}
		}
		//去重去除空元素
		临时proxyIPs = [...new Set(临时proxyIPs.filter(item => item && item.trim() !== ''))];
		if (临时proxyIPs.length > 0) proxyIPs = 临时proxyIPs;
		//console.log(proxyIPs);

		if (快速订阅访问入口.length > 0 && 快速订阅访问入口.some(token => url.pathname === `/${token}`)) {
			host = "null";
			if (env.HOST) {
				const hosts = await 整理(env.HOST);
				host = hosts[Math.floor(Math.random() * hosts.length)];
			}

			if (env.PASSWORD) {
				协议类型 = 'Trojan';
				uuid = env.PASSWORD
			} else {
				协议类型 = 'VLESS';
				if (env.KEY) {
					有效时间 = Number(env.TIME) || 有效时间;
					更新时间 = Number(env.UPTIME) || 更新时间;
					const userIDs = await 生成动态UUID(env.KEY);
					uuid = userIDs[0];
				} else {
					uuid = env.UUID || "null";
				}
			}
            path = env.PATH || "/?ed=2560";
			sni = env.SNI || host;
			type = env.TYPE || type;
			隧道版本作者 = env.ED || 隧道版本作者;
			获取代理IP = env.RPROXYIP || 'false';

			if (host == "null" || uuid == "null") {
				let 空字段;
				if (host == "null" && uuid == "null") 空字段 = "HOST/UUID";
				else if (host == "null") 空字段 = "HOST";
				else if (uuid == "null") 空字段 = "UUID";
				EndPS += ` 订阅器内置节点 ${空字段} 未设置！！！`;
			}

			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);
		} else if (MamaJustKilledAMan.some(keyword => userAgent.includes(keyword)) || myforbiddenhost.some(token => request.url.includes(token))) {
			
			host = "Mama.Just.Killed.A.Man";
			uuid = url.searchParams.get('uuid') || url.searchParams.get('password') || url.searchParams.get('pw');
			path = url.searchParams.get('path');
			sni = "Mama.Just.Killed.A.Man";
			type = url.searchParams.get('type') || type;
			const mode = url.searchParams.get('mode') || null;
			const extra = url.searchParams.get('extra') || null;
			xhttp = (mode ? `&mode=${mode}` : "") + (extra ? `&extra=${encodeURIComponent(extra)}` : "");
			alpn = url.searchParams.get('alpn') || (xhttp ? "h3%2Ch2" : alpn);
			隧道版本作者 = url.searchParams.get('edgetunnel') || url.searchParams.get('epeius') || 隧道版本作者;
			获取代理IP = url.searchParams.get('proxyip') || 'false';

			if (url.searchParams.has('alterid')) {
				协议类型 = 'VMess';
				额外ID = url.searchParams.get('alterid') || 额外ID;
				加密方式 = url.searchParams.get('security') || 加密方式;
			} else if (url.searchParams.has('edgetunnel') || url.searchParams.has('uuid')) {
				协议类型 = 'VLESS';
			} else if (url.searchParams.has('epeius') || url.searchParams.has('password') || url.searchParams.has('pw')) {
				协议类型 = 'Trojan';
			}

			if (!url.pathname.includes("/sub")) {
				const envKey = env.URL302 ? 'URL302' : (env.URL ? 'URL' : null);
				if (envKey) {
					const URLs = await 整理(env[envKey]);
					if (URLs.includes('nginx')) {
						return new Response(await nginx(), {
							headers: {
								'Content-Type': 'text/html; charset=UTF-8',
							},
						});
					}
					const URL = URLs[Math.floor(Math.random() * URLs.length)];
					return envKey === 'URL302' ? Response.redirect(URL, 302) : fetch(new Request(URL, request));
				}
				return await subHtml(request);
			}

			if (!host || !uuid) {
				const responseText = `
			缺少必填参数：host 和 uuid
			Missing required parameters: host and uuid
			پارامترهای ضروری وارد نشده: هاست و یوآی‌دی
			
			${url.origin}/sub?host=[your host]&uuid=[your uuid]&path=[your path]
			
			
			
			
			
			
				
				https://github.com/cmliu/workerVless2sub
				`;

				return new Response(responseText, {
					status: 202,
					headers: { 'content-type': 'text/plain; charset=utf-8' },
				});
			}

			if (!path || path.trim() === '') {
				path = '/?ed=2560';
			} else {
				// 如果第一个字符不是斜杠，则在前面添加一个斜杠
				path = (path[0] === '/') ? path : '/' + path;
			}
			await sendMessage(`❌异常订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);			  
		} else {
			host = url.searchParams.get('host');
			uuid = url.searchParams.get('uuid') || url.searchParams.get('password') || url.searchParams.get('pw');
			path = url.searchParams.get('path');
			sni = url.searchParams.get('sni') || host;
			type = url.searchParams.get('type') || type;
			const mode = url.searchParams.get('mode') || null;
			const extra = url.searchParams.get('extra') || null;
			xhttp = (mode ? `&mode=${mode}` : "") + (extra ? `&extra=${encodeURIComponent(extra)}` : "");
			alpn = url.searchParams.get('alpn') || (xhttp ? "h3%2Ch2" : alpn);
			隧道版本作者 = url.searchParams.get('edgetunnel') || url.searchParams.get('epeius') || 隧道版本作者;
			获取代理IP = url.searchParams.get('proxyip') || 'false';

			if (url.searchParams.has('alterid')) {
				协议类型 = 'VMess';
				额外ID = url.searchParams.get('alterid') || 额外ID;
				加密方式 = url.searchParams.get('security') || 加密方式;
			} else if (url.searchParams.has('edgetunnel') || url.searchParams.has('uuid')) {
				协议类型 = 'VLESS';
			} else if (url.searchParams.has('epeius') || url.searchParams.has('password') || url.searchParams.has('pw')) {
				协议类型 = 'Trojan';
			}

			if (!url.pathname.includes("/sub")) {
				const envKey = env.URL302 ? 'URL302' : (env.URL ? 'URL' : null);
				if (envKey) {
					const URLs = await 整理(env[envKey]);
					if (URLs.includes('nginx')) {
						return new Response(await nginx(), {
							headers: {
								'Content-Type': 'text/html; charset=UTF-8',
							},
						});
					}
					const URL = URLs[Math.floor(Math.random() * URLs.length)];
					return envKey === 'URL302' ? Response.redirect(URL, 302) : fetch(new Request(URL, request));
				}
				return await subHtml(request);
			}

			if (!host || !uuid) {
				const responseText = `
			缺少必填参数：host 和 uuid
			Missing required parameters: host and uuid
			پارامترهای ضروری وارد نشده: هاست و یوآی‌دی
			
			${url.origin}/sub?host=[your host]&uuid=[your uuid]&path=[your path]
			
			
			
			
			
			
				
				https://github.com/cmliu/workerVless2sub
				`;

				return new Response(responseText, {
					status: 202,
					headers: { 'content-type': 'text/plain; charset=utf-8' },
				});
			}

			if (!path || path.trim() === '') {
				path = '/?ed=2560';
			} else {
				// 如果第一个字符不是斜杠，则在前面添加一个斜杠
				path = (path[0] === '/') ? path : '/' + path;
			}
			await sendMessage(`✅获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);
		}

		// 构建订阅响应头对象
		const responseHeaders = {
			"content-type": "text/plain; charset=utf-8",
			"Profile-Update-Interval": `${SUBUpdateTime}`,
			"Profile-web-page-url": url.origin,
			"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`
		};

		if (host.toLowerCase().includes('notls') || host.toLowerCase().includes('worker') || host.toLowerCase().includes('trycloudflare')) noTLS = 'true';
		noTLS = env.NOTLS || noTLS;
		let subConverterUrl = generateFakeInfo(url.href, uuid, host);
		if (userAgent.includes('subconverter')) alpn = '';
		if ((MamaJustKilledAMan.length > 0 &&MamaJustKilledAMan.some(str => userAgent.includes(str))
		  ) ||
		  myforbiddenhost.some(token => request.url.includes(token))) {

			if (host.includes('workers.dev')) {
				if (临时中转域名接口) {
					try {
						const response = await fetch(临时中转域名接口);

						if (!response.ok) {
							console.error('获取地址时出错:', response.status, response.statusText);
							return; // 如果有错误，直接返回
						}

						const text = await response.text();
						const lines = text.split('\n');
						// 过滤掉空行或只包含空白字符的行
						const nonEmptyLines = lines.filter(line => line.trim() !== '');

						临时中转域名 = 临时中转域名.concat(nonEmptyLines);
					} catch (error) {
						console.error('获取地址时出错:', error);
					}
				}
				// 使用Set对象去重
				临时中转域名 = [...new Set(临时中转域名)];
			}

			const newAddressesapi = await 整理优选列表(addressesapi);
			const newAddressescsv = await 整理测速结果('TRUE');
			const uniqueAddresses = Array.from(new Set(addresses.concat(newAddressesapi, newAddressescsv).filter(item => item && item.trim())));

			let notlsresponseBody;
			if ((noTLS == 'true' && 协议类型 == 'VLESS') || 协议类型 == 'VMess') {
				const newAddressesnotlsapi = await 整理优选列表(addressesnotlsapi);
				const newAddressesnotlscsv = await 整理测速结果('FALSE');
				const uniqueAddressesnotls = Array.from(new Set(addressesnotls.concat(newAddressesnotlsapi, newAddressesnotlscsv).filter(item => item && item.trim())));

				notlsresponseBody = uniqueAddressesnotls.map(address => {
					let port = "-1";
					let addressid = address;

					const match = addressid.match(regex);
					if (!match) {
						if (address.includes(':') && address.includes('#')) {
							const parts = address.split(':');
							address = parts[0];
							const subParts = parts[1].split('#');
							port = subParts[0];
							addressid = subParts[1];
						} else if (address.includes(':')) {
							const parts = address.split(':');
							address = parts[0];
							port = parts[1];
						} else if (address.includes('#')) {
							const parts = address.split('#');
							address = parts[0];
							addressid = parts[1];
						}

						if (addressid.includes(':')) {
							addressid = addressid.split(':')[0];
						}
					} else {
						address = match[1];
						port = match[2] || port;
						addressid = match[3] || address;
					}

					const httpPorts = ["8080", "8880", "2052", "2082", "2086", "2095"];
					if (!isValidIPv4(address) && port == "-1") {
						for (let httpPort of httpPorts) {
							if (address.includes(httpPort)) {
								port = httpPort;
								break;
							}
						}
					}
					if (port == "-1") port = "80";
					//console.log(address, port, addressid);

					if (隧道版本作者.trim() === 'cmliu' && 获取代理IP.trim() === 'true') {
						// 将addressid转换为小写
						let lowerAddressid = addressid.toLowerCase();
						// 初始化找到的proxyIP为null
						let foundProxyIP = null;

						if (socks5Data) {
							const socks5 = getRandomProxyByMatch(lowerAddressid, socks5Data);
							path = `/${socks5}`;
						} else {
							// 遍历匹配PROXYIP数组查找匹配项
							for (let item of 匹配PROXYIP) {
								if (item.includes('#') && item.split('#')[1] && lowerAddressid.includes(item.split('#')[1].toLowerCase())) {
									foundProxyIP = item.split('#')[0];
									break; // 找到匹配项，跳出循环
								} else if (item.includes(':') && item.split(':')[1] && lowerAddressid.includes(item.split(':')[1].toLowerCase())) {
									foundProxyIP = item.split(':')[0];
									break; // 找到匹配项，跳出循环
								}
							}

							if (foundProxyIP) {
								// 如果找到匹配的proxyIP，赋值给path
								path = '/proxyip=' + foundProxyIP;
							} else {
								// 如果没有找到匹配项，随机选择一个proxyIP
								const randomProxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
								path = '/proxyip=' + randomProxyIP;
							}
						}
					}

					if (协议类型 == 'VMess') {
						const vmessLink = `vmess://${utf8ToBase64(`{"v":"2","ps":"${addressid + EndPS}","add":"${address}","port":"${port}","id":"${uuid}","aid":"${额外ID}","scy":"${加密方式}","net":"ws","type":"${type}","host":"${host}","path":"${path}","tls":"","sni":"","alpn":"${encodeURIComponent(alpn)}","fp":""}`)}`;
						return vmessLink;
					} else {
						const vlessLink = `vless://${uuid}@${address}:${port}?security=&type=${type}&host=${host}&path=${encodeURIComponent(path)}&encryption=none#${encodeURIComponent(addressid + EndPS)}`;
						return vlessLink;
					}

				}).join('\n');
			}
            //给黑名单订阅喂假数据
			//随机IP
			//随机端口
			//三字经备注
			const random30Addresses = getProcessedAddresses(request,uniqueAddresses);
			const responseBody = random30Addresses.map(address => {
				let port = "-1";
				let addressid = address;

				const match = addressid.match(regex);
				if (!match) {
					if (address.includes(':') && address.includes('#')) {
						const parts = address.split(':');
						address = generateRandomIP();
						const subParts = parts[1].split('#');
						port = (Math.floor(Math.random() * 65535) + 1).toString();
						addressid = getNextSanZiJing();
					} else if (address.includes(':')) {
						const parts = address.split(':');
						address = generateRandomIP();
						port = (Math.floor(Math.random() * 65535) + 1).toString();
					} else if (address.includes('#')) {
						const parts = address.split('#');
						address = generateRandomIP();
						addressid = getNextSanZiJing();
					}

					if (addressid.includes(':')) {
						addressid = getNextSanZiJing();
					}
				} else {
					address = generateRandomIP();
					port = (Math.floor(Math.random() * 65535) + 1).toString();
					addressid = getNextSanZiJing();
				}

				if (!isValidIPv4(address) && port == "-1") {
					for (let httpsPort of httpsPorts) {
						if (address.includes(httpsPort)) {
							port = httpsPort;
							break;
						}
					}
				}
				if (port == "-1") port = "443";

				//console.log(address, port, addressid);

				if (隧道版本作者.trim() === 'cmliu' && 获取代理IP.trim() === 'true') {
					// 将addressid转换为小写
					let lowerAddressid = addressid.toLowerCase();
					// 初始化找到的proxyIP为null
					let foundProxyIP = null;

					if (socks5Data) {
						const socks5 = getRandomProxyByMatch(lowerAddressid, socks5Data);
						path = `/${socks5}`;
					} else {
						// 遍历匹配PROXYIP数组查找匹配项
						for (let item of 匹配PROXYIP) {
							if (item.includes('#') && item.split('#')[1] && lowerAddressid.includes(item.split('#')[1].toLowerCase())) {
								foundProxyIP = item.split('#')[0];
								break; // 找到匹配项，跳出循环
							} else if (item.includes(':') && item.split(':')[1] && lowerAddressid.includes(item.split(':')[1].toLowerCase())) {
								foundProxyIP = item.split(':')[0];
								break; // 找到匹配项，跳出循环
							}
						}

						const matchingProxyIP = proxyIPPool.find(proxyIP => proxyIP.includes(address));
						if (matchingProxyIP) {
							path = '/proxyip=' + matchingProxyIP;
						} else if (foundProxyIP) {
							// 如果找到匹配的proxyIP，赋值给path
							path = '/proxyip=' + foundProxyIP;
						} else {
							// 如果没有找到匹配项，随机选择一个proxyIP
							const randomProxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
							path = '/proxyip=' + randomProxyIP;
						}
					}
				}

				let 伪装域名 = host;
				let 最终路径 = path;
				let 节点备注 = EndPS;
				if (临时中转域名.length > 0 && (host.includes('.workers.dev'))) {
					最终路径 = `/${host}${path}`;
					伪装域名 = 临时中转域名[Math.floor(Math.random() * 临时中转域名.length)];
					节点备注 = EndPS + '【中转域名】';
					sni = 伪装域名;
				}

				if (协议类型 == 'VMess') {
					const vmessLink = `vmess://${utf8ToBase64(`{"v":"2","ps":"${addressid + 节点备注}","add":"${address}","port":"${port}","id":"${uuid}","aid":"${额外ID}","scy":"${加密方式}","net":"ws","type":"${type}","host":"${伪装域名}","path":"${最终路径}","tls":"tls","sni":"${sni}","alpn":"${encodeURIComponent(alpn)}","fp":"","allowInsecure":"1","fragment":"1,40-60,30-50,tlshello"}`)}`;
					return vmessLink;
				} else if (协议类型 == 'Trojan') {
					const trojanLink = `trojan://${uuid}@${address}:${port}?security=tls&sni=${sni}&alpn=${encodeURIComponent(alpn)}&fp=randomized&type=${type}&host=${伪装域名}&path=${encodeURIComponent(最终路径)}&allowInsecure=1&fragment=${encodeURIComponent('1,40-60,30-50,tlshello')}#${encodeURIComponent(addressid + 节点备注)}`;
					return trojanLink;
				} else {
					const vlessLink = `vless://${uuid}@${address}:${port}?security=tls&sni=${sni}&alpn=${encodeURIComponent(alpn)}&fp=random&type=${type}&host=${伪装域名}&path=${encodeURIComponent(最终路径) + xhttp}&allowInsecure=1&fragment=${encodeURIComponent('1,40-60,30-50,tlshello')}&encryption=none#${encodeURIComponent(addressid + 节点备注)}`;
					return vlessLink;
				}

			}).join('\n');

			let combinedContent = responseBody; // 合并内容

			if (link) {
				const links = await 整理(link);
				const 整理节点LINK = (await getLink(links)).join('\n');
				combinedContent += '\n' + 整理节点LINK;
				console.log("link: " + 整理节点LINK)
			}

			if (notlsresponseBody && noTLS == 'true') {
				combinedContent += '\n' + notlsresponseBody;
				console.log("notlsresponseBody: " + notlsresponseBody);
			}

			if (协议类型 == 'Trojan' && (userAgent.includes('surge') || (format === 'surge' && !userAgent.includes('subconverter'))) && !userAgent.includes('cf-workers-sub')) {
				const trojanLinks = combinedContent.split('\n');
				const trojanLinksJ8 = generateFakeInfo(trojanLinks.join('|'), uuid, host);
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(trojanLinksJ8)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=true&fdn=false`;
			} else {
				let base64Response;
				try {
					base64Response = btoa(combinedContent); // 重新进行 Base64 编码
				} catch (e) {
					function encodeBase64(data) {
						const binary = new TextEncoder().encode(data);
						let base64 = '';
						const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

						for (let i = 0; i < binary.length; i += 3) {
							const byte1 = binary[i];
							const byte2 = binary[i + 1] || 0;
							const byte3 = binary[i + 2] || 0;

							base64 += chars[byte1 >> 2];
							base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
							base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
							base64 += chars[byte3 & 63];
						}

						const padding = 3 - (binary.length % 3 || 3);
						return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
					}
					base64Response = encodeBase64(combinedContent);
				}
				const response = new Response(base64Response, { headers: responseHeaders });
				return response;
			}
		} else if ((userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || (format === 'clash' && !userAgent.includes('subconverter'))) && !userAgent.includes('nekobox') && !userAgent.includes('cf-workers-sub')) {
			subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(subConverterUrl)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
		} else if ((userAgent.includes('sing-box') || userAgent.includes('singbox') || (format === 'singbox' && !userAgent.includes('subconverter'))) && !userAgent.includes('cf-workers-sub')) {
			if (协议类型 == 'VMess' && url.href.includes('path=')) {
				const 路径参数前部分 = url.href.split('path=')[0];
				const parts = url.href.split('path=')[1].split('&');
				const 路径参数后部分 = parts.slice(1).join('&') || '';
				const 待处理路径参数 = url.href.split('path=')[1].split('&')[0] || '';
				if (待处理路径参数.includes('%3F')) subConverterUrl = generateFakeInfo(路径参数前部分 + 'path=' + 待处理路径参数.split('%3F')[0] + '&' + 路径参数后部分, uuid, host);
			}
			subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(subConverterUrl)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
		} else {
			if (host.includes('workers.dev')) {
				if (临时中转域名接口) {
					try {
						const response = await fetch(临时中转域名接口);

						if (!response.ok) {
							console.error('获取地址时出错:', response.status, response.statusText);
							return; // 如果有错误，直接返回
						}

						const text = await response.text();
						const lines = text.split('\n');
						// 过滤掉空行或只包含空白字符的行
						const nonEmptyLines = lines.filter(line => line.trim() !== '');

						临时中转域名 = 临时中转域名.concat(nonEmptyLines);
					} catch (error) {
						console.error('获取地址时出错:', error);
					}
				}
				// 使用Set对象去重
				临时中转域名 = [...new Set(临时中转域名)];
			}

			const newAddressesapi = await 整理优选列表(addressesapi);
			const newAddressescsv = await 整理测速结果('TRUE');
			const uniqueAddresses = Array.from(new Set(addresses.concat(newAddressesapi, newAddressescsv).filter(item => item && item.trim())));

			let notlsresponseBody;
			if ((noTLS == 'true' && 协议类型 == 'VLESS') || 协议类型 == 'VMess') {
				const newAddressesnotlsapi = await 整理优选列表(addressesnotlsapi);
				const newAddressesnotlscsv = await 整理测速结果('FALSE');
				const uniqueAddressesnotls = Array.from(new Set(addressesnotls.concat(newAddressesnotlsapi, newAddressesnotlscsv).filter(item => item && item.trim())));

				notlsresponseBody = uniqueAddressesnotls.map(address => {
					let port = "-1";
					let addressid = address;

					const match = addressid.match(regex);
					if (!match) {
						if (address.includes(':') && address.includes('#')) {
							const parts = address.split(':');
							address = parts[0];
							const subParts = parts[1].split('#');
							port = subParts[0];
							addressid = subParts[1];
						} else if (address.includes(':')) {
							const parts = address.split(':');
							address = parts[0];
							port = parts[1];
						} else if (address.includes('#')) {
							const parts = address.split('#');
							address = parts[0];
							addressid = parts[1];
						}

						if (addressid.includes(':')) {
							addressid = addressid.split(':')[0];
						}
					} else {
						address = match[1];
						port = match[2] || port;
						addressid = match[3] || address;
					}

					const httpPorts = ["8080", "8880", "2052", "2082", "2086", "2095"];
					if (!isValidIPv4(address) && port == "-1") {
						for (let httpPort of httpPorts) {
							if (address.includes(httpPort)) {
								port = httpPort;
								break;
							}
						}
					}
					if (port == "-1") port = "80";
					//console.log(address, port, addressid);

					if (隧道版本作者.trim() === 'cmliu' && 获取代理IP.trim() === 'true') {
						// 将addressid转换为小写
						let lowerAddressid = addressid.toLowerCase();
						// 初始化找到的proxyIP为null
						let foundProxyIP = null;

						if (socks5Data) {
							const socks5 = getRandomProxyByMatch(lowerAddressid, socks5Data);
							path = `/${socks5}`;
						} else {
							// 遍历匹配PROXYIP数组查找匹配项
							for (let item of 匹配PROXYIP) {
								if (item.includes('#') && item.split('#')[1] && lowerAddressid.includes(item.split('#')[1].toLowerCase())) {
									foundProxyIP = item.split('#')[0];
									break; // 找到匹配项，跳出循环
								} else if (item.includes(':') && item.split(':')[1] && lowerAddressid.includes(item.split(':')[1].toLowerCase())) {
									foundProxyIP = item.split(':')[0];
									break; // 找到匹配项，跳出循环
								}
							}

							if (foundProxyIP) {
								// 如果找到匹配的proxyIP，赋值给path
								path = '/proxyip=' + foundProxyIP;
							} else {
								// 如果没有找到匹配项，随机选择一个proxyIP
								const randomProxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
								path = '/proxyip=' + randomProxyIP;
							}
						}
					}

					if (协议类型 == 'VMess') {
						const vmessLink = `vmess://${utf8ToBase64(`{"v":"2","ps":"${addressid + EndPS}","add":"${address}","port":"${port}","id":"${uuid}","aid":"${额外ID}","scy":"${加密方式}","net":"ws","type":"${type}","host":"${host}","path":"${path}","tls":"","sni":"","alpn":"${encodeURIComponent(alpn)}","fp":""}`)}`;
						return vmessLink;
					} else {
						const vlessLink = `vless://${uuid}@${address}:${port}?security=&type=${type}&host=${host}&path=${encodeURIComponent(path)}&encryption=none#${encodeURIComponent(addressid + EndPS)}`;
						return vlessLink;
					}

				}).join('\n');
			}
			const random30Addresses = getProcessedAddresses(request,uniqueAddresses);
			const responseBody = random30Addresses.map(address => {
				let port = "-1";
				let addressid = address;

				const match = addressid.match(regex);
				if (!match) {
					if (address.includes(':') && address.includes('#')) {
						const parts = address.split(':');
						address = parts[0];
						const subParts = parts[1].split('#');
						port = subParts[0];
						addressid = subParts[1];
					} else if (address.includes(':')) {
						const parts = address.split(':');
						address = parts[0];
						port = parts[1];
					} else if (address.includes('#')) {
						const parts = address.split('#');
						address = parts[0];
						addressid = parts[1];
					}

					if (addressid.includes(':')) {
						addressid = addressid.split(':')[0];
					}
				} else {
					address = match[1];
					port = match[2] || port;
					addressid = match[3] || address;
				}

				if (!isValidIPv4(address) && port == "-1") {
					for (let httpsPort of httpsPorts) {
						if (address.includes(httpsPort)) {
							port = httpsPort;
							break;
						}
					}
				}
				if (port == "-1") port = "443";

				//console.log(address, port, addressid);

				if (隧道版本作者.trim() === 'cmliu' && 获取代理IP.trim() === 'true') {
					// 将addressid转换为小写
					let lowerAddressid = addressid.toLowerCase();
					// 初始化找到的proxyIP为null
					let foundProxyIP = null;

					if (socks5Data) {
						const socks5 = getRandomProxyByMatch(lowerAddressid, socks5Data);
						path = `/${socks5}`;
					} else {
						// 遍历匹配PROXYIP数组查找匹配项
						for (let item of 匹配PROXYIP) {
							if (item.includes('#') && item.split('#')[1] && lowerAddressid.includes(item.split('#')[1].toLowerCase())) {
								foundProxyIP = item.split('#')[0];
								break; // 找到匹配项，跳出循环
							} else if (item.includes(':') && item.split(':')[1] && lowerAddressid.includes(item.split(':')[1].toLowerCase())) {
								foundProxyIP = item.split(':')[0];
								break; // 找到匹配项，跳出循环
							}
						}

						const matchingProxyIP = proxyIPPool.find(proxyIP => proxyIP.includes(address));
						if (matchingProxyIP) {
							path = '/proxyip=' + matchingProxyIP;
						} else if (foundProxyIP) {
							// 如果找到匹配的proxyIP，赋值给path
							path = '/proxyip=' + foundProxyIP;
						} else {
							// 如果没有找到匹配项，随机选择一个proxyIP
							const randomProxyIP = proxyIPs[Math.floor(Math.random() * proxyIPs.length)];
							path = '/proxyip=' + randomProxyIP;
						}
					}
				}

				let 伪装域名 = host;
				let 最终路径 = path;
				let 节点备注 = EndPS;
				if (临时中转域名.length > 0 && (host.includes('.workers.dev'))) {
					最终路径 = `/${host}${path}`;
					伪装域名 = 临时中转域名[Math.floor(Math.random() * 临时中转域名.length)];
					节点备注 = EndPS + '【中转域名】';
					sni = 伪装域名;
				}

				if (协议类型 == 'VMess') {
					const vmessLink = `vmess://${utf8ToBase64(`{"v":"2","ps":"${addressid + 节点备注}","add":"${address}","port":"${port}","id":"${uuid}","aid":"${额外ID}","scy":"${加密方式}","net":"ws","type":"${type}","host":"${伪装域名}","path":"${最终路径}","tls":"tls","sni":"${sni}","alpn":"${encodeURIComponent(alpn)}","fp":"","allowInsecure":"1","fragment":"1,40-60,30-50,tlshello"}`)}`;
					return vmessLink;
				} else if (协议类型 == 'Trojan') {
					const trojanLink = `trojan://${uuid}@${address}:${port}?security=tls&sni=${sni}&alpn=${encodeURIComponent(alpn)}&fp=randomized&type=${type}&host=${伪装域名}&path=${encodeURIComponent(最终路径)}&allowInsecure=1&fragment=${encodeURIComponent('1,40-60,30-50,tlshello')}#${encodeURIComponent(addressid + 节点备注)}`;
					return trojanLink;
				} else {
					const vlessLink = `vless://${uuid}@${address}:${port}?security=tls&sni=${sni}&alpn=${encodeURIComponent(alpn)}&fp=random&type=${type}&host=${伪装域名}&path=${encodeURIComponent(最终路径) + xhttp}&allowInsecure=1&fragment=${encodeURIComponent('1,40-60,30-50,tlshello')}&encryption=none#${encodeURIComponent(addressid + 节点备注)}`;
					return vlessLink;
				}

			}).join('\n');

			let combinedContent = responseBody; // 合并内容

			if (link) {
				const links = await 整理(link);
				const 整理节点LINK = (await getLink(links)).join('\n');
				combinedContent += '\n' + 整理节点LINK;
				console.log("link: " + 整理节点LINK)
			}

			if (notlsresponseBody && noTLS == 'true') {
				combinedContent += '\n' + notlsresponseBody;
				console.log("notlsresponseBody: " + notlsresponseBody);
			}

			if (协议类型 == 'Trojan' && (userAgent.includes('surge') || (format === 'surge' && !userAgent.includes('subconverter'))) && !userAgent.includes('cf-workers-sub')) {
				const trojanLinks = combinedContent.split('\n');
				const trojanLinksJ8 = generateFakeInfo(trojanLinks.join('|'), uuid, host);
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(trojanLinksJ8)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=true&fdn=false`;
			} else {
				let base64Response;
				try {
					base64Response = btoa(combinedContent); // 重新进行 Base64 编码
				} catch (e) {
					function encodeBase64(data) {
						const binary = new TextEncoder().encode(data);
						let base64 = '';
						const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

						for (let i = 0; i < binary.length; i += 3) {
							const byte1 = binary[i];
							const byte2 = binary[i + 1] || 0;
							const byte3 = binary[i + 2] || 0;

							base64 += chars[byte1 >> 2];
							base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
							base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
							base64 += chars[byte3 & 63];
						}

						const padding = 3 - (binary.length % 3 || 3);
						return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
					}
					base64Response = encodeBase64(combinedContent);
				}
				const response = new Response(base64Response, { headers: responseHeaders });
				return response;
			}
		}

		try {
			const subConverterResponse = await fetch(subConverterUrl);

			if (!subConverterResponse.ok) {
				throw new Error(`Error fetching subConverterUrl: ${subConverterResponse.status} ${subConverterResponse.statusText}`);
			}

			let subConverterContent = await subConverterResponse.text();

			if (协议类型 == 'Trojan' && (userAgent.includes('surge') || (format === 'surge' && !userAgent.includes('subconverter'))) && !userAgent.includes('cf-workers-sub')) {
				subConverterContent = surge(subConverterContent, url, path);
			}
			subConverterContent = revertFakeInfo(subConverterContent, uuid, host);
			if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
			return new Response(subConverterContent, { headers: responseHeaders });
		} catch (error) {
			return new Response(`Error: ${error.message}`, {
				status: 500,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		}
	}
};
