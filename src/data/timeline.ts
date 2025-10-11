// Timeline data configuration file
// Used to manage data for the timeline page

export interface TimelineItem {
	id: string;
	title: string;
	description: string;
	type: "education" | "work" | "project" | "achievement";
	startDate: string;
	endDate?: string; // If empty, it means current
	location?: string;
	organization?: string;
	position?: string;
	skills?: string[];
	achievements?: string[];
	links?: {
		name: string;
		url: string;
		type: "website" | "certificate" | "project" | "other";
	}[];
	icon?: string; // Iconify icon name
	color?: string;
	featured?: boolean;
}

export const timelineData: TimelineItem[] = [
	{
		id: "AppleVisionPro",
		title: "Apple Vision Pro",
		description:
			"第一时间将网易新闻适配到了VP上，并成为国内第一个登录VP平台的新闻应用",
		type: "project",
		startDate: "2024-03-01",
		endDate: "2024-08-01",
		skills: ["Vision Pro", "Swift", "SwiftUI"],
		achievements: [
			"团队第一次使用SwiftUI开发主要功能",
			"国内第一款登录VP平台的新闻应用",
			"或者苹果Vision Pro的应用编辑推荐",
		],
		links: [
			{
				name: "网易新闻VisionPro版本",
				url: "https://apps.apple.com/cn/app/%E7%BD%91%E6%98%93%E6%96%B0%E9%97%BBvision/id6476119709?platform=vision",
				type: "website",
			},
		],
		icon: "material-symbols:code",
		color: "#7C3AED",
		featured: true,
	},
	{
		id: "bee",
		title: "网易小蜜蜂",
		description: "一款致敬Small Red Book 的伟大应用",
		type: "project",
		startDate: "2024-09-01",
		skills: ["Objective-C", "Swift", "SwiftUI"],
		achievements: [
			"主要负责IAP 苹果内购相关开发",
			"ShareExtension 外部分享到端内开发，支持图片、视频、链接等多种类型",
			"负责日常功能开发迭代",
		],
		links: [
			{
				name: "网易小蜜蜂",
				url: "https://apps.apple.com/us/app/%E7%BD%91%E6%98%93%E5%B0%8F%E8%9C%9C%E8%9C%82/id6467381750",
				type: "website",
			},
		],
		icon: "material-symbols:code",
		color: "#DC2626",
		featured: true,
	},
	{
		id: "newsapp",
		title: "网易新闻",
		description: "一款有态度的新闻App",
		type: "project",
		startDate: "2013-07-05",
		skills: ["Objective-C", "Swift", "SwiftUI"],
		achievements: [
			"主要负责IAP 苹果内购相关开发(含VIP订阅)",
			"Siri相关",
			"Widget相关功能",
			"登录模块、用户信息模块",
			"文件上传模块",
			"负责日常功能开发迭代、发版提审等",
		],
		links: [
			{
				name: "网易新闻",
				url: "https://apps.apple.com/cn/app/%E7%BD%91%E6%98%93%E6%96%B0%E9%97%BB-%E5%A4%B4%E6%9D%A1%E6%96%B0%E9%97%BB%E8%A7%86%E9%A2%91%E8%B5%84%E8%AE%AF%E5%B9%B3%E5%8F%B0/id425349261",
				type: "website",
			},
		],
		icon: "material-symbols:code",
		color: "#059669",
		featured: true,
	},
	// {
	// 	id: "summer-internship-2024",
	// 	title: "Frontend Development Intern",
	// 	description:
	// 		"Summer internship at an internet company, participating in frontend development of web applications.",
	// 	type: "work",
	// 	startDate: "2024-07-01",
	// 	endDate: "2024-08-31",
	// 	location: "Beijing",
	// 	organization: "TechStart Internet Company",
	// 	position: "Frontend Development Intern",
	// 	skills: ["React", "JavaScript", "CSS3", "Git", "Figma"],
	// 	achievements: [
	// 		"Completed user interface component development",
	// 		"Learned team collaboration and code standards",
	// 		"Received outstanding internship performance certificate",
	// 	],
	// 	icon: "material-symbols:work",
	// 	color: "#DC2626",
	// 	featured: true,
	// },
	// {
	// 	id: "web-development-course",
	// 	title: "Completed Web Development Online Course",
	// 	description:
	// 		"Completed a full-stack web development online course, systematically learning frontend and backend development technologies.",
	// 	type: "achievement",
	// 	startDate: "2024-01-15",
	// 	endDate: "2024-05-30",
	// 	organization: "Mooc Website",
	// 	skills: ["HTML", "CSS", "JavaScript", "Node.js", "Express"],
	// 	achievements: [
	// 		"Received course completion certificate",
	// 		"Completed 5 practical projects",
	// 		"Mastered full-stack development fundamentals",
	// 	],
	// 	links: [
	// 		{
	// 			name: "Course Certificate",
	// 			url: "https://certificates.example.com/web-dev",
	// 			type: "certificate",
	// 		},
	// 	],
	// 	icon: "material-symbols:verified",
	// 	color: "#059669",
	// },
	// {
	// 	id: "student-management-system",
	// 	title: "Student Management System Course Project",
	// 	description:
	// 		"Final project for the database course, developed a complete student information management system.",
	// 	type: "project",
	// 	startDate: "2023-11-01",
	// 	endDate: "2023-12-15",
	// 	skills: ["Java", "MySQL", "Swing", "JDBC"],
	// 	achievements: [
	// 		"Received excellent course project grade",
	// 		"Implemented complete CRUD functionality",
	// 		"Learned database design and optimization",
	// 	],
	// 	icon: "material-symbols:database",
	// 	color: "#EA580C",
	// },
	{
		id: "netease",
		title: "网易传媒",
		description: "全是态度，没有感情",
		type: "work",
		startDate: "2016-7-06",
		location: "后厂村",
		organization: "Netease",
		skills: ["iOS"],
		achievements: [
			"网易足球队9号，进球如麻，从从容容",
			"iOS资深开发工程师，匆匆忙忙",
		],
		icon: "material-symbols:work",
		color: "#7C3AED",
	},
	{
		id: "dongbeidaxue",
		title: "东北大学",
		description: "大学阶段",
		type: "education",
		startDate: "2009-09-01",
		endDate: "2013-06-30",
		location: "沈阳",
		organization: "东北大学",
		achievements: ["顺利毕业！"],
		icon: "material-symbols:school",
		color: "#059669",
		skills: ["软件工程专业"],
	},
	{
		id: "zhongkeda",
		title: "中国科学技术大学",
		description: "研究生阶段",
		type: "education",
		startDate: "2013-09-01",
		endDate: "2016-06-30",
		location: "苏州独墅湖",
		organization: "中科大",
		achievements: ["顺利毕业！"],
		icon: "material-symbols:school",
		color: "#2563EB",
		skills: ["软件工程专业"],
	},
	{
		id: "first-programming-experience",
		title: "网易实习",
		location: "五道口",
		description:
			"一段难忘的实习经历，认识了很多未来的好朋友，学习到了很多开发技巧。",
		type: "work",
		startDate: "2014-07-05",
		endDate: "2015-04-30",
		skills: ["iOS实习"],
		achievements: ["初创网易新闻Apple Watch 项目", "参与网易新闻日常迭代开发"],
		icon: "material-symbols:code",
		color: "#7C3AED",
	},
];

// Get timeline statistics
export const getTimelineStats = () => {
	const total = timelineData.length;
	const byType = {
		education: timelineData.filter((item) => item.type === "education").length,
		work: timelineData.filter((item) => item.type === "work").length,
		project: timelineData.filter((item) => item.type === "project").length,
		achievement: timelineData.filter((item) => item.type === "achievement")
			.length,
	};

	return { total, byType };
};

// Get timeline items by type
export const getTimelineByType = (type?: string) => {
	if (!type || type === "all") {
		return timelineData.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
	}
	return timelineData
		.filter((item) => item.type === type)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get featured timeline items
export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get current ongoing items
export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

// Calculate total work experience
export const getTotalWorkExperience = () => {
	const workItems = timelineData.filter((item) => item.type === "work");
	let totalMonths = 0;

	workItems.forEach((item) => {
		const startDate = new Date(item.startDate);
		const endDate = item.endDate ? new Date(item.endDate) : new Date();
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
		totalMonths += diffMonths;
	});

	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
