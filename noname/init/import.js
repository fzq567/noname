import { lib, game, _status } from "noname";

/**
 * 目录职责说明（Directory Responsibilities）
 *
 * 本文件负责加载游戏的四类模块，各目录职责严格区分如下：
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  目录          │  性质              │  说明                      │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  extension/    │  用户自定义扩展包  │  开发者自制扩展的唯一存放   │
 * │                │                    │  位置，每个子目录为一个     │
 * │                │                    │  独立扩展包，须包含         │
 * │                │                    │  extension.js 与 info.json  │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  character/    │  游戏核心武将数据  │  内置武将包，属于游戏主体   │
 * │                │                    │  的一部分，不是用户扩展目录 │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  card/         │  游戏核心卡牌数据  │  内置卡牌包，属于游戏主体   │
 * │                │                    │  的一部分，不是用户扩展目录 │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  mode/         │  游戏核心模式数据  │  内置游戏模式，属于游戏主体 │
 * │                │                    │  的一部分，不是用户扩展目录 │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 重要：普通开发者开发自定义扩展时，只应在 extension/ 目录下新建子目录，
 * 切勿直接修改 character/、card/、mode/ 等核心目录。
 */
/**
 * 加载内置卡牌包（核心模块）
 *
 * 从 card/ 目录加载游戏内置卡牌包。
 * 注意：card/ 是游戏核心数据目录，由官方维护，不是用户自定义扩展的存放位置。
 * 用户自定义扩展请使用 extension/ 目录。
 *
 * @param {string} name - 卡牌包名（对应 card/<name>.js）
 * @returns {Promise<void>}
 */
export async function importCardPack(name) {
	await importFunction("card", `/card/${name}`);
}

/**
 * 加载内置武将包（核心模块）
 *
 * 从 character/ 目录加载游戏内置武将包。
 * 注意：character/ 是游戏核心数据目录，由官方维护，不是用户自定义扩展的存放位置。
 * 用户自定义扩展请使用 extension/ 目录。
 *
 * @param {string} name - 武将包名（对应 character/<name>/ 或 character/<name>/index.js）
 * @returns {Promise<void>}
 */
export async function importCharacterPack(name) {
	const alreadyModernCharacterPack = lib.config.moderned_chracters || [];
	const path = alreadyModernCharacterPack.includes(name) ? `/character/${name}/index` : `/character/${name}`;
	await importFunction("character", path).catch(e => {
		console.error(`武将包《${name}》加载失败`, e);
// 		alert(`武将包《${name}》加载失败
// 错误信息: 
// ${e instanceof Error ? e.stack : String(e)}
// 如果您在扩展中使用了game.import创建武将包，可将以下代码删除: lib.config.all.characters.push('武将包名');`);
	});
}

/**
 * 加载用户自定义扩展包（用户扩展入口）
 *
 * 从 extension/ 目录加载用户自定义扩展包。
 * extension/ 是开发者创建自定义扩展的唯一标准目录，每个扩展包须满足：
 *   - 位于 extension/<name>/ 子目录下
 *   - 包含 extension.js（导出 type = "extension" 及默认扩展对象）
 *   - 包含 info.json（记录扩展名称、作者、版本等元信息）
 *
 * @param {string} name - 扩展包名（对应 extension/<name>/extension.js）
 * @returns {Promise<void>}
 */
export async function importExtension(name) {
	if (!game.hasExtension(name) && !lib.config.all.stockextension.includes(name)) {
		// @ts-expect-error ignore
		await game.import("extension", await createEmptyExtension(name));
		return;
	}
	await importFunction("extension", `/extension/${name}/extension`).catch(e => {
		console.error(`扩展《${name}》加载失败`, e);
		let close = confirm(`扩展《${name}》加载失败，是否关闭此扩展？错误信息: \n${e instanceof Error ? e.stack : String(e)}`);
		if (close) {
			game.saveConfig(`extension_${name}_enable`, false);
		}
	});
}

/**
 * 加载内置游戏模式（核心模块）
 *
 * 从 mode/ 目录加载游戏内置模式。
 * 注意：mode/ 是游戏核心数据目录，由官方维护，不是用户自定义扩展的存放位置。
 * 用户自定义扩展请使用 extension/ 目录。
 *
 * @param {string} name - 模式名（对应 mode/<name>.js 或 mode/<name>/index.js）
 * @returns {Promise<void>}
 */
export async function importMode(name) {
	if (lib.mode[name] && lib.mode[name].fromextension) {
		let loadModeMethod = lib.init["setMode_" + name];
		if (typeof loadModeMethod === "function") {
			await Promise.resolve(loadModeMethod());
			return;
		}
	}
	const alreadyModernMode = lib.config.moderned_modes || [];
	const path = alreadyModernMode.includes(name) ? `/mode/${name}/index` : `/mode/${name}`;
	await importFunction("mode", path);
}

/**
 * 生成导入
 *
 * @param { 'card' | 'character' | 'extension' | 'mode' } type
 * @param {string} path
 * @returns {Promise<void>}
 */
async function importFunction(type, path) {
	const modeContent = await import(/* @vite-ignore */ path + ".js").catch(async e => {
		if (window.isSecureContext) {
			try {
				return await import(/* @vite-ignore */ path + ".ts");
			} catch {
				throw e;
			}
		}
		throw e;
	});
	if (!modeContent.type) return;
	if (modeContent.type !== type) {
		throw new Error(`Loaded Content doesn't match "${type}" (received "${modeContent.type}").`);
	}
	// @ts-expect-error ignore
	await game.import(type, modeContent.default);
}

async function createEmptyExtension(name) {
	const extensionInfo = await lib.init.promises.json(`${lib.assetURL}extension/${name}/info.json`).then(
		info => info,
		() => {
			return {
				name,
				intro: `扩展<b>《${name}》</b>尚未开启，请开启后查看信息。（建议扩展添加info.json以在关闭时查看信息）`,
				author: "未知",
				diskURL: "",
				forumURL: "",
				version: "1.0.0",
			};
		}
	);
	return {
		name: extensionInfo.name,
		editable: false,
		arenaReady() {},
		content(config, pack) {},
		prepare() {},
		precontent() {},
		config: {},
		help: {},
		package: {
			nopack: true,
			intro: extensionInfo.intro ? extensionInfo.intro.replace("${assetURL}", lib.assetURL) : "",
			author: extensionInfo.author ?? "未知",
			diskURL: extensionInfo.diskURL ?? "",
			forumURL: extensionInfo.forumURL ?? "",
			version: extensionInfo.version ?? "1.0.0",
		},
		files: {
			character: [],
			card: [],
			skill: [],
			audio: [],
		},
	};
}
