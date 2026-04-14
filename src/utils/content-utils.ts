import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		// 首先按置顶状态排序，置顶文章在前
		if (a.data.pinned && !b.data.pinned) return -1;
		if (!a.data.pinned && b.data.pinned) return 1;

		// 如果置顶状态相同，则按发布日期排序
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}

function tokenizeTitle(title: string): Set<string> {
	const loweredTitle = title.toLowerCase();
	const tokens = new Set<string>();

	for (const token of loweredTitle.split(/[\s\p{P}]+/gu).filter(Boolean)) {
		tokens.add(token);
	}

	for (const char of loweredTitle.replace(/[\s\p{P}]+/gu, "")) {
		if (/[\u4e00-\u9fff]/u.test(char)) {
			tokens.add(char);
		}
	}

	return tokens;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 && b.size === 0) return 0;

	let intersection = 0;
	for (const item of a) {
		if (b.has(item)) intersection++;
	}

	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

export async function getRelatedPosts(
	currentPost: CollectionEntry<"posts">,
	maxCount = 5,
): Promise<PostForList[]> {
	const allPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const currentTags = new Set<string>(currentPost.data.tags || []);
	const currentTitleTokens = tokenizeTitle(currentPost.data.title);
	const currentCategory = currentPost.data.category || "";
	const now = Date.now();

	return allPosts
		.filter((post) => post.slug !== currentPost.slug && !post.data.password)
		.map((post) => {
			const postTags = new Set<string>(post.data.tags || []);
			const postTitleTokens = tokenizeTitle(post.data.title);
			const postCategory = post.data.category || "";
			const daysSincePublished =
				(now - new Date(post.data.published).getTime()) /
				(1000 * 60 * 60 * 24);

			const score =
				jaccardSimilarity(currentTags, postTags) * 100 +
				jaccardSimilarity(currentTitleTokens, postTitleTokens) * 100 +
				30 * Math.exp((-Math.LN2 * daysSincePublished) / 180) +
				(currentCategory &&
				postCategory &&
				currentCategory === postCategory
					? 10
					: 0);

			return {
				slug: post.slug,
				data: post.data,
				score,
			};
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, maxCount)
		.map(({ slug, data }) => ({ slug, data }));
}

export async function getRandomPosts(
	excludeSlugs: string[] = [],
	maxCount = 5,
): Promise<PostForList[]> {
	const allPosts = await getSortedPostsList();

	const candidates = allPosts.filter(
		(post) => !excludeSlugs.includes(post.slug) && !post.data.password,
	);

	const shuffled = [...candidates];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled.slice(0, maxCount);
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
